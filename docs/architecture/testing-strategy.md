# Testing Strategy

## Goal

The test strategy must support AI-assisted development, TDD, and future CI/CD.

Tests should protect business behavior and API contracts without making the MVP heavy.

The project must prefer useful tests over ceremonial coverage.

## Test pyramid

Recommended test balance:

```txt
        E2E
       few, later

 Frontend component/integration tests
        some

 Backend service/API/integration tests
        many
```

Backend tests are the highest priority because most business rules live there.

Frontend tests must cover user-visible behavior and interactions.

E2E tests should come after the first functional delivery.

## Backend testing stack

Use:

- JUnit 5
- Spring Boot Test
- MockMvc
- Testcontainers PostgreSQL
- AssertJ

Do not use H2 for integration tests.

PostgreSQL behavior must be tested against PostgreSQL.

## Backend test types

### Service tests

Use service tests for business rules.

Important service tests:

```txt
AuthServiceTest
ConstructionServiceTest
ExpenseServiceTest
DashboardServiceTest
CategoryServiceTest
StageServiceTest
ShareLinkServiceTest
```

Service tests should cover:

- creating user on first login
- reusing existing user
- creating default construction
- creating default categories
- creating default stages
- validating expense amount
- validating category ownership
- validating stage ownership
- logical expense deletion
- excluding deleted expenses from dashboard
- generating public share token
- disabling public share token
- regenerating public share token

### Controller/API tests

Use controller/API tests for HTTP contracts.

Important controller tests:

```txt
AuthControllerTest
ExpenseControllerTest
DashboardControllerTest
CategoryControllerTest
StageControllerTest
ShareLinkControllerTest
PublicDashboardControllerTest
```

Controller tests should cover:

- request validation
- response format
- HTTP status codes
- authentication requirements
- ownership restrictions
- pagination response shape
- dashboard response shape

### Repository tests

Repository tests are only required for custom queries.

Use repository tests for:

- dynamic expense filters
- sorting
- dashboard aggregations
- category totals
- stage totals
- monthly evolution
- top expenses

Do not write repository tests for simple Spring Data methods unless behavior is custom or critical.

## First backend test suite

The first vertical slice must include backend tests for:

```txt
creates user on first Google login
reuses existing user
creates default construction
creates default categories
creates default stages
does not duplicate default data on repeated login
creates valid expense
rejects expense without amount
rejects expense with zero or negative amount
rejects category from another construction
rejects stage from another construction
lists expenses paginated
excludes deleted expenses from normal listings
```

## Backend TDD guidance

Use TDD mainly for backend business rules.

Recommended cycle:

```txt
write behavior test
run test and see it fail
implement minimum code
run test and see it pass
refactor
```

Good first TDD targets:

- first-login user creation
- default construction creation
- default categories and stages creation
- expense creation validation
- expense ownership validation
- expense listing filters

## Frontend testing stack

Use:

- Vitest
- React Testing Library
- MSW

MSW must be used from the beginning.

## MSW strategy

MSW handlers must reflect the API contracts documented in:

```txt
docs/architecture/api-contracts.md
```

Recommended structure:

```txt
frontend/src/
└── mocks/
    ├── handlers.ts
    ├── server.ts
    ├── browser.ts
    └── data/
        ├── auth.mock.ts
        ├── construction.mock.ts
        ├── categories.mock.ts
        ├── stages.mock.ts
        ├── expenses.mock.ts
        └── dashboard.mock.ts
```

Use MSW in tests and optionally during local frontend development.

Recommended environment flag:

```txt
VITE_ENABLE_MSW=true
```

Rules:

- API contract changes must update MSW handlers.
- Mock response shapes must match `api-contracts.md`.
- Tests should prefer user-visible behavior over implementation details.

## Frontend test types

### Component tests

Use for forms, cards, lists, and dashboard components.

Examples:

```txt
ExpenseForm.test.tsx
ExpenseList.test.tsx
DashboardPage.test.tsx
LoginPage.test.tsx
```

### Feature integration tests

Use when a component calls API hooks and depends on server response.

MSW should mock the API response.

Examples:

- expenses page loads expenses from API
- expense form submits data successfully
- dashboard renders cards from API data
- empty state is shown when no expenses exist

## First frontend test suite

The first vertical slice must include frontend tests for:

```txt
login page renders Google login action
expense form renders amount, category, stage, and description
expense form allows empty description
expense form requires amount
expense form submits valid data
expenses page renders empty state
expenses page renders mocked API expenses using MSW
```

## E2E testing

Do not add Playwright in the first implementation.

Add E2E only after the first functional delivery is stable.

Future first E2E scenario:

```txt
user logs in
creates an expense
sees expense in listing
sees dashboard updated
```

Recommended future tool:

```txt
Playwright
```

## CI testing

When CI is configured, it must run at least:

### Backend

```txt
./mvnw test
```

### Frontend

```txt
npm install
npm run test
npm run build
```

Later, add:

```txt
lint
typecheck
docker build
```

Minimum initial CI goal:

```txt
test + build
```

## Testing rules for agents

Agents must follow these rules:

- Every new backend business rule must have automated tests.
- Every API contract change must have controller/API tests.
- Every bug fix must include a test that reproduces the bug.
- Frontend interaction logic must have tests.
- MSW handlers must be updated when API contracts change.
- Do not replace Testcontainers PostgreSQL with H2.
- Do not remove tests to make a task pass.
- If a test is wrong, explain why and update it carefully.
- Prefer testing behavior over implementation details.

## Definition of Done for tests

A task involving backend code is not done until:

- relevant backend tests exist
- backend tests pass
- validations are covered
- ownership rules are covered when applicable

A task involving frontend code is not done until:

- relevant frontend tests exist
- MSW is updated when API interaction changes
- frontend tests pass
- frontend build passes

A task involving API changes is not done until:

- API docs are updated
- MSW handlers are updated
- backend tests are updated
- frontend types are updated
