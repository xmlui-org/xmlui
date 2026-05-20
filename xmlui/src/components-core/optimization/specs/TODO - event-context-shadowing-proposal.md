# Proposal: Resolving Context Variable Namespace Collisions via Event Context Registry (Shadowing)

## 1. The Problem: "Bug 21", Identifier Ambiguity, and the Danger of Renaming

In the XMLUI framework, context variables (prefixed with `$`) are used to pass data down the component tree or into event handlers. A severe namespace collision exists:
- The **Router** exposes current URL query strings globally as `$queryParams` (part of `ROUTING_STATE_KEYS`).
- The **DataSource/DataLoader** injects local fetch parameters into the `onFetch` event handler, *also* named `$queryParams` (along with `$url`, `$method`, etc.).

### Why the current fix is brittle
The `computedUses` optimization relies on static AST traversal to determine parent-state dependencies. Because it couldn't tell if `$queryParams` in `onFetch` was global or local, a brittle "hack" was added: `DATA_FETCH_HANDLER_INJECTED_KEYS`. The system manually plucks the `fetch` event out of AST traversal and forces it to ignore those specific keys. This approach introduces hardcoded components (`DataLoader`/`DataSource`) into a core generic optimization system.

### Why renaming is a Breaking Change
An initial proposal suggested renaming local fetch parameters to `$requestQueryParams`, `$requestUrl`, etc. However, this is a **severe breaking change** that would silently break all existing customer applications where `<DataSource onFetch="return $url + '?' + $queryParams.id" />` is used.

## 2. Proposed Solution: Shadowing via Component Metadata

Instead of forcing users to rewrite their code or hardcoding exceptions into `computedUses.ts`, we should "teach" the framework what variables are injected by each specific event. 

By registering injected local context variables (like `$queryParams` in `onFetch`) inside the component's metadata, `computedUses` can dynamically "shadow" (override) the global variables when parsing those specific handlers. This way, `$queryParams` in `onFetch` is recognized as a local injection, while `$queryParams` in `url="..."` remains a global router dependency.

### The Mechanism
1. Components declare which `$`-prefixed variables their events inject.
2. During the Bottom-Up AST traversal, `computeUsesInternal` checks the metadata for the property it's parsing.
3. If it's parsing an event that reports `injectedVars: ["$url", "$queryParams"]`, the parser temporarily adds these variables to `localDeclared`.
4. This shadows the root global identifiers organically, preventing the component from becoming a "false implicit container" that leaks onto routing state.

## 3. Implementation Plan

### Step 1: ComponentMetadata Extension
Enhance the existing `EventDescriptor` type in the component abstractions to accept an array of strings representing variables it injects:
```typescript
export interface EventDescriptor {
  description?: string;
  injectedVars?: string[]; // e.g. ["$url", "$method", "$queryParams", "$requestBody"]
}
```

### Step 2: Implement Metadata Registry in Data Components
Update the metadata definitions for `DataSource` and `DataLoader` (e.g., `DataSourceMd`):
```typescript
events: {
  fetch: {
    description: "Fires when data needs to be fetched.",
    injectedVars: ["$url", "$method", "$queryParams", "$requestBody", "$requestHeaders", "$pageParams"]
  }
}
```

### Step 3: Remove the "Bug 21" Workaround (Cleanup)
Clean up `xmlui/src/components-core/optimization/computedUses.ts`:
- Delete the `DATA_FETCH_HANDLER_INJECTED_KEYS` constant array entirely.
- Delete the hardcoded extraction of the `fetch` event and the `node.type === "DataLoader"` exclusions.
- Update `processChildList` / `addEvent` helper function so it references the `ComponentDef`'s schema (specifically its `EventDescriptor`) to pick up `injectedVars` dynamically and push them into `localDeclared` while processing the AST of that specific event handler.

### Step 4: Add Metadata to Future Components (Future-Proofing)
Any new components involving callbacks or iterators (e.g., a hypothetical `<List onRowClick="...">` exposing `$rowId`) simply register `injectedVars: ["$rowId"]` in their metadata. No core framework code will ever need to be touched again to handle this.

## 4. Safeguards Against Developer Error (Enforcement)
Relying on developers to remember to add `injectedVars` to metadata is risky. To enforce this contract, we will add a **Development Mode Runtime Guard**:

Inside the framework's event dispatch core (where the context object is passed to user expressions), add a development-only verification:
```typescript
if (process.env.NODE_ENV === "development") {
  const injectedKeys = Object.keys(eventContext).filter(k => k.startsWith("$"));
  const declaredVars = componentMetadata?.events?.[eventName]?.injectedVars || [];
  const missing = injectedKeys.filter(k => !declaredVars.includes(k));
  
  if (missing.length > 0) {
    console.error(
      `[XMLUI Optimization Guard] Component '${componentName}' emits event '${eventName}' ` +
      `with unregistered context variables: ${missing.join(", ")}.\n` +
      `You MUST declare them in the component's metadata under 'injectedVars' ` +
      `to prevent false state dependencies in computedUses.`
    );
  }
}
```
This guarantees immediate developer feedback if a new framework component violates the context variable contract.

## 5. Impact
- **Zero Breaking Changes:** All user code continues to read `$queryParams` smoothly.
- **Architectural Purity:** `computedUses.ts` becomes a generic engine blind to specific component implementations.
- **Improved DX/Documentation:** Future documentation tools can extract `injectedVars` to auto-generate docs detailing exactly what parameters are available to each event handler.
