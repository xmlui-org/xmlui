Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/common.ps1"

Write-Log "Running preflight checks"

Require-Command "curl.exe"
Require-Command "codex.cmd"

if (-not (Get-Command "Expand-Archive" -ErrorAction SilentlyContinue)) {
  Fail "Expand-Archive is unavailable. Use Windows PowerShell 5.1+ or PowerShell 7+."
}

Write-Log "Detected platform: win/$env:PROCESSOR_ARCHITECTURE"
Write-Log "Preflight complete"
