Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/common.ps1"

Write-Log "Installing XMLUI CLI"

$downloadUrl = "https://github.com/xmlui-org/xmlui-cli/releases/latest/download/xmlui-win-x64.zip"
$installDir = if ($env:XMLUI_CLI_INSTALL_DIR) { $env:XMLUI_CLI_INSTALL_DIR } else { Join-Path $HOME "bin" }

New-Item -ItemType Directory -Force -Path $installDir | Out-Null

$tmpDir = Join-Path $env:TEMP ("xmlui-cli-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
$archivePath = Join-Path $tmpDir "xmlui-cli.zip"

try {
  Write-Log "Downloading XMLUI CLI from $downloadUrl"
  Invoke-WebRequest -Uri $downloadUrl -OutFile $archivePath

  Write-Log "Extracting archive"
  Expand-Archive -Path $archivePath -DestinationPath $tmpDir -Force

  $exePath = Get-ChildItem -Path $tmpDir -Recurse -File -Filter "xmlui.exe" | Select-Object -First 1 -ExpandProperty FullName
  if (-not $exePath) {
    Fail "Could not find xmlui.exe in downloaded archive."
  }

  $targetPath = Join-Path $installDir "xmlui.exe"
  Copy-Item -LiteralPath $exePath -Destination $targetPath -Force
  Write-Log "Installed: $targetPath"

  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  if (-not $userPath) {
    $userPath = ""
  }

  $pathSegments = $userPath -split ";" | Where-Object { $_ -ne "" }
  if ($pathSegments -notcontains $installDir) {
    $newUserPath = if ($userPath) { "$userPath;$installDir" } else { $installDir }
    [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
    Write-Log "Added $installDir to user PATH"
  } else {
    Write-Log "$installDir is already on user PATH"
  }

  if (($env:Path -split ";") -notcontains $installDir) {
    $env:Path = "$env:Path;$installDir"
  }

  $xmluiCmd = Get-XmluiCommand
  if ($xmluiCmd) {
    Write-Log "CLI is available on PATH via '$xmluiCmd'"
  } else {
    Write-WarnLog "CLI is not yet available in this shell. Open a new terminal."
  }
}
finally {
  if (Test-Path -LiteralPath $tmpDir) {
    Remove-Item -LiteralPath $tmpDir -Recurse -Force
  }
}
