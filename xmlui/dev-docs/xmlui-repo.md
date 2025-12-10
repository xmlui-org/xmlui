# XMLUI Repository Structure

This document explains the XMLUI monorepo architecture, workspace organization, and Turborepo build orchestration. This is relevant for framework contributors who need to understand the repository structure and cross-package build coordination.

> **Note:** For building the XMLUI core package, see [Building the XMLUI Core Package](./build-xmlui.md). For building applications or extensions, see [XMLUI Build System](./build-system.md).

## Table of Contents

1. [Overview](#overview)
2. [Monorepo Architecture](#monorepo-architecture)
3. [Workspace Configuration](#workspace-configuration)
4. [Turborepo Build Orchestration](#turborepo-build-orchestration)
5. [Build Commands Reference](#build-commands-reference)
6. [Task Dependency Graphs](#task-dependency-graphs)
7. [CI/CD Integration](#cicd-integration)
8. [Development Workflow](#development-workflow)
9. [Package Management](#package-management)
10. [Troubleshooting](#troubleshooting)

## Overview

XMLUI uses a **monorepo** with **npm workspaces** and **Turborepo** for task orchestration, providing shared dependencies, unified builds, parallel execution, and intelligent caching.

**Stack:**
- npm workspaces + Turborepo 2.x + npm@10.9.2
- @changesets/cli for versioning
- Vite 7.x for builds

## Monorepo Architecture

### Repository Structure

```
xmlui-repo-root/
  ├── package.json              # Root workspace configuration
  ├── turbo.json                # Turborepo task definitions
  ├── .changeset/               # Changesets for version management
  │
  ├── xmlui/                    # Core framework package
  │   ├── package.json
  │   ├── vite.config.ts
  │   ├── src/
  │   ├── bin/                  # CLI tools
  │   └── dist/                 # Build output
  │
  ├── docs/                     # Documentation site
  │   ├── package.json
  │   ├── src/
  │   └── public/
  │
  ├── blog/                     # Blog site
  │   ├── package.json
  │   └── src/
  │
  ├── tools/
  │   ├── create-app/           # App scaffolding tool
  │   │   ├── package.json
  │   │   └── templates/
  │   └── vscode/               # VS Code extension
  │       ├── package.json
  │       └── src/
  │
  └── packages/
      ├── xmlui-animations/     # Animation components
      ├── xmlui-devtools/       # Development tools
      ├── xmlui-website-blocks/ # Website component library
      ├── xmlui-spreadsheet/    # Spreadsheet components
      ├── xmlui-pdf/            # PDF components
      ├── xmlui-search/         # Search components
      ├── xmlui-playground/     # Interactive playground
      ├── xmlui-os-frames/      # OS-style frames
      └── xmlui-hello-world/    # Starter template
```

### Package Categories

**Core Framework:**

- `xmlui/` - Main XMLUI framework package

**Documentation:**

- `docs/` - Documentation website
- `blog/` - Blog and changelog

**Tools:**

- `tools/create-app/` - CLI tool for scaffolding new apps
- `tools/vscode/` - VS Code extension for XMLUI development

**Extension Packages:**

- `packages/xmlui-*` - Component libraries and extensions

## Workspace Configuration

### Root package.json

```json
{
  "name": "xmlui-monorepo",
  "private": true,
  "workspaces": [
    "./xmlui",
    "./docs",
    "./blog",
    "./tools/create-app",
    "./tools/vscode",
    "./packages/*"
  ],
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=10.0.0"
  },
  "packageManager": "npm@10.9.2"
}
```

### Workspace Benefits

- **Dependency hoisting** - Shared deps installed once at root
- **Cross-package deps** - Use `"xmlui": "workspace:*"`
- **Unified scripts** - `npm run build --workspaces` or `--workspace=xmlui`

## Turborepo Build Orchestration

Turborepo manages the build pipeline with task dependencies, caching, and parallel execution via `turbo.json`.

### Core Task Definitions

**XMLUI Core:**
- `build:bin` - Compile CLI tools → `dist/bin/**`
- `build:xmlui` - Build library (ESM) → `dist/lib/**`
- `build:xmlui-standalone` - Build UMD bundle → `dist/standalone/**`
- `build:xmlui-metadata` - Extract metadata → `dist/metadata/**`

- `build:xmlui-all` - Master task (depends on all above + `build:extension`)

**Extensions:**
- `build:extension` - Builds extension packages (uses `^` for dependency resolution)

**Documentation:**
- `generate-docs` - Generate from metadata (`cache: false`)
- `build:docs` - Build complete site (depends on extensions, releases, summaries)

**Testing:**
- `test:unit` - Vitest (`cache: false`)
- `test:e2e-smoke` - Playwright smoke tests (`cache: false`)
- `test:xmlui-all` - Complete suite (unit + E2E)

### Turborepo Features

#### Caching

Turborepo hashes inputs and replays cached outputs for matching hashes.

**Locations:** `node_modules/.cache/turbo/` (local), remote via `turbo login`

**Control:**
```bash
turbo run build:xmlui-all          # Use cache
turbo run build:xmlui-all --force  # Ignore cache
turbo run build:xmlui-all --verbosity=3  # Show hits/misses
```

#### Parallel Execution

Tasks run in parallel when dependencies allow. Control with `--concurrency=N` (default uses all cores).

#### Output Management

**Inputs:** `$TURBO_DEFAULT$` (all files), specific patterns, negations (`!**/*.test.ts`)
**Outputs:** Must be deterministic (no timestamps/random content)
**Global env:** `["CI", "NODE_ENV"]` affect cache keys

#### Cross-Package Dependencies

The `^` prefix (e.g., `^build:extension`) runs the task in all dependencies first, ensuring correct build order.

## Build Commands Reference

### Root-Level Commands

All commands run from workspace root:

```bash
# Core XMLUI builds
npm run build-xmlui              # Build XMLUI core (turbo run build:xmlui-all)
npm run build-xmlui:watch        # Watch mode for lib build

# Testing
npm run test-xmlui               # Full test suite
npm run test-xmlui:ci            # CI mode (Unix/Linux/macOS)
npm run test-xmlui:ci-win        # CI mode (Windows)
npm run test-xmlui-smoke         # Smoke tests only

# Extensions
npm run build-extensions         # Build all extension packages

# Documentation
npm run build-docs               # Build docs site
npm run generate-docs            # Generate from metadata
npm run generate-docs-summaries  # Create summary files

# Publishing
npm run publish-packages         # Build + test + publish
npm run changeset:add            # Add changeset
npm run changeset:version        # Bump versions
npm run changeset:publish        # Publish to npm
```

### Turbo Commands

```bash
# Run specific task
turbo run build:xmlui

# Run task in specific package
turbo run xmlui#build:xmlui

# Show dependency graph
turbo run build:xmlui-all --graph

# Dry run (show execution plan)
turbo run build:xmlui-all --dry-run

# Force rebuild (ignore cache)
turbo run build:xmlui-all --force

# Verbose output
turbo run build:xmlui-all --verbosity=3

# Filter by package
turbo run build --filter=xmlui
turbo run build --filter=@xmlui/*

# Watch mode
turbo watch generate-docs-summaries
```

### Package-Level Commands

From `xmlui/` directory:

```bash
# Individual build steps
npm run build:bin                # Build CLI tools
npm run build:xmlui              # Build library
npm run build:xmlui-standalone   # Build UMD bundle
npm run build:xmlui-metadata     # Extract metadata

# Testing
npm run test:unit                # Unit tests
npm run test:e2e-smoke           # E2E smoke tests
npm run test:e2e-non-smoke       # Full E2E suite

# Development
npm run start-test-bed           # Start test application
```

## Task Dependency Graphs

### XMLUI Core Build

```
build:xmlui-all
  ├── build:bin
  ├── build:xmlui-metadata
  ├── build:xmlui
  ├── build:xmlui-standalone
  └── build:extension (from workspace packages)
      └── ^build:extension (dependencies from other packages)
```

**Execution order:**

1. `build:bin`, `build:xmlui-metadata`, `build:xmlui` run in parallel
2. `build:xmlui-standalone` runs after `build:xmlui`
3. `build:extension` runs after all above complete

### Documentation Build

```
build:docs
  ├── ^build:extension          (all extension packages)
  ├── ^build:xmlui              (core framework)
  ├── gen:releases              (fetch GitHub releases)
  ├── gen:download-latest-xmlui-release
  └── generate-docs-summaries
      └── generate-docs
          ├── build:xmlui-metadata
          └── build:meta
```

### Testing Pipeline

```
test:xmlui-all
  ├── test:unit
  └── test:e2e-non-smoke
      ├── build:test-bed
      ├── build:xmlui-test-bed
      └── test:e2e-smoke
```

### Extension Build

```
packages/xmlui-website-blocks#build:extension
  └── ^build:extension (dependencies)
      ├── xmlui#build:xmlui
      └── @xmlui/animations#build:extension
```

### VS Code Extension

```
tools/vscode#build:vsix
  └── tools/vscode#build
      └── ^gen:langserver-metadata
          └── build:xmlui-metadata
```

## CI/CD Integration

**CI commands:**
- Unix: `npm run test-xmlui:ci` (sets `CI=true`)
- Windows: `npm run test-xmlui:ci-win`

### CI Pipeline Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "npm"

      - run: npm ci

      - name: Build
        run: npm run build-xmlui

      - name: Test
        run: npm run test-xmlui:ci

      - name: Build Extensions
        run: npm run build-extensions
```

**Remote caching:** `turbo login && turbo link` (shares cache across CI/team)

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone https://github.com/xmlui-org/xmlui.git
cd xmlui

# Install all dependencies
npm install

# Build everything
npm run build-xmlui
npm run build-extensions
```

### Daily Development

**Working on XMLUI core:**

```bash
cd xmlui

# Terminal 1: Watch mode for lib build
npm run build:bin
xmlui build-lib --watch

# Terminal 2: Dev server for test app
cd src/testing/infrastructure
xmlui start

# Or use test bed
npm run start-test-bed
```

**Working on extension:**

```bash
cd packages/xmlui-website-blocks

# Build in watch mode
npm run build -- --watch

# Test in example app
cd examples/my-app
xmlui start
```

**Working on documentation:**

```bash
cd docs

# Watch mode for docs generation
turbo watch generate-docs-summaries

# Dev server
xmlui start
```

### Making Changes

```bash
# 1. Make code changes
vim xmlui/src/components/Button.tsx

# 2. Build (or use watch mode)
npm run build-xmlui

# 3. Test
npm run test-xmlui-smoke

# 4. Add changeset
npm run changeset:add
```

### Publishing Workflow

```bash
# 1. Ensure clean state
git status

# 2. Build everything
npm run build-xmlui
npm run build-extensions

# 3. Test everything
npm run test-xmlui

# 4. Add changeset (if not already added)
npm run changeset:add

# 5. Version packages
npm run changeset:version

# 6. Commit version changes
git add .
git commit -m "chore: version packages"

# 7. Publish
npm run changeset:publish

# 8. Push tags
git push --follow-tags
```

## Package Management

### Changesets

XMLUI uses `@changesets/cli` for version management.

```bash
npm run changeset:add      # Select packages, bump type, write summary
npm run changeset:version  # Update versions, CHANGELOGs
npm run changeset:publish  # Build, publish to npm, create tags
```

### Workspace Protocol

Use `"xmlui": "workspace:*"` in dev; replaced with actual version on publish.

### Package Scripts

**Common scripts in workspace packages:**

```json
{
  "scripts": {
    "build": "vite build",
    "build:extension": "vite build",
    "test": "vitest",
    "prepublishOnly": "npm run build"
  }
}
```

## Troubleshooting

### Clear All Caches

```bash
# From workspace root

# Clear build artifacts
rm -rf xmlui/dist/
rm -rf packages/*/dist/
rm -rf docs/dist/
rm -rf blog/dist/

# Clear Vite cache
rm -rf xmlui/node_modules/.vite/
rm -rf packages/*/node_modules/.vite/
rm -rf docs/node_modules/.vite/
rm -rf blog/node_modules/.vite/

# Clear Turbo cache
rm -rf node_modules/.cache/turbo/

# Rebuild
npm run build-xmlui
```

### Dependency Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf xmlui/node_modules
rm -rf packages/*/node_modules
npm install

# Check for dependency conflicts
npm ls

# Update all dependencies
npx npm-check-updates -u
npm install
```

### Turbo Issues

**Cache problems:**

```bash
# Clear cache
rm -rf node_modules/.cache/turbo/

# Force rebuild
turbo run build:xmlui-all --force

# Check cache behavior
turbo run build:xmlui-all --verbosity=3
```

**Task not found:**

```bash
# Check turbo.json syntax
cat turbo.json | jq .

# Verify task definition
turbo run build:xmlui-all --dry-run

# List all tasks
cat turbo.json | jq '.tasks | keys'
```

**Dependency issues:**

```bash
# Show task graph
turbo run build:xmlui-all --graph

# Check workspace configuration
npm run build-xmlui -- --verbosity=3
```

### Workspace Issues

**Package not found:**

```bash
# Verify workspaces configuration
cat package.json | jq '.workspaces'

# List all workspaces
npm ls --workspaces --depth=0

# Check package location
npm ls --workspace=xmlui
```

**Cross-package imports failing:**

```bash
# Ensure packages are built
npm run build-xmlui
npm run build-extensions

# Check package.json exports
cat xmlui/package.json | jq '.exports'

# Verify workspace protocol
cat packages/xmlui-website-blocks/package.json | jq '.dependencies'
```

### Performance Issues

**Slow builds:**

```bash
# Use cache
turbo run build:xmlui-all

# Limit concurrency if memory constrained
turbo run build:xmlui-all --concurrency=2

# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build-xmlui

# Check disk I/O (use SSD if possible)
```

**Cache misses:**

```bash
# Check what's changing
turbo run build:xmlui-all --verbosity=3

# Verify inputs configuration
cat turbo.json | jq '.tasks["build:xmlui-all"]'

# Ensure outputs are deterministic
# (no timestamps, no random content)
```

**npm install slow:**

```bash
# Use local registry cache
npm config set registry https://registry.npmjs.org/

# Clean cache if corrupted
npm cache clean --force

# Use faster DNS
# (Google DNS: 8.8.8.8, Cloudflare: 1.1.1.1)
```

## See Also

- [Building the XMLUI Core Package](./build-xmlui.md) - XMLUI framework build details
- [XMLUI Build System](./build-system.md) - Application and extension builds
- [Standalone Rendering Architecture](./standalone-app.md) - Runtime architecture
- [Container-Based State Management](./containers.md) - State system
