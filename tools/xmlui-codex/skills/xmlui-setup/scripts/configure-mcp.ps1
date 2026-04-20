Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/common.ps1"

Write-Log "Configuring XMLUI MCP server for Codex"

$xmluiCmd = Get-XmluiCommand
if (-not $xmluiCmd) {
  Fail "XMLUI CLI not on PATH. Run install-cli first."
}

$null = Invoke-Codex mcp get xmlui
if ($LASTEXITCODE -eq 0) {
  Write-Log "MCP server 'xmlui' already configured"
  exit 0
}

$xmluiExe = (Get-Command "xmlui.exe" -ErrorAction SilentlyContinue)
$xmluiExePath = if ($xmluiExe) { $xmluiExe.Source } else { $null }

$addAttempts = @(
  @("mcp", "add", "xmlui", "--", "xmlui", "mcp"),
  @("mcp", "add", "xmlui", "--", "xmlui.exe", "mcp")
)
if ($xmluiExePath) {
  $addAttempts += ,@("mcp", "add", "xmlui", "--", $xmluiExePath, "mcp")
}

$added = $false
foreach ($attempt in $addAttempts) {
  $null = Invoke-Codex @attempt
  if ($LASTEXITCODE -eq 0) {
    Write-Log "MCP server 'xmlui' configured"
    $added = $true
    break
  }
}

if (-not $added) {
  Fail "Failed to configure MCP with 'codex mcp add'."
}

$null = Invoke-Codex mcp get xmlui
if ($LASTEXITCODE -eq 0) {
  Write-Log "Verified MCP server 'xmlui'"
} else {
  Fail "MCP server 'xmlui' not found after add attempt"
}
