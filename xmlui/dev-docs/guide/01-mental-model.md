# Framework Mental Model & Request Lifecycle

Understanding XMLUI's architecture starts here. This document provides the conceptual map that connects every other subsystem. If you read only one document, make it this one.

## What Is XMLUI?

XMLUI is a **declarative-reactive frontend framework** where applications are written as XML markup instead of JavaScript or JSX. The framework parses `.xmlui` files, builds a component tree, composes state, evaluates expressions, and produces a React element tree — all automatically. Reactivity is built-in: when state changes, every expression that depends on it re-evaluates and the UI updates, like a spreadsheet.

Under the hood, XMLUI is built entirely on React. But users of the framework never interact with React directly — they write markup, and the framework handles the rest.

```xml
<App var.count="{0}">
  <Button onClick="count++">Count: {count}</Button>
</App>
```

When the user clicks the button, `count` increments, and the button label updates automatically. No manual state wiring, no `setState` calls, no effect hooks.

## The Two Deployment Modes

XMLUI apps can run in two modes. The choice is made at project creation time, not at runtime.

**Standalone (buildless)** — The app is served as static files. The browser loads `xmlui-standalone.umd.js`, which fetches `Main.xmlui`, discovers components from the `components/` directory, and parses everything at runtime. No build step needed. Deploy by copying files to any static web server. A special case of this mode is: **Islands** — lets you embed one or more independent XMLUI apps inside an arbitrary host web page (one that is not itself an XMLUI app). Each island is declared with a single HTML attribute:

```html
<div data-xmlui-src="./checkout-form"></div>
```

The value is a relative path to a folder containing a standard XMLUI project (`Main.xmlui`, optional `config.json`, `components/`, etc...). The standalone UMD bundle detects these markers on mounts a fully isolated XMLUI application into each one, instead of creating a #root div at the body and starting a standalone app there.

**Vite (built)** — The app uses Vite with the `vite-xmlui-plugin`. All `.xmlui` files are compiled to JavaScript modules at build time. The result is an optimized bundle with no runtime parsing. Used for production sites and when HMR during development is needed. Note: even in this mode, XMLUI expressions (`{...}`) and event handlers are still evaluated at runtime by the scripting engine — the build step eliminates XML parsing overhead, not expression interpretation.

Both modes converge once components are resolved. From `AppRoot` onward, the rendering pipeline is identical.

<!-- DIAGRAM: Side-by-side flow showing standalone (fetch → parse → AppRoot) vs Vite (import → compile → AppRoot) converging at the rendering pipeline -->

```mermaid
graph TB
  subgraph Standalone["Standalone mode"]
    S1["browser loads<br>xmlui-standalone.umd.js"]
    S2["fetch Main.xmlui<br>+ components/*.xmlui"]
    S3["parse XML at runtime"]
    S1 --> S2 --> S3
  end

  subgraph Vite["Vite mode"]
    V1["vite-xmlui-plugin<br>compiles .xmlui → JS modules"]
    V2["import.meta.glob()<br>pre-bundles all components"]
    V3["no runtime XML parsing"]
    V1 --> V2 --> V3
  end

  Converge["AppRoot —<br>rendering pipeline begins"]

  S3 -->|"components resolved"| Converge
  V3 -->|"components resolved"| Converge
```

## The Full Lifecycle

Here is what happens from the moment a user opens an XMLUI app to the moment pixels appear on screen, and then what happens when they interact.

| Phase                      | What happens                                                |
| -------------------------- | ----------------------------------------------------------- |
| 1. Bootstrap               | Components are resolved; provider stack is established      |
| 2. Provider stack          | React context providers are layered around the app          |
| 3. Rendering               | `renderChild()` recursively builds the React element tree   |
| 4. State composition       | `StateContainer` merges 6 layers into a flat state object   |
| 5. Expression evaluation   | `{expressions}` are evaluated against composed state        |
| 6. Interaction & re-render | User event → state mutation → routing → reducer → re-render |

### Phase 1: Bootstrap

