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
- [Theming and Styling Architecture](./theming-styling.md)
- ...

**Rendering Techniques**
- [Component Behaviors](./component-behaviors.md)
- [User-Defined Components](./ud-components.md)
- [Components with Options](./components-with-options.md)
- [Data Operations](./data-operations.md)
- [XMLUI Form Infrastructure](./form-infrastructure.md)
- ...

**Conventions to use with AI**
- [Creating XMLUI Components](./conv-create-components.md)
- [Testing XMLUI Components]()

Topics to elaborate on:

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