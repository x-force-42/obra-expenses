# Task 001: Bootstrap project

## Goal

Create the initial monorepo structure for `obra-expenses`.

This task must prepare the repository for frontend, backend, documentation, local development, and AI-assisted implementation.

## Read before implementing

Before changing files, read:

```txt
AGENTS.md
README.md
docs/product/requirements.md
docs/product/backlog.md
docs/planning/first-vertical-slice.md
docs/architecture/overview.md
docs/architecture/testing-strategy.md
```

## Scope

Create the initial project structure.

This task should not implement business features yet.

## Required structure

Create:

```txt
obra-expenses/
├── frontend/
├── backend/
├── docs/
├── infra/
├── docker-compose.yml
├── AGENTS.md
└── README.md
```

The documentation files already define the product, architecture, and first implementation slice.

## Frontend bootstrap

Create a Vite React TypeScript project inside:

```txt
frontend/
```

Use:

```txt
React
TypeScript
Vite
Vitest
React Testing Library
TailwindCSS
shadcn/ui
TanStack Query
React Router
MSW
```

Recommended frontend structure:

```txt
frontend/src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── pages/
│   ├── LoginPage/
│   ├── DashboardPage/
│   ├── ExpensesPage/
│   └── PublicDashboardPage/
│
├── features/
│   ├── auth/
│   ├── expenses/
│   ├── dashboard/
│   ├── categories/
│   ├── stages/
│   └── sharing/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── utils/
│
└── mocks/
    ├── handlers.ts
    ├── server.ts
    ├── browser.ts
    └── data/
```

## Backend bootstrap

Create a Spring Boot project inside:

```txt
backend/
```

Use package:

```txt
br.com.obraexpenses
```

Recommended backend modules:

```txt
backend/src/main/java/br/com/obraexpenses/
├── auth/
├── user/
├── construction/
├── category/
├── stage/
├── expense/
├── dashboard/
├── sharing/
└── common/
```

Use:

```txt
Java
Spring Boot
Spring Data JPA
PostgreSQL
Flyway
Bean Validation
JUnit 5
Spring Boot Test
MockMvc
Testcontainers PostgreSQL
```

## Docker Compose

Create a root `docker-compose.yml` for local PostgreSQL.

It must include:

```txt
postgres
```

Recommended local values:

```txt
database: obra_expenses
user: app
password: app
port: 5432
```

Do not use production credentials.

## Environment files

Create example env files, not real secrets.

Recommended:

```txt
frontend/.env.example
backend/.env.example
```

Do not commit real secrets.

## Frontend environment example

Include values such as:

```txt
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=replace-me
VITE_ENABLE_MSW=true
```

## Backend environment example

Include values such as:

```txt
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/obra_expenses
SPRING_DATASOURCE_USERNAME=app
SPRING_DATASOURCE_PASSWORD=app
JWT_SECRET=replace-me
GOOGLE_CLIENT_ID=replace-me
```

## Initial tests

Create minimal smoke tests only.

Frontend:

```txt
App renders
```

Backend:

```txt
application context loads
```

Business tests come in the next tasks.

## Not in scope

Do not implement yet:

- Google login behavior
- user creation
- default construction creation
- expense creation
- dashboard
- public sharing
- AWS deployment
- GitHub Actions

## Expected outcome

After this task:

- frontend project exists
- backend project exists
- PostgreSQL runs through Docker Compose
- Flyway is configured
- Vitest is configured
- MSW is configured
- basic project commands work
- no business feature is implemented yet

## Suggested validation commands

Backend:

```bash
cd backend
./mvnw test
```

Frontend:

```bash
cd frontend
npm install
npm run test
npm run build
```

Docker:

```bash
docker compose up -d postgres
```

## Definition of Done

This task is done when:

- monorepo structure exists
- frontend boots locally
- backend boots locally
- PostgreSQL boots with Docker Compose
- Flyway is configured
- MSW files exist
- basic tests pass
- docs remain unchanged unless corrections are needed
- no out-of-scope feature was implemented
