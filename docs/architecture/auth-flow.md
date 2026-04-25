# Authentication Flow

## Goal

The MVP must use Google login to reduce adoption friction.

The user must not create an email/password account.

After login, the user must go directly to the dashboard.

## Authentication model

The frontend uses Google login to obtain a Google credential/token.

The backend validates the Google credential/token.

The backend creates or reuses the user.

The backend issues its own application JWT.

The frontend uses the application JWT for authenticated API calls.

## Why backend-issued JWT

The backend must be the source of truth for application authentication.

Google proves identity.

The application JWT grants access to this system.

This allows the backend to control:

- user identity
- current construction access
- ownership validation
- application-specific session rules

## Main login flow

```txt
User clicks "Entrar com Google"
↓
Frontend receives Google credential/token
↓
Frontend sends credential to backend
↓
POST /api/auth/google
↓
Backend validates Google credential/token
↓
Backend extracts Google subject, name, email, picture
↓
Backend checks if user exists by google_subject
↓
If user does not exist:
  create user
↓
Backend checks if user has default/current construction
↓
If not:
  create construction "Minha obra"
  create default stages
  set "Fundação" as current stage
  create default categories
↓
Backend creates application JWT
↓
Backend returns JWT, user, and current construction
↓
Frontend stores JWT
↓
Frontend redirects user to dashboard
```

## First login behavior

When a user logs in for the first time, the backend must create:

### User

Fields:

```txt
google_subject
name
email
picture_url
created_at
updated_at
```

### Construction

Fields:

```txt
owner_id
name = Minha obra
current_stage = Fundação
created_at
updated_at
```

### Default stages

```txt
Fundação
Estrutura
Alvenaria
Cobertura
Elétrica
Hidráulica
Reboco
Piso
Pintura
Acabamento
Outros
```

### Default categories

```txt
Material
Mão de Obra
Ferramentas
Documentação/Taxas
Outros
```

## Existing user behavior

When an existing user logs in:

- do not duplicate user
- do not duplicate default construction
- do not duplicate default categories
- do not duplicate default stages
- issue a fresh application JWT
- return user and current construction

## Application JWT contents

Recommended JWT claims:

```txt
sub: user id
email: user email
name: user name
iat: issued at
exp: expiration
```

The backend may also include other claims if useful, but it must not rely only on frontend-provided data for authorization.

## Frontend session

The frontend should store the application JWT.

Recommended simple MVP approach:

- use a simple auth Context
- keep current user and current construction in memory
- persist token using localStorage for MVP simplicity

Future hardening may replace this with a more secure cookie-based approach.

## Authenticated request

Frontend sends:

```txt
Authorization: Bearer <application-jwt>
```

Backend validates:

- JWT signature
- JWT expiration
- user existence
- resource ownership

## Ownership rules

Every authenticated resource access must be scoped to the current user.

The user can access only:

- their own construction
- categories from their construction
- stages from their construction
- expenses from their construction
- share link from their construction

## Public dashboard flow

```txt
Visitor opens public link
↓
Frontend route /public/dashboard/:token
↓
Frontend calls GET /api/public/dashboard/{token}
↓
Backend validates token
↓
If token exists and active:
  return dashboard data
↓
If token is missing, invalid, or inactive:
  return 404 or 403
```

The public dashboard does not require JWT.

The public dashboard is read-only.

## Security notes

- Never trust user identity coming only from the frontend.
- Always validate Google credential/token in the backend.
- Never expose secrets in frontend code.
- Never store Google client secret in frontend code.
- Public share token must be hard to guess.
- Public share token must not be based on sequential construction IDs.
- Public dashboard must not expose owner-sensitive data beyond dashboard information.
