# XMLUI Monorepo Structure & Tooling — AI Reference

Authoritative reference for the XMLUI monorepo layout, workspace configuration, Turborepo orchestration, versioning, and CI/CD. For contributors and tooling-aware code generation.

---

## Repository Root Layout

```
xmlui-repo-root/
  package.json              # Root workspace config, shared scripts
  turbo.json                # Turborepo task pipeline
  .changeset/               # Pending changeset files
  vitest.workspace.ts       # Vitest workspace config
  playwright.config.ts      # Playwright E2E config

  xmlui/                    # ← CORE FRAMEWORK PACKAGE
  website/                  # Documentation site (Vite mode)
  playground/               # Interactive XMLUI playground

  tools/
    create-app/             # Scaffolding CLI for new apps
    vscode/                 # VS Code extension (xmlui-vscode)
    preview-ssg/            # SSG preview tool
    create-xmlui-hello-world/

  packages/                 # Extension packages (xmlui-*)
    xmlui-animations/
    xmlui-crm-blocks/
    xmlui-devtools/
    # and many more...
```

---

## Package Categories

| Category               | Packages                                                   | Role                                   |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------- |
| **Core framework**     | `xmlui/`                                                   | Main framework, CLI, LSP, parsers      |
| **Docs & content**     | `website/`, `blog/`                                        | Documentation site and blog            |
| **Playground**         | `playground/`                                              | Interactive component explorer         |
| **Tools**              | `tools/create-app/`, `tools/vscode/`, `tools/preview-ssg/` | Developer tooling                      |
| **Extension packages** | `packages/xmlui-*/`                                        | Component libraries bundled separately |

---

## npm Workspaces

Root `package.json` declares all workspace members:

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

**Cross-package references:** Use `"xmlui": "workspace:*"` in `devDependencies`. The workspace protocol is replaced with the actual published version when `changeset publish` runs.

