/**
 * Rule family: versioning
 *
 * Surfaces the diagnostics produced by `verifyVersioning()` (plan #12)
 * through the analyzer pipeline so the LSP, the Vite plugin, and the
 * `xmlui check` CLI all report the same deprecation / removal findings
 * as the runtime echo.
 *
 * One rule per `VersioningDiagnosticCode` is registered so each can be
 * filtered, suppressed, or escalated independently via `xmlui.config.json`.
 *
 * Severity matrix:
 *
 *   | code                     | default | strict |
 *   |--------------------------|---------|--------|
 *   | deprecated-component     | warn    | warn   |
 *   | deprecated-prop          | warn    | warn   |
 *   | deprecated-event         | warn    | warn   |
 *   | deprecated-method        | warn    | warn   |
 *   | deprecated-value         | warn    | warn   |
 *   | renamed-prop             | warn    | warn   |
 *   | experimental-use         | info    | info   |
 *   | default-value-changed    | info    | info   |
 *   | removed-prop             | warn    | error  |
 *   | internal-component-use   | warn    | error  |
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import type { AnalyzerRule } from "../rule-registry";
import type { ComponentDef, ComponentMetadata } from "../../../abstractions/ComponentDefs";
import type {
  VersioningDiagnostic,
  VersioningDiagnosticCode,
} from "../../versioning/diagnostics";
import { verifyVersioning } from "../../versioning/verifier";
import { offsetToLineCol } from "./_utils";

type Severity = "error" | "warn" | "info";

interface VersioningRuleSpec {
  code: VersioningDiagnosticCode;
  description: string;
  defaultSeverity: Severity;
  strictSeverity: Severity;
}

const SPECS: ReadonlyArray<VersioningRuleSpec> = [
  {
    code: "deprecated-component",
    description: "The component is marked deprecated by its metadata.",
    defaultSeverity: "warn",
    strictSeverity: "warn",
  },
  {
    code: "deprecated-prop",
    description: "The prop is marked deprecated by the component's metadata.",
    defaultSeverity: "warn",
    strictSeverity: "warn",
  },
  {
    code: "deprecated-event",
    description: "The event is marked deprecated by the component's metadata.",
    defaultSeverity: "warn",
    strictSeverity: "warn",
  },
  {
    code: "deprecated-method",
    description: "The exposed method is marked deprecated.",
    defaultSeverity: "warn",
    strictSeverity: "warn",
  },
  {
    code: "deprecated-value",
    description: "The prop value was rewritten through a deprecation alias.",
    defaultSeverity: "warn",
    strictSeverity: "warn",
  },
  {
    code: "renamed-prop",
    description: "The prop name was renamed; using the old name still works through an alias.",
    defaultSeverity: "warn",
    strictSeverity: "warn",
  },
  {
    code: "experimental-use",
    description: "The component or prop is marked experimental; behavior may change.",
    defaultSeverity: "info",
    strictSeverity: "info",
  },
  {
    code: "default-value-changed",
    description:
      "A previous default value was preserved via App.preserveLegacyDefaults.",
    defaultSeverity: "info",
    strictSeverity: "info",
  },
  {
    code: "removed-prop",
    description: "The prop's removedIn version is ≤ the current framework version.",
    defaultSeverity: "warn",
    strictSeverity: "error",
  },
  {
    code: "internal-component-use",
    description: "The component is marked internal and should not appear in user markup.",
    defaultSeverity: "warn",
    strictSeverity: "error",
  },
];

/**
 * Result cache keyed by `(file, source.length, registry-identity)`. The
 * analyzer runs rules one at a time per file, so caching the full
 * diagnostic batch keeps the second through tenth rule O(1).
 */
const cache = new WeakMap<object, Map<string, VersioningDiagnostic[]>>();

function getDiagnostics(ctx: RuleContext): VersioningDiagnostic[] {
  if (!ctx.markupAst || !ctx.componentRegistry) return [];
  const registry = ctx.componentRegistry;
  let perRegistry = cache.get(registry as object);
  if (!perRegistry) {
    perRegistry = new Map();
    cache.set(registry as object, perRegistry);
  }
  const cacheKey = `${ctx.file}::${ctx.source.length}::${ctx.strict ? 1 : 0}`;
  const cached = perRegistry.get(cacheKey);
  if (cached) return cached;

  const root = ctx.markupAst as ComponentDef;
  const lookup = (name: string): ComponentMetadata | undefined => {
    const entry = registry.lookupComponentRenderer(name);
    return (entry?.descriptor ?? undefined) as ComponentMetadata | undefined;
  };
  const diagnostics = verifyVersioning(root, lookup, { strict: ctx.strict });
  perRegistry.set(cacheKey, diagnostics);
  return diagnostics;
}

function toBuildDiagnostic(
  d: VersioningDiagnostic,
  ctx: RuleContext,
  severity: Severity,
): BuildDiagnostic {
  let line = 1;
  let column = 1;
  let length = 0;
  if (d.sourceOffset !== undefined) {
    const lc = offsetToLineCol(ctx.source, d.sourceOffset);
    line = lc.line;
    column = lc.col;
    length = (d.componentName?.length ?? 0) + 1; // approximate token length
  } else if (d.range) {
    line = d.range.line || 1;
    column = d.range.col || 1;
    length = d.range.length ?? 0;
  }
  return {
    code: d.code,
    severity,
    file: ctx.file,
    line,
    column,
    length,
    message: d.message,
    data: {
      componentName: d.componentName,
      propName: d.propName,
      eventName: d.eventName,
      methodName: d.methodName,
      deprecatedSince: d.deprecatedSince,
      removedIn: d.removedIn,
      replacement: d.replacement,
    },
  };
}

function makeRule(spec: VersioningRuleSpec): AnalyzerRule {
  return {
    code: spec.code,
    description: spec.description,
    defaultSeverity: spec.defaultSeverity,
    strictSeverity: spec.strictSeverity,
    appliesTo: "markup",
    *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
      const diags = getDiagnostics(ctx);
      const severity = ctx.strict ? spec.strictSeverity : spec.defaultSeverity;
      for (const d of diags) {
        if (d.code === spec.code) {
          yield toBuildDiagnostic(d, ctx, severity);
        }
      }
    },
  };
}

for (const spec of SPECS) {
  registerRule(makeRule(spec));
}
