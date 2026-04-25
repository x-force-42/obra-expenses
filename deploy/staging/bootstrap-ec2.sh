#!/usr/bin/env bash

set -euo pipefail

if [ "$(id -u)" -eq 0 ]; then
  SUDO=""
  OWNER_USER="${SUDO_USER:-root}"
else
  SUDO="sudo"
  OWNER_USER="${SUDO_USER:-$USER}"
fi

SUPPORTED_DISTRIBUTION=""
SUPPORTED_VERSION=""
PACKAGE_MANAGER=""

docker_compose_available() {
  command -v docker >/dev/null 2>&1 && ${SUDO} docker compose version >/dev/null 2>&1
}

load_os_release() {
  if [ ! -f /etc/os-release ]; then
    echo "Could not detect the operating system. /etc/os-release was not found."
    exit 1
  fi

  . /etc/os-release

  SUPPORTED_DISTRIBUTION="${ID}"
  SUPPORTED_VERSION="${VERSION_ID:-}"
}

ensure_docker_service() {
  ${SUDO} systemctl enable --now docker
}

ensure_owner_in_docker_group() {
  if [ "${OWNER_USER}" = "root" ]; then
    return
  fi

  if id -nG "${OWNER_USER}" | grep -qw docker; then
    return
  fi

  ${SUDO} usermod -aG docker "${OWNER_USER}"
}

ensure_installation_directory() {
  ${SUDO} mkdir -p /opt/obra-expenses
  ${SUDO} chown -R "${OWNER_USER}:${OWNER_USER}" /opt/obra-expenses
}

resolve_compose_arch() {
  case "$(uname -m)" in
    x86_64|amd64)
      echo "x86_64"
      ;;
    aarch64|arm64)
      echo "aarch64"
      ;;
    *)
      echo "Unsupported CPU architecture for Docker Compose plugin: $(uname -m)"
      exit 1
      ;;
  esac
}

install_compose_plugin_manually() {
  plugin_dir="/usr/local/lib/docker/cli-plugins"
  plugin_path="${plugin_dir}/docker-compose"
  download_path="$(mktemp)"
  compose_arch="$(resolve_compose_arch)"

  trap 'rm -f "${download_path}"' RETURN

  curl -fsSL \
    "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-${compose_arch}" \
    -o "${download_path}"

  ${SUDO} mkdir -p "${plugin_dir}"
  ${SUDO} install -m 0755 "${download_path}" "${plugin_path}"

  rm -f "${download_path}"
  trap - RETURN
}

install_debian_docker() {
  if [ "${SUPPORTED_DISTRIBUTION}" != "ubuntu" ] && [ "${SUPPORTED_DISTRIBUTION}" != "debian" ]; then
    echo "Unsupported Debian-family distribution: ${SUPPORTED_DISTRIBUTION}"
    exit 1
  fi

  ${SUDO} apt-get update
  ${SUDO} apt-get install -y ca-certificates curl gnupg

  ${SUDO} install -m 0755 -d /etc/apt/keyrings

  if [ ! -f /etc/apt/keyrings/docker.asc ]; then
    curl -fsSL "https://download.docker.com/linux/${SUPPORTED_DISTRIBUTION}/gpg" | ${SUDO} tee /etc/apt/keyrings/docker.asc >/dev/null
    ${SUDO} chmod a+r /etc/apt/keyrings/docker.asc
  fi

  if [ ! -f /etc/apt/sources.list.d/docker.list ]; then
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/${SUPPORTED_DISTRIBUTION} ${VERSION_CODENAME} stable" | \
      ${SUDO} tee /etc/apt/sources.list.d/docker.list >/dev/null
  fi

  ${SUDO} apt-get update
  ${SUDO} apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
}

install_amazon_linux_docker() {
  case "${SUPPORTED_VERSION}" in
    2023*)
      ;;
    *)
      echo "Unsupported Amazon Linux version: ${SUPPORTED_DISTRIBUTION} ${SUPPORTED_VERSION}"
      exit 1
      ;;
  esac

  if [ "${SUPPORTED_DISTRIBUTION}" != "amzn" ]; then
    echo "Unsupported Amazon Linux version: ${SUPPORTED_DISTRIBUTION} ${SUPPORTED_VERSION}"
    exit 1
  fi

  PACKAGE_MANAGER="dnf"

  if ! command -v dnf >/dev/null 2>&1; then
    if command -v yum >/dev/null 2>&1; then
      PACKAGE_MANAGER="yum"
    else
      echo "Could not find dnf or yum on Amazon Linux."
      exit 1
    fi
  fi

  ${SUDO} ${PACKAGE_MANAGER} install -y docker

  if ! docker_compose_available; then
    ${SUDO} ${PACKAGE_MANAGER} install -y docker-compose-plugin >/dev/null 2>&1 || true
  fi

  if ! docker_compose_available; then
    install_compose_plugin_manually
  fi

  if ! docker_compose_available; then
    echo "Docker Compose v2 is not available after package installation."
    exit 1
  fi
}

install_docker() {
  case "${SUPPORTED_DISTRIBUTION}" in
    ubuntu|debian)
      install_debian_docker
      ;;
    amzn)
      install_amazon_linux_docker
      ;;
    *)
      echo "This script currently supports Ubuntu, Debian, and Amazon Linux 2023."
      exit 1
      ;;
  esac
}

load_os_release

if ! docker_compose_available; then
  install_docker
fi

ensure_docker_service
ensure_owner_in_docker_group
ensure_installation_directory

echo "Docker and Docker Compose plugin are ready."
echo "Directory prepared: /opt/obra-expenses"

if [ ! -f /opt/obra-expenses/.env ]; then
  echo "Create /opt/obra-expenses/.env manually before running docker compose."
fi

echo "You may need to log out and log back in for the docker group change to apply."
