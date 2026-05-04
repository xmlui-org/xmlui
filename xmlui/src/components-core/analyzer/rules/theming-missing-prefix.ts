/**
 * Rule: theming-missing-prefix
 *
 * Detects CSS variable references in `style=` or `vars=` attributes whose names
 * do not follow the established `PackagePrefix_ComponentName-token-name` convention.
 *
 * Status: **STUB** — rule is registered but emits no diagnostics.
 *
 * Full implementation requires:
 *   1. Parsing the value of `style` / `vars` attributes for `var(--...)` references.
 *   2. Looking up the referenced variable name against the prefix registry
 *      (`components-core/themevars/prefix-registry.ts`).
 *   3. Flagging variables whose prefix is absent or does not match any registered entry.
 *
 * See `dev-docs/plans/02-themed-css-variable-prefix-convention.md` for the full spec.
 */

import { registerRule } from "../rule-registry";

registerRule({
  code: "theming-missing-prefix",
  description:
    "CSS variable reference does not use the registered `PackagePrefix_ComponentName-` prefix convention.",
  defaultSeverity: "info",
  strictSeverity: "warn",
  appliesTo: "markup",
  run(_ctx) {
    // TODO(plan #02 Step 1): parse var(--...) references from style/vars attributes
    //   and validate prefix against BUILTIN_THEME_PREFIX_REGISTRY.
    return [];
  },
});
