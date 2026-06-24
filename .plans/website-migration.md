# Website Migration Plan

Status: draft  
Source baseline: `/home/ez/code/work/wt/website` (old repo)  
Target: `/home/ez/code/work/xmlui/website`  

## Purpose

Migrate the minimal website scaffold so that `npx xmlui start` boots a dev server
with a working `<Button>website here</Button>` page. Content pages, extensions,
and build tooling come later.

## What's Implemented

### CLI (`xmlui/src/cli/`)

Copied the `xmlui start` pattern from the old `wt/xmlui/src/nodejs/bin/` and
adapted it to use the new framework's `xmluiPlugin` from
`src/vite-plugin/xmluiPlugin.ts`.

| File | Purpose |
|------|---------|
| `cli/bootstrap.js` | Node entry point — loads `tsx`, imports `index.ts` |
| `cli/index.ts` | yargs CLI — `start` command only (extensible later) |
| `cli/start.ts` | Creates Vite dev server with `xmluiPlugin()` and `@vitejs/plugin-react` |

`start.ts` reads `xmlui.config.json` from the consumer project's cwd for
extension config, sets up `.xmlui` resolve extensions, and configures
optimizeDeps so Rolldown's dep scanner can handle `.xmlui` files.

### Website scaffold (`website/`)

| File | Purpose |
|------|---------|
| `package.json` | Workspace member, depends on `xmlui:*`, `"start": "xmlui start"` |
| `index.html` | `<div id="root">`, loads `index.ts` |
| `index.ts` | Imports `renderXmluiApp` + `Main.xmlui` default export, handles HMR |
| `src/Main.xmlui` | `<App><Button>website here</Button></App>` |
| `tsconfig.json` | bundler resolution, react-jsx, target es2017 |
| `xmlui.config.json` | Analysis toggled off |

The new framework's `emitXmluiModule` codegen wraps `.xmlui` output with
`createXmluiModule()`, so the default export is a ready-to-render `XmluiModule`.
No `import.meta.glob` + `startApp` needed — just `renderXmluiApp(module, root)`.

### Root workspace

Added `website` to workspaces, added `bin` entry + `tsx`/`yargs` deps to the
`xmlui` package.

## Steps to Run

1. `npm install` at repo root
2. `cd website && npx xmlui start`
3. Open `http://localhost:5173/`

## What's Intentionally Skipped

- All extensions (search, website-blocks, docs-blocks, echart, calendar, etc.)
- `src/config.ts` (StandaloneAppDescription)
- Themes (`src/themes/`)
- Content pages and routing
- Nav panel, footer, search
- `public/` static assets
- Build/SSG commands (`xmlui build`, `xmlui ssg`, etc.)