The app starts in `StandaloneApp`, which:

1. **Resolves components** — In standalone mode, fetches `.xmlui` files from the server and parses them. In Vite mode, uses pre-compiled modules.
2. **Sets up API interception** — Optionally wraps the app in an `ApiInterceptorProvider` for mocked APIs.
3. **Enters AppRoot** — Wraps the entry point in a root `Container` and `Theme` node, then nests it inside the provider stack.

### Phase 2: Provider Stack

`AppRoot` and `AppWrapper` wrap the entire app in a series of React context providers. Each provider adds a capability:

```
ComponentProvider      → component registry (maps names to renderers)
  StyleProvider        → CSS-in-JS style registry
    DebugViewProvider  → debug configuration
      Router           → Hash, Browser, or Memory router (react-router-dom)
        QueryClient    → TanStack React Query (data fetching/caching)
          Helmet       → document head management (title, meta)
            Logger     → logging infrastructure
              Icons    → icon registry
                Theme  → theme context, tone (light/dark)
                  Inspector        → dev tools / tracing
                    Confirmation   → modal dialog support
                      AppContent   → global functions (navigate, toast, confirm)
                        ↓
                     Root Container → renderChild() begins
```

The router type is chosen based on configuration: `HashRouter` (default), `BrowserRouter` (when `useHashBasedRouting: false`), or `MemoryRouter` (SSR fallback or preview mode).

<!-- DIAGRAM: Nested provider stack as concentric rectangles, from outermost (ComponentProvider) to innermost (root Container) -->

```mermaid
graph LR
  subgraph CP["ComponentProvider"]
    subgraph SP["StyleProvider"]
      subgraph DP["DebugViewProvider"]
        subgraph R["Router (Hash / Browser / Memory)"]
          subgraph QC["QueryClient (TanStack React Query)"]
            subgraph H["Helmet (document head)"]
              subgraph L["Logger"]
                subgraph I["Icons"]
                  subgraph T["Theme"]
                    subgraph Insp["Inspector"]
                      subgraph Conf["Confirmation"]
                        subgraph AC["AppContent (global functions)"]
                          RC["Root Container<br>renderChild() begins"]
                        end
                      end
                    end
                  end
                end
              end
            end
          end
        end
      end
    end
  end
```

### Phase 3: Rendering

Rendering is driven by `renderChild()`, the recursive function at the heart of XMLUI. It is called for every node in the component tree.

**What renderChild does for each node:**

1. **Checks visibility** — Evaluates `when` and `responsiveWhen` conditions. If false, the node is skipped. (Exception: nodes with an `init` event handler render once to trigger initialization.)
2. **Handles special node types** — `TextNode` and `TextNodeCData` are evaluated and returned as text. `Slot` nodes resolve their children from the parent component.
3. **Wraps in ComponentWrapper** — All other nodes pass through `ComponentWrapper`, which applies a series of transformations and then routes the node to the correct renderer.

**What ComponentWrapper does:**

1. **Transforms the node** — Converts child `<DataSource>` elements to loader arrays, moves children to props when `childrenAsTemplate` is set, and resolves data props to DataSource components.
2. **Routes to the correct renderer:**
   - If the node has state (`vars`, `functions`, `uses`, or `loaders`), it goes through `ContainerWrapper` → `StateContainer` → `Container` → recursive `renderChild()`.
   - If the node is stateless, it goes directly to `ComponentAdapter` — no container overhead.

<!-- DIAGRAM: Flowchart: renderChild → when check → node type switch → ComponentWrapper → container-like? → ContainerWrapper or ComponentAdapter -->

```mermaid
graph TD
  Start(["renderChild(node)"])
  When{"when / responsiveWhen<br>condition true?"}
  Skip(["return null"])
  TypeSwitch{"node type?"}
  TextNode(["evaluate expression<br>return text"])
  SlotNode(["resolve slot children<br>from parent component"])
  CW["ComponentWrapper"]
  Transform["transform props<br>(DataSource, childrenAsTemplate)"]
  Stateful{"has vars / functions<br>/ uses / loaders?"}
  CWrap["ContainerWrapper<br>→ StateContainer → Container"]
  CAdapter["ComponentAdapter<br>(stateless path)"]
  Recurse(["recursive renderChild()<br>for each child"])

  Start --> When
  When -->|"false"| Skip
  When -->|"true"| TypeSwitch
  TypeSwitch -->|"TextNode / CData"| TextNode
  TypeSwitch -->|"Slot"| SlotNode
  TypeSwitch -->|"element"| CW
  CW --> Transform
  Transform --> Stateful
  Stateful -->|"yes"| CWrap
  Stateful -->|"no"| CAdapter
  CWrap --> Recurse
  CAdapter --> Recurse
```

### Phase 4: State Composition

When a node routes through `StateContainer`, the framework composes its state from six layers. Each layer can shadow values from the layer below it.

| Layer                | What it contains                                                                                          | Example                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1. Parent state      | State inherited from the parent container, scoped by the `uses` prop                                      | A parent's `userData` variable inherited by a child (when `uses="userData"` or `uses` is not set) |
| 2. Component reducer | Loader results, event progress flags, component state from `updateState`                                  | `DataSource` results, `submitInProgress` flag                                                     |
| 3. Component APIs    | Methods registered via `registerComponentApi()`                                                           | A TextBox's `value`, `focus()`, `clear()`                                                         |
| 4. Context variables | Iteration variables, routing params, slot properties                                                      | `$item`, `$itemIndex` inside an `<Items>` loop; `$pathname`, `$routeParams` in any component      |
| 5. Local variables   | Variables declared with `var.` or `<variable>` tags — resolved in two passes to handle forward references | `var.total="{price * quantity}"`                                                                  |
| 6. Global variables  | App-wide state owned by the root container and passed down                                                | Variables declared at the `<App>` level that are accessible everywhere                            |

The final merged state is a single flat object available to all expressions within that container's scope.

**Two-pass variable resolution** — Local variables (layer 5) are resolved in two passes. The first pass pre-resolves variables that may reference each other (forward references). The second pass finalizes all values using the pre-resolved context and a persistent memoization cache.

```xml
<App
  var.fullName="{firstName + ' ' + lastName}"
  var.firstName="John"
  var.lastName="Doe"
>
  <Text>{fullName}</Text>
</App>
```

`fullName` is declared before `firstName` and `lastName`, but it references both of them. Without two-pass resolution, `fullName` would evaluate before the others are ready, producing an undefined result. With two passes: pass 1 resolves `firstName` and `lastName` first; pass 2 uses those resolved values to evaluate `fullName` correctly as `"John Doe"`.

<!-- DIAGRAM: Stacked layers (1 at bottom, 6 at top) with arrows showing shadowing direction. Label each with concrete example. -->

```mermaid
graph BT
  L1["Layer 1 — Parent state<br>inherited via uses prop<br>e.g. userData from parent container"]
  L2["Layer 2 — Component reducer state<br>loader results, event flags<br>e.g. DataSource value, submitInProgress"]
  L3["Layer 3 — Component APIs<br>methods from id-registered children<br>e.g. myInput.focus(), myInput.setValue()"]
  L4["Layer 4 — Context variables<br>iteration and routing vars<br>e.g. $item, $itemIndex, $routeParams"]
  L5["Layer 5 — Local variables<br>declared with var.*<br>e.g. var.total = price * quantity"]
  L6["Layer 6 — Global variables<br>owned by root container<br>e.g. var.global.theme = 'dark'"]
  Combined(["combined state object<br>higher layers shadow lower layers"])

  L1 -->|"shadowed by L2"| L2
  L2 -->|"shadowed by L3"| L3
  L3 -->|"shadowed by L4"| L4
  L4 -->|"shadowed by L5"| L5
  L5 -->|"shadowed by L6"| L6
  L6 --> Combined
```

### Phase 5: Expression Evaluation

Every `{expression}` in the markup is evaluated against the composed state. The expression evaluator has access to:

