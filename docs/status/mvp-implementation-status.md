# MVP Implementation Status

Report date: 2026-04-27

Basis used in this diagnosis:

- product and slice documentation in `docs/`
- current backend and frontend source code
- Flyway migrations
- existing automated tests
- provided context that staging is already deployed

This report reflects the repository state today. It does not infer features that exist only in documentation.

## 1. Executive Summary

- **Overall status:** **bootstrap**, not functional MVP. The repository has solid project scaffolding and working staging/deploy foundations, but the core product flow described in the MVP docs is still not implemented.
- **Google login:** **placeholder only**. The frontend `/login` page renders a disabled Google button and explicitly says Google auth will come in the next task in [frontend/src/pages/LoginPage/index.tsx](../../frontend/src/pages/LoginPage/index.tsx). The backend has no auth controller/service/entities for Google login; only health and CORS are implemented in [backend/src/main/java/br/com/obraexpenses/common/controller/HealthController.java](../../backend/src/main/java/br/com/obraexpenses/common/controller/HealthController.java) and [backend/src/main/java/br/com/obraexpenses/common/config/CorsConfig.java](../../backend/src/main/java/br/com/obraexpenses/common/config/CorsConfig.java).
- **Expense creation/listing/dashboard:** **not implemented**. There are placeholder routes/pages for dashboard, expenses, and public dashboard, but no real form, list, API integration, or backend endpoints in [frontend/src/pages/ExpensesPage/index.tsx](../../frontend/src/pages/ExpensesPage/index.tsx), [frontend/src/pages/DashboardPage/index.tsx](../../frontend/src/pages/DashboardPage/index.tsx), and [frontend/src/pages/PublicDashboardPage/index.tsx](../../frontend/src/pages/PublicDashboardPage/index.tsx).
- **Backend business APIs:** **not implemented**. The contracts in [docs/architecture/api-contracts.md](../architecture/api-contracts.md) are mostly doc-only right now. The only implemented API endpoint in the codebase is `GET /api/health`.
- **Database schema:** **not implemented for the MVP domain**. Flyway is configured, but the only migration is [backend/src/main/resources/db/migration/V1__bootstrap.sql](../../backend/src/main/resources/db/migration/V1__bootstrap.sql), which contains only `SELECT 1;`.
- **Deploy/staging:** **implemented** at infrastructure level. The repo has a backend Docker image, staging Docker Compose, Amplify config, CI workflow, and a self-hosted staging deploy workflow in [backend/Dockerfile](../../backend/Dockerfile), [deploy/staging/docker-compose.staging.yml](../../deploy/staging/docker-compose.staging.yml), [amplify.yml](../../amplify.yml), [.github/workflows/ci.yml](../../.github/workflows/ci.yml), and [.github/workflows/deploy-backend-staging.yml](../../.github/workflows/deploy-backend-staging.yml). Per the provided context, this stack is already running in staging.

## 2. Status by Area

| Area | Status | Notes |
| --- | --- | --- |
| Infra/staging | DONE | Backend Docker packaging, staging Docker Compose, Caddy, Amplify config, and self-hosted EC2 deploy workflow exist in the repo. |
| CI/CD | DONE | GitHub Actions CI runs backend/frontend verification, and backend staging deploy is manual-only on the EC2 self-hosted runner. |
| Backend | PARTIAL | Spring Boot project boots, Flyway is wired, CORS exists, and `/api/health` exists. Business modules are still placeholders only. |
| Frontend | PARTIAL | React/Vite app, routing, providers, styling, and basic pages exist. Product pages are still static placeholders with no real auth or expense flow. |
| Banco/migrations | PARTIAL | PostgreSQL and Flyway are configured, but the MVP tables are not created yet. |
| Testes | PARTIAL | Only smoke/structure tests exist: backend context load, health endpoint, CORS, and login page render. No business-rule or end-to-end vertical-slice tests exist. |
| Documentação | PARTIAL | Product and architecture docs are detailed, but they mostly describe the intended MVP and first slice, not the code that currently exists. This status report closes that visibility gap. |

## 3. Gap Analysis do MVP

