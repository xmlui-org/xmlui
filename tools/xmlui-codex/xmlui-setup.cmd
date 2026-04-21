@echo off
setlocal
set "SCRIPT_DIR=%~dp0skills\xmlui-setup\scripts"
call "%SCRIPT_DIR%\xmlui-setup.cmd" %*
exit /b %errorlevel%
