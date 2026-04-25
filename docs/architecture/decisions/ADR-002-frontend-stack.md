# ADR-002: Use React, TypeScript, Vite, TailwindCSS, shadcn/ui, TanStack Query, Vitest and MSW

## Status

Accepted

## Context

The frontend must be mobile first, simple, fast, and easy to evolve with AI-assisted development.

The UI must support:

- Google login
- fast expense creation
- expense listing
- dashboard cards and charts
- public read-only dashboard

The project needs strong API contract alignment between frontend and backend.

## Decision

Use the following frontend stack:

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
Simple Context for auth/session
```

Do not use Redux in the MVP.

## Architecture

Use feature-based architecture:

```txt
frontend/src/
├── app/
├── pages/
├── features/
├── shared/
└── mocks/
```

Recommended feature structure:

```txt
features/expenses/
├── api/
├── components/
├── hooks/
├── types/
└── tests/
```

## Rationale

### React + Vite

Provides a fast and familiar frontend development experience.

### TypeScript

Helps prevent contract mistakes and gives AI agents stronger guardrails.

### TailwindCSS + shadcn/ui

Provides a clean, modern UI foundation without requiring a custom design system from scratch.

### TanStack Query

Handles server state, loading, errors, cache, refetching, and invalidation.

This avoids unnecessary global state complexity.

### Context for auth/session

Auth/session state is small enough for Context in the MVP.

### No Redux

Redux would add unnecessary complexity for this MVP.

### Vitest + React Testing Library

Provides fast and practical frontend testing.

### MSW

MSW must be used from the beginning to mock API behavior according to the documented API contracts.

This allows frontend development and tests to progress even before all backend endpoints are complete.

## Consequences

### Positive

- Good developer experience.
- Good AI-agent compatibility.
- Strong API contract feedback through TypeScript and MSW.
- Avoids unnecessary state management complexity.
- Supports mobile-first UI development.

### Negative

- Requires discipline to keep MSW handlers aligned with API docs.
- Feature-based structure requires consistent organization.
- shadcn/ui components must be managed inside the project.

## Notes

Any API contract change must update:

- `docs/architecture/api-contracts.md`
- frontend API types
- MSW handlers
- related tests
