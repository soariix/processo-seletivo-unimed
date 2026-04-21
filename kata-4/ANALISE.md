# Análise de Engenharia de Dados (Kata 4)

Neste documento respondo estrategicamente às perguntas e decisões tomadas no Pipeline de Transformação em Python.

## 1. Principais Decisões de Tratamento
Fui de encontro com as armadilhas propostas, adotando as seguintes soluções:
* **Registros Órfãos:** Fiz um *Left Join* (`pd.merge(how='left')`) tendo o DataFrame de `pedidos.csv` como base (tabela Fato) e a tabela de `entregas.csv` como tabela Dimensão. Qualquer ID de entrega que não exista fisicamente na tabela de pedidos é ignorado e descartado instantaneamente do consolidado, preservando a integridade referencial do fluxo Fato.
* **Cidades inconsistentes:** Desenvolvi uma função `normalize_text` que tira os acentos utilizando a biblioteca nativa `unicodedata`, corta espaços vazios nas extremidades (`strip`) e joga todas as strings para o formato em maiúsculo (`UPPER`). Assim "São Paulo", "sao paulo" viraram uniformemente `"SAO PAULO"`.
* **Datas Mistas (Unix, etc):** Implementei uma função parser robusta que primeiro verifica se o campo de data tem formato inteiramente numérico (via método isnumérico nativo). Se sim, converto o dado para data usando Timestamp EPOCH (`unit='s'`). Para todo o resto das confusões híbridas, passo a responsabilidade de *mix interpretation* baseada na flexibilidade da lib Pandas (`format='mixed'`) fixando dia inicialmente.
* **Valores monetários com vírgulas e aspas mal formatadas:** Uma substituição em cadeia (`str.replace('"','').str.replace(',', '.')`) resolve garantindo que a tipagem final seja `float`.

## 2. O Pipeline é Idempotente?
**Sim, o script é totalmente Idempotente.** 
Em Data Engineering, idempotência significa que rodar uma função várias vezes nos mesmos *files* gerará exatamente a mesma versão cruzada e tratada de saída, não importando a variação repetitiva.
O pipeline não possui side-effects; ele não insere linhas num banco já com lixo anterior ou apaga os CSVs de origem. Ele lê 3 arquivos imutáveis, gera um DataFrame Virtual em memória ram, recalcula sempre as mesmíssimas médias e reescreve atômica e integralmente o arquivo output `relatorio_consolidado.csv`, descartando o velho.

## 3. Escalabilidade Extrema (10 milhões de Linhas / Dia)
O poder do ecossistema Pandas funciona tranquilamente se alocamos os dados diretamente na memória RAM disponível. Entretanto, para **10 milhões de linhas diárias (aprox. arquivos GBytes)** a estratégia baseada em Pandas colapsa com Memory Errors OOM (Out of Memory).
**Mudanças arquiteturais com 10M+:**
1. Eu substituiria a lib `pandas` pelo **Apache PySpark (Distributed)**, **Polars (Core rust lazy engine)**, ou continuaria utilizando pandas mas com processo iterativo em chunks de buffer (`pd.read_csv("data.csv", chunksize=100000)` processando balde-a-balde).
2. Arquivos não viriam num CSV de 10 milhões cru, mas seriam particionados em um Data Lake (`.parquet` formatação colunar e compactada usando compressão snappy) por dia.
3. Este script estaria plugado como uma task dentro de Orquestradores agendados de mercado, como **Apache Airflow** na AWS/Azure/GCP.

## 4. Garantia de Qualidade com Testes do Pipeline
Criando dados, os bugs se multiplicam nos corner cases. Eu aplicaria a pirâmide de testes de Dados:
* **Validação de Schema (Contract Testing):** Usando a biblioteca **Pandera** ou **Great Expectations**, os dados teriam validadores declarativos tipo *"Tabela_Output: Coluna 'valor_total' NÃO PODE CONTER nulos"* e *"Coluna Atraso_dias DEVE SER do tipo inteiro/NaN"*. O Pipeline é quebrado e o engenheiro é notificado em caso de quebra de contrato.
* **Unit Tests (TDD):** Usar o `pytest` injetando pequenos *mocked dataframes* na minha função isolada de mescla para ver se um cálculo negativo de Atraso não reverte num resultado maluco; se o parser de Timestamps entende dia 30 de fevereiro e acusa Invalid Date (Nat).