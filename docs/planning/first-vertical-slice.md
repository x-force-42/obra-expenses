# First Vertical Slice

## Purpose

The first vertical slice must prove that the core product can work end to end.

It must not implement the full MVP.

It must create the first usable path:

```txt
Google login
→ user creation
→ default construction creation
→ default categories and stages
→ simple expense creation
→ expense listing
→ initial automated tests
```

This slice exists before AWS deployment.

AWS, CI/CD, and production delivery must come after this slice is working locally.

## Why this slice comes first

The project goal is to experience AI-assisted development with a real software engineering workflow.

Deploying an empty project first would not provide useful CI/CD feedback.

The first slice must create real product behavior, so that tests, CI, and deployment can validate something meaningful.

## Included user stories

The first vertical slice includes:

- US-001: Create initial repository structure
- US-002: Create AI agent documentation
- US-003: Create initial product documentation
- US-004: Google login
- US-005: Create user on first access
- US-006: Reuse existing user
- US-007: Create default construction
- US-008: Define initial current stage
- US-009: Use default construction as current construction
- US-010: Create default categories
- US-011: Create default stages
- US-014: Create simple expense
- US-018: List current construction expenses
- US-022: Test user creation on first login
- US-023: Test default construction creation
- US-024: Test expense creation
- US-025: Test paginated expense listing

## Not included in the first vertical slice

The first slice must not include:

- AWS deployment
- CI/CD
- dashboard charts
- public sharing
- category management screens
- stage management screens
- expense editing UI
- expense deletion UI
- receipt upload
- long observations
- payment method
- native mobile app

## Backend scope

The backend must implement:

### Auth

- Accept a Google credential/token from the frontend
- Validate or isolate Google validation behind a service abstraction
- Create or reuse the user
- Create default construction when needed
- Create default categories when needed
- Create default stages when needed
- Return an application JWT

### Construction

- Return the current/default construction

### Category

- Return active categories for the current construction

### Stage

- Return active stages for the current construction

### Expense

- Create a simple expense
- List expenses with pagination
- Support initial filters and sorting at API level
- Exclude logically deleted expenses

## Frontend scope

The frontend must implement:

### Auth UI

- Login page with Google login entry point
- Store application JWT after successful backend auth
- Redirect authenticated user to dashboard or expenses page

### Expense creation

- Expense form with:
  - amount
  - category
  - stage
  - optional short description

### Expense listing

- Basic list of expenses
- Empty state when no expenses exist

### API mocking

- Use MSW from the beginning
- MSW handlers must reflect the API contracts
- Frontend tests must use MSW for API behavior

## Database scope

The first slice must include Flyway migrations for:

- users
- constructions
- categories
- stages
- expenses

The `share_links` table may be added later with the sharing epic.

## Testing scope

### Backend tests

Required tests:

- creates user on first login
- reuses existing user
- creates default construction for a new user
- creates default categories
- creates default stages
- creates a valid expense
- rejects expense with missing or invalid amount
- rejects category from another construction
- rejects stage from another construction
- lists expenses paginated
- excludes deleted expenses from normal listings

### Frontend tests

Required tests:

- login page renders Google login action
- expense form renders amount, category, stage, and description
- expense form allows empty description
- expense form requires amount
- expense form submits valid data
- expenses page renders empty state
- expenses page renders API expenses using MSW

## Definition of Done

The first vertical slice is done when:

- Monorepo structure exists
- Backend starts locally
- Frontend starts locally
- PostgreSQL runs through Docker Compose
- Flyway migrations run successfully
- Google auth flow is structurally implemented
- User creation/reuse works
- Default construction creation works
- Default categories and stages creation works
- Expense creation works
- Expense listing works
- Backend tests pass
- Frontend tests pass
- MSW handlers exist and match the documented API contracts
- Documentation remains aligned with implementation

## Suggested implementation order

1. Create monorepo structure
2. Create backend Spring Boot project
3. Configure PostgreSQL with Docker Compose
4. Configure Flyway
5. Create database migrations
6. Create domain entities
7. Create repositories
8. Create auth service abstraction
9. Implement first-login flow
10. Implement current construction endpoint
11. Implement categories endpoint
12. Implement stages endpoint
13. Implement expense creation endpoint
14. Implement expense listing endpoint
15. Add backend tests
16. Create frontend Vite project
17. Configure TailwindCSS and shadcn/ui
18. Configure TanStack Query
19. Configure MSW
20. Create auth page
21. Create expense form
22. Create expenses list
23. Add frontend tests
24. Review docs and update anything that changed

## Agent instruction for this slice

When implementing this slice, do not implement features outside this file.

Do not implement AWS deployment yet.

Do not implement dashboard charts yet.

Do not implement public sharing yet.

Focus on a small working product path with tests.
