# AGENTS.md

## Project identity

This project is called `obra-expenses`.

It is a mobile-first MVP for managing construction expenses. The target user is a common person who owns or manages a personal construction project and wants a simple way to register expenses and understand where the money is going.

The system must be simple, fast, and intuitive. The main product goal is:

> Open the app, register an expense quickly, and understand the flow of money through a dashboard.

## Development approach

This project is being developed with AI assistance using a spec-driven workflow.

Agents must follow the documentation in the `docs/` directory before implementing anything.

Important documents:

- `docs/product/requirements.md`
- `docs/product/backlog.md`
- `docs/product/out-of-scope.md`
- `docs/planning/first-vertical-slice.md`
- `docs/architecture/overview.md`
- `docs/architecture/data-model.md`
- `docs/architecture/api-contracts.md`
- `docs/architecture/testing-strategy.md`

## Current SDLC status

The project is currently transitioning from:

1. Requirements gathering
2. Analysis and planning
3. Solution design and architecture

Implementation must follow the approved requirements, backlog, and architecture.

## General rules for agents

- Do not implement features that are explicitly out of scope.
- Do not add libraries without a clear justification.
- Do not change architectural decisions without updating the relevant ADR.
- Do not create secrets, credentials, tokens, or passwords in source code.
- Do not hardcode environment-specific URLs unless they are local development defaults.
- Do not push directly to `main`.
- Prefer small, focused changes.
- Prefer readable code over clever code.
- Every new business rule must have automated tests.
- Every API contract change must update documentation and MSW mocks.
- Backend changes must include relevant tests.
- Frontend components with interaction logic must include relevant tests.
- Keep the MVP simple.

## Out-of-scope reminders

The following must not be implemented in the MVP unless the documentation is explicitly changed:

- Upload of receipts or images
- Long observations on expenses
- Payment method
- Planned budget
- Accounts payable
- Available balance control
- Multiple users editing the same construction
- Email invitations
- Complex permissions
- Construction address/location
- PDF or Excel exports
- WhatsApp/email notifications
- AI-generated financial analysis
- Native Android/iOS app
- Banking/Open Finance integration
- Automatic spreadsheet import
- Automatic invoice/receipt reading

## Tech stack

### Monorepo

The repository must be organized as a monorepo:

- `frontend/`
- `backend/`
- `docs/`
- `infra/`
- `docker-compose.yml`

### Frontend

Use:

- React
- TypeScript
- Vite
- Vitest
- React Testing Library
- MSW from the beginning
- TailwindCSS
- shadcn/ui
- TanStack Query
- React Router
- Simple Context for auth/session state

Do not use Redux in the MVP.

### Backend

Use:

- Java
- Spring Boot
- PostgreSQL
- Flyway
- Spring Data JPA
- Bean Validation
- JUnit 5
- Spring Boot Test
- MockMvc
- Testcontainers with PostgreSQL

Do not use H2 for integration tests.

### Database

Use PostgreSQL.

Local development must run PostgreSQL through Docker Compose.

### Infrastructure direction

Initial AWS production architecture:

- Frontend: S3 + CloudFront
- Backend: EC2 with Docker
- Database: RDS PostgreSQL
- Bucket: S3
- CI/CD: GitHub Actions

Important: AWS deployment and CI/CD are planned for a second moment, after the first functional vertical slice exists.

## Frontend architecture rules

Use feature-based architecture.

Recommended structure:

```txt
frontend/src/
├── app/
├── pages/
├── features/
└── shared/
```

Pages should compose screens.

Features should contain product-specific logic.

Shared should contain reusable generic components, hooks, utils, and types.

Do not put HTTP calls directly inside generic UI components.

Use TanStack Query for remote server state.

Use MSW handlers that match `docs/architecture/api-contracts.md`.

## Backend architecture rules

Use modular monolith by domain.

Recommended package:

```txt
br.com.obraexpenses
```

