# XMLUI Build System — AI Reference

Authoritative reference for the XMLUI build system, CLI commands, Vite configuration, and deployment patterns. For contributors and framework-aware code generation.

---

## Two App Deployment Modes

Every XMLUI application uses exactly one of two modes — chosen at project creation, not changeable at runtime.

| Mode                       | Parsing             | Build Step    | Deployment         |
| -------------------------- | ------------------- | ------------- | ------------------ |
| **Standalone (buildless)** | Browser at runtime  | None          | Copy static files  |
| **Vite (built)**           | Compile time (Vite) | `xmlui build` | Serve dist/ bundle |

### Standalone Mode

- App served as static files; `xmlui-standalone.umd.js` loaded via `<script>` tag
- Runtime fetches `Main.xmlui`, discovers components from `components/`
- No npm, no build pipeline required
- Self-contained UMD bundle from `src/index-standalone.ts`

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="https://cdn.example.com/xmlui/xmlui-standalone.umd.js"></script>
  </body>
</html>
```

### Vite (Built) Mode

- `.xmlui` files compiled at build time by `vite-xmlui-plugin`
- `import.meta.glob()` pre-bundles all components
- HMR during development; optimized bundle for production
- Used for production apps, the docs site, and the playground

```typescript
// entry index.ts
import { startApp } from "xmlui";
const runtime = import.meta.glob("/src/**", { eager: true });
startApp(runtime);
```

---

## CLI Commands

Installed via `xmlui/bin/bootstrap.js` → `bin/index.ts` → command router.

### `xmlui start`

Dev server with HMR.

```bash
xmlui start [--port <n>] [--withMock <bool>] [--proxy <pat->target>]
```

- Sets `VITE_BUILD_MODE=ALL`
- Enables MSW by default (`--withMock=true`)
- Proxy: `--proxy /api->http://localhost:3000`

### `xmlui build`

Production app build.

```bash
xmlui build [--buildMode CONFIG_ONLY|INLINE_ALL|ALL] [--flatDist] [--withMock] [--withHostingMetaFiles] [--withRelativeRoot] [--prod]
```

| Flag                     | Default (dev) | Default (prod)              |
| ------------------------ | ------------- | --------------------------- |
| `--buildMode`            | `CONFIG_ONLY` | auto                        |
| `--flatDist`             | false         | true                        |
| `--withMock`             | true          | false                       |
| `--withHostingMetaFiles` | false         | false                       |
| `--withRelativeRoot`     | false         | true                        |
| `--prod`                 | —             | shorthand for prod settings |

**Build mode comparison:**

| Mode          | Bundle size | Runtime loading | Use case             |
| ------------- | ----------- | --------------- | -------------------- |
| `CONFIG_ONLY` | Smallest    | Yes             | Dev / dynamic        |
| `INLINE_ALL`  | Largest     | No              | Prod / perf-critical |
| `ALL`         | Medium      | Hybrid          | Staging / complex    |

**dist/ output structures:**

```
# flatDist=false (default dev)
dist/
  index.html
  assets/index-[hash].js
  assets/index-[hash].css
  resources/

# flatDist=true (prod)
dist/
  index.html
  ui_assets_index-[hash].js
  ui_assets_index-[hash].css
  ui_resources_logo.png   ← flat with ui_ prefix
```

### `xmlui preview`

Serve a production build locally.

```bash
xmlui preview [--proxy <pat->target>]
```

### `xmlui build-lib`

Build the framework or an extension as a distributable library.

```bash
xmlui build-lib [--watch] [--mode lib|standalone|metadata]
```

- `--mode lib` (default): ESM npm package
- `--mode standalone`: UMD bundle for buildless CDN
- `--mode metadata`: component metadata for docs/LSP
- `--watch`: continuous rebuilds during development

### `xmlui zip-dist`

Package the dist directory as a ZIP for deployment.

```bash
xmlui zip-dist [--source <dir>] [--target <filename.zip>]
```

---

## Framework Build Modes (`xmlui build-lib`)

Three distinct build modes for the core `xmlui` package, defined in `xmlui/vite.config.ts`.

### lib Mode

Entry: `xmlui/src/index.ts` + multiple entry points  
Output: `dist/lib/` (ES Modules)

**All entry points:**

| Export                       | Source                                     |
| ---------------------------- | ------------------------------------------ |
| `xmlui`                      | `src/index.ts`                             |
| `xmlui-parser`               | `src/parsers/xmlui-parser/index.ts`        |
| `language-server`            | `src/language-server/server.ts`            |
| `language-server-web-worker` | `src/language-server/server-web-worker.ts` |
| `syntax-monaco`              | `src/syntax/monaco/index.ts`               |
| `syntax-textmate`            | `src/syntax/textMate/index.ts`             |

**Vite plugins used:**

