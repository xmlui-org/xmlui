#!/bin/bash

# Check the operating system type
os_type=$(uname)

if [ "$os_type" = "Linux" ]; then
    # If Linux, restart the script with the /usr/bin/env shebang
    exec /usr/bin/env bash "$0" "$@"
elif [ "$os_type" = "Darwin" ]; then
    # If macOS (Darwin), restart the script with the /bin/bash shebang
    exec /bin/bash "$0" "$@"
else
    echo "Unsupported operating system."
    exit 1
fi

# Check if npx is available
if command -v npx > /dev/null 2>&1; then
    # Run npx http-server -y -o
    npx -y http-server -o
else
    echo "npx is not available. Please install Node.js and npm."
fi
