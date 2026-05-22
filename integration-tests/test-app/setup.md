# Integration Test App — Build Modes

The test-app exercises XMLUI in five distinct runtime modes. Each has its own build
pipeline and output directory. All commands assume you are in the **workspace root**
(`d:\Projects\albacrm\xmlui`) unless noted otherwise.

---

## Prerequisites

```bash
# Install all workspace dependencies (run once, or after package.json changes)
npm install
```

---

## Mode overview

| Mode | npm script | Output | Serves via |
|---|---|---|---|
| Standalone (buildless) | `setup:standalone` + `serve` | `public/js/` (copied UMDs) | `serve . -s` |
| Vite dev server | `start` | — | Vite HMR |
| Vite production build | `build` | `dist/` | `preview` / `serve dist` |
| SSG build | `build-ssg` / `ssg` | `dist-ssg/` | `preview-ssg dist-ssg` |
| Vite plugin-mode build | `build:plugin-mode` | `dist-vite-plugin/` | `serve dist-vite-plugin` |

---

## Mode details

### 1. Standalone (buildless)

No Vite, no build step. `index.js` detects the absence of `import.meta.env` at runtime
and dynamically loads the UMD bundle from `public/js/`.

**Build steps:**
```bash
# 1. Build the UMD bundle and test extension (from workspace root)
npm run build:xmlui-standalone --workspace=xmlui
npm run build:extension --workspace=xmlui-test-extension

# 2. Copy the UMD files into test-app/public/js/
npm run setup:standalone --workspace=xmlui-integration-test-app

# 3. Serve all files as static (from integration-tests/test-app)
npm run serve --workspace=xmlui-integration-test-app
```

Or via Turborepo (handles dependency order automatically):
```bash
turbo run xmlui-integration-test-app#setup:standalone
```

---

### 2. Vite dev server

Uses the `xmlui` CLI (`xmlui start`), which goes through `bootstrap.js` → registers
`tsx` → starts a Vite dev server with HMR. `.xmlui` files are parsed at runtime by Vite.

**Start:**
```bash
# From integration-tests/test-app, or:
npm run start --workspace=xmlui-integration-test-app
```

No prior build needed — this is a live dev server.

---

### 3. Vite production build

Uses `xmlui build` (CLI). Compiles all `.xmlui` files at build time using
`vite-entrypoint.ts` with `import.meta.glob`. The `xmlui` package must be built first
because the CLI uses the published/clean-package exports.

**Build steps:**
```bash
# 1. Build and publish-prepare the xmlui package
npm run prepublishOnly --workspace=xmlui   # runs clean-package to swap exports to dist/

# 2. Build the test extension
npm run build:extension --workspace=xmlui-test-extension

# 3. Build the test app
npm run build --workspace=xmlui-integration-test-app

# 4. Preview
npm run preview --workspace=xmlui-integration-test-app

# Cleanup (restore source exports in xmlui/package.json)
npm run postpublish --workspace=xmlui
```

Or via Turborepo:
```bash
turbo run xmlui-integration-test-app#build
```

---

### 4. SSG build

Same pipeline as the Vite production build but uses `xmlui ssg` to produce a
fully pre-rendered static site in `dist-ssg/`.

**Build steps:**
```bash
# Same prerequisites as mode 3 (prepublishOnly, build:extension), then:
npm run ssg --workspace=xmlui-integration-test-app

# Preview
npm run preview-ssg --workspace=xmlui-integration-test-app
```

Or via Turborepo:
```bash
turbo run xmlui-integration-test-app#ssg
```

---

### 5. Vite plugin-mode build

Bypasses the `xmlui` CLI entirely. `vite.plugin-mode.config.ts` imports
`xmlui/vite-xmlui-plugin` directly — simulating how a user's own Vite project
consumes the plugin as a library.

**Why it needs extra steps:** In the workspace, `xmlui/vite-xmlui-plugin` exports the
raw TypeScript source. Vite's esbuild externalises workspace packages, so Node.js
must load the `.ts` file natively — which requires either `tsx` registered as a
loader, or the plugin pre-built to `dist/nodejs/`. The Turborepo task handles this by
declaring `xmlui#build:for-node` as a dependency.

**Build steps:**
```bash
# 1. Build and publish-prepare the xmlui package
npm run prepublishOnly --workspace=xmlui

# 2. Build the Node.js plugin (produces dist/nodejs/vite-xmlui-plugin.mjs)
npm run build:for-node --workspace=xmlui

# 3. Build the test extension
npm run build:extension --workspace=xmlui-test-extension

# 4. Build the test app in plugin mode
npm run build:plugin-mode --workspace=xmlui-integration-test-app

# Cleanup
npm run postpublish --workspace=xmlui
```

Or via Turborepo (recommended — enforces correct order):
```bash
turbo run xmlui-integration-test-app#build:plugin-mode
```

---

## Running all integration tests

The `tests/playwright.config.ts` spins up web servers for standalone, vite-build,
vite-ssg, and vite-start modes and runs Playwright tests against all of them.
The plugin-mode server is currently commented out in the config.

```bash
# Full pipeline: builds everything in the right order, then runs Playwright
node integration-tests/test-app/scripts/test-integration.mjs

# Or from workspace root via Turborepo + Playwright directly:
turbo run //#test:integration
npx playwright test --config integration-tests/tests/playwright.config.ts
```
