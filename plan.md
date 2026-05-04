# Integration Test Infrastructure Plan

## Context

The xmlui monorepo lacks tests that validate the production build across its different operational modes. These integration/e2e tests run _after_ the framework is built, consuming the `dist/` artifacts rather than TypeScript source. Three areas are covered:

- **Area A**: Build `xmlui-test-extension` (like `xmlui-gauge`) with `xmlui build-lib`
- **Area B**: Standalone UMD mode — framework and extension loaded as UMD scripts; routes and extension rendering asserted via Playwright
- **Area C**: Vite pipeline modes — same test app built with `xmlui build`, `xmlui ssg`, and served by `xmlui start`; same assertions

---

## Area A: Test Extension

**Location:** `integration-tests/extension/`  
**Package name:** `xmlui-test-extension`

### Why no `clean-package`

The extension's `package.json` exports point directly to `dist/` already — no remapping needed.

### `integration-tests/extension/package.json`

```json
{
  "name": "xmlui-test-extension",
  "type": "module",
  "version": "0.1.0",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": {
      "import": "./dist/xmlui-test-extension.mjs",
      "require": "./dist/xmlui-test-extension.js"
    }
  },
  "scripts": {
    "build:extension": "xmlui build-lib"
  },
  "devDependencies": {
    "xmlui": "*"
  },
  "files": ["dist"]
}
```

### Component: `TestComponent`

**`integration-tests/extension/src/TestComponent.tsx`** — modeled after gauge (`GaugeWrapped.tsx` pattern): `createMetadata` + `wrapComponent`.

- Single `label` prop (string)
- Renders a `<div >TestComponent: {label}</div>` with a unique CSS class
- Imports styles from `TestComponent.module.scss`

**`integration-tests/extension/src/TestComponent.module.scss`** — uses gauge's SCSS theme-var pattern:

```scss
@use "xmlui/themes.scss" as t;

$themeVars: ();
@function createThemeVar($v) {
  $themeVars: t.appendThemeVar($themeVars, $v) !global;
  @return t.getThemeVar($themeVars, $v);
}

$componentName: "TestComponent";
$backgroundColor: createThemeVar("backgroundColor-#{$componentName}");
$textColor: createThemeVar("textColor-#{$componentName}");

@layer components {
  .testComponent {
    background-color: $backgroundColor;
    color: $textColor;
    padding: 1rem;
    border-radius: 0.5rem;
    font-weight: bold;
  }
}

:export {
  themeVars: t.json-stringify($themeVars);
}
```

No `!important`, no `:global()` selectors, no `:root`/`body` rules.

**`integration-tests/extension/src/index.tsx`:**

```tsx
import { testComponentRenderer } from "./TestComponent";
export default {
  namespace: "XMLUIExtensions",
  components: [testComponentRenderer],
};
```

---

## One Test App Project

**Location:** `integration-tests/test-app/`  
**Model:** playground (`xmlui-playground`) — has npm scripts for all actions, driven by turborepo.

### `integration-tests/test-app/package.json`

```json
{
  "name": "xmlui-integration-test-app",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "xmlui start --port 3211 --withMock false",
    "build": "xmlui build --buildMode=INLINE_ALL --withMock false",
    "preview": "xmlui preview --port 3211",
    "ssg": "xmlui ssg",
    "setup:standalone": "node setup-standalone.mjs"
  },
  "dependencies": {
    "xmlui": "*",
    "xmlui-test-extension": "*"
  }
}
```

### Conditional entry point

**`integration-tests/test-app/index.html`** — same HTML for all modes:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <script></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

**`integration-tests/test-app/main.js`:**

```javascript
// import.meta.env is undefined in plain browser (no Vite); Vite replaces it at build time.
if (import.meta.env) {
  // Vite mode (start / build / ssg): Vite resolves the dynamic import at build time
  const { init } = await import("./vite-entrypoint.ts");
  init();
} else {
  // Standalone mode: load UMD bundles from public/, extension auto-registers
  const load = (src) =>
    new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  await load("./xmlui-standalone.umd.js");
  await load("./xmlui-test-extension.js");
  // startApp is called by xmlui-standalone.umd.js's DOMContentLoaded handler.
  // we're done here
}
```

**`integration-tests/test-app/vite-entrypoint.ts`:**

