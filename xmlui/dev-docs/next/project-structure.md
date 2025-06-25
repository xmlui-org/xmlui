# XMLUI Project Structure

This document provides an overview of the XMLUI monorepo structure, explaining the purpose and organization of each workspace and the artifacts they produce.

## Monorepo Overview

XMLUI is organized as a monorepo with **12+ buildable artifacts** defined by individual `package.json` files:

```
xmlui/                              # Root monorepo
├── package.json                    # Workspace orchestration, build scripts
├── turbo.json                      # Build pipeline configuration
├── .changeset/                     # Version management
├── .github/                        # CI/CD workflows
├── .vscode/                        # Development settings
│
├── xmlui/                          # 📦 CORE FRAMEWORK
│   ├── package.json                #    └─ "xmlui" v0.9.57 (npm package)
│   ├── bin/                        #       CLI tools & executables
│   └── src/                        #       Library source code
│
├── packages/                       # 📦 EXTENSION PACKAGES (7 packages)
│   ├── xmlui-animations/           #    ├─ "xmlui-animations" v0.1.15
│   │   └── package.json            #    │
│   ├── xmlui-devtools/             #    ├─ "xmlui-devtools" 
│   │   └── package.json            #    │
│   ├── xmlui-os-frames/            #    ├─ "xmlui-os-frames"
│   │   └── package.json            #    │
│   ├── xmlui-pdf/                  #    ├─ "xmlui-pdf"
│   │   └── package.json            #    │
│   ├── xmlui-playground/           #    ├─ "xmlui-playground"
│   │   └── package.json            #    │
│   ├── xmlui-search/               #    ├─ "xmlui-search"
│   │   └── package.json            #    │
│   └── xmlui-spreadsheet/          #    └─ "xmlui-spreadsheet"
│       └── package.json            #
│
├── docs/                           # 📦 DOCUMENTATION WEBSITE
│   ├── package.json                #    └─ "xmlui-docs" (web application)
│   ├── src/Main.xmlui              #       XMLUI app with playground
│   └── content/                    #       Documentation content
│
├── tests/                          # 📦 E2E TEST SUITE
│   ├── package.json                #    └─ "xmlui-e2e" (test infrastructure)
│   ├── src/TestBed.tsx             #       Test bed application
│   └── tests/                      #       Playwright test specs
│
└── tools/                          # 📦 DEVELOPMENT TOOLS (3 tools)
    ├── create-app/                 #    ├─ "create-xmlui-app" v0.9.57 (CLI)
    │   └── package.json            #    │
    ├── vscode/                     #    ├─ "xmlui-vscode" v0.1.2 (VS Code ext)
    │   └── package.json            #    │
    └── codefence/                  #    └─ Documentation utilities
```

## Buildable Artifacts by Package

Each workspace with a `package.json` produces specific build outputs:

## 1. Core Framework (`xmlui/`) - **Library Package**

**Artifact**: `xmlui` npm package  
**Build Output**: Library bundle, standalone build, metadata, CLI tools

The main XMLUI framework located in the `xmlui/` directory:

```
xmlui/
├── bin/                  # CLI tools and executables
├── conventions/          # Coding conventions and standards
├── dev-docs/             # Developer documentation
├── scripts/              # Build and development scripts
├── src/                  # Source code
├── tests/                # Unit and integration tests
├── package.json          # Framework dependencies and scripts
├── vite.config.ts        # Vite build configuration
├── vitest.config.ts      # Unit test configuration
└── playwright.config.ts  # E2E test configuration
```

### Build Targets

- `build:xmlui`: Library bundle for npm distribution
- `build:xmlui-standalone`: Standalone application build
- `build:xmlui-metadata`: Component metadata for tooling
- `build:bin`: CLI tools compilation

### Key Files

- **`package.json`**: Main package configuration (version 0.9.57)
  - Main entry points: `index.ts` (library), `index-standalone.ts` (standalone)
  - Key scripts: `build:xmlui`, `test:unit`, `test:e2e-smoke`
