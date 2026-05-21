# TODO: Metadata Validation for Injected Variables

**Status:** Proposed / Research
**Related Spec:** [2026-05-21-lexical-scoping-design.md](./2026-05-21-lexical-scoping-design.md)

## Problem Statement
The new lexical scoping mechanism relies on developers manually declaring `injectedVars` (for events) and `childInjectedVars` (for containers) in component metadata. 
**Human error (forgetting to add a variable) leads to:**
1. **Oversubscription:** Components re-render when they shouldn't.
2. **Infinite Loops:** Especially in `DataLoader` when `$queryParams` is missing from metadata.
3. **Silent Bugs:** These issues don't crash the app but degrade performance and reliability.

---

## Proposed Validation Approaches

### 1. Development-Time Runtime Validation (Recommended)
Add a check in the central `Context` / `State` injection logic that runs only in `__DEV__` mode.

*   **Mechanism:** When a component attempts to inject a variable starting with `$` into its children or an event scope, the system looks up its metadata. If the variable is not found in `childInjectedVars` or `injectedVars`, a `console.warn` is issued.
*   **Pros:** 
    *   Immediate feedback during development.
    *   Zero overhead in production.
    *   Easy to implement in a single bottleneck function.
*   **Cons:** Requires the app to be running to catch the issue.

### 2. Static Analysis "Audit Test"
A specialized unit test that scans the codebase for usage of `$`-prefixed variables.

*   **Mechanism:** A script using RegEx or AST parsing searches for `dispatch(..., { $var })` or `context.set('$var')` calls in component source files and compares them with the corresponding `.metadata.ts` files.
*   **Pros:** 
    *   Catches errors before the code is even run.
    *   Perfect for CI/CD pipelines.
*   **Cons:** 
    *   Static analysis can be complex/flaky with dynamic code.
    *   Requires maintenance of the "scanner" logic.

### 3. Execution Discrepancy Detection
A "smart" check during expression evaluation.

*   **Mechanism:** When `evaluator.ts` resolves a variable (e.g., `{$item}`), it checks if that variable was marked as a "parent dependency" by the `computedUses` optimizer. If the evaluator finds the variable in the **local scope** but the optimizer thought it was **parent state**, it flags a mismatch.
*   **Pros:** 
    *   The most accurate "High Signal" warning (detects actual logic mismatches).
*   **Cons:** 
    *   Architecturally complex to link the optimizer's static output with the runtime evaluator's state.

---

## Final Recommendation: Approach 1 (Runtime Validation)

**Why:** 
It provides the best balance between implementation effort and developer impact. In XMLUI, most context injections go through a few core functions. Adding a `console.warn` there will "scream" at the developer the moment they test their new component, making it nearly impossible to forget the metadata update.

## Implementation Steps (Next Steps)
- [ ] Identify the central "context-setting" function in `xmlui/src/components-core`.
- [ ] Add a `__DEV__` block to check against `ComponentMetadata`.
- [ ] Create a standardized warning message with a link to the "How to fix" documentation.
