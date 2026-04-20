#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"${SCRIPT_DIR}/preflight.sh"

if ! command -v xmlui >/dev/null 2>&1; then
  "${SCRIPT_DIR}/install-cli.sh"
fi

"${SCRIPT_DIR}/configure-mcp.sh"
