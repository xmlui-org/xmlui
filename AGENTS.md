# AGENTS.md — XMLUI Monorepo

Agent-oriented reference for the XMLUI monorepo. Read this first for any task.
For deeper detail, refer to:

- **`xmlui/dev-docs/`** — architecture & subsystem reference (rendering, containers, theming, forms, etc.)
- **`.ai/xmlui/`** — contribution conventions and patterns (components, testing, QA checklist). Key files: `.ai/xmlui/markup.md` (XMLUI markup patterns, context variables, scripting semantics), `.ai/xmlui/data.md` (DataSource/APICall patterns), `.ai/xmlui/component-architecture.md` (component authoring — metadata, renderer, native patterns), `.ai/xmlui/behaviors.md` (auto-attached behaviors), `.ai/xmlui/testing-conventions.md` (E2E + unit test conventions), `.ai/xmlui/qa-checklist.md` (QA audit checklist).

---

## What is XMLUI

> **User perspective**: `.ai/xmlui/overview.md` describes XMLUI from the application developer's point of view — markup syntax, reactive binding, routing, forms, global functions. Read this to understand *what the components you build are for*.


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
│   └── dev-docs/             # Architecture & subsystem reference docs
├── guidelines/      # Contribution conventions and patterns (xmlui/, packages/, tools/, …)
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

---

## Task Quick Reference

Use the prompt files in `.github/prompts/` for step-by-step workflows. Invoke with `#prompt-name` in VS Code Copilot chat.

| Task | Prompt file | When to use |
|------|-------------|-------------|
| Create a new component (core) | `#create-component` | Building a new built-in XMLUI component in `xmlui/src/components/` |
| Extend an existing component | `#extend-component` | Adding props, events, theme variables, or behavior to an existing component |
| Create a component in an extension package | `#create-extension-component` | Building a component in `packages/xmlui-*` instead of core |
| Create a new extension package | `#create-extension-package` | Setting up a brand-new `packages/xmlui-*` package with component(s) |
| Fix a bug | `#fix-bug` | Diagnosing and fixing a component issue with regression tests |
| QA review a component | `#qa-review` | Auditing an existing component against conventions, accessibility, and test coverage |
| Review and fix a component | `#review-component` | Auditing a component with the QA checklist and applying fixes, including Native→React rename |
| Add E2E tests | `#add-e2e-tests` | Adding or expanding Playwright tests for an under-tested component |
| Refactor core code | `#refactor-core` | Restructuring framework internals in `components-core/` |
| Write component documentation | `#write-component-docs` | Writing or updating hand-written description files for doc generation |
| Add a new stereotype task | `#add-stereotype` | Creating a new prompt file for a repeatable task pattern |

If no prompt is invoked, use the documentation map below to find the right reference material for your task.

---

## Documentation Map

### Architecture & Internals (`.ai/xmlui/`)

| AI Doc | Topic | When to read |
|--------|-------|-------------|
| `mental-model.md` | Framework lifecycle, key abstractions | Refactoring core, understanding rendering flow |
| `rendering-pipeline.md` | `renderChild`, `ComponentWrapper`, behavior chain | Modifying rendering, debugging render issues |
| `container-state.md` | State composition (6 layers), proxy tracking, reducers | Stateful components, debugging state issues |
| `component-architecture.md` | Two-file pattern, metadata, renderer, native | Any component work |
| `wrapcomponent.md` | `wrapComponent` config API, events, templates, state | Components using `wrapComponent` |
| `expression-eval.md` | Parser pipeline, AST, sync/async eval, dependency tracking | Expression bugs, scripting issues |
| `theming-styling.md` | CSS variables, SCSS modules, tone management | Visual components, theme customization |
| `data-operations.md` | DataSource, APICall, loaders, React Query | Data-fetching components |
| `behaviors.md` | The 9 auto-attached behaviors, application order | Behavior interactions, form components |
| `action-execution.md` | Action model, ApiBoundComponent, nested actions | Event handling, API calls |
| `user-defined-components.md` | UDCs, slots, template composition | User-facing extensibility |
| `form-infrastructure.md` | Form/FormItem, validation, dirty/touched state | Form components |
| `routing.md` | Pages/Page, react-router integration, navigation | Routing changes |
| `extension-packages.md` | Extension interface, registration, build config | Extension package work |
| `app-context.md` | Global functions, Actions namespace, utilities | Adding global functions |
| `option-components.md` | Option/OptionContext, search, filtering | Select, AutoComplete, RadioGroup |
| `error-handling.md` | ErrorBoundary, error propagation, loader errors | Error-related bugs |
| `parsers.md` | XML, scripting, style, keybinding parsers | Parser modifications |
| `inspector-debugging.md` | Trace system, `pushXsLog`, verbose mode | Debugging, inspector |
| `language-server.md` | LSP, MetadataProvider, completions, diagnostics | VS Code extension |
| `build-system.md` | CLI commands, Vite plugin, framework builds | Build configuration |
| `monorepo-structure.md` | Workspaces, Turborepo, changesets, releases | Repo structure, CI/CD |
| `testing-conventions.md` | E2E + unit patterns, `initTestBed`, locators | Any testing work |
| `accessibility.md` | ARIA, keyboard nav, per-component audit | Accessibility fixes |
| `doc-generation.md` | Generate-docs pipeline, MetadataProcessor | Documentation generation |

| `qa-checklist.md` | QA audit checklist — actionable per-section checklist for component reviews |

### Human-Readable Guides (`xmlui/dev-docs/guide/`)

Numbered 01–25, same topics as above. Read for deeper explanations and conceptual context. AI docs are sufficient for most implementation tasks.

### Project Rules (`guidelines.md`)

Contains ~300 lines of verified rules organized by topic. Read the section relevant to your task:
- **Topics 4–5**: Component architecture and `wrapComponent` rules
- **Topics 7**: Theming and SCSS conventions
- **Topics 9**: Behavior attachment rules
- **Topics 12**: Form infrastructure rules
- **Topics 17**: Error handling rules
- **Topics 23**: Testing conventions
- **Topics 24**: Accessibility rules