**Shared installs:** All packages share `node_modules/` at the root via hoisting. Run `npm run setup` from the root only (see [Development Setup](#development-setup)).

---

## Root-Level Scripts

```bash
# Setup (run after cloning or after npm install)
npm run setup                   # npm install && allow-scripts run (required for supply-chain safety)
npm run allow-scripts           # re-run allow-scripts only (without npm install)

# Core framework
npm run build-xmlui             # turbo run build:xmlui-all
npm run build-vscode-extension  # turbo run xmlui-vscode#build:vsix
npm run build-extensions        # turbo run build:extension (all packages/)

# Docs & web
npm run build-docs              # turbo run build:docs
npm run build-playground        # turbo run build:playground
npm run build-blog              # turbo run build:blog
npm run release-docs            # turbo run release:docs
npm run generate-docs           # turbo run generate-docs

# Testing
npm run test                    # turbo full test suite (unit + E2E)
npm run test-smoke              # Smoke E2E only (with unit tests)
npm run test-e2e-dev            # playwright test (dev server)
npm run test-e2e-fast           # build test bed then run E2E
npm run test:e2e                # E2E without dev server
npm run test:e2e:smoke          # E2E smoke without dev server

# Changesets / versioning
npm run changeset:add           # changeset add (interactive)
npm run changeset:version       # bump versions + update CHANGELOGs
npm run changeset:publish       # publish to npm + create git tags
```

---

## Turborepo

Defined in root `turbo.json`. Controls task execution order, caching, and parallelism.

### Caching rules

- Turborepo hashes all inputs (files + env vars) to determine cache hits
- `globalEnv: ["CI"]` propagates the CI flag to all task cache keys
- `envMode: "loose"` — tasks can access env vars not listed in their config
- `"cache": false` — tasks that must always re-run (e.g., anything that fetches from external sources)
- Local cache: `node_modules/.cache/turbo/`

### `^` prefix semantics

`"dependsOn": ["^build:extension"]` means: run `build:extension` in every upstream workspace (per the `workspaces` dependency graph) before this task. Removes this to break the dependency chain.

### Useful Turborepo commands

```bash
turbo run build:xmlui-all                    # Full build with caching
turbo run build:xmlui-all --force            # Force rebuild (ignore cache)
turbo run build:xmlui-all --dry-run          # Execution plan only
turbo run build:xmlui-all --graph            # Show dependency graph
turbo run build:xmlui-all --verbosity=3      # Debug cache hits/misses
turbo run build --filter=xmlui               # Single package only
turbo watch generate-docs-summaries          # Watch mode
```

---

## Versioning & Changesets

XMLUI uses `@changesets/cli` for version management.

### What is a changeset?

A changeset is a Markdown file in `.changeset/` that declares:

1. Which packages are affected (`"xmlui": patch|minor|major`)
2. A human-readable description of the change

All changes are `patch` unless explicitly stated otherwise.

### Creating a changeset (manual — preferred for agents)

Do NOT use `npx changeset add` (interactive). Instead:

1. Create `.changeset/<unique-name>.md` with content:

```md
---
"xmlui": patch
---

Description of the change.
```

2. Verify: `npx changeset status` at monorepo root

### Changeset automation

PRs trigger `add-changeset.yml` which analyzes Conventional Commits and auto-creates changeset files on the PR branch. Manual changesets override automation.

### Version bump flow

```bash
npm run changeset:version   # Consumes .changeset files, bumps package.json versions, updates CHANGELOGs
npm run changeset:publish   # Publishes to npm, creates git tags
```

### Conventional Commit types → changeset mapping

| Commit type               | Changeset bump |
| ------------------------- | -------------- |
| `fix:`, `chore:`, `docs:` | patch          |
| `feat:`                   | minor          |
| `BREAKING CHANGE:`        | major          |

---

## Release Pipeline

Two release channels: **beta** (automated) and **stable** (manual trigger).

### Beta releases (automated)

- Trigger: every merge to `main` that includes changeset files
- Workflow: `beta-release.yml`
- Versions packages with beta suffix: `1.0.1-beta.shortsha`
- Publishes to npm with `beta` dist-tag
- Commits snapshot version back to `main`

### Stable releases (manual)

1. Release manager triggers `stable-release.yml` → GitHub Actions
2. Workflow creates a "Version Packages" PR with bumped versions and updated CHANGELOGs
3. Team reviews and merges the PR
4. Merge triggers `publish_and_release` job: publishes to `latest` dist-tag + creates GitHub Releases + git tags

### Race condition handling

If `main` changes significantly after the "Version Packages" PR is created (new beta changesets merged), close the PR and re-trigger the stable release workflow.

---

## Development Setup

### First-time setup

```bash
git clone <repo-url>
cd xmlui
npm run setup        # npm install + allow-scripts run (required for supply-chain safety)
npm run build-xmlui  # Build core (required before running extensions or tests)
```

> **Why `npm run setup` instead of `npm install`?** The repo uses `@lavamoat/allow-scripts` to gate post-install lifecycle scripts. Running bare `npm install` skips that gate. `npm run setup` runs both steps in the correct order.

### Working on the core framework

Read the [Build System Documentation](./build-system.md) to know how to see the changes be reflected in applications.

### Working on the docs site

```bash
cd website
xmlui start                    # Docs dev server with HMR
# Or from root:
turbo watch generate-docs-summaries
```

---

## Clearing Caches

```bash
# Turborepo cache
rm -rf node_modules/.cache/turbo/

# Vite caches
find . -path '*/node_modules/.vite' -type d -exec rm -rf {} +

# Build artifacts
rm -rf xmlui/dist/
rm -rf packages/*/dist/
rm -rf website/dist/

# Full clean install
rm -rf node_modules package-lock.json
find . -name 'node_modules' -maxdepth 3 -type d -exec rm -rf {} +
npm run setup
```

---

## Key Files

| File                   | Role                                                        |
| ---------------------- | ----------------------------------------------------------- |
| `package.json` (root)  | Workspace declarations, shared scripts, package manager pin |
| `turbo.json`           | Task pipeline, caching config, dependency graph             |
| `vitest.workspace.ts`  | Vitest multi-package test config                            |
| `playwright.config.ts` | Playwright E2E test config                                  |
| `.changeset/`          | Pending changeset files for version management              |
| `xmlui/package.json`   | Core framework package metadata and scripts                 |
| `xmlui/vite.config.ts` | Framework build configuration                               |
| `xmlui/bin/`           | CLI tools (`xmlui` command)                                 |
| `tools/vscode/`        | VS Code extension source                                    |
| `tools/create-app/`    | App scaffolding CLI                                         |

---

## Workspace Protocol Rules

- Always use `"workspace:*"` for cross-workspace deps (replaced on publish)
- `"private": true` in root — monorepo root is never published
- Each publishable package declares `"type": "module"` and `"files": ["dist"]`
- Extension packages list `xmlui` as a peer dependency, not a regular dependency
