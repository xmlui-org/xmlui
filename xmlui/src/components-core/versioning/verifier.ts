/**
 * Versioning verifier.
 *
 * `verifyVersioning()` walks a `ComponentDef` tree with the component
 * registry in hand and produces `VersioningDiagnostic` entries for every
 * deprecated / experimental / internal / removed / renamed API element
 * the markup references.
 *
 * The walker is **pure and synchronous** — it does not push to the
 * Inspector trace buffer directly. Callers (LSP, Vite plugin, runtime
 * echo) decide what to do with the results.
 *
 * Lifecycle semantics:
 *   - `status: "deprecated"` on a component → `deprecated-component`.
 *   - `status: "experimental"` → `experimental-use` (info).
 *   - `status: "internal"` → `internal-component-use` (warn; strict → error).
 *   - `PropertyDef.deprecationMessage` set → `deprecated-prop` (warn).
 *   - `PropertyDef.deprecatedSince` set, `removedIn` unset → `deprecated-prop`
 *     (warn) with the timeline in the message.
 *   - `PropertyDef.removedIn` set and current version ≥ removedIn →
 *     `removed-prop` (warn; strict → error).
 *   - `PropertyDef.replacement` set → appended to the message and exposed
 *     on the diagnostic.
 *
 * See `dev-docs/plans/12-enforced-versioning.md` Phases 1–2.
 */

import type {
  ComponentDef,
  ComponentMetadata,
  ComponentPropertyMetadata,
} from "../../abstractions/ComponentDefs";
import type { VersioningDiagnostic } from "./diagnostics";
import { compareSemver } from "./semver";

export interface VerifyVersioningOptions {
  /** When `true`, `removed-prop` and `internal-component-use` escalate to `error`. */
  strict?: boolean;
  /** Current framework semver. Used to evaluate `removedIn` against. */
  currentVersion?: string;
}

export function verifyVersioning(
  def: ComponentDef,
  registry: ReadonlyMap<string, ComponentMetadata>,
  opts?: VerifyVersioningOptions,
): VersioningDiagnostic[] {
  const { strict = false, currentVersion } = opts ?? {};
  const out: VersioningDiagnostic[] = [];
  visit(def);
  return out;

  function visit(node: ComponentDef | undefined): void {
    if (!node || typeof node !== "object") return;
    const typeName = node.type;
    if (typeof typeName !== "string" || typeName.length === 0) {
      recurse(node);
      return;
    }
    const meta = registry.get(typeName);
    if (!meta) {
      recurse(node);
      return;
    }

    if (meta.status === "deprecated") {
      out.push({
        code: "deprecated-component",
        severity: "warn",
        componentName: typeName,
        range: extractRange(node),
        message:
          `<${typeName}> is deprecated` +
          (meta.deprecationMessage ? `: ${meta.deprecationMessage}` : "."),
      });
    } else if (meta.status === "experimental") {
      out.push({
        code: "experimental-use",
        severity: "info",
        componentName: typeName,
        range: extractRange(node),
        message: `<${typeName}> is experimental; behavior may change.`,
      });
    } else if (meta.status === "internal") {
      out.push({
        code: "internal-component-use",
        severity: strict ? "error" : "warn",
        componentName: typeName,
        range: extractRange(node),
        message: `<${typeName}> is internal and should not be used in user markup.`,
      });
    }

    const metaProps = (meta.props ?? {}) as Record<string, ComponentPropertyMetadata>;
    const defProps = (node.props ?? {}) as Record<string, unknown>;
    for (const propName of Object.keys(defProps)) {
      const propMeta = metaProps[propName] as
        | (ComponentPropertyMetadata & {
            deprecatedSince?: string;
            removedIn?: string;
            replacement?: string;
          })
        | undefined;
      if (!propMeta) continue;

      const removedIn = propMeta.removedIn;
      const since = propMeta.deprecatedSince;
      const replacement = propMeta.replacement;

      if (removedIn && currentVersion && compareSemver(currentVersion, removedIn) >= 0) {
        out.push({
          code: "removed-prop",
          severity: strict ? "error" : "warn",
          componentName: typeName,
          propName,
          deprecatedSince: since,
          removedIn,
          replacement,
          range: extractRange(node),
          message:
            `Prop "${propName}" on <${typeName}> was removed in ${removedIn}` +
            (replacement ? `. Use ${replacement} instead.` : "."),
        });
        continue;
      }

      if (propMeta.deprecationMessage || since) {
        const parts: string[] = [];
        if (propMeta.deprecationMessage) parts.push(propMeta.deprecationMessage);
        if (since) parts.push(`Deprecated since ${since}.`);
        if (removedIn) parts.push(`Will be removed in ${removedIn}.`);
        if (replacement) parts.push(`Use ${replacement} instead.`);
        out.push({
          code: "deprecated-prop",
          severity: "warn",
          componentName: typeName,
          propName,
          deprecatedSince: since,
          removedIn,
          replacement,
          range: extractRange(node),
          message: `Prop "${propName}" on <${typeName}> is deprecated. ${parts.join(" ")}`.trim(),
        });
      }
    }

    const metaEvents = (meta.events ?? {}) as Record<string, any>;
    const defEvents = (node.events ?? {}) as Record<string, unknown>;
    for (const eventName of Object.keys(defEvents)) {
      const evMeta = metaEvents[eventName];
      if (evMeta && (evMeta.deprecationMessage || evMeta.deprecatedSince)) {
        out.push({
          code: "deprecated-event",
          severity: "warn",
          componentName: typeName,
          eventName,
          deprecatedSince: evMeta.deprecatedSince,
          removedIn: evMeta.removedIn,
          replacement: evMeta.replacement,
          range: extractRange(node),
          message:
            `Event "${eventName}" on <${typeName}> is deprecated` +
            (evMeta.deprecationMessage ? `: ${evMeta.deprecationMessage}` : "."),
        });
      }
    }

    recurse(node);
  }

  function recurse(node: ComponentDef): void {
    const children = (node as any).children;
    if (Array.isArray(children)) {
      for (const child of children) visit(child);
    } else if (children && typeof children === "object") {
      visit(children as ComponentDef);
    }
  }
}

function extractRange(node: any): VersioningDiagnostic["range"] {
  const range = node?.range ?? node?.loc;
  if (!range) return undefined;
  const line = typeof range.line === "number" ? range.line : range.start?.line;
  const col = typeof range.col === "number" ? range.col : range.start?.column;
  if (typeof line !== "number" || typeof col !== "number") return undefined;
  return { line, col };
}
