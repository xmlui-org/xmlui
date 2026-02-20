# AGENTS.md — XMLUI Monorepo

Agent-oriented reference for the XMLUI monorepo. Read this first for any task.
For deeper detail, refer to:

- **`xmlui/conventions/`** — component checklists and refactoring templates.
- **`xmlui/dev-docs/`** — full developer docs (architecture, testing conventions, component patterns, build system).

---

## What is XMLUI

XMLUI is a **declarative, reactive frontend framework** for building web applications using XML markup. Users write `.xmlui` files instead of JavaScript/JSX. The framework is fully reactive — expressions in markup re-evaluate automatically when their dependencies change, similar to a spreadsheet. There is no manual state wiring.

Under the hood XMLUI is built on **React**. Every XMLUI component is backed by a React component. Reactivity, routing, data fetching, and theming are all React-based internally, but users of the framework never interact with React directly.

---

## Two Deployment Modes

XMLUI operates in one of two modes, determined when a project is created — not something that changes at runtime.

**Standalone mode (buildless)**
The app is served as static files. The XMLUI runtime (`xmlui-standalone.umd.js`) is loaded via a `<script>` tag. On startup it fetches `Main.xmlui`, discovers referenced components from the `components/` directory, and renders everything — all parsing happens in the browser at runtime. No build step required. Deploy by copying files to any static web server.

```
my-app/
├── index.html         ← loads xmlui-standalone.umd.js from a CDN or local path
├── Main.xmlui         ← app entry point
├── config.json        ← optional: routing, globals
├── components/        ← custom components, discovered automatically
├── themes/            ← optional: custom theme JSON files
└── xmlui/<version>.js ← the XMLUI runtime
```

**Vite mode (built)**
The app uses Vite + the `vite-xmlui-plugin`. `.xmlui` files are compiled at build time into JS modules. `import.meta.glob()` in the entry point pre-bundles all components. The result is an optimized production bundle with no runtime parsing overhead. Used for production sites (like the XMLUI docs site) and when HMR during development is needed.

Both modes share the same rendering pipeline once components are resolved. The same `.xmlui` markup syntax works in both.

---

## High-Level App Architecture

An XMLUI app has these layers:

1. **Markup** — `.xmlui` files describing the UI tree in XML. Components are XML tags; attributes are props; `{expression}` syntax binds values reactively.
2. **Component registry** — maps component names to their React renderer. Built-in components live in `xmlui/src/components/`. Extension packages add more.
3. **Rendering pipeline** — the framework parses component definitions, evaluates expressions, and produces a React element tree. The `renderChild()` function is the recursive heart of this.
4. **State containers** — each component tree node that has state lives in a container. The container holds a flat key-value state object and a reducer. Reactivity flows through this.
5. **Provider stack** — the app wraps everything in providers for: routing (`react-router-dom`), data fetching (`@tanstack/react-query`), theming, icons, confirmation modals, debug tooling, and more.
6. **Global context** — `AppContext` exposes global functions to markup: `navigate()`, `toast()`, `confirm()`, `Actions.*`, and utilities like date/math helpers.

---

## Repository Layout

```
xmlui-repo-root/
├── xmlui/           # Main framework package — PRIMARY FOCUS
│   ├── src/
│   │   ├── components/       # All built-in XMLUI components (~104 components)
│   │   ├── components-core/  # Core rendering infrastructure, theming, parts
│   │   ├── parsers/          # Expression / XML parsers
│   │   └── testing/          # Test fixtures and infrastructure
│   ├── tests/                # Unit tests (Vitest), mirrors src/ structure
│   ├── dev-docs/             # Developer documentation
│   └── conventions/          # AI-facing conventions and checklists
├── packages/        # Extension packages (xmlui-animations, xmlui-pdf, xmlui-spreadsheet, etc.)
├── docs/            # Documentation website (built-mode XMLUI app)
├── blog/            # Blog site
└── tools/           # create-app CLI, VS Code extension
```

The extension packages in `packages/` follow the same component conventions as `xmlui/` and depend on it.

---

## Monorepo Tooling

**npm workspaces** + **Turborepo 2.x** for task orchestration. **Vite 7.x** for builds, **Vitest** for unit tests, **Playwright** for E2E tests. **@changesets/cli** for versioning.

### Changesets

When a change impacts framework users (new feature, bug fix, API change) and not xmlui developers or applications, add a changeset before finishing.
The cli tool is interactive, so instead do the following manual steps:

1. create a file in .changeset/<unique-name>.md
2. The frontmatter contains pairs of (affected package name - semver increments), like `"xmlui": patch`. All changes are strictly marked as `patch` changes, unless stated otherwise.
3. Markdow body is the change description
4. Check your changes are recognised by running `npx changeset status` at the monorepo root
