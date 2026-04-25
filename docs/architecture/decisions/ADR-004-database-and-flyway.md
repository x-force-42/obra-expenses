# ADR-004: Use PostgreSQL and Flyway

## Status

Accepted

## Context

The project needs a relational database for:

- users
- constructions
- categories
- stages
- expenses
- public share links

The production direction is AWS RDS PostgreSQL.

The local development environment must be close to production behavior.

The project also needs a simple and reliable migration tool.

## Decision

Use PostgreSQL as the main database.

Use Flyway for database migrations.

Use Docker Compose to run PostgreSQL locally.

Do not use H2 for integration tests.

Use Testcontainers with PostgreSQL for backend integration tests.

## Rationale

PostgreSQL is production-grade and matches the planned production database.

Flyway is simple, predictable, and sufficient for this MVP.

Using PostgreSQL locally and in tests reduces environment mismatch.

## Consequences

### Positive

- Local and production database behavior are aligned.
- Migrations are simple and versioned.
- Testcontainers gives reliable integration testing.
- Avoids H2/PostgreSQL differences.

### Negative

- Tests may be slightly slower than H2.
- Requires Docker for local integration tests.
- Developers need PostgreSQL awareness.

## Migration naming

Use Flyway migration naming such as:

```txt
V1__create_initial_schema.sql
V2__add_share_links.sql
```

## Database conventions

Use snake_case for table and column names.

Examples:

```txt
google_subject
current_stage_id
occurred_at
created_at
updated_at
```

## Notes

All schema changes must be made through Flyway migrations.

Do not manually change database schema without a migration.
