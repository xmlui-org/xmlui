# Building the XMLUI Core Package

This document explains how the XMLUI framework package itself is built using Vite. This is relevant for XMLUI framework contributors who need to understand the internal build process.

> **Note:** For building XMLUI applications or extensions, see [XMLUI Build System](./build-system.md). For repository structure and Turborepo orchestration, see [XMLUI Repository Structure](./xmlui-repo.md).

## Table of Contents

1. [Overview](#overview)
2. [Build Modes](#build-modes)
3. [Library Build (lib)](#library-build-lib)
4. [Standalone Build](#standalone-build)
5. [Metadata Build](#metadata-build)
6. [Build Process Flow](#build-process-flow)
7. [Vite Configuration](#vite-configuration)
8. [Development vs Production](#development-vs-production)
9. [Build Performance](#build-performance)
10. [Troubleshooting](#troubleshooting)

## ESM Migration

XMLUI has migrated to ES Modules (ESM). All packages use `"type": "module"` in package.json, and the build system outputs ESM by default. The CLI tools are built with tsdown, producing both ESM (`index.js`) and CommonJS (`index.cjs`) for compatibility.

## Overview

The XMLUI framework package is built using **Vite** with multiple build modes. The build configuration is defined in `xmlui/vite.config.ts` and supports three distinct modes.

**Build System:**

- **Build Tool:** Vite 7.x with Rollup
- **Module System:** ES Modules (ESM)
- **Configuration:** `xmlui/vite.config.ts`
- **CLI Build:** tsdown (outputs ESM + CommonJS)
- **Package Manager:** npm with clean-package for publishing
- **Task Orchestration:** Turborepo (see [XMLUI Repository Structure](./xmlui-repo.md))

**Quick Build Commands:**

```bash
# From workspace root
npm run build-xmlui              # Build entire XMLUI core package

# From xmlui/ directory
npm run build:bin                # Build CLI tools using tsdown
npm run build:xmlui              # Build library mode
npm run build:xmlui-standalone   # Build UMD bundle
npm run build:xmlui-metadata     # Extract component metadata
```

> **Note:** For comprehensive information about the monorepo structure, Turborepo orchestration, and cross-package builds, see [XMLUI Repository Structure](./xmlui-repo.md).

## Build Modes

| Mode           | Entry Point                   | Output Format        | Purpose                  |
| -------------- | ----------------------------- | -------------------- | ------------------------ |
| **lib**        | Multiple entries              | ES Modules (.js)     | npm package distribution |
| **standalone** | index-standalone.ts           | UMD bundle (.umd.js) | Buildless CDN deployment |
| **metadata**   | collectedComponentMetadata.ts | ES Module            | Documentation/LSP        |

## Library Build (lib)

The default build mode creates the npm package with multiple entry points for different framework features.

### Command

```bash
npm run build:xmlui
# Executes: vite build --mode lib
```

### Entry Points

The library build creates multiple entry points:

```typescript
{
  xmlui: "src/index.ts",                    // Main framework export
  "xmlui-parser": "src/parsers/xmlui-parser/index.ts",  // Parser standalone
  "language-server": "src/language-server/server.ts",   // Node.js LSP
  "language-server-web-worker": "src/language-server/server-web-worker.ts",  // Browser LSP
  "syntax-monaco": "src/syntax/monaco/index.ts",        // Monaco editor syntax
  "syntax-textmate": "src/syntax/textMate/index.ts"     // TextMate grammar
}
```

### Vite Plugins

- `@vitejs/plugin-react` - React JSX and Fast Refresh support
- `vite-plugin-svgr` - SVG to React component transformation
- `vite-plugin-yaml` - YAML file import support
- `vite-xmlui-plugin` - Transforms .xmlui and .xmlui.xs files
- `vite-plugin-lib-inject-css` - Injects CSS into JS bundles
- `vite-plugin-dts` - Generates TypeScript declaration files with rollup type bundling
- `rollup-plugin-copy` - Copies SCSS source files to dist

### Build Configuration

```typescript
{
  outDir: "dist/lib",
  formats: ["es"],              // ES modules
  minify: "terser",            // Terser minification
  rollupOptions: {
    external: [
      // Dependencies not bundled
      ...Object.keys(packageJson.dependencies),
      "react/jsx-runtime"
    ]
  }
}
```

### SCSS Handling

The build process copies all non-module SCSS files while preserving directory structure:

```
src/components/button/Button.scss
  → dist/lib/scss/components/button/Button.scss
```

This is implemented via `rollup-plugin-copy`:

```typescript
copy({
  hook: "writeBundle",
  targets: [
    {
      src: ["src/**/*.scss", "!src/**/*.module.scss"],
      dest: "dist/lib/scss",
      rename: (name, extension, fullPath) => {
        // Remove 'src/' prefix to preserve structure
        return fullPath.replace("src/", "");
      },
    },
  ],
});
```

### Output Structure

```
dist/
  ├── lib/
  │   ├── xmlui.js                      # Main framework (ESM)
  │   ├── xmlui.d.ts                    # Type definitions
  │   ├── xmlui-parser.js               # Parser (ESM)
  │   ├── language-server.js            # LSP server (ESM)
  │   ├── language-server-web-worker.js # Browser LSP (ESM)
  │   ├── syntax-monaco.js              # Monaco syntax (ESM)
  │   ├── syntax-textmate.js            # TextMate grammar (ESM)
  │   ├── *.css                         # Component styles
  │   ├── vite-xmlui-plugin/
  │   │   └── index.js                  # Vite plugin (ESM)
  │   └── scss/                         # Source SCSS files
  ├── bin/
  │   ├── index.js                      # CLI entry (ESM)
  │   └── index.cjs                     # CLI entry (CommonJS)
  └── standalone/
      └── xmlui-standalone.umd.js       # UMD bundle
```

### NPM Package Exports

After `clean-package` transforms package.json during publish:

```json
{
  "main": "./dist/standalone/xmlui-standalone.umd.js",
  "module": "./dist/lib/xmlui.js",
  "types": "./dist/lib/xmlui.d.ts",
  "exports": {
    ".": {
      "import": "./dist/lib/xmlui.js",
      "require": "./dist/standalone/xmlui-standalone.umd.js"
    },
    "./language-server": {
      "import": "./dist/lib/language-server.js",
      "require": "./dist/lib/language-server.js"
    },
    "./language-server-web-worker": {
      "import": "./dist/lib/language-server-web-worker.js",
      "require": "./dist/lib/language-server-web-worker.js"
    },
    "./parser": {
      "import": "./dist/lib/xmlui-parser.js",
      "require": "./dist/lib/xmlui-parser.js"
    },
    "./*.css": {
      "import": "./dist/lib/*.css",
      "require": "./dist/lib/*.css"
    },
    "./index.scss": {
      "import": "./dist/lib/scss/index.scss",
      "require": "./dist/lib/scss/index.scss"
    },
    "./themes.scss": {
      "import": "./dist/lib/scss/components-core/theming/_themes.scss",
      "require": "./dist/lib/scss/components-core/theming/_themes.scss"
    },
    "./vite-xmlui-plugin": {
      "import": "./dist/lib/vite-xmlui-plugin/index.js",
      "require": "./dist/lib/vite-xmlui-plugin/index.js"
    },
    "./syntax/monaco": {
      "import": "./dist/lib/syntax-monaco.js",
      "require": "./dist/lib/syntax-monaco.js"
    },
    "./syntax/textmate": {
      "import": "./dist/lib/syntax-textmate.js",
      "require": "./dist/lib/syntax-textmate.js"
    },
    "./testing": {
      "import": "./dist/lib/testing.js",
      "require": "./dist/lib/testing.js"
    }
  }
}
```

## Standalone Build

Creates a self-contained UMD bundle for buildless deployment via CDN.

### Command

```bash
npm run build:xmlui-standalone
# Executes: vite build --mode standalone
```

### Purpose

Creates a self-contained UMD bundle that includes all dependencies for buildless deployment via CDN or static hosting.

### Entry Point

```typescript
entry: "src/index-standalone.ts";
```

### Build Configuration

```typescript
{
  outDir: "dist/standalone",
  name: "xmlui",               // Global variable name
  formats: ["umd"],            // Universal Module Definition
  minify: "terser",
  rollupOptions: {
    external: [],              // Bundle ALL dependencies
    output: {
      globals: {               // Map externals to globals
        react: "React",
        "react-dom": "ReactDOM"
      }
    }
  }
}
```

### Environment Variables

```typescript
define: {
  "process.env": {
    NODE_ENV: env.NODE_ENV,
    VITE_MOCK_ENABLED: true,
    VITE_MOCK_WORKER_LOCATION: "mockApi.js",
    VITE_USED_COMPONENTS_XmluiCodeHightlighter: "false",
    VITE_USED_COMPONENTS_Tree: "false",
    VITE_USED_COMPONENTS_TableEditor: "false",
    VITE_XMLUI_VERSION: `${version} (built ${date})`
  }
}
```

### Output

```
dist/standalone/
  └── xmlui-standalone.umd.js    # ~2MB self-contained bundle
```

### Usage

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Buildless XMLUI App</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="https://unpkg.com/xmlui@latest/dist/standalone/xmlui-standalone.umd.js"></script>
  </body>
</html>
```

## Metadata Build

Extracts component metadata for documentation generation and language server support.

### Command

```bash
npm run build:xmlui-metadata
# Executes: vite build --mode metadata
```

### Purpose

Extracts component metadata for:

- Documentation generation
- Language server autocomplete
- Component explorer tools
- API reference generation

### Entry Point

```typescript
entry: "src/components/collectedComponentMetadata.ts";
```

### Build Configuration

```typescript
{
  outDir: "dist/metadata",
  name: "xmlui-metadata",
  treeshake: "smallest",       // Aggressive tree-shaking
  rollupOptions: {
    external: [...dependencies]
  }
}
```

### Vite Plugins

Only uses `vite-xmlui-plugin` to process component files without React/SVGR overhead.

### Output

```
dist/metadata/
  └── xmlui-metadata.js         # Component metadata bundle
```

### Metadata Workflow

```bash
# 1. Extract metadata
npm run build:xmlui-metadata

# 2. Generate documentation from metadata
npm run generate-docs

# 3. Create summary files
npm run generate-docs-summaries

# 4. Export theme files
npm run export-themes
```

## Build Process Flow

### Complete Build Sequence

**Using Turborepo (recommended):**

```bash
# From workspace root - builds everything
npm run build-xmlui
# Executes: turbo run build:xmlui-all
```

This internally runs in order:

1. `build:bin` - Compile CLI tools
2. `build:xmlui-metadata` - Extract component metadata
3. `build:xmlui` - Build library mode
4. `build:xmlui-standalone` - Build UMD bundle
5. `build:extension` - Build extension packages

> **Note:** For detailed task dependencies and Turborepo orchestration, see [XMLUI Repository Structure](./xmlui-repo.md).

**Manual build sequence** (from xmlui/ directory):

```bash
# 1. Build CLI tools
npm run build:bin
# Compiles bin/index.ts using tsdown to ESM + CommonJS
# Output: dist/bin/index.js (ESM), dist/bin/index.cjs (CommonJS)

# 2. Build library for npm
npm run build:xmlui
# Vite build with mode=lib
# Output: dist/lib/

# 3. Build standalone runtime
npm run build:xmlui-standalone
# Vite build with mode=standalone
# Output: dist/standalone/

# 4. Extract metadata
npm run build:xmlui-metadata
# Vite build with mode=metadata
# Output: dist/metadata/

# 5. Publish to npm
npm publish
# clean-package transforms package.json
# Publishes dist/ folder contents
```

### Package Transformation

The `clean-package` tool transforms package.json during publish:

**Before publish (development):**

```json
{
  "main": "./src/index.ts",
  "bin": {
    "xmlui": "./bin/bootstrap.js"
  }
}
```

**After publish (production):**

```json
{
  "main": "./dist/lib/xmlui.js",
  "bin": {
    "xmlui": "dist/bin/index.js"
  }
}
```

> **Note on CLI Development:**
> In the development environment, the `xmlui` command points to `bin/bootstrap.js`. This file uses `tsx` to execute the CLI's TypeScript source (`bin/index.ts`) on-the-fly. This allows for rapid development of the CLI without requiring a separate build step for every change.
>
> For production, `clean-package` replaces the `bin` entry to point to the compiled `dist/bin/index.js`, ensuring the published package does not rely on `tsx`.

## Vite Configuration

### Target and Optimization

```typescript
{
  esbuild: {
    target: "es2020"
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020"
    }
  }
}
```

### Module Resolution

```typescript
{
  resolve: {
    alias: {
      lodash: "lodash-es"; // Use ES modules version
    }
  }
}
```

### Build Optimization Features

- **Terser minification** - Production code minification
- **Tree-shaking** - Removes unused code
- **Code splitting** - Multiple entry points
- **CSS extraction** - Via lib-inject-css plugin
- **Type bundling** - Via dts plugin with rollupTypes
- **SCSS preservation** - Copies source files to dist

### Browser Targets

```json
{
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
```

## Development vs Production

### Development Workflow

```bash
# Terminal 1: Watch mode for library
npm run build:bin
xmlui build-lib --watch

# Terminal 2: Dev server for test app
cd src/testing/infrastructure
xmlui start

# Or use test bed
npm run start-test-bed
```

### Production Build

```bash
# Complete build pipeline
npm run build:bin
npm run build:xmlui
npm run build:xmlui-standalone
npm run build:xmlui-metadata

# Verify outputs
ls -la dist/lib/
ls -la dist/standalone/
ls -la dist/metadata/

# Test locally before publishing
npm pack
npm install xmlui-0.10.19.tgz
```

### Testing Builds

```bash
# Unit tests
npm run test:unit

# E2E tests (smoke)
npm run test:e2e-smoke

# E2E tests (full)
npm run test:e2e-non-smoke

# Interactive E2E
npm run test:e2e-ui

# Test summary
npm run test:e2e-summary
```

## Build Performance

### Build Times (approximate)

**Individual builds:**

- **Library build:** ~30-60 seconds
- **Standalone build:** ~60-90 seconds (includes all dependencies)
- **Metadata build:** ~10-20 seconds
- **CLI tools build:** ~5-10 seconds (tsdown dual-format output)

**Full pipeline:**

- **build:xmlui-all:** ~2-3 minutes (first run)

> **Note:** For Turborepo caching benefits and incremental build times, see [XMLUI Repository Structure](./xmlui-repo.md).

### Output Sizes

- **Library bundle (xmlui.js):** ~400KB (ESM, minified, no deps)
- **Standalone bundle:** ~2MB (UMD, includes all deps)
- **CSS files:** ~100KB total
- **Type definitions:** ~200KB
- **SCSS sources:** ~50KB

### Optimization Strategies

1. **External dependencies** - Library mode doesn't bundle deps
2. **Code splitting** - Multiple entry points reduce initial load
3. **Tree-shaking** - Removes unused code
4. **Minification** - Terser for production builds
5. **CSS injection** - Styles bundled with JS for convenience

## Troubleshooting

### Clear Build Cache

```bash
# From workspace root - clear all build artifacts
rm -rf xmlui/dist/
rm -rf packages/*/dist/
rm -rf docs/dist/
rm -rf blog/dist/

# Clear Vite cache
rm -rf xmlui/node_modules/.vite/
rm -rf packages/*/node_modules/.vite/

# Clear Turbo cache
rm -rf node_modules/.cache/turbo/

# Or use turbo command
turbo run build:xmlui-all --force

# Rebuild everything
npm run build-xmlui
```

### Verify Build Output

```bash
# From workspace root
cd xmlui

# Check all entry points
ls -la dist/lib/*.js

# Verify TypeScript declarations
ls -la dist/lib/*.d.ts

# Check SCSS copy
find dist/lib/scss -name "*.scss"

# Verify standalone bundle
ls -lh dist/standalone/xmlui-standalone.umd.js

# Check metadata
ls -la dist/metadata/
```

### Debug Build Issues

```bash
# Verbose Vite output
DEBUG=vite:* npm run build:xmlui

# Analyze bundle size
npx vite-bundle-visualizer

# Check for dependency issues
npm ls

# Verify TypeScript compilation
cd xmlui
npx tsc --noEmit
```

> **Note:** For Turborepo debugging commands, see [XMLUI Repository Structure](./xmlui-repo.md).

### Common Issues

**Issue: Missing .d.ts files**

```bash
# Ensure vite-plugin-dts is installed
cd xmlui
npm install --save-dev vite-plugin-dts

# Check tsconfig.json includes src/
npm run build:xmlui
```

**Issue: SCSS files not copied**

```bash
# Verify rollup-plugin-copy configuration
# Check that src/**/*.scss exists
cd xmlui
find src -name "*.scss" | head -10
```

**Issue: Type conflicts**

```bash
# Clear type cache
rm -rf node_modules/.cache/typescript/

# Rebuild types
cd xmlui
npm run build:xmlui
```

### Performance Issues

**Slow initial builds:**

- Ensure dependencies are installed: `npm install`
- Check disk I/O: Build on SSD if possible
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`

> **Note:** For workspace-level issues, Turborepo troubleshooting, and cache problems, see [XMLUI Repository Structure](./xmlui-repo.md).

## See Also

- [XMLUI Repository Structure](./xmlui-repo.md) - Monorepo architecture and Turborepo orchestration
- [XMLUI Build System](./build-system.md) - Application and extension builds
- [Standalone Rendering Architecture](./standalone-app.md) - Runtime architecture
- [Container-Based State Management](./containers.md) - State system
