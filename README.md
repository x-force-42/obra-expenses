# Obra Expenses

Mobile-first MVP for managing construction expenses.

The product helps a construction owner register expenses quickly and understand where the money is going through a simple dashboard.

## Product goal

The main goal is to replace the friction of controlling construction expenses in a spreadsheet.

Instead of opening Excel and manually maintaining rows, the user should be able to:

1. Open the app on a phone
2. Register an expense quickly
3. See financial insights in a dashboard

## Target user

The primary user is the owner of a personal construction project.

The MVP is not designed for construction companies, teams, accountants, or multiple collaborators.

## MVP scope

The MVP includes:

- Google login
- Automatic user creation
- Automatic default construction creation
- Default construction named `Minha obra`
- Initial current stage `Fundação`
- Expense creation
- Expense editing
- Expense deletion
- Expense listing with backend pagination, filters, and sorting
- Default categories
- Default stages
- Custom categories and stages
- Dashboard with financial indicators
- Public read-only dashboard link

## Out of scope

The MVP does not include:

- Receipt/image upload
- Long observations
- Payment method
- Planned budget
- Accounts payable
- Multiple editors
- Complex permissions
- Export to PDF/Excel
- Notifications
- Native mobile app
- Banking integration
- AI-generated analysis

See:

```txt
docs/product/out-of-scope.md
```

## Tech stack

### Frontend

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

### Backend

- Java
- Spring Boot
- PostgreSQL
- Flyway
- Spring Data JPA
- Bean Validation
- JUnit 5
- MockMvc
- Testcontainers PostgreSQL

### Infrastructure direction

Initial production direction:

- Frontend: AWS S3 + CloudFront
- Backend: AWS EC2 with Docker
- Database: AWS RDS PostgreSQL
- Bucket: AWS S3
- CI/CD: GitHub Actions

AWS deployment is planned after the first functional vertical slice.

## Repository structure

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

## Documentation

Important documents:

```txt
docs/product/requirements.md
docs/product/backlog.md
docs/product/out-of-scope.md
docs/planning/first-vertical-slice.md
docs/architecture/overview.md
docs/architecture/data-model.md
docs/architecture/api-contracts.md
docs/architecture/auth-flow.md
docs/architecture/testing-strategy.md
```

## Development workflow

This project follows a spec-driven AI-assisted development workflow.

The AI agent must read:

```txt
AGENTS.md
docs/
```

before implementing tasks.

The intended flow is:

```txt
requirements
→ planning
→ architecture
→ small implementation task
→ tests
→ PR
→ CI/CD
→ deploy
```

## First vertical slice

The first implementation target is:

```txt
Google login
→ create/reuse user
→ create default construction
→ create default categories and stages
→ create simple expense
→ list expenses
→ add initial tests
```

See:

```txt
docs/planning/first-vertical-slice.md
```
