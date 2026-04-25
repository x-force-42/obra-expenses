# ADR-005: Use Google login with backend-issued JWT

## Status

Accepted

## Context

The MVP must have very low adoption friction.

The user should not create another password.

The frontend will use Google login, but the backend must remain the source of truth for application authentication and authorization.

The system must create default application data on first login.

## Decision

Use Google login on the frontend.

The frontend sends the Google credential/token to the backend.

The backend validates the Google credential/token.

The backend creates or reuses the user.

The backend creates default construction, categories, and stages if needed.

The backend issues its own application JWT.

The frontend uses the application JWT in authenticated API calls.

## Flow

```txt
User clicks Google login
↓
Frontend obtains Google credential/token
↓
Frontend sends credential to POST /api/auth/google
↓
Backend validates credential with Google
↓
Backend creates/reuses User
↓
Backend creates default Construction if needed
↓
Backend creates default Categories and Stages if needed
↓
Backend emits application JWT
↓
Frontend stores JWT
↓
Frontend calls authenticated APIs with Bearer token
```

## Rationale

Google identifies the user.

The application JWT authorizes access to this system.

This keeps business ownership rules inside the backend.

## Consequences

### Positive

- Low-friction login.
- No password management in MVP.
- Backend controls application session.
- Backend can enforce ownership rules.
- Easier to evolve application-specific authorization.

### Negative

- Requires Google login configuration.
- Requires backend token validation.
- Requires JWT signing secret management.
- Frontend token storage must be handled carefully.

## Security notes

- Do not trust user identity only from frontend.
- Always validate Google credential/token in backend.
- Do not expose backend JWT signing secret.
- Do not expose Google client secret in frontend.
- Every authenticated resource must be scoped by the current user.
- Public dashboard links must not require JWT but must validate hard-to-guess tokens.
