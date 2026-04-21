#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/common.sh"

log "Configuring XMLUI MCP server for Codex"

require_cmd codex

detect_platform
if [[ "${PLATFORM_OS}" == "win" ]]; then
  CLI_BINARY_NAME="xmlui.exe"
else
  CLI_BINARY_NAME="xmlui"
fi

if ! command -v "${CLI_BINARY_NAME}" >/dev/null 2>&1; then
  fail "XMLUI CLI not on PATH. Run install-cli first."
fi

if codex mcp get xmlui >/dev/null 2>&1; then
  log "MCP server 'xmlui' already configured"
  exit 0
fi

if codex mcp add xmlui -- xmlui mcp >/dev/null 2>&1; then
  log "MCP server 'xmlui' configured with 'xmlui mcp'"
elif [[ "${PLATFORM_OS}" == "win" ]] && codex mcp add xmlui -- xmlui.exe mcp >/dev/null 2>&1; then
  log "MCP server 'xmlui' configured with 'xmlui.exe mcp'"
else
  fail "Failed to configure MCP with 'codex mcp add'."
fi

if codex mcp get xmlui >/dev/null 2>&1; then
  log "Verified MCP server 'xmlui'"
else
  fail "MCP server 'xmlui' not found after add attempt"
fi
