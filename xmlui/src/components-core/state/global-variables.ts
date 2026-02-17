/**
 * Global Variables Module
 * 
 * Handles global variable evaluation and reactivity for XMLUI containers.
 * 
 * OVERVIEW:
 * Global variables are defined at the root level and inherited by all child containers.
 * They can be updated at runtime (e.g., count++) and must trigger re-evaluation of
 * dependent globals.
 * 
 * REACTIVITY MODEL:
 * 1. Static Dependencies: Globals can depend on other globals (expressions evaluated once)
 * 2. Runtime Updates: When a global is updated (e.g., count++), the new value is stored
 *    in componentState and dependent globals must re-evaluate
 * 3. Dependency Tracking: Expression trees are analyzed to identify variable dependencies
 * 4. Shadowing: Local variables can shadow global variables (locals take precedence)
 * 
 * EVALUATION STRATEGY:
 * - Parent globals are evaluated first, creating a context
 * - Node globals are evaluated in order, seeing previous globals
 * - Runtime values (from componentState) override initial expressions
 * - Dependencies trigger re-evaluation when their values change
 * 
 * EXAMPLE:
 * globalVars: {
 *   count: "0",              // Initial value
 *   doubled: "$count * 2"    // Depends on count
 * }
 * 
 * After count++ (count becomes 1):
 * - count = 1 (from componentState, not re-evaluated)
 * - doubled = 2 (re-evaluated with new count value)
 * 
 * Part of StateContainer.tsx refactoring - Step 8
 */

import { useMemo } from "react";
import type { ContainerState } from "../../abstractions/ContainerDefs";
import { collectVariableDependencies } from "../script-runner/visitors";
import { extractParam } from "../utils/extractParam";
import { useShallowCompareMemoize } from "../utils/hooks";
import { useAppContext } from "../AppContext";

/**
 * Hook to manage global variables with reactivity and dependency tracking.
 * 
 * This hook:
 * 1. Collects dependencies between global variables
 * 2. Tracks runtime changes to global values in componentState
 * 3. Evaluates global variable expressions with proper dependency resolution
 * 4. Returns a stable reference that only changes when values change
 * 
 * @param parentGlobalVars - Global variables inherited from parent container
 * @param nodeGlobalVars - Global variables defined on this node
 * @param nodeFunctions - Functions defined on this node (added to globals)
 * @param componentStateWithApis - Current component state (includes runtime updates)
 * @returns Evaluated global variables as a state object
 */
export function useGlobalVariables(
  parentGlobalVars: Record<string, any> | undefined,
  nodeGlobalVars: Record<string, any> | undefined,
  nodeFunctions: Record<string, any> | undefined,
  componentStateWithApis: ContainerState,
): ContainerState {
  const appContext = useAppContext();

  // ========================================================================
  // STEP 1: COLLECT DEPENDENCIES
  // ========================================================================
  
  // Collect dependencies of global variables from expression trees
  // This enables re-evaluation when dependencies change (reactivity)
  const globalDependencies = useMemo(() => {
    const deps: Record<string, string[]> = {};
    
    // Collect dependencies from parent global vars
    if (parentGlobalVars) {
      for (const [key, value] of Object.entries(parentGlobalVars)) {
        if (key.startsWith("__")) continue;
        const treeKey = `__tree_${key}`;
        const tree = parentGlobalVars[treeKey];
        
        if (tree && typeof tree === "object") {
          // Extract variable dependencies from expression tree
          deps[key] = collectVariableDependencies(tree);
        }
      }
    }
    
    // Collect dependencies from node global vars
    if (nodeGlobalVars) {
      for (const [key, value] of Object.entries(nodeGlobalVars)) {
        if (key.startsWith("__")) continue;
        const treeKey = `__tree_${key}`;
        const tree = nodeGlobalVars[treeKey];
        
        if (tree && typeof tree === "object") {
          // Extract variable dependencies from expression tree
          deps[key] = collectVariableDependencies(tree);
        }
      }
    }
    
    return deps;
  }, [parentGlobalVars, nodeGlobalVars]);

  // ========================================================================
  // STEP 2: BUILD DEPENDENCY VALUE MAP
  // ========================================================================
  
  // Build a dependency map for triggering re-evaluation when global dependencies change
  // This includes actual runtime values of globals that other globals depend on
  const globalDepValueMap = useMemo(() => {
    const depMap: Record<string, any> = {};
    const allCurrentGlobals = { ...parentGlobalVars, ...nodeGlobalVars };
    
    // For each global, collect the actual values of its dependencies
    for (const [globalKey, depNames] of Object.entries(globalDependencies)) {
      if (!depNames) continue;
      
      // Include values of direct dependencies
      for (const depName of depNames) {
        // Check if this is another global (in parentGlobalVars or nodeGlobalVars)
        if (depName in allCurrentGlobals && !depName.startsWith("__")) {
          // Use the original string expression as the key, not the value
          // This way we can track when the definition changes
          const depGlobalValue = allCurrentGlobals[depName];
          const depKey = `${globalKey}:${depName}`;
          depMap[depKey] = depGlobalValue;
        }
      }
    }
    
    // Also include current values of componentState globals to detect runtime changes
    // When a global is updated (e.g., count++), the new value is stored in componentState
    // We need to detect this change to trigger re-evaluation of dependent globals
    if (nodeGlobalVars) {
      for (const globalKey of Object.keys(nodeGlobalVars)) {
        if (!globalKey.startsWith("__") && globalKey in componentStateWithApis) {
          // Include the actual runtime value from componentState
          const componentValue = componentStateWithApis[globalKey];
          depMap[`runtime:${globalKey}`] = componentValue;
        }
      }
    }
    
    return depMap;
  }, [globalDependencies, parentGlobalVars, nodeGlobalVars, componentStateWithApis]);

  // ========================================================================
  // STEP 3: EVALUATE GLOBAL VARIABLES
  // ========================================================================
  
  // Merge parent's globalVars with current node's globalVars
  // Current node's globalVars take precedence (usually only root defines them)
  // Evaluate any string expressions (binding expressions) in globalVars
  // IMPORTANT: This memo includes globalDepValueMap to trigger re-evaluation
  // when globals that affect others change during component lifetime
  const currentGlobalVars = useMemo(() => {
    // Evaluate parentGlobalVars if they contain string expressions
    const evaluatedParentGlobals: Record<string, any> = {};
    if (parentGlobalVars) {
      // Process parent globals in order, accumulating evaluated values
      // Skip __tree_* keys as they're metadata for re-evaluation
      for (const [key, value] of Object.entries(parentGlobalVars)) {
        if (key.startsWith("__")) {
          // Skip internal metadata keys
          continue;
        }
        if (typeof value === "string") {
          // Create state with previously evaluated parent globals for dependency resolution
          evaluatedParentGlobals[key] = extractParam(
            evaluatedParentGlobals,  // Include previously evaluated globals
            value,
            appContext,
            false,
          );
        } else {
          evaluatedParentGlobals[key] = value;
        }
      }
    }
    
    // Evaluate node.globalVars if they contain string expressions
    // Include both parent globals and previously evaluated node globals
    const evaluatedNodeGlobals: Record<string, any> = {};
    if (nodeGlobalVars) {
      // Merge parent globals with node globals for evaluation context
      // START with componentStateWithApis values for any globals that have been updated at runtime
      // This is KEY for reactivity: when count++ updates count, subsequent globals can see the new value
      let globalsForContext = { ...evaluatedParentGlobals, ...evaluatedNodeGlobals };
      
      for (const [key, value] of Object.entries(nodeGlobalVars)) {
        if (key.startsWith("__")) {
          // Skip internal metadata keys
          continue;
        }
        
        // CRITICAL: If this global was updated at runtime, use the runtime value directly
        // Don't re-evaluate the original expression (which would give the old value)
        if (key in componentStateWithApis) {
          evaluatedNodeGlobals[key] = componentStateWithApis[key];
          globalsForContext[key] = componentStateWithApis[key];
          continue;
        }
        
        if (typeof value === "string") {
          // CRITICAL: For evaluation, use componentStateWithApis values if they exist
          // This ensures that when a global is updated (e.g., count++), we see the NEW value, not the old one
          const evalContext: Record<string, any> = {};
          
          // First, define all globals that might be dependencies from their current runtime values
          if (nodeGlobalVars) {
            for (const [globalKey] of Object.entries(nodeGlobalVars)) {
              if (!globalKey.startsWith("__")) {
                // Prefer componentStateWithApis value (runtime updated) over initially evaluated value
                if (globalKey in componentStateWithApis) {
                  evalContext[globalKey] = componentStateWithApis[globalKey];
                } else if (globalKey in globalsForContext) {
                  evalContext[globalKey] = globalsForContext[globalKey];
                }
              }
            }
          }
          
          // Also include parent globals
          for (const [pkey, pval] of Object.entries(evaluatedParentGlobals)) {
            if (!(pkey in evalContext)) {
              evalContext[pkey] = pval;
            }
          }
          
          // Create state with all available globals for dependency resolution
          evaluatedNodeGlobals[key] = extractParam(
            evalContext,
            value,
            appContext,
            false,
          );
          // Update the context for subsequent variables with the newly evaluated value
          globalsForContext[key] = evaluatedNodeGlobals[key];
        } else {
          evaluatedNodeGlobals[key] = value;
          globalsForContext[key] = value;
        }
      }
    }
    
    // Add functions from node.functions (these are already evaluated function objects, not strings)
    if (nodeFunctions) {
      Object.entries(nodeFunctions).forEach(([funcName, funcValue]) => {
        evaluatedNodeGlobals[funcName] = funcValue;
      });
    }
    
    // Merge with node globals taking precedence
    return {
      ...evaluatedParentGlobals,
      ...evaluatedNodeGlobals,
    };   
  }, [parentGlobalVars, nodeGlobalVars, nodeFunctions, appContext, globalDepValueMap, globalDependencies, componentStateWithApis]);

  // ========================================================================
  // STEP 4: STABILIZE REFERENCE
  // ========================================================================
  
  // Stabilize currentGlobalVars reference to prevent unnecessary re-renders
  // Only create new reference when values actually change (shallow comparison)
  const stableCurrentGlobalVars = useShallowCompareMemoize(currentGlobalVars);
  
  return stableCurrentGlobalVars;
}
