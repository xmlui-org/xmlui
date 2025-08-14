# XMLUI Build System

## Overview

XMLUI uses **Turborepo** as its build orchestration tool to manage builds across a monorepo containing several buildable packages. The build system provides parallel execution, intelligent caching, task dependency management, and incremental builds for faster development cycles.

These are the packages:

### Core Framework

The `xmlui` folder contains the main XMLUI framework library with components, parsers, CLI tools, and language server for external tools such as the VS Code extension. It produces the following artifacts:

- The modular ESM library for npm distribution (the `xmlui` package): **`build:xmlui`** - `vite build --mode lib`
- The self-contained UMD bundle for standalone browser usage (the `xmlui.js` file you can load in an `index.html` file): **`build:xmlui-standalone`** - `vite build --mode standalone`
- The component metadata for tooling integration (used in the VS Code extension and documentation generation): **`build:xmlui-metadata`** - `vite build --mode metadata`
- The CLI tools compilation (the `xmlui` command): **`build:bin`** - `tsc -p tsconfig.bin.json`

These are the build artifacts of the core framework:

**Library Bundle (`dist/lib/`)** - Modular ESM exports for npm consumption:
- `xmlui.mjs` - Core framework components and runtime
- `xmlui-parser.mjs` - XMLUI markup parser and AST utilities  
- `language-server.mjs` - LSP implementation for IDE support
- `language-server-web-worker.mjs` - Browser-compatible language server
- `syntax-monaco.mjs` - Monaco Editor syntax highlighting integration
- `syntax-textmate.mjs` - TextMate grammar for VS Code support
- CSS files and TypeScript declarations

**Standalone Bundle (`dist/standalone/`)** - Browser-ready distribution:
- `xmlui-standalone.umd.js` - Complete framework with inlined dependencies

**Metadata (`dist/metadata/`)** - Tooling integration:
- `xmlui-metadata.js` - Component metadata for IDE intellisense and validation

**CLI Tools (`dist/scripts/`)** - Development utilities:
- `bin/bootstrap.js` - Main CLI entry point for project commands
- `bin/vite-xmlui-plugin.js` - Vite plugin for XMLUI project integration

### Extension Packages

The `packages/` folder contains extension packages that extend the core framework with specialized functionality. Each extension follows a common build pattern and produces the following artifacts:

- The extension library bundle for npm distribution: **`build:extension`** - `xmlui build-lib`
- Demo applications for testing and showcase (when applicable): **`build:demo`** - `xmlui build`
- Component metadata for tooling integration: **`build:meta`** - `xmlui build-lib --mode=metadata`
- Watch mode for active development: **`build-watch`** - `xmlui build-lib --watch`

These are the build artifacts of extension packages:

**Extension Library (`dist/`)** - Extension library bundle (UMD + ESM formats)
**Demo Applications** - Interactive showcases for testing and demonstration (when applicable)
**Component Metadata** - Metadata files for tooling integration

The available extension packages:
- **`xmlui-animations`** (`packages/xmlui-animations/`) - Animation components with React Spring integration
- **`xmlui-devtools`** (`packages/xmlui-devtools/`) - Developer tools and debugging utilities
- **`xmlui-os-frames`** (`packages/xmlui-os-frames/`) - OS-specific window frames and chrome
- **`xmlui-pdf`** (`packages/xmlui-pdf/`) - PDF generation and display components
- **`xmlui-playground`** (`packages/xmlui-playground/`) - Interactive code playground and editor
- **`xmlui-search`** (`packages/xmlui-search/`) - Search and filtering components
- **`xmlui-spreadsheet`** (`packages/xmlui-spreadsheet/`) - Spreadsheet and data grid components

### Documentation

The `docs/` folder contains the documentation website that provides interactive documentation and examples for the XMLUI framework. The documentation site is an XMLUI application that works in development mode and can be published as a standalone website. The deployed content is available at https://docs.xmlui.org.

The documentation includes articles and automatically generated component reference documentation built from metadata extracted from the `xmlui` package artifacts. It produces the following artifacts:

