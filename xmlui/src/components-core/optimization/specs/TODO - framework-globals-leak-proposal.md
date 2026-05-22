# Proposal: Prevent Framework Globals from Triggering Container Promotion

## Background
The XMLUI `computedUses` AST scanner extracts identifiers from component expressions to determine which variables from the parent state the component depends on. It filters out JavaScript standard library globals (using `JS_STDLIB_GLOBALS`) because they are never present in the parent UI state.

However, **XMLUI Framework Globals** (e.g., `Actions`, `toast`, `Auth`, `App`, `Theme`, `Navigation`) are currently **not** filtered out.

## The Problem
When a component uses a framework global in its markup, the optimizer interprets it as a reactive dependency on the parent state. 
For example:
```xml
<Select onChange="Actions.callApi('save')" />
```
The AST scanner finds the identifier `Actions` and, because it is neither locally declared nor in `JS_STDLIB_GLOBALS`, adds it to `parentDependencies`.

While the eval engine safely resolves `Actions` via `localContext` (avoiding crash), the presence of `"Actions"` in the component's read dependencies (`nonDynamicReadDeps`) causes a severe architectural side effect: **False Promotion**.

Heavy components (marked with `isImplicitContainerByDefault: true` in metadata, like `Select`, `List`, `Table`) are automatically upgraded to full `StateContainer` instances if they have any read dependencies on external state. Because `Actions` is counted as an external read dependency, the `Select` is unnecessarily wrapped in a `StateContainer`.

## Negative Impact
1. **Structural Overhead**: Creates unnecessary `StateContainer` contexts, own reducer queues, and context intercepts for simple leaf components, increasing React tree depth and slowing down initialization.
2. **State Isolation / Lifecycle Bugs**: Implicit containers isolate their internal state lifecycle from siblings. The unnecessary container wrapper blocks `updateState` calls meant to clear or manipulate the `<Select>` from the outside, breaking intrinsic functionality (e.g., clearable state, value bubbling).

## Proposed Solution

1. **Do not hardcode globals in `computedUses.ts`**: The framework's list of global functions grows dynamically and is managed elsewhere (e.g., `AppContext` or global registries). Hardcoding it in the optimizer will quickly lead to drift.
2. **Export `XMLUI_GLOBAL_NAMES`**: Expose a `Set<string>` containing the names of all registered framework globals from the module responsible for global context initialization.
3. **Filter in `computedUses.ts`**: Import this set into the optimizer and update the exclusion check:

```typescript
// computedUses.ts
import { XMLUI_GLOBAL_NAMES } from "../../app-context/globals-registry";

const keepDep = (d: string) =>
  !localDeclared.has(d) && 
  !isBuiltinGlobal(d) && 
  !XMLUI_GLOBAL_NAMES.has(d) && 
  !isRuntimeContextVar(d);
```

This ensures that referencing an `Action` or `toast` never tricks the optimizer into promoting a component or isolating a state boundary.
