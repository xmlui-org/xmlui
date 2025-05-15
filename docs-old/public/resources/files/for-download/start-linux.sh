#!/usr/bin/env bash

# Check if npx is available
if command -v npx > /dev/null 2>&1; then
    # Run npx http-server -y -o
    npx -y http-server -o
else
    echo "npx is not available. Please install Node.js and npm."
fi