- **`ComponentList.xlsx`**: Comprehensive component catalog
- **`CHANGELOG.md`**: Version history and release notes

### Source Code Organization (`xmlui/src/`)

```
src/
├── abstractions/         # Core interfaces and abstract classes
├── components/           # UI component implementations
├── components-core/      # Core component utilities
├── language-server/      # Language server for VS Code extension
├── logging/              # Logging infrastructure
├── parsers/              # XML/markup parsing logic
├── syntax/               # Syntax highlighting and validation
├── testing/              # Testing utilities and infrastructure
├── index.ts              # Main library entry point
└── index-standalone.ts   # Standalone application entry point
```

## 2. Extension Packages (`packages/`) - **7 Library Packages**

**Artifacts**: 7 separate npm packages  
**Build Output**: Extension libraries, demos, metadata

XMLUI extensions are modular packages that extend core functionality:

```
packages/
├── xmlui-animations/     # Animation components (@react-spring integration)
├── xmlui-devtools/       # Developer tools and debugging utilities
├── xmlui-os-frames/      # OS-specific window frames and chrome
├── xmlui-pdf/            # PDF generation and display components
├── xmlui-playground/     # Interactive code playground and editor
├── xmlui-search/         # Search and filtering components
└── xmlui-spreadsheet/    # Spreadsheet and data grid components
```

### Extension Package Structure

Each extension follows a consistent build pattern:

```
xmlui-{extension}/
├── demo/                 # Demo applications
├── meta/                 # Component metadata and definitions  
├── src/                  # Extension source code
├── package.json          # Package configuration
├── index.ts              # Extension entry point
└── dist/                 # Build output (generated)
```

### Build Targets (Per Extension)

- `build:extension`: Library bundle for npm distribution
- `build:demo`: Standalone demo application
- `build:meta`: Component metadata for tooling
- `start`: Development server with hot reload

### Example: xmlui-animations

```json
{
  "name": "xmlui-animations",
  "version": "0.1.15",
  "dependencies": {
    "@react-spring/web": "^9.7.5"
  }
}
```

## 3. Documentation Website (`docs/`) - **Web Application**

**Artifact**: Documentation website  
**Build Output**: Static website with integrated playground

The documentation is a full XMLUI application showcasing the framework:

```
docs/
├── content/              # Markdown documentation content
├── public/               # Static assets and resources
├── src/                  # Documentation app source code
│   ├── Main.xmlui        # Main application file
│   ├── components/       # Documentation-specific components
│   ├── config.ts         # App configuration
│   ├── globals.js        # Global scripts
│   ├── syntax/           # Syntax highlighting
│   └── themes/           # Documentation themes
├── package.json          # Documentation dependencies
└── index.html            # Entry point
```

### Build Configuration

```json
{
  "name": "xmlui-docs",
  "dependencies": {
    "shiki": "^3.3.0",
    "xmlui": "*",
    "xmlui-playground": "*",
    "xmlui-search": "*"
  },
  "scripts": {
    "build:docs": "xmlui build --buildMode=INLINE_ALL --withMock && xmlui zip-dist --target=dist/ui.zip"
  }
}
```

Features:
- Interactive component playground
- Syntax highlighting with Shiki
- Search functionality
- Integrated mock service worker

## 4. Testing Infrastructure (`tests/`) - **Test Suite**

**Artifact**: E2E test suite and test bed application  
**Build Output**: Test bed application, test reports

Centralized testing infrastructure for the entire monorepo:

```
tests/
├── playwright-report/    # Generated test reports
├── public/               # Test assets and mock data
├── src/                  # Test utilities and test bed app
│   ├── main.tsx          # Test bed entry point
│   └── TestBed.tsx       # Test bed component
├── tests/                # E2E test specifications
├── test-results/         # Test execution results
├── package.json          # Test dependencies
└── playwright.config.ts  # E2E test configuration
```

