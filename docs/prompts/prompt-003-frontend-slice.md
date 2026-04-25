# Prompt 003: First vertical slice frontend

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
docs/architecture/api-contracts.md
docs/architecture/auth-flow.md
docs/architecture/testing-strategy.md
docs/architecture/decisions/ADR-002-frontend-stack.md
docs/tasks/003-first-vertical-slice-frontend.md
```

## Task

Implement `docs/tasks/003-first-vertical-slice-frontend.md`.

Build the frontend part of the first vertical slice.

## Scope

Implement:

```txt
login entry point
auth/session context
API modules
MSW handlers
current construction loading
categories loading
stages loading
simple expense form
expense listing
initial frontend tests
```

## Important rules

Use:

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

Do not use Redux.

Do not implement dashboard charts yet.

Do not implement public dashboard yet.

Do not implement share link management yet.

Do not implement upload, payment method, long observations, budget, notifications, or native app features.

## Required API modules

Create or update:

```txt
features/auth/api/authApi.ts
features/categories/api/categoriesApi.ts
features/stages/api/stagesApi.ts
features/expenses/api/expensesApi.ts
```

API types must match:

```txt
docs/architecture/api-contracts.md
```

## Required MSW handlers

Create handlers for:

```txt
POST /api/auth/google
GET  /api/auth/me
GET  /api/constructions/current
GET  /api/categories
GET  /api/stages
POST /api/expenses
GET  /api/expenses
```

Mock responses must match:

```txt
docs/architecture/api-contracts.md
```

## Required UI

Create a simple mobile-first flow:

```txt
Login page
→ authenticated state
→ expenses page
→ expense form
→ expense list
```

The expense form must include:

```txt
amount
category
stage
description
submit button
```

Rules:

```txt
amount required
amount greater than zero
category required
stage required
description optional
stage defaults to current construction current stage when available
```

## Required tests

Implement frontend tests for:

```txt
login page renders Google login action
expense form renders amount, category, stage, and description
expense form allows empty description
expense form requires amount
expense form submits valid data
expenses page renders empty state
expenses page renders mocked API expenses using MSW
```

## Validation

Run:

```bash
cd frontend
npm run test
npm run build
```

## Final response

When done, summarize:

1. What screens/components were implemented
2. What API modules were created
3. What MSW handlers were created
4. What tests were added
5. Test/build results
6. Any contract mismatch found
7. Any file that deserves human review
