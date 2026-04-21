@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev-setup.ps1" %*
exit /b %errorlevel%
