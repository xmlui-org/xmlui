/**
 * Variable Resolution Module
 *
 * Implements the two-pass variable resolution strategy for XMLUI containers.
 *
 * PROBLEM:
 * Variables can depend on each other in any order, including forward references.
 * Example: { fn: "$props.value", $props: "{x: 1}" }
 *
 * SOLUTION:
 * Two-pass resolution ensures all dependencies are available:
 *
 * Pass 1 (Pre-resolution):
 * - Resolves variables using current state context
 * - Handles forward references (function using var defined later)
 * - Results are temporary and may be incomplete
 * - Uses temporary memoization cache
 *
 * Pass 2 (Final resolution):
 * - Includes pre-resolved variables in the context
 * - Ensures all dependencies are available
 * - Results are memoized for performance
 * - Uses persistent memoization cache
 *
 * EXAMPLE:
 * Given vars { fn: "$props.value", $props: "{x: 1}" }
 * - Pass 1: fn tries to use $props (not yet resolved, may be undefined)
 * - Pass 2: fn uses $props (now resolved to {x: 1}, works correctly)
 *
 * FUTURE OPTIMIZATION:
 * Consider topological sort of dependencies to enable single-pass resolution
 *
 * Part of StateContainer.tsx refactoring - Step 7
 */

import { useMemo, type MutableRefObject } from "react";
import memoizeOne from "memoize-one";
import type { ContainerState } from "../../abstractions/ContainerDefs";
import type { MemoedVars } from "../abstractions/ComponentRenderer";
import type { CodeDeclaration } from "../script-runner/ScriptingSourceTree";
import { useAppContext } from "../AppContext";
import { useReferenceTrackedApi, useShallowCompareMemoize } from "../utils/hooks";
import { isParsedCodeDeclaration } from "../../abstractions/InternalMarkers";
import { collectVariableDependencies } from "../script-runner/visitors";
import { parseParameterString } from "../script-runner/ParameterParser";
import { evalBinding } from "../script-runner/eval-tree-sync";
import { extractParam } from "../utils/extractParam";
import { ParseVarError } from "../rendering/ContainerUtils";
import { pickFromObject, shallowCompare } from "../utils/misc";
import { EMPTY_OBJECT } from "../constants";

/**
 * Resolves variable definitions into their actual values.
 *
 * This hook handles variable resolution with dependency tracking and memoization.
 * Variables can depend on:
 * - Other variables (including forward references)
 * - Component state
 * - App context
 *
 * The resolution process:
 * 1. Collects dependencies for each variable
 * 2. Resolves dependencies recursively (function deps → var deps)
 * 3. Evaluates each variable with its dependencies
 * 4. Memoizes results for performance
 *
 * @param vars - Variable definitions to resolve (from vars, functions, script)
 * @param fnDeps - Pre-computed function dependencies
 * @param componentState - Current component state context
 * @param memoedVars - Memoization cache for resolved values
 * @returns Resolved variables as a state object
 */
export function useVars(
  vars: ContainerState = EMPTY_OBJECT,
  fnDeps: Record<string, Array<string>> = EMPTY_OBJECT,
  componentState: ContainerState,
  memoedVars: MutableRefObject<MemoedVars>,
): ContainerState {
  const appContext = useAppContext();
  const referenceTrackedApi = useReferenceTrackedApi(componentState);

  const resolvedVars = useMemo(() => {
    const ret: any = {};

    Object.entries(vars).forEach(([key, value]) => {
      if (key === "$props") {
        // --- We already resolved props in a compound component
        ret[key] = value;
      } else {
        if (!isParsedValue(value) && typeof value !== "string") {
          ret[key] = value;
        } else {
          // --- Resolve each variable's value, without going into the details of arrays and objects
          if (!memoedVars.current.has(value)) {
            memoedVars.current.set(value, {
              getDependencies: memoizeOne((value, referenceTrackedApi) => {
                if (isParsedValue(value)) {
                  return collectVariableDependencies(value.tree, referenceTrackedApi);
                }
                const params = parseParameterString(value);
                let ret = new Set<string>();
                params.forEach((param) => {
                  if (param.type === "expression") {
                    ret = new Set([
                      ...ret,
                      ...collectVariableDependencies(param.value, referenceTrackedApi),
                    ]);
                  }
                });
                return Array.from(ret);
              }),
              obtainValue: memoizeOne(
                (value, state, appContext, strict, deps, appContextDeps) => {
                  try {
                    return isParsedValue(value)
                      ? evalBinding(value.tree, {
                          localContext: state,
                          appContext,
                          options: {
                            defaultToOptionalMemberAccess: true,
                          },
                        })
                      : extractParam(state, value, appContext, strict);
                  } catch (e) {
                    console.log(state);
                    throw new ParseVarError(value, e);
                  }
                },
                (
                  [
                    _newExpression,
                    _newState,
                    _newAppContext,
                    _newStrict,
                    newDeps,
                    newAppContextDeps,
                  ],
                  [
                    _lastExpression,
                    _lastState,
                    _lastAppContext,
                    _lastStrict,
                    lastDeps,
                    lastAppContextDeps,
                  ],
                ) => {
                  return (
                    shallowCompare(newDeps, lastDeps) &&
                    shallowCompare(newAppContextDeps, lastAppContextDeps)
                  );
                },
              ),
            });
          }
          const stateContext: ContainerState = { ...ret, ...componentState };

          let dependencies: Array<string> = [];
          if (fnDeps[key]) {
            dependencies = fnDeps[key];
          } else {
            memoedVars.current
              .get(value)!
              .getDependencies(value, referenceTrackedApi)
              .forEach((dep) => {
                if (fnDeps[dep]) {
                  dependencies.push(...fnDeps[dep]);
                } else {
                  dependencies.push(dep);
                }
              });
            dependencies = [...new Set(dependencies)];
          }
          const stateDepValues = pickFromObject(stateContext, dependencies);
          const appContextDepValues = pickFromObject(appContext, dependencies);

          ret[key] = memoedVars.current
            .get(value)!
            .obtainValue(
              value,
              stateContext,
              appContext,
              true,
              stateDepValues,
              appContextDepValues,
            );
        }
      }
    });
    return ret;
  }, [appContext, componentState, fnDeps, memoedVars, referenceTrackedApi, vars]);

  return useShallowCompareMemoize(resolvedVars);
}

/**
 * Type guard to check if a value is a parsed code declaration.
 *
 * Parsed values come from code-behind or script tags and contain
 * a syntax tree that can be evaluated.
 *
 * @param value - Value to check
 * @returns True if value is a CodeDeclaration
 */
export function isParsedValue(value: any): value is CodeDeclaration {
  return isParsedCodeDeclaration(value);
}
