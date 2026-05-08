# 22 — Monorepo Structure & Tooling

## Why This Matters

The XMLUI codebase is a monorepo containing the core framework, a dozen extension packages, a docs site, a playground, CLI tools, and a VS Code extension — all versioned and released together. Understanding how the repository is organized and how its tooling works lets you navigate quickly, run the right build commands, add a changeset properly, and not accidentally break cross-package dependencies.

---

## Table of Contents

1. [Repository Layout](#repository-layout)
2. [npm Workspaces](#npm-workspaces)
3. [Turborepo Orchestration](#turborepo-orchestration)
4. [Versioning with Changesets](#versioning-with-changesets)
5. [Release Pipeline](#release-pipeline)
6. [Common Development Workflows](#common-development-workflows)
7. [Key Files](#key-files)
8. [Key Takeaways](#key-takeaways)

---

## Repository Layout

At the root level the repository contains five areas:

```
xmlui-repo-root/
  package.json            ← workspace config + shared scripts
  turbo.json              ← Turborepo task pipeline
  playwright.config.ts    ← E2E test config
  vitest.workspace.ts     ← unit test workspace config
  .changeset/             ← pending version changeset files

  xmlui/                  ← CORE FRAMEWORK (primary development target)
  website/                ← documentation site
  playground/             ← interactive component explorer
  blog/                   ← blog site

  tools/
    create-app/           ← scaffolding CLI for new XMLUI apps
    vscode/               ← VS Code extension (xmlui-vscode)
    preview-ssg/          ← SSG preview tool
  
  packages/               ← extension component libraries
    xmlui-animations/
    xmlui-crm-blocks/
    xmlui-devtools/
    xmlui-docs-blocks/
    xmlui-echart/
    xmlui-gauge/
    xmlui-grid-layout/
    xmlui-masonry/
    xmlui-pdf/
    xmlui-react-flow/
    xmlui-recharts/
    xmlui-search/
    xmlui-select/
    xmlui-tiptap-editor/
    xmlui-website-blocks/
    …
```

### Package categories

**Core framework** (`xmlui/`): The main `xmlui` npm package. Contains the React-based rendering engine, all ~100 built-in components, the CLI (`src/nodejs/bin/`), the XML and scripting parsers, the language server, and the Vite plugin. Everything else depends on this.

**Docs & web** (`website/`, `blog/`): The documentation website and blog, both built-mode XMLUI applications. They depend on both `xmlui` and the extension packages.

**Playground** (`playground/`): An interactive component explorer, also a built-mode XMLUI app.

**Tools** (`tools/`): The `create-app` scaffolding CLI (used by `npm create xmlui-app`) and the VS Code extension that provides IDE support for `.xmlui` files.

**Extension packages** (`packages/xmlui-*/`): Component libraries that ship separately from the core. Each is a self-contained npm package with its own `build:extension` script, demo app, and optional `build:meta` for IDE support.

---

## npm Workspaces

The root `package.json` declares all workspace members:

```json
{
  "name": "xmlui-root",
  "private": true,
  "workspaces": [
    "./xmlui",
    "./website",
    "./playground",
    "./tools/create-app",
    "./tools/vscode",
    "./tools/preview-ssg",
    "./packages/*"
  ],
  "packageManager": "npm@10.9.2",
  "engines": { "node": ">=18.0.0", "npm": ">=10.0.0" }
}
```

npm workspaces provide two main benefits:

1. **Dependency hoisting.** All packages share a single `node_modules/` at the root. You run `npm install` once from the root, and all packages get their dependencies. You should never run `npm install` inside an individual package directory.

2. **Workspace protocol.** Packages that depend on other workspace packages use `"xmlui": "workspace:*"` in their `devDependencies`. During development this resolves to the local package; when `changeset publish` runs, the `workspace:*` placeholder is replaced with the actual published version.

---

## Turborepo Orchestration

Turborepo sits on top of npm workspaces and manages *what* to build, *in what order*, and *whether to skip it based on a cache hit*.

### How caching works

Turborepo hashes all declared inputs (source files, env vars, `package.json`) to produce a cache key. If the output for that key already exists locally (in `node_modules/.cache/turbo/`) or remotely, the task is replayed instantly. No rebuild needed.

This means running `npm run build-xmlui` a second time after nothing has changed takes milliseconds rather than minutes.

### Task dependencies

The `turbo.json` file defines the task graph. The most important concept is the `^` prefix in `dependsOn`:

- `"dependsOn": ["build:xmlui"]` — this task depends on `build:xmlui` in the *same* package
- `"dependsOn": ["^build:extension"]` — this task depends on `build:extension` completing in *all upstream workspace packages* first

This is how Turborepo ensures that when you build `website`, all extension packages and the core framework are already built.

### Key task pipeline

The complete dependency chain for a full documentation site build looks like this:

```
build:xmlui-metadata
  ↓
gen:langserver-metadata
  ↓
xmlui-vscode#build
  ↓
xmlui-vscode#build:vsix

build:xmlui-metadata + build:meta (per extension)
  ↓
generate-docs
  ↓
generate-docs-summaries
  ↓  (combined with: ^build:extension + ^build:xmlui + gen:releases)
build:docs
```

For the VS Code extension specifically:

```
build:xmlui-metadata  →  gen:langserver-metadata  →  xmlui-vscode#build  →  xmlui-vscode#build:vsix
```

### Root-level scripts

All of these run from the repository root:

```bash
# Core framework
npm run build-xmlui             # Build framework (all three modes: lib + standalone + metadata)
npm run build-vscode-extension  # Build and package the VS Code extension

# Extension packages
npm run build-extensions        # Build all packages/xmlui-* packages

# Documentation & web
npm run build-docs              # Build full documentation site
npm run build-playground        # Build playground
npm run generate-docs           # Regenerate docs from component metadata (force, no cache)

# Testing
npm run test                    # Full test suite: unit + E2E
npm run test-smoke              # Smoke E2E tests + unit tests
npm run test-e2e-dev            # Playwright tests using dev server (faster iteration)

# Versioning
npm run changeset:add           # Interactive: add a changeset
npm run changeset:version       # Consume changesets, bump versions, update CHANGELOGs
npm run changeset:publish       # Publish to npm, create git tags
```

### Useful Turborepo commands directly

```bash
turbo run build:xmlui-all --dry-run     # See execution plan without running
turbo run build:xmlui-all --force       # Rebuild, ignoring the cache
turbo run build:xmlui-all --graph       # Output a dependency graph
turbo run build:xmlui-all --verbosity=3 # Debug cache hits and misses
turbo run build:xmlui --filter=xmlui    # Build only the core framework
turbo watch generate-docs-summaries     # Watch mode for docs generation
```

---

## Versioning with Changesets

XMLUI uses `@changesets/cli` to manage version bumps and changelogs across the monorepo.

### What a changeset is

A changeset is a small Markdown file in `.changeset/` that declares:
- Which packages are affected
- The type of bump (`patch`, `minor`, or `major`)
- A human-readable description of the change

All XMLUI changes use `patch` bumps unless explicitly stated otherwise.

### Creating a changeset (the agent-friendly way)

Because `changeset add` is interactive, agents should create the file directly:

1. Create `.changeset/<unique-descriptive-name>.md`:

```markdown
---
"xmlui": patch
---

Fix: button variant prop now correctly applies custom theme variables.
```

2. Verify it was recognized:
```bash
npx changeset status
```

### When to add a changeset

Add a changeset for any change that affects **framework users** — new features, bug fixes, API changes, behavior changes. Do not add changesets for:
- Changes that only affect the docs site or blog content
- Internal tooling or test infrastructure changes
- Changes to `.ai/` documentation or dev-docs

### How changesets flow to a release

```
Developer adds .changeset/*.md
  ↓
PR merged to main
  ↓
beta-release.yml: bumps to beta version, publishes with "beta" dist-tag
  ↓
(when stable is needed)
stable-release.yml: creates "Version Packages" PR
  ↓
PR reviewed and merged
  ↓
publish_and_release: publishes to "latest" dist-tag + creates GitHub Releases + git tags
```

---

## Release Pipeline

### Beta releases (automatic)

Every merge to `main` that includes changeset files triggers an automated beta release:
- Packages are versioned with a `beta` suffix (e.g., `1.0.5-beta.abc1234`)
- Published to npm under the `beta` dist-tag
- Version commits are pushed back to `main`

Beta releases let consumers test upcoming changes without affecting the `latest` npm tag.

### Stable releases (manual trigger)

A release manager manually triggers the stable release workflow on GitHub Actions:

1. The `stable-release.yml` workflow creates a "Version Packages" PR
2. The PR shows exactly which packages bump and what their changelogs contain
3. The team reviews and merges the PR
4. Merging triggers publishing to `latest` + git tag creation + GitHub Release creation

**Important:** If `main` receives new changesets after the "Version Packages" PR is created, close the PR and re-trigger the workflow to generate a fresh PR based on the latest state of `main`.

### Conventional Commits → changeset automation

The `add-changeset.yml` workflow analyzes Conventional Commit messages on PRs and automatically creates changeset files:

| Commit prefix | Bump type |
|---------------|-----------|
| `fix:`, `chore:`, `docs:` | `patch` |
| `feat:` | `minor` |
| `BREAKING CHANGE:` | `major` |

Manual changeset files always take precedence over automation.

---

## Common Development Workflows

### First-time setup

```bash
git clone <repo-url>
cd xmlui-repo-root
npm install               # Single install for all workspaces
npm run build-xmlui       # Build core framework (required before other things work)
```

### Working on the core framework

```bash
cd xmlui
npm run build:for-node             # Build CLI first (always do this first)

# Terminal 1: rebuild the library
npm run build:xmlui

# Terminal 2: run the test bed app
cd src/testing/infrastructure
xmlui start
```

> **Note:** `xmlui build-lib --watch` (watch mode) is currently broken due to a `vite-plugin-dts` incompatibility. Rebuild manually with `npm run build:xmlui` as needed.

### Working on an extension package

```bash
cd packages/xmlui-myextension

# Terminal 1: build the extension
npm run build:extension

# Terminal 2: demo app with HMR
npm start
```

> **Note:** `npm run build-watch` (`xmlui build-lib --watch`) is currently broken due to a `vite-plugin-dts` incompatibility. Use a single `build:extension` run instead.

### Working on the docs site

```bash
# From repo root:
turbo watch generate-docs-summaries   # Keep docs generated from metadata

# Then:
cd website
xmlui start                           # Docs dev server
```

### After making a user-facing change

```bash
# Create a changeset manually
cat > .changeset/my-fix-description.md << 'EOF'
---
"xmlui": patch
---

Fix: description of what was fixed.
EOF

# Verify
npx changeset status
```

### Clearing caches when something seems wrong

```bash
# Turborepo cache
rm -rf node_modules/.cache/turbo/

# Vite dev caches
find . -path '*/node_modules/.vite' -type d -maxdepth 5 -exec rm -rf {} +

# Build outputs
rm -rf xmlui/dist/ packages/*/dist/ website/dist/

# Nuclear option: full clean install
rm -rf node_modules
find . -name 'node_modules' -maxdepth 3 -type d -exec rm -rf {} +
npm install
```

---

## Key Files

| File | Role |
|------|------|
| `package.json` (root) | Workspace declarations, shared scripts, `packageManager` pin |
| `turbo.json` | All task definitions, dependency graph, caching config |
| `vitest.workspace.ts` | Vitest multi-package test configuration |
| `playwright.config.ts` | Playwright E2E test suite configuration |
| `.changeset/` | Pending changeset files |
| `xmlui/package.json` | Core framework package: scripts, deps, exports |
| `xmlui/vite.config.ts` | Framework Vite build configuration |
| `xmlui/src/nodejs/bin/` | CLI source (`xmlui start`, `xmlui build`, etc.) |
| `tools/vscode/` | VS Code extension source and packaging |
| `tools/create-app/` | `npm create xmlui-app` scaffolding templates |

---

## Key Takeaways

- **One `npm install` at the root installs everything.** Never run `npm install` inside a workspace package; it bypasses hoisting and creates duplicate installs.
- **Turborepo caches by content hash.** Unchanged packages are not rebuilt. Use `--force` only when you suspect a stale cache, not routinely.
- **The `^` prefix in `dependsOn` is critical.** It enforces upstream package ordering. Don't remove it to "speed up" a build — downstream packages will get stale inputs.
- **Changesets are how versions flow to npm.** Every user-facing change needs a `.changeset/*.md` file. Create it manually (don't use the interactive CLI in agents). All XMLUI changes are `patch` unless stated otherwise.
- **Two release channels.** Beta is automatic on every merge; stable is a manual, reviewed process. Don't publish stable builds without going through the workflow.
- **Build the CLI before anything else.** `npm run build:for-node` (from `xmlui/`) must run first when working from a source checkout. The `xmlui` CLI command uses the compiled bin output; other build commands break without it.
- **`workspace:*` in deps is replaced on publish.** Extension packages declare `"xmlui": "workspace:*"` during development. This becomes the real version number when `changeset publish` runs.
- **Turbo's `cache: false` means "always run".** Tasks that fetch external data (GitHub releases) or always need fresh output must opt out of caching explicitly.
