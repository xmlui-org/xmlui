# XMLUI Build System

This document explains XMLUI's build system architecture, CLI tools, and build configurations for application deployment and extension development.

> **Note:** For building the XMLUI framework package itself, see [Building the XMLUI Core Package](./build-xmlui.md).

## ESM Migration

XMLUI now uses ES Modules (ESM) exclusively. All packages declare `"type": "module"` in package.json, and builds output ESM by default. The CLI tools use tsdown to generate both ESM and CommonJS for compatibility.

## Table of Contents

1. [Overview](#overview)
2. [CLI Commands](#cli-commands)
   - [xmlui start](#xmlui-start)
   - [xmlui build](#xmlui-build)
   - [xmlui preview](#xmlui-preview)
   - [xmlui build-lib](#xmlui-build-lib)
   - [xmlui zip-dist](#xmlui-zip-dist)
3. [Build Modes](#build-modes)
4. [Vite Plugin System](#vite-plugin-system)
5. [Build Configurations](#build-configurations)
6. [Building XMLUI Extensions](#building-xmlui-extensions)
7. [Package Structure](#package-structure)
8. [Development Workflow](#development-workflow)

## Overview

XMLUI uses a multi-mode build system built on **Vite** that supports:

- **Development server** with hot module reloading for rapid app development
- **Production builds** for XMLUI applications with optimized assets
- **Extension builds** for creating reusable component libraries
- **Metadata extraction** for documentation and language server support

The build system is orchestrated through the `xmlui` CLI command, which provides a unified interface for all build operations.

## CLI Commands

The XMLUI CLI is installed via the `bin/bootstrap.js` entry point and provides commands for development, building, and deployment.

### xmlui start

Starts a Vite development server with hot module reloading for rapid application development.

**Usage:**

```bash
xmlui start [options]
```

**Options:**

- `--port <number>` - Server port (default: Vite's default port)
- `--withMock [boolean]` - Enable MSW API mocking (default: true)
- `--proxy <pattern->target>` - Proxy API requests (e.g., `/api->http://localhost:3000`)

**Examples:**

```bash
# Start dev server with default settings
xmlui start

# Start on port 3000 without mocking
xmlui start --port 3000 --withMock=false

# Start with API proxy
xmlui start --proxy /api->http://localhost:8080
```

**Behavior:**

- Enables full build mode (`VITE_BUILD_MODE=ALL`) with all components included
- Automatically enables MSW for API interception unless disabled
- Provides instant feedback through HMR when source files change
- Compiles `.xmlui` and `.xmlui.xs` files on-demand via vite-xmlui-plugin

### xmlui build

Builds an XMLUI application for production deployment with optimized assets.

**Usage:**

```bash
xmlui build [options]
```

**Options:**

- `--buildMode <mode>` - Build mode: `CONFIG_ONLY`, `INLINE_ALL`, or `ALL` (default: `CONFIG_ONLY` in dev, auto in prod)
- `--flatDist [boolean]` - Flatten dist directory structure for simple hosting (default: false in dev, true in prod)
- `--withMock [boolean]` - Include MSW API mocking in build (default: true in dev, false in prod)
- `--withHostingMetaFiles [boolean]` - Include hosting metadata files (serve.json, web.config) (default: false in dev, false in prod)
- `--withRelativeRoot [boolean]` - Use relative paths for root references (default: false in dev, true in prod)
- `--prod` - Shorthand for production-ready settings

**Build Modes:**

| Mode          | Description                                             | Use Case                                 |
| ------------- | ------------------------------------------------------- | ---------------------------------------- |
| `CONFIG_ONLY` | Bundles only configuration; loads components at runtime | Development and dynamic apps             |
| `INLINE_ALL`  | Bundles entire app including all components             | Production with minimal runtime overhead |
| `ALL`         | Full build with both inline and runtime loading support | Maximum flexibility                      |

**Examples:**

```bash
# Development build
xmlui build

# Production build with defaults
xmlui build --prod

# Production build with specific settings
xmlui build --buildMode=INLINE_ALL --flatDist --withHostingMetaFiles

# Test deployment build with mocking
xmlui build --buildMode=INLINE_ALL --withMock --withHostingMetaFiles
```

**Output Structure:**

_Standard (flatDist=false):_

```
dist/
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js
  │   └── index-[hash].css
  └── resources/
      └── (resource files)
```

_Flattened (flatDist=true):_

```
dist/
  ├── index.html
  ├── ui_assets_index-[hash].js
  ├── ui_assets_index-[hash].css
  ├── ui_resources_logo.png
  └── (all files at root with ui_ prefix)
```

### xmlui preview

Serves a production build locally for testing before deployment.

**Usage:**

```bash
xmlui preview [options]
```

**Options:**

- `--proxy <pattern->target>` - Proxy API requests during preview

**Example:**

```bash
# Build and preview
xmlui build --prod
xmlui preview

# Preview with API proxy
xmlui preview --proxy /api->http://localhost:8080
```

### xmlui build-lib

Builds the XMLUI framework itself as a distributable npm package. This command is used during XMLUI framework development, not for application builds.

**Usage:**

```bash
xmlui build-lib [options]
```

**Options:**

- `--watch [boolean]` - Watch mode for continuous rebuilds during development (default: false)
- `--mode <mode>` - Build mode: `lib`, `standalone`, or `metadata`

**Examples:**

```bash
# Build library for npm distribution
npm run build:xmlui

# Build standalone bundle
npm run build:xmlui-standalone

# Build with watch mode during development
xmlui build-lib --watch
```

### xmlui zip-dist

Creates a ZIP archive of the dist directory for deployment.

**Usage:**

```bash
xmlui zip-dist [options]
```

**Options:**

- `--source <path>` - Source directory to zip (default: `dist`)
- `--target <filename>` - Output ZIP filename (default: `ui.zip`)

**Example:**

```bash
xmlui build --prod
xmlui zip-dist --target production.zip
```

## Build Modes

XMLUI applications can be built in three distinct modes that control how components and configurations are bundled:

### CONFIG_ONLY Mode

**Characteristics:**

- Only configuration and entry point are bundled
- Components loaded at runtime from source files
- Smallest bundle size
- Requires buildless component discovery at runtime

**Use Cases:**

- Development environments
- Applications with frequently changing components
- Scenarios where component hot-swapping is needed

### INLINE_ALL Mode

**Characteristics:**

- All components pre-compiled and bundled
- No runtime parsing or component discovery
- Fastest startup time
- Larger initial bundle size

**Use Cases:**

- Production deployments
- Performance-critical applications
- Environments with restricted runtime file access

### ALL Mode

**Characteristics:**

- Hybrid approach with both bundled and runtime loading
- Maximum flexibility
- Balanced bundle size and performance

**Use Cases:**

- Complex applications with both static and dynamic components
- Testing and staging environments

## Vite Plugin System

The `vite-xmlui-plugin` transforms XMLUI source files during the build process.

### Plugin Responsibilities

1. **Transform .xmlui files** - Parses markup into component definitions
2. **Transform .xmlui.xs files** - Processes code-behind scripts
3. **Transform .xmlui.xm files** - Processes module scripts
4. **Error handling** - Converts parse errors into error components
5. **Code generation** - Produces ESM modules for Vite bundling

### Transformation Pipeline

```
.xmlui file
  ↓
xmlUiMarkupToComponent()
  ↓
ComponentDef object
  ↓
dataToEsm()
  ↓
JavaScript module
```

```
.xmlui.xs file
  ↓
Parser.parseStatements()
  ↓
collectCodeBehindFromSource()
  ↓
Code-behind definition
  ↓
dataToEsm()
  ↓
JavaScript module
```

### Plugin Configuration

The plugin is configured in `vite.config.ts`:

```typescript
import ViteXmlui from "./bin/vite-xmlui-plugin";

export default {
  plugins: [
    ViteXmlui({
      // Plugin options (currently none defined)
    }),
  ],
};
```

## Build Configurations

XMLUI uses Vite with mode-specific configurations for different build targets.

### Library Build (lib)

**Purpose:** Build XMLUI framework for npm distribution

**Entry Points:**

- `xmlui` - Main framework export
- `xmlui-parser` - Parser utilities
- `language-server` - Node.js language server
- `language-server-web-worker` - Browser-based language server
- `syntax-monaco` - Monaco editor syntax support
- `syntax-textmate` - TextMate grammar support

**Output Format:** ES modules (ESM)

**Key Features:**

- TypeScript declarations generated via `vite-plugin-dts`
- CSS injection via `vite-plugin-lib-inject-css`
- SCSS source files copied to `dist/lib/scss/`
- React and SVG support
- Rollup type bundling for optimized .d.ts files

**NPM Package Exports:**

```json
{
  ".": "./dist/lib/xmlui.js",
  "./parser": "./dist/lib/xmlui-parser.js",
  "./language-server": "./dist/lib/language-server.js",
  "./vite-xmlui-plugin": "./dist/scripts/bin/vite-xmlui-plugin.js",
  "./*.css": "./dist/lib/*.css",
  "./index.scss": "./dist/lib/scss/index.scss"
}
```

### Standalone Build (standalone)

**Purpose:** Build single-file XMLUI runtime for buildless deployments

**Entry Point:** `src/index-standalone.ts`

**Output Format:** UMD bundle (`xmlui-standalone.umd.js`)

**Key Features:**

- Self-contained runtime with all dependencies
- MSW worker enabled for API mocking
- Version stamping with build date
- Can be loaded via `<script>` tag in browsers
- Supports buildless app execution

**Use Cases:**

- CDN distribution
- Buildless application deployment
- Prototyping and demos
- Environments without npm/build tools

### Metadata Build (metadata)

**Purpose:** Extract component metadata for documentation and tooling

**Entry Point:** `src/components/collectedComponentMetadata.ts`

**Output:** `xmlui-metadata.js`

**Use Cases:**

- Generating documentation
- Language server autocomplete
- Component explorer tools
- API reference generation

**Workflow:**

```bash
# Extract metadata
npm run build:xmlui-metadata

# Generate documentation from metadata
npm run generate-docs

# Create summary files
npm run generate-docs-summaries
```

## Package Structure

### Source Layout

```
src/
  ├── index.ts                    # Main framework entry
  ├── index-standalone.ts         # Standalone runtime entry
  ├── components/                 # Core components
  ├── parsers/                    # .xmlui parser
  ├── language-server/            # LSP implementation
  ├── syntax/                     # Editor syntax support
  └── styles/                     # Framework SCSS
```

### Build Output (after npm publish)

```
dist/
  ├── lib/                        # Library build
  │   ├── xmlui.js
  │   ├── xmlui.d.ts
  │   ├── xmlui-parser.js
  │   ├── language-server.js
  │   └── scss/                   # SCSS source files
  ├── standalone/                 # Standalone build
  │   └── xmlui-standalone.umd.js
  ├── metadata/                   # Metadata build
  │   └── xmlui-metadata.js
  └── bin/
      └── index.js
```

### Bin Scripts

```
bin/
  ├── bootstrap.js                # CLI entry (imports index.ts via tsx)
  ├── index.ts                    # Command router
  ├── build.ts                    # Build implementation
  ├── build-lib.ts                # Library build
  ├── start.ts                    # Dev server
  ├── preview.ts                  # Preview server
  ├── vite-xmlui-plugin.ts        # Vite plugin
  └── viteConfig.ts               # Shared Vite config
```

## Building XMLUI Extensions

XMLUI extensions are npm packages that provide reusable component libraries. The build system supports extension development through the same CLI commands used for framework and application builds.

### Extension Build Commands

Extensions use standard npm scripts that invoke the `xmlui` CLI:

**package.json example:**

```json
{
  "scripts": {
    "start": "xmlui start",
    "build:extension": "xmlui build-lib",
    "build-watch": "xmlui build-lib --watch",
    "build:demo": "xmlui build",
    "build:meta": "xmlui build-lib --mode=metadata"
  }
}
```

**Command Reference:**

| Command                   | CLI Equivalent                    | Purpose                    | Output                            |
| ------------------------- | --------------------------------- | -------------------------- | --------------------------------- |
| `npm start`               | `xmlui start`                     | Dev server for demo app    | Dev server with HMR               |
| `npm run build:extension` | `xmlui build-lib`                 | Build extension library    | `dist/` with ESM .js, .d.ts, .css |
| `npm run build-watch`     | `xmlui build-lib --watch`         | Watch mode for development | Continuous rebuilds               |
| `npm run build:demo`      | `xmlui build`                     | Build demo application     | Production demo build             |
| `npm run build:meta`      | `xmlui build-lib --mode=metadata` | Extract component metadata | Metadata for docs/LSP             |

### Extension Build Workflow

**Development Process:**

```bash
# Terminal 1: Watch extension builds
npm run build-watch

# Terminal 2: Run demo app with HMR
npm start
```

**Build Output:**

```
dist/
  ├── xmlui-extension-name.js      # ES module bundle
  ├── xmlui-extension-name.d.ts    # TypeScript declarations
  └── *.css                        # Component styles
```

### Extension Distribution

**Publishing to npm:**

```bash
# Build all artifacts
npm run build:extension
npm run build:meta

# Publish
npm publish
```

**Package Configuration:**

```json
{
  "name": "xmlui-myextension",
  "type": "module",
  "main": "./dist/xmlui-myextension.js",
  "types": "./dist/xmlui-myextension.d.ts",
  "exports": {
    ".": "./dist/xmlui-myextension.js",
    "./*.css": "./dist/*.css"
  },
  "files": ["dist"]
}
```

### Using Extensions

**Installation:**

```bash
npm install xmlui-myextension
```

**Integration:**

```typescript
import { startApp } from "xmlui";
import myExtension from "xmlui-myextension";
import "xmlui-myextension/ComponentName.css";

const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, [myExtension]);
```

### Example: xmlui-website-blocks

**Reference implementation in the monorepo:**

```
packages/xmlui-website-blocks/
  ├── package.json          # Extension package config
  ├── index.ts              # Entry point with startApp
  ├── src/                  # Extension components
  │   └── index.tsx         # Component registry export
  ├── demo/                 # Demo XMLUI application
  │   └── Main.xmlui
  └── dist/                 # Build output
```

**Build commands:**

```bash
cd packages/xmlui-website-blocks

# Development
npm start                    # Demo app at http://localhost:5173

# Building
npm run build:extension      # Library build
npm run build:demo          # Demo app build
npm run build:meta          # Metadata extraction
```

## Development Workflow

### Framework Development

**Setup:**

```bash
cd xmlui
npm install
```

**Development Loop:**

```bash
# Terminal 1: Watch mode for library
npm run build:bin
xmlui build-lib --watch

# Terminal 2: Dev server for test app
cd src/testing/infrastructure
xmlui start
```

**Testing:**

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e-smoke
npm run test:e2e-non-smoke

# Interactive E2E
npm run test:e2e-ui
```

**Publishing:**

```bash
# Build all artifacts
npm run build:xmlui
npm run build:xmlui-standalone
npm run build:xmlui-metadata

# Publish to npm (uses clean-package to transform package.json)
npm publish
```

### Application Development

**Create New App:**

```bash
# Create app directory
mkdir my-xmlui-app
cd my-xmlui-app

# Initialize with Main.xmlui
echo '<App><Text>Hello XMLUI</Text></App>' > Main.xmlui

# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
  <head>
    <title>My XMLUI App</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="https://unpkg.com/xmlui@latest/dist/standalone/xmlui-standalone.umd.js"></script>
  </body>
</html>
EOF

# Serve with any static server
npx serve
```

**Built App Development:**

```bash
# Install xmlui
npm install xmlui

# Add vite config
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ViteXmlui from 'xmlui/vite-xmlui-plugin';

export default defineConfig({
  plugins: [react(), ViteXmlui()]
});
EOF

# Start dev server
xmlui start

# Build for production
xmlui build --prod
```

**Key Scripts:**

```bash
# Development
xmlui start                      # Dev server with HMR
xmlui start --withMock=false     # Without API mocking
xmlui start --proxy /api->...    # With backend proxy

# Production builds
xmlui build --prod               # Optimized build
xmlui build --buildMode=INLINE_ALL --flatDist

# Deployment
xmlui build --prod --withHostingMetaFiles
xmlui zip-dist
```

### Quick Reference Table

This table summarizes when to run builds across different contexts:

| Context        | Scenario                  | npm Script                       | Underlying CLI                                  | When to Run                                    | Comments                                                                                                                                                                                                                                                            |
| -------------- | ------------------------- | -------------------------------- | ----------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **docs/**      | Editing `.md` files       | `npm start`                      | `xmlui start`                                   | No build - just refresh browser                | Markdown files are served directly; dev server provides hot reload for instant feedback                                                                                                                                                                             |
| **docs/**      | Building docs site        | `npm run build:docs`             | `xmlui build --buildMode=INLINE_ALL --withMock` | Before deployment                              | Creates optimized production build with INLINE_ALL mode, downloads latest XMLUI release, generates RSS feed                                                                                                                                                         |
| **docs/**      | Preview production build  | `npm run preview`                | `xmlui preview`                                 | After building                                 | Serves production build locally for testing before deployment                                                                                                                                                                                                       |
| **xmlui/**     | Testing component changes | `npm start-test-bed`             | `cd src/testing/infrastructure && xmlui start`  | Automatic HMR                                  | Runs dev server in `src/testing/infrastructure`; component changes appear instantly via HMR                                                                                                                                                                         |
| **xmlui/**     | Building framework        | `npm run build:xmlui`            | `vite build --mode lib`                         | Before npm publish                             | Builds library for npm distribution using Vite directly (not xmlui CLI); generates .mjs, .d.ts, and CSS                                                                                                                                                             |
| **xmlui/**     | Building standalone       | `npm run build:xmlui-standalone` | `vite build --mode standalone`                  | For CDN/buildless                              | Creates self-contained UMD bundle for `<script>` tag usage; framework builds itself with Vite directly                                                                                                                                                              |
| **xmlui/**     | Generating metadata       | `npm run build:xmlui-metadata`   | `vite build --mode metadata`                    | After component changes, before doc generation | Extracts component metadata into `xmlui-metadata.js` for documentation generation and language server autocomplete. This is the source of truth for component APIs, props, and descriptions. Framework uses Vite directly.                                          |
| **xmlui/**     | Full doc generation       | `npm run generate-all-docs`      | Node scripts (not CLI)                          | After metadata changes                         | Runs three scripts: (1) `build:xmlui-metadata` - extracts metadata, (2) `generate-docs` - creates component .md files from metadata, (3) `generate-docs-summaries` - creates overview/summary files. This is the complete pipeline from source code → documentation |
| **xmlui/**     | Compile bin scripts       | `npm run build:bin`              | `tsdown`                                        | After changes to bin/\*.ts files               | Compiles TypeScript bin scripts to ESM + CommonJS using tsdown; outputs both formats for compatibility                                                                                                                                                             |
| **extension/** | Development               | `npm start`                      | `xmlui start`                                   | Keep running during dev                        | Runs dev server with HMR for demo app; use with build-watch in separate terminal                                                                                                                                                                                    |
| **extension/** | Watch mode build          | `npm run build-watch`            | `xmlui build-lib --watch`                       | Keep running during dev                        | Continuously rebuilds extension library on changes; pair with `npm start` for rapid iteration                                                                                                                                                                       |
| **extension/** | Building for publish      | `npm run build:extension`        | `xmlui build-lib`                               | Before npm publish                             | Creates distributable ESM library bundle (.js, .d.ts, CSS) for npm package                                                                                                                                                                                          |
| **extension/** | Build demo app            | `npm run build:demo`             | `xmlui build`                                   | For demo deployment                            | Builds the demo application (not the extension itself) for hosting                                                                                                                                                                                                  |
| **extension/** | Extract metadata          | `npm run build:meta`             | `xmlui build-lib --mode=metadata`               | For LSP/docs support                           | Extracts extension component metadata for language server and documentation                                                                                                                                                                                         |

**Key principles:**

- **Development mode uses HMR** - No manual builds needed when running `xmlui start`
- **Production requires explicit builds** - Use `xmlui build` or `npm run build:*` scripts
- **Framework builds itself differently** - XMLUI uses Vite directly (`vite build --mode lib`) instead of the `xmlui` CLI
- **Extensions use the CLI** - Extension developers use `xmlui build-lib` and `xmlui start`
- **npm scripts wrap CLI commands** - Convenience shortcuts with project-specific flags

### Build Optimization Tips

1. **Development:** Use `xmlui start` for instant feedback
2. **Testing:** Use `CONFIG_ONLY` mode for faster rebuilds
3. **Production:** Use `INLINE_ALL` with `--flatDist` for optimal performance
4. **Debugging:** Enable `--withMock` to test without backend
5. **Large Apps:** Consider lazy loading with `ALL` mode

### Environment Variables

Build behavior can be controlled via environment variables:

```bash
# .env file
NODE_ENV=production
VITE_BUILD_MODE=INLINE_ALL
VITE_MOCK_ENABLED=false
VITE_STANDALONE=true
```

**Key Variables:**

- `VITE_BUILD_MODE` - Component bundling strategy
- `VITE_MOCK_ENABLED` - Enable/disable MSW
- `VITE_STANDALONE` - Standalone runtime mode
- `VITE_INCLUDE_ALL_COMPONENTS` - Bundle all components
- `VITE_XMLUI_VERSION` - Version string for metadata

---

## See Also

- [Building the XMLUI Core Package](./build-xmlui.md) - Framework package build with Vite
- [Standalone Rendering Architecture](./standalone-app.md) - How built vs buildless apps work
- [Container-Based State Management](./containers.md) - Runtime state system
- [React Fundamentals](./react-fundamentals.md) - React integration details
