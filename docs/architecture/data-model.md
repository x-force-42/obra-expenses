# Data Model

## Overview

The MVP data model contains these main entities:

```txt
User
Construction
Category
Stage
Expense
ShareLink
```

## Relationship summary

```txt
User 1 ── N Construction

Construction 1 ── N Category
Construction 1 ── N Stage
Construction 1 ── N Expense
Construction 1 ── 0..1 ShareLink

Construction N ── 1 Stage as currentStage

Expense N ── 1 Category
Expense N ── 1 Stage
```

In product language:

- A user owns constructions.
- A construction has categories.
- A construction has stages.
- A construction has a current stage.
- A construction has expenses.
- An expense belongs to a category and a stage.
- A construction may have a public share link.

## Entity: User

Represents the construction owner.

### Table

```txt
users
```

### Fields

```txt
id
google_subject
name
email
picture_url
created_at
updated_at
```

### Rules

- User is created automatically on first successful Google login.
- `google_subject` must be unique.
- `email` should be unique.
- There is no password in the MVP.
- There is no email/password login in the MVP.

### Recommended constraints

```txt
unique google_subject
unique email
not null google_subject
not null email
not null name
```

## Entity: Construction

Represents a construction project.

### Table

```txt
constructions
```

### Fields

```txt
id
owner_id
name
current_stage_id
created_at
updated_at
```

### Rules

- A new user receives one default construction.
- Default construction name: `Minha obra`.
- Initial current stage: `Fundação`.
- The frontend MVP can focus only on the current/default construction.
- The model must support multiple constructions in the future.

### Relationships

```txt
owner_id -> users.id
current_stage_id -> stages.id
```

### Recommended constraints

```txt
not null owner_id
not null name
```

The `current_stage_id` may need to be nullable during initial creation because stages are created after the construction row. It must be set after default stages are created.

## Entity: Category

Represents an expense category.

### Table

```txt
categories
```

### Fields

```txt
id
construction_id
name
is_default
active
created_at
updated_at
```

### Default categories

```txt
Material
Mão de Obra
Ferramentas
Documentação/Taxas
Outros
```

### Rules

- Categories belong to a construction.
- Default categories are created automatically for a new construction.
- User can add and edit categories.
- Category is required for expenses.
- Categories should be deactivated instead of physically deleted.
- Inactive categories must not appear as default options for new expenses.
- Old expenses remain associated with inactive categories.

### Relationships

```txt
construction_id -> constructions.id
```

### Recommended constraints

```txt
not null construction_id
not null name
not null is_default
not null active
unique construction_id + name
```

## Entity: Stage

Represents a construction stage.

### Table

```txt
stages
```

### Fields

```txt
id
construction_id
name
is_default
active
created_at
updated_at
```

### Default stages

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

### Rules

- Stages belong to a construction.
- Default stages are created automatically for a new construction.
- User can add and edit stages.
- Stage is required for expenses.
- A construction has a current stage.
- The current stage is used as default when creating a new expense.
- Stages should be deactivated instead of physically deleted.
- Inactive stages must not appear as default options for new expenses.
- Old expenses remain associated with inactive stages.
- The current stage should not be deactivated before changing the construction current stage.

### Relationships

```txt
construction_id -> constructions.id
```

### Recommended constraints

```txt
not null construction_id
not null name
not null is_default
not null active
unique construction_id + name
```

## Entity: Expense

Represents a real expense that already happened.

### Table

```txt
expenses
```

### Fields

```txt
id
construction_id
category_id
stage_id
amount
description
occurred_at
deleted
created_at
updated_at
```

### Rules

- Expense belongs to a construction.
- Expense belongs to a category.
- Expense belongs to a stage.
- `amount` is required.
- `amount` must be greater than zero.
- `category_id` is required.
- `stage_id` is required.
- `description` is optional.
- `occurred_at` is automatically set by the backend.
- `deleted` starts as `false`.
- Deletion is logical.
- Deleted expenses must not appear in normal listings.
- Deleted expenses must not be included in dashboard calculations.
- Payment method is out of scope.
- Receipt/image upload is out of scope.
- Long observation is out of scope.

### Relationships

```txt
construction_id -> constructions.id
category_id -> categories.id
stage_id -> stages.id
```

### Recommended Java types

```txt
amount: BigDecimal
occurredAt: Instant
deleted: Boolean
```

### Recommended constraints

```txt
not null construction_id
not null category_id
not null stage_id
not null amount
amount > 0
not null occurred_at
not null deleted
```

## Entity: ShareLink

Represents the public dashboard link for a construction.

### Table

```txt
share_links
```

### Fields

```txt
id
construction_id
token
active
created_at
disabled_at
regenerated_at
```

### Rules

- Share link belongs to a construction.
- Public dashboard does not require login.
- Public dashboard is read-only.
- Public dashboard opens with period `ALL`.
- Token must be hard to guess.
- Token must not be based on sequential construction IDs.
- Owner can disable the link.
- Owner can regenerate the link.
- Regenerating the link invalidates the previous token.

### Relationships

```txt
construction_id -> constructions.id
```

### Recommended constraints

```txt
unique construction_id
unique token
not null construction_id
not null token
not null active
```

## Indexes

Recommended indexes for the MVP:

```txt
users.google_subject unique
users.email unique

constructions.owner_id

categories.construction_id
categories.construction_id + name unique

stages.construction_id
stages.construction_id + name unique

expenses.construction_id
expenses.category_id
expenses.stage_id
expenses.occurred_at
expenses.deleted
expenses.construction_id + occurred_at
expenses.construction_id + deleted

share_links.token unique
share_links.construction_id unique
```

## Notes about ownership validation

Every authenticated operation must be scoped by the current user.

For example:

- A user must not access another user's construction.
- A user must not create an expense using another construction's category.
- A user must not create an expense using another construction's stage.
- A user must not update another user's expense.
- A user must not delete another user's expense.

Ownership validation belongs in the backend.

## Notes about historical data

Renaming a category or stage changes how old expenses display that name.

This is acceptable for the MVP.

Future versions may introduce snapshot fields if preserving historical labels becomes necessary.
