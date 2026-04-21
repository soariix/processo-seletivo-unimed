Optei pela arquitetura Clean usando Vertical Slicing e CQRS simplificado dentro de um modelo **n-tier** focado na agilidade e manutenção.

*   **API / Controllers:** Responsável exclusivo pelo parsing HTTP (recepção do `REST`, bind dos `DTOs` e retornos apropriados com status codes, `GET`, `POST`, `PATCH`, `DELETE`).
*   **Camada de Serviços / Regras de Negócio:** Centraliza a inteligência do fluxo. Por exemplo, a mudança de Status ("Concluir tarefa") e o "Soft Delete" (marcar como excluída). Injetado via Inversão de Dependências nativa (`IServiceCollection`).
*   **Persistência (Entity Framework Core com SQLite):** Escolhido o **SQLite** pela portabilidade de avaliação, mas arquitetado através do padrão **Repository** (ou `DbContext` acoplado apenas nos Serviços) para que se, no futuro, quisermos trocar por Postgres/SQL Server corporativo, a camada superior (`Services`/`Controllers`) fique inteiramente blindada à infraestrutura de banco de dados.

Para o Kata 2, os DTOs (Data Transfer Objects) e Injeção de Dependências previnem vazamento de *Entities* diretamente na API, prática excelente e recomendadíssima em ambientes REST corporativos.

---

## API Confiável e Pronta para Produção

Garantir que a API sustente uma empresa (confiabilidade em *production*) não significa adicionar complexidade, e sim **Observabilidade e Prevenção de Falhas**.

Dois aspectos críticos implementados / considerados:
 **Global Exception Handling (Resiliência):** Ao invés de vazamentos de sintaxe e rastreamentos no console ou enviar _Stack Traces_ completos para o React (que compromete a segurança e assusta o cliente interno), montei ou configuraria um *Middleware* centralizado de erro (ex: filtro de _ProblemDetails_ na RFC 7807), assim um erro fatal envia o genérico "HTTP 500" pro Front e guarda o erro real completo internamente.
 **Health Checks (Observabilidade):** Adicionaria *endpoints* `/healthz` (Health Check nativo do .NET) para que o Orquestrador (Kubernetes) ou Load Balancers confirmem se o banco de dados (SQLite) e a infraestrutura estão responsivos; em caso de falha com dependências, o tráfego seria bloqueado de chegar até ele.

---

## Escalabilidade Autenticada (Suporte a Múltiplos Usuários)

O MVP foi criado unificado ("global", as tarefas aparecem para qualquer pessoa acessando na máquina).
Se os Requisitos informais ganhassem o escopo real *(usuário gerencia tarefas de usuário)*, eu precisaria modificar:

*   **Infraestrutura de Banco de Dados:** Adicionaria um campo `OwnerUserId (Guid)` nas entidades (Tasks) para permitir *Row-Level Security* explícita – garantindo o isolamento criptográfico lógico no lado do C#.
*   **Camada de Autenticação / API:** Implementaria **Autenticação Baseada em Token JWT** e **OIDC** (OpenID Connect). Todas as chamadas para a API exigiriam estar preenchidas com um cabeçalho `Authorization: Bearer <token>`.
*   **Identidade e Acesso Corporativo:** Em cenários corporativos reais como sistemas da Unimed, eu não reinventaria a roda de criar tabelas de senhas, e sim plugaríamos o sistema em um provedor de identidade como Microsoft Entra ID (Azure AD), Keycloak ou IdentityServer. O _frontend_ apenas guardaria o Token da nuvem corporativa e o injetaria em todas as solicitações HTTP usando Axios / Fetch interceptors via React Context/Zustand.