```typescript
import { startApp } from "xmlui";
import testExtension from "xmlui-test-extension";

const runtime = import.meta.glob(["./**/*.xmlui", "./config.json"], { eager: true });

export function init() {
  startApp(runtime, [testExtension]);
}
```

**`integration-tests/test-app/setup-standalone.mjs`** — copies UMD files into the directory for standalone mode (run by `setup:standalone` npm script):

```javascript
import { copyFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
await copyFile(
  resolve(__dirname, "../../xmlui/dist/standalone/xmlui-standalone.umd.js"),
  resolve(__dirname, "xmlui-standalone.umd.js"),
);
await copyFile(
  resolve(__dirname, "../extension/dist/xmlui-test-extension.js"),
  resolve(__dirname, "xmlui-test-extension.js"),
);
console.log("Standalone and extension UMD files copied.");
```

### XMLUI source files

```
integration-tests/test-app/
├── Main.xmlui          # App root with two <Page> routes + <TestComponent>
├── components/
│   ├── Home.xmlui      # <TestComponent label="hello from home"> + link to /about
│   └── About.xmlui     # "About Page" heading + link back to /
└── config.json         # { "name": "Integration Test App" }
```

---

## Package Resolution: `exports` + `prepublishOnly`

No vite aliases. Package resolution works through `exports` in `package.json`:

| Package                | Dev exports        | Production exports                | How to apply                                 |
| ---------------------- | ------------------ | --------------------------------- | -------------------------------------------- |
| `xmlui`                | `./src/index.ts`   | `./dist/lib/xmlui.js`             | Run `xmlui#prepublishOnly` (`clean-package`) |
| `xmlui-test-extension` | N/A (already dist) | `./dist/xmlui-test-extension.mjs` | Already correct — no step needed             |

Before the vite test builds, the turbo pipeline runs `xmlui#prepublishOnly`. After tests, `xmlui#postpublish` restores (`clean-package restore`).

---

## One Test Suite

**`integration-tests/tests/integration.spec.ts`** — single file, all 4 Playwright projects run it:

```typescript
import { test, expect } from "@playwright/test";

test("TestComponent renders via extension", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-testid='test-component']")).toBeVisible();
  await expect(page.locator("[data-testid='test-component']")).toContainText(
    "TestComponent: hello from home",
  );
});

test("TestComponent has theme-var styles applied", async ({ page }) => {
  await page.goto("/");
  const el = page.locator("[data-testid='test-component']");
  const bg = await el.evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(bg).not.toBe(""); // theme var resolved — not empty/transparent
  expect(bg).not.toBe("rgba(0, 0, 0, 0)");
});

test("routing to /about works", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Go to About");
  await expect(page.getByRole("heading", { name: "About Page" })).toBeVisible();
});

test("routing back to home restores extension component", async ({ page }) => {
  await page.goto("/about");
  await page.click("text=Back to Home");
  await expect(page.locator("[data-testid='test-component']")).toBeVisible();
});
```

---

## Playwright Configuration

**`integration-tests/tests/playwright.config.ts` (extend in the project root):**

