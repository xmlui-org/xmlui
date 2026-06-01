/**
 * Rule: theming-missing-prefix
 *
 * Detects CSS theme-variable references in `style=` or `vars=` attribute values
 * that violate the package-prefix convention defined by plan #02.
 *
 * The canonical form for an extension package's theme variable is
 *   `--xmlui-<property>-<PackagePrefix>_<ComponentName>[-<variant>][--<state>]`
 * where `<PackagePrefix>` is the PascalCase token declared by the owning
 * extension package (`Extension.themeNamespacePrefix`) and registered
 * canonically in `components-core/themevars/prefix-registry.ts`.
 *
 * Two cases are flagged:
 *
 *   1. **Unknown prefix.** A `var(--xmlui-...-Foo_Bar...)` reference where
 *      `Foo` is not a registered prefix.  Typically a typo
 *      (`Animation_Button` instead of `Animations_Button`).
 *
 *   2. **Missing prefix.** A `var(--xmlui-...-Component...)` reference whose
 *      trailing component segment names a registered extension component
 *      that *requires* a prefix.  E.g. `var(--xmlui-backgroundColor-Viewer)`
 *      when `<Pdf_Viewer>` is the only `Viewer` component in the merged
 *      registry — the reference should read `Pdf_Viewer` instead.
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import type { ComponentDef } from "../../../abstractions/ComponentDefs";
import {
  BUILTIN_THEME_PREFIX_REGISTRY,
  getEntryByPrefix,
} from "../../themevars/prefix-registry";
import { closestMatch, offsetToLineCol, walkComponentDef } from "./_utils";

// Matches `var(--name[, fallback])` and captures the var name (with leading `--`).
const VAR_REF_RE = /var\(\s*(--[A-Za-z0-9_-]+)/g;

// Strip the canonical `--xmlui-` prefix; leave any other custom variable
// untouched so we don't false-positive on third-party `--foo-bar` names.
const XMLUI_VAR_PREFIX = "--xmlui-";

registerRule({
  code: "theming-missing-prefix",
  description:
    "CSS theme-variable reference does not use the registered `PackagePrefix_ComponentName` convention.",
  defaultSeverity: "info",
  strictSeverity: "warn",
  appliesTo: "markup",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    if (!ctx.markupAst) return;
    const root = ctx.markupAst as ComponentDef;
    const severity = ctx.strict ? "warn" : "info";

    // Pre-compute the lookup of bare component names → expected prefix token
    // (only those that *require* a prefix because their owning package declared
    // one). Used to detect "missing prefix" cases.
    const expectedPrefixByBareName = buildExpectedPrefixIndex(ctx);

    const knownPrefixes = BUILTIN_THEME_PREFIX_REGISTRY.map((e) => e.prefix);

    const diagnostics: BuildDiagnostic[] = [];

    walkComponentDef(root, (node) => {
      const props = node.props as Record<string, unknown> | undefined;
      if (!props || typeof props !== "object") return;
      const baseOffset = (node.debug?.source as any)?.start ?? 0;

      for (const attrName of ["style", "vars"] as const) {
        collectVarReferences(props[attrName]).forEach((varName) => {
          checkVarName(varName, {
            file: ctx.file,
            source: ctx.source,
            baseOffset,
            severity,
            knownPrefixes,
            expectedPrefixByBareName,
            sink: diagnostics,
          });
        });
      }
    });

    yield* diagnostics;
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively collect every `var(--name)` reference from a string or nested object. */
function collectVarReferences(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === "string") {
    const refs: string[] = [];
    VAR_REF_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = VAR_REF_RE.exec(value)) !== null) {
      refs.push(m[1]);
    }
    return refs;
  }
  if (Array.isArray(value)) {
    return value.flatMap((v) => collectVarReferences(v));
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((v) =>
      collectVarReferences(v),
    );
  }
  return [];
}

