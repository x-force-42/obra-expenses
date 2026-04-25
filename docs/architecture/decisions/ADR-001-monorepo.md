# ADR-001: Use monorepo

## Status

Accepted

## Context

The project has a frontend, backend, documentation, local infrastructure, and future AWS deployment configuration.

The project is also intended to be developed with AI assistance. The agent must be able to understand the full product context, architecture, contracts, and implementation in one place.

Using separate repositories would create more context fragmentation and more operational overhead.

## Decision

Use a monorepo named:

```txt
obra-expenses
```

Recommended structure:

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

## Consequences

### Positive

- Easier for AI agents to understand the full project context.
- Easier to keep frontend and backend API contracts aligned.
- Easier local development with Docker Compose.
- Easier documentation discoverability.
- Easier first MVP delivery.

### Negative

- Repository can grow larger over time.
- CI/CD must be configured carefully to avoid running unnecessary jobs.
- Future scaling may require more discipline around directory ownership.

## Notes

This decision can be revisited if the project grows enough to justify separate repositories.