| Requisito | Status | Evidência no código | O que falta | Prioridade |
| --- | --- | --- | --- | --- |
| Banco base do MVP (`users`, `constructions`, `categories`, `stages`, `expenses`) | PARTIAL | Flyway is enabled in [application.yml](../../backend/src/main/resources/application.yml), but [V1__bootstrap.sql](../../backend/src/main/resources/db/migration/V1__bootstrap.sql) only contains `SELECT 1;`. | Create the actual schema, keys, constraints, and indexes required by the MVP. | P0 |
| Login Google | PARTIAL | [LoginPage](../../frontend/src/pages/LoginPage/index.tsx) shows a disabled `Continuar com Google` button and states auth comes later. Backend `auth/` contains only [package-info.java](../../backend/src/main/java/br/com/obraexpenses/auth/package-info.java). | Google credential capture on frontend, `POST /api/auth/google`, Google token verification abstraction, JWT issuance, error handling, and redirect after login. | P0 |
| Usuário autenticado | PARTIAL | [session-context.tsx](../../frontend/src/features/auth/session-context.tsx) stores only a token in memory. [router.tsx](../../frontend/src/app/router.tsx) has no guarded routes. [backend/pom.xml](../../backend/pom.xml) has no Spring Security/JWT dependencies or auth layer. | JWT validation, authenticated user loading, token persistence, route protection, `GET /api/auth/me`, and ownership scoping on backend resources. | P0 |
| Criação automática da obra default `Minha obra` | TODO | Required by [requirements](../product/requirements.md) and [auth-flow](../architecture/auth-flow.md), but there is no `Construction` entity/service/repository/controller in the backend source tree. | Construction persistence model, first-login provisioning logic, current stage linkage, and current construction response DTOs. | P0 |
| Categorias padrão | TODO | Required in docs, but `category/` only contains [package-info.java](../../backend/src/main/java/br/com/obraexpenses/category/package-info.java) and frontend `features/categories` is empty except [index.ts](../../frontend/src/features/categories/index.ts). | Category table, entity, repository, seed-on-first-login logic, and `GET /api/categories`. | P0 |
| Etapas padrão | TODO | Required in docs, but `stage/` only contains [package-info.java](../../backend/src/main/java/br/com/obraexpenses/stage/package-info.java). No frontend stage loading logic exists. | Stage table, entity, repository, seed-on-first-login logic, current stage selection, and `GET /api/stages`. | P0 |
| Cadastro de gasto | TODO | [ExpensesPage](../../frontend/src/pages/ExpensesPage/index.tsx) is a static placeholder. `expense/` only contains [package-info.java](../../backend/src/main/java/br/com/obraexpenses/expense/package-info.java). No expense migration exists. | Expense table, DTOs, validation, `POST /api/expenses`, amount/category/stage checks, and frontend form with submission. | P0 |
| Edição/exclusão de gasto | TODO | No backend expense controller/service exists, and no frontend edit/delete UI exists. The requirement exists only in [docs/product/requirements.md](../product/requirements.md). | `PUT /api/expenses/{id}`, logical delete, ownership rules, regression tests, and UI actions. | P1 |
| Listagem de gastos | TODO | The route exists, but [ExpensesPage](../../frontend/src/pages/ExpensesPage/index.tsx) is placeholder-only. No backend listing endpoint or repository query exists. | `GET /api/expenses` with pagination/filtering and frontend list/empty state wired to API. | P0 |
| Dashboard principal | PARTIAL | [DashboardPage](../../frontend/src/pages/DashboardPage/index.tsx) is an explicit placeholder. `dashboard/` only contains [package-info.java](../../backend/src/main/java/br/com/obraexpenses/dashboard/package-info.java). | Dashboard aggregation queries, `GET /api/dashboard`, cards/charts/list widgets, filters, and tests. | P1 |
| Dashboard público por link | PARTIAL | Public route exists in [router.tsx](../../frontend/src/app/router.tsx) and [PublicDashboardPage](../../frontend/src/pages/PublicDashboardPage/index.tsx), but the page itself says public sharing is not part of the bootstrap. | Share-link model, token generation, public dashboard endpoint, public frontend rendering, and security constraints. | P2 |
| Desativar/regenerar link público | TODO | Required in [requirements](../product/requirements.md) and [api-contracts](../architecture/api-contracts.md), but `sharing/` only contains [package-info.java](../../backend/src/main/java/br/com/obraexpenses/sharing/package-info.java). | Share-link table/entity/service/controller plus owner-only UI and tests for create/disable/regenerate. | P2 |
| Testes do vertical slice | PARTIAL | Existing tests are [ObraExpensesApplicationTests](../../backend/src/test/java/br/com/obraexpenses/ObraExpensesApplicationTests.java), [HealthControllerTest](../../backend/src/test/java/br/com/obraexpenses/common/controller/HealthControllerTest.java), and [LoginPage test](../../frontend/src/pages/LoginPage/index.test.tsx). MSW is configured but [handlers.ts](../../frontend/src/mocks/handlers.ts) is empty. | Business tests for first login, default data creation, expense creation/listing, authenticated requests, and frontend integration tests using real MSW handlers. | P0 |