- All variables from the 6-layer state
- Global functions from `AppContext` (`navigate()`, `toast()`, `formatDate()`, etc.)
- The scripting language (a JavaScript subset — no destructuring, no classes, no generators)

Expressions in props are evaluated **synchronously** during render. Event handlers are evaluated **asynchronously** when triggered.

### Phase 6: Interaction & Re-render

When the user interacts with the app:

1. A React event handler fires (e.g., the user clicks a button)
2. The handler is a cached function created by `Container`'s event handler subsystem
3. `runCodeAsync()` evaluates the handler's parsed statements against current state
4. If a statement modifies a variable (e.g., `count++`), `statePartChanged()` is called
5. **Mutation routing** determines which container owns the variable:
   - Local variable → dispatch locally
   - Global variable → bubble to root container
   - Component state → dispatch locally
   - Otherwise → bubble to parent (if `uses` boundary allows)
6. The owning container's reducer processes the `STATE_PART_CHANGED` action via immer
7. React re-renders the container subtree
8. `renderChild()` re-evaluates expressions that depend on the changed variable
9. The DOM updates

<!-- DIAGRAM: Circular flow: User clicks → event handler → statePartChanged → mutation routing → reducer → re-render → renderChild → DOM update → back to user -->

```mermaid
sequenceDiagram
  actor User
  participant DOM
  participant Handler as event handler
  participant Proxy
  participant SPC as statePartChanged
  participant Reducer
  participant React
  participant RC as renderChild

  User->>DOM: clicks / types / interacts
  DOM->>Handler: React synthetic event fires
  Handler->>Proxy: mutates variable (e.g. count++)
  Proxy->>SPC: callback(["count"], newVal)
  SPC->>SPC: find owning container
  SPC->>Reducer: dispatch STATE_PART_CHANGED
  Reducer->>React: new immutable state (Immer)
  React->>RC: re-render container subtree
  RC->>RC: re-evaluate {expressions}
  RC->>DOM: updated React elements → DOM update
  DOM->>User: UI reflects new state
```

## Containers: The Unit of State

A **container** is the fundamental unit of state isolation in XMLUI. Every component that has variables, functions, or data loaders gets wrapped in a container.

Each container is implemented as two cooperating React components with distinct responsibilities:

- **`StateContainer`** — owns the _data_. It composes the 6-layer state (parent state, reducer state, component APIs, context variables, local variables, routing params) and provides the merged state object to everything below it.
- **`Container`** — owns the _behaviour_. It receives the composed state from `StateContainer` and is responsible for creating event handlers, caching them, resolving action lookups, and calling `renderChild()` to produce the children.

In other words: `StateContainer` answers _"what is the current state?"_, and `Container` answers _"what do I render and what happens when the user acts?"_.

**Explicit containers** — Created when a node declares `vars`, `functions`, `uses`, or `loaders`. Gets its own `StateContainer` + `Container` pair with an independent reducer.

**Implicit containers** — The framework automatically wraps user-defined components in containers for instance isolation. Implicit containers delegate their `dispatch` and `registerComponentApi` to the parent.

This is why multiple instances of the same user-defined component each have independent state:

```xml
<App>
  <Counter />  <!-- has its own count -->
  <Counter />  <!-- has its own count -->
  <Counter />  <!-- has its own count -->
</App>
```

Each `<Counter>` gets its own container, so `count` in one does not affect the others.

## The Reducer

Each container has a reducer (created by `createContainerReducer()`) that processes state mutations. The reducer uses immer's `produce()` — all mutations are immutable under the hood.

The key action types are:

| Action                                          | When it fires                        | What it does                                                          |
| ----------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| `LOADER_LOADED`                                 | DataSource returns data              | Updates `state[uid].value`, builds `byId` lookup, sets `loaded: true` |
| `LOADER_ERROR`                                  | DataSource fails                     | Sets `error`, marks `loaded: true`                                    |
| `STATE_PART_CHANGED`                            | Expression assigns to a variable     | Path-based update via immer `setWith()`                               |
| `COMPONENT_STATE_CHANGED`                       | Native component calls `updateState` | Merges new state into `state[uid]`                                    |
| `EVENT_HANDLER_STARTED` / `COMPLETED` / `ERROR` | Event handler lifecycle              | Tracks `${eventName}InProgress` flags                                 |

## Global Functions (AppContext)

`AppContext` provides a global object available in all expressions. Key capabilities:

- **Navigation**: `navigate(path)`, `goBack()`
- **Feedback**: `toast.success(msg)`, `toast.error(msg)`, `confirm(msg)`
- **Actions**: `Actions.callApi()`, `Actions.download()`, `Actions.upload()`
- **Date/Math**: `formatDate()`, `getDate()`, `avg()`, `sum()`, `min()`, `max()`
- **Storage**: `getLocalStorage(key)`, `setLocalStorage(key, value)`

## Essential Reference

A quick-reference table of the most important types and functions mentioned in this document.

| Name                       | Kind            | Role                                                                                                                                                 |
| -------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StandaloneApp`            | React component | App entry point — resolves components, sets up API interception, enters `AppRoot`                                                                    |
| `AppRoot`                  | React component | Wraps the app in `ComponentProvider`, `StyleProvider`, and `AppWrapper`                                                                              |
| `AppWrapper`               | React component | Adds Router, ThemeProvider, IconProvider, InspectorProvider, and `AppContent`                                                                        |
| `ComponentDef`             | TypeScript type | Parsed representation of one XML element: `type`, `props`, `events`, `children`, `vars`, `loaders`, `when`, `uses`                                   |
| `CompoundComponentDef`     | TypeScript type | A user-defined component: `name` + template tree + optional `script`                                                                                 |
| `ComponentRendererDef`     | TypeScript type | Registry entry mapping a component type name to its renderer function and metadata                                                                   |
| `RendererContext`          | TypeScript type | Passed to every renderer function: `node.props`, `state`, `extractValue`, `renderChild`, `lookupEventHandler`, `updateState`, `registerComponentApi` |
| `renderChild()`            | Function        | Recursive rendering core — evaluates `when`, handles text/slot nodes, delegates to `ComponentWrapper`                                                |
| `ComponentWrapper`         | React component | Transforms node props, then routes to `ContainerWrapper` (stateful) or `ComponentAdapter` (stateless)                                                |
| `StateContainer`           | React component | Composes the 6-layer state and provides it to `Container`                                                                                            |
| `Container`                | React component | Creates event handlers, action lookup, and the stable `renderChild` closure; renders children and loaders                                            |
| `createContainerReducer()` | Function        | Produces the immer-based reducer for a container's state mutations                                                                                   |
| `statePartChanged()`       | Callback        | Routes a variable mutation to the owning container via `STATE_PART_CHANGED` dispatch                                                                 |
| `AppContextObject`         | TypeScript type | The global utilities object: `navigate`, `toast`, `confirm`, `Actions`, date/math/storage helpers                                                    |
| `registerComponentApi()`   | Callback        | Registers imperative methods (e.g. `focus()`, `clear()`) on a native component so markup can call them                                               |
| `updateState()`            | Callback        | Called by a native component to push its internal state (e.g. a TextBox's current value) into the container                                          |

## Key Takeaways

1. **XMLUI is React underneath** — but the abstraction layer (containers, renderers, expression evaluation) is what you work with as a framework developer.
2. **`renderChild()` is the recursive heart** — it drives the entire rendering pipeline.
3. **Containers are the unit of state** — every component with vars/loaders/functions gets one. State is composed from 6 layers.
4. **Mutation routing is automatic** — writing to a variable routes the change to the correct container, whether local, parent, or global.
5. **The provider stack is deep but stable** — 12+ providers wrap the app. You rarely modify them but need to know they exist.
6. **Two modes, one pipeline** — Standalone and Vite modes only differ in how components are discovered and parsed. The rendering pipeline is the same.
