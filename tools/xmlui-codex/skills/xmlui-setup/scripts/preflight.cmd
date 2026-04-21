@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0preflight.ps1" %*
exit /b %errorlevel%
