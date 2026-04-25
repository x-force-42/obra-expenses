# Task 003: First vertical slice frontend

## Goal

Implement the frontend part of the first vertical slice.

The frontend must support:

```txt
login entry point
→ authenticated session storage
→ current construction context
→ categories and stages loading
→ simple expense form
→ expense listing
→ MSW mocks
→ initial frontend tests
```

## Read before implementing

Read:

```txt
AGENTS.md
docs/product/requirements.md
docs/product/backlog.md
docs/planning/first-vertical-slice.md
docs/architecture/overview.md
docs/architecture/api-contracts.md
docs/architecture/auth-flow.md
docs/architecture/testing-strategy.md
docs/architecture/decisions/ADR-002-frontend-stack.md
```

## Scope

Implement only frontend behavior for the first vertical slice.

## Not in scope

Do not implement:

- dashboard charts
- public dashboard
- share link management
- category management screens
- stage management screens
- expense editing UI
- expense deletion UI
- AWS deployment
- E2E tests
- upload
- payment method
- long observations

## Required frontend stack

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

## Required structure

Use or create:

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
│   └── ExpensesPage/
│
├── features/
│   ├── auth/
│   ├── expenses/
│   ├── categories/
│   └── stages/
│
├── shared/
│   ├── components/
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

## API modules

Create API clients/types for:

```txt
features/auth/api/authApi.ts
features/categories/api/categoriesApi.ts
features/stages/api/stagesApi.ts
features/expenses/api/expensesApi.ts
```

Use the contracts from:

```txt
docs/architecture/api-contracts.md
```

## MSW

MSW must be configured from the beginning.

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

Recommended structure:

```txt
frontend/src/mocks/
├── handlers.ts
├── server.ts
├── browser.ts
└── data/
    ├── auth.mock.ts
    ├── construction.mock.ts
    ├── categories.mock.ts
    ├── stages.mock.ts
    └── expenses.mock.ts
```

Mock responses must match `docs/architecture/api-contracts.md`.

## Auth frontend behavior

Implement a simple auth/session layer.

Recommended:

```txt
AuthContext
useAuth
```

Auth state should include:

```txt
accessToken
user
currentConstruction
isAuthenticated
```

For the MVP, token can be stored in localStorage.

## Login page

Create a login page with a clear Google login action.

The actual Google SDK integration may be structurally prepared.

For local development/testing, MSW may simulate the auth response.

After successful login:

```txt
store application JWT
store user/current construction state
redirect to ExpensesPage or DashboardPage
```

For the first slice, redirecting to expenses page is acceptable if dashboard is not implemented yet.

## Expense form

Create an expense form with:

```txt
amount
category
stage
description
submit button
```

Rules:

- amount is required
- amount must be greater than zero
- category is required
- stage is required
- description is optional
- no payment method
- no upload
- no long observation

The stage should default to the current construction current stage when available.

## Expense listing

Create a basic expenses page with:

```txt
expense form
expense list
empty state
```

Expense list item should show:

```txt
amount
description
category name
stage name
occurredAt
```

Keep mobile-first layout.

## Styling

Use TailwindCSS and shadcn/ui.

Keep UI simple.

Prioritize:

```txt
large tap targets
clear amount input
simple cards
mobile-first spacing
fast registration flow
```

## Required frontend tests

Use:

```txt
Vitest
React Testing Library
MSW
```

Required tests:

```txt
login page renders Google login action
expense form renders amount, category, stage, and description
expense form allows empty description
expense form requires amount
expense form submits valid data
expenses page renders empty state
expenses page renders mocked API expenses using MSW
```

## Suggested implementation order

1. Configure providers.
2. Configure router.
3. Configure TanStack Query.
4. Configure MSW for tests.
5. Configure optional MSW for local dev.
6. Create auth types and API module.
7. Create auth context.
8. Create login page.
9. Create category types and API module.
10. Create stage types and API module.
11. Create expense types and API module.
12. Create expense form.
13. Create expense list.
14. Create expenses page.
15. Add frontend tests.
16. Run tests and build.

## Validation commands

```bash
cd frontend
npm run test
npm run build
```

## Definition of Done

This frontend task is done when:

- frontend starts locally
- MSW is configured
- auth page exists
- expense form exists
- expense list exists
- categories and stages are loaded from API/MSW
- expense creation calls API/MSW
- expense listing calls API/MSW
- required tests exist
- tests pass
- build passes
- no out-of-scope feature was implemented