Recommended modules:

```txt
auth
user
construction
category
stage
expense
dashboard
sharing
common
```

Avoid organizing the whole backend only by technical type, such as one global `controller/`, one global `service/`, one global `repository/`.

Each domain module may contain its own controller, service, repository, DTOs, mapper, and tests.

## Domain rules

### User

- User is created automatically after first successful Google login.
- Google subject must uniquely identify the user.
- There is no email/password login in the MVP.

### Construction

- A new user automatically receives a default construction.
- Default construction name: `Minha obra`
- Initial current stage: `Fundação`
- MVP frontend can focus only on the current/default construction.

### Category

Default categories:

- Material
- Mão de Obra
- Ferramentas
- Documentação/Taxas
- Outros

Categories belong to a construction.

Categories can be added and edited.

Categories should be deactivated instead of physically deleted.

### Stage

Default stages:

- Fundação
- Estrutura
- Alvenaria
- Cobertura
- Elétrica
- Hidráulica
- Reboco
- Piso
- Pintura
- Acabamento
- Outros

Stages belong to a construction.

Stages can be added and edited.

Stages should be deactivated instead of physically deleted.

### Expense

An expense belongs to a construction, category, and stage.

Fields for the MVP:

- amount: required
- category: required
- stage: required
- description: optional
- occurredAt: automatically set by backend

Expense deletion must be logical.

Deleted expenses must not appear in listings or dashboard calculations.

### Dashboard

Authenticated dashboard default period: `MONTH`.

Public dashboard default period: `ALL`.

Dashboard must include:

- month spent
- total spent
- pie chart data by category
- pie chart data by stage
- monthly expense evolution
- 5 latest expenses
- 5 top expenses
- main category
- main stage
- average ticket
- current month vs previous month comparison

### Public sharing

The owner can generate, disable, and regenerate a public dashboard link.

Public dashboard:

- Does not require login
- Is read-only
- Shows the same dashboard information
- Uses a hard-to-guess token
- Must not expose sequential construction IDs

## Testing rules

### Backend

Use:

- JUnit 5
- Spring Boot Test
- MockMvc
- Testcontainers PostgreSQL
- AssertJ

Backend tests must cover business rules and API contracts.

Important backend tests:

- Create user on first Google login
- Reuse existing user
- Create default construction
- Create default categories
- Create default stages
- Create expense
- Reject invalid expense amount
- Reject category from another construction
- Reject stage from another construction
- List expenses with pagination
- Filter and sort expenses
- Ignore deleted expenses in dashboard

### Frontend

Use:

- Vitest
- React Testing Library
- MSW

MSW must be used from the beginning.

MSW handlers must reflect the API contracts documented in:

```txt
docs/architecture/api-contracts.md
```

Frontend tests should focus on user-visible behavior and interactions.

Important frontend tests:

- Login page renders Google login action
- Expense form renders required fields
- Expense form allows empty description
- Expense form requires amount
- Expense form submits valid data
- Dashboard renders empty state
- Dashboard renders main cards and charts using mocked API responses

### E2E

Playwright is not part of the first implementation.

E2E tests should be added after the first functional delivery.

## Definition of Done

A task is done only when:

- Requirement is implemented
- Relevant tests are created or updated
- Backend tests pass
- Frontend tests pass when applicable
- Frontend build passes when applicable
- No secrets are committed
- API documentation is updated when endpoints change
- MSW mocks are updated when API contracts change
- Code follows the architecture documented in `docs/architecture/`
- PR description explains what changed and how it was tested

## First implementation target

The first vertical slice is documented in:

```txt
docs/planning/first-vertical-slice.md
```

Agents must not start with AWS deployment.

Agents must first implement a functional local MVP slice:

```txt
Google login
→ user creation
→ default construction creation
→ default categories and stages
→ simple expense creation
→ expense listing
→ initial automated tests
```
