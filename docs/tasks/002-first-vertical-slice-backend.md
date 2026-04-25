# Task 002: First vertical slice backend

## Goal

Implement the backend part of the first vertical slice.

The backend must support:

```txt
Google login endpoint
→ user creation/reuse
→ default construction creation
→ default categories and stages creation
→ application JWT
→ current construction endpoint
→ categories endpoint
→ stages endpoint
→ expense creation endpoint
→ expense listing endpoint
→ initial backend tests
```

## Read before implementing

Read:

```txt
AGENTS.md
docs/product/requirements.md
docs/product/backlog.md
docs/planning/first-vertical-slice.md
docs/architecture/overview.md
docs/architecture/data-model.md
docs/architecture/api-contracts.md
docs/architecture/auth-flow.md
docs/architecture/testing-strategy.md
docs/architecture/decisions/
```

## Scope

Implement only the backend behavior needed for the first vertical slice.

## Not in scope

Do not implement:

- dashboard aggregations
- public share links
- AWS deployment
- GitHub Actions
- frontend screens
- upload
- payment method
- long observations
- native mobile app

## Required database tables

Create Flyway migration for:

```txt
users
constructions
categories
stages
expenses
```

Do not create `share_links` in this task unless needed by later work.

## Required entities

Implement:

```txt
User
Construction
Category
Stage
Expense
```

## Required backend modules

Implement or prepare:

```txt
auth
user
construction
category
stage
expense
common
```

## Auth behavior

Implement:

```txt
POST /api/auth/google
GET  /api/auth/me
```

### POST /api/auth/google

Request:

```json
{
  "credential": "google_id_token_or_credential"
}
```

Response:

```json
{
  "accessToken": "application-jwt",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@email.com",
    "pictureUrl": "https://example.com/avatar.jpg"
  },
  "currentConstruction": {
    "id": 1,
    "name": "Minha obra",
    "currentStage": {
      "id": 1,
      "name": "Fundação"
    }
  }
}
```

### Important implementation note

Isolate Google validation behind an interface/service.

Example:

```txt
GoogleTokenVerifier
```

This allows tests to mock Google validation without calling Google.

The service should return something like:

```txt
googleSubject
name
email
pictureUrl
```

## First login behavior

When the user logs in for the first time:

1. Create user.
2. Create construction named `Minha obra`.
3. Create default stages.
4. Set `Fundação` as current stage.
5. Create default categories.
6. Return application JWT.

## Existing user behavior

When the user already exists:

1. Reuse user.
2. Do not duplicate construction.
3. Do not duplicate categories.
4. Do not duplicate stages.
5. Return fresh application JWT.

## Default categories

Create:

```txt
Material
Mão de Obra
Ferramentas
Documentação/Taxas
Outros
```

## Default stages

Create:

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

## Construction endpoint

Implement:

```txt
GET /api/constructions/current
```

Return:

```json
{
  "id": 1,
  "name": "Minha obra",
  "currentStage": {
    "id": 1,
    "name": "Fundação"
  },
  "createdAt": "2026-04-25T18:30:00Z"
}
```

## Categories endpoint

Implement:

```txt
GET /api/categories
```

Default query behavior:

```txt
active=true
```

Return active categories for current construction.

## Stages endpoint

Implement:

```txt
GET /api/stages
```

Default query behavior:

```txt
active=true
```

Return active stages for current construction.

## Expense creation endpoint

Implement:

```txt
POST /api/expenses
```

Request:

```json
{
  "amount": 330.0,
  "categoryId": 1,
  "stageId": 1,
  "description": "Locação container"
}
```

Response:

```json
{
  "id": 1,
  "amount": 330.0,
  "description": "Locação container",
  "category": {
    "id": 1,
    "name": "Material"
  },
  "stage": {
    "id": 1,
    "name": "Fundação"
  },
  "occurredAt": "2026-04-25T18:30:00Z",
  "createdAt": "2026-04-25T18:30:00Z"
}
```

Rules:

- amount is required
- amount must be greater than zero
- categoryId is required
- stageId is required
- description is optional
- category must belong to current construction
- stage must belong to current construction
- occurredAt is set by backend
- deleted starts as false

## Expense listing endpoint

Implement:

```txt
GET /api/expenses
```

Support:

```txt
page
size
sort
dateFrom
dateTo
categoryId
stageId
description
minAmount
maxAmount
```

Default:

```txt
page=0
size=20
sort=occurredAt,desc
```

Response:

```json
{
  "content": [
    {
      "id": 1,
      "amount": 330.0,
      "description": "Locação container",
      "category": {
        "id": 1,
        "name": "Material"
      },
      "stage": {
        "id": 1,
        "name": "Fundação"
      },
      "occurredAt": "2026-04-25T18:30:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

Rules:

- only current construction expenses
- ignore deleted expenses
- pagination required
- sorting supported
- filters supported

## Security

Implement application JWT authentication.

All endpoints except `POST /api/auth/google` must require JWT.

For tests, use test helpers to create authenticated requests.

## Ownership validation

The backend must prevent cross-user/cross-construction access.

Validate:

- category belongs to current construction
- stage belongs to current construction
- expense belongs to current construction

## Required backend tests

Implement tests using:

```txt
JUnit 5
Spring Boot Test
MockMvc
Testcontainers PostgreSQL
AssertJ
```

Do not use H2.

Required tests:

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

## Validation errors

Use the error format from:

```txt
docs/architecture/api-contracts.md
```

## Suggested implementation order

1. Create Flyway migration.
2. Create entities.
3. Create repositories.
4. Create DTOs.
5. Create Google token verifier abstraction.
6. Create JWT service.
7. Implement auth service.
8. Implement first-login default data creation.
9. Implement security filter/config.
10. Implement current construction endpoint.
11. Implement categories endpoint.
12. Implement stages endpoint.
13. Implement expense create endpoint.
14. Implement expense listing endpoint.
15. Add tests.
16. Run all backend tests.

## Definition of Done

This backend task is done when:

- Flyway migrations run
- backend starts
- auth endpoint works structurally
- application JWT is issued
- current construction endpoint works
- categories endpoint works
- stages endpoint works
- expense creation works
- expense listing works with pagination
- ownership validation exists
- required tests exist
- backend tests pass
- API contracts remain aligned with docs
