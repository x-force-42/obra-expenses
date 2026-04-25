# Prompt 002: First vertical slice backend

You are working on the `obra-expenses` project.

Before implementing anything, read these files carefully:

```txt
AGENTS.md
README.md
docs/product/requirements.md
docs/product/backlog.md
docs/product/out-of-scope.md
docs/planning/first-vertical-slice.md
docs/architecture/overview.md
docs/architecture/data-model.md
docs/architecture/api-contracts.md
docs/architecture/auth-flow.md
docs/architecture/testing-strategy.md
docs/architecture/decisions/
docs/tasks/002-first-vertical-slice-backend.md
```

## Task

Implement `docs/tasks/002-first-vertical-slice-backend.md`.

Build the backend part of the first vertical slice.

## Scope

Implement:

```txt
POST /api/auth/google
GET  /api/auth/me
GET  /api/constructions/current
GET  /api/categories
GET  /api/stages
POST /api/expenses
GET  /api/expenses
```

Create Flyway migrations for:

```txt
users
constructions
categories
stages
expenses
```

Implement the domain model:

```txt
User
Construction
Category
Stage
Expense
```

## Important rules

Do not implement dashboard aggregations yet.

Do not implement public sharing yet.

Do not implement AWS deployment yet.

Do not implement upload, payment method, long observations, budget, notifications, or native app features.

Do not use H2.

Use Testcontainers with PostgreSQL for integration tests.

Use `BigDecimal` for money.

Use logical deletion for expenses.

## Google auth implementation note

Isolate Google token verification behind an interface/service, such as:

```txt
GoogleTokenVerifier
```

Tests must be able to mock this service.

The service should return something like:

```txt
googleSubject
name
email
pictureUrl
```

## Required behavior

On first Google login:

```txt
create user
create construction named "Minha obra"
create default stages
set "Fundação" as current stage
create default categories
return application JWT
```

On repeated login:

```txt
reuse user
do not duplicate construction
do not duplicate categories
do not duplicate stages
return fresh application JWT
```

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

## Required tests

Implement backend tests for:

```txt
creates user on first login
reuses existing user
creates default construction for new user
creates default categories
creates default stages
does not duplicate default data on repeated login
returns current construction
returns active categories
returns active stages
creates valid expense
rejects expense without amount
rejects expense with zero amount
rejects expense with negative amount
rejects category from another construction
rejects stage from another construction
lists expenses paginated
filters expenses by category
filters expenses by stage
filters expenses by date range
sorts expenses by occurredAt desc by default
excludes deleted expenses from normal listings
```

## Validation

Run:

```bash
cd backend
./mvnw test
```

## Final response

When done, summarize:

1. What endpoints were implemented
2. What database migrations were created
3. What tests were added
4. Test results
5. Any contract mismatch found
6. Any file that deserves human review