```typescript
import { defineConfig, devices } from "@playwright/test";
const port = 3211;
// ...
const portStandalone = 3212;
const portViteStart = 3213;
const portViteBuild = 3214;
const portViteSSG = 3215;

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  use: { ...devices["Desktop Chrome"], channel: "chromium" },
  projects: [
    {
      name: "standalone",
      use: { baseURL: `http://localhost:${portStandalone}` },
      webServer: {
        command: `npx serve . --port ${portStandalone} -s`,
        port,
        cwd: `${__dirname}/integraion-tests/test-app`,
        reuseExistingServer: false,
      },
    },
    {
      name: "vite-build",
      use: { baseURL: `http://localhost:${portViteStart}` },
      webServer: {
        command: `npx serve dist --port ${portViteStart} -s`,
        port,
        cwd: `${__dirname}/integraion-tests/test-app`,
        reuseExistingServer: false,
      },
    },
    {
      name: "vite-ssg",
      use: { baseURL: `http://localhost:${portViteBuild}` },
      webServer: {
        command: `npx preview-ssg dist-ssg --port ${portViteBuild}`,
        port,
        cwd: `${__dirname}/integraion-tests/test-app`,
        reuseExistingServer: false,
      },
    },
    {
      name: "vite-start",
      use: { baseURL: `http://localhost:${portViteStart}` },
      webServer: {
        command: `npx xmlui start --port ${portViteStart}`,
        portViteStart,
        cwd: `${__dirname}/integraion-tests/test-app`,
        reuseExistingServer: false,
      },
    },
  ],
});
```

No `testMatch` per project — all projects run all tests in `testDir`.

---

## Turborepo Integration

### Root `package.json` — add workspaces

```json
"workspaces": [
  "./xmlui",
  "./website",
  "./playground",
  "./tools/create-app",
  "./tools/vscode",
  "./tools/preview-ssg",
  "./packages/*",
  "./integration-tests/extension",
  "./integration-tests/test-app"
]
```

### `turbo.json` — new tasks

```json
{
  "tasks": {
    "integration-tests/test-app#setup:standalone": {
      "dependsOn": ["xmlui#build:xmlui-standalone", "integration-tests/extension#build:extension"],
      "outputs": [
        "integration-tests/test-app/xmlui-standalone.umd.js",
        "integration-tests/test-app/xmlui-test-extension.js"
      ]
    },
    "integration-tests/test-app#build": {
      "dependsOn": ["xmlui#prepublishOnly", "integration-tests/extension#prepublishOnly"],
      "outputs": ["integration-tests/test-app/dist/**"]
    },
    "integration-tests/test-app#ssg": {
      "dependsOn": ["xmlui#prepublishOnly", "integration-tests/extension#prepublishOnly"],
      "outputs": ["integration-tests/test-app/dist-ssg/**"]
    },
    "//#test:integration": {
      "cache": false,
      "dependsOn": [
        "integration-tests/test-app#setup:standalone",
        "integration-tests/test-app#build",
        "integration-tests/test-app#ssg"
      ]
    }
  }
}
```

Note: `postpublish` (restore xmlui exports) must run after tests — add it to the root lvl package.json's script after the test run, outside turbo since turbo doesn't have "teardown" tasks:

```json
{
  "test": "turbo run //#_e2e //#test:integration",
  "test-integration": "turbo run //#test:integration",
  "//#test:integration": "npx playwright test --config integration-tests/tests/playwright.config.ts; npm run --workspace='xmlui' clean-package restore"
}
cd xmlui && npx clean-package restore
```

---

## Files to create / modify

| File                                                        | Action                                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `package.json` (root)                                       | Add `integration-tests/extension` + `integration-tests/test-app` to workspaces |
| `turbo.json`                                                | Add `setup:standalone`, `build`, `ssg`, `test:integration` tasks               |
| `integration-tests/extension/package.json`                  | New — exports point to dist directly                                           |
| `integration-tests/extension/src/index.tsx`                 | New                                                                            |
| `integration-tests/extension/src/TestComponent.tsx`         | New                                                                            |
| `integration-tests/extension/src/TestComponent.module.scss` | New                                                                            |
| `integration-tests/test-app/package.json`                   | New                                                                            |
| `integration-tests/test-app/index.html`                     | New                                                                            |
| `integration-tests/test-app/main.js`                        | New — conditional Vite/standalone entry                                        |
| `integration-tests/test-app/vite-entrypoint.ts`             | New — import.meta.glob + startApp                                              |
| `integration-tests/test-app/setup-standalone.mjs`           | New — copies UMD files                                                         |
| `integration-tests/test-app/Main.xmlui`                     | New                                                                            |
| `integration-tests/test-app/pages/Home.xmlui`               | New                                                                            |
| `integration-tests/test-app/pages/About.xmlui`              | New                                                                            |
| `integration-tests/test-app/config.json`                    | New                                                                            |
| `integration-tests/tests/playwright.config.ts`              | New                                                                            |
| `integration-tests/tests/integration.spec.ts`               | New — single test file for all modes                                           |

---

## Verification

- Extension builds: `integration-tests/extension/dist/xmlui-test-extension.mjs` exists
- Standalone: `npm run setup:standalone` copies UMDs; serve `test-app/` → TestComponent visible, routing works
- Vite build: `npm run build` in `test-app/` → `dist/` produced; serve → same assertions
- SSG: `npm run ssg` → `dist-ssg/` produced; serve → same assertions
- Full: `npm run test-integration` → all 16 tests pass (4 tests × 4 projects)
