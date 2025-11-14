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

XMLUI uses a **monorepo architecture** managed by **npm workspaces** with **Turborepo** for efficient task orchestration. This structure allows:

- **Shared dependencies** across packages
- **Cross-package dependency management**
- **Unified build pipeline** with caching
- **Parallel task execution**
- **Incremental builds** with intelligent caching

**Key Technologies:**

- **Monorepo Manager:** npm workspaces
- **Task Orchestration:** Turborepo 2.x
- **Package Manager:** npm@10.9.2
- **Version Management:** @changesets/cli
- **Build Tool:** Vite 5.x (within packages)

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

**Dependency Hoisting:**

```bash
# Shared dependencies installed once at root
node_modules/
  ├── react/
  ├── typescript/
  └── vite/
```

**Cross-Package Dependencies:**

```json
{
  "dependencies": {
    "xmlui": "workspace:*",
    "@xmlui/animations": "workspace:*"
  }
}
```

**Unified Scripts:**

```bash
# Run command in all workspaces
npm run build --workspaces

# Run command in specific workspace
npm run build --workspace=xmlui
```

## Turborepo Build Orchestration

Turborepo manages the build pipeline with task dependencies, caching, and parallel execution.

### turbo.json Configuration

The `turbo.json` file at the repository root defines all tasks and their orchestration:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": ["CI"],
  "tasks": {
    "build:xmlui-all": { ... },
    "test:xmlui-all": { ... },
    "build:extension": { ... },
    "generate-docs": { ... }
  }
}
```

### Core Task Definitions

#### XMLUI Core Package Tasks

**build:bin**

```json
{
  "outputs": ["dist/bin/**"]
}
```

Compiles CLI tools in `xmlui/bin/` folder.

**build:xmlui**

```json
{
  "outputs": ["dist/lib/**"]
}
```

Builds library mode (ES modules for npm distribution).

**build:xmlui-standalone**

```json
{
  "outputs": ["dist/standalone/**"]
}
```

Builds standalone UMD bundle for CDN deployment.

**build:xmlui-metadata**

```json
{
  "inputs": ["$TURBO_DEFAULT$", "!src/language-server/xmlui-metadata-generated.js"],
  "outputs": ["dist/metadata/**"]
}
```

Extracts component metadata for documentation and LSP.

**build:xmlui-all**

```json
{
  "dependsOn": [
    "build:bin",
    "build:xmlui-metadata",
    "build:xmlui",
    "build:xmlui-standalone",
    "build:extension"
  ],
  "outputs": ["dist/**"]
}
```

Master task that builds entire XMLUI core package.

#### Extension Package Tasks

**build:extension**

```json
{
  "dependsOn": ["^build:extension"],
  "outputs": ["dist/**"]
}
```

Builds extension packages. The `^` prefix means "wait for dependencies' build:extension".

#### Documentation Tasks

**generate-docs**

```json
{
  "dependsOn": ["build:xmlui-metadata", "build:meta"],
  "outputs": ["public/pages/**", "content/**/*.md", "content/**/*.mdx"],
  "cache": false
}
```

Generates documentation from component metadata.

**build:docs**

```json
{
  "dependsOn": [
    "^build:extension",
    "^build:xmlui",
    "gen:releases",
    "gen:download-latest-xmlui-release",
    "generate-docs-summaries"
  ],
  "outputs": ["dist/**", "xmlui-optimized-output/**"]
}
```

Builds complete documentation site.

#### Testing Tasks

**test:unit**

```json
{
  "outputs": ["coverage/**"],
  "cache": false
}
```

Runs unit tests with Vitest.

**test:e2e-smoke**

```json
{
  "dependsOn": ["build:test-bed", "build:xmlui-test-bed"],
  "outputs": ["playwright-report/**", "test-results/**", "tests-e2e/screenshots/**"],
  "cache": false
}
```

Runs smoke E2E tests with Playwright.

**test:xmlui-all**

```json
{
  "dependsOn": ["test:unit", "test:e2e-non-smoke"],
  "cache": false
}
```

Runs complete test suite.

### Turborepo Features

#### Caching

**How it works:**

- Turborepo hashes task inputs (source files, dependencies, env vars)
- If hash matches previous run, replays cached outputs
- Dramatically speeds up incremental builds

**Cache locations:**

```bash
# Local cache
node_modules/.cache/turbo/

