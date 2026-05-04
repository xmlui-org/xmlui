/**
 * Shared utilities for analyzer rules.
 *
 * All functions here are pure, synchronous, and have no side-effects.
 */

import type { ComponentDef } from "../../../abstractions/ComponentDefs";

// ---------------------------------------------------------------------------
// Levenshtein distance + closest match
// ---------------------------------------------------------------------------

/**
 * Compute the edit distance between two strings (Wagner–Fischer, O(mn)).
 * Returns the minimum number of single-character edits needed to transform
 * `a` into `b`.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Return the best candidate from `pool` within `maxDistance` of `target`,
 * or `undefined` if none is close enough.
 */
export function closestMatch(
  target: string,
  pool: ReadonlyArray<string>,
  maxDistance = 3,
): string | undefined {
  let best: string | undefined;
  let bestDist = maxDistance + 1;
  for (const candidate of pool) {
    const d = levenshtein(target, candidate);
    if (d < bestDist) {
      bestDist = d;
      best = candidate;
    }
  }
  return bestDist <= maxDistance ? best : undefined;
}

// ---------------------------------------------------------------------------
// Source offset → line / column conversion
// ---------------------------------------------------------------------------

/**
 * Convert a 0-based character offset in `source` to a 1-based `line`/`col`
 * pair suitable for `BuildDiagnostic`.
 */
export function offsetToLineCol(
  source: string,
  offset: number,
): { line: number; col: number } {
  const clamped = Math.max(0, Math.min(offset, source.length));
  let line = 1;
  let col = 1;
  for (let i = 0; i < clamped; i++) {
    if (source[i] === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { line, col };
}

// ---------------------------------------------------------------------------
// ComponentDef tree walker
// ---------------------------------------------------------------------------

/**
 * Walk a `ComponentDef` tree depth-first, invoking `visitor` for every node.
 *
 * `visitor` receives the node and its parent (or `undefined` for the root).
 * Returning `false` from `visitor` skips the current node's children.
 */
export function walkComponentDef(
  node: ComponentDef,
  visitor: (node: ComponentDef, parent: ComponentDef | undefined) => boolean | void,
  parent?: ComponentDef,
): void {
  const descend = visitor(node, parent);
  if (descend === false) return;

  if (node.children) {
    for (const child of node.children) {
      walkComponentDef(child, visitor, node);
    }
  }
  if (node.slots) {
    for (const slotChildren of Object.values(node.slots)) {
      for (const child of slotChildren) {
        walkComponentDef(child, visitor, node);
      }
    }
  }
  if (node.loaders) {
    for (const loader of node.loaders) {
      walkComponentDef(loader as ComponentDef, visitor, node);
    }
  }
}

// ---------------------------------------------------------------------------
// Framework-level props / events that every component inherits
// ---------------------------------------------------------------------------

/**
 * Attribute names that are part of the XMLUI core (`ComponentDefCore`) and
 * are valid on every component regardless of its metadata.
 */
export const FRAMEWORK_PROPS: ReadonlySet<string> = new Set([
  // ComponentDefCore fields
  "uid",
  "testId",
  "automationId",
  "ref",
  "when",
  "vars",
  "globalVars",
  "uses",
  "debug",
  "functions",
  "slot",
  // Responsive when variants  (when-xs, when-sm, when-md, when-lg, when-xl, when-xxl)
  "when-xs",
  "when-sm",
  "when-md",
  "when-lg",
  "when-xl",
  "when-xxl",
  // Standard HTML/styling props
  "style",
  "class",
  "className",
  // DataSource prop
  "dataSource",
]);

/**
 * Props contributed by XMLUI built-in behaviors (tooltip, label, variant,
 * bookmark, formBinding, validation, animation).
 *
 * These props are injected at runtime and will not appear in a component's
 * own `descriptor.props`; they must be allowed globally.
 */
export const BEHAVIOR_PROPS: ReadonlySet<string> = new Set([
  // --- TooltipBehavior
  "tooltip",
  "tooltipMarkdown",
  "tooltipOptions",
  // --- LabelBehavior
  "label",
  "labelPosition",
  "labelWidth",
  "labelBreak",
  "required",
  "enabled",
  "shrinkToLabel",
  "readOnly",
  "direction",
  "inputTemplate",
  // --- VariantBehavior
  "variant",
  // --- AnimationBehavior
  "animation",
  "animationOptions",
  // --- BookmarkBehavior
  "bookmark",
  "scrollOffset",
  // --- FormBindingBehavior
  "bindTo",
  "initialValue",
  "noSubmit",
  // --- ValidationBehavior
  "requiredInvalidMessage",
  "minLength",
  "maxLength",
  "lengthInvalidMessage",
  "lengthInvalidSeverity",
  "minValue",
  "maxValue",
  "rangeInvalidMessage",
  "rangeInvalidSeverity",
  "pattern",
  "patternInvalidMessage",
  "patternInvalidSeverity",
  "regex",
  "regexInvalidMessage",
  "regexInvalidSeverity",
  "validationMode",
  "customValidationsDebounce",
  "validationDisplayDelay",
  "verboseValidationFeedback",
  // --- PubSub / Interop (additional widely-used props)
  "onMount",
  "onUnmount",
  "onDidChange",
]);

/**
 * Returns `true` if `name` is a `data-*` custom attribute.
 */
export function isDataAttribute(name: string): boolean {
  return name.startsWith("data-");
}

/**
 * Returns `true` if `name` is a universally-allowed prop (framework or
 * behavior-contributed). Rules use this to suppress false positives.
 */
export function isAllowedGlobalProp(name: string): boolean {
  return FRAMEWORK_PROPS.has(name) || BEHAVIOR_PROPS.has(name) || isDataAttribute(name);
}
