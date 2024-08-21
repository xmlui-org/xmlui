import React from "react";
import { isPlainObject } from "lodash-es";

import type { ContainerState } from "@components-core/container/ContainerComponentDef";
import type { AppContextObject } from "@abstractions/AppContextDefs";

import { parseParameterString } from "@components-core/script-runner/ParameterParser";
import { evalBinding } from "@components-core/script-runner/eval-tree-sync";
import { LRUCache } from "@components-core/utils/LruCache";

/**
 * Extract the value of the specified parameter from the given view container state
 * @param state The state of the view container
 * @param param Parameter to extract
 * @param appContext Application context to use
 * @param strict Strict evaluation?
 * @param extractContext
 * @returns
 */
export function extractParam(
  state: ContainerState,
  param: any,
  appContext: AppContextObject | undefined = undefined,
  strict: boolean = false, // --- In this case we only allow string binding expression
  extractContext: { didResolve: boolean } = { didResolve: false }
): any {
  if (typeof param === "string") {
    const paramSegments = parseParameterString(param);
    if (paramSegments.length === 0) {
      // --- The param is an empty string, retrieve it
      return param;
    }

    if (paramSegments.length === 1) {
      // --- We have a single string literal or expression
      if (paramSegments[0].type === "literal") {
        // --- No expression to evaluate
        return paramSegments[0].value;
      } else {
        // --- We have a single expression to evaluate
        extractContext.didResolve = true;
        return evalBinding(paramSegments[0].value, {
          localContext: state,
          appContext,
          options: {
            defaultToOptionalMemberAccess: true,
          },
        });
      }
    }
    // --- At this point, we have multiple segments. Evaluate all expressions and convert them to strings
    let result = "";
    paramSegments.forEach((ps) => {
      if (ps.type === "literal") {
        result += ps.value;
      } else {
        extractContext.didResolve = true;
        const exprValue = evalBinding(ps.value, {
          localContext: state,
          appContext,
          options: {
            defaultToOptionalMemberAccess: true,
          },
        });
        if (exprValue === null) {
          result += "null";
        } else if (exprValue === undefined) {
          result += "undefined";
        } else if (exprValue?.toString) {
          result += exprValue.toString();
        }
      }
    });
    return result;
  }

  if (strict) {
    // --- As we allow only string parameters as binding expressions, we return with the provided
    // --- *not string* parameter without transforming it
    return param;
  }

  // --- Resolve each array item
  if (Array.isArray(param)) {
    const arrayExtractContext = { didResolve: false };
    let resolvedChildren = param.map((childParam) =>
      extractParam(state, childParam, appContext, false, arrayExtractContext)
    );
    if (arrayExtractContext.didResolve) {
      extractContext.didResolve = true;
      return resolvedChildren;
    }
    return param;
  }

  // --- Resolve each object property
  if (isPlainObject(param)) {
    const objectExtractContext = { didResolve: false };
    const substitutedObject: Record<string, any> = {};
    Object.entries(param).forEach(([key, value]) => {
      substitutedObject[key] = extractParam(state, value, appContext, false, objectExtractContext);
    });
    if (objectExtractContext.didResolve) {
      extractContext.didResolve = true;
      return substitutedObject;
    }
    return param;
  }

  // --- The param itself is the extracted value
  return param;
}

// --- Store stable object references for extracted parameter values
const extractedObjectCache = new LRUCache(1024 * 10);
/**
 * Get a stable object reference from an LRU cache
 * @param object Object to get the stable reference for
 *
 * We are doing this to prevent creating new objects with new references when the data hasn't changed this way we
 * can use these as dependencies for useEffect
 */
export function withStableObjectReference(object: any) {
  if (typeof object === "function") {
    return object;
  }
  if (React.isValidElement(object) || (Array.isArray(object) && React.isValidElement(object[0]))) {
    //here could be some gnarly circular object references, JSON.stringify would blow up
    return object;
  }
  if (object?._ARROW_EXPR_) {
    //here could be some gnarly circular object references, JSON.stringify would blow up
    return object;
  }
  try {
    const stringObject = JSON.stringify(object);
    const cachedObject = extractedObjectCache.get(stringObject);
    if (cachedObject) {
      return cachedObject;
    }
    extractedObjectCache.set(stringObject, object);
  } catch (e) {
    console.log(object);
    console.warn("couldn't cache result", e);
  }
  return object;
}

export function shouldKeep(
  when: string | boolean | undefined,
  componentState: ContainerState,
  appContext?: AppContextObject
) {
  if (when === undefined) {
    return true;
  }
  return extractParam(componentState, when, appContext, true);
}
