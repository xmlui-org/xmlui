import React, { type CSSProperties } from "react";
import { isPlainObject } from "lodash-es";

import type { ContainerState } from "../rendering/ContainerWrapper";
import type { AppContextObject, MediaBreakpointType } from "../../abstractions/AppContextDefs";
import { MediaBreakpointKeys } from "../../abstractions/AppContextDefs";
import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";
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
  if (isArrowExpressionObject(object)) {
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
 * Resolves the effective "when" value for a component, applying Tailwind-style
 * min-width (mobile-first) responsive overrides.
 *
 * If no responsiveWhen entries are defined, delegates to the plain shouldKeep (base `when`).
 * Otherwise, treats responsiveWhen as the exclusive source of truth:
 * - For the current sizeIndex, walks from the current breakpoint down to "xs"
 * - Returns the first defined responsive value found
 * - If no responsive rule matches, returns false (hidden by default)
 * - If sizeIndex is undefined, falls back to base `when`
 *
 * @param when Base visibility condition
 * @param responsiveWhen Per-breakpoint visibility overrides (Tailwind mobile-first)
 * @param componentState Current component state
 * @param appContext Application context with mediaSize information
 * @returns The effective visibility (true=show, false=hide)
 */
export function resolveResponsiveWhen(
  when: string | boolean | undefined,
  responsiveWhen: Partial<Record<MediaBreakpointType, string | boolean>> | undefined,
  componentState: ContainerState,
  appContext?: AppContextObject,
): boolean {
  // If no responsive rules are defined, use base `when` (backward compatibility)
  if (!responsiveWhen || Object.keys(responsiveWhen).length === 0) {
    return shouldKeep(when, componentState, appContext);
  }

  // When all responsive when-* values are static (no `{...}` expressions), ComponentAdapter
  // calls buildResponsiveWhenStyleObject to generate CSS container-style-query rules and
  // attaches the resulting class to a <span> wrapper. This covers both SSR (correct first-paint
  // HTML for crawlers) and the client-side flash window before sizeIndex is resolved.
  // The two fallback branches below (SSR heuristic / client-side suppress) are still kept as the
  // safety net for the dynamic-expression case where no CSS class can be generated.

  const sizeIndex = appContext?.mediaSize?.sizeIndex;

  if (sizeIndex === undefined) {
    if (typeof document === "undefined") {
      // SSR mode: viewport breakpoint is unknown. Render the component if it would be
      // visible at *any* breakpoint so that SSR output includes it for crawlers and
      // for the initial HTML before hydration.
      const isVisibleAtAnyBreakpoint = MediaBreakpointKeys.some((bp) => {
        if (responsiveWhen[bp] === undefined) return false;
        return asOptionalBoolean(extractParam(componentState, responsiveWhen[bp], appContext, true)) ?? true;
      });
      return isVisibleAtAnyBreakpoint;
    }

    // Client-side but sizeIndex not yet computed (media queries still resolving on first
    // render). Suppress rendering to avoid a flash where multiple mutually-exclusive
    // responsive components briefly appear together before the breakpoint is known.
    return false;
  }

  // Walk from current breakpoint down to xs (Tailwind mobile-first)
  for (let i = sizeIndex; i >= 0; i--) {
    const bp = MediaBreakpointKeys[i];
    if (responsiveWhen[bp] !== undefined) {
      return asOptionalBoolean(extractParam(componentState, responsiveWhen[bp], appContext, true)) ?? true;
    }
  }

  // No responsive rule matched — fall back to base `when` (same as if no responsive
  // attrs were set at all). This means a lone `when-md="false"` on a component that has
  // no base `when` will be visible at xs/sm, because undefined `when` defaults to true.
  return shouldKeep(when, componentState, appContext);
}

/**
 * Determines whether a value is a dynamic expression (contains `{...}`).
 */
function isDynamicValue(val: string | boolean | undefined): boolean {
  return typeof val === "string" && val.includes("{");
}

/**
 * Converts a static attribute value to a boolean.
 * Returns `undefined` if the value cannot be statically resolved (e.g. non-boolean strings
 * without expressions – those must be evaluated at runtime).
 */
function resolveStaticBool(val: string | boolean | undefined): boolean | undefined {
  if (val === undefined) return undefined;
  if (typeof val === "boolean") return val;
  if (val === "true") return true;
  if (val === "false") return false;
  return undefined; // non-boolean string without `{` — caller should treat as dynamic
}

/**
 * Builds a CSS style object for responsive visibility using CSS container style queries
 * against the XMLUI `--screenSize` CSS custom property (set 0–5 by `@media` queries in
 * ThemeNative). The resulting object is suitable for passing to `useStyles`.
 *
 * Returns `null` when:
 * - No responsive rules are defined.
 * - Any value is a dynamic expression (contains `{...}`) — fall back to JS resolution.
 * - All breakpoints are visible — no CSS class needed.
 *
 * All six breakpoints (xs=0 … xxl=5) are evaluated using the same Tailwind-style
 * mobile-first walk-down used in `resolveResponsiveWhen`.
 *
 * Example output (when-md="false" only, hiding xs and sm):
 * ```
 * {
 *   display: "contents",
 *   "@container (style(--screenSize: 0) or style(--screenSize: 1))": { display: "none" }
 * }
 * ```
 */
export function buildResponsiveWhenStyleObject(
  when: string | boolean | undefined,
  responsiveWhen: Partial<Record<MediaBreakpointType, string | boolean>> | undefined,
): Record<string, any> | null {
  if (!responsiveWhen || Object.keys(responsiveWhen).length === 0) return null;

  // Bail out for any dynamic value — runtime JS resolution handles those
  if (isDynamicValue(when)) return null;
  if (MediaBreakpointKeys.some((bp) => isDynamicValue(responsiveWhen[bp]))) return null;

  // Resolve base `when`: e.g. undefined → always visible; "true" → true; "false" → false
  const rawBase = resolveStaticBool(when);
  if (when !== undefined && rawBase === undefined) return null; // non-bool non-expr string
  const baseVisible = rawBase ?? true;

  // All responsive values must be statically resolvable
  for (const bp of MediaBreakpointKeys) {
    const val = responsiveWhen[bp];
    if (val !== undefined && resolveStaticBool(val) === undefined) return null;
  }

  // Compute visibility per sizeIndex 0–5 using Tailwind mobile-first walk-down
  const hiddenAtSizeIndexes: number[] = [];
  for (let i = 0; i < MediaBreakpointKeys.length; i++) {
    let visible = baseVisible;
    for (let j = i; j >= 0; j--) {
      const bp = MediaBreakpointKeys[j];
      if (responsiveWhen[bp] !== undefined) {
        visible = resolveStaticBool(responsiveWhen[bp])!;
        break;
      }
    }
    if (!visible) hiddenAtSizeIndexes.push(i);
  }

  if (hiddenAtSizeIndexes.length === 0) return null; // always visible — no CSS class needed

  // All breakpoints hidden → just display: none (no container query needed)
  if (hiddenAtSizeIndexes.length === MediaBreakpointKeys.length) {
    return { display: "none" };
  }

  // Some breakpoints hidden → transparent wrapper, hidden at specific --screenSize values
  const containerQuery = hiddenAtSizeIndexes
    .map((i) => `style(--screenSize: ${i})`)
    .join(" or ");
  return {
    display: "contents",
    [`@container (${containerQuery})`]: { display: "none" },
  };
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