interface CheckOptions {
  file: string;
  source: string;
  baseOffset: number;
  severity: "warn" | "info";
  knownPrefixes: string[];
  expectedPrefixByBareName: Map<string, string>;
  sink: BuildDiagnostic[];
}

function checkVarName(varName: string, opts: CheckOptions): void {
  // Only validate the canonical `--xmlui-...` namespace; leave custom user vars alone.
  if (!varName.startsWith(XMLUI_VAR_PREFIX)) return;

  const body = varName.slice(XMLUI_VAR_PREFIX.length);
  // Split on the segment separator, but treat the variant `--` separator as a
  // boundary too (everything after `--` is a state modifier we don't care about
  // for prefix validation).
  const [withoutState] = body.split("--", 1);
  const segments = withoutState.split("-").filter(Boolean);

  for (const segment of segments) {
    if (segment.includes("_")) {
      // Case 1: unknown prefix
      const [prefixToken] = segment.split("_", 1);
      if (!getEntryByPrefix(prefixToken)) {
        const suggestion = closestMatch(prefixToken, opts.knownPrefixes);
        const { line, col } = offsetToLineCol(opts.source, opts.baseOffset);
        opts.sink.push({
          code: "theming-missing-prefix",
          severity: opts.severity,
          file: opts.file,
          line,
          column: col,
          length: varName.length,
          message:
            `Theme-variable reference "${varName}" uses unknown package prefix "${prefixToken}".` +
            (suggestion ? ` Did you mean "${suggestion}_..."?` : ""),
          data: { varName, prefix: prefixToken },
          suggestions: suggestion
            ? [{ title: `Replace with "${suggestion}_..."` }]
            : undefined,
        });
        return; // one diagnostic per var ref is enough
      }
    } else {
      // Case 2: bare segment that names a known prefixed component
      const expected = opts.expectedPrefixByBareName.get(segment);
      if (expected) {
        const { line, col } = offsetToLineCol(opts.source, opts.baseOffset);
        opts.sink.push({
          code: "theming-missing-prefix",
          severity: opts.severity,
          file: opts.file,
          line,
          column: col,
          length: varName.length,
          message:
            `Theme-variable reference "${varName}" omits the "${expected}_" package prefix ` +
            `expected for "<${segment}>" — use "${expected}_${segment}" instead.`,
          data: { varName, componentName: segment, expectedPrefix: expected },
          suggestions: [
            { title: `Use "${expected}_${segment}"`, replacement: `${expected}_${segment}` },
          ],
        });
        return;
      }
    }
  }
}

/**
 * Build a map from bare component name → expected prefix token, populated only
 * for components whose owning extension package declared a
 * `themeNamespacePrefix`.  Used to detect references that omit the required
 * prefix.
 */
function buildExpectedPrefixIndex(ctx: RuleContext): Map<string, string> {
  const map = new Map<string, string>();
  const registry = ctx.componentRegistry as any;
  if (!registry || typeof registry.getComponentNames !== "function") return map;
  for (const name of registry.getComponentNames() as readonly string[]) {
    const entry = registry.lookupComponentRenderer?.(name);
    const prefix: string | undefined = entry?.themeNamespacePrefix;
    if (prefix) {
      // The registry stores the *full* component name including prefix
      // (e.g. `Pdf_Viewer`).  Index by the bare suffix so a reference to
      // `Viewer` flags as missing-prefix.
      const bare = name.startsWith(`${prefix}_`) ? name.slice(prefix.length + 1) : name;
      // Only record when the bare form is unambiguous: a different package's
      // component with the same bare name would make a suggestion misleading.
      if (map.has(bare)) {
        map.set(bare, ""); // mark as ambiguous → suppress suggestion
      } else {
        map.set(bare, prefix);
      }
    }
  }
  // Drop ambiguous entries.
  for (const [k, v] of map) {
    if (!v) map.delete(k);
  }
  return map;
}

