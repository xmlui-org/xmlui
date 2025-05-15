@echo off
:: Check if npx is available
where npx >nul 2>nul
if %errorlevel% equ 0 (
    :: Check if the directory exists, if not, create it (temp solution, fixed in newer npm, from 10.8.3)
    if not exist "%UserProfile%\AppData\Roaming\npm" (
        mkdir "%UserProfile%\AppData\Roaming\npm"
    )

    call npx -y http-server -o
) else (
    echo "npx is not available. Please install Node.js and npm: https://nodejs.org/en/download/prebuilt-installer"
    pause;
)