- Static website with inlined dependencies and mock service integration: **`build:docs`** - `xmlui build --buildMode=INLINE_ALL --withMock && xmlui zip-dist --target=dist/ui.zip`

These are the build artifacts of the documentation:

**Static Website** - Complete documentation website with inlined dependencies
**Zipped Distribution** - Packaged website for deployment (`ui.zip`)
**Mock Service Integration** - Mock service worker for interactive examples
**Component Reference** - Auto-generated documentation from component metadata

### Development Tools

The `tools/` folder contains development utilities including the CLI scaffolding tool and VS Code extension for enhanced developer experience. These tools produce the following artifacts:

- VS Code extension package for XMLUI language support: **`build:vsix`** - `vsce package` (in `tools/vscode/`)
- Executable CLI tool for project scaffolding: **`build`** - `ncc build ./index.ts -o dist/ --minify` (in `tools/create-app/`)

These are the build artifacts of development tools:

**VS Code Extension** - `.vsix` package file for XMLUI language support
**CLI Tool** - Executable Node.js application for creating new XMLUI projects

The available development tools:
- **`create-xmlui-app`** (`tools/create-app/`) - CLI tool for scaffolding new XMLUI projects
- **`xmlui-vscode`** (`tools/vscode/`) - VS Code extension for XMLUI language support

## Build Architecture

XMLUI uses **Turborepo** to orchestrate builds across the monorepo with parallel execution and intelligent caching.

### Root Package Commands

The root `package.json` defines these commands:

**Build Commands:**
- **`build-xmlui`** - `turbo run build:xmlui-all` - Builds the complete XMLUI framework
- **`build-extensions`** - `turbo run build:extension` - Builds all extension packages only
- **`build-docs`** - `turbo run build:docs` - Builds the documentation website
- **`build-vscode-extension`** - `turbo run xmlui-vscode#build:vsix` - Builds VS Code extension

**Test Commands:**
- **`test-xmlui`** - `turbo run build:xmlui-all test:xmlui-all` - Full build + comprehensive testing
- **`test-xmlui:ci`** - `CI=true npm run test-xmlui` - CI-optimized test run
- **`test-xmlui-smoke`** - `turbo run build:xmlui-all test:xmlui-smoke` - Build + smoke tests only

**Development Commands:**
- **`watch-docs-content`** - `turbo watch generate-docs-summaries` - Watch mode for documentation content generation

**Release Commands:**
- **`changeset:add`** - `changeset add` - Add a new changeset for version management
- **`changeset:version`** - `changeset version` - Update package versions based on changesets
- **`changeset:publish`** - `changeset publish` - Publish packages to npm
- **`publish-packages`** - `turbo run build:xmlui-all test:xmlui-all && npm run changeset:publish` - Full build, test, and npm publish workflow

### Build Flow: `build:xmlui-all`

When you run `npm run build-xmlui`, Turborepo executes `build:xmlui-all` which orchestrates this dependency chain:

1. **`build:bin`** - Compiles CLI tools (`tsc -p tsconfig.bin.json`)
2. **`build:xmlui-metadata`** - Extracts component metadata (`vite build --mode metadata`)
3. **`build:xmlui`** - Builds core library (`vite build --mode lib`)
4. **`build:xmlui-standalone`** - Builds standalone bundle (`vite build --mode standalone`)
5. **`build:extension`** - Builds all extension packages in parallel (depends on core completion)

The build system ensures proper dependency order: CLI tools and metadata first, then core library builds, followed by extensions that depend on the core framework.

## XMLUI CLI Build System

The `xmlui` package provides a comprehensive CLI build system through utilities in the `xmlui/bin/` folder. These tools handle building XMLUI applications, extensions, and managing development workflows.

### CLI Commands

The XMLUI CLI (accessible via the `xmlui` command after installing the package) provides these build-related commands:

**`xmlui build`** - Builds XMLUI applications with configurable options:
- `--buildMode` - Build mode: `CONFIG_ONLY`, `INLINE_ALL`, or `ALL`
- `--flatDist` - Flatten distribution structure
- `--withMock` - Include mock service worker
- `--withHostingMetaFiles` - Include hosting metadata files
- `--withRelativeRoot` - Use relative root paths

**`xmlui build-lib`** - Builds extension libraries:
- `--watch` - Enable watch mode for development
- `--mode` - Build mode: `metadata` for component metadata extraction

**`xmlui start`** - Development server:
- `--port` - Specify port number
- `--withMock` - Enable mock service integration
- `--proxy` - Proxy configuration

**`xmlui preview`** - Preview built applications:
- `--proxy` - Proxy configuration

**`xmlui zip-dist`** - Package distribution:
- `--target` - Output zip file name (default: `ui.zip`)
- `--source` - Source directory to zip (default: `dist`)

### Build Implementation

The CLI build system is implemented through several key files in `xmlui/bin/`:

**`bootstrap.js`** - Entry point that registers TypeScript and loads the main CLI
**`index.ts`** - Main CLI dispatcher that routes commands to appropriate handlers
**`build.ts`** - Application build logic with Vite integration
**`build-lib.ts`** - Extension library build logic
**`viteConfig.ts`** - Shared Vite configuration utilities
**`vite-xmlui-plugin.ts`** - Custom Vite plugin for XMLUI projects

### Build Process Flow

When building XMLUI applications or extensions, the CLI follows this detailed process:

**1. Parse Arguments & Configuration**
- **Command Parsing**: The CLI dispatcher in `index.ts` parses command-line arguments using yargs
- **Argument Processing**: Converts string/boolean arguments with deduplication (e.g., `--withMock=false`)
- **Default Values**: Applies context-aware defaults (prod mode vs dev mode)
- **Config Overrides**: Loads optional `vite.config-overrides.js` for project-specific customizations

**2. Build Mode Determination**
The build system supports three distinct build modes:

- **`CONFIG_ONLY`** (default): Generates configuration files and minimal build artifacts
- **`INLINE_ALL`**: Creates a fully self-contained build with all dependencies inlined
- **`ALL`**: Comprehensive build with separate component and resource files

**3. Vite Configuration Setup**
- **Base Configuration**: Loads shared Vite config from `viteConfig.ts` with React, SVGR, and YAML plugins
- **Environment Variables**: Injects build-time environment variables via `define`:
  - `VITE_BUILD_MODE`: Controls application behavior at runtime
  - `VITE_MOCK_ENABLED`: Enables/disables mock service worker
  - `VITE_USED_COMPONENTS_*`: Tree-shaking flags for unused components
- **Path Configuration**: Sets up relative/absolute paths based on `withRelativeRoot` option
- **Custom Plugin**: Applies XMLUI-specific Vite plugin for framework integration

**4. Resource Processing**
- **Resource Discovery**: Scans `/resources` directory using glob patterns
- **File Flattening**: When `flatDist` is enabled, converts nested paths to flat structure:
  - `resources/images/logo.png` → `ui_resources_images_logo.png`
- **Resource Mapping**: Creates a resource map for runtime asset resolution
- **Static File Copying**: Copies processed resources to distribution directory

**5. Component and Metadata Handling**
- **Component Metadata Extraction**: In metadata mode, extracts component definitions and properties
- **Theme Processing**: Processes theme definitions and generates theme files
- **Component Tree Shaking**: Uses environment variables to exclude unused components from bundle
- **Type Generation**: Generates TypeScript declaration files for library builds

**6. Build Execution & Optimization**
- **Vite Build**: Executes Vite build with configured options
- **Bundle Splitting**: Creates appropriate chunks for library vs application builds
- **CSS Processing**: Handles SCSS compilation and CSS injection for libraries
- **Source Maps**: Generates source maps in development, excludes in production

**7. Post-Build Processing**
- **File Cleanup**: Removes unwanted files based on build options:
  - Mock service worker (when `--withMock=false`)
  - Hosting metadata files (when `--withHostingMetaFiles=false`)
- **Configuration Generation**: Creates `config.json` with resource mappings and build metadata
- **Package Preparation**: For library builds, prepares clean package structure using `clean-package`

