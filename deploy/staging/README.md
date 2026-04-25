# Staging deploy files

This directory contains the files expected on the staging EC2 host.

## Files

- `docker-compose.staging.yml`: runs `postgres`, `backend`, and `caddy`
- `Caddyfile`: HTTPS reverse proxy for the backend
- `.env.example`: placeholder environment variables
- `bootstrap-ec2.sh`: prepares Docker and `/opt/obra-expenses` on Ubuntu, Debian, or Amazon Linux 2023

## Expected remote layout

```txt
/opt/obra-expenses/
├── .env
├── docker-compose.staging.yml
├── Caddyfile
├── .env.example
└── README.md
```

## Notes

- Do not commit the real `.env`.
- Only Caddy publishes ports `80` and `443`.
- Postgres and backend stay private inside the Docker network.
- Public `GET /health` is rewritten by Caddy to backend `GET /api/health`.
- The self-hosted GitHub Actions deploy workflow copies these files to `/opt/obra-expenses` and runs `docker compose`.
