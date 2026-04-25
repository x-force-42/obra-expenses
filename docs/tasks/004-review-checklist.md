# Task 004: Review checklist

## Purpose

Use this checklist to review AI-generated changes before accepting a PR.

The goal is to prevent the agent from silently expanding scope, breaking architecture, or creating brittle code.

## Required reading before review

Compare the PR against:

```txt
AGENTS.md
docs/product/requirements.md
docs/product/out-of-scope.md
docs/planning/first-vertical-slice.md
docs/architecture/overview.md
docs/architecture/data-model.md
docs/architecture/api-contracts.md
docs/architecture/testing-strategy.md
```

## Scope checklist

- [ ] The PR implements only the requested task.
- [ ] The PR does not implement out-of-scope features.
- [ ] The PR does not add unnecessary libraries.
- [ ] The PR does not change architectural decisions without an ADR update.
- [ ] The PR does not implement AWS/CI/CD before the first vertical slice.
- [ ] The PR does not add upload, payment method, long observations, budget, or notifications.

## Security checklist

- [ ] No secrets are committed.
- [ ] No real credentials are committed.
- [ ] `.env.example` uses placeholders only.
- [ ] Backend validates ownership of resources.
- [ ] Authenticated endpoints require JWT.
- [ ] Public endpoints expose only intended data.
- [ ] Public tokens are not sequential IDs.
- [ ] User identity is not trusted only from frontend data.

## Backend checklist

- [ ] Code follows modular monolith by domain.
- [ ] Backend package follows `br.com.obraexpenses`.
- [ ] Domain logic is not placed randomly in controllers.
- [ ] DTOs are used for API requests/responses.
- [ ] Entities are not exposed directly as API responses.
- [ ] Flyway migration exists for schema changes.
- [ ] PostgreSQL compatibility is respected.
- [ ] Money uses `BigDecimal`.
- [ ] Dates use `Instant` or another explicit time type.
- [ ] Expense deletion is logical.
- [ ] Deleted expenses are excluded from normal listings.
- [ ] Category/stage ownership is validated.
- [ ] Expense ownership is validated.

## Frontend checklist

- [ ] Code follows feature-based architecture.
- [ ] Remote data uses TanStack Query.
- [ ] Auth/session uses simple Context.
- [ ] Redux was not added.
- [ ] API calls are placed in feature API modules.
- [ ] Generic UI components do not contain business-specific HTTP calls.
- [ ] MSW handlers match API contracts.
- [ ] UI remains mobile first.
- [ ] Expense form remains minimal.
- [ ] Description remains optional.
- [ ] Payment method/upload/long observation were not added.

## API checklist

- [ ] API endpoints match `docs/architecture/api-contracts.md`.
- [ ] Response shapes match docs.
- [ ] Error responses are consistent.
- [ ] Pagination shape is consistent.
- [ ] Sorting and filters are implemented as documented.
- [ ] API docs were updated if contracts changed.
- [ ] Frontend types were updated if contracts changed.
- [ ] MSW handlers were updated if contracts changed.

## Testing checklist

- [ ] Backend tests were added or updated.
- [ ] Frontend tests were added or updated when UI behavior changed.
- [ ] Testcontainers PostgreSQL is used for backend integration tests.
- [ ] H2 was not introduced.
- [ ] MSW is used for frontend API behavior.
- [ ] Tests cover business behavior, not only implementation details.
- [ ] Bug fixes include regression tests.
- [ ] Tests were not removed to make the build pass.

## Documentation checklist

- [ ] Documentation remains accurate.
- [ ] Requirements were updated if behavior changed.
- [ ] API contracts were updated if endpoints changed.
- [ ] Data model was updated if schema changed.
- [ ] ADR was added or updated if architecture changed.
- [ ] First vertical slice doc still matches implementation status.

## Local validation checklist

Backend:

```bash
cd backend
./mvnw test
```

Frontend:

```bash
cd frontend
npm run test
npm run build
```

Docker:

```bash
docker compose up -d postgres
```

## PR description checklist

The PR description should include:

```md
# Descrição

## Tipo de mudança

- [ ] Bugfix
- [ ] Feature
- [ ] Improvement
- [ ] Refactor
- [ ] Documentation

## Breaking change

- [ ] Sim
- [ ] Não

## Como testar

## Checklist

- [ ] Testes adicionados/atualizados
- [ ] Testes passando
- [ ] Build passando
- [ ] Documentação atualizada
- [ ] Sem secrets no código
- [ ] Self-review realizado
```

## Reviewer questions

Ask these before approving:

1. Did the agent solve the requested task or wander into extra features?
2. Did the implementation respect the architecture?
3. Did the API remain aligned with the contract?
4. Did tests prove the important behavior?
5. Did the code become harder to understand?
6. Did any out-of-scope MVP item sneak in?
7. Would this PR be safe to build on top of?

## Final approval rule

Do not approve a PR only because it compiles.

Approve only when:

```txt
behavior is correct
scope is respected
tests are meaningful
architecture is preserved
docs are aligned
```