**8. Extension Library Specifics**
Extension builds (`xmlui build-lib`) follow a specialized flow:
- **Dual Format Output**: Generates both UMD and ESM bundles
- **External Dependencies**: Excludes React and XMLUI core from bundle (peer dependencies)
- **CSS Injection**: Uses `vite-plugin-lib-inject-css` to inline styles
- **Metadata Mode**: Can extract just component metadata without full build
- **Watch Mode**: Supports continuous rebuilding for development

This multi-stage process ensures that XMLUI applications and extensions are properly optimized, have correct dependency handling, and include all necessary runtime assets while maintaining flexibility for different deployment scenarios.

## Vite Configuration

XMLUI's build system extends Vite through a centralized configuration in `xmlui/bin/viteConfig.ts`. This configuration handles asset processing, plugin integration, and build output customization.

### Configuration Overrides System

The configuration supports project-specific customizations through an optional override file:

```typescript
let overrides: UserConfig = {};
try {
  const configOverrides = await import(process.cwd() + `/vite.config-overrides`);
  overrides = configOverrides.default || {};
} catch (e) {
  // console.error(e);
}
```

This allows individual XMLUI projects to extend or modify the base configuration without changing the core build system.

### Plugin Stack Configuration

XMLUI configures a specific set of Vite plugins for framework functionality:

```typescript
plugins: [react(), svgr(), ViteYaml(), ViteXmlui({}), ...(overrides.plugins || [])],
```

- **`react()`** - Enables JSX transformation and React Fast Refresh for development
- **`svgr()`** - Transforms SVG files into React components for direct import
- **`ViteYaml()`** - Allows importing YAML files as JavaScript objects
- **`ViteXmlui({})`** - Custom plugin for processing XMLUI markup files
- **Override plugins** - Additional plugins from project-specific configuration

### Build Path Configuration

The configuration handles different deployment scenarios through path settings:

```typescript
base: withRelativeRoot ? "" : undefined,
```

- **Relative paths** (`withRelativeRoot: true`) - For deployments in subdirectories
- **Absolute paths** (default) - For root-level deployments

### Asset Processing Rules

The configuration defines how different asset types are processed and named:

```typescript
assetFileNames: (assetInfo) => {
  const extType = assetInfo.name?.split(".").pop();
  if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType!)) {
    return flatDist
      ? `${flatDistUiPrefix}internal_img_[name].[hash][extname]`
      : `internal/img/[name].[hash][extname]`;
  }
  if (assetInfo.name === "index.css") {
    return flatDist
      ? `${flatDistUiPrefix}internal_[name].[hash][extname]`
      : `internal/[name].[hash][extname]`;
  }
  return flatDist
    ? `${flatDistUiPrefix}internal_chunks_[name].[hash][extname]`
    : `internal/chunks/[name].[hash][extname]`;
},
```

**Image Assets**: Processed into `internal/img/` directory with hash-based naming for cache busting
**CSS Assets**: Main stylesheet placed in `internal/` with hash naming
**Other Assets**: Organized in `internal/chunks/` directory
**Flat Distribution**: When enabled, uses prefix-based naming (e.g., `ui_internal_img_logo.abc123.png`)

### Chunk and Entry File Naming

JavaScript files follow a similar naming convention:

```typescript
chunkFileNames: flatDist
  ? `${flatDistUiPrefix}internal_chunks_[name].[hash].js`
  : "internal/chunks/[name].[hash].js",
entryFileNames: flatDist
  ? `${flatDistUiPrefix}internal_[name].[hash].js`
  : "internal/[name].[hash].js",
```

**Chunk Files**: Code-split JavaScript bundles with hash-based names for cache invalidation
**Entry Files**: Main application entry points with consistent naming pattern
**Flat Mode**: Converts directory structure to flat files with descriptive prefixes

### Build Input Configuration

The configuration specifies the entry point for building:

```typescript
rollupOptions: {
  input: path.resolve(process.cwd(), "index.html"),
  // ... output configuration
}
```

