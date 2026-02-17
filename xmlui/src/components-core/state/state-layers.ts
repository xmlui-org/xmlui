/**
 * State Layer Composition Module
 *
 * Documents and implements the 6-layer state composition pipeline used by StateContainer.
 *
 * LAYER OVERVIEW:
 * 1. Parent State (scoped by `uses` property)
 * 2. Component Reducer State
 * 3. Component APIs (exposed methods)
 * 4. Context Variables (framework-injected)
 * 5. Local Variables (vars, functions, script)
 * 6. Final State with Routing Parameters
 *
 * PRIORITY ORDER (later overrides earlier):
 * Parent State < Component State < Context Vars < Local Vars
 * Routing Parameters are additive (always available)
 *
 * Part of StateContainer.tsx refactoring - Step 6
 */

/**
 * STATE COMPOSITION PIPELINE DIAGRAM
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 1. Parent State (scoped by `uses` property)                │
 * │    - Inherited from parent container                       │
 * │    - Filtered by `uses` property if present (boundary)     │
 * └──────────────────────┬──────────────────────────────────────┘
 *                        ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 2. Component Reducer State                                  │
 * │    - Managed by container's reducer                        │
 * │    - Contains loader states, event lifecycle flags         │
 * └──────────────────────┬──────────────────────────────────────┘
 *                        ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 3. Component APIs (exposed methods)                        │
 * │    - Methods exposed by child components                   │
 * │    - Registered via registerComponentApi callback          │
 * └──────────────────────┬──────────────────────────────────────┘
 *                        ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 4. Context Variables (framework-injected)                 │
 * │    - Special variables like $item, $itemIndex             │
 * │    - Provided by parent components (e.g., DataTable row)   │
 * └──────────────────────┬──────────────────────────────────────┘
 *                        ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 5. Local Variables (vars, functions, script)              │
 * │    - Declared in component definition                     │
 * │    - Resolved in two passes for forward references        │
 * │    - Highest priority (can shadow parent state)           │
 * └──────────────────────┬──────────────────────────────────────┘
 *                        ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 6. Routing Parameters (app-level context)                 │
 * │    - Added last, always available                         │
 * │    - Examples: $pathname, $routeParams, $hash             │
 * └──────────────────────┬──────────────────────────────────────┘
 *                        ↓
 *                  FINAL COMBINED STATE
 *
 * EXAMPLE - Multi-level composition:
 *
 * Parent Container (parentState):
 * { user: { id: 1, name: "John" }, count: 0 }
 *
 * <Stack uses="['user']" var.count="{10}">
 *   - Parent State (after scoping): { user: { id: 1, name: "John" } }
 *   - Local vars: { count: 10 }
 *   - Result: { user: { id: 1, name: "John" }, count: 10 }
 *
 *   CONTRAST: Without 'uses':
 *   <Stack var.count="{10}">
 *   - Parent State (no scoping): { user: { id: 1, name: "John" }, count: 0 }
 *   - Local vars: { count: 10 }
 *   - Result: { user: { id: 1, name: "John" }, count: 10 } (local vars override)
 *
 * DEBUGGING TIPS:
 * - Enable debug mode on component: <Stack debug>
 * - Check debugView.stateTransitions for state changes
 * - Each level can be inspected in React DevTools
 * - Variable resolution errors logged to console
 */

import { useMemo } from "react";
import { cloneDeep, isPlainObject, merge } from "lodash-es";
import type { ContainerState } from "../../abstractions/ContainerDefs";
import type { ComponentApi } from "../../abstractions/ApiDefs";
import { useShallowCompareMemoize } from "../utils/hooks";
import { EMPTY_OBJECT } from "../constants";

/**
 * Merges component APIs into component state.
 *
 * Component APIs are methods exposed by child components (e.g., getSelectedRows()).
 * They are stored using Symbol keys for the component UID, but we also expose them
 * via string keys using the component's UID description for easier access.
 *
 * @param componentState - Current component state from reducer
 * @param componentApis - Map of component UIDs to their exposed APIs
 * @returns Merged state with API methods available via both Symbol and string keys
 */
export function mergeComponentApis(
  componentState: Record<string | symbol, any>,
  componentApis: Record<symbol, ComponentApi>,
): Record<string | symbol, any> {
  const ret = { ...componentState };

  // Add string keys for component state symbols (for easier access)
  for (const stateKey of Object.getOwnPropertySymbols(componentState)) {
    const value = componentState[stateKey];
    if (stateKey.description) {
      ret[stateKey.description] = value;
    }
  }

  // If no APIs are registered, skip merge
  if (Reflect.ownKeys(componentApis).length === 0) {
    return ret;
  }

  // Merge component APIs into state
  for (const componentApiKey of Object.getOwnPropertySymbols(componentApis)) {
    const value = componentApis[componentApiKey];
    if (componentApiKey.description) {
      const key = componentApiKey.description;
      ret[key] = { ...(ret[key] || {}), ...value };
    }
    ret[componentApiKey] = { ...ret[componentApiKey], ...value };
  }

  return ret;
}

/**
 * Documentation of the state layer composition sequence.
 *
 * This is a reference for understanding how StateContainer assembles its final state.
 * The actual composition happens in StateContainer.tsx using React hooks and memoization.
 *
 * LAYER 1: Parent State Scoping
 * - Uses extractScopedState() to filter parent state by `uses` property
 * - Creates state boundary when `uses` is defined
 *
 * LAYER 2: Component Reducer State
 * - Managed by useReducer with containerReducer
 * - Contains loader states, event lifecycle flags
 *
 * LAYER 3: Component APIs
 * - Uses mergeComponentApis() to add exposed methods
 * - APIs registered via registerComponentApi callback
 *
 * LAYER 4: Context Variables
 * - Combined using useCombinedState() utility
 * - Adds framework-injected variables ($item, $itemIndex, etc.)
 *
 * LAYER 5: Local Variables
 * - Two-pass resolution for forward references
 * - Highest priority layer (can shadow parent state)
 *
 * LAYER 6: Final Combination
 * - Adds routing parameters ($pathname, $routeParams, etc.)
 * - Uses useCombinedState() to merge all layers
 */
export const STATE_LAYER_DOCUMENTATION = {
  layers: [
    {
      name: "Parent State Scoping",
      priority: 1,
      description: "Inherited from parent, filtered by 'uses' property",
    },
    {
      name: "Component Reducer State",
      priority: 2,
      description: "Loader states and event lifecycle flags",
    },
    {
      name: "Component APIs",
      priority: 3,
      description: "Methods exposed by child components",
    },
    {
      name: "Context Variables",
      priority: 4,
      description: "Framework-injected variables like $item",
    },
    {
      name: "Local Variables",
      priority: 5,
      description: "Component vars, functions, script (highest priority)",
    },
    {
      name: "Routing Parameters",
      priority: 6,
      description: "App-level context, always available",
    },
  ],
} as const;

// ============================================================================
// STATE COMPOSITION UTILITY HOOKS
// ============================================================================

/**
 * Hook to combine multiple state objects into a single state.
 *
 * Later states in the argument list override earlier states (shallow merge).
 * This is used for the main state composition pipeline where each layer
 * adds or overrides properties from previous layers.
 *
 * Example:
 * ```typescript
 * const combined = useCombinedState(
 *   parentState,      // Base layer
 *   contextVars,      // Adds context variables
 *   localVars,        // Overrides with local variables (highest priority)
 * );
 * ```
 *
 * @param states - Variable number of state objects to combine
 * @returns Combined state with memoization and shallow comparison
 */
export function useCombinedState(...states: (ContainerState | undefined)[]): ContainerState {
  const combined: ContainerState = useMemo(() => {
    let ret: ContainerState = {};
    states.forEach((state = EMPTY_OBJECT) => {
      if (state !== EMPTY_OBJECT) {
        ret = { ...ret, ...state };
      }
    });
    return ret;
  }, [states]);
  return useShallowCompareMemoize(combined);
}

/**
 * Hook to merge two state objects with deep merging of plain objects.
 *
 * This is specifically used for merging local variables with component state.
 * When both states have the same property:
 * - If both values are plain objects, they are deeply merged
 * - Otherwise, the second state (componentState) wins
 *
 * This allows component state to partially update local variables that
 * are objects without completely replacing them.
 *
 * Example:
 * ```typescript
 * localVars = { user: { name: "Alice", age: 30 } }
 * componentState = { user: { age: 31 } }
 * result = { user: { name: "Alice", age: 31 } }  // age updated, name preserved
 * ```
 *
 * @param localVars - Local variable definitions (lower priority for conflicts)
 * @param componentState - Component reducer state (higher priority, can override)
 * @returns Merged state with memoization and shallow comparison
 */
export function useMergedState(
  localVars: ContainerState,
  componentState: ContainerState,
): ContainerState {
  const merged = useMemo(() => {
    const ret = { ...localVars };
    Reflect.ownKeys(componentState).forEach((key) => {
      const value = componentState[key];
      if (ret[key] === undefined) {
        ret[key] = value;
      } else {
        if (isPlainObject(ret[key]) && isPlainObject(value)) {
          ret[key] = merge(cloneDeep(ret[key]), value);
        } else {
          ret[key] = value;
        }
      }
    });
    return ret;
  }, [localVars, componentState]);
  return useShallowCompareMemoize(merged);
}