### Build Configuration

```json
{
  "name": "xmlui-e2e", 
  "scripts": {
    "build:test-bed": "xmlui build --build-mode=INLINE_ALL --withMock --withHostingMetaFiles",
    "test:e2e-smoke": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "1.53.0"
  }
}
```

## 5. Development Tools (`tools/`) - **3 Tool Packages**

**Artifacts**: CLI tool, VS Code extension, utilities  
**Build Output**: Executable binaries, VS Code extension (.vsix)

### A. Create App CLI (`tools/create-app/`)

**Artifact**: `create-xmlui-app` npm package  
**Build Output**: Executable CLI tool

```json
{
  "name": "create-xmlui-app",
  "version": "0.9.57", 
  "bin": {
    "create-xmlui-app": "./dist/index.js"
  },
  "scripts": {
    "build": "ncc build ./index.ts -o dist/ --minify"
  }
}
```

Project scaffolding tool for creating new XMLUI applications with templates.

### B. VS Code Extension (`tools/vscode/`)

**Artifact**: VS Code extension (.vsix file)  
**Build Output**: VS Code extension package

```json
{
  "name": "xmlui-vscode",
  "displayName": "xmlui",
  "description": "VSCode language support for XMLUI language",
  "version": "0.1.2",
  "engines": {
    "vscode": "^1.75.0"
  }
}
```

Provides XMLUI language support, syntax highlighting, and IntelliSense.

### C. Code Fence Utilities (`tools/codefence/`)

**Artifact**: Documentation processing utilities  
**Build Output**: Processed documentation

Utilities for processing code examples and documentation generation.

## Monorepo Build Orchestration

### Workspace Configuration

The project uses npm workspaces defined in the root `package.json`:

```json
{
  "workspaces": [
    "./xmlui",           // Core framework
    "./tests",           // E2E test suite  
    "./docs",            // Documentation website
    "./tools/create-app", // CLI tool
    "./tools/vscode",     // VS Code extension
    "./packages/*"        // All 7 extension packages
  ]
}
```

### Turborepo Pipeline

Build orchestration is managed by Turbo, defined in `turbo.json`:

```bash
# Build all packages and libraries
npm run build-xmlui

# Test complete framework
npm run test-xmlui  

# Build all extension packages
npm run build-extensions

# Build documentation site
npm run build-docs

# Build VS Code extension
npm run build-vscode-extension
```

### Key Build Scripts

- **`build-xmlui`**: Builds core framework + all extension packages
- **`test-xmlui`**: Runs complete test suite across all workspaces
- **`build-extensions`**: Builds all 7 extension packages
- **`build-docs`**: Builds documentation website
- **`publish-packages`**: Builds, tests, and publishes all packages

## Summary: 12+ Buildable Artifacts

This monorepo produces the following artifacts:

| Workspace | Artifact Type | Output |
|-----------|---------------|---------|
| `xmlui/` | npm package | Core XMLUI library |
| `packages/xmlui-animations/` | npm package | Animation extension |
| `packages/xmlui-devtools/` | npm package | DevTools extension |
| `packages/xmlui-os-frames/` | npm package | OS Frames extension |
| `packages/xmlui-pdf/` | npm package | PDF extension |
| `packages/xmlui-playground/` | npm package | Playground extension |
| `packages/xmlui-search/` | npm package | Search extension |
| `packages/xmlui-spreadsheet/` | npm package | Spreadsheet extension |
| `docs/` | Web application | Documentation website |
| `tests/` | Test suite | E2E test bed |
| `tools/create-app/` | npm package | CLI scaffolding tool |
| `tools/vscode/` | VS Code extension | Language support |

This modular architecture enables:
- **Independent development** of extensions and tools
- **Selective inclusion** of functionality in applications
- **Parallel builds** and testing across workspaces
- **Coordinated releases** through changesets
- **Clear separation** of concerns between framework, extensions, and tooling
