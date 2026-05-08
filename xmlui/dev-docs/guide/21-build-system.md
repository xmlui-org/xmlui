# 21 — Build System & Deployment

## Why This Matters

Every XMLUI project has a build story. Understanding it lets you choose the right deployment model for a new project, diagnose a broken build pipeline, add a new extension package to the monorepo, and know exactly which files to ship to production. The XMLUI build system is layered: a Vite configuration at the core, a thin CLI wrapper on top, and Turborepo orchestrating the whole monorepo.

---

## Table of Contents

1. [Two Deployment Modes](#two-deployment-modes)
2. [CLI Commands](#cli-commands)
3. [Build Modes for Applications](#build-modes-for-applications)
4. [Framework Builds](#framework-builds)
5. [The Vite Plugin](#the-vite-plugin)
6. [Extension Package Builds](#extension-package-builds)
7. [ESM Migration](#esm-migration)
8. [Turborepo Orchestration](#turborepo-orchestration)
9. [Common Workflows](#common-workflows)
10. [Key Files](#key-files)
11. [Key Takeaways](#key-takeaways)

---

## Two Deployment Modes

XMLUI applications operate in one of two modes, determined at project creation and not changeable at runtime. Both produce working apps from the same `.xmlui` markup — the difference is *when* parsing happens.

### Standalone Mode (Buildless)

In standalone mode, the XMLUI runtime (`xmlui-standalone.umd.js`) is loaded via a `<script>` tag in a plain HTML file. On startup, the browser fetches `Main.xmlui`, discovers referenced components from the `components/` directory, and renders everything — all parsing happens in the browser at runtime. No build step, no npm, no Vite.

```html
<!DOCTYPE html>
<html>
  <head><title>My App</title></head>
  <body>
    <div id="root"></div>
    <script src="https://cdn.example.com/xmlui/xmlui-standalone.umd.js"></script>
  </body>
</html>
```

This is ideal for prototyping, low-overhead environments, and teams without frontend build infrastructure. The cost is a larger initial payload (everything is in the single UMD bundle) and no build-time optimization.

### Vite Mode (Built)

In Vite mode, `.xmlui` files are compiled at build time into JavaScript modules using `vite-xmlui-plugin`. `import.meta.glob()` in the entry point pre-bundles all components. The result is a standard Vite/Rollup bundle that can be served from any static host.

```typescript
// index.ts — Vite mode entry point
import { startApp } from "xmlui";
const runtime = import.meta.glob("/src/**", { eager: true });
startApp(runtime);
```

This mode provides HMR during development, tree-shaking, code splitting, and optimized production bundles. The XMLUI docs site, blog, and playground all use this mode.

**Which to choose:** Use standalone for quick prototypes or when avoiding build infrastructure. Use Vite mode for any application going to production.

---

## CLI Commands

The `xmlui` CLI is the unified interface for all build operations. It is installed when you install the `xmlui` npm package, and its entry is at `xmlui/src/nodejs/bin/bootstrap.js` (which routes commands through `src/nodejs/bin/index.ts`).

### `xmlui start`

Starts a Vite dev server with hot module reloading.

```bash
xmlui start [options]
```

| Option | Default | Description |
|--------|---------|-------------|
| `--port <n>` | Vite default | Dev server port |
| `--withMock <bool>` | `true` | Enable MSW API mocking |
| `--proxy <pat->target>` | — | Forward API requests to a backend |

Examples:

```bash
xmlui start                              # Start with defaults
xmlui start --port 3000 --withMock=false # Specific port, no mocking
xmlui start --proxy /api->http://localhost:8080  # Proxy API calls
```

Behind the scenes: sets `VITE_BUILD_MODE=ALL` and enables MSW for API interception.

### `xmlui build`

Builds an XMLUI application for production deployment.

```bash
xmlui build [options]
```

| Option | Dev default | Prod default | Description |
|--------|-------------|--------------|-------------|
| `--buildMode` | `CONFIG_ONLY` | auto | How components are bundled (see next section) |
| `--flatDist` | `false` | `true` | Flatten dist/ for simple static hosting |
| `--withMock` | `true` | `false` | Include MSW in the build |
| `--withHostingMetaFiles` | `false` | `false` | Add serve.json / web.config |
| `--withRelativeRoot` | `false` | `true` | Use relative paths |
| `--prod` | — | — | Shorthand for all production defaults |

```bash
xmlui build --prod    # Recommended for production
```

### `xmlui preview`

Serves a production build locally for pre-deployment testing.

```bash
xmlui preview [--proxy <pat->target>]
```

Typical flow: `xmlui build --prod && xmlui preview`

### `xmlui build-lib`

Builds the XMLUI framework itself, or an extension library, as a distributable npm package.

```bash
xmlui build-lib [--mode lib|standalone|metadata] [--watch]
```

| Mode | Output | Use Case |
|------|--------|----------|
| `lib` (default) | `dist/lib/` — ES modules | npm package distribution |
| `standalone` | `dist/standalone/xmlui-standalone.umd.js` | Buildless CDN deployment |
| `metadata` | `dist/metadata/xmlui-metadata.js` | Documentation, LSP autocomplete |

`--watch` enables continuous rebuilds for development.

### `xmlui zip-dist`

Creates a ZIP archive of the dist directory.

```bash
xmlui zip-dist [--source dist] [--target ui.zip]
```

---

## Build Modes for Applications

When using `xmlui build`, the `--buildMode` option controls how components are bundled into the output.

### `CONFIG_ONLY`

Only the configuration and entry point are bundled. Components are loaded at runtime from their source files. Produces the smallest initial bundle but requires runtime component discovery. Best for development and applications where components change frequently.

### `INLINE_ALL`

All components are pre-compiled and bundled into the output. No runtime parsing or component discovery needed. Produces the fastest startup time at the cost of a larger bundle. This is the recommended mode for production deployments.

### `ALL`

A hybrid approach that supports both bundled and runtime loading. Useful for complex staging environments or applications that need both approaches.

---

## Framework Builds

The `xmlui` package itself is built using `vite build` with mode-specific configurations in `xmlui/vite.config.ts`. There are three build modes.

### Library Build (lib mode)

The standard npm package build. Produces ES modules from multiple entry points:

| Export Path | Source File | Purpose |
|-------------|-------------|---------|
| `xmlui` | `src/index.ts` | Main framework |
| `xmlui/parser` | `src/parsers/xmlui-parser/index.ts` | Parser utilities |
| `xmlui/language-server` | `src/language-server/server.ts` | Node.js LSP |
| `xmlui/language-server-web-worker` | `src/language-server/server-web-worker.ts` | Browser LSP |
| — | `src/syntax/monaco/index.ts` | Monaco editor syntax |
| — | `src/syntax/textMate/index.ts` | TextMate grammar |

All `package.json` dependencies are externalized (not bundled). TypeScript declarations are generated with rollup bundling via `vite-plugin-dts`. SCSS source files are copied to `dist/lib/scss/` preserving directory structure.

**Quick build:**

```bash
npm run build:xmlui          # Library mode from xmlui/ directory
npm run build-xmlui          # From workspace root
```

### Standalone Build (standalone mode)

A self-contained UMD bundle from `src/index-standalone.ts`. All dependencies are bundled in. MSW is included for API mocking. The output is `dist/standalone/xmlui-standalone.umd.js`, which can be loaded directly in a browser via `<script>` tag.

```bash
npm run build:xmlui-standalone
```

### Metadata Build (metadata mode)

Extracts component metadata from `src/components/collectedComponentMetadata.ts` into `dist/metadata/xmlui-metadata.js`. Consumed by:

- The language server for autocomplete
- The docs site for API reference generation

```bash
npm run build:xmlui-metadata
npm run generate-docs          # Depends on metadata build
```

### Build Output Structure

After building all three modes:

```
xmlui/dist/
  lib/
    xmlui.js                         # Main framework (ESM)
    xmlui.d.ts                       # Type definitions
    xmlui-parser.js
    language-server.js
    language-server-web-worker.js
    syntax-monaco.js
    syntax-textmate.js
    *.css                            # Component styles
    vite-xmlui-plugin/index.js       # Vite plugin
    scss/                            # Source SCSS files
  standalone/
    xmlui-standalone.umd.js          # Self-contained UMD
  metadata/
    xmlui-metadata.js                # Component metadata
  bin/
    index.js                         # CLI (ESM)
    index.cjs                        # CLI (CommonJS)
```

---

## The Vite Plugin

`xmlui/src/nodejs/vite-xmlui-plugin.ts` is a custom Vite plugin that transforms XMLUI-specific files into standard JavaScript modules during both development (dev server) and production builds.

### What It Handles

| File Extension | What happens |
|----------------|--------------|
| `.xmlui` | Parsed with `xmlUiMarkupToComponent()` → `ComponentDef` → ESM via `dataToEsm()` |
| `.xmlui.xs` | Code-behind scripts parsed by `Parser.parseStatements()` → ESM |
| `.xmlui.xm` | Module scripts parsed → ESM |

Parse errors are converted into error components, not build failures, so the dev server continues to run with an error indicator in the UI.

### Configuring the Plugin

In a Vite app's config:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ViteXmlui from "xmlui/vite-xmlui-plugin";

export default defineConfig({
  plugins: [react(), ViteXmlui()]
});
```

The plugin currently accepts no configuration options.

---

## Extension Package Builds

Extension packages in `packages/` follow the same build conventions as the main framework but as consumers of the `xmlui` package rather than the source.

### Standard scripts in an extension's package.json

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

> **Note:** The `build-watch` script (`xmlui build-lib --watch`) currently crashes with a `TypeError` due to a `vite-plugin-dts` incompatibility. Watch mode is broken; use a single `build:extension` run or rebuild manually for now.

### Extension build output

```
dist/
  xmlui-myextension.js       # ESM bundle
  xmlui-myextension.d.ts     # TypeScript declarations
  *.css                      # Component styles
```

`react`, `react-dom`, and `xmlui` are always externalized — they are peer dependencies and must never be bundled into the extension.

### Extension's package.json shape

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

### Using an extension in an app

```typescript
import { startApp } from "xmlui";
import myExtension from "xmlui-myextension";
import "xmlui-myextension/ComponentName.css";

const runtime = import.meta.glob("/src/**", { eager: true });
startApp(runtime, [myExtension]);
```

---

## ESM Migration

The entire monorepo now uses ES Modules exclusively:

- All packages declare `"type": "module"` in their package.json
- Library builds output ESM (`.js`)
- The CLI (`bin/`) is built with **tsdown**, which produces both `index.js` (ESM) and `index.cjs` (CommonJS) for compatibility with tools that haven't yet adopted ESM
- `react`, `react-dom`, and `xmlui` are always external in extension builds

This migration eliminates CommonJS/ESM interop issues and ensures tree-shaking works correctly.

---

## Turborepo Orchestration

The root `turbo.json` defines the build task pipeline for the entire monorepo. Turborepo caches task outputs by input hash, so unchanged packages are not rebuilt.

### Key tasks and their dependencies

```
build:xmlui-metadata
  ↓
gen:langserver-metadata
  ↓
xmlui-vscode#build
  ↓
xmlui-vscode#build:vsix

build:xmlui + build:extension (upstream)
  ↓
build:docs, build:blog, build:playground
```

Full task table:

| Task | Depends On | Notes |
|------|-----------|-------|
| `build:xmlui` | — | Library build |
| `build:xmlui-standalone` | — | UMD build |
| `build:xmlui-metadata` | — | Metadata extraction |
| `gen:langserver-metadata` | `build:xmlui-metadata` | Writes `xmlui-metadata-generated.js` |
| `build:extension` | `^build:extension` | Upstream extension packages first |
| `build:xmlui-all` | all of the above | Full build |
| `build:docs` | `^build:extension`, `^build:xmlui`, releases, docs summaries | Full docs site build |
| `build:playground` | `^build:extension`, `^build:xmlui` | Playground build |
| `xmlui#build:xmlui-test-bed` | `build:extension` | E2E test server |
| `xmlui-vscode#build` | `^gen:langserver-metadata` | VS Code extension |

The `^` prefix means "after all upstream workspaces complete this task." `"cache": false` is set for tasks that must always run (e.g., `gen:releases` fetches from GitHub).

### Running Turborepo builds

From the workspace root:

```bash
npx turbo build:xmlui            # Build xmlui core only
npx turbo build:docs             # Full docs site (takes a while)
npx turbo build:xmlui-all        # All core + extension builds
```

---

## Common Workflows

### Starting framework development

```bash
cd xmlui
npm run build:for-node           # Build the CLI first

# In a second terminal:
cd src/testing/infrastructure
xmlui start                      # Test bed dev server
```

> **Note:** `xmlui build-lib --watch` (watch mode) is currently broken due to a `vite-plugin-dts` incompatibility. Rebuild manually with `npm run build:xmlui` as needed.

### Developing an extension

```bash
cd packages/xmlui-myextension
# Terminal 1:
npm run build-watch              # Continuous library rebuilds
# Terminal 2:
npm start                        # Demo app with HMR at localhost:5173
```

### Building for production

```bash
# Application build
xmlui build --prod

# Framework build (all modes)
cd xmlui
npm run build:xmlui
npm run build:xmlui-standalone
npm run build:xmlui-metadata

# From workspace root
npx turbo build:xmlui-all
```

### Running the docs site locally

```bash
# From workspace root
npx turbo build:docs
cd website
npm start
```

---

## Key Files

| File | Role |
|------|------|
| `xmlui/vite.config.ts` | All three framework build mode configurations |
| `xmlui/src/nodejs/vite-xmlui-plugin.ts` | `.xmlui` / `.xmlui.xs` → ESM transformer |
| `xmlui/src/nodejs/bin/viteConfig.ts` | Shared Vite configuration utilities |
| `xmlui/src/nodejs/bin/build.ts` | `xmlui build` command implementation |
| `xmlui/src/nodejs/bin/build-lib.ts` | `xmlui build-lib` command implementation |
| `xmlui/src/nodejs/bin/start.ts` | `xmlui start` command implementation |
| `xmlui/src/nodejs/bin/index.ts` | CLI command router |
| `xmlui/src/nodejs/bin/bootstrap.js` | CLI entry point (loads index.ts via tsx) |
| `turbo.json` | Monorepo task pipeline with caching |
| `xmlui/src/index.ts` | Main framework ESM entry point |
| `xmlui/src/index-standalone.ts` | Standalone UMD entry point |
| `xmlui/src/components/collectedComponentMetadata.ts` | Metadata build entry point |

---

## Key Takeaways

- **Two modes, one syntax:** Standalone (buildless, UMD script tag) and Vite (compiled, npm). Same `.xmlui` markup works in both. Choose at project creation.
- **One CLI, many commands:** `xmlui start / build / preview / build-lib / zip-dist` covers the entire build surface. The `xmlui` binary is installed with the `xmlui` npm package.
- **Three framework outputs:** `lib` (ESM npm package), `standalone` (self-contained UMD), `metadata` (for docs and LSP). All three come from `xmlui/vite.config.ts` with different modes.
- **`vite-xmlui-plugin` is the bridge:** It transforms `.xmlui` and `.xmlui.xs` files into standard JavaScript modules that Vite can bundle. Without it, `.xmlui` files would be invisible to the build pipeline.
- **Extensions are first-class:** They use the same `xmlui build-lib` command, same output format, and same externalization rules (`react`, `react-dom`, `xmlui` are always external).
- **Turborepo manages dependencies:** The `turbo.json` pipeline ensures builds happen in the right order. The `^` prefix enforces upstream ordering; caching skips unchanged packages.
- **ESM first:** Everything is ES modules now. The CLI additionally ships a CommonJS build for compatibility, but all library code is ESM.
- **`--prod` is the production shorthand:** `xmlui build --prod` applies all production-appropriate defaults (`INLINE_ALL`, `flatDist`, no mocking, relative roots).
- **`build:for-node` builds the CLI:** `npm run build:for-node` (from `xmlui/`) compiles the CLI via `tsdown`. Run this before using `xmlui` CLI commands from a source checkout.
