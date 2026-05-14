# Plan: Add `vite-build-plugin` Integration Test Project

## Context

The integration test suite currently validates XMLUI through four modes: `standalone` (UMD bundle), `vite-build` (`xmlui build` → serve), `vite-ssg`, and `vite-start`. None of these test the raw Vite + `vite-xmlui-plugin` path directly — `xmlui build` wraps Vite with its own configuration. The goal is to add a fifth project (`vite-build-plugin`) that exercises `vite build` with `vite-xmlui-plugin` explicitly, mirroring how the `/home/ez/code/work/vite-project` demo app is structured.

## Key Findings

- `vite-project/` uses `xmluiPlugin()` from `xmlui/vite-xmlui-plugin` and a plain object default export in `vite.config.ts`; no `defineConfig` needed
- The test-app's existing `index.html → index.js → vite-entrypoint.ts` chain already works correctly under a plain `vite build` — `index.js` detects Vite mode via `import.meta.env` and imports `vite-entrypoint.ts`, which calls `startApp(runtime, extensions)` with the test extension
- `xmlui` (and thus `xmlui/vite-xmlui-plugin`) is already a dependency in the test-app; `vite` is available via the workspace root devDependencies
- The config is named `vite.config.ts` — since this is a separate project directory, there is no collision risk with `xmlui build`'s internal Vite config. The `vite-xmlui-plugin` source resolves via the `exports` map in `xmlui/package.json`; in dev mode it points to `./src/nodejs/vite-xmlui-plugin.ts` (no prior build needed), while in published usage it points to `dist/nodejs/vite-xmlui-plugin.mjs` (which requires `build:for-node`).
- The test-app `.gitignore` only has `public/js/` — need to add `dist-vite-plugin/`

## Implementation

### 1. Create `integration-tests/test-app/vite.config.ts` (new file)

```typescript
import xmluiPlugin from "xmlui/vite-xmlui-plugin";

export default {
  plugins: [xmluiPlugin()],
  build: {
    outDir: "dist-vite-plugin",
  },
};
```

This mirrors `vite-project/vite.config.ts` exactly, adding only the `outDir` to avoid collision with the existing `dist/` from `xmlui build`.

### 2. Update `integration-tests/test-app/package.json`

Add to `scripts`:
```json
"build-vite-plugin": "vite build --config vite.config.ts"
```

### 3. Update `integration-tests/test-app/.gitignore`

Append:
```
dist-vite-plugin/
```

### 4. Update `integration-tests/tests/playwright.config.ts`

Add port constant:
```typescript
const portViteBuildPlugin = 3216;
```

Add webServer entry:
```typescript
{
  command: `npx serve dist-vite-plugin -l ${portViteBuildPlugin} --no-port-switching -s`,
  port: portViteBuildPlugin,
  cwd: testAppDir,
  reuseExistingServer: true,
},
```

Add project entry:
```typescript
{
  name: "vite-build-plugin",
  use: { baseURL: `http://localhost:${portViteBuildPlugin}` },
},
```

### 5. Update `turbo.json`

Add task under `tasks`:
```json
"xmlui-integration-test-app#build-vite-plugin": {
  "dependsOn": ["xmlui#prepublishOnly", "xmlui-test-extension#build:extension"],
  "outputs": ["integration-tests/test-app/dist-vite-plugin/**"]
}
```

Mirror the pattern of `xmlui-integration-test-app#build` (same dependencies, different output dir).

Also add `"xmlui-integration-test-app#build-vite-plugin"` to the `dependsOn` array of `//#test:integration`.

### 6. No changes needed to root `package.json`

The `test-integration` script calls `turbo run //#test:integration`, and the turbo task's `dependsOn` already chains everything — adding the new task to `//#test:integration`'s `dependsOn` in turbo.json is sufficient.

## Critical Files

| File | Action |
|------|--------|
| `integration-tests/test-app/vite.config.ts` | Create |
| `integration-tests/test-app/package.json` | Add `build-vite-plugin` script |
| `integration-tests/test-app/.gitignore` | Add `dist-vite-plugin/` |
| `integration-tests/tests/playwright.config.ts` | Add port, webServer, project |
| `turbo.json` | Add task + dependency |

## Verification

1. `cd integration-tests/test-app && vite build --config vite.config.ts` — should produce `dist-vite-plugin/index.html`
2. `npx serve dist-vite-plugin -l 3216 -s` — visit `http://localhost:3216`, confirm Home Page renders with TestComponent
3. `npx playwright test --config integration-tests/tests/playwright.config.ts --project=vite-build-plugin` — all 3 tests should pass
4. Full run: `npm run test-integration` — the new task appears in the turbo pipeline and all 5 projects pass
