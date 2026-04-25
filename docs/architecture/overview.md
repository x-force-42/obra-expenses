# Architecture Overview

## Project

Project name: `obra-expenses`

Backend package: `br.com.obraexpenses`

## Goal

This project is a mobile-first MVP for managing construction expenses.

The product must allow a construction owner to:

- log in with Google
- automatically receive a default construction
- quickly register expenses
- list expenses
- view financial dashboard data
- share a read-only dashboard link

## Architectural style

The project uses:

- monorepo
- modular monolith backend
- feature-based frontend
- PostgreSQL database
- REST API
- local development with Docker Compose
- future AWS deployment

## Monorepo structure

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

## Frontend stack

Use:

- React
- TypeScript
- Vite
- Vitest
- React Testing Library
- MSW
- TailwindCSS
- shadcn/ui
- TanStack Query
- React Router
- simple Context for auth/session state

Do not use Redux in the MVP.

## Frontend architecture

Use feature-based architecture.

Recommended structure:

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

## Frontend rules

Pages compose screens.

Features contain product-specific logic.

Shared contains reusable generic components, hooks, utils, and types.

Remote server state must use TanStack Query.

API mocks must use MSW from the beginning.

MSW handlers must follow `docs/architecture/api-contracts.md`.

Do not put HTTP calls directly inside generic UI components.

## Backend stack

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
- Testcontainers PostgreSQL

Do not use H2 for integration tests.

## Backend architecture

Use modular monolith by domain.

Recommended package:

```txt
br.com.obraexpenses
```

Recommended modules:

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

Each module may contain:

```txt
controller
service
repository
dto
mapper
domain entity
tests
```

Avoid a global-only structure like:

```txt
controller/
service/
repository/
dto/
entity/
```

The code should remain organized by product domain.

## Domain modules

### auth

Responsible for:

- Google login integration
- validating Google credential/token
- creating/reusing user
- issuing application JWT
- resolving current authenticated user

### user

Responsible for:

- user entity
- user persistence
- user lookup by Google subject

### construction

Responsible for:

- construction entity
- default construction creation
- current construction resolution
- current stage handling

### category

Responsible for:

- default categories
- custom categories
- category activation/deactivation
- category lookup scoped by construction

### stage

Responsible for:

- default stages
- custom stages
- stage activation/deactivation
- current stage validation
- stage lookup scoped by construction

### expense

Responsible for:

- expense creation
- expense editing
- logical deletion
- expense listing
- filtering
- sorting
- pagination

### dashboard

Responsible for:

- dashboard aggregations
- category totals
- stage totals
- monthly evolution
- latest expenses
- top expenses
- average ticket
- current month vs previous month

### sharing

Responsible for:

- public dashboard link
- token generation
- token validation
- link disabling
- link regeneration

### common

Responsible for shared infrastructure such as:

- exception handling
- security utilities
- pagination helpers
- validation helpers
- date/time helpers

## Database

Use PostgreSQL.

Use Flyway for migrations.

Local development must run PostgreSQL through Docker Compose.

Database naming convention should use snake_case.

Example:

```txt
users
constructions
categories
stages
expenses
share_links
```

## REST API

Base path:

```txt
/api
```

Authenticated endpoints must use:

```txt
Authorization: Bearer <jwt>
```

Public endpoints:

```txt
POST /api/auth/google
GET  /api/public/dashboard/{token}
```

All other endpoints require authentication.

## Authentication architecture

The frontend receives a Google credential/token and sends it to the backend.

The backend validates the Google token, creates/reuses the user, creates default data if needed, and returns its own application JWT.

The frontend uses the application JWT for all authenticated API calls.

The backend is the source of truth for authentication.

## Local development

Initial local development should run:

```txt
frontend
backend
postgres
```

PostgreSQL must be provided by Docker Compose.

Frontend and backend may run locally outside Docker during active development, but Docker Compose must support the local database.

## Production direction

Initial AWS production architecture:

```txt
Frontend: S3 + CloudFront
Backend: EC2 with Docker
Database: RDS PostgreSQL
Bucket: S3
CI/CD: GitHub Actions
```

AWS deployment must not be implemented before the first functional vertical slice.

## First vertical slice

The first functional slice is:

```txt
Google login
→ user creation
→ default construction creation
→ default categories and stages
→ simple expense creation
→ expense listing
→ initial automated tests
```

See:

```txt
docs/planning/first-vertical-slice.md
```

## Architectural decisions

Approved decisions:

- Use monorepo
- Use React + TypeScript + Vite in frontend
- Use TailwindCSS + shadcn/ui
- Use TanStack Query for remote data
- Use Context for auth/session
- Do not use Redux in MVP
- Use Java + Spring Boot in backend
- Use PostgreSQL
- Use Flyway
- Use modular monolith by domain
- Use Testcontainers PostgreSQL
- Use MSW from the beginning
- Use AWS S3 + CloudFront, EC2, RDS, and S3 for initial production direction
- Implement AWS/CI/CD after the first functional slice
