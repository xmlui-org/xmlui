#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/common.sh"

usage() {
  cat <<'EOF'
Usage: dev-setup.sh [OPTIONS]

Options:
  --tracing=yes|no        Whether to enable tracing (default: no)
  --project-name=NAME     Name of the project directory to create
  -h, --help              Show this message
EOF
}

TRACING="no"
PROJECT_NAME=""

for arg in "$@"; do
  case "${arg}" in
    --tracing=yes) TRACING="yes" ;;
    --tracing=no)  TRACING="no" ;;
    --project-name=*) PROJECT_NAME="${arg#--project-name=}" ;;
    -h|--help) usage; exit 0 ;;
    *) fail "Unknown argument: ${arg}" ;;
  esac
done

if [[ -z "${PROJECT_NAME}" ]]; then
  if [[ "${TRACING}" == "yes" ]]; then
    PROJECT_NAME="xmlui-hello-world-tracing"
  else
    PROJECT_NAME="xmlui-hello-world"
  fi
fi

if ! command -v xmlui >/dev/null 2>&1; then
  fail "xmlui CLI is not available on PATH. Run install-cli first."
fi

if [[ -e "${PROJECT_NAME}" ]]; then
  warn "Directory '${PROJECT_NAME}' already exists. Skipping project init."
else
  log "Creating project: xmlui new ${PROJECT_NAME}"
  xmlui new "${PROJECT_NAME}"
fi

log "Project ready: ${PROJECT_NAME}"
log "To start the dev server, run:"
log "  cd ${PROJECT_NAME} && xmlui run"
