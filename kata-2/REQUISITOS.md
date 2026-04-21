# Análise de Requisitos - Painel de Tarefas

## Ambiguidades e Informações Faltantes

Durante a leitura do relato informal do cliente interno, identifiquei três ambiguidades que precisam de alinhamento antes do desenvolvimento completo:

**Ambiguidade A: O escopo de "Minhas tarefas"**
> *"Preciso de uma tela onde eu veja minhas tarefas."*
*   **Pergunta ao cliente:** Essa aplicação será de uso pessoal (apenas você), terá acesso global para toda a empresa num painel compartilhado, ou cada colaborador deve acessar com um login único para ver somente as próprias atividades?
*   **Decisão:** Como a solicitação pede uma "ferramenta simples" e não menciona login, assumirei a criação inicial de um MVP "Single-Tenant" (painel global não autenticado). Os IDs dos usuários não serão obrigatórios nesta primeira entrega.

**Ambiguidade B: Transição de Status**
> *"Cada tarefa tem um título e uma situação. Marcar como feita..."*
*   **Pergunta ao cliente:** Uma tarefa sempre nasce "Pendente" e vai para "Concluída", ou existe uma situação intermediária ("Em Progresso", "Aguardando terceiros")? É possível voltar uma tarefa concluída para o status de pendente por engano?
*   **Decisão:** Construirei um fluxo binário básico com as situações `Pending` e `Completed`. Além disso, permitirei a reversão do status de `Completed` para `Pending` para mitigar cliques acidentais pelo usuário.

**Ambiguidade C: Exclusão Lógica vs. Exclusão Física**
> *"Deletar as que não preciso mais."*
*   **Pergunta ao cliente:** Quando você diz "deletar", significa apagar para sempre da base de dados ou apenas ocultar da tela (arquivar) por motivos de auditoria ou histórico do time financeiro?
*   **Decisão:** Como um Sênior focado em integridade corporativa, não farei exclusão física profunda (*Hard Delete*). Adicionarei um campo `IsDeleted` (boolean) na modelagem do banco. Na tela a tarefa some, mas os dados originais são preservados (*Soft Delete*).

---

## Requisitos Formais

### Requisitos Funcionais (RF)
*   **RF01:** O sistema deve listar todas as tarefas ativas, exibindo seu Título e Status atual.
*   **RF02:** O sistema deve permitir a criação de uma nova tarefa informando obrigatoriamente um Título. Toda nova tarefa deve nascer com status "Pendente".
*   **RF03:** O sistema deve permitir alterar o status de uma tarefa entre Pendente/Concluída (via ação rápida na interface).
*   **RF04:** O sistema deve permitir a exclusão (Soft Delete) de uma tarefa específica.
*   **RF05:** O sistema deve oferecer um filtro em tela para exibir: Todas, Somente Pendentes ou Somente Concluídas.

### Requisitos Não Funcionais (RNF)
*   **RNF01 (Linguagem/Stack):** A API será construída em C# .NET 8 (REST / JSON) e o frontend em React + TypeScript.
*   **RNF02 (Persistência):** Utilizar banco de dados leve (`SQLite` com Entity Framework Core) para facilitar a execução local pelos avaliadores, mantendo qualidade transacional.
*   **RNF03 (UX/UI):** Feedback visual para ações de rede (ex.: Loading ao salvar a tarefa). Indicação visual com cores distintas dependendo do status (ex.: Verde para Concluída, Amarelo para Pendente).

---

## Gestão do Backlog: O Requisito de "Prioridade"

O requisito: *"queria também uma prioridade nas tarefas. Mas isso pode ficar pra depois."*

**Como eu trataria no Backlog:**
Em uma metodologia ágil (Scrum/Kanban), o foco primário é entregar valor utilizável (MVP). Esse desejo de negócio deve ser tratado na ferramenta de gestão (Jira/Azure DevOps/Trello) da seguinte forma:
1.  Seria transformado em uma **User Story** separada: `Como usuário, quero poder assinalar a prioridade (Alta, Média, Baixa) nas tarefas para gerenciar melhor minha urgência de trabalho`.
2.  Colocado no _Product Backlog_ rotulado com uma flag `Nice to Have` ou como prioridade de negócio inferior.
3.  Essa feature entraria na próxima iteração (_Sprint +1_), garantindo o foco 100% da equipe em estabilizar os requisitos fundamentais (*Core*) nesta primeira Sprint.
4.  **Decisão técnica preventiva:** Uma vez que ele disse "depois", como Engenheiro, no momento das _Migrations_ do banco (Kata 2 atual), não bloquearei arquitetonicamente essa funcionalidade; deixarei a estrutura já preparada para receber uma nova tabela/Enum futuramente.