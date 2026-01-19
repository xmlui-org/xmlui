# XMLUI Execution and Reactivity Model

This document summarizes the internal mechanisms of how XMLUI handles state execution, variable resolution, and reactivity, based on the codebase analysis of `StateContainer`, `Container`, and the Script Runner subsystem.

## 1. State Composition & Management

The core of state management resides in `StateContainer.tsx`. It acts as the orchestration layer that assembles the final state available to a component from multiple sources.

### State Pipeline
The component state is composed in a specific priority order (lowest to highest):
1.  **Parent State**: Inherited from the parent container, filtered by the `uses` property (which acts as a boundary).
2.  **Component Internal State**: Managed by the container's reducer (e.g., loader states, internal flags).
3.  **Component APIs**: Methods exposed by child components (registered via `registerComponentApi`).
4.  **Context Variables**: Framework-injected variables (e.g., `$item`, `$index` from iteration components).
5.  **Local Variables (`vars`)**: Defined in `ComponentDef`. These have the highest priority and can shadow parent state.
6.  **Routing Parameters**: Global app context like `$routeParams` and `$queryParams`.

## 2. Variable Resolution Strategy

Local variables (`vars` in `ComponentDef`) are resolved in `StateContainer` using the `useVars` hook. This process handles dependencies between variables (e.g., `var A` depending on `var B`).

### Two-Pass Resolution
To support forward references (e.g., a function defined early referencing a variable defined later), resolution happens in two passes:
1.  **Pre-resolution Pass**: Resolves variables using the current available state. This captures references but values might be provisional.
2.  **Final Resolution Pass**: Re-resolves variables with the context populated from the first pass, ensuring all inter-variable dependencies are satisfied.

### Expression Evaluation
Variables in `ComponentDef` can be:
-   **Literal Values**: Strings, numbers, booleans (returned as-is).
-   **Expression Objects (AST)**: Pre-parsed syntax trees (JSON objects with a `type` field matching `ScriptingNodeTypes`).

The system uses `evalBinding` (from `eval-tree-sync.ts`) to execute these Expressions against the current `BindingTreeEvaluationContext`.

## 3. Reactivity and Dependency Tracking

XMLUI employs a fine-grained reactivity system to minimize re-renders.

### Dependency Collection
Before evaluating a variable or expression, the system calculates its dependencies:
-   **Static Analysis**: `collectVariableDependencies` (in `visitors.ts`) traverses the AST of an Expression to find all identifiers it accesses.
-   **Memoization**: `memoedVars` in `StateContainer` caches these dependencies. `getDependencies` is memoized to avoid re-traversing the AST unless the definition changes.

### efficient Updates
-   **Value Extraction**: `extractParam` is used to resolve properties. It checks if a value is a literal or an Expression.
-   **Reactivity**: When a part of the state changes (`statePartChanged`), the system determines which downstream variables or components depend on that changed state.
-   `StateContainer` uses `memoizeOne` for the `obtainValue` function, which only re-evaluates a variable if its specific dependencies (e.g., `deps`, `appContextDeps`) have changed according to a shallow comparison.

## 4. Pre-parsing Architecture

The system has moved away from parsing binding strings at runtime (client-side) to handling pre-parsed ASTs generated at build/transform time.

### ComponentDef Structure
-   Fields like `vars`, `props`, `when`, and `events` in `ComponentDef` are no longer just strings.
-   They can hold **Expression Objects**: deeply nested JSON structures representing the syntax tree (e.g., `{ type: T_BINARY_EXPRESSION, left: ..., right: ... }`).

### Handling Expressions vs. Literals
Components and utilities (like `StateContainer` and `extractParam`) distinguish between:
1.  **Expressions**: identified by being plain objects with a numeric `type` field (corresponding to `ScriptingNodeTypes`). These are evaluated.
2.  **String Literals**: Treated as constant string values (no longer parsed as potential binding expressions).

This shift improves performance by removing the parsing overhead from the client and allows for more robust build-time validation.

## 5. Event Execution

Event handlers are defined as `ArrowExpression` ASTs.
-   **Execution**: Handled by `Container` (via `runCodeAsync`).
-   **Context**: Handlers run in a `BindingTreeEvaluationContext` that includes the component's local state, app context, and event arguments.
-   **Immutability**: Since ASTs are objects passed by reference, care is taken (e.g., cloning) to ensure the execution engine does not mutate the original definition, preventing state pollution across multiple event firings.
