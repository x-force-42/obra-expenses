# API Contracts

## General conventions

Base path:

```txt
/api
```

Authentication header:

```txt
Authorization: Bearer <jwt>
```

Authenticated endpoints require application JWT.

Public endpoints:

```txt
POST /api/auth/google
GET  /api/public/dashboard/{token}
```

Dates must use ISO-8601 format.

Example:

```txt
2026-04-25T18:30:00Z
```

Money values are represented as JSON numbers and mapped to `BigDecimal` in Java.

Example:

```json
{
  "amount": 150.75
}
```

## Error format

Generic error:

```json
{
  "timestamp": "2026-04-25T18:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Valor do gasto deve ser maior que zero",
  "path": "/api/expenses"
}
```

Validation error:

```json
{
  "timestamp": "2026-04-25T18:30:00Z",
  "status": 400,
  "error": "Validation Error",
  "message": "Dados inválidos",
  "fields": [
    {
      "field": "amount",
      "message": "Valor é obrigatório"
    }
  ]
}
```

Recommended status usage:

```txt
400 Bad Request: invalid request or validation error
401 Unauthorized: missing or invalid JWT
403 Forbidden: authenticated user cannot access the resource
404 Not Found: resource not found
409 Conflict: duplicated category/stage name or similar conflict
500 Internal Server Error: unexpected error
```

# Auth

## POST /api/auth/google

Validates Google credential, creates or reuses the user, creates default data when needed, and returns the application JWT.

### Request

```json
{
  "credential": "google_id_token_or_credential"
}
```

### Response

