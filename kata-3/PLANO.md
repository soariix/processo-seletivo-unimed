# Kata 3: Plano de Ação - Sistema Legado em Colapso

## Seção 1 — Diagnóstico

Utilizando a Matriz de Eisenhower para priorização (Urgente = Impacto imediato no cliente/operação; Importante = Sustentabilidade de longo prazo).

 **Problema: Endpoint de consulta de pedidos demora 8–12 segundos.**
   * **Causa Raiz Mais Provável:** Ausência de paginação ou filtros otimizados, falta de índices na tabela de banco de dados, ou problema de N+1 queries no ORM ao buscar os itens do pedido em um laço de repetição (looping).
   * **Risco:** Negócio (Insatisfação dos clientes e backoffice, possíveis timeouts); Técnico (Sobrecarga de threads, esgotamento do pool de conexões do banco, efeito cascata derrubando outras APIs).
   * **Priorização:** Urgente e Importante (Ação imediata).

 **Problema: Pedidos criados em duplicidade.**
   * **Causa Raiz Mais Provável:** Falta de *idempotency keys* ou controles de trava (Locks) transacionais na API, atrelado a múltiplos cliques no frontend sem *debounce* (disable de botão).
   * **Risco:** Negócio (Reclamações, chargebacks de cartão, alto custo de suporte e estornos logísticos); Técnico (Inconsistência irremediável na base de dados).
   * **Priorização:** Urgente e Importante (Ação imediata, *high severity*).

 **Problema: Bug de frete corrigido direto em produção (sem PR/teste).**
   * **Causa Raiz Mais Provável:** Falta de proteção de branchs (`main`/`master`) e cultura de imediatismo, aliada à ausência de uma esteira simples de CI/CD para deploys seguros.
   * **Risco:** Negócio (Downtime global causado por "dedo gordo"); Técnico (Regressões invisíveis, impossibilidade de rastrear quem aprovou a mudança).
   * **Priorização:** Não Urgente, porém Muito Importante (Débito Cultural).

 **Problema: Código da camada de negócio com +4.000 linhas.**
   * **Causa Raiz Mais Provável:** Arquitetura mal definida (God Classes), acúmulo de débito técnico profundo e violação massiva do Princípio da Responsabilidade Única (SRP / SOLID).
   * **Risco:** Negócio (Lead Time muito alto para lançar novas features); Técnico (Mudanças quebram lugares inesperados, alto esforço cognitivo para *onboarding* de novos devs).
   * **Priorização:** Não Urgente, porém Importante (Médio/Longo Prazo).

 **Problema: Não há testes automatizados.**
   * **Causa Raiz Mais Provável:** Pressão por metas de curto prazo da gestão ("vai do jeito que tá") negligenciando a qualidade em favor da entrega veloz.
   * **Risco:** Negócio (Clientes descobrem bugs em produção antes do time); Técnico (Medo paralisante sistêmico de tentar refatorar as 4.000 linhas, estagnação da plataforma).
   * **Priorização:** Não Urgente, porém Essencial (Sustentação).

---

## Seção 2 — Plano de Ação (Prioridades Imadiatas)

Proponho as seguintes 3 ações táticas baseadas no diagnóstico para estabilizar o colapso, estancando o sangramento logístico e de performance antes de falar de reescritas profundas:

### Ação 1: Trava de Duplicidade (Idempotência e UI Lock)
* **Técnica:** Modificar a API de Checkout para aceitar e validar um Header HTTP (ex: `X-Idempotency-Key` sendo um UUID gerado pelo front). O banco de dados fará o cache/lock curto dessa chave (ex: usando Redis ou Constraints) e rejeitará chamadas duplicadas no intervalo de 1-2 minutos com HTTP 409 Conflict. No frontend, o botão "Finalizar" será desabilitado imediatamente após o primeiro clique (*spin loader*).
* **Esforço Estimado:** 8 a 16 horas (1-2 dias da sprint).
* **Critério de Sucesso:** Zero incidentes (0%) de pedidos em duplicidade nos próximos 30 dias de monitoramento proativo.

### Ação 2: Otimização de Leitura (Indexes e Cache Básico)
* **Técnica:** Rodar um *Execution Plan* nas queries que a listagem de pedidos gera. Adicionar Índices (Indexes) nas colunas freqüentemente filtradas (ex: `data_criacao`, `status`, `cliente_id`). Se houver N+1, modificar a query via `.Include()` ou `.Join()`. Por fim, forçar paginação nativa (`OFFSET/FETCH`) travando o limite de `pageSize` (ex: máx. de 50 registros por tela).
* **Esforço Estimado:** 16 a 24 horas (2-3 dias da sprint para modelagem, review e deploy).
* **Critério de Sucesso:** O Percentil P95 (95% das consultas) do endpoint cair de 8s para menos de 500ms durante as janelas de pico (Black Fridays/Campanhas).

