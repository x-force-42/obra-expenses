# ADR-003: Use Java Spring Boot modular monolith

## Status

Accepted

## Context

The backend must support:

- Google login validation
- application JWT issuance
- user creation/reuse
- default construction creation
- categories and stages
- expense creation/editing/deletion/listing
- dashboard aggregations
- public dashboard sharing

The MVP does not need microservices.

The project must remain simple, testable, and understandable for both humans and AI agents.

## Decision

Use Java Spring Boot with a modular monolith architecture.

Recommended package:

```txt
br.com.obraexpenses
```

Recommended modules:

```txt
auth
user
construction
category
stage
expense
dashboard
sharing
common
```

Use:

```txt
Spring Boot
Spring Data JPA
Bean Validation
JUnit 5
Spring Boot Test
MockMvc
Testcontainers PostgreSQL
```

## Architecture

Organize code by product domain, not only by technical type.

Recommended structure:

```txt
backend/src/main/java/br/com/obraexpenses/
├── auth/
├── user/
├── construction/
├── category/
├── stage/
├── expense/
├── dashboard/
├── sharing/
└── common/
```

Each module may contain its own:

```txt
controller
service
repository
dto
mapper
entity
tests
```

## Rationale

A modular monolith gives enough structure without the complexity of microservices.

It keeps the MVP simple while still allowing clear domain boundaries.

This is also easier for AI agents to navigate, because related files stay close together.

## Consequences

### Positive

- Simple deployment.
- Clear domain boundaries.
- Easier local development.
- Easier testing.
- Easier first MVP delivery.
- Avoids premature distributed system complexity.

### Negative

- Requires discipline to avoid domain modules becoming tangled.
- Future large-scale growth may require module extraction or stricter boundaries.

## Notes

Avoid creating only global directories like:

```txt
controller/
service/
repository/
dto/
entity/
```

That structure becomes harder to navigate as the project grows.
