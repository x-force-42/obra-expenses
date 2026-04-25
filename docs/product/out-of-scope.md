# Out of Scope

This document lists what must not be implemented in the MVP.

The goal is to keep the MVP small, focused, and deliverable.

## Out of scope for the MVP

### Uploads and attachments

The MVP must not include:

- receipt upload
- payment receipt image
- expense image
- construction image
- file attachments

### Expense details

The MVP must not include:

- long observation field
- payment method
- supplier management
- invoice number
- due date
- payment status

The expense form must remain minimal.

### Financial planning

The MVP must not include:

- planned budget
- category budget
- stage budget
- budget alerts
- accounts payable
- future expenses
- cash balance control
- financial forecasting

The system controls only expenses already made.

### Collaboration

The MVP must not include:

- multiple users editing the same construction
- collaborator invitations
- email invitations
- role-based permissions
- approval workflow
- comments between users

The only authenticated user is the owner.

The public link is read-only.

### Construction management

The MVP must not include:

- construction address
- construction location
- contractor management
- worker management
- schedule management
- task management
- physical progress tracking
- material inventory

The product is focused on money flow, not full construction project management.

### Reports and exports

The MVP must not include:

- PDF export
- Excel export
- printable reports
- accounting reports

### Notifications

The MVP must not include:

- WhatsApp notifications
- email notifications
- push notifications
- SMS notifications

### AI features

The MVP must not include:

- AI-generated financial analysis
- natural language insights
- automatic expense classification
- automatic receipt reading
- automatic invoice reading

### Mobile app

The MVP must not include native apps.

Out of scope:

- Android native app
- iOS native app
- app store publication

The MVP is a mobile-first web app.

### Integrations

The MVP must not include:

- bank integration
- Open Finance integration
- automatic spreadsheet import
- payment gateway integration
- external construction APIs

### AWS and infrastructure timing

AWS production deployment is part of the project, but it must not be the first implementation step.

The first goal is to create a functional local vertical slice.

CI/CD and AWS deployment should come after that slice exists.