- `@vitejs/plugin-react` — JSX + Fast Refresh
- `vite-plugin-svgr` — SVG → React component
- `vite-plugin-yaml` — YAML imports
- `vite-xmlui-plugin` — `.xmlui` / `.xmlui.xs` transformation
- `vite-plugin-lib-inject-css` — CSS injection into JS
- `vite-plugin-dts` — TypeScript declarations (rollup bundled)
- `rollup-plugin-copy` — SCSS source → `dist/lib/scss/`

**SCSS handling:** Non-module SCSS files are copied to `dist/lib/scss/`, preserving directory structure (strips `src/` prefix).

### standalone Mode

Entry: `src/index-standalone.ts`  
Output: `dist/standalone/xmlui-standalone.umd.js`

- Single UMD file with all deps bundled
- Loaded via `<script>` tag with no npm required
- MSW worker included for API mocking
- Version-stamped with build date

### metadata Mode

Entry: `src/components/collectedComponentMetadata.ts`  
Output: `dist/metadata/xmlui-metadata.js`

- Consumed by the language server for autocomplete
- Consumed by the docs site for API reference generation
- Generated via `npm run generate-docs` after metadata build

---

## Vite Plugin (`vite-xmlui-plugin`)

Located at `xmlui/bin/vite-xmlui-plugin.ts`. Transforms XMLUI-specific source files when they are imported. Can do it during builds or when runnig apps from the dev server.
Used when one doesn't utilize the xmlui commands, like `xmlui start`, `xmlui build`, `xmlui ssg`, etc...

### Files Handled

| File type   | Transformation                                |
| ----------- | --------------------------------------------- |
| `.xmlui`    | Markup → ComponentDef → ESM via `dataToEsm()` |
| `.xmlui.xs` | Code-behind scripts → parsed → ESM            |
| `.xmlui.xm` | Module scripts → parsed → ESM                 |

### Pipeline

```
.xmlui file
  ↓ xmlUiMarkupToComponent()
  ↓ ComponentDef object
  ↓ dataToEsm()
  → JavaScript ESM module

.xmlui.xs file
  ↓ Parser.parseStatements()
  ↓ collectCodeBehindFromSource()
  ↓ dataToEsm()
  → JavaScript ESM module
```

### Configuration

```typescript
// vite.config.ts
import ViteXmlui from "xmlui/vite-xmlui-plugin";

export default defineConfig({
  plugins: [react(), ViteXmlui()],
});
```

---

## Build Outputs

### Framework package (`dist/`)

```
dist/
  lib/
    xmlui.js                       # Main framework (ESM)
    xmlui.d.ts                     # Types
    xmlui-parser.js
    language-server.js
    language-server-web-worker.js
    syntax-monaco.js
    syntax-textmate.js
    *.css                          # Component styles
    vite-xmlui-plugin/index.js     # Vite plugin
    scss/                          # Source SCSS (copied)
  standalone/
    xmlui-standalone.umd.js        # Self-contained UMD
  metadata/
    xmlui-metadata.js              # Component metadata
  bin/
    index.js                       # CLI (ESM)
    index.cjs                      # CLI (CommonJS, for compatibility)
```

### npm Package Exports

```json
{
  ".": {
    "import": "./dist/lib/xmlui.js",
    "require": "./dist/standalone/xmlui-standalone.umd.js"
  },
  "./language-server": "./dist/lib/language-server.js",
  "./language-server-web-worker": "./dist/lib/language-server-web-worker.js",
  "./parser": "./dist/lib/xmlui-parser.js",
  "./vite-xmlui-plugin": "./dist/scripts/bin/vite-xmlui-plugin.js",
  "./*.css": "./dist/lib/*.css",
  "./index.scss": "./dist/lib/scss/index.scss"
}
```

---

## Extension Package Build

Extensions use the same `xmlui build-lib` command as the framework.

### Standard package.json scripts

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

### Command reference

| Command                           | Purpose                 | Output                       |
| --------------------------------- | ----------------------- | ---------------------------- |
| `xmlui start`                     | Dev server for demo app | HMR dev server               |
| `xmlui build-lib`                 | Build extension library | `dist/*.js`, `.d.ts`, `.css` |
| `xmlui build-lib --watch`         | Watch mode              | Continuous rebuilds          |
| `xmlui build`                     | Build demo app          | Production demo              |
| `xmlui build-lib --mode=metadata` | Extract metadata        | IDE support files            |

### Extension dist/ output

```
dist/
  xmlui-myextension.js      # ESM bundle (react/xmlui externalized)
  xmlui-myextension.d.ts    # TypeScript declarations
  *.css                     # Component styles
```

### Extension package.json shape

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

### Extension integration (Vite app)

