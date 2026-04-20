# Análise de Algoritmos - Fila de Triagem (Kata 1)

Neste documento detalho as decisões arquiteturais e algorítmicas tomadas na solução deste Kata.

## 1. Escolha da Estrutura de Dados

Optei por armazenar a fila inicial em uma **Lista dinâmica (`list` no Python)** e utilizar a função nativa `sorted()` (implementação do *Timsort*).
O processamento da "calculadora de urgência" ocorre dinamicamente através de uma *property* lazily computed e repassada na chave da ordenação (tupla `(Urgência_Calculada_Descendente, Tempo_Crescente)`).

**Por que não uma Fila de Prioridade Clássica (`heapq`)?**
Em filas de triagem hospitalar, pacientes continuam chegando. Se o problema se referir a uma estrutura em memória em tempo-real (streaming), a inserção O(log N) em um Max-Heap é a escolha padrão. 
Entretanto, o problema pediu uma função que recebesse uma lista pronta e retornasse a lista ordenada. Para "batch ordering", classificar a lista inteira O(N log N) é o código mais idiomático e seguro contra *Out-Of-Memory* (Timsort sendo inplace para listas que não sofrem merge pesado).

## 2. Complexidade de Tempo e Escalabilidade (1 Milhão de Pacientes)

* **Complexidade atual:** `O(N log N)` no pior tempo, onde `N` é o tamanho da lista, já que a regra determina N modificadores numéricos simples `O(1)` seguidos de um *sort*.
* **E se a lista tivesse 1 milhão de pacientes?**
  * O Timsort seguraria muito bem devido aos dados parcialmente ordenados (FIFO é natural em chegadas continuas). Mas para `N` gigante e um número reduzido de *níveis de prioridade* (temos apenas 4 níveis: CRITICA, ALTA, MEDIA, BAIXA), eu **refatoraria** para o algoritmo **Bucket Sort (ou Radix baseado nos níveis de urgência)**.
  * Na arquitetura de Bucket Sort, criamos 4 listas vazias, iteramos pelos 1 milhão de pacientes calculando sua complexidade real (`O(N)`) e dando `.append()` no "balde" correspondente. Isso seria rápido e consumiria tempo **O(N)**. Para cada balde, ordenar por FIFO no fim seria `O(M log M)` (onde `M` é pequeno se a fila chegou em ordem desordenada) ou meramente unilos se o input já veio garantido na ordem cronológica de chegada! O bucket sort seria a melhor estratégia com 1 milhão de casos.

## 3. Interação entre as Regras 4 e 5

"O que acontece quando um paciente tem 15 anos e urgência MÉDIA?"

As regras **não interagem** diretamente no mesmo registro em relação à concorrência, por conta das limitantes biológicas. 
Uma pessoa que atende à Regra 5 (idade < 18) não pode atender simultaneamente à Regra 4 (idade >= 60). Logo, **o adolescente de 15 anos se enquadra exclusivamente na Regra 5**, onde sua urgência recebe +1 nível. Ele deixa de ser MÉDIA (2) e assume o nível lógico de ALTA (3), passando a disputar FIFO contra outros pacientes ALTA.

## 4. Trabalhando com a Extensão de Regras (SOLID)

Se a clínica adicionasse uma 6ª regra (ex: "Pacientes gestantes têm prioridade máxima independente de idade"), e essa tendência continuar, o design precisa escalar.

**Como meu código lidaria:**
Minha função `final_urgency` é o atual domínio da lógica. Contudo, em uma evolução real (onde teremos n-regras mutantes), eu isolaria isso num padrão de projeto **Chain of Responsibility** ou **Strategy**.
Eu criaria uma interface `PriorityModifier` com um método `.apply(Patient, currentScore)`, na qual cada Regra é uma classe injetada. 
A arquitetura permitiria à clínica ativar ou desativar a "Regra 6" apenas conectando ou removendo o objeto da lista de modificadores num container de injeção de dependências, ou via banco de dados sem alterar a class (fechado para modificação, aberto para extensão).
