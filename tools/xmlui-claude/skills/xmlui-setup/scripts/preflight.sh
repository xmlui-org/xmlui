#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/common.sh"

log "Running preflight checks"
require_cmd curl
require_cmd uname
require_cmd claude

detect_platform
if [[ "${PLATFORM_OS}" == "win" ]]; then
  require_cmd unzip
else
  require_cmd tar
fi

log "Detected platform: ${PLATFORM_OS}/${PLATFORM_ARCH}"

log "Preflight complete"
