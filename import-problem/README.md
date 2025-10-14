# Import Problem Reproduction

This is a minimal reproduction of the ES module/CommonJS import issue that occurs when:

1. A **CommonJS package** (core) incorrectly configures its `package.json` exports
2. An **ES module package** (extension) tries to import named exports from the CommonJS package
3. Node.js cannot find the named exports and throws the error:

```
SyntaxError: Named export 'expect' not found. The requested module 'core' is a CommonJS module, which may not support all module.exports as named exports.
CommonJS modules can always be imported via the default export, for example using:

import pkg from 'core';
const { test, expect } = pkg;
```

## Project Structure

```
import-problem/
├── core/                    # CommonJS package
│   ├── package.json         # No "type": "module"
│   └── force-error.js       # CommonJS file with problematic exports
├── extension/               # ES Module package
│   ├── package.json         # Has "type": "module"
│   ├── print.js             # ES module trying to import named exports
│   └── node_modules/
│       └── core/            # Symlink to ../core
└── README.md
```

## The Problem

### Core Package Issues:

1. **Incorrect package.json exports**: Points both `import` and `require` to the same CommonJS file
2. **Non-enumerable exports**: The CommonJS module uses `Object.defineProperty` with `enumerable: false`, making Node.js unable to detect named exports for ES module consumption

### Extension Package:

- Uses `"type": "module"` in package.json
- Tries to import named exports: `import { test, expect } from "core"`
- Node.js can't resolve these as named exports from the CommonJS module

## How to Reproduce

1. Link the core package to the extension package to simulate a monorepo:

   ```bash
   ln -s core extension/node_modules/core
   ```

2. Navigate to the extension directory:

   ```bash
   cd import-problem/extension
   ```

3. Run the problematic import:

   ```bash
   node print.js
   ```

4. You'll see the error:
   ```
   SyntaxError: Named export 'expect' not found. The requested module 'core' is a CommonJS module...
   ```

## Verification Commands

### Test the problem:

```bash
cd import-problem/extension
node print.js  # Shows the error
```

### Test the workaround:

```bash
cd import-problem/extension
node print-workaround.js  # Works using default import
```

### Test the proper fix:

```bash
# First, update core/package.json to point to working-version.js
# Then run:
cd import-problem/extension
node test-working.js  # Works with proper CommonJS exports
```

## The Root Cause

The core issue is in `core/package.json`:

```json
{
  "exports": {
    ".": {
      "import": "./force-error.js", // ❌ Wrong: Points to CommonJS file
      "require": "./force-error.js" // ✅ Correct: Points to CommonJS file
    }
  }
}
```

And the CommonJS file (`core/force-error.js`) exports in a way that Node.js cannot detect as named exports:

```javascript
// Creates non-enumerable properties that ES modules can't see as named exports
Object.defineProperty(moduleExports, "test", {
  value: test,
  enumerable: false, // ❌ This prevents ES module detection
  writable: false,
  configurable: false,
});
```

## Solutions

### Option 1: Fix the exports configuration

```json
{
  "exports": {
    ".": {
      "import": "./esm-version.mjs", // ✅ Point to ES module version
      "require": "./force-error.js" // ✅ Point to CommonJS version
    }
  }
}
```

### Option 2: Use default import in extension

```javascript
// Instead of:
import { test, expect } from "core";

// Use:
import pkg from "core";
const { test, expect } = pkg;
```

### Option 3: Fix CommonJS exports

```javascript
// Instead of non-enumerable properties, use:
module.exports.test = test;
module.exports.expect = expect;

// Or:
exports.test = test;
exports.expect = expect;
```

## Key Learnings

1. **Package exports matter**: The `"import"` condition should point to ES modules, `"require"` to CommonJS
2. **Non-enumerable properties break ES module interop**: Node.js needs to see exports as enumerable properties
3. **Modern Node.js is good at interop**: Simple cases work, but edge cases still fail
4. **Monorepo symlinks amplify the problem**: Development works with source files, but production fails with built packages

This reproduction demonstrates why proper package configuration and export strategies are crucial for modern JavaScript package development.
