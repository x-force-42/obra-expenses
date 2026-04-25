# MVP Backlog

## Backlog status

This backlog was approved during SDLC step 2: Analysis and planning.

The implementation must follow this order unless documentation is explicitly updated.

## Epic 1: Project foundation

### Goal

Create the initial project structure prepared for frontend, backend, documentation, testing, and AI-assisted development.

### User stories

#### US-001: Create initial repository structure

As a developer,  
I want an organized monorepo structure,  
so that frontend, backend, documentation, and infrastructure can evolve together.

#### US-002: Create AI agent documentation

As a developer,  
I want an `AGENTS.md` file,  
so that Codex/Claude can follow project rules and constraints.

#### US-003: Create initial product documentation

As a developer,  
I want product requirements and backlog documented,  
so that implementation remains aligned with the approved MVP scope.

### Suggested tasks

- Create monorepo
- Create `frontend/`
- Create `backend/`
- Create `docs/`
- Create `infra/`
- Create `AGENTS.md`
- Create `README.md`
- Create product requirement docs

## Epic 2: Authentication and first access

### Goal

Allow the construction owner to access the system using Google login.

### User stories

#### US-004: Google login

As a construction owner,  
I want to log in with my Google account,  
so that I do not need to create and remember another password.

#### US-005: Create user on first access

As a construction owner,  
I want my user account to be created automatically on first login,  
so that I can start using the system immediately.

#### US-006: Reuse existing user

As a construction owner,  
I want the system to recognize me on future logins,  
so that my account is not duplicated.

### Acceptance notes

- The MVP must not include email/password login.
- The backend must validate the Google token.
- The backend must emit its own application JWT.
- Existing users must not be duplicated.

## Epic 3: Default construction

### Goal

Create the user's default construction automatically and keep the experience focused on the current construction.

### User stories

#### US-007: Create default construction

As a construction owner,  
I want the system to create a default construction called `Minha obra`,  
so that I can start registering expenses immediately.

#### US-008: Define initial current stage

As a construction owner,  
I want the default construction to start in the `Fundação` stage,  
so that new expenses have a useful default stage.

#### US-009: Use default construction as current construction

As a construction owner,  
I want the app to open directly in my current construction,  
so that I do not need to choose a construction every time.

### Acceptance notes

- Default construction name: `Minha obra`
- Initial current stage: `Fundação`
- Creation date is automatic
- MVP frontend can work only with the default/current construction

## Epic 4: Categories and stages

### Goal

Provide default categories and stages and allow future customization.

### User stories

#### US-010: Create default categories

As a construction owner,  
I want the system to create default expense categories,  
so that I can register expenses without initial configuration.

Default categories:

- Material
- Mão de Obra
- Ferramentas
- Documentação/Taxas
- Outros

#### US-011: Create default stages

As a construction owner,  
I want the system to create default construction stages,  
so that I can classify expenses by construction phase.

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

#### US-012: Add and edit categories

As a construction owner,  
I want to add and edit categories,  
so that I can adapt the system to my construction.

#### US-013: Add and edit stages

As a construction owner,  
I want to add and edit stages,  
so that I can adapt the system to my construction.

### Priority note

For the first vertical slice, default categories and stages are enough.

Add/edit screens can come after simple expense registration and listing.

## Epic 5: Expense management

### Goal

Allow the owner to register construction expenses very quickly.

### User stories

#### US-014: Create simple expense

As a construction owner,  
I want to create an expense quickly,  
so that I can register a purchase or payment when it happens.

MVP fields:

- amount
- category
- stage
- optional short description
- automatic date/time

#### US-015: Use current stage as default

As a construction owner,  
I want the expense form to use the construction current stage by default,  
so that I can register expenses with less friction.

#### US-016: Edit expense

As a construction owner,  
I want to edit an expense,  
so that I can correct wrong information.

#### US-017: Delete expense

As a construction owner,  
I want to delete an expense,  
so that I can remove wrong records.

### Acceptance notes

- Amount is required
- Amount must be greater than zero
- Category is required
- Stage is required
- Description is optional
- Date/time is automatic
- Payment method is out of scope
- Upload is out of scope
- Long observation is out of scope
- Deletion must be logical

## Epic 6: Expense listing

### Goal

Allow expenses to be viewed and prepare the backend API for pagination, filters, and sorting.

### User stories

#### US-018: List current construction expenses

As a construction owner,  
I want to list registered expenses,  
so that I can review the financial history.

#### US-019: Paginate expenses in the API

As the system,  
I want to return paginated expenses,  
so that the API remains performant as data grows.

#### US-020: Filter expenses in the API