# Remote cache (optional)
# Configure with turbo login
```

**Cache configuration:**

```json
{
  "inputs": ["$TURBO_DEFAULT$", "!**/*.test.ts"],
  "outputs": ["dist/**"]
}
```

**Cache control:**

```bash
# Use cache (default)
turbo run build:xmlui-all

# Ignore cache, force rebuild
turbo run build:xmlui-all --force

# Show cache hits/misses
turbo run build:xmlui-all --verbosity=3
```

#### Parallel Execution

**Dependency-based parallelization:**

```
build:xmlui-all
  ├── build:bin                    ⎤
  ├── build:xmlui-metadata         ⎥ Run in parallel
  └── build:xmlui                  ⎦
      └── build:xmlui-standalone   → Runs after build:xmlui
```

**Concurrency control:**

```bash
# Limit parallel tasks
turbo run build:xmlui-all --concurrency=4

# No limit (use all CPU cores)
turbo run build:xmlui-all --concurrency=100
```

#### Output Management

**Inputs:**

- `$TURBO_DEFAULT$` - All files except ignored ones
- Specific patterns: `src/**/*.ts`, `package.json`
- Negations: `!**/*.test.ts`

**Outputs:**

- Define what gets cached: `["dist/**"]`
- Must be deterministic
- Should not include timestamps or random content

**Global environment variables:**

```json
{
  "globalEnv": ["CI", "NODE_ENV"]
}
```

These affect cache keys.

#### Cross-Package Dependencies

**Prefix operators:**

```json
{
  "dependsOn": [
    "^build:extension" // Dependencies must complete first
  ]
}
```

The `^` means: "Before running this task, run the same task in all dependencies."

**Example:**

```
packages/xmlui-website-blocks/
  dependencies:
    - xmlui
    - @xmlui/animations

turbo run build:extension
  → First builds xmlui
  → Then builds @xmlui/animations
  → Finally builds xmlui-website-blocks
```

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

### Environment Variables

**Global variables (affect cache):**

```json
{
  "globalEnv": ["CI"]
}
```

**CI detection:**

```bash
# Unix/Linux/macOS
npm run test-xmlui:ci
# Sets: CI=true turbo run test:xmlui-all

# Windows
npm run test-xmlui:ci-win
# Sets: set CI=true && turbo run test:xmlui-all
```

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

### Remote Caching (Optional)

**Setup:**

```bash
# Login to Vercel/Turbo
turbo login

# Link repository
turbo link
```

**Benefits:**

- Share cache across CI runs
- Share cache across team members
- Faster CI builds

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

XMLUI uses `@changesets/cli` for coordinated version management across packages.

**Add changeset:**

```bash
npm run changeset:add

# Interactive prompts:
# 1. Select packages to version
# 2. Choose version bump (major/minor/patch)
# 3. Write summary of changes
```

**Version packages:**

```bash
npm run changeset:version

# This:
# 1. Reads all changesets
# 2. Updates package.json versions
# 3. Updates CHANGELOG.md files
# 4. Deletes consumed changesets
```

**Publish packages:**

```bash
npm run changeset:publish

# This:
# 1. Builds packages (via prepublishOnly)
# 2. Publishes to npm
# 3. Creates git tags
```

### Workspace Protocol

Dependencies between workspace packages use `workspace:*`:

```json
{
  "dependencies": {
    "xmlui": "workspace:*"
  }
}
```

**During publish:**

```json
{
  "dependencies": {
    "xmlui": "^0.10.19" // Replaced with actual version
  }
}
```

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