### Ação 3: Proteção Estrita de Main Branch (Cultura de PRs)
* **Técnica:** Acessar as configurações do repositório no GitHub/GitLab/Azure e ativar a flag "Require a pull request before merging". Exigir pelo menos 1 aprovação (`reviewer`). Ocultamente, criar também um arquivo simples do *GitHub Actions* que compila o código na nuvem antes de habilitar o botão de Merge (Garantia de build verde).
* **Esforço Estimado:** 2 a 4 horas (Meio dia).
* **Critério de Sucesso:** Impossibilidade sistêmica (travada pela ferramenta) de realizar *pushes* manuais não rastáveis na branch produtiva por qualquer membro.

---

## Seção 3 — Decisão de Arquitetura: Arquivo Monolítico de 4.000 linhas

Entre as opções postas na mesa (A - Refatoração Incremental e B - Reescrita), eu escolheria, de maneira incontestável, a **Opção A — Refatoração Incremental**.

**Justificativas como Engenheira:**
Em um sistema ativo que processa 800 pedidos/dia com zero testes automatizados, tentar reescrever o motor central do zero (Opção B) é considerado uma aposta extremamente perigosa no mercado (semelhante ao paradoxo de Netscape descrito por Joel Spolsky). O código atual de 4.000 linhas é feio, mas é a **única fonte real documentada do sistema contendo os "*bug fixes*", exceções comerciais esporádicas e *workarounds* criados pela empresa em 5 anos de operação**. Se jogarmos fora e fizermos Clean Architecture no vazio, certamente esqueceremos casos de borda e o sistema rebentará a logística no lançamento.

Como o time já está ocupado com incidentes (e a empresa precisa rodar), adotarei o Padrão **Strangler Fig (Application)** junto ao Mapeamento/Teste de Caracterização (*Snapshot Testing*):
1. Capturamos inputs produtivos atuais e as saídas que o monolito cospia (Criamos testes automatizados do jeito que a classe de 4k linhas estiver, forçando uma redoma de segurança).
2. Extraímos (`Extract Method` / `Extract Class`) os pedacinhos muito óbvios (ex.: Cálculo de Imposto, Geração de Nota). Substituindo um pedaço de cada vez na produção rodando com as branchs novas.
3. Se algo der errado, a área de *Blast Radius* (raio de explosão) é minúscula e o *rollback* é feito em minutos.
É mais demorado no macro, mas dilui o custo, diminui drasticamente o risco do e-commerce falir numa promoção por vazamentos não testáveis em reescritas gigantescas.

---

## Seção 4 — Requisitos Não Funcionais (RNFs) Ignorados

1. **Desempenho (Performance / Latência):**
   * **Comprometimento:** O endpoint de consulta dos pedidos demora entre 8 a 12 segundos, o que quebra qualquer aceitação moderna de UI (usualmente UX aceitável em APIs REST fica abaixo de 1s).
   * **Métrica Proposta:** Latência Percentil *P95* e *P99* do endpoint (`p95_latency < 500ms`).

2. **Integridade Transacional / Resiliência a Concorrência:**
   * **Comprometimento:** Pedidos criados em duplicidade. Uma API REST idempotente deveria conseguir receber fisicamente 100 cliques milissegundos um do lado do outro e resultar em apenas 1 inserção no lado do banco e recusas lógicas nas demais threads. Falta propriedades ACID no ato da criação.
   * **Métrica Proposta:** Volume de Pedidos Duplicados/Inconsistentes em 30 dias na camada transacional (`Taxa de Inconsistência de IDs logísticos = 0%`).

3. **Manutenibilidade e Testabilidade:**
   * **Comprometimento:** A existência de um mega arquivo de 4.000 linhas onde incidentes de frete ocorreram e não havia cobertura de testes ou facilidade de se modificar sem medos sistêmicos de *bugs* colaterais.
   * **Métrica Proposta:** Nível de *Code Coverage* (Iniciar coleta, mesmo que pífia, e impor meta trimestral `>40% -> >60% -> >80%`); e pontuação de *Cyclomatic Complexity* em analisadores estáticos como o SonarQube nos novos PRs.