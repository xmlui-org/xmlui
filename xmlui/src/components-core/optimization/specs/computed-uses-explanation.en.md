# `computedUses` Architecture: Executive Summary

This document provides a high-level overview of the `computedUses` optimization mechanism developed for the XMLUI framework. The primary goal of this optimization is to prevent unnecessary component re-renders by providing components only with the state data they actually depend on.

## 1. Which variables does the framework collect for State Narrowing?

When the framework encounters a component tree, it does not pass the entire global or parent state down. Instead, it works "bottom-up" to collect a **minimum set of external dependencies**—variable names that are actually read or modified within a node and its children.

**Example:**
```xml
<App var.fast="{0}" var.slow="{1}">
  <Text value="Fast: {fast}" />
  <Select data="{slow}" /> <!-- This component receives only ["slow"] -->
</App>
```
As a result, when `fast` changes, the heavy `<Select>` component is unaware of the change and does not re-render.

## 2. Why are lexical variables (prefixed with `$`) collected?

Variables prefixed with a dollar sign (e.g., `$item` in a list, `$context`, `$props`) are lexical variables generated and "injected" by the framework on the fly.

- **During Static Analysis (Parsing):** The framework reads component metadata (e.g., `childInjectedVars: ["$item"]`) and **ignores** them when searching for dependencies in the parent state. This is because `$item` exists locally and does not come from above.
- **During Runtime:** When the scoped state is created, the framework has a special mechanism that **forcibly preserves** all variables starting with `$`, ensuring they aren't accidentally "stripped away" by the optimizer. Otherwise, a template inside an iterator would lose access to its current row data.

## 3. Why are functions and JS-standard functions like `JSON` tracked?

It's important to clarify: the framework **DOES NOT** collect standard functions!
It employs strict filters (`JS_STDLIB_GLOBALS` and `XMLUI_GLOBAL_NAMES`) to **exclude** from analysis:
- Standard JS objects: `Math`, `Array`, `Promise`, `JSON`, `fetch`, etc.
- Browser host globals: `window`, `document`, `navigator`.
- Built-in XMLUI functions: `Actions`, `navigate`, `toast`.

**Why is this important?** If the optimizer saw a call like `JSON.stringify(data)` or `Actions.callApi()` and treated `JSON` or `Actions` as part of the parent state, it would falsely expand dependencies. This would lead to the creation of unnecessary isolation containers (wasting memory). Therefore, the framework only tracks calls to **custom functions** defined by the developer in code or scripts.

## 4. Difference between Runtime and Vite Plugin analysis

The optimization operates in two distinct environments:

1. **Vite Plugin (Build-time):** Runs during the project build process in Node.js. To maintain high performance, it doesn't spin up a heavy React environment. It reads `.tsx` files as plain text, quickly parses them using Babel, and extracts the necessary optimizer metadata (`isImplicitContainerByDefault`, `childInjectedVars`).
2. **Runtime (Standalone/Browser):** Used when the application is running in the browser. It relies on a shared "live" metadata registry. A key feature of the runtime is that if scripts contain `import` statements, it performs a separate asynchronous pass to load them and then recalculates dependencies on the fly.

## 5. Untangling functions in `.xs` files (Recursive Parsing)

When a `<script>` or `.xs` file contains functions that call other functions, the framework untangles this web **recursively**.

It uses a Depth-First Search (DFS) algorithm. If function `A` calls function `B`, the analyzer dives into `B` and collects all its external dependencies for `A`.
To prevent infinite loops (e.g., `A` calls `B`, and `B` calls `A`), a `visited-set` mechanism is used to safely handle mutual recursion.

## 6. Why is there a separate mechanism for Global Variables?

A dedicated mechanism, `computedGlobalUses`, was developed for variables declared in `Globals.xs`.

Global variables live in their own separate React context, independent of parent component state. If we passed the entire global state object everywhere, an update to even one global variable (like `theme`) would force every component in the app to re-render.

`computedGlobalUses` collects only the global variables actually read by a specific subtree. This allows the framework to provide a component with a stable reference that triggers a re-render **only when** the specific global variable it depends on has changed.

## 7. Gaps and Future Plans (What is not yet optimized)

While the architecture covers most cases, some areas for improvement remain:

1. **Complex constructs in `.xs` scripts:** If top-level script code contains `if`, `for`, or direct function calls (flagged as `hasInvalidStatements`), the framework currently **completely disables** state narrowing for that component. The analyzer is currently too conservative and avoids the risk of missing a dependency.
2. **Extension Packages:** If a third-party extension package doesn't perfectly describe its lexical variables (e.g., forgets to add `childInjectedVars`), the framework will trigger a hard-fail error in development mode or fall back to a non-optimized state, subscribing the component to unnecessary data.
3. **The "Matryoshka" nesting problem:** Heavy components (like `<Select>` or `<Table>`), even if they are completely static and read no variables, still have a sub-optimal wrapper. Plans are in place to decouple their visual isolation (`React.memo`) from the state container mechanism to avoid empty wrappers in the tree.
4. **Asynchronous Import Resolution:** In Standalone mode, the presence of `import` temporarily blocks optimization until the imports are fetched over the network, requiring an additional dependency recalculation cycle before the first full render.