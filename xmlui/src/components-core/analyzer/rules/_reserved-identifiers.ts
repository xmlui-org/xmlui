/**
 * Reserved identifiers — names that always resolve at runtime even when no
 * matching declaration appears in markup.
 *
 * Used by `expr-unbound-identifier` and `id-undefined-component-ref` to
 * suppress false positives.
 */

/** Framework-provided context variables (always prefixed with `$`). */
export const FRAMEWORK_CONTEXT_VARS: ReadonlySet<string> = new Set([
  "$cancel",
  "$error",
  "$event",
  "$routeParams",
  "$queryParams",
  "$item",
  "$itemIndex",
  "$index",
  "$key",
  "$value",
  "$lastValue",
  "$result",
  "$retry",
  "$data",
  "$path",
  "$loaded",
  "$state",
  "$param",
  "$props",
  "$slot",
  "$this",
  "$prop",
  "$row",
  "$rowIndex",
  "$column",
  "$cell",
  "$step",
  "$tab",
  "$dirty",
  "$touched",
  "$valid",
  "$validationResult",
  "$invalid",
  "$initialValue",
]);

/** Global app namespaces. */
export const GLOBAL_NAMESPACES: ReadonlySet<string> = new Set([
  "App",
  "Actions",
  "Math",
  "JSON",
  "Object",
  "Array",
  "String",
  "Number",
  "Boolean",
  "Date",
  "RegExp",
  "Map",
  "Set",
  "Promise",
  "Error",
  "console",
  "window",
  "document",
  "navigator",
  "location",
  "localStorage",
  "sessionStorage",
  "globalThis",
]);

/**
 * Names that always resolve regardless of any user declaration. Includes
 * literals (`true`, `false`, `null`, `undefined`, `this`), JS built-ins,
 * and well-known globals.
 */
export const JS_LITERALS_AND_BUILTINS: ReadonlySet<string> = new Set([
  "true",
  "false",
  "null",
  "undefined",
  "this",
  "NaN",
  "Infinity",
  "parseInt",
  "parseFloat",
  "isNaN",
  "isFinite",
  "encodeURI",
  "encodeURIComponent",
  "decodeURI",
  "decodeURIComponent",
  "setTimeout",
  "clearTimeout",
  "setInterval",
  "clearInterval",
]);

/**
 * Names of built-in XMLUI helper functions exposed on the expression scope.
 * Coarse list — refined as needed; over-coverage simply suppresses warnings.
 */
export const XMLUI_GLOBALS: ReadonlySet<string> = new Set([
  // App-context functions
  "navigate",
  "toast",
  "confirm",
  "alert",
  "prompt",
  "delay",
  "now",
  "today",
  "formatDate",
  "formatNumber",
  "formatTime",
  "formatPercentage",
  "formatCurrency",
  "emitEvent",
  "hasEventHandler",
  "updateState",
  "debounce",
  "readLocalStorage",
  "writeLocalStorage",
  "loggedInUser",
  "setLoggedInUser",
  // Useful XMLUI helpers — kept open so the rule errs on the side of silence
  "Page",
  "Pages",
  "Theme",
  "Lifecycle",
  "DataSource",
  "APICall",
  "ApiInstance",
]);

const ALL_RESERVED = new Set<string>([
  ...FRAMEWORK_CONTEXT_VARS,
  ...GLOBAL_NAMESPACES,
  ...JS_LITERALS_AND_BUILTINS,
  ...XMLUI_GLOBALS,
]);

/**
 * Return `true` when `name` is a built-in / framework-provided identifier
 * that will always resolve at runtime — regardless of any user declaration.
 *
 * Identifiers starting with `$` are also treated as reserved (framework
 * context variables follow this convention).
 */
export function isReservedRoot(name: string): boolean {
  if (!name) return true;
  if (name.startsWith("$")) return true;
  return ALL_RESERVED.has(name);
}

export const RESERVED_IDENTIFIERS = ALL_RESERVED;
