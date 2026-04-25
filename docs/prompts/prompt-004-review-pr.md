# Prompt 004: Review PR

You are reviewing a PR for the `obra-expenses` project.

Before reviewing, read:

```txt
AGENTS.md
README.md
docs/product/requirements.md
docs/product/out-of-scope.md
docs/planning/first-vertical-slice.md
docs/architecture/overview.md
docs/architecture/data-model.md
docs/architecture/api-contracts.md
docs/architecture/testing-strategy.md
docs/tasks/004-review-checklist.md
```

## Review goal

Review the PR for:

```txt
scope control
architecture alignment
API contract alignment
test quality
security
MVP discipline
documentation consistency
```

Do not only check whether the code compiles.

Check whether the change respects the product and architecture.

## Review checklist

Use:

```txt
docs/tasks/004-review-checklist.md
```

## Things to watch carefully

### Scope creep

Reject or flag if the PR implements:

```txt
upload
payment method
long observations
planned budget
notifications
native app
AI analysis
spreadsheet import
AWS deployment before first vertical slice
```

unless the task explicitly asked for it.

### Backend

Check:

```txt
modular monolith by domain
DTOs for request/response
no entity exposure as API response
Flyway migration for schema changes
PostgreSQL compatibility
BigDecimal for money
logical deletion for expenses
ownership validation
Testcontainers PostgreSQL
```

### Frontend

Check:

```txt
feature-based architecture
TanStack Query for server state
Context for auth/session
no Redux
MSW handlers match API contracts
mobile-first UI
minimal expense form
```

### API contracts

Check whether the PR keeps these aligned:

```txt
docs/architecture/api-contracts.md
frontend API types
MSW handlers
backend DTOs/controllers
tests
```

## Output format

Return the review in this format:

```md
# PR Review

## Summary

Briefly explain what this PR does.

## Approval status

Choose one:

- Approved
- Approved with comments
- Changes requested

## Main findings

### Scope

### Architecture

### Backend

### Frontend

### API contracts

### Tests

### Security

### Documentation

## Required changes

List required changes before merge.

## Suggested improvements

List optional improvements.

## Final recommendation

State whether the PR should be merged or changed.
```

## Review tone

Be direct, precise, and practical.

Do not be vague.

If something is wrong, explain:

```txt
what is wrong
why it matters
what should be changed
```
