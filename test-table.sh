#!/bin/bash
# Test Table component with current virtua setting

echo "======================================"
echo "Table Component Test Runner"
echo "======================================"
echo ""

# Check current USE_VIRTUA setting
VIRTUA_ENABLED=$(grep "const USE_VIRTUA =" xmlui/src/components/Table/TableNative.tsx | grep -o "true\|false")
echo "Current USE_VIRTUA setting: $VIRTUA_ENABLED"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "⚠️  Dev server not running!"
  echo "Please start it in another terminal:"
  echo "  cd /Users/dotneteer/source/xmlui && npm run dev"
  echo ""
  read -p "Press enter when dev server is ready..."
fi

echo "Running Table tests..."
echo "======================================"
cd /Users/dotneteer/source/xmlui/xmlui
npx playwright test Table.spec.ts --reporter=line --workers=1

echo ""
echo "======================================"
echo "Test run complete"
echo "======================================"
