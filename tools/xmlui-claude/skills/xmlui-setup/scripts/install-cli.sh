#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/common.sh"

select_download_url() {
  detect_platform

  case "${PLATFORM_OS}_${PLATFORM_ARCH}" in
    darwin_arm64) echo "https://github.com/xmlui-org/xmlui-cli/releases/latest/download/xmlui-macos-arm64.tar.gz" ;;
    darwin_x64) echo "https://github.com/xmlui-org/xmlui-cli/releases/latest/download/xmlui-macos-intel.tar.gz" ;;
    linux_x64) echo "https://github.com/xmlui-org/xmlui-cli/releases/latest/download/xmlui-linux-x64.tar.gz" ;;
    win_x64) echo "https://github.com/xmlui-org/xmlui-cli/releases/latest/download/xmlui-win-x64.zip" ;;
    *) fail "No URL mapping for ${PLATFORM_OS}/${PLATFORM_ARCH}" ;;
  esac
}

select_binary_name() {
  detect_platform
  if [[ "${PLATFORM_OS}" == "win" ]]; then
    echo "xmlui.exe"
  else
    echo "xmlui"
  fi
}

log "Installing XMLUI CLI"
require_cmd curl
detect_platform
if [[ "${PLATFORM_OS}" == "win" ]]; then
  require_cmd unzip
else
  require_cmd tar
fi

DOWNLOAD_URL="$(select_download_url)"
CLI_BINARY_NAME="$(select_binary_name)"

if [[ "${PLATFORM_OS}" == "win" ]]; then
  INSTALL_DIR="${XMLUI_CLI_INSTALL_DIR:-${HOME}/bin}"
else
  INSTALL_DIR="${XMLUI_CLI_INSTALL_DIR:-${HOME}/.local/bin}"
fi
mkdir -p "${INSTALL_DIR}"

TMP_DIR="$(mktemp -d)"
if [[ "${PLATFORM_OS}" == "win" ]]; then
  ARCHIVE_PATH="${TMP_DIR}/xmlui-cli.zip"
else
  ARCHIVE_PATH="${TMP_DIR}/xmlui-cli.tar.gz"
fi
cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

log "Downloading XMLUI CLI from ${DOWNLOAD_URL}"
curl -fsSL "${DOWNLOAD_URL}" -o "${ARCHIVE_PATH}"

log "Extracting archive"
if [[ "${PLATFORM_OS}" == "win" ]]; then
  unzip -q "${ARCHIVE_PATH}" -d "${TMP_DIR}"
else
  tar -xzf "${ARCHIVE_PATH}" -C "${TMP_DIR}"
fi

CLI_SOURCE_PATH="$(find "${TMP_DIR}" -type f -name "${CLI_BINARY_NAME}" | head -n 1 || true)"
if [[ -z "${CLI_SOURCE_PATH}" ]]; then
  fail "Could not find binary ${CLI_BINARY_NAME} in downloaded archive"
fi

cp "${CLI_SOURCE_PATH}" "${INSTALL_DIR}/${CLI_BINARY_NAME}"
chmod +x "${INSTALL_DIR}/${CLI_BINARY_NAME}"

if [[ "${PLATFORM_OS}" == "darwin" ]] && command -v xattr >/dev/null 2>&1; then
  if xattr -d com.apple.quarantine "${INSTALL_DIR}/${CLI_BINARY_NAME}" >/dev/null 2>&1; then
    log "Removed macOS quarantine attribute from CLI binary"
  else
    warn "Could not remove macOS quarantine attribute automatically"
    warn "If execution is blocked, run: xattr -d com.apple.quarantine ${INSTALL_DIR}/${CLI_BINARY_NAME}"
  fi
fi

ensure_path_export "${INSTALL_DIR}"

log "Installed: ${INSTALL_DIR}/${CLI_BINARY_NAME}"
if command -v "${CLI_BINARY_NAME}" >/dev/null 2>&1; then
  log "CLI is available on PATH"
else
  warn "CLI is not yet in current shell PATH. Start a new terminal tab."
fi
