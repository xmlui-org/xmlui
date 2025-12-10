# Standalone Rendering Architecture

This document provides comprehensive documentation of XMLUI's standalone app architecture for developers working on the XMLUI core framework. It covers the complete rendering pipeline from app bootstrapping through component rendering, explaining how XMLUI source files (.xmlui, .xmlui.xs) are transformed into running React applications.

The document is structured in three main sections: (1) Translation and Rendering explains the two deployment modes (built vs buildless) and high-level architecture, (2) Component Hierarchy Flow shows the provider stack and rendering tree, and (3) Implementation Details provides in-depth documentation of each component, provider, and rendering utility with behavior descriptions and cross-references.

## Translation and Rendering

XMLUI supports two distinct deployment modes that determine how source files are processed and delivered to the browser:

**Built Apps** use compile-time transformation via Vite plugins. Source files (.xmlui, .xmlui.xs) are pre-compiled during build time and bundled into the runtime, providing faster startup and optimized performance for production deployment.

**Buildless Apps** fetch and parse sources at runtime using sophisticated fallback logic, enabling rapid development and deployment without a build step. This approach allows zero-config deployment to any static web server.

Both modes converge on the same rendering pipeline once the app's internal representation is prepared. Both use the `StandaloneApp` component as their entry point, but pass different arguments based on how component definitions are resolved.

### Understanding the Modes Through Examples

**Pure Buildless App: xmlui-invoice**

Standalone applications like xmlui-invoice exemplify the buildless approach:

```
xmlui-invoice/
  ├── index.html          # Loads xmlui-standalone.umd.js
  ├── Main.xmlui          # App entry point
  ├── components/         # Component source files
  │   ├── InvoiceList.xmlui
  │   └── InvoiceForm.xmlui
  └── xmlui/
      └── 0.9.90.js       # XMLUI runtime
```

When the browser loads `index.html`, the standalone runtime automatically:
1. Detects `Main.xmlui` as the entry point
2. Fetches and parses it at runtime
3. Discovers referenced components (`InvoiceList`, `InvoiceForm`)
4. Recursively fetches and parses them from the `components/` directory
5. Passes `undefined` as the `runtime` parameter to `StandaloneApp`

```typescript
// From index-standalone.ts (bundled in xmlui-standalone.umd.js)
// ESM module that auto-starts on DOMContentLoaded
startApp(undefined, undefined, Xmlui);
```

The `StandaloneApp` component's `useStandalone()` hook recognizes the missing runtime and triggers the fallback logic that fetches source files on-demand.

**Built App: The XMLUI Documentation Site**

The documentation site at xmlui.com demonstrates the built approach:

```
docs/
  ├── index.html          # Loads bundled JavaScript
  ├── index.ts            # Entry point with import.meta.glob
  ├── src/
  │   └── Main.xmlui      # Source files for development
  ├── package.json        # Build scripts
  └── dist/               # Compiled output
      ├── index.html
      └── internal/
          └── chunks/     # Pre-compiled bundles
```

The `index.ts` entry point uses Vite's `import.meta.glob()` to pre-compile all source files:

