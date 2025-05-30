#!/bin/bash

# Build and test the XMLUI VS Code extension
# This script will:
# 1. Build the extension
# 2. Package it as a VSIX
# 3. Generate test samples

# Set the working directory
CD_DIR="/Users/dotneteer/source/xmlui/tools/vscode"
cd "$CD_DIR" || exit 1

echo "Building XMLUI VS Code extension..."

# Ensure test directory exists
mkdir -p test-samples

# Build the extension with esbuild
echo "Running esbuild to bundle the extension..."
node esbuild.js --production

# Check if the build succeeded
if [ $? -ne 0 ]; then
  echo "Build failed!"
  exit 1
fi

# Package the extension as a VSIX
echo "Packaging as VSIX..."
npx @vscode/vsce package

# Check if packaging succeeded
if [ $? -ne 0 ]; then
  echo "Packaging failed!"
  exit 1
fi

# Generate test samples
echo "Generating test samples..."
./generate-test-sample.sh

echo "Build completed successfully!"
echo "You can now install the extension in VS Code:"
echo "1. In VS Code, press Ctrl+Shift+P (Cmd+Shift+P on Mac)"
echo "2. Type 'Install from VSIX' and select the command"
echo "3. Choose the .vsix file in the $CD_DIR directory"
echo ""
echo "To test the formatter:"
echo "1. Open a .xmlui file"
echo "2. Press Alt+Shift+F (Option+Shift+F on Mac) to format the document"
echo "3. Test samples are available in the test-samples directory"
