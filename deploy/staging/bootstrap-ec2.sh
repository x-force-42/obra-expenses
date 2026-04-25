#!/usr/bin/env bash

set -euo pipefail

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This script currently supports Debian/Ubuntu EC2 hosts only."
  exit 1
fi

if [ "$(id -u)" -eq 0 ]; then
  SUDO=""
  OWNER_USER="${SUDO_USER:-root}"
else
  SUDO="sudo"
  OWNER_USER="${SUDO_USER:-$USER}"
fi

docker_compose_available() {
  command -v docker >/dev/null 2>&1 && ${SUDO} docker compose version >/dev/null 2>&1
}

install_docker() {
  . /etc/os-release

  if [ "${ID}" != "ubuntu" ] && [ "${ID}" != "debian" ]; then
    echo "This script currently supports Ubuntu or Debian EC2 hosts only."
    exit 1
  fi

  ${SUDO} apt-get update
  ${SUDO} apt-get install -y ca-certificates curl gnupg

  ${SUDO} install -m 0755 -d /etc/apt/keyrings

  if [ ! -f /etc/apt/keyrings/docker.asc ]; then
    curl -fsSL "https://download.docker.com/linux/${ID}/gpg" | ${SUDO} tee /etc/apt/keyrings/docker.asc >/dev/null
    ${SUDO} chmod a+r /etc/apt/keyrings/docker.asc
  fi

  if [ ! -f /etc/apt/sources.list.d/docker.list ]; then
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/${ID} ${VERSION_CODENAME} stable" | \
      ${SUDO} tee /etc/apt/sources.list.d/docker.list >/dev/null
  fi

  ${SUDO} apt-get update
  ${SUDO} apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  ${SUDO} systemctl enable --now docker
}

if ! docker_compose_available; then
  install_docker
fi

${SUDO} usermod -aG docker "${OWNER_USER}"
${SUDO} mkdir -p /opt/obra-expenses
${SUDO} chown -R "${OWNER_USER}:${OWNER_USER}" /opt/obra-expenses

echo "Docker and Docker Compose plugin are ready."
echo "Directory prepared: /opt/obra-expenses"

if [ ! -f /opt/obra-expenses/.env ]; then
  echo "Create /opt/obra-expenses/.env manually before running docker compose."
fi

echo "You may need to log out and log back in for the docker group change to apply."
