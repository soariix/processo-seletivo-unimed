# Processo Seletivo - Unimed Caruaru

**Nome completo:** Sara Soares Pacheco
**Telefone de contato:** 81989533470
**E-mail:** sarinhapachecosoares@gmail.com

## Stack Utilizada e Justificativa

*   **Backend / APIs:** C# / .NET 8
*   **Frontend:** React + TypeScript (Vite)
*   **Scripts / Dados:** Python

**Justificativa:** 
A escolha desta stack reflete não apenas o alinhamento com o ecossistema atual da Unimed Caruaru, mas também a seleção das ferramentas mais adequadas, performáticas e maduras para cada contexto do ciclo de desenvolvimento do software:

*   **C# / .NET 8 (Backend):** Excelente performance, forte tipagem e ecossistema maduro para APIs REST corporativas. Permite fácil aplicação de conceitos de Clean Architecture, Injeção de Dependência nativa e princípios SOLID.
*   **React + TypeScript (Frontend):** Proporciona componentização escalável e testável. A segurança de tipos do TypeScript atua como uma camada primária de testes, prevenindo erros em tempo de execução e melhorando drasticamente a Experiência do Desenvolvedor (DX).
*   **Python (Engenharia de Dados e Scripts):** É a linguagem padrão-ouro para processamento de dados. Seu vasto ecossistema (como `pandas` e funções utilitárias) permite transformações de dados idempotentes e extremamente eficientes, focando na clareza do algoritmo.

## Estrutura do Repositório

*   `/kata-1`: Lógica e Algoritmos (Fila de Triagem) - Python
*   `/kata-2`: Feature Full-Stack (Painel de Tarefas) - Node.js e React+TS (Vite)
*   `/kata-3`: Análise de Engenharia de Software (Sistema Legado) - Markdown
*   `/kata-4`: Análise e Transformação de Dados (Pipeline de Relatórios) - Python

## Instruções de Execução

*(Instruções para avaliar e rodar cada desafio)*

*   **Kata 1 (Fila de Triagem - Python):**
    *   Requisitos: Python 3.x e `pytest`
    *   Acesse a pasta: `cd kata-1`
    *   Para rodar os testes: `pytest test_triage.py`

*   **Kata 2 (Painel de Tarefas - Full-stack):**
    *   Requisitos: Node.js (v18+) e npm
    *   **Backend:** Acesse `cd kata-2/backend`, instale as dependências com `npm install` e inicie o servidor com `npm run dev`.
    *   **Frontend:** Acesse `cd kata-2/frontend` (em outro terminal), rode `npm install` para as dependências e inicie com `npm run dev`.

*   **Kata 3 (Análise de Engenharia):**
    *   Documentação textual apenas. Leia o arquivo `kata-3/PLANO.md`. Nenhuma execução é necessária.

*   **Kata 4 (Pipeline de Dados - Python):**
    *   Requisitos: Python 3.x, `pandas`, `numpy`
    *   Acesse a pasta: `cd kata-4`
    *   Execute o pipeline: `python pipeline.py`

## Comentários Livres (O que faria com mais tempo)

*   **Cobertura de Testes:** Ampliaria a cobertura de testes no frontend, implementando Jest e React Testing Library no Kata 2, bem como testes E2E com Cypress ou Playwright.
*   **Aprofundamento no Backend:** Desenvolveria o restante do backend do Kata 2 em C# .NET conforme idealizado, utilizando Entity Framework e garantindo uma integração nativa com o ecossistema corporativo da empresa.
*   **Dockerização:** Criaria os containers para todas as aplicações via Docker e o orquestrador `docker-compose.yml`, simplificando ainda mais o setup dos avaliadores.