```typescript
// From docs/index.ts (ESM module)
import { startApp } from "xmlui";

const runtime = import.meta.glob(`/src/**`, { eager: true });
startApp(runtime, usedExtensions);
```

During the build process (`npm run build:docs`):
1. Vite's xmlui plugin transforms all `.xmlui` files into component definitions
2. Component definitions are bundled into JavaScript modules
3. The `runtime` object contains pre-compiled components
4. `StandaloneApp` receives the populated `runtime` parameter and skips fetching

The resulting `dist/` folder contains optimized bundles that start faster since parsing already happened at build time.

**Hybrid Case: Extension Development**

The build-hello-world-component tutorial shows an interesting hybrid pattern - a **built extension consumed by buildless apps**:

Extension development uses a build step:
```bash
npm run build:extension  # Creates dist/xmlui-hello-world.js (ESM)
```

But the resulting extension is consumed by buildless standalone apps:

```html
<!-- Buildless app index.html -->
<script src="https://unpkg.com/xmlui@latest/dist/standalone/xmlui-standalone.umd.js"></script>
<script src="xmlui/xmlui-hello-world.js"></script>
```

The extension package itself is pre-compiled (built), but the app loading it remains buildless. The extension registers its components with `StandaloneApp`'s extension manager, which makes them available to the runtime component discovery system.

### How StandaloneApp Unifies Both Modes

The `startApp()` function is the universal bootstrapping mechanism:

```typescript
export function startApp(
  runtime: any,  // Pre-compiled components or undefined
  extensions: Extension[] | Extension = [],
  extensionManager: StandaloneExtensionManager = new StandaloneExtensionManager(),
) {
  extensionManager.registerExtension(extensions);
  let rootElement: HTMLElement | null = document.getElementById("root");
  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.setAttribute("id", "root");
    document.body.appendChild(rootElement);
  }
  if (!contentRoot) {
    contentRoot = ReactDOM.createRoot(rootElement);
  }
  contentRoot.render(
    <StandaloneApp runtime={runtime} extensionManager={extensionManager} />
  );
  return contentRoot;
}
```

The `StandaloneApp` component's internal logic adapts based on what it receives:

**Built Mode (runtime provided):**
- `mergeAppDefWithRuntime()` extracts pre-compiled definitions
- No network requests for component source files
- Immediate rendering pipeline initialization

**Buildless Mode (runtime is undefined):**
- `useStandalone()` hook detects missing runtime
- Fetches `Main.xmlui` using `xmlUiMarkupToComponent()`
- Loads `config.json` for configuration
- Recursively discovers and loads components via `collectMissingComponents()`
- Parses both `.xmlui` markup and `.xmlui.xs` code-behind files
- Assembles `StandaloneAppDescription` for rendering

Both paths converge at the same point: a fully-prepared `StandaloneAppDescription` object passed to `AppRoot` for rendering. The component hierarchy, state management, and rendering pipeline are identical regardless of deployment mode.

### When the Mode is Determined

The built vs buildless decision is made **at project inception**, not during development:

**Creating a standalone app (buildless by design):**
```bash
mkdir my-app
cd my-app
# Create index.html, Main.xmlui
# Deploy to any web server
```

As a standalone app developer, you work exclusively in buildless mode. There is no choice to make - you edit `.xmlui` files, refresh the browser, and see changes immediately.

**Creating an extension (requires build):**
```bash
npm init -y
npm install --save-dev xmlui
# Extensions must use the build system
npm run build:extension
```

Extension developers work in built mode to create distributable packages. The build step compiles TypeScript to JavaScript and packages the extension for consumption by buildless apps.

**Creating a documentation/demo site (architectural decision):**
```bash
# Decision point: Do we need HMR and build-time optimization?
# If yes → built mode (like the docs site)
# If no → buildless mode (like example apps)
```

The docs site was architected as a built app to support hot module reloading during development and build-time optimization for production. This decision was made once at project inception.

### Key Takeaway

The mode is inherent to the project type. Standalone app developers never think about builds. Extension developers always use builds. The docs site developers work with builds because that's how the docs site was designed. Once the initial architecture is established, the mode doesn't change.

### Buildless Apps: Direct Source File Execution

Buildless apps represent one of XMLUI's most powerful features - the ability to run applications directly from source files without any compilation step.

**Typical Buildless App Structure:**
```
xmlui-app/
  ├── index.html          # Entry HTML page with xmlui runtime script
  ├── Main.xmlui          # App entry point
  ├── config.json         # App configuration (optional)
  ├── components/         # Custom components directory (optional)
  │   ├── ClientDetails.xmlui
  │   └── Home.xmlui
  ├── resources/          # Static resources (optional)
  │   └── favicon.ico
  ├── themes/             # Custom themes (optional)
  │   └── app-theme.json
  └── xmlui/              # XMLUI runtime
      └── 0.9.90.js
```

When using a web server that can serve static files, only these three files are required to create a fully functional XMLUI app:
- `index.html`
- `xmlui/<xmlui-version>.js`
- `Main.xmlui`

**How Buildless Apps Bootstrap:**
1. Browser loads `index.html` which includes the XMLUI runtime script
2. Runtime automatically looks for `Main.xmlui` as the entry point
3. Framework fetches and parses source files on-demand as components are referenced
4. Component discovery happens recursively - as markup references components, they're loaded from the `components/` directory
5. Themes and configuration are loaded from their respective directories/files

**Key Characteristics of Buildless Deployment:**
- **Zero Build Step**: Apps can be deployed directly to any static web server
- **Runtime Parsing**: Source files are fetched and parsed in the browser
- **Development Speed**: Changes are immediately visible on page refresh
- **Simple Deployment**: Copy files to a web server and serve `index.html`

This buildless approach enables rapid prototyping and simple deployment scenarios where build complexity isn't desired.

### Built Apps: Pre-compiled for Performance

Built apps represent XMLUI's production-ready deployment approach where source files are pre-compiled during build time, resulting in optimized bundles with faster startup times and reduced runtime overhead.

Built apps use Vite with HMR. The vite-xmlui-plugin compiles `.xmlui` files to component definitions at build time, eliminating runtime parsing overhead for faster startup.

**How Built Apps Bootstrap:**
1. Vite pre-compiles `.xmlui`/`.xmlui.xs` files via vite-xmlui-plugin during build
2. Compiled definitions are bundled into ESM modules
3. Browser loads bundled JS/CSS
4. `StandaloneApp` receives pre-compiled `runtime` object
5. Rendering begins immediately without parsing

**Key Characteristics of Built Deployment:**
- **Optimized Performance**: All source files are pre-parsed and bundled
- **Dependency Bundling**: All XMLUI components and logic are included in the JavaScript bundle
- **Asset Optimization**: CSS is extracted and optimized, resources are processed
- **Production Ready**: Minified, tree-shaken, and optimized for fast loading
- **No Runtime Parsing**: No need to fetch and parse .xmlui files at runtime

## The StandaloneApp Component

The **StandaloneApp** component is the root React component for XMLUI standalone applications. It has these main responsibilities:

- **Preparing the app's internal representation** - Converts XMLUI source files (.xmlui, .xmlui.xs, config.json, themes) into the internal component definitions and app structure that the XMLUI rendering engine can process. This includes loading sources (either from pre-compiled runtime or by fetching files dynamically), parsing markup, resolving component dependencies, and handling errors.
- **Initiating the rendering** - Delegates to the XMLUI rendering engine by wrapping the prepared app definition to begin the React rendering process.

### Internal App Representation

An XMLUI app is represented as an immutable object in memory composed from the XMLUI app's source files. The `StandaloneApp` component creates this internal representation in different ways depending whether the app uses built or buildless mode.

**Key Properties:**
- `appDef`: Pre-defined app description (used in inline/test modes)
- `runtime`: Pre-compiled component definitions (for built apps)

**Built Mode:** The `runtime` property contains pre-compiled component definitions created by the vite-xmlui-plugin during build time. The `mergeAppDefWithRuntime()` function combines any provided `appDef` with the pre-compiled runtime to create the final app representation.

**Buildless Mode:** When no pre-compiled runtime exists, the `useStandalone` hook implements fallback logic:
1. Fetches `Main.xmlui` as the entry point using `xmlUiMarkupToComponent()`
2. Loads `config.json` for app configuration and theme settings
3. Recursively discovers and loads missing components from the `components/` directory using `collectMissingComponents()`
4. Parses both `.xmlui` markup files and `.xmlui.xs` code-behind files
5. Assembles everything into a `StandaloneAppDescription` object with entryPoint, components, themes, and configuration

The resulting internal representation is a complete app definition that the rendering engine can process regardless of whether it was created from pre-compiled sources or parsed at runtime.

### Components Contributing to the Rendering Engine

Here's a comprehensive table of all objects involved in rendering XMLUI apps:

| **Object** | **Type** | **Role/Contribution to Rendering** |
|------------|----------|-------------------------------------|
| **StandaloneApp** | React Component | Root component that prepares app internal representation and initiates rendering via ApiInterceptorProvider → AppRoot |
| **ApiInterceptorProvider** | React Component | Wraps the app to provide mocked API functionality and routing context; waits for API interceptor initialization if needed |
| **AppRoot** | React Component | Main rendering orchestrator that wraps app definition in root Container and Theme components; sets up component registry |
| **ComponentProvider** | React Context | Provides component registry that maps component names to their renderer functions; manages core and compound components |
| **StyleProvider** | React Component | Provides CSS-in-JS styling context and theme-based styling capabilities for components |
| **DebugViewProvider** | React Context | Provides debug configuration and development tooling context for the application |
| **AppWrapper** | React Component | Sets up multiple provider layers (Router, QueryClient, HelmetProvider, LoggerProvider, IconProvider, ThemeProvider, etc.) |
| **Router** | React Component | Provides routing functionality (BrowserRouter/HashRouter/MemoryRouter) for navigation and URL management |
| **QueryClientProvider** | React Context | Provides React Query client for data fetching, caching, and server state management |
| **HelmetProvider** | React Context | Manages document head elements (title, meta tags, etc.) for SEO and document metadata |
| **LoggerProvider** | React Context | Provides logging infrastructure and configuration for application-wide logging |
| **IconProvider** | React Context | Provides icon registry and icon rendering functionality throughout the application |
| **ThemeProvider** | React Context | Provides theme context and theme switching functionality throughout the app |
| **InspectorProvider** | React Context | Provides development tools and component inspection capabilities for debugging |
| **ConfirmationModalContextProvider** | React Context | Manages confirmation dialogs and modal interactions throughout the application |
| **AppContent** | React Component | Creates application context with global functions, viewport management, theme info, and app state; provides navigation and utility functions |
| **AppContext.Provider** | React Context | Provides global app functions (navigate, toast, confirm, etc.) and environment information |
| **AppStateContext.Provider** | React Context | Manages application state in "buckets" to avoid prop drilling through component hierarchies |
| **StandaloneComponent** | React Component | Root container renderer that wraps the app definition in a Container component and initiates the renderChild process |
| **renderChild()** | Function | The "jolly-joker" function that recursively processes component definitions into React elements; handles TextNode, Slot, and component rendering |
| **ComponentWrapper** | React Component | Prepares components for XMLUI environment; connects with state management; transforms data operations; routes to ContainerWrapper or ComponentAdapter |
| **ContainerWrapper** | React Component | Manages state containers for components that need state management; wraps components in StateContainer for isolated state |
| **ComponentAdapter** | React Component | Translates XMLUI domain concepts to React concepts; creates RendererContext; handles API-bound components, slots, decorations, and error boundaries |
| **Container** | React Component | Manages component state and provides context for child components; handles state isolation and cleanup |
| **StateContainer** | React Component | Provides isolated state management for container components; manages component lifecycle and state updates |
| **ApiBoundComponent** | React Component | Handles components with API-bound properties and events (DataSource, APICall, FileUpload, etc.) |
| **ComponentDecorator** | React Component | Decorates components with test IDs, inspection attributes, and other development/tooling features |
| **SlotItem** | React Component | Manages template transposition for Slot components in reusable component patterns |
| **ErrorBoundary** | React Component | Catches and displays rendering errors; provides graceful degradation when components fail |
| **RendererContext** | Type/Object | Context object passed to component renderers containing state, renderChild, extractValue, event handlers, and layout info |
| **ComponentRegistry** | Object | Maps component names to their renderer functions; manages core components and user-defined components |
| **LayoutContext** | Object | Provides layout information to components (e.g., whether rendered in horizontal/vertical stack) |
| **ValueExtractor** | Object | Extracts and evaluates property values from component definitions, handling expressions and data binding |

### Component Hierarchy Flow

#### StandaloneApp Hierarchy

```
StandaloneApp
  └── ApiInterceptorProvider (API mocking)
      └── AppRoot (main orchestrator)
```

This segment provides the foundational app bootstrapping and API infrastructure. StandaloneApp prepares the internal app representation from source files, while ApiInterceptorProvider sets up mocked API capabilities and routing context before delegating to the main rendering orchestrator.

#### AppRoot Hierarchy

```
AppRoot
  └── ComponentProvider (component registry)
      └── StyleProvider (CSS-in-JS)
          └── DebugViewProvider (debug context)
              └── AppWrapper
```

AppRoot establishes the core rendering infrastructure. ComponentProvider manages the component registry, StyleProvider enables theming, and DebugViewProvider configures development tooling.

#### AppWrapper Hierarchy

```
AppWrapper
  └── Router (Browser/Hash/MemoryRouter)
      └── QueryClientProvider (React Query)
          └── HelmetProvider (document head)
              └── LoggerProvider (logging)
                  └── IconProvider (icons)
                      └── ThemeProvider (themes)
                          └── InspectorProvider (dev tools)
                              └── ConfirmationModalContextProvider (modals)
                                  └── AppContent
```

AppWrapper creates the application runtime environment with provider layers for routing, data fetching (React Query), document management (Helmet), logging, icons, theming, dev tools, and modal dialogs.

#### AppContent Hierarchy

```
AppContent
  └── AppContext.Provider (global functions)
      └── AppStateContext.Provider (bucket state)
          └── StandaloneComponent (root container)
              └── renderChild() → ComponentWrapper → ContainerWrapper/ComponentAdapter
```

AppContent provides global app functions (navigate, toast, confirm) via AppContext and bucket-based state management via AppStateContext. StandaloneComponent wraps the app in a root Container and begins recursive rendering through ComponentWrapper.

## Implementation Details

This section provides detailed documentation for every component, provider, context, and utility function in the XMLUI rendering pipeline. Each entry includes a concise description, behavior bullets explaining key responsibilities and interactions, and cross-references to related components. Use this as a reference when working with specific parts of the rendering architecture, debugging issues, or understanding how components collaborate to transform XMLUI definitions into rendered React applications.

### The `StandaloneApp` Component

`StandaloneApp` resolves the app's internal representation from precompiled runtime or by parsing sources on-demand, then passes the prepared app definition (entryPoint, components, themes, resources, globals) to `ApiInterceptorProvider` for API mocking setup and to `AppRoot` which wraps it in theme/container roots and starts the rendering pipeline.

| **Property** | **Role & processing** |
|-------------|-------------------------------------|
| `appDef` | Pre-defined app description (`StandaloneAppDescription`) for inline/test modes. Merged with `runtime` via `mergeAppDefWithRuntime()` to form the final app representation passed to `AppRoot`. |
| `appGlobals` | Global variables and configuration values. Combined with runtime/app-provided globals and forwarded to `AppRoot` as `globalProps`. |
| `decorateComponentsWithTestId` | Enables test ID decoration for E2E testing. Propagated to `AppRoot` and used by `ComponentDecorator` to add `data-testid` attributes. |
| `debugEnabled` | Enables debug logging and development features. Sent to `AppRoot` and debug providers to control logging and dev tooling. |
| `runtime` | Pre-compiled component definitions (`RuntimeProps`) for built apps. `useStandalone` extracts app description, components, themes and sources from it; merged with `appDef` when present. |
| `extensionManager` | Manager for third-party components and extensions. Passed into `ComponentProvider`/`AppRoot` to register or resolve external components. |
| `waitForApiInterceptor` | If true, `ApiInterceptorProvider` delays rendering until the API interceptor is initialized. Controls startup timing for mocked APIs. |
| `children` | Additional child elements included in the rendered app. Forwarded into `AppRoot`/`AppWrapper` and rendered inside the app tree. |

#### `useStandalone()`

This hook produces a ready-to-render `StandaloneAppDescription` and, optionally, a `projectCompilation`. It accepts either a precompiled `runtime` or it builds the app at runtime by fetching and compiling source files.

On mount it resolves any provided `runtime`. If no runtime is available (or buildless mode is required), it fetches `Main.xmlui` and `config.json`. It then loads themes and parses markup and `.xs` code-behinds. Missing components are discovered and fetched recursively. Finally it runs linting, assembles compilation metadata, and sets `standaloneApp` and `projectCompilation` for `StandaloneApp` to consume.

#### See Also

- `resolveRuntime()` — convert precompiled runtime entries into a `StandaloneAppDescription` + `projectCompilation`.
- `mergeAppDefWithRuntime()` — shallow-merge inline `appDef` into a resolved runtime.
- `parseComponentMarkupResponse()` — parse `.xmlui` markup into component defs (errors → error components).
- `parseCodeBehindResponse()` — parse `.xs` code-behinds and produce declarations to merge.
- `collectMissingComponents()` — find missing compound components from entryPoint markup.
- `processAppLinting()` — run lint rules and produce a lint error component when severity is `Error`.
- `discoverCompilationDependencies()` — compute component dependency sets for `projectCompilation`.

### The `ApiInterceptorProvider` Component

`ApiInterceptorProvider` wraps the prepared app and provides an API interception layer used for mocking, request routing, and instrumentation. It initializes an interceptor and exposes its lifecycle (start, ready, dispose). When `waitForApiInterceptor` is true the provider can delay rendering until the interceptor reports ready. The interceptor can rewrite, stub, or capture HTTP requests and responses so components see predictable data during development and testing.

#### Behavior

- Exposes context hooks and utilities so components can send instrumented requests, read intercepted responses, or register fixtures.
- Supports route- or pattern-based request stubs and passthrough rules. Handlers can proxy requests to a real backend when needed.
- Receives the resolved `StandaloneAppDescription` and forwards it to `AppRoot` once the interceptor permits rendering. It works with `AppContext`/`ApiContext` to expose mocked endpoints and runtime flags, and cooperates with development tooling (inspector, logger) to record traces and replay fixtures.
- On initialization failure the provider either falls back to passthrough mode or blocks rendering depending on configuration. Runtime network or CORS errors are reported via the app's error reporting hooks (for example `errReportScriptError` / `errReportModuleErrors`).
- Keep the provider lightweight — heavy transformations should be implemented as dedicated request handlers registered with the interceptor.

#### See Also

- `waitForApiInterceptor` — prop that controls whether rendering waits for interceptor readiness.
- `errReportScriptError()` — report runtime script errors to the app's error reporting subsystem.
- `errReportModuleErrors()` — report module/compilation errors discovered during parsing or runtime.
- `ApiContext` — context object exposing interceptor utilities and runtime flags to components.


### The `AppRoot` Component

`AppRoot` is the main rendering orchestrator. It receives the resolved `StandaloneAppDescription`, registers components and themes, and mounts the provider stack that supplies styling, routing, data clients, and debugging tools. In short: `AppRoot` turns the prepared app description into a live React environment and hands control to `AppContent`/`StandaloneComponent` to start rendering.

#### Behavior

- Installs the `ComponentProvider` registry and registers core plus app-provided component renderers. It merges runtime and inline definitions and exposes the registry to children.
- Wraps the app in styling and utility providers (`StyleProvider`, `QueryClientProvider`, `HelmetProvider`, `LoggerProvider`, `ThemeProvider`, etc.) via `AppWrapper` so components get consistent styling, data fetching, and logging contexts.
- Forwards `globalProps`, `extensionManager`, and runtime flags into `AppContent` so navigation, toasts, theme switching, and extension resolution work at runtime.
- Initiates mounting of `StandaloneComponent` which calls `renderChild()` to recursively translate component definitions into React elements. It also coordinates initial data prefetching and feature-flag/hydration steps when available.
- Surface critical errors early: missing core components, registry failures, or unrecoverable initialization errors are reported through the app's error hooks and may render a fallback error component instead of the app tree.

#### See Also

- `ComponentProvider` — component registry used by `AppRoot` to resolve renderers.
- `AppWrapper` — the layered provider composition that `AppRoot` mounts for routing, theming, and tooling.
- `AppContent` — supplies global functions and application state to rendered components.
- `StandaloneComponent` / `renderChild()` — the entry point that begins recursive component rendering.

### The `ComponentProvider` Component

`ComponentProvider` maintains the component registry used throughout the app. It maps XMLUI component names (strings used in `.xmlui` markup) to renderer functions (React renderers or adapters) and manages registration of core, extension, and user-provided components.

The registry is the single source of truth for resolving component names at render time. XMLUI uses it to decouple markup from implementation, to allow extensions or app code to override renderers, and to supply safe placeholder/error renderers when a referenced component is missing. The registry is treated as effectively read-only during normal runtime to ensure consistent rendering across the tree; updates happen only during initialization or controlled hot-reload flows.

#### Behavior

- Initializes the `ComponentRegistry` with core platform components and merges in app-provided or runtime component definitions.
- Exposes resolver functions via context so `renderChild()` and `ComponentWrapper` can look up renderers by component name. Lookups return error or placeholder renderers when components are missing.
- Supports extension points: `extensionManager` can register or override component renderers before the app mounts.
- Protects the registry from accidental runtime mutations; updates are performed only during initialization or explicit hot-reload flows.
- When a requested renderer is missing, the provider triggers error reporting and may return a lint/error component to preserve rendering continuity.

#### See Also

- `ComponentRegistry` — the data structure that stores renderer mappings.
- `extensionManager` — registers third-party or app-specific components into the registry.
- `renderChild()` / `ComponentWrapper` — the runtime callers that resolve renderers from the registry.


### The `StyleProvider` Component

`StyleProvider` supplies the CSS-in-JS and theme context used by components. It wires theme values, design tokens, and runtime style overrides into a context consumable by component renderers and layout helpers. The provider centralizes style computation so components can remain declarative and theme-agnostic.

Example: markup → computed CSS class

```xml
<Stack width="48px" height="24px" backgroundColor="purple" />
```

The framework may translate those props into a dynamic CSS class applied to the Stack, for example:

```css
.stack_autogen_x1y2 { width:48px; height:24px; background-color:purple; }
```

#### Behavior

- Exposes theme values, token resolvers, and a style renderer (class names or inline styles) via context to all components.
- Applies runtime theme overrides, merges app and runtime theme definitions, and provides a fallback theme when none is supplied.
- Coordinates with `ThemeProvider` (if present) to support theme switching and persistence across sessions.
- Offers utilities for responsive tokens and layout-aware style resolution (for example direction, density, or breakpoint-aware tokens).
- Keeps style calculation performant by memoizing theme-derived values and avoiding per-render recomputation where possible.

#### See Also

- `ThemeProvider` — higher-level theme switching and persistence.
- `ComponentDecorator` — may rely on style context to compute inspection overlays or test attributes.
- `LayoutContext` — provides layout information that StyleProvider can use for responsive styling.


### The `DebugViewProvider` Component

`DebugViewProvider` supplies debug configuration and development tooling hooks to the app. It toggles debugging UI, controls verbose logging levels, and exposes inspection facilities used by developer tools (for example component inspectors and trace overlays). The provider keeps development-only concerns out of production flows by gating features on `debugEnabled` and environment flags.

#### Behavior

- Exposes debug flags, inspector toggles, and UI hooks via context so components and dev tools can opt into inspection and enhanced logging.
- Integrates with `ComponentDecorator` and `InspectorProvider` to render overlays, show component metadata, and capture event traces.
- Enables verbose logging and runtime diagnostics when `debugEnabled` is true; otherwise it is a no-op to avoid performance overhead.
- Provides short-lived utilities for tracing renders and network calls; these are disabled in production builds.

#### See Also

- `InspectorProvider` — concrete inspector implementation that renders UI overlays.
- `ComponentDecorator` — decorates components with inspection attributes used by the debug view.
- `LoggerProvider` — captures and displays verbose logs when debug tools are active.


### The `AppWrapper` Component

`AppWrapper` composes the global provider stack the app needs at runtime. It mounts routing, data clients, head management, logging, icons, theming, and other cross-cutting services so application components can assume those services exist. `AppWrapper` keeps the wiring in one place and forwards `children` into the fully provisioned runtime.

#### Behavior

- Chooses and mounts a `Router` implementation (Browser/Hash/Memory) based on environment and configuration.
- Creates and provides shared clients such as React Query's `QueryClient`, `HelmetProvider` for document head, and `LoggerProvider` for centralized logging.
- Mounts `IconProvider`, `ThemeProvider`, `InspectorProvider`, and modal/dialog contexts so UI components can rely on a consistent environment.
- Forwards `globalProps` and app-level callbacks into `AppContent` and ensures providers are correctly nested to avoid context shadowing.
- Keeps provider initialization idempotent and supports reinitialization for hot-reload or test harnesses.

#### See Also

- `Router` — navigation and URL management choices mounted by `AppWrapper`.
- `QueryClientProvider` — data-fetching client used for server state management.
- `HelmetProvider` — document head manager for title/meta updates.
- `ConfirmationModalContextProvider` — global modal/dialog context used throughout the app.


### The `Router` Component

`Router` is provided by the external `react-router-dom` package (version 6.26.2). XMLUI does not implement its own router; instead it selects and configures one of three router implementations from `react-router-dom` based on the app's runtime environment and configuration. The router manages client-side navigation, URL state, and history so XMLUI apps can support multi-page navigation without full-page reloads.

#### Behavior

- `AppWrapper` selects the router: `MemoryRouter` for preview mode, `HashRouter` when `useHashBasedRouting` is true (default), or `BrowserRouter` otherwise.
- The router receives a `basename` prop from `routerBaseName`. `HashRouter` ignores `basename` (uses fragment identifiers).
- XMLUI components use `react-router-dom` hooks (`useNavigate`, `useLocation`) to read/update URL state. `AppContext.navigate` wraps the router API.
- Integrates with XMLUI's `Link`, `NavLink`, and `Redirect` components for declarative navigation.

#### See Also

- `react-router-dom` (external package) — the library providing `BrowserRouter`, `HashRouter`, and `MemoryRouter`.
- `AppWrapper` — selects and mounts the appropriate router implementation.
- `AppContext.navigate` — global navigation function that uses the router's navigation API.
- `routerBaseName` — prop controlling the base path for all routes.


### The `QueryClientProvider` Component

`QueryClientProvider` is provided by the external `@tanstack/react-query` package (version 4.36.1). XMLUI uses React Query for declarative data fetching, caching, and server state management. The provider makes a singleton `QueryClient` instance available throughout the app so components can use hooks like `useQuery`, `useMutation`, and `useQueryClient` to manage server data.

#### Behavior

- `AppRoot` creates the singleton `queryClient` with `refetchOnWindowFocus: false` to prevent unnecessary refetches.
- `AppWrapper` provides the client at the outermost layer so all components can use React Query hooks.
- Components like `DataSource`, `APICall`, and `FileUpload` use React Query for async operations, retries, and caching.
- The client is shared across routes; query results are cached and deduplicated by query key.

#### See Also

- `@tanstack/react-query` (external package) — the library providing `QueryClient`, `QueryClientProvider`, and React Query hooks.
- `AppRoot` — creates the singleton `queryClient` instance used throughout the app.
- `AppWrapper` — mounts `QueryClientProvider` at the outermost provider layer.
- `AppContext.queryClient` — exposes the query client instance to app code for imperative cache operations.


### The `HelmetProvider` Component

`HelmetProvider` is provided by the external `react-helmet-async` package (version 1.3.0). XMLUI uses React Helmet Async to manage document head elements like `<title>`, `<meta>` tags, and `<link>` tags declaratively from within components. The provider enables server-side rendering (SSR) compatibility by tracking head changes asynchronously and allows multiple components to contribute head elements that are automatically deduplicated and merged.

#### Behavior

- `AppWrapper` mounts `HelmetProvider` near the top of the provider stack and includes a default `Helmet` component that sets the site title template (`%s | ${siteName}`) so pages can declare their titles without repeating the site name.
- In SSR or preview environments `AppWrapper` sets `HelmetProvider.canUseDOM = false` to disable direct DOM manipulation and enable server-side head rendering.
- XMLUI components and app code can use the `Helmet` component from `react-helmet-async` to declaratively set document metadata. Multiple `Helmet` instances merge their changes and the last-mounted instance takes precedence for conflicting values.
- The provider supports all standard head elements: title, meta tags (description, keywords, Open Graph, Twitter cards), link tags (canonical URLs, favicons, stylesheets), script tags, and base tags.
- Changes made through `Helmet` are automatically cleaned up when components unmount so the document head stays synchronized with the current component tree.

#### See Also

- `react-helmet-async` (external package) — the library providing `HelmetProvider` and `Helmet` components for document head management.
- `AppWrapper` — mounts `HelmetProvider` and configures the default title template.
- `Helmet` — the component used within XMLUI apps to set document head elements declaratively.


### The `LoggerProvider` Component

`LoggerProvider` is an internal XMLUI component that maintains a centralized log storage and provides logging capabilities throughout the app. It collects log entries with timestamps so development tools and debug views can display application activity and diagnostic information. The provider is lightweight and acts as a bridge between the global logger singleton and React's component tree.

#### Behavior

- Maintains an in-memory array of log entries where each entry includes a timestamp and the logged arguments. Log entries accumulate during the app session for inspection by debug tools.
- Exposes the `useLogger` hook that returns `logs` (all collected entries) and `addLog` (function to append new entries). Components can use this hook to record events or retrieve the log history.
- Integrates with `LoggerInitializer` which registers a callback with the global logger singleton so all logger calls (`logger.log`, `logger.warn`, `logger.error`, etc.) are captured and stored in the provider's state.
- Works with `DebugViewProvider` and `InspectorProvider` to surface logs in development UIs. When debug mode is disabled the logger still captures entries but they may not be displayed.
- The provider does not persist logs across page refreshes; it is intended for runtime debugging and inspection only.

#### See Also

- `LoggerInitializer` — registers the provider's callback with the global logger singleton to capture log calls.
- `useLogger` — hook that exposes log entries and the `addLog` function to components.
- `DebugViewProvider` — uses logger data to display debug information and diagnostics.
- Global logger singleton — the shared logger instance (`logger.log`, `logger.warn`, `logger.error`) that sends entries to the provider.


### The `IconProvider` Component

`IconProvider` maintains the icon registry used throughout the XMLUI app. It maps icon names (strings used in XMLUI markup and components) to icon renderer functions and manages both built-in icons from the `react-icons` package (version 4.12.0) and custom XMLUI-specific icons. The provider enables declarative icon usage and supports dynamic loading of custom SVG icons from app resources.

#### Behavior

- Initializes the icon registry by registering hundreds of built-in icons from `react-icons` libraries (Feather Icons via `react-icons/fi`, AntDesign icons via `react-icons/ai`, Bootstrap icons via `react-icons/bs`, and others) plus custom XMLUI icons (check, chevron, warning, etc.).
- Exposes resolver functions via context through the `useIconRegistry` hook. Components like `Icon` use `lookupIconRenderer(name)` to resolve icon names to renderer functions at runtime.
- Supports custom SVG icons loaded from app resources via `ensureCustomSvgIcon(resourceUrl)`. Custom SVGs are fetched, parsed, and added to a hidden sprite element in the DOM for efficient rendering.
- Returns the full list of registered icon names via `getRegisteredIconNames()` for tooling, autocomplete, and documentation purposes.
- The registry is populated at module load time and remains read-only during runtime to ensure consistent icon resolution across the app.

#### See Also

- `react-icons` (external package) — provides the built-in icon library with hundreds of icons from popular icon sets.
- `useIconRegistry` — hook that exposes icon registry functions (`lookupIconRenderer`, `getRegisteredIconNames`, `ensureCustomSvgIcon`) to components.
- `Icon` component — the main consumer of the icon registry that renders icons by name.
- Custom XMLUI icons — XMLUI-specific icon components defined in `src/components/Icon/` for specialized UI needs.


### The `ThemeProvider` Component

`ThemeProvider` is an internal XMLUI component that manages the theming system throughout the app. It handles theme selection, tone switching (light/dark mode), theme extension chains, CSS variable generation, and font/resource loading. The provider enables declarative theming where components reference theme variables without coupling to specific color values or styles.

#### Behavior

- Maintains the active theme and tone (light or dark) and exposes them via `useTheme` and `useThemes` hooks. Components can query the current theme, switch themes dynamically, or toggle between light and dark tones.
- Supports built-in themes (XmlUi, XmlUiCyan, XmlUiGray, XmlUiGreen, XmlUiOrange, XmlUiPurple, XmlUiRed) plus app-provided custom themes. Themes can extend other themes to create hierarchical theme chains where values cascade and override.
- Generates CSS variables dynamically from theme definitions at runtime. Theme variables (`--xmlui-spacing-md`, `--xmlui-color-primary`, etc.) are injected into the DOM and consumed by component styles for consistent theming.
- Loads fonts and resources declared in theme definitions. Font URLs are converted to `<link>` tags in the document head while other resources are mapped to accessible URLs via the resource resolver.
- Coordinates with `StyleProvider` to apply theme-aware styling and with the `Theme` component to create nested theme scopes where child components inherit or override parent theme values.
- Persists theme and tone selections across sessions when configured. The provider can restore the user's last selected theme/tone on app restart.

#### See Also

- `useTheme` — hook that returns the current theme definition and tone; components use this to access theme variables programmatically.
- `useThemes` — hook that returns available themes and functions to switch themes or toggle tones.
- `StyleProvider` — works with ThemeProvider to apply theme-aware CSS-in-JS styling.
- `Theme` component — creates nested theme scopes where children can inherit or override theme values.
- Built-in themes — the default theme set (XmlUi, XmlUiCyan, etc.) defined in `src/components-core/theming/themes/`.


### The `InspectorProvider` Component

`InspectorProvider` is an internal XMLUI component that powers the developer tools and component inspection system. It maintains a registry of inspectable components in the running app and provides interactive debugging features like click-to-inspect component trees, source code viewing, and runtime property inspection. The provider is designed for development environments and is typically disabled in production builds.

#### Behavior

- Maintains a registry of all inspectable components currently mounted in the app. Components register themselves via the `attach` callback and deregister on unmount via `detach` so the inspector always sees the current component tree.
- Supports inspect mode where clicking on rendered components in the app selects them for inspection. When a component is selected the inspector displays its definition, props, state, and location in the source files.
- Provides source code viewing via integration with `InspectorDialog` and `AppWithCodeViewNative`. The inspector can display the `.xmlui` markup and `.xs` code-behind for the selected component when `sources` are available.
- Exposes inspection functions via `useDevTools`, `useInspector`, and `useInspectMode` hooks. Components and debug UIs use these hooks to control inspect mode, query inspected nodes, and access compilation metadata.
- Renders floating `InspectButton` components over inspectable elements when inspect mode is active. These buttons provide visual feedback and enable click-to-inspect functionality.
- Integrates with `projectCompilation` to provide detailed type information, component dependencies, and linting results in the inspector UI.

#### See Also

- `useDevTools` — hook that exposes inspector state and controls (open/close inspector, inspect mode toggle).
- `useInspector` — hook that returns the currently inspected component node and inspection utilities.
- `InspectorDialog` — the UI component that displays detailed component inspection information.
- `ComponentViewer` — renders the visual inspector overlay when components are being inspected.


### The `ConfirmationModalContextProvider` Component

`ConfirmationModalContextProvider` is an internal XMLUI component that manages confirmation dialogs and modal prompts throughout the app. It provides a promise-based API for displaying modal dialogs that require user confirmation or selection. The provider centralizes modal management so components don't need to maintain local modal state.

#### Behavior

- Exposes the `useConfirm` hook that returns a `confirm` function. Calling `confirm(title, message, actionLabel)` displays a modal dialog and returns a promise that resolves with the user's choice (true for confirm, false for cancel).
- Supports custom button configurations where callers can specify multiple buttons with different labels, variants, theme colors, and return values. The promise resolves with the `value` property of the clicked button.
- Auto-focuses the last button in the dialog when the modal opens so users can quickly confirm or cancel via keyboard (Enter/Escape). Focus management ensures accessibility and good UX.
- Renders a single `Dialog` component instance that is reused for all confirmation prompts. The dialog content (title, message, buttons) updates based on the current confirmation request.
- Handles concurrent confirmation requests by queueing them. Only one confirmation dialog is displayed at a time; subsequent requests wait for the previous dialog to close.
- Integrates with `AppContent` which wraps the `confirm` function and exposes it via `AppContext` so components can trigger confirmations using `appContext.confirm(...)`.

#### See Also

- `useConfirm` — hook that exposes the `confirm` function for displaying confirmation dialogs.
- `Dialog` component — the UI component that renders the modal dialog container and backdrop.
- `AppContext.confirm` — global confirmation function exposed to all components via app context.
- `Button` component — used to render the action buttons in confirmation dialogs.


### The `AppContent` Component

`AppContent` creates the application context layer that provides global functions, viewport information, theme management, and app state infrastructure to all components. It sits just inside the provider stack and wraps the root container component. The component assembles the `AppContextObject` with dozens of utility functions and environment properties that components access via `useAppContext`.

#### Behavior

- Creates and provides `AppContext` with global functions including `navigate` (routing), `toast` (notifications), `confirm` (modal dialogs), date utilities, math functions, file utilities, and miscellaneous helpers. Components use `useAppContext()` to access these functions.
- Manages viewport detection by reading CSS custom properties from the theme and creating media queries for different breakpoints (phone, tablet, desktop, large desktop). Exposes `mediaSize` object with viewport dimensions and responsive flags.
- Handles theme management integration by exposing `activeThemeId`, `activeThemeTone`, `setTheme`, `setThemeTone`, `toggleThemeTone` functions. Supports keyboard shortcuts (Alt+Ctrl+Shift+T for theme, Alt+Ctrl+Shift+O for tone).
- Provides environment information including `standalone` flag, `debugEnabled` flag, `appIsInShadowDom` detection, iframe embedding status, window focus state, and XMLUI version.
- Creates `AppStateContext` for bucket-based state management where components can store and retrieve state by bucket name without prop drilling. Provides `update(bucket, patch)` function to merge updates.
- Handles hash-based anchor scrolling for single-page navigation. Listens to location changes and scrolls to anchors in both light DOM and shadow DOM environments.
- Collects registered action functions from the component registry and exposes them via the `Actions` object so markup can reference custom app actions.

#### See Also

- `useAppContext` — hook that returns the global `AppContextObject` with all utility functions and environment properties.
- `AppContext.Provider` — the React context provider that makes the app context available to components.
- `AppStateContext.Provider` — the React context provider for bucket-based state management.
- `StandaloneComponent` — receives the root container and begins recursive component rendering.


### The `AppContext.Provider` Component

`AppContext.Provider` is the React context provider that supplies the global `AppContextObject` to all components in the XMLUI app. The context object contains utility functions, environment information, theme controls, navigation helpers, and integration points that components access via the `useAppContext` hook. This provider enables components to interact with app-level services without explicit prop passing.

#### Behavior

- Provides `navigate` (routing), `toast` (notifications), and `confirm` (modal dialogs) functions.
- Exposes theme controls (`activeThemeId`, `setTheme`, `toggleThemeTone`) for theme management.
- Provides `mediaSize` object with breakpoint flags (`isPhone`, `isTablet`, `isDesktop`) for responsive behavior.
- Exposes environment flags: `standalone`, `debugEnabled`, `appIsInShadowDom`, `isInIFrame`, `isWindowFocused`.
- Provides utilities: date formatting, math operations, file utilities, and Lodash `get` for property access.
- Includes `queryClient` (React Query), `apiInterceptorContext` (API mocking), and `Actions` (registered functions).

#### See Also

- `useAppContext` — hook that components use to access the `AppContextObject` with all global functions and properties.
- `AppContent` — the component that creates and populates the `AppContextObject` before passing it to the provider.
- `AppContextObject` type — TypeScript interface defining all properties available in the app context.


### The `AppStateContext.Provider` Component

`AppStateContext.Provider` enables bucket-based state management throughout the XMLUI app. It provides a centralized state store organized into named buckets where components can store and retrieve state without prop drilling. The provider uses the `use-context-selector` library for optimized re-rendering so components only re-render when their selected bucket changes.

#### Behavior

- Maintains `appState` as a two-level object: top-level keys are bucket names, values are bucket state objects.
- Provides `update(bucket, patch)` function for shallow-merging patches into buckets.
- Uses `use-context-selector` for optimized re-rendering—components only re-render when their selected bucket changes.
- Enables state sharing without prop drilling; any component can read/write any bucket by name.
- Initializes empty and populates buckets lazily on first write.

#### See Also

- `useAppStateContextPart` — hook that components use to subscribe to specific buckets or values from the app state with optimized re-rendering.
- `IAppStateContext` interface — TypeScript type defining the shape of the app state context (`appState` object and `update` function).
- `use-context-selector` package — external library providing optimized context selection to prevent unnecessary re-renders.
- `AppContent` — the component that creates the app state infrastructure and provides both AppContext and AppStateContext.


### The `StandaloneComponent` Component

`StandaloneComponent` is the entry point for rendering the resolved XMLUI app definition. It receives the root component node (typically the app's entry point from `Main.xmlui`) and wraps it in a `Container` if needed to provide initial state management. The component then calls `renderChild` to begin the recursive rendering process that transforms the component definition tree into React elements.

#### Behavior

- Wraps the root node in a `Container` component if it isn't already one. This ensures the app has a root state container for managing top-level state, functions, and variables.
- Accepts optional `functions` and `vars` props that are merged into the root container. These provide global functions and variables accessible throughout the app.
- Calls `renderChild` with the root container node and minimal context (empty state, noop callbacks) to initiate the recursive component rendering process. `renderChild` is the core rendering function that processes component definitions.
- Maintains a `memoedVarsRef` for caching computed variables across renders to optimize performance. This ref is passed down through the rendering tree.
- Supports `children` prop that can be injected into the rendered root. If children are provided and the rendered result is a valid React element, it clones the element and inserts the children.
- Acts as the bridge between the prepared app definition (from `StandaloneApp` → `AppRoot` → `AppContent`) and the actual component rendering tree (via `renderChild` → `ComponentWrapper` → renderers).

#### See Also

- `renderChild` — the core recursive rendering function that transforms component definitions into React elements.
- `Container` component — the state container that wraps components needing isolated state management.
- `ComponentWrapper` — receives rendered components and routes them to ContainerWrapper or ComponentAdapter.
- `AppContent` — renders `StandaloneComponent` with the root container node to begin app rendering.


### The `ComponentWrapper` Component

`ComponentWrapper` is the outermost React component wrapping every XMLUI component in the rendering tree. It receives component definitions from `renderChild`, performs data transformation (DataSource, loaders, data props), determines whether the component needs state management, and routes to either `ContainerWrapper` (for stateful components) or `ComponentAdapter` (for stateless components). It acts as a dispatcher and data preprocessor, while `ComponentAdapter` performs the actual semantic translation from XMLUI domain concepts to React representation.

#### Behavior

- Transforms child `DataSource` components into `loaders` on the parent node so data fetching is handled consistently. DataSources declared as children become loader definitions.
- Transforms string `data` props into `DataSource` components with `url` props. This enables declarative data fetching where `data="https://api.example.com/users"` automatically fetches and provides the data.
- Transforms `dataSourceRef` props (references to loaders by UID) into `DataSourceRef` component types so components can reference data from other loaders.
- Transforms `raw_data` props into resolved `data` props with `__DATA_RESOLVED` flag to indicate the data is already available and doesn't need fetching.
- Uses `isContainerLike(node)` to determine if the component needs state management. Components with `loaders`, `vars`, `uses`, `contextVars`, `functions`, or `scriptCollected` are container-like.
- Routes container-like components to `ContainerWrapper` which wraps them in `StateContainer` for isolated state management. Routes other components to `ComponentAdapter` for direct rendering.
- Maintains stable `layoutContext` ref across renders to prevent unnecessary re-renders when layout context hasn't changed.
- Memoized with `React.memo` to prevent re-rendering when props haven't changed. Uses `forwardRef` to support ref forwarding for DOM element access.

#### See Also

- `isContainerLike` — function that determines if a component needs wrapping in a state container.
- `ContainerWrapper` — handles stateful components by wrapping them in `StateContainer` for isolated state.
- `ComponentAdapter` — handles stateless components by translating XMLUI concepts to React and calling renderers.
- `renderChild` — the function that calls `ComponentWrapper` for each component in the tree.


### The `ContainerWrapper` Component

`ContainerWrapper` manages stateful components by wrapping them in `StateContainer` to provide isolated state management, component APIs, and lifecycle coordination. It receives components that need state (identified by `isContainerLike`) and ensures they have a `Container` wrapper with proper state isolation from parent and sibling components.

#### Behavior

- Checks if the component node is already a `Container` type. If not, wraps it automatically by calling `getWrappedWithContainer` which creates a Container and moves state-related properties (`loaders`, `vars`, `functions`, `uses`, `api`, `contextVars`) from the component to the wrapper.
- Wraps the containerized node in `ErrorBoundary` to catch and handle rendering errors gracefully. Errors in one container don't crash the entire app.
- Delegates to `StateContainer` which manages the actual state lifecycle: initializing state from `vars` and `loaders`, dispatching state updates, tracking state changes via `statePartChanged`, and cleaning up on unmount.
- Passes `isImplicit` flag to `StateContainer` indicating whether the container was auto-created (implicit) or explicitly declared in markup. Implicit containers are optimized differently.
- Forwards parent context including `parentState`, `parentStatePartChanged`, `parentRegisterComponentApi`, `parentDispatch` so the container can interact with parent state and register its API.
- Maintains `layoutContextRef` for stable layout context passing and `uidInfoRef` for component UID tracking and API registration.
- Memoized with `React.memo` and supports `forwardRef` for ref forwarding to child components.

#### See Also

- `StateContainer` — the component that manages container state lifecycle, loaders, variables, and component APIs.
- `isContainerLike` — function that identifies components needing state management based on their properties.
- `getWrappedWithContainer` — function that wraps non-Container components in a Container and moves state properties.
- `ComponentWrapper` — routes components to ContainerWrapper when they need state management.
- `ErrorBoundary` — catches rendering errors within containers to prevent app crashes.


### The `ComponentAdapter` Component

`ComponentAdapter` translates XMLUI component definitions into their React representation. It receives prepared component nodes from `ComponentWrapper`, creates the `RendererContext` with all necessary rendering utilities (state access, event handlers, value extraction, child rendering), looks up the component renderer from the registry, and executes it to produce the final React element. It handles special cases including API-bound components, Slot transposition, component decoration with test IDs, error boundaries, and behavior attachment.

#### Behavior

- Creates unique UIDs for each component instance and manages component lifecycle including cleanup callbacks when components unmount.
- Builds the `RendererContext` object containing all utilities needed by renderers: `state`, `updateState`, `extractValue`, `lookupEventHandler`, `lookupAction`, `renderChild`, `registerComponentApi`, `extractResourceUrl`, and layout information.
- Resolves layout properties from component props using the current theme and layout context. Computes CSS classes via `useComponentStyle` and applies responsive styling based on viewport breakpoints.
- Looks up the component renderer function from the `ComponentRegistry` and executes it with the prepared context. Handles missing renderers by displaying `UnknownComponent` warnings.
- Wraps API-bound components (those with `DataSource`, `APICall`, `FileUpload` props/events) in `ApiBoundComponent` for automatic data loading and transformation.
- Decorates visual components with test IDs via `ComponentDecorator` when `decorateComponentsWithTestId` is enabled. Adds `data-testid` and `data-inspectId` attributes for E2E testing and inspection.
- Handles `Slot` components specially by delegating to `slotRenderer` which transposes children from parent components into compound component slots for template composition.
- Attaches core behaviors to rendered components where applicable. Behaviors can augment components with cross-cutting concerns like accessibility enhancements or development tooling.

#### See Also

- `RendererContext` — the context object passed to component renderers containing all rendering utilities and state.
- `ComponentRegistry` — maps component names to renderer functions; used by ComponentAdapter to resolve renderers.
- `ApiBoundComponent` — wraps components with API-bound props/events to handle data loading and event execution.
- `ComponentDecorator` — decorates components with test IDs and inspection attributes for development tooling.
- `SlotItem` / `slotRenderer` — handle Slot transposition for compound component template composition.


### The `Container` Component

`Container` is the core component that implements XMLUI's stateful component behavior. It manages component state including variables, loaders, functions, and component APIs. It executes event handlers written in XMLUI's scripting language, coordinates async operations, handles state updates via a reducer pattern, and provides the complete state context to child components. The Container acts as the state management boundary where component-specific state is isolated from parent and sibling components.

#### Behavior

- Receives `componentState` from `StateContainer` and manages state updates via the container reducer through `dispatch` actions. State changes are coordinated through action types like `COMPONENT_STATE_CHANGED` and `STATE_PART_CHANGED`.
- Executes synchronous and asynchronous event handlers written in XMLUI script via `runCodeSync` and `runCodeAsync`. Parses handler code into statement trees, evaluates them in a binding context with access to state and app utilities, and applies resulting state changes via proxied state objects.
- Manages component lifecycle including mounting, updating, and cleanup. Registers component APIs via `registerComponentApi` so parent components can access child component methods and properties.
- Provides complete evaluation context to scripts including `appContext` (global utilities), `localContext` (proxied state), `eventArgs` (event parameters), and implicit context (component-specific utilities like `navigate`, `apiInstance`, `lookupAction`).
- Handles loader components that fetch external data via `LoaderComponent`. Coordinates data loading, caching, error handling, and provides loaded data to component state.
- Implements two-way data binding and state synchronization. Detects state changes via proxy change tracking, batches updates, and triggers re-renders when state parts change.
- Supports implicit containers (auto-created by `ContainerWrapper`) and explicit containers (declared in markup). Implicit containers delegate to parent dispatch while explicit containers maintain isolated state.

#### See Also

- `StateContainer` — wraps Container and manages the state reducer, state merging, variable resolution, and API registration.
- `ContainerActionKind` — defines action types for the container reducer including state changes, loader updates, and API registrations.
- `buildProxy` — creates proxied state objects that track changes for two-way binding and state synchronization.
- `processStatementQueue` / `processStatementQueueAsync` — execute parsed XMLUI script statements synchronously or asynchronously.
- `LoaderComponent` — handles external data loading within containers via DataSource and loader definitions.


### The `StateContainer` Component

`StateContainer` wraps the `Container` component and manages the complete state lifecycle for stateful XMLUI components. It initializes the container reducer, resolves variables and functions from code-behind scripts, merges parent state with local state via the `uses` property, manages component API registration, and provides the final combined state to the Container. It coordinates state from multiple sources including parent state, routing parameters, context variables, computed variables, and component APIs.

#### Behavior

- Creates the container reducer via `createContainerReducer` and initializes component state with `useReducer`. The reducer handles all state mutations including component state changes, loader updates, and state part changes.
- Extracts scoped state from parent via `uses` property which specifies which parent state fields the container should access. Merges this with local state and context variables to create the complete state context.
- Resolves computed variables and functions from code-behind `.xs` files and inline `vars`/`functions` definitions. Collects variable dependencies, performs two-pass resolution to handle forward references, and memoizes computed values for performance.
- Manages component API registration where child components expose methods and properties to parents. Collects APIs via `registerComponentApi` callback and merges them into component state so they're accessible as state properties.
- Provides routing context variables including `$pathname`, `$routeParams`, `$queryParams`, and `$linkInfo` which are automatically available in component state for route-aware components.
- Implements `statePartChanged` callback that determines whether state changes belong to the local container or should propagate to parent. Routes state updates to the correct scope based on variable ownership.
- Wraps the Container in `ErrorBoundary` to catch and display code-behind parsing errors and runtime errors. Throws `CodeBehindParseError` when module errors are detected during script parsing.

#### See Also

- `Container` — the core stateful component that StateContainer wraps; handles state execution and event processing.
- `createContainerReducer` — factory function that creates the reducer for managing container state mutations.
- `extractScopedState` — extracts parent state fields specified in the `uses` property for state scoping.
- `useVars` — hook that resolves computed variables and functions with dependency tracking and memoization.
- `collectFnVarDeps` — collects variable dependencies from function definitions to determine resolution order.


### The `ApiBoundComponent` Component

`ApiBoundComponent` transforms components with API-bound properties and events (DataSource, APICall, FileUpload, FileDownload) into components with automatic data loading and event handling capabilities. It wraps API operation definitions into loaders, generates event handler functions that call the appropriate actions, exposes component APIs for manual data fetching and updates, and delegates rendering to the standard component pipeline with the transformed node.

#### Behavior

- Transforms API-bound props (properties with DataSource or DataSourceRef types) into loader definitions. Each API-bound prop becomes a DataLoader component that manages data fetching, caching, and state.
- Generates event handler functions for API-bound events (APICall, FileUpload, FileDownload) by creating JavaScript code that calls global Actions (upload, download, callApi) with bound parameters and nested success/error handlers.
- Exposes component APIs for programmatic data control including `fetch_{prop}` (refetch data), `update_{prop}` (update cached data), `addItem_{prop}`, `getItems_{prop}`, and `deleteItem_{prop}` for collection manipulation.
- Injects loader state into component props so `data` prop receives `{loader.value}`, `loading` receives loader progress state, `pageInfo` receives pagination metadata, and events like `requestRefetch` are automatically wired to loader methods.
- Supports prefetched content integration where loader values fallback to `appGlobals.prefetchedContent` for initial render optimization before actual data loads.
- Handles DataSourceRef components (references to existing loaders by UID) by creating references instead of duplicate loaders for shared data sources.
- Wraps the transformed node with loaders, computed variables, and API methods then delegates to `renderChild` for standard rendering through ComponentWrapper and Container layers.

#### See Also

- `DataLoader` — the loader component type created for each API-bound property to manage data fetching.
- `Actions.callApi` / `Actions.upload` / `Actions.download` — global action functions called by generated event handlers.
- `parseAttributeValue` — parses URL attributes to determine if they're static or dynamic for prefetch key generation.
- `ComponentWrapper` — receives the transformed node from ApiBoundComponent and routes it through the rendering pipeline.


### The `ComponentDecorator` Component

`ComponentDecorator` adds custom attributes to the DOM nodes of rendered components for development tooling, testing, and debugging purposes. It injects attributes like `data-testid` and `data-inspectId` into component DOM elements even when components don't forward refs properly. The decorator uses hidden sibling elements to locate the target DOM node when direct ref access isn't available.

#### Behavior

- Injects attributes (e.g., `data-testid`, `data-inspectId`) into the child component's DOM node.
- Attempts ref forwarding first; if unavailable, uses hidden helper `<span>` elements to locate the DOM node via sibling traversal.
- Sets attributes via `setAttribute` in `useLayoutEffect`; removes attributes when values are undefined.
- Supports `allowOnlyRefdChild` mode for compound components where sibling-based location isn't reliable.
- Calls `onTargetMounted` callback when the DOM node is located, enabling inspector tools to refresh state.

#### See Also

- `ComponentAdapter` — uses ComponentDecorator to inject test IDs and inspection attributes into visual components.
- `useInspector` — provides `inspectId` values that ComponentDecorator injects for component inspection tooling.
- `composeRefs` — from `@radix-ui/react-compose-refs` used to merge forwarded refs with the decorator's internal ref.


### The `SlotItem` Component

`SlotItem` implements template transposition for Slot components in XMLUI's compound component system. It receives slot content defined in the parent component's markup, wraps it in a Container with context variables derived from slot props, and renders the content so it has access to data pushed from the compound component. Slots enable compound components to accept customizable template fragments from parent components.

#### Behavior

- Receives slot content as `node` from the parent component.
- Transforms slot props into context variables prefixed with `$` (e.g., `item` → `$item`).
- Wraps slot content in a Container with `contextVars` for the new state scope.
- Delegates to `renderChild` for standard rendering through ComponentWrapper.
- Memoized with shallow comparison to prevent unnecessary re-renders.
- Enables compound components to inject data into parent-provided templates (e.g., `List` passing `$item` and `$index`).

#### See Also

- `Slot` component — the placeholder in compound component markup that SlotItem renders content into.
- `slotRenderer` — the renderer function in ComponentAdapter that delegates to SlotItem for Slot transposition.
- `CompoundComponent` — the infrastructure that enables template composition with slots and context variable injection.
- `Container` — wraps slot content to provide the context variable scope for slot props.


### The `ErrorBoundary` Component

`ErrorBoundary` is a React error boundary component that catches rendering errors in child components and displays a fallback error UI instead of crashing the entire app. It implements React's error boundary lifecycle methods (`getDerivedStateFromError` and `componentDidCatch`) to intercept errors during the rendering phase and provide graceful degradation when components fail to render.

#### Behavior

- Implements `getDerivedStateFromError` static method to capture errors thrown during rendering, lifecycle methods, or constructors of child components. Updates internal state to trigger fallback UI rendering.
- Displays a styled error overlay with the error message when an error is caught. The overlay shows "There was an error!" heading and the error's message text for debugging.
- Logs caught errors to the console via `componentDidCatch` with error details, error info (component stack trace), and the error location for debugging purposes.
- Resets error state when the `node` prop changes via `componentDidUpdate`. This allows the boundary to recover and retry rendering when the component definition changes (useful for hot module reloading).
- Used extensively throughout the rendering pipeline to wrap containers (`StateContainer` wraps Container in ErrorBoundary) and prevent errors in one component from crashing parent or sibling components.
- Does not catch errors in event handlers, async code, or errors thrown outside the React rendering phase. Only catches errors during component rendering, lifecycle methods, and constructors.

#### See Also

- `StateContainer` — wraps the Container component in ErrorBoundary to catch parsing and runtime errors in stateful components.
- `ContainerWrapper` — uses ErrorBoundary to isolate container errors and prevent app crashes.
- `InvalidComponent` — displays error messages for invalid component configurations; complementary to ErrorBoundary's runtime error handling.


### The `RendererContext` Type

`RendererContext` is the TypeScript interface defining the complete context object passed to component renderer functions. It provides all utilities, state access, event handling, and rendering capabilities that component renderers need to transform XMLUI component definitions into React elements. The context encapsulates the rendering environment so renderers remain pure functions that receive everything they need via this single parameter.

#### Behavior

- Provides `node` (the component definition with props, events, children) and `state` (container state with variables, component APIs, and data) so renderers can access component configuration and runtime state.
- Exposes `extractValue` (ValueExtractor) for evaluating binding expressions in component props. Renderers use this to resolve `{expression}` syntax to actual values from state or app context.
- Provides event handling via `lookupEventHandler` (gets async handler for event name), `lookupAction` (resolves action by name), and `lookupSyncCallback` (resolves sync callback) so renderers can wire events to handlers.
- Enables state management through `updateState` function that component renderers call to update component-specific state. Also provides `registerComponentApi` for exposing component methods to parent components.
- Supplies `renderChild` function that renderers call to recursively render child components. This is the core recursive rendering mechanism that processes the component tree.
- Includes `extractResourceUrl` for resolving logical resource URLs to physical URLs using the theme's resource resolver, and `className` for computed CSS classes from layout props.
- Provides `layoutContext` describing the rendering context (stack orientation, wrap behavior, etc.) and `appContext` with global utilities (navigate, toast, theme, etc.) and `uid` (unique component instance identifier).

#### See Also

- `ComponentAdapter` — creates the RendererContext object and passes it to component renderer functions.
- `ValueExtractor` — the type for `extractValue` function that evaluates binding expressions and extracts typed values.
- `ComponentRendererFn` — the function signature for component renderers that receive RendererContext as their parameter.
- `renderChild` — the core recursive rendering function exposed via RendererContext for rendering child components.


### The `ComponentRegistry` Class

`ComponentRegistry` maintains the central registry of all components, loaders, actions, and theme variables available in an XMLUI application. It maps component names to renderer functions, manages namespaces for core/app/extension components, collects theme variables from registered components, and provides lookup methods used throughout the rendering pipeline to resolve components by name. The registry is created during app initialization and accessed via React context.

#### Behavior

- Maintains three namespace pools (CORE_NS for framework components, APP_NS for app-specific components, EXTENSIONS_NS for third-party extensions) where components are organized by namespace to prevent name collisions and enable overriding.
- Registers all core XMLUI components during construction including Stack, Button, Text, Table, List, Form, Modal, and 100+ HTML element wrappers. Uses environment variables (`VITE_USED_COMPONENTS_*`) for tree-shaking unused components in production builds.
- Supports component lookup via `lookupComponentRenderer(name)` which searches namespaces in priority order (core → app → extensions) for components without namespace prefix, or direct namespace lookup for qualified names (`MyNamespace.MyComponent`).
- Collects theme variables from component descriptors into a unified set and maintains default theme variable values. Provides `componentThemeVars` and `componentDefaultThemeVars` getters for theme resolution.
- Registers compound components (components defined in XMLUI markup) alongside native React components. Compound components are stored with their `compoundComponentDef` for later rendering via `CompoundComponent` infrastructure.
- Exposes action functions via `lookupAction(type)` and loader renderers via `lookupLoaderRenderer(type)` so the execution pipeline can resolve custom actions and data loaders by name.
- Integrates with `StandaloneExtensionManager` to receive extension component registrations dynamically. Subscribes to extension events and registers contributed components on-the-fly.
- Provides `destroy()` method to clean up subscriptions when the registry is unmounted (hot module reload scenarios). Ensures proper cleanup of extension manager listeners.

#### See Also

- `ComponentProvider` — the React component that creates ComponentRegistry and provides it via context to the app.
- `useComponentRegistry` — the React hook that components use to access the registry from context.
- `lookupComponentRenderer` — the primary lookup method used by ComponentAdapter to resolve renderer functions.
- `ComponentRegistryEntry` — the type describing registered components including renderer, descriptor, and compound component definitions.


### The `LayoutContext` Type

`LayoutContext` is a TypeScript type describing the layout environment in which a component is rendered. It provides information about the parent layout container (such as Stack orientation, Grid configuration, or Flow layout behavior) and optionally supplies a `wrapChild` function that parent components use to wrap rendered children in layout-specific React elements. Layout contexts enable parent components to control child rendering without children needing explicit knowledge of their layout environment.

#### Behavior

- Contains optional `type` property identifying the layout context kind (for example "Stack", "Grid", "Flow") so children can adapt rendering based on parent layout.
- Provides optional `wrapChild` function that parent components like Stack use to wrap each child in layout-specific elements. For example Stack wraps children in flex items with alignment and spacing applied.
- Supports arbitrary additional properties via index signature allowing layout-specific data to be passed through context. Stack adds `orientation` ("horizontal"/"vertical"), Grid adds column/row info, Flow adds wrapping behavior.
- Passed down the rendering tree via `renderChild` calls where parent components create new layout contexts for their children. Children receive the context via `RendererContext.layoutContext`.
- Used by `ComponentAdapter` to apply layout-specific styling when `wrapChild` is defined. After rendering a component the adapter checks for `layoutContext.wrapChild` and invokes it to wrap the result.
- Enables declarative layout composition where layout containers control child presentation without requiring children to import or understand parent layout logic. Children remain layout-agnostic.

#### See Also

- `renderChild` — accepts optional `layoutContext` parameter to pass layout information to child components during recursive rendering.
- `RendererContext.layoutContext` — exposes the current layout context to component renderers so they can adapt to parent layout.
- Stack component — creates layout contexts with `orientation` and `wrapChild` to control flex item rendering and spacing.
- `ComponentAdapter` — applies `layoutContext.wrapChild` after rendering components to wrap them in layout-specific elements.


### The `ValueExtractor` Function

`ValueExtractor` is a function type with typed methods for evaluating binding expressions in XMLUI component props. It extracts values from expressions like `{variableName}` or `{state.property}` by resolving them against component state and app context. The extractor memoizes results based on expression dependencies to avoid unnecessary re-computation and provides specialized methods for extracting typed values (strings, numbers, booleans, sizes) with validation and type coercion.

#### Behavior

- Core function `extractValue(expression, strict)` evaluates any expression type (string with bindings, objects, arrays, primitives) by parsing parameter strings, collecting variable dependencies, and resolving them from state/appContext. Returns the computed value.
- Memoizes expression evaluation using dependency tracking where each expression is parsed once to identify dependencies (variables it references). Subsequent evaluations only recompute when dependency values change using shallow comparison.
- Provides typed extraction methods including `asString` (coerce to string), `asNumber` (validate number or throw), `asBoolean` (JavaScript truthiness), `asOptionalNumber`/`asOptionalBoolean` (with default values), and `asSize` (parse CSS size values).
- Handles special string conversion via `asDisplayText` which preserves multiple spaces by converting consecutive spaces to non-breaking spaces (`\xa0`) for proper whitespace rendering in HTML.
- Supports array extraction via `asOptionalStringArray` which parses array syntax `["item1", "item2"]` from strings or coerces existing arrays to string arrays for consistent handling.
- Uses `extractParam` internally to resolve binding expressions like `{$item.name}` by looking up variables in state and appContext with support for dot notation property access.
- Parses CSS size values via `StyleParser` to handle theme variable references like `spacing.md` and converts them to CSS custom properties `var(--xmlui-spacing-md)` for theme-aware sizing.

#### See Also

- `createValueExtractor` — factory function that creates ValueExtractor instances with bound state, appContext, and memoization infrastructure.
- `RendererContext.extractValue` — the ValueExtractor instance provided to component renderers for evaluating prop expressions.
- `extractParam` — lower-level utility that resolves binding expressions by looking up variables in state/appContext.
- `collectVariableDependencies` — analyzes expression ASTs to determine which state variables an expression depends on for memoization.


### The `renderChild()` Function

`renderChild()` is the core recursive rendering function that transforms XMLUI component definitions into React elements. It handles special cases (TextNode, Slot, conditional rendering), evaluates component visibility via `when` conditions, extracts component keys for React reconciliation, and delegates to `ComponentWrapper` which routes components through the rendering pipeline. This function is the "jolly-joker" that makes the entire component tree recursive by passing itself to rendered components.

#### Behavior

- Evaluates `when` condition via `shouldKeep(node.when, state, appContext)` to determine component visibility. Returns null for components with false `when` conditions implementing conditional rendering.
- Handles `TextNode` components specially by extracting the text value via `extractParam` to resolve binding expressions like `{variableName}` in text content. Converts boolean values to strings for rendering.
- Handles `TextNodeCData` components by rendering the text value directly without expression evaluation or whitespace processing to preserve exact formatting including whitespace.
- Implements Slot transposition logic for compound components where named slots (ending with "Template") are resolved from parent props and unnamed slots use parent children. Falls back to default slot template when parent provides no content.
- Extracts component keys via `extractParam(state, node.uid, appContext, true)` to generate stable React keys for reconciliation. Keys can be expressions evaluated from state.
- Delegates actual rendering to `ComponentWrapper` by passing complete rendering context including state, dispatch, lookupAction, renderChild (itself for recursion), layoutContext, and cleanup functions.
- Receives `ChildRendererContext` parameter containing all rendering infrastructure (state, appContext, dispatch, callbacks) and passes it through the rendering chain to enable recursive component tree traversal.

#### See Also

- `ComponentWrapper` — receives nodes from renderChild and routes them to ContainerWrapper or ComponentAdapter based on state requirements.
- `shouldKeep` — evaluates `when` conditions to determine if components should render or return null for conditional rendering.
- `extractParam` — resolves binding expressions in component properties and keys for dynamic value extraction.
- `ChildRendererContext` — the context type containing all state, callbacks, and utilities needed for recursive rendering.
- Slot transposition — special handling for Slot components that transpose parent content into compound component templates.

