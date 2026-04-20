Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Log {
  param([Parameter(Mandatory = $true)][string]$Message)
  Write-Host "[xmlui-codex] $Message"
}

function Write-WarnLog {
  param([Parameter(Mandatory = $true)][string]$Message)
  Write-Warning "[xmlui-codex] $Message"
}

function Fail {
  param([Parameter(Mandatory = $true)][string]$Message)
  throw "[xmlui-codex] ERROR: $Message"
}

function Require-Command {
  param([Parameter(Mandatory = $true)][string]$Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) {
    Fail "Missing required command: $Name"
  }
}

function Get-CodexCommand {
  $candidates = @("codex.cmd", "codex")
  foreach ($candidate in $candidates) {
    $cmd = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($cmd) {
      return $candidate
    }
  }
  Fail "Codex CLI not found. Install Codex and ensure codex/codex.cmd is on PATH."
}

function Get-XmluiCommand {
  $candidates = @("xmlui.exe", "xmlui.cmd", "xmlui")
  foreach ($candidate in $candidates) {
    $cmd = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($cmd) {
      return $candidate
    }
  }
  return $null
}

function Invoke-Codex {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  $codexCmd = Get-CodexCommand
  & $codexCmd @Args
  return $LASTEXITCODE
}

function Invoke-Xmlui {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  $xmluiCmd = Get-XmluiCommand
  if (-not $xmluiCmd) {
    Fail "XMLUI CLI is not available on PATH."
  }
  & $xmluiCmd @Args
  return $LASTEXITCODE
}