```json
{
  "accessToken": "application-jwt",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "name": "Eliezer Alves",
    "email": "eliezer@email.com",
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

### Rules

- Backend validates the Google credential.
- If the user does not exist, create the user.
- If the user has no default construction, create one.
- Create default categories.
- Create default stages.
- Set `Fundação` as current stage.
- Return application JWT.

## GET /api/auth/me

Returns authenticated user and current construction.

### Response

```json
{
  "user": {
    "id": 1,
    "name": "Eliezer Alves",
    "email": "eliezer@email.com",
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

# Current construction

## GET /api/constructions/current

Returns current/default construction for the authenticated user.

### Response

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

## PATCH /api/constructions/current

Updates simple current construction data.

### Request

```json
{
  "name": "Minha casa",
  "currentStageId": 2
}
```

Both fields are optional.

### Response

```json
{
  "id": 1,
  "name": "Minha casa",
  "currentStage": {
    "id": 2,
    "name": "Estrutura"
  },
  "createdAt": "2026-04-25T18:30:00Z",
  "updatedAt": "2026-04-25T19:10:00Z"
}
```

### Rules

- `currentStageId` must belong to the current construction.
- MVP manipulates only current/default construction.

# Categories

## GET /api/categories

Lists categories for the current construction.

### Query params

```txt
active=true|false|all
```

Default:

```txt
active=true
```

### Response

```json
[
  {
    "id": 1,
    "name": "Material",
    "isDefault": true,
    "active": true
  },
  {
    "id": 2,
    "name": "Mão de Obra",
    "isDefault": true,
    "active": true
  }
]
```

## POST /api/categories

Creates a custom category.

### Request

```json
{
  "name": "Frete"
}
```

### Response

```json
{
  "id": 6,
  "name": "Frete",
  "isDefault": false,
  "active": true
}
```

### Rules

- Name is required.
- Name must not duplicate another category in the same construction.
- Custom categories start with `isDefault=false`.

## PUT /api/categories/{id}

Updates category name.

### Request

```json
{
  "name": "Materiais"
}
```

### Response

```json
{
  "id": 1,
  "name": "Materiais",
  "isDefault": true,
  "active": true
}
```

### Rules

- Category must belong to current construction.
- Name is required.
- Name must not duplicate another category in the same construction.

## PATCH /api/categories/{id}/active

Activates or deactivates a category.

### Request

```json
{
  "active": false
}
```

### Response

```json
{
  "id": 1,
  "name": "Material",
  "isDefault": true,
  "active": false
}
```

### Rules

- Inactive category must not appear as default option in new expenses.
- Old expenses remain associated with the category.
- No physical deletion in MVP.

# Stages

## GET /api/stages

Lists stages for the current construction.

### Query params

```txt
active=true|false|all
```

Default:

```txt
active=true
```

### Response

```json
[
  {
    "id": 1,
    "name": "Fundação",
    "isDefault": true,
    "active": true
  },
  {
    "id": 2,
    "name": "Estrutura",
    "isDefault": true,
    "active": true
  }
]
```

## POST /api/stages

Creates a custom stage.

### Request

```json
{
  "name": "Muro"
}
```

### Response

```json
{
  "id": 12,
  "name": "Muro",
  "isDefault": false,
  "active": true
}
```

### Rules

- Name is required.
- Name must not duplicate another stage in the same construction.

## PUT /api/stages/{id}

Updates stage name.

### Request

```json
{
  "name": "Fundação e baldrame"
}
```

### Response

```json
{
  "id": 1,
  "name": "Fundação e baldrame",
  "isDefault": true,
  "active": true
}
```

## PATCH /api/stages/{id}/active

Activates or deactivates a stage.

### Request

```json
{
  "active": false
}
```

### Response

```json
{
  "id": 1,
  "name": "Fundação",
  "isDefault": true,
  "active": false
}
```

### Rules

- Inactive stage must not appear as default option in new expenses.
- Old expenses remain associated with the stage.
- No physical deletion in MVP.
- Current stage should not be deactivated before changing the construction current stage.

# Expenses

## POST /api/expenses

Creates an expense in the current construction.

### Request

```json
{
  "amount": 330.0,
  "categoryId": 1,
  "stageId": 1,
  "description": "Locação container"
}
```

### Response

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

### Rules

- `amount` is required.
- `amount` must be greater than zero.
- `categoryId` is required.
- `stageId` is required.
- `description` is optional.
- Category must belong to current construction.
- Stage must belong to current construction.
- `occurredAt` is set by backend.
- Expense starts with `deleted=false`.

## GET /api/expenses

Lists expenses from current construction.

### Query params

```txt
page=0
size=20
sort=occurredAt,desc
dateFrom=2026-04-01
dateTo=2026-04-30
categoryId=1
stageId=1
description=cimento
minAmount=100
maxAmount=1000
```

### Response

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

### Supported filters

```txt
dateFrom
dateTo
categoryId
stageId
description
minAmount
maxAmount
```

### Supported sorts

```txt
occurredAt
amount
description
category
stage
createdAt
```

### Rules

- List only current construction expenses.
- Ignore `deleted=true`.
- Pagination is required.
- Default sort: `occurredAt,desc`.

## GET /api/expenses/{id}

Returns one expense.

### Response

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
  "createdAt": "2026-04-25T18:30:00Z",
  "updatedAt": "2026-04-25T18:30:00Z"
}
```

### Rules

- Expense must belong to current construction.
- Deleted expense should not be returned in normal flow.

## PUT /api/expenses/{id}

Updates an expense.

### Request

```json
{
  "amount": 397.0,
  "categoryId": 1,
  "stageId": 2,
  "description": "2 vigas vãos cozinha"
}
```

### Response

```json
{
  "id": 1,
  "amount": 397.0,
  "description": "2 vigas vãos cozinha",
  "category": {
    "id": 1,
    "name": "Material"
  },
  "stage": {
    "id": 2,
    "name": "Estrutura"
  },
  "occurredAt": "2026-04-25T18:30:00Z",
  "updatedAt": "2026-04-25T19:00:00Z"
}
```

### Rules

- `amount` is required.
- `amount` must be greater than zero.
- `categoryId` is required.
- `stageId` is required.
- `description` is optional.
- Category and stage must belong to current construction.
- `occurredAt` is not editable in MVP.

## DELETE /api/expenses/{id}

Logically deletes an expense.

### Response

```json
{
  "id": 1,
  "deleted": true
}
```

### Rules

- Logical deletion only.
- Backend sets `deleted=true`.
- Deleted expenses do not appear in listings.
- Deleted expenses do not enter dashboard calculations.

# Dashboard

## GET /api/dashboard

Returns dashboard data for current construction.

### Query params

```txt
period=MONTH
period=LAST_30_DAYS
period=ALL
```

Authenticated default:

```txt
MONTH
```

### Response

```json
{
  "period": "MONTH",
  "monthSpent": 3628.0,
  "totalSpent": 87516.67,
  "averageTicket": 483.73,
  "mainCategory": {
    "id": 1,
    "name": "Material",
    "amount": 29881.38,
    "percentage": 71.2
  },
  "mainStage": {
    "id": 1,
    "name": "Fundação",
    "amount": 12000.0,
    "percentage": 45.5
  },
  "currentVsPreviousMonth": {
    "currentMonthAmount": 3628.0,
    "previousMonthAmount": 14242.0,
    "differenceAmount": -10614.0,
    "differencePercentage": -74.52
  },
  "byCategory": [
    {
      "categoryId": 1,
      "categoryName": "Material",
      "amount": 29881.38,
      "percentage": 71.2
    }
  ],
  "byStage": [
    {
      "stageId": 1,
      "stageName": "Fundação",
      "amount": 12000.0,
      "percentage": 45.5
    }
  ],
  "monthlyEvolution": [
    {
      "month": "2026-01",
      "amount": 15585.88
    }
  ],
  "latestExpenses": [
    {
      "id": 10,
      "amount": 330.0,
      "description": "Locação container",
      "categoryName": "Ferramentas",
      "stageName": "Fundação",
      "occurredAt": "2026-04-25T18:30:00Z"
    }
  ],
  "topExpenses": [
    {
      "id": 5,
      "amount": 6100.0,
      "description": "Tijolos + canaletas",
      "categoryName": "Material",
      "stageName": "Alvenaria",
      "occurredAt": "2026-04-25T18:30:00Z"
    }
  ]
}
```

### Rules

- Dashboard uses current construction.
- Authenticated default period is `MONTH`.
- `totalSpent` always represents total construction spending, regardless of selected period.
- `monthSpent` represents current month spending.
- `byCategory`, `byStage`, `latestExpenses`, `topExpenses`, and `monthlyEvolution` respect the selected period.
- `latestExpenses` returns max 5 items.
- `topExpenses` returns max 5 items.
- Ignore `deleted=true`.

# Share link

## GET /api/share-link

Returns current share link information.

### Response when active

```json
{
  "active": true,
  "token": "xYz-abc-123-token",
  "url": "https://app.com/public/dashboard/xYz-abc-123-token",
  "createdAt": "2026-04-25T18:30:00Z",
  "disabledAt": null
}
```

### Response when missing or inactive

```json
{
  "active": false,
  "token": null,
  "url": null,
  "createdAt": null,
  "disabledAt": null
}
```

## POST /api/share-link

Creates or returns an active public dashboard link.

### Response

```json
{
  "active": true,
  "token": "xYz-abc-123-token",
  "url": "https://app.com/public/dashboard/xYz-abc-123-token",
  "createdAt": "2026-04-25T18:30:00Z"
}
```

### Rules

- If an active link already exists, endpoint may return it.
- Token must be hard to guess.
- Token must not expose sequential IDs.

## DELETE /api/share-link

Disables current public link.

### Response

```json
{
  "active": false,
  "disabledAt": "2026-04-25T19:00:00Z"
}
```

## POST /api/share-link/regenerate

Regenerates public link.

### Response

```json
{
  "active": true,
  "token": "new-token-456",
  "url": "https://app.com/public/dashboard/new-token-456",
  "createdAt": "2026-04-25T19:10:00Z",
  "regeneratedAt": "2026-04-25T19:10:00Z"
}
```

### Rules

- Old token becomes invalid.
- New token becomes the only valid public link token.

# Public dashboard

## GET /api/public/dashboard/{token}

Returns public dashboard data.

### Query params

```txt
period=MONTH
period=LAST_30_DAYS
period=ALL
```

Public default:

```txt
ALL
```

### Response

Same structure as:

```txt
GET /api/dashboard
```

### Rules

- Does not require login.
- Token must exist and be active.
- Public dashboard is read-only.
- Public dashboard shows same dashboard information.
- Public default period is `ALL`.
