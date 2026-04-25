# AGENTS.md

## Project

Project name: `obra-expenses`.

This is a mobile-first MVP for managing construction expenses.

The main user is the construction owner.

The main product goal is:

> Open the app, register an expense quickly, and understand where the money is going.

## How to work in this repo

Before implementing a task, read only the documents relevant to that task.

Do not read all documentation by default.

Start with:

```txt
docs/tasks/<task-file>.md
```

Then read only the architecture files referenced by that task.

Use the documentation as the source of truth.

## Main documentation map

Product scope:

```txt
docs/product/requirements.md
docs/product/backlog.md
docs/product/out-of-scope.md
```

Planning:

```txt
docs/planning/first-vertical-slice.md
```

Architecture:

```txt
docs/architecture/overview.md
docs/architecture/data-model.md
docs/architecture/api-contracts.md
docs/architecture/auth-flow.md
docs/architecture/testing-strategy.md
```

Decisions:

```txt
docs/architecture/decisions/
```

Executable task specs:

```txt
docs/tasks/
```

Reusable prompts:

```txt
docs/prompts/
```

## Current implementation priority

The first implementation target is:

```txt
Google login
→ user creation/reuse
→ default construction creation
→ default categories and stages
→ simple expense creation
→ expense listing
→ initial automated tests
```

See:

```txt
docs/planning/first-vertical-slice.md
docs/tasks/001-bootstrap-project.md
docs/tasks/002-first-vertical-slice-backend.md
docs/tasks/003-first-vertical-slice-frontend.md
```

Do not start with AWS deployment.

CI/CD and AWS deployment come after the first functional vertical slice.

## Tech stack

Monorepo:

```txt
frontend/
backend/
docs/
infra/
docker-compose.yml
```

Frontend:

```txt
React
TypeScript
Vite
Vitest
React Testing Library
MSW
TailwindCSS
shadcn/ui
TanStack Query
React Router
Context for auth/session
```

Backend:

```txt
Java
Spring Boot
PostgreSQL
Flyway
Spring Data JPA
Bean Validation
JUnit 5
MockMvc
Testcontainers PostgreSQL
```

Do not use Redux.

Do not use H2 for backend integration tests.

Use PostgreSQL through Docker Compose for local development.

## Architecture rules

Frontend:

- Use feature-based architecture.
- Use TanStack Query for remote server state.
- Use MSW from the beginning.
- Keep MSW handlers aligned with `docs/architecture/api-contracts.md`.
- Use Context only for simple auth/session state.
- Keep UI mobile first.

Backend:

- Use modular monolith by domain.
- Package: `br.com.obraexpenses`.
- Organize modules by domain:
  - `auth`
  - `user`
  - `construction`
  - `category`
  - `stage`
  - `expense`
  - `dashboard`
  - `sharing`
  - `common`
- Use DTOs for API requests/responses.
- Do not expose entities directly as API responses.
- Use `BigDecimal` for money.
- Use Flyway for schema changes.

## Domain rules

First access:

- User logs in with Google.
- Backend validates Google credential/token.
- Backend creates/reuses the user.
- Backend creates default construction if needed.
- Default construction name: `Minha obra`.
- Initial current stage: `Fundação`.
- Backend creates default categories and stages.
- Backend issues its own application JWT.

Default categories:

```txt
Material
Mão de Obra
Ferramentas
Documentação/Taxas
Outros
```

Default stages:

```txt
Fundação
Estrutura
Alvenaria
Cobertura
Elétrica
Hidráulica
Reboco
Piso
Pintura
Acabamento
Outros
```

Expense MVP fields:

- amount: required
- category: required
- stage: required
- description: optional
- occurredAt: set automatically by backend

Expense deletion must be logical.

Deleted expenses must not appear in listings or dashboard calculations.

## Out of scope for MVP

Do not implement unless documentation is explicitly changed:

- receipt/image upload
- long observations
- payment method
- planned budget
- accounts payable
- available balance control
- multiple users editing the same construction
- email invitations
- complex permissions
- construction address/location
- PDF/Excel exports
- notifications
- AI-generated financial analysis
- native Android/iOS app
- banking/Open Finance integration
- automatic spreadsheet import
- automatic invoice/receipt reading

## Testing rules

Backend:

- Use JUnit 5, Spring Boot Test, MockMvc, and Testcontainers PostgreSQL.
- Do not use H2.
- Add tests for business rules.
- Add controller/API tests when endpoint contracts change.
- Add regression tests for bug fixes.

Frontend:

- Use Vitest, React Testing Library, and MSW.
- Use MSW for API behavior in tests.
- Keep mocks aligned with API contracts.
- Test user-visible behavior, not implementation details.

Required checks before finishing a task:

```bash
cd backend
./mvnw test
```

```bash
cd frontend
npm run test
npm run build
```

Run only the checks relevant to the files changed when a full run is not practical, and explain what was run.

## API contract rules

When changing an endpoint, update all relevant files:

```txt
docs/architecture/api-contracts.md
backend DTOs/controllers
frontend API types
MSW handlers
tests
```

## Review rules

Use this checklist for reviews:

```txt
docs/tasks/004-review-checklist.md
```

A PR is not done just because it compiles.

A task is done when:

- scope is respected
- tests are meaningful
- architecture is preserved
- API contracts are aligned
- docs are updated when behavior changes
- no secrets are committed

## Security rules

- Never commit secrets.
- Use `.env.example` for placeholders only.
- Never trust identity only from frontend data.
- Backend must validate ownership of resources.
- Public dashboard tokens must be hard to guess.
- Public tokens must not expose sequential IDs.

## Final response after a task

When finishing a task, summarize:

1. What changed
2. What tests/checks were run
3. Results
4. Any assumptions
5. Any files that deserve human review
