import React, { type CSSProperties } from "react";
import { isPlainObject } from "lodash-es";

import type { ContainerState } from "../rendering/ContainerWrapper";
import type { AppContextObject } from "../../abstractions/AppContextDefs";

import { parseParameterString } from "../script-runner/ParameterParser";
import { evalBinding } from "../script-runner/eval-tree-sync";
import { LRUCache } from "../utils/LruCache";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { layoutOptionKeys } from "../descriptorHelper";
import { asOptionalBoolean } from "../rendering/valueExtractor";

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
  extractContext: { didResolve: boolean } = { didResolve: false },
): any {
  if (typeof param === "string") {
    const paramSegments = parseParameterString(param);
    if (paramSegments.length === 0) {
      // --- The param is an empty string, retrieve it
      return param;
    }

    // --- Cut the first segment, if it is whitespace-only
    if (paramSegments[0].type === "literal" && paramSegments[0].value.trim() === "") {
      paramSegments.shift();
    }
    if (paramSegments.length === 0) {
      // --- The param is an empty string, retrieve it
      return param;
    }

    // --- Cut the last segment, if it is whitespace-only
    const lastSegment = paramSegments[paramSegments.length - 1];
    if (lastSegment.type === "literal" && lastSegment.value.trim() === "") {
      paramSegments.pop();
    }
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
        if (exprValue?.toString) {
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
      extractParam(state, childParam, appContext, false, arrayExtractContext),
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
  appContext?: AppContextObject,
) {
  if (when === undefined) {
    return true;
  }
  return asOptionalBoolean(extractParam(componentState, when, appContext, true));
}

/**
 * Resolves props that can either be regular properties or URL resources.
 * It also removes layoutCss props from regular properties.
 * @param props Component (rest) props
 * @param extractValue Value extractor function
 * @param layoutCss Component styles
 * @param resourceExtraction URL resource extractor function and array that specifies which props are URL resources
 * @returns properties that are resolved and cleaned of CSS styles
 */
export function resolveAndCleanProps<T extends Record<string, any>>(
  props: Record<string, any>,
  extractValue: ValueExtractor,
  resourceExtraction?: {
    extractResourceUrl: (url?: string) => string | undefined;
    resourceProps?: string[];
  },
): T {
  const { extractResourceUrl, resourceProps } = resourceExtraction ?? {};
  const cleanedProps = removeStylesFromProps(props);

  const resultProps: Record<string, any> = {} as any;
  const result = Object.keys(cleanedProps).reduce((acc, propName) => {
    if (resourceProps && extractResourceUrl && resourceProps.includes(propName)) {
      acc[propName] = extractResourceUrl(cleanedProps[propName]);
    } else {
      acc[propName] = extractValue(cleanedProps[propName]);
    }
    return acc;
  }, resultProps);

  // --- Remove aliased CSS properties
  delete resultProps.canShrink;
  delete resultProps.radiusTopLeft;
  delete resultProps.radiusTopRight;
  delete resultProps.radiusBottomLeft;
  delete resultProps.radiusBottomRight;

  // --- Delete pseudo CSS properties
  delete resultProps.paddingHorizontal;
  delete resultProps.paddingVertical;
  delete resultProps.marginHorizontal;
  delete resultProps.marginVertical;
  delete resultProps.borderHorizontal;
  delete resultProps.borderVertical;

  return result as T;
}

/**
 * Removes unnecessary style related properties so only layoutCss contains them.
 * @param nodeProps properties to clean
 * @returns only component-specific properties
 */
export function removeStylesFromProps(
  nodeProps: Record<string, any>,
) {
  if (nodeProps.hasOwnProperty("style")) {
    delete nodeProps["style"];
  }
  if (nodeProps.hasOwnProperty("class")) {
    delete nodeProps["class"];
  }

  const filterKeys = layoutOptionKeys;
  return Object.fromEntries(
    Object.entries(nodeProps).filter(([key]) => !filterKeys.includes(key)),
  );
}

type NodeProps = Record<string, any>;
type ResourceUrlExtractor = (url?: string) => string | undefined;

/**
 * Extracts props that can either be regular properties or URL resources.
 * It also removes layoutCss props from regular properties fed into it.
 * @param extractValue Value extractor function
 * @param extractResourceUrl URL resource extractor function that specifies which props are URL resources
 * @param layoutCss Component styles
 * @param props Component props
 * @returns properties that are resolved and cleaned of CSS styles
 */
export class PropsTrasform<T extends NodeProps> {
  private nodeProps: T;
  private extractValue: ValueExtractor;
  private extractResourceUrl: ResourceUrlExtractor;

  private usedKeys: (keyof T)[] = [];

  constructor(
    extractValue: ValueExtractor,
    extractResourceUrl: ResourceUrlExtractor,
    props: T,
  ) {
    this.extractValue = extractValue;
    this.extractResourceUrl = extractResourceUrl;
    this.nodeProps = removeStylesFromProps(props) as T;
  }

  private mapValues(keys: (keyof T)[], fn: (value: any) => any) {
    this.usedKeys = Array.from(new Set(this.usedKeys.concat(keys)));
    return Object.fromEntries(keys.map((key) => [key, fn(this.nodeProps[key])]));
  }

  asValue<K extends keyof T>(...key: K[]) {
    return this.mapValues(key, this.extractValue) as T;
  }

  asUrlResource<K extends keyof T>(...key: K[]) {
    return this.mapValues(key, this.extractResourceUrl) as Record<K, string | undefined>;
  }

  asBoolean<K extends keyof T>(...key: K[]) {
    return this.mapValues(key, this.extractValue.asBoolean) as Record<
      string,
      ReturnType<ValueExtractor["asBoolean"]>
    >;
  }

  asOptionalBoolean<K extends keyof T>(...key: K[]) {
    return this.mapValues(key, this.extractValue.asOptionalBoolean) as Record<
      K,
      ReturnType<ValueExtractor["asOptionalBoolean"]>
    >;
  }

  asString<K extends keyof T>(...key: K[]) {
    return this.mapValues(key, this.extractValue.asString) as Record<
      string,
      ReturnType<ValueExtractor["asString"]>
    >;
  }

  asOptionalString<K extends keyof T>(...key: K[]) {
    return this.mapValues(key, this.extractValue.asOptionalString) as Record<
      string,
      ReturnType<ValueExtractor["asOptionalString"]>
    >;
  }

  asOptionalStringArray<K extends keyof T>(...key: K[]) {
    return this.mapValues(key, this.extractValue.asOptionalString) as Record<
      string,
      ReturnType<ValueExtractor["asOptionalStringArray"]>
    >;
  }

  asDisplayText<K extends keyof T>(...key: K[]) {
    return this.mapValues(key, this.extractValue.asDisplayText) as Record<
      string,
      ReturnType<ValueExtractor["asDisplayText"]>
    >;
  }

  asNumber<K extends keyof T>(...key: K[]) {
    return this.mapValues(key, this.extractValue.asNumber) as Record<
      string,
      ReturnType<ValueExtractor["asNumber"]>
    >;
  }

  asOptionalNumber<K extends keyof T>(...key: K[]) {
    return this.mapValues(key, this.extractValue.asOptionalNumber) as Record<
      K,
      ReturnType<ValueExtractor["asOptionalNumber"]>
    >;
  }

  asSize<K extends keyof T>(...key: K[]) {
    return this.mapValues(key, this.extractValue.asSize) as Record<
      K,
      ReturnType<ValueExtractor["asSize"]>
    >;
  }

  /**
   * Resolves props which have not been used yet.
   * If all keys have been referenced before this function is called, an empty object is returned.
   *
   * @returns props that have not been used yet
   */
  asRest(): T {
    const filteredKeys = Object.keys(this.nodeProps).filter(
      (propKey) => !this.usedKeys.includes(propKey as keyof T),
    );
    return this.mapValues(filteredKeys, this.extractValue) as T;
  }
}
