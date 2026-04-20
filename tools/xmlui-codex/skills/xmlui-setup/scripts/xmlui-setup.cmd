@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0xmlui-setup.ps1" %*
exit /b %errorlevel%
