# ADR-007: Delay CI/CD and AWS deployment until the first functional slice exists

## Status

Accepted

## Context

The project goal includes learning and experiencing CI/CD and continuous delivery.

However, setting up CI/CD and AWS deployment before having a meaningful feature would only validate an empty application.

The user wants to experience the positive effects of TDD, continuous integration, and continuous delivery with real product behavior.

## Decision

Do not implement CI/CD and AWS deployment as the first task.

First implement a local functional vertical slice:

```txt
Google login
→ user creation
→ default construction creation
→ default categories and stages
→ simple expense creation
→ expense listing
→ initial automated tests
```

After this slice exists, implement:

```txt
GitHub Actions
frontend build/test
backend build/test
AWS deployment
```

## Rationale

CI/CD is more valuable when it validates real behavior.

A first functional slice gives the pipeline meaningful work:

- backend tests
- frontend tests
- build validation
- Docker packaging
- deployment smoke check

This makes continuous integration and delivery educational and useful instead of ceremonial.

## Consequences

### Positive

- CI/CD validates real product behavior.
- TDD feedback becomes visible in the pipeline.
- Deployment is connected to a real MVP path.
- Avoids early infrastructure distraction.

### Negative

- Production environment comes slightly later.
- Some deployment assumptions may need adjustment after implementation starts.
- The first local slice must be kept small to avoid delaying deployment too much.

## Notes

This does not mean infrastructure is ignored.

Architecture decisions are documented early, but implementation of AWS deployment comes after the first local slice.