This ensures Vite starts the build process from the project's `index.html` file, following standard web application conventions while supporting XMLUI's component-based architecture.

## Build Utilities Implementation

The utilities in `xmlui/bin/` implement the actual build logic that uses the Vite configuration. Each utility handles specific aspects of the XMLUI build pipeline.

### Command Dispatcher (`index.ts`)

The main CLI entry point routes commands and processes arguments:

```typescript
switch (script) {
  case "build": {
    const { flatDist, prod, buildMode, withMock, withHostingMetaFiles, withRelativeRoot } =
      argv as any;

    build({
      buildMode: getStringArg(buildMode, prod ? "CONFIG_ONLY" : undefined),
      withMock: getBoolArg(withMock, prod ? false : undefined),
      withHostingMetaFiles: getBoolArg(withHostingMetaFiles, prod ? false : undefined),
      withRelativeRoot: getBoolArg(withRelativeRoot, prod ? true : undefined),
      flatDist: getBoolArg(flatDist, prod ? true : undefined),
    });
    break;
  }
  case "build-lib": {
    const { watch, mode } = argv as any;
    buildLib({watchMode: getBoolArg(watch, false), mode: getStringArg(mode, "")});
    break;
  }
}
```

**Argument Processing**: Uses helper functions to handle array deduplication and type conversion
**Command Routing**: Dispatches to appropriate build functions based on the command
**Default Values**: Applies context-aware defaults (production vs development mode)

### Application Builder (`build.ts`)

The main application build logic integrates with Vite configuration:

```typescript
await viteBuild({
  ...(await getViteConfig({
    flatDist,
    withRelativeRoot,
    flatDistUiPrefix,
  })),
  define: {
    "process.env.VITE_BUILD_MODE": JSON.stringify(buildMode),
    "process.env.VITE_DEV_MODE": false,
    "process.env.VITE_MOCK_ENABLED": withMock,
    "process.env.VITE_USED_COMPONENTS_App": JSON.stringify(process.env.VITE_USED_COMPONENTS_App),
    // ... more component flags for tree shaking
  },
});
```

**Configuration Merging**: Combines base Vite config with build-specific options
**Environment Variables**: Injects build-time flags for component tree-shaking and runtime behavior
**Build Mode Control**: Sets flags that affect how the application behaves when built

**Resource Processing**: After the Vite build, processes additional resources:

```typescript
async function convertResourcesDir(distRoot: string, flatDist: boolean, filePrefix: string) {
  const resourcesDir = `${distRoot}/resources`;
  if (!existsSync(resourcesDir)) {
    return undefined;
  }
  
  const files = await new Promise<string[]>((resolve, reject) => {
    glob.glob(`${resourcesDir}/**/*`, (err: any, matches = []) => {
      resolve(matches);
    });
  });

  const ret: Record<string, string> = {};
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relativePath = file.replace(`${distRoot}/`, "");
    const convertedResource = `${filePrefix}${relativePath.replaceAll("/", "_")}`;

    await cp(file, `${distRoot}/${convertedResource}`);
    ret[relativePath] = convertedResource;
  }
  return ret;
}
```

**Resource Discovery**: Scans the resources directory using glob patterns
**File Flattening**: Converts nested directory structure to flat naming when required
**Resource Mapping**: Creates a mapping table for runtime asset resolution

### Extension Library Builder (`build-lib.ts`)

Handles building extension packages with different requirements:

```typescript
const config: UserConfig = {
  build: {
    lib: mode === "metadata" ? {
      entry: [path.resolve("meta", "componentsMetadata.ts")],
      name: `${env.npm_package_name}-metadata`,
      fileName: `${env.npm_package_name}-metadata`,
    } : {
      entry: [path.resolve("src", "index.tsx")],
      formats: watchMode ? ["es"] : ["umd", "es"],
      name: env.npm_package_name,
      fileName: (format) => (format === "es" ? esFileName : umdFileName),
    },
    rollupOptions: {
      external: mode === "metadata" ? [] : ["react", "react-dom", "xmlui", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "jsx": "react/jsx-runtime"
        },
      },
    },
  },
  plugins: mode === "metadata" ? [] : [react(), libInjectCss()],
};
```