## 4. Próxima PR Recomendada

### Recommendation

The next PR should **not** be only a cosmetic Google button integration. The repository is missing the minimum foundation that makes authentication meaningful:

- auth endpoints do not exist
- JWT/session handling does not exist
- the tables for `users`, `constructions`, `categories`, and `stages` do not exist
- first-login provisioning does not exist

Because of that, the best next PR is:

**`feat: implement Google auth and first-login bootstrap`**

Suggested branch name:

- `feat/google-auth-first-login-bootstrap`

Suggested commit headline:

- `feat: implement Google auth and first-login bootstrap`

### Objective

Implement the first real product path end to end:

```txt
Google login
-> create/reuse user
-> create default construction
-> create default categories and stages
-> issue application JWT
-> persist authenticated frontend session
```

This should stop before expense creation/listing if needed to keep the PR reviewable.

### Prováveis arquivos

- `backend/pom.xml`
- `backend/src/main/resources/db/migration/V2__create_auth_bootstrap_tables.sql`
- `backend/src/main/java/br/com/obraexpenses/auth/...`
- `backend/src/main/java/br/com/obraexpenses/user/...`
- `backend/src/main/java/br/com/obraexpenses/construction/...`
- `backend/src/main/java/br/com/obraexpenses/category/...`
- `backend/src/main/java/br/com/obraexpenses/stage/...`
- `backend/src/main/resources/application.yml`
- `frontend/src/pages/LoginPage/index.tsx`
- `frontend/src/features/auth/session-context.tsx`
- `frontend/src/features/auth/api/authApi.ts`
- `frontend/src/app/router.tsx`
- `frontend/src/mocks/handlers.ts`
- `frontend/src/mocks/data/auth.mock.ts`

### Endpoints

- `POST /api/auth/google`
- `GET /api/auth/me`
- `GET /api/constructions/current`
- `GET /api/categories`
- `GET /api/stages`

### Migrations

- create `users`
- create `constructions`
- create `categories`
- create `stages`
- add the constraints needed for:
  - unique `users.google_subject`
  - unique `users.email`
  - unique `(construction_id, name)` for categories
  - unique `(construction_id, name)` for stages

### Testes esperados

- backend:
  - creates user on first Google login
  - reuses existing user
  - creates default construction `Minha obra`
  - creates default categories
  - creates default stages
  - sets `Fundação` as current stage
  - does not duplicate default data on repeated login
  - returns application JWT
  - rejects invalid credential input
- frontend:
  - login page triggers auth flow instead of a disabled button
  - successful login stores token and session data
  - successful login redirects to `/expenses` or `/dashboard`
  - failure state is shown when auth fails
  - MSW handlers cover the auth/current construction/categories/stages bootstrap calls

### Critérios de aceite

- `/login` is no longer static placeholder-only
- backend exposes `POST /api/auth/google` and `GET /api/auth/me`
- first login creates user plus default construction/categories/stages
- repeated login reuses existing data without duplication
- frontend stores the application token and treats the session as authenticated
- automated tests exist for the new backend behavior and frontend auth flow
- no expense CRUD or dashboard aggregation is included yet unless strictly necessary

## Bottom Line

The repo is currently **well-structured bootstrap + working infrastructure**, but **the MVP business flow is still doc-first, not code-first**. The next PR should start the actual product by implementing **Google authentication plus first-login provisioning**, because that is the minimum foundation required before expense registration and dashboard work can become meaningful.
