# Product Requirements

## Product summary

Obra Expenses is a mobile-first application for managing construction expenses.

The system must allow a construction owner to register expenses quickly and visualize important insights about the flow of money.

The product must be simple, intuitive, and optimized for mobile usage.

## Problem

Today, construction expense control is commonly done using spreadsheets.

This creates friction because registering a new expense requires opening Excel or another spreadsheet tool, finding the right place, typing the data, and maintaining discipline over time.

This friction causes:

- forgotten expenses
- delayed registration
- poor visibility over the real cost of the construction
- difficulty understanding where the money is going

## Target user

The primary user is the owner of the construction.

The MVP is designed for a common person, not for a company or construction management team.

## Main value proposition

The system must help the user:

- register expenses at the moment they happen
- understand total spending
- understand monthly spending
- identify which categories consume more money
- identify which construction stages consume more money
- follow the evolution of expenses over time
- share a read-only dashboard with other people

## Product principles

The MVP must follow these principles:

- Mobile first
- Simple
- Fast
- Intuitive
- Low friction
- Minimum required fields
- Dashboard focused on money flow
- No complex construction management
- No corporate ERP behavior

## Authentication

The system must use Google login.

There must be no email/password authentication in the MVP.

After login, the user must go directly to the dashboard.

There must be no onboarding flow in the MVP.

## First access

When a user logs in for the first time:

1. The system creates the user.
2. The system creates a default construction.
3. The construction name is `Minha obra`.
4. The initial current stage is `Fundação`.
5. The system creates default categories.
6. The system creates default stages.
7. The user is redirected to the dashboard.

## Constructions

The system must support multiple constructions in the data model.

However, in the MVP, the frontend can focus only on the default/current construction.

Adding or switching constructions must not be the focus of the MVP experience.

## Expenses

The user must be able to register an expense when a purchase or payment happens.

Examples:

- buying materials
- paying a worker
- paying a service
- paying a fee related to the construction

The expense form must be fast and minimal.

### Expense fields in the MVP

Required:

- amount
- category
- stage

Optional:

- short description

Automatic:

- date/time

Not included in MVP:

- payment method
- receipt/image
- long observation

### Expense management

The user must be able to:

- create expenses
- edit expenses
- delete expenses
- list expenses

Expense deletion must be logical.

Deleted expenses must not be included in dashboard calculations.

## Categories

The system must create default categories for each construction.

Default categories:

- Material
- Mão de Obra
- Ferramentas
- Documentação/Taxas
- Outros

The user must be able to add and edit categories.

Categories should be deactivated instead of physically deleted.

## Stages

The system must create default stages for each construction.

Default stages:

- Fundação
- Estrutura
- Alvenaria
- Cobertura
- Elétrica
- Hidráulica
- Reboco
- Piso
- Pintura
- Acabamento
- Outros

The user must be able to add and edit stages.

Stages should be deactivated instead of physically deleted.

The construction must have a current stage.

The current stage must be used as the default stage when creating a new expense.

## Dashboard

The dashboard is the main product experience.

The authenticated dashboard must open with the default period:

```txt
MONTH
```

The dashboard must show:

- month spent
- total spent
- expenses by category
- expenses by stage
- monthly expense evolution
- latest 5 expenses
- top 5 expenses
- main category
- main stage
- average ticket
- current month vs previous month comparison

The dashboard must support these period filters:

- Month
- Last 30 days
- All

Even when the dashboard period is `MONTH`, the total spent card must show the total spent across the entire construction.

## Public sharing

The owner must be able to generate a public read-only dashboard link.

The public dashboard:

- does not require login
- shows the same dashboard information
- is read-only
- opens with the default period `ALL`
- must not show create, edit, delete, or configuration actions

The owner must be able to:

- generate a link
- disable the link
- regenerate the link

The public token must be hard to guess.

## Permissions

The MVP has only two access modes:

### Owner

The authenticated owner can:

- view dashboard
- create expenses
- edit expenses
- delete expenses
- manage categories
- manage stages
- generate public link
- disable public link
- regenerate public link

### Public viewer

A public viewer can:

- access a public dashboard link
- view the dashboard only

A public viewer cannot:

- create expenses
- edit expenses
- delete expenses
- manage categories
- manage stages
- access internal settings

## Non-functional requirements

The system must be:

- mobile first
- simple and intuitive
- fast for daily expense registration
- compatible with modern mobile browsers
- secure for private owner data
- performant for hundreds or a few thousand expenses
- prepared for backend pagination, filters, and sorting
- prepared for deployment with GitHub Actions and AWS

Initial production direction:

- frontend on S3 + CloudFront
- backend on EC2 with Docker
- database on RDS PostgreSQL
- bucket on S3
- CI/CD with GitHub Actions
