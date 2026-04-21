@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0configure-mcp.ps1" %*
exit /b %errorlevel%
