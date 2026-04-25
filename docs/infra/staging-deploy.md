# Staging deploy

## Architecture

Initial staging layout:

```txt
Frontend: AWS Amplify
Backend: EC2 + Docker
Database: PostgreSQL in Docker on the same EC2
Reverse proxy: Caddy with HTTPS
```

This keeps the first staging environment simple and cheap while avoiding AWS credentials in the application runtime.

The backend deploy workflow runs on a self-hosted GitHub Actions runner installed on the staging EC2 instance.

## What must be created manually in AWS

### EC2

Create one Linux EC2 instance manually.

Suggested baseline:

- Ubuntu 24.04 LTS or Amazon Linux 2023
- small instance size for staging
- public IP, or an Elastic IP if you want a stable address
- enough disk for Docker images, logs, and PostgreSQL data

### Security group

Recommended inbound rules:

- `22/tcp` from your IP only
- `80/tcp` from `0.0.0.0/0` and `::/0`
- `443/tcp` from `0.0.0.0/0` and `::/0`

Recommended outbound rules:

- allow default outbound access

Do not expose:

- `5432`
- `8080`

### Amplify

Create the Amplify app manually and connect it to this repository.

For the frontend environment variables, configure:

```txt
VITE_API_BASE_URL=https://<API_DOMAIN>
```

The frontend base URL stays at the domain root. Application requests continue under `/api/...`.

## Files added for staging

```txt
backend/Dockerfile
backend/src/main/resources/application-staging.yml
deploy/staging/docker-compose.staging.yml
deploy/staging/Caddyfile
deploy/staging/.env.example
deploy/staging/bootstrap-ec2.sh
.github/workflows/ci.yml
.github/workflows/deploy-backend-staging.yml
amplify.yml
```

## GitHub Actions runner

Register a self-hosted GitHub Actions runner on the staging EC2 instance with these labels:

- `self-hosted`
- `linux`
- `x64`
- `obra-expenses-staging`

The deploy workflow is manual-only and must run only on this staging runner.

## Preparing the EC2 host

Copy `deploy/staging/bootstrap-ec2.sh` to the EC2 host and run it:

```bash
chmod +x bootstrap-ec2.sh
./bootstrap-ec2.sh
```

This script:

- installs Docker if needed
- installs the Docker Compose plugin if needed
- supports Ubuntu, Debian, and Amazon Linux 2023
- creates `/opt/obra-expenses`
- sets permissions for the current user

It does not create secrets and it does not start the application.

## Creating /opt/obra-expenses/.env

On the EC2 host:

```bash
cd /opt/obra-expenses
cp .env.example .env
```

Then edit `.env` with real values.

Suggested keys:

```txt
API_DOMAIN=api.<public-ip>.sslip.io
POSTGRES_DB=obra_expenses
POSTGRES_USER=obra_expenses
POSTGRES_PASSWORD=<strong-password>
SPRING_PROFILES_ACTIVE=staging
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/obra_expenses
SPRING_DATASOURCE_USERNAME=obra_expenses
SPRING_DATASOURCE_PASSWORD=<strong-password>
JWT_SECRET=<strong-random-secret>
GOOGLE_CLIENT_ID=change_me
APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://*.amplifyapp.com,http://localhost:5173
```

Do not commit this file.

## Running the backend deploy workflow

After the EC2 host, self-hosted runner, and `/opt/obra-expenses/.env` are ready:

1. Open GitHub Actions.
2. Select `Deploy Backend Staging`.
3. Run the workflow manually.

The workflow will:

- build the backend Docker image
- copy the deploy files to `/opt/obra-expenses`
- validate that `/opt/obra-expenses/.env` already exists
- run `docker compose --env-file .env -f docker-compose.staging.yml up -d`
- run `docker image prune -f`

The workflow does not overwrite `/opt/obra-expenses/.env`.

If `/opt/obra-expenses/.env` does not exist, the workflow fails with a clear message and stops before deploy.

## Configuring Amplify

Create the Amplify app manually using the repository root and the provided `amplify.yml`.

Important points:

- app root: `frontend`
- build command: `npm run build`
- publish directory: `frontend/dist`
- set `VITE_API_BASE_URL=https://<API_DOMAIN>`

## Validation

After deploy, validate the backend:

```bash
curl https://<API_DOMAIN>/health
```

Expected response:

```json
{"status":"UP"}
```

In staging, Caddy rewrites public `/health` to backend `/api/health`.

Then validate the frontend by opening the Amplify URL in the browser.

## Stopping the environment to avoid cost

When you are not using staging:

- stop or terminate the EC2 instance
- remove the Amplify app if you no longer need it
- review storage and snapshots that may continue generating cost
- check AWS Budgets and billing dashboards

## Current limitations

- PostgreSQL runs on the same EC2 as the backend
- there is no managed registry such as ECR or GHCR
- there is no RDS yet
- there is no automatic `.env` provisioning

This is intentional for the first staging setup.
