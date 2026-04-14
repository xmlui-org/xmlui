#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/common.sh"

log "Configuring XMLUI MCP server"

detect_platform
if [[ "${PLATFORM_OS}" == "win" ]]; then
  CLI_BINARY_NAME="xmlui.exe"
else
  CLI_BINARY_NAME="xmlui"
fi

if ! command -v "${CLI_BINARY_NAME}" >/dev/null 2>&1; then
  fail "XMLUI CLI not on PATH. Run install-cli first."
fi

require_cmd claude

if claude mcp add xmlui -- xmlui mcp; then
  log "MCP server 'xmlui' configured"
  warn "Restart Claude Code so new MCP server is picked up."
  exit 0
fi

fail "Failed to configure MCP with 'claude mcp add'. Check Claude CLI version supports MCP management."
