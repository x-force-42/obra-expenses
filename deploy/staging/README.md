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
├── backend-image.tar.gz
├── docker-compose.staging.yml
├── Caddyfile
└── README.md
```

## Notes

- Do not commit the real `.env`.
- Only Caddy publishes ports `80` and `443`.
- Postgres and backend stay private inside the Docker network.
- Public `GET /health` is rewritten by Caddy to backend `GET /api/health`.
- The GitHub Actions deploy workflow copies these files to the EC2 host and runs `docker compose`.
