# Prompt 001: Bootstrap project

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
docs/architecture/testing-strategy.md
docs/tasks/001-bootstrap-project.md
```

## Task

Implement `docs/tasks/001-bootstrap-project.md`.

Create the initial monorepo structure for the project.

## Important rules

Do not implement business features yet.

Do not implement Google login behavior yet.

Do not implement expense creation yet.

Do not implement dashboard yet.

Do not implement AWS deployment or GitHub Actions yet.

This task is only for bootstrapping the project structure and tooling.

## Expected result

The repository must have:

```txt
frontend/
backend/
docs/
infra/
docker-compose.yml
AGENTS.md
README.md
```

The frontend must be created with:

```txt
React
TypeScript
Vite
Vitest
React Testing Library
TailwindCSS
shadcn/ui
TanStack Query
React Router
MSW
```

The backend must be created with:

```txt
Java
Spring Boot
PostgreSQL
Flyway
Spring Data JPA
Bean Validation
JUnit 5
Spring Boot Test
MockMvc
Testcontainers PostgreSQL
```

Local PostgreSQL must be available through Docker Compose.

## Validation

After implementation, run or document how to run:

```bash
cd backend
./mvnw test
```

```bash
cd frontend
npm install
npm run test
npm run build
```

```bash
docker compose up -d postgres
```

## Final response

When done, summarize:

1. What was created
2. Commands executed
3. Tests/build result
4. Any issue or assumption
5. Files that deserve human review
