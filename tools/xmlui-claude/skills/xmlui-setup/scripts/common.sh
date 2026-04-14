#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() {
  printf "[xmlui-claude] %s\n" "$*"
}

warn() {
  printf "[xmlui-claude] WARN: %s\n" "$*" >&2
}

fail() {
  printf "[xmlui-claude] ERROR: %s\n" "$*" >&2
  exit 1
}

require_cmd() {
  local cmd="$1"
  command -v "${cmd}" >/dev/null 2>&1 || fail "Missing required command: ${cmd}"
}

detect_platform() {
  local os arch
  os="$(uname -s)"
  arch="$(uname -m)"

  case "${os}" in
    Darwin) PLATFORM_OS="darwin" ;;
    Linux) PLATFORM_OS="linux" ;;
    MINGW*|MSYS*|CYGWIN*) PLATFORM_OS="win" ;;
    *) fail "Unsupported OS: ${os}. Supported: macOS, Linux, Windows (Git Bash)." ;;
  esac

  case "${arch}" in
    x86_64|amd64) PLATFORM_ARCH="x64" ;;
    arm64|aarch64) PLATFORM_ARCH="arm64" ;;
    *) fail "Unsupported architecture: ${arch}. Supported: x64, arm64." ;;
  esac
}

ensure_path_export() {
  local install_dir="$1"
  local shell_name rc_file line

  if [[ ":$PATH:" == *":${install_dir}:"* ]]; then
    return 0
  fi

  shell_name="$(basename "${SHELL:-bash}")"
  case "${shell_name}" in
    zsh) rc_file="${HOME}/.zshrc" ;;
    bash) rc_file="${HOME}/.bashrc" ;;
    *) rc_file="${HOME}/.profile" ;;
  esac

  line="export PATH=\"${install_dir}:\$PATH\""
  if [[ -f "${rc_file}" ]] && grep -Fq "${line}" "${rc_file}"; then
    return 0
  fi

  log "Adding ${install_dir} to PATH in ${rc_file}"
  printf "\n%s\n" "${line}" >> "${rc_file}"
  warn "Open a new terminal, or run: source ${rc_file}"
}
