# ADR-006: Use AWS MVP infrastructure with S3 + CloudFront, EC2, RDS and S3

## Status

Accepted

## Context

The project is intended to be deployed in production on AWS.

The goal is to learn and experience real deployment, CI/CD, and production operation while keeping costs and complexity under control.

The MVP has:

- static frontend
- backend API
- PostgreSQL database
- future file storage needs
- GitHub-based development workflow

## Decision

Use this initial AWS production architecture:

```txt
Frontend: S3 + CloudFront
Backend: EC2 with Docker
Database: RDS PostgreSQL
Bucket: S3
CI/CD: GitHub Actions
```

## Rationale

### S3 + CloudFront for frontend

The frontend is a static web application built with Vite.

Static assets do not require EC2.

S3 + CloudFront provides cheap, scalable, CDN-backed hosting.

### EC2 with Docker for backend

EC2 provides a simple and understandable backend deployment target.

Docker keeps runtime packaging explicit.

This is simpler than starting with ECS/Fargate for the MVP.

### RDS PostgreSQL

RDS provides a managed PostgreSQL database, matching the local PostgreSQL database.

### S3 bucket

S3 is planned for future file storage, even though upload is out of scope for the first MVP.

### GitHub Actions

GitHub Actions will provide CI/CD and integrate naturally with the repository.

## Consequences

### Positive

- Real AWS production experience.
- Cost and complexity remain manageable.
- Clear path to continuous delivery.
- Deployment architecture matches the product shape.
- Can evolve later to ECS/Fargate if needed.

### Negative

- EC2 requires OS/container maintenance.
- RDS can create cost if not sized carefully.
- AWS IAM, networking, and secrets require attention.
- Not as managed as ECS/Fargate or higher-level PaaS.

## Future evolution

If the project grows, the backend can evolve from EC2 Docker to:

```txt
ECS/Fargate
```

The frontend can remain on:

```txt
S3 + CloudFront
```

The database can remain on:

```txt
RDS PostgreSQL
```

## Cost control notes

Before creating AWS resources, estimate cost and document the reasoning.

Avoid unnecessary resources such as NAT Gateway unless explicitly justified.

Use small instances and conservative defaults for MVP.
