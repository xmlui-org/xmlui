/**
 * Prop coercion helpers — Plan #12 §2.2 / §2.3.
 *
 * Two pure functions that components can call when reading a prop value
 * so that `valueAliases` and `preserveLegacyDefaults` are honoured in a
 * uniform way:
 *
 * - `applyValueAliases(componentName, propName, value, propMeta)` —
 *   rewrites legacy enum values to their replacement and emits a
 *   `deprecated-value` runtime diagnostic.
 *
 * - `applyPreserveLegacyDefault(componentName, propName, value, propMeta, appGlobals)` —
 *   if the markup omitted the prop *and* the app opted back into the
 *   previous default via `appGlobals.preserveLegacyDefaults`, returns
 *   that previous default and emits a `default-value-changed` info
 *   diagnostic.
 *
 * Both helpers are deduped by the runtime echo so hot loops never flood
 * the trace.
 */

import type { ComponentPropertyMetadata } from "../../abstractions/ComponentDefs";
import { emitVersioningDiagnostics } from "./runtime";
import type { VersioningDiagnostic } from "./diagnostics";

/**
 * Rewrites a prop value if it matches one of `propMeta.valueAliases`.
 * Emits one `deprecated-value` diagnostic per (component, prop, from)
 * tuple per session (echo dedup).
 *
 * Returns the rewritten value, or the original value untouched when no
 * alias matches.
 */
export function applyValueAliases(
  componentName: string,
  propName: string,
  value: unknown,
  propMeta: ComponentPropertyMetadata | undefined,
): unknown {
  if (!propMeta?.valueAliases || !Array.isArray(propMeta.valueAliases)) return value;
  if (typeof value !== "string") return value;

  for (const alias of propMeta.valueAliases) {
    if (!alias || alias.from !== value) continue;
    const diag: VersioningDiagnostic = {
      code: "deprecated-value",
      severity: "warn",
      componentName,
      propName,
      deprecatedSince: alias.deprecatedSince,
      removedIn: alias.removedIn,
      replacement: alias.to,
      message:
        `Value "${alias.from}" of <${componentName} ${propName}> is deprecated since ` +
        `v${alias.deprecatedSince}. ` +
        (alias.removedIn ? `Will be removed in v${alias.removedIn}. ` : "") +
        `Use "${alias.to}" instead.`,
    };
    emitVersioningDiagnostics([diag]);
    return alias.to;
  }
  return value;
}

/**
 * When markup did not supply `propName` and the app opted back into a
 * previous default via `appGlobals.preserveLegacyDefaults` (a string[]
 * of `"Component.prop"` entries), returns the previous default value
 * recorded in `propMeta.defaultValueChangedIn` and emits a
 * `default-value-changed` info diagnostic.
 *
 * Returns `undefined` when the opt-back is not active — callers should
 * fall through to the framework's current default.
 */
export function applyPreserveLegacyDefault(
  componentName: string,
  propName: string,
  propMeta: ComponentPropertyMetadata | undefined,
  appGlobals: Record<string, unknown> | undefined,
): unknown {
  if (!propMeta?.defaultValueChangedIn || propMeta.defaultValueChangedIn.length === 0) {
    return undefined;
  }
  const list = (appGlobals as any)?.preserveLegacyDefaults;
  if (!Array.isArray(list)) return undefined;
  const key = `${componentName}.${propName}`;
  if (!list.includes(key)) return undefined;

  // Use the most recent recorded change as the "current vs previous" boundary.
  const last = propMeta.defaultValueChangedIn[propMeta.defaultValueChangedIn.length - 1];
  const diag: VersioningDiagnostic = {
    code: "default-value-changed",
    severity: "info",
    componentName,
    propName,
    deprecatedSince: last.version,
    message:
      `<${componentName} ${propName}> default was changed in v${last.version}. ` +
      `App.preserveLegacyDefaults pinned the previous default (${JSON.stringify(last.previousDefault)}).` +
      (last.note ? ` ${last.note}` : ""),
  };
  emitVersioningDiagnostics([diag]);
  return last.previousDefault;
}