**Dual Mode Support**: Handles both regular library builds and metadata extraction
**External Dependencies**: Excludes React and XMLUI core from the bundle (treated as peer dependencies)
**Format Selection**: Generates both UMD and ESM formats for maximum compatibility
**Plugin Selection**: Uses different plugin sets for metadata vs full builds

### Development Server (`start.ts`)

Configures the development server with XMLUI-specific settings:

```typescript
const server = await createServer({
  ...viteConfig,
  server: {
    port,
    proxy: proxyDef,
  },
  define: {
    ...viteConfig.define,
    "process.env.VITE_BUILD_MODE": JSON.stringify("ALL"),
    "process.env.VITE_DEV_MODE": true,
    "process.env.VITE_MOCK_ENABLED": withMock,
    "process.env.VITE_INCLUDE_ALL_COMPONENTS": JSON.stringify("true"),
  },
});
```

**Development Flags**: Sets development-specific environment variables
**Component Inclusion**: Disables tree-shaking in development for better debugging
**Mock Integration**: Conditionally enables mock service worker
**Proxy Support**: Configures API proxying for backend integration

## XMLUI Vite Plugin

The custom Vite plugin (`vite-xmlui-plugin.ts`) handles transformation of XMLUI-specific file types during the build process.

### File Type Detection

The plugin identifies and processes three types of XMLUI files:

```typescript
const xmluiExtension = new RegExp(`.${componentFileExtension}$`);
const xmluiScriptExtension = new RegExp(`.${codeBehindFileExtension}$`);
const moduleScriptExtension = new RegExp(`.${moduleFileExtension}$`);
```

- **`.xmlui` files** - XMLUI markup components
- **`.xmlui.ts` files** - Code-behind TypeScript files
- **`.module.ts` files** - XMLUI module files

### XMLUI Markup Transformation

For `.xmlui` files, the plugin transforms markup to JavaScript:

```typescript
if (xmluiExtension.test(id)) {
  const fileId = "" + itemIndex++;
  let { component, errors, erroneousCompoundComponentName } = xmlUiMarkupToComponent(
    code,
    fileId,
  );
  if (errors.length > 0) {
    component = errReportComponent(errors, id, erroneousCompoundComponentName);
  }
  const file = {
    component,
    src: code,
    file: fileId,
  };

  return {
    code: dataToEsm(file),
    map: { mappings: "" },
  };
}
```

**Markup Parsing**: Uses `xmlUiMarkupToComponent` to convert XMLUI syntax to component definitions
**Error Handling**: Generates error report components when markup parsing fails
**ESM Generation**: Converts the component object to ES module format using `dataToEsm`
**File Tracking**: Assigns unique file IDs for build tracking and debugging

### Code-Behind Processing

For TypeScript code-behind files, the plugin processes scripting logic:

```typescript
const hasXmluiScriptExtension = xmluiScriptExtension.test(id);
const hasModuleScriptExtension = moduleScriptExtension.test(id);
if (hasXmluiScriptExtension || hasModuleScriptExtension) {
  const parser = new Parser(code);
  parser.parseStatements();
  
  const moduleName = hasXmluiScriptExtension
    ? id.substring(0, id.length - (codeBehindFileExtension.length + 1))
    : id.substring(0, id.length - (moduleFileExtension.length + 1));

  const codeBehind = collectCodeBehindFromSource(moduleNameResolver(moduleName), code);
  removeCodeBehindTokensFromTree(codeBehind);

  return {
    code: dataToEsm({...codeBehind, src: code}),
    map: { mappings: "" },
  };
}
```

**Script Parsing**: Uses custom TypeScript parser to validate and process code
**Module Resolution**: Resolves relative module dependencies during transformation
**Code Behind Collection**: Extracts code-behind logic and associates it with components
**Token Processing**: Removes XMLUI-specific tokens from the TypeScript AST

This plugin system enables Vite to understand and process XMLUI's custom file formats, transforming them into standard JavaScript modules that can be bundled and executed in the browser.

