import type { MutableRefObject } from "react";
import memoizeOne from "memoize-one";
import { isPlainObject, isString } from "lodash-es";

import type { AppContextObject } from "../../abstractions/AppContextDefs";
import type { MemoedVars } from "../abstractions/ComponentRenderer";
import { parseParameterString } from "../script-runner/ParameterParser";
import type { ComponentApi, ContainerState } from "../rendering/ContainerWrapper";
import { isPrimitive, pickFromObject, shallowCompare } from "../utils/misc";
import { collectVariableDependencies } from "../script-runner/visitors";
import { extractParam } from "../utils/extractParam";
import { StyleParser, toCssVar } from "../../parsers/style-parser/StyleParser";
import type { ValueExtractor } from "../../abstractions/RendererDefs";

function parseStringArray(input: string): string[] {
  const trimmedInput = input.trim();

  if (trimmedInput.startsWith("[") && trimmedInput.endsWith("]")) {
    const content = trimmedInput.slice(1, -1);
    const items = content.split(",").map((item) => item.trim());
    return items.map((item) => item.replace(/^['"]|['"]$/g, ""));
  } else {
    throw new Error("Invalid array format");
  }
}

function collectParams(expression: any) {
  const params = [];

  if (typeof expression === "string") {
    params.push(...parseParameterString(expression));
  } else if (Array.isArray(expression)) {
    expression.forEach((exp) => {
      params.push(...collectParams(exp));
    });
  } else if (isPlainObject(expression)) {
    Object.entries(expression).forEach(([key, value]) => {
      params.push(...collectParams(value));
    });
  }

  return params;
}

export function asOptionalBoolean(value: any, defValue?: boolean | undefined) {
  if (value === undefined || value === null) return defValue;
  
  // Empty array returns false
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  
  // Empty object returns false
  if (typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length === 0) {
    return false;
  }
  
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
  return true;
}

// This function represents the extractor function we pass to extractValue
export function createValueExtractor(
  state: ContainerState,
  appContext: AppContextObject | undefined,
  referenceTrackedApi: Record<string, ComponentApi>,
  memoedVarsRef: MutableRefObject<MemoedVars>
): ValueExtractor {
  // --- Extract the parameter and retrieve as is is
  const extractor = (expression?: any, strict?: boolean): any => {
    if (!expression) {
      return expression;
    }
    if (isPrimitive(expression) && !isString(expression)) {
      return expression;
    }

    let expressionString = expression;
    if (typeof expression !== "string") {
      if (strict) {
        return expression;
      }
      expressionString = JSON.stringify(expression);
    }

    if (!memoedVarsRef.current.has(expressionString)) {
      const params = collectParams(expression);
      memoedVarsRef.current.set(expressionString, {
        getDependencies: memoizeOne((_expressionString, referenceTrackedApi) => {
          let ret = new Set<string>();
          params.forEach((param) => {
            if (param.type === "expression") {
              ret = new Set([...ret, ...collectVariableDependencies(param.value, referenceTrackedApi)]);
            }
          });
          return Array.from(ret);
        }),
        obtainValue: memoizeOne(
          (expression, state, appContext, strict, deps, appContextDeps) => {
            // console.log("COMP, BUST, obtain value called with", expression, state, appContext, deps,  appContextDeps);
            return extractParam(state, expression, appContext, strict);
          },
          (
            [_newExpression, _newState, _newAppContext, _newStrict, newDeps, newAppContextDeps],
            [_lastExpression, _lastState, _lastAppContext, _lastStrict, lastDeps, lastAppContextDeps]
          ) => {
            return shallowCompare(newDeps, lastDeps) && shallowCompare(newAppContextDeps, lastAppContextDeps);
          }
        ),
      });
    }
    const expressionDependencies = memoedVarsRef.current
      .get(expressionString)!
      .getDependencies(expressionString, referenceTrackedApi);
    const depValues = pickFromObject(state, expressionDependencies);
    const appContextDepValues = pickFromObject(appContext, expressionDependencies);
    // console.log("COMP, obtain value called with", depValues, appContextDepValues, expressionDependencies);
    return memoedVarsRef.current.get(expressionString)!.obtainValue!(
      expression,
      state,
      appContext,
      strict,
      depValues,
      appContextDepValues
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

  // ---Extract an array of strings
  extractor.asOptionalStringArray = (expression?: any) => {
    const value = extractor(expression);
    if (value === undefined || value === null) return [];
    if (typeof value === "string" && value.trim() !== "") {
      //console.log(parseStringArray(value));
      return parseStringArray(value);
    }
    if (Array.isArray(value)) {
      return value.map((item) => item.toString());
    }
    throw new Error(`An array of strings expected but ${typeof value} received.`);
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
