param(
  [string]$Template = "xmlui-hello-world-trace",
  [string]$ProjectName = "xmlui-hello-world-trace"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/common.ps1"

$xmluiCmd = Get-XmluiCommand
if (-not $xmluiCmd) {
  Fail "xmlui CLI is not available on PATH. Run install-cli first."
}

if (Test-Path -LiteralPath $ProjectName) {
  Write-WarnLog "Directory '$ProjectName' already exists. Skipping project init."
  exit 0
}

Write-Log "Creating project: xmlui new $Template --output $ProjectName"
$null = Invoke-Xmlui new $Template --output $ProjectName
if ($LASTEXITCODE -ne 0) {
  Fail "Project creation failed."
}

Write-Log "Project ready: $ProjectName"
Write-Log "To start the dev server, run:"
Write-Log "  cd $ProjectName"
Write-Log "  xmlui run"
