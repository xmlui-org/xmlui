import { OPTIMIZER_METADATA } from "../optimization/optimizer-metadata";

// XMLUI_GLOBAL_NAMES lives in the factory — the single source of truth.
// Re-exported here so the optimizer (computedUses) has a stable import path
// alongside UNSTABLE_GLOBAL_VARS.
export { XMLUI_GLOBAL_NAMES } from "./appContextFactory";

/**
 * A set of global state variables that are reference-unstable.
 * These variables are recreated frequently (e.g., new objects on every navigation).
 * Providing them implicitly to all containers breaks React.memo/useShallowCompareMemoize
 * optimizations, so they must be explicitly excluded from Implicit Pass-through (Layer 3)
 * unless explicitly requested via `computedUses`.
 */
export const UNSTABLE_GLOBAL_VARS = new Set<string>();

for (const meta of Object.values(OPTIMIZER_METADATA)) {
  const unstableVars = (meta as any).unstableChildInjectedVars;
  if (unstableVars) {
    for (const v of unstableVars) {
      UNSTABLE_GLOBAL_VARS.add(v);
    }
  }
}
