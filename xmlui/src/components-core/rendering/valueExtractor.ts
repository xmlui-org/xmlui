import type { MutableRefObject } from "react";
import memoizeOne from "memoize-one";
import { isString } from "lodash-es";

import type { AppContextObject } from "../../abstractions/AppContextDefs";
import type { MemoedVars } from "../abstractions/ComponentRenderer";
import type { ComponentApi, ContainerState } from "../rendering/ContainerWrapper";
import { isPrimitive, pickFromObject, shallowCompare } from "../utils/misc";
import { collectVariableDependencies } from "../script-runner/visitors";
import { extractParam } from "../utils/extractParam";
import { StyleParser, toCssVar } from "../../parsers/style-parser/StyleParser";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { isParsedAttributeValue, parseAttributeValue } from "../script-runner/AttributeValueParser";

export function asOptionalBoolean(value: any, defValue?: boolean | undefined) {
  if (value === undefined || value === null) return defValue;
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    value = value.trim().toLowerCase();
    if (value === "") {
      return false;
    }
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (value !== "") {
      return true;
    }
  }
  if (typeof value === "boolean") {
    return value;
  }
  throw new Error(`A boolean value expected but ${typeof value} received.`);
}

// This function represents the extractor function we pass to extractValue
export function createValueExtractor(
  state: ContainerState,
  appContext: AppContextObject | undefined,
  referenceTrackedApi: Record<string, ComponentApi>,
  memoedVarsRef: MutableRefObject<MemoedVars>,
): ValueExtractor {
  // --- Extract the parameter and retrieve as is is
  const extractor = (expression?: any, strict?: boolean): any => {
    if (!expression) {
      // --- No expression, return undefined
      return expression;
    }

    // TODO: Modify the loaders and events to be able to eliminate this branch
    if (typeof expression === "string") {
      expression = parseAttributeValue(expression);
    }

    if ((isPrimitive(expression) && !isString(expression)) || !isParsedAttributeValue(expression)) {
      // --- Primitive values (except string) are returned as is
      return expression;
    }

    if (typeof expression !== "string") {
      if (strict) {
        // --- If strict is true, we expect a string expression
        return expression;
      }
    }

    if (!isParsedAttributeValue(expression)) {
      // --- All other cases should use an already parsed expression
      throw new Error("Parsed expression expected.");
    }

    // --- Use the parseId as the cache key
    const parseId = expression.parseId.toString();
    if (!memoedVarsRef.current.has(parseId)) {
      memoedVarsRef.current.set(parseId, {
        getDependencies: memoizeOne((_, referenceTrackedApi) => {
          // --- We parsed this variable from markup
          const deps: string[] = [];
          expression.segments.forEach((segment) => {
            if (segment.expr !== undefined) {
              deps.push(...collectVariableDependencies(segment.expr, referenceTrackedApi));
            }
          });

          // --- Remove duplicates
          return [...new Set(deps)];
        }),
        obtainValue: memoizeOne(
          (expression, state, appContext, strict, deps, appContextDeps) => {
            return extractParam(state, expression, appContext);
          },
          (
            [_newExpression, _newState, _newAppContext, _newStrict, newDeps, newAppContextDeps],
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

    // --- Obtain the cached value from the cache (now, it must be there)
    // --- Note, we ignore the first parameter of getDependencies in the cached function
    const expressionDependencies = memoedVarsRef.current
      .get(parseId)!
      .getDependencies(parseId.toString(), referenceTrackedApi);
    const depValues = pickFromObject(state, expressionDependencies);
    const appContextDepValues = pickFromObject(appContext, expressionDependencies);

    // --- Return the memoed var getting the value from the current context
    return memoedVarsRef.current.get(parseId)!.obtainValue!(
      expression,
      state,
      appContext,
      strict,
      depValues,
      appContextDepValues,
    );
  };

  // --- Extract a string value
  extractor.asString = (expression?: any) => {
    return extractor(expression)?.toString() ?? "";
  };

  // --- Extract an optional string value
  extractor.asOptionalString = <T extends string>(expression?: any, defValue?: string) => {
    const value = extractor(expression)?.toString();
    if (value === undefined || value === null) return defValue;
    return value as T;
  };

  extractor.asDisplayText = (expression?: any) => {
    let text = extractor(expression)?.toString();
    if (text) {
      let replaced = "";
      let spaceFound = false;
      for (const char of text) {
        if (char === " " || char === "\t") {
          replaced += spaceFound ? "\xa0" : " ";
          spaceFound = true;
        } else {
          replaced += char;
          spaceFound = char === "\xa0";
        }
      }
      text = replaced;
    }
    return text;
  };

  // --- Extract a numeric value
  extractor.asNumber = (expression?: any) => {
    const value = extractor(expression);
    if (typeof value === "number") return value;
    throw new Error(`A numeric value expected but ${typeof value} received.`);
  };

  // --- Extract an optional numeric value
  extractor.asOptionalNumber = (expression?: any, defValue?: number) => {
    const value = extractor(expression);
    if (value === undefined || value === null) return defValue;
    if (typeof value === "string" && !isNaN(parseFloat(value))) {
      return Number(value);
    }
    if (typeof value === "number") return value;
    throw new Error(`A numeric value expected but ${typeof value} received.`);
  };

  // --- Extract a Boolean value
  extractor.asBoolean = (expression?: any) => {
    return !!extractor(expression);
  };

  // --- Extract an optional Boolean value
  extractor.asOptionalBoolean = (expression?: any, defValue?: boolean) => {
    return asOptionalBoolean(extractor(expression), defValue);
  };

  // --- Extract an optional size value
  extractor.asSize = (expression?: any) => {
    const value = extractor(expression);
    if (value === undefined || value === null) return undefined;

    try {
      const parser = new StyleParser(value);
      const size = parser.parseSize();
      if (size?.themeId) {
        return toCssVar(size.themeId);
      }
      return size ? `${size.value}${size.unit ?? "px"}` : undefined;
    } catch {
      return undefined;
    }
  };

  // --- Done.
  return extractor as ValueExtractor;
}