```typescript
import { startApp } from "xmlui";
import myExtension from "xmlui-myextension";
import "xmlui-myextension/ComponentName.css";

const runtime = import.meta.glob(`/src/**`, { eager: true });
startApp(runtime, [myExtension]);
```

---

## ESM Migration

- All packages declare `"type": "module"` in package.json
- Builds output ESM by default
- CLI (`bin/`) built with **tsdown** to produce both `index.js` (ESM) and `index.cjs` (CommonJS) for compatibility
- Externals for extension builds: `react`, `react-dom`, and `xmlui` — never bundled

---

## Turborepo Orchestration

Defined in root `turbo.json`. Key tasks and dependencies:

| Task                         | Depends On                                                                    | Outputs                                           |
| ---------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| `build:xmlui`                | —                                                                             | `dist/lib/**`                                     |
| `build:xmlui-standalone`     | —                                                                             | `dist/standalone/**`                              |
| `build:xmlui-metadata`       | —                                                                             | `dist/metadata/**`                                |
| `gen:langserver-metadata`    | `build:xmlui-metadata`                                                        | `src/language-server/xmlui-metadata-generated.js` |
| `build:extension`            | `^build:extension` (upstream extensions)                                      | `dist/**`                                         |
| `build:meta`                 | —                                                                             | `dist/**`                                         |
| `build:xmlui-all`            | all of above                                                                  | —                                                 |
| `build:docs`                 | `^build:extension`, `^build:xmlui`, `gen:releases`, `generate-docs-summaries` | `dist/**`                                         |
| `build:blog`                 | `^build:extension`, `^build:xmlui`                                            | `dist/**`                                         |
| `build:playground`           | `^build:extension`, `^build:xmlui`                                            | `dist/**`                                         |
| `xmlui#build:xmlui-test-bed` | `build:extension`                                                             | `src/testing/infrastructure/dist/**`              |
| `xmlui-vscode#build`         | `^gen:langserver-metadata`                                                    | `dist/**`                                         |

- `^` prefix = "after upstream workspaces complete the same task"
- Turborepo caches task outputs by input hash; use `"cache": false` for tasks that must always run (e.g., `gen:releases`)
- `globalEnv: ["CI"]` propagates the CI flag to all tasks

---

## Bin/ Directory Layout

```
xmlui/bin/
  bootstrap.js        # CLI entry point (loads index.ts via tsx)
  index.ts            # Command router
  build.ts            # xmlui build implementation
  build-lib.ts        # xmlui build-lib implementation
  start.ts            # xmlui start implementation
  preview.ts          # xmlui preview implementation
  vite-xmlui-plugin.ts  # Vite plugin for .xmlui file transformation
  viteConfig.ts       # Shared Vite configuration utilities
```

---

## Common Build Workflows

### Framework contributor workflow

The `xmlui` package's `exports` field points directly to TypeScript source (`./src/index.ts`), so any Vite app that imports `xmlui` gets live HMR on framework changes with no rebuild step.

The visual dev sandbox is `integration-tests/test-app`.

```bash
# One-time setup — builds standalone UMD + test extension, copies to test-app/public/js/:
# (From repo root)
npx turbo run xmlui-integration-test-app#setup:standalone

# Daily workflow — Vite dev server with live HMR (no rebuild step needed):
cd integration-tests/test-app
npm run start

# Optional: verify changes in standalone (buildless) mode
npm run serve    # requires setup above to have been run
```

### Extension developer workflow

If an extension's `package.json` `exports` field points to its TypeScript source files, a Vite app that imports it will pick up changes via HMR with no rebuild step.
This pattern is used throughout all the extensions in the `packages` folder. Such package's `prepublishOnly` script points the `exports` field to the build artifacts, but that's only needed for publishing. When working in the monorepo, using the source files are ideal.

```bash
cd packages/xmlui-myextension
npm start                        # starts the Demo app — HMR reflects source changes instantly. These demo apps contain components from the extension package they are in.
```

Since this is a monorepo, in vite environments (those that use `xmlui start` and not the standalone mode) one can just import the extension by its package name, and provide the default export (which is the extension) to the startApp function.

### Production app build

```bash
xmlui build --prod
# Equivalent to:
xmlui build --buildMode=INLINE_ALL --flatDist --withMock=false --withRelativeRoot
```

### Docs site build

```bash
# From workspace root:
npx turbo build:docs
# Sequence: build:xmlui + all extensions → gen:releases → generate-docs-summaries → build:docs
```

---

## Key Files

| File                                                 | Role                                   |
| ---------------------------------------------------- | -------------------------------------- |
| `xmlui/vite.config.ts`                               | All three framework build mode configs |
| `xmlui/bin/vite-xmlui-plugin.ts`                     | `.xmlui` → ESM transformer             |
| `xmlui/bin/viteConfig.ts`                            | Shared Vite config utilities           |
| `xmlui/bin/build.ts`                                 | `xmlui build` implementation           |
| `xmlui/bin/build-lib.ts`                             | `xmlui build-lib` implementation       |
| `xmlui/bin/start.ts`                                 | `xmlui start` implementation           |
| `xmlui/bin/index.ts`                                 | CLI command router                     |
| `turbo.json`                                         | Monorepo task pipeline                 |
| `xmlui/src/index.ts`                                 | Main framework ESM entry               |
| `xmlui/src/index-standalone.ts`                      | Standalone UMD entry                   |
| `xmlui/src/components/collectedComponentMetadata.ts` | Metadata build entry                   |
