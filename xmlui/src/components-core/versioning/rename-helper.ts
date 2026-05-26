/**
 * Prop rename helper.
 *
 * Applies declarative `PropRename` entries to a flat props bag, emitting
 * one `renamed-prop` diagnostic per rewrite. When both the old and the
 * new name are supplied, the new one wins and an additional `info`
 * diagnostic flags the conflict.
 *
 * See `dev-docs/plans/12-enforced-versioning.md` §2.4.
 */

import type { VersioningDiagnostic } from "./diagnostics";

export interface PropRename {
  /** Legacy prop name as it appeared in markup. */
  from: string;
  /** Current canonical prop name to rewrite to. */
  to: string;
  /** Semver of the version that introduced the rename. */
  deprecatedSince: string;
  /** Semver of the version in which the legacy name will be removed. */
  removedIn?: string;
  /** Optional value coercion applied during the rewrite. */
  transform?: (oldValue: unknown) => unknown;
}

export interface ApplyRenamesResult {
  props: Record<string, unknown>;
  diagnostics: VersioningDiagnostic[];
}

export function applyRenames(
  props: Record<string, unknown>,
  renames: readonly PropRename[],
  componentName?: string,
): ApplyRenamesResult {
  if (!renames || renames.length === 0) {
    return { props, diagnostics: [] };
  }
  const diagnostics: VersioningDiagnostic[] = [];
  const next: Record<string, unknown> = { ...props };
  for (const rename of renames) {
    const hasOld = Object.prototype.hasOwnProperty.call(next, rename.from);
    if (!hasOld) continue;
    const oldValue = next[rename.from];
    const hasNew = Object.prototype.hasOwnProperty.call(next, rename.to);
    if (hasNew) {
      // Conflict — new name wins; old value is dropped.
      delete next[rename.from];
      diagnostics.push({
        code: "renamed-prop",
        severity: "info",
        componentName,
        propName: rename.from,
        deprecatedSince: rename.deprecatedSince,
        removedIn: rename.removedIn,
        replacement: rename.to,
        message:
          `Prop "${rename.from}" is renamed to "${rename.to}". ` +
          `Both names were supplied; the new name takes precedence.`,
      });
      continue;
    }
    const newValue = rename.transform ? rename.transform(oldValue) : oldValue;
    next[rename.to] = newValue;
    delete next[rename.from];
    diagnostics.push({
      code: "renamed-prop",
      severity: "warn",
      componentName,
      propName: rename.from,
      deprecatedSince: rename.deprecatedSince,
      removedIn: rename.removedIn,
      replacement: rename.to,
      message:
        `Prop "${rename.from}" is renamed to "${rename.to}" ` +
        `(since ${rename.deprecatedSince}` +
        (rename.removedIn ? `, removed in ${rename.removedIn}` : "") +
        `). Use "${rename.to}" instead.`,
    });
  }
  return { props: next, diagnostics };
}
