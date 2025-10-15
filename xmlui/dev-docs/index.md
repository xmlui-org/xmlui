# XMLUI Developer Guide

This article helps you understand the implementation details of xmlui so that you can contribute to developing it. We suggest going through these documentation sections, following their order:

**Repository and Build**
- [XMLUI Repository Structure](./xmlui-repo.md)
- [Building the XMLUI Core Package](./build-xmlui.md)
- [XMLUI Build System](./build-system.md)

**Fundamentals**
- [React Fundamentals](./react-fundamentals.md)
- [Standalone Rendering Architecture](./standalone-app.md)
- [Container-Based State Management](./containers.md)
- ...

Topics to elaborate on:

- **How deployment and build systems work** ✓ _[standalone-app.md, build-system.md, build-xmlui.md, xmlui-repo.md]_
  - File structure requirements for each deployment mode ✓
  - Buildless mode: runtime source file fetching, on-demand parsing, and zero-config deployment ✓
  - Built mode: compile-time transformation, Vite plugins, HMR, and production optimization ✓
  - How `StandaloneApp` and `useStandalone` handle both modes ✓
  - Performance trade-offs and choosing the right deployment mode ✓
  - CLI commands: xmlui start, build, preview, build-lib, zip-dist ✓
  - Build modes: CONFIG_ONLY, INLINE_ALL, ALL for component bundling ✓
  - Vite plugin system: .xmlui/.xmlui.xs transformation pipeline ✓
  - Core package builds: library (npm), standalone (UMD), metadata (docs/LSP) ✓
  - Extension builds: development workflow, distribution, package structure ✓
  - Monorepo architecture: workspaces, Turborepo orchestration, task dependencies ✓
  - CI/CD integration: caching, parallel execution, changesets version management ✓
  - Migration path from buildless to built mode

- **How the rendering pipeline works** ✓ _[standalone-app.md]_
  - Parsing .xmlui markup and .xmlui.xs code-behind files into ComponentDef structures ✓
  - Component registry: mapping component names to renderer functions (core → user → extensions) ✓
  - The renderChild() "jolly-joker" function: recursive component tree traversal and rendering ✓
  - ComponentWrapper → ContainerWrapper → ComponentAdapter collaboration chain ✓
  - RendererContext creation and propagation to component renderers ✓
  - Expression evaluation and data binding resolution ✓
  - Error handling, fallback rendering, and ErrorBoundary integration ✓

- **How user-defined components work** ✓ _[containers.md]_
  - Component definition with `<Component name="...">` syntax ✓
  - Automatic instance container creation for each usage and instance isolation ✓
  - Props passing and property binding to instances ✓
  - Slot mechanism: named slots, default slots, template transposition, and content projection ✓
  - Component reusability and composition patterns
  - Communication between component instances via APIs ✓

- **How container-based state management works** ✓ _[containers.md]_
  - Automatic container wrapping: isContainerLike() detection logic ✓
  - Container hierarchy mirroring component structure ✓
  - Five layers of state composition: parent state, component APIs, local variables, context variables, routing ✓
  - Component identification with Symbols and API registration ✓
  - State inheritance and the uses property for explicit scoping ✓
  - ContainerState structure and useCombinedState() merging ✓

- **How reactive state changes are detected and propagated** ✓ _[containers.md]_
  - Proxy-based change detection: buildProxy() intercepting get/set operations ✓
  - Path tracking and dispatching STATE_PART_CHANGED actions ✓
  - Reducer-based state updates: ContainerActionKind enum and Immer integration ✓
  - Deep object/array mutation handling with Lodash setWith() ✓
  - Variable dependency tracking and memoization with useVars() ✓
  - Performance optimization: selective recalculation and preventing unnecessary re-renders ✓

- **How data loading and API operations work** ✓ _[standalone-app.md, containers.md]_
  - ApiBoundComponent detection of DataSource, APICall, FileUpload, FileDownload ✓
  - Automatic loader creation and state management (loading, loaded, error states) ✓
  - Loader integration with container reducer: LOADER_LOADED, LOADER_ERROR actions ✓
  - React Query integration: cache configuration, invalidation, stale-while-revalidate
  - Request/response transformation, authentication, and error handling
  - ApiInterceptorProvider: request mocking, stubbing, and instrumentation ✓

- **How scripts and variables integrate with reactive state** ✓ _[containers.md]_
  - Inline `<script>` tags and code-behind files (.xmlui.xs) ✓
  - Variable and function declarations becoming reactive state ✓
  - Dependency injection and execution timing ✓
  - Expression evaluation: extractValue function, variable resolution, operators ✓
  - Context variables: $ prefix convention, routing, iterators, forms, events ✓
  - TypeScript support and error handling

- **How routing and navigation work** ✓ _[containers.md]_
  - Router provider integration (BrowserRouter/HashRouter/MemoryRouter) ✓
  - Route parameter extraction and query string parsing ✓
  - Routing context variables: $pathname, $routeParams, $queryParams, $linkInfo ✓
  - Navigation triggering container updates and URL state synchronization ✓
  - AppContext global functions: navigate, toast, confirm ✓
  - Programmatic navigation and History API interaction ✓

- **How styling and theming work** ✓ _[standalone-app.md]_
  - CSS-in-JS architecture with StyleProvider ✓
  - Theme object structure, theme variables, and ThemeProvider context ✓
  - Theme switching and dynamic updates
  - Style precedence, override rules, and responsive styling
  - Dark mode and color scheme support
  - Integration with CSS modules and global styles

- **How the provider infrastructure works** ✓ _[standalone-app.md]_
  - AppWrapper provider stack: Router, QueryClient, Helmet, Logger, Icon, Theme, Inspector, ConfirmationModal ✓
  - Provider composition, nesting order, and initialization dependencies ✓
  - AppContext: global functions, environment info, viewport management ✓
  - AppStateContext: bucket-based state organization to avoid prop drilling ✓
  - ComponentProvider: exposing component registry through context ✓

- **How component lifecycle and resource management work** ✓ _[containers.md]_
  - Container mounting, initialization, and component state sequence ✓
  - useEffect hooks for lifecycle management ✓
  - Unmounting, cleanup callbacks, and resource disposal (subscriptions, timers, loaders) ✓
  - Parent-child lifecycle coordination ✓
  - Memory leak prevention and hot module replacement

- **How development and debugging tools work** ✓ _[standalone-app.md]_
  - DebugViewProvider configuration and debug logging ✓
  - Inspector panel and component tree visualization ✓
  - State inspection in React DevTools
  - ComponentDecorator: test IDs, inspection attributes, accessibility ✓
  - Error boundaries: catching errors, graceful degradation, custom error UI ✓
  - Performance profiling, network monitoring, and hot reload
  - Extension manager: third-party component registration and debugging ✓