As the system,  
I want to filter expenses by relevant properties,  
so that the frontend can evolve without changing the API contract.

Relevant filters:

- date
- amount
- category
- stage
- description
- construction

#### US-021: Sort expenses in the API

As the system,  
I want to sort expenses,  
so that lists can be shown according to frontend needs.

Relevant sort fields:

- occurredAt
- amount
- description
- category
- stage
- createdAt

## Epic 7: Initial automated tests

### Goal

Create a quality base before CI/CD.

### User stories

#### US-022: Test user creation on first login

As a developer,  
I want automated tests for first-login user creation,  
so that authentication behavior remains reliable.

#### US-023: Test default construction creation

As a developer,  
I want automated tests for default construction creation,  
so that every new user starts with a usable construction.

#### US-024: Test expense creation

As a developer,  
I want automated tests for expense creation,  
so that core expense rules are protected.

#### US-025: Test paginated expense listing

As a developer,  
I want automated tests for pagination, filters, and sorting,  
so that the API is ready for growth.

## Epic 8: Infra, CI/CD and AWS deploy

### Goal

Configure integration and delivery pipeline after the first functional slice exists.

### Important planning decision

This epic must not be implemented first.

The project must first have a functional vertical slice.

After that, CI/CD and AWS deployment must be configured to provide real feedback and a continuous delivery experience.

### User stories

#### US-026: Create CI pipeline

As a developer,  
I want GitHub Actions to run build and tests on PRs,  
so that changes are automatically validated.

#### US-027: Build frontend

As a developer,  
I want the frontend to build automatically,  
so that it can be deployed to S3 + CloudFront.

#### US-028: Build backend

As a developer,  
I want the backend to build a deployable artifact or Docker image,  
so that it can be deployed to EC2.

#### US-029: Deploy frontend

As a developer,  
I want to publish the frontend to S3 + CloudFront,  
so that the web app is available in production.

#### US-030: Deploy backend

As a developer,  
I want to publish the backend to EC2 with Docker,  
so that the API is available in production.

#### US-031: Configure RDS PostgreSQL

As a developer,  
I want to configure RDS PostgreSQL,  
so that production data is persisted safely.

#### US-032: Configure S3 bucket

As a developer,  
I want to configure an S3 bucket,  
so that the system is ready for future file storage.

## Epic 9: Financial dashboard

### Goal

Allow the owner to understand the flow of money.

### User stories

#### US-033: View month spent

As a construction owner,  
I want to see how much I spent in the current month,  
so that I can track recent construction spending.

#### US-034: View total spent

As a construction owner,  
I want to see the total amount spent,  
so that I understand how much I have invested in the construction.

#### US-035: Filter dashboard by period

As a construction owner,  
I want to filter dashboard data by period,  
so that I can analyze the data by different time ranges.

Filters:

- Month
- Last 30 days
- All

#### US-036: View expenses by category

As a construction owner,  
I want to see a pie chart by category,  
so that I understand what consumes more money.

#### US-037: View expenses by stage

As a construction owner,  
I want to see a pie chart by construction stage,  
so that I understand which phases consume more money.

#### US-038: View monthly expense evolution

As a construction owner,  
I want to see monthly expense evolution,  
so that I can understand the flow of money over time.

#### US-039: View latest expenses

As a construction owner,  
I want to see the 5 latest expenses,  
so that I can quickly review recent records.

#### US-040: View top expenses

As a construction owner,  
I want to see the 5 highest expenses,  
so that I can identify the biggest financial impacts.

#### US-041: View basic insights

As a construction owner,  
I want to see simple financial insights,  
so that I can quickly understand the most relevant points.

Initial insights:

- main category
- main stage
- current month vs previous month
- percentage by category
- average ticket

## Epic 10: Public dashboard sharing

### Goal

Allow the owner to share the dashboard with others in read-only mode.

### User stories

#### US-042: Generate public dashboard link

As a construction owner,  
I want to generate a public dashboard link,  
so that I can share financial visibility with other people.

#### US-043: View public dashboard without login

As a visitor,  
I want to access the dashboard through a link without login,  
so that I can see the shared information.

#### US-044: Block actions in public dashboard

As a construction owner,  
I want visitors to be unable to change data,  
so that my construction information remains protected.

#### US-045: Disable public link

As a construction owner,  
I want to disable the public link,  
so that I can stop public access when needed.

#### US-046: Regenerate public link

As a construction owner,  
I want to regenerate the public link,  
so that old links become invalid.

### Acceptance notes

- Public dashboard shows the same dashboard information
- Public dashboard is read-only
- Public dashboard default period is `ALL`
- Public token must be hard to guess
