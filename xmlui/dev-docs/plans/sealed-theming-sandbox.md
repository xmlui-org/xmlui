# Sealed Theming Sandbox — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §8 "Styling and Theming Sandbox"](../managed-react.md) and the §17 scorecard row **"Theming sandbox — Mostly scoped."**

---

## Goal

Close the §17 scorecard row:

> **Theming sandbox — Mostly scoped.**
> Path to managed: *Typed theme variables; restrict inline-style escape hatch.*

Today XMLUI's styling is sandboxed by default: every component imports a
`.module.scss` whose class names are mangled (`Button_component__a1b2c`),
theme values are CSS custom properties (`--xmlui-*`) injected by
[`StyleProvider`](../../src/components-core/theming/StyleContext.tsx), and
themes merge left-to-right with `$reference` resolution. The sandbox is
porous in two places:

1. **Inline `style` props are not scoped.** Layout props such as
   `paddingHorizontal`, `width`, `height`, `style` translate to inline
   styles; a sufficiently determined user can pass arbitrary CSS strings
   through these channels — including `position: fixed`, `z-index: 99999`,
   `pointer-events: none`, or `background: url(javascript:...)` (caught
   by the URL parser today, but still illustrative).
2. **Theme values are not validated.** A theme variable typed
   semantically as a colour can hold any string. There is no
   `Color`/`Length`/`Number` theme variable type system. A typo
   (`backgroundColor-Button: "#abc def"`) silently produces an invalid
   CSS declaration that the browser drops.

The third gap §8 names — *"Themes can only override known variables"* —
is already covered by the in-flight
[themevars-namespace](./themevars-namespace.md) plan; this plan does not
duplicate it.

The work is split into small, independently shippable, independently
testable steps in priority order:

1. **Typed theme variables** — declare a value type per variable in
   metadata; validate at theme-resolution time.
2. **Restricted inline-style props** — funnel `style` and per-prop
   layout values through a token allowlist instead of accepting raw
   CSS strings.
3. **Theme-time CSS lint** — catch invalid declarations (bad colour
   syntax, unknown units, unsupported `!important`) before they reach
   the DOM.
4. **Strict default flip** + documentation.

Every step lands behind a single `App.appGlobals.strictTheming` switch
(see Step 0) so the rollout can stage warn → opt-in → default-on
without touching call sites.

---

## Conventions

- **Source of truth for theme resolution:**
  [`StyleProvider`](../../src/components-core/theming/StyleContext.tsx)
  and the resolver it consumes. The validator hooks into the same
  pass that produces the merged theme — one extra map traversal, no
  re-parse.
- **Source of truth for theme variable declarations:** the `themeVars`
  metadata block on each component (the same registry the
  [verified-type-contracts plan](./verified-type-contracts.md) consumes
  for prop validation). Today the block carries `name` and
  `description`; this plan adds `valueType`.
- **Source of truth for inline-style props:** the
  [`valueExtractor`](../../src/components-core/rendering/valueExtractor.ts)
  helpers `asLength`, `asColor`, etc. (extended by the
  verified-type-contracts plan Step 1.1). The `style` prop and the
  layout shorthand props (`padding*`, `margin*`, `width`, `height`,
  `gap`, `border*`, `boxShadow`, …) all pass through these helpers.
- **Existing infrastructure to reuse — do not reinvent:**
  - The theme-resolution pass in
    [`StyleProvider`](../../src/components-core/theming/StyleContext.tsx)
    already walks every variable to apply `$reference` chains; the
    validator runs in the same loop.
  - The
    [`valueExtractor`](../../src/components-core/rendering/valueExtractor.ts)
    coercion table from the verified-type-contracts plan provides
    `verify()` + `coerce()` for `color`, `length`, `url`, etc. The
    theme validator and inline-style validator both call the same
    rule table — single chokepoint by construction.
- **New module location:**
  `xmlui/src/components-core/theming/validator/` (new directory)
  alongside the existing theming code — keeps the validator,
  rule-table delegate, and diagnostic formatter together.
- **Diagnostic shape:** new `ThemeDiagnostic` carrying
  `{ code: ThemeDiagnosticCode, severity: "error" | "warn",
  variableName?, propName?, componentName?, expected?, actual?,
  message }` where `ThemeDiagnosticCode ∈ { "invalid-theme-value",
  "unknown-theme-variable", "raw-css-in-prop", "important-blocked",
  "url-in-style", "position-fixed-blocked" }`.
- **Reporting mode:** when `strictTheming === false` (default during
  rollout) violations emit warn-level entries through the trace
  (`kind: "theming"`). In strict mode, `raw-css-in-prop`,
  `url-in-style`, and `position-fixed-blocked` upgrade to `error`
  and the offending declaration is dropped (the rest of the style
  string still applies).
- **Test layout:** unit tests under
  `xmlui/tests/components-core/theming/validator/`; one spec per step.
  End-to-end tests under `xmlui/tests-e2e/theming/`.

Each step lists: scope, files touched, tests, acceptance criteria,
dependencies.

---

## Step 0 — Switch + Validator Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictTheming: boolean` (default `false`) and
  `App.appGlobals.allowInlineRawCss: boolean` (default `true`; flips
  to `false` in the next major).
- Create `xmlui/src/components-core/theming/validator/` with three
  exported surfaces, all empty stubs:

  ```ts
  // diagnostics.ts
  export type ThemeDiagnosticCode =
    | "invalid-theme-value"
    | "unknown-theme-variable"
    | "raw-css-in-prop"
    | "important-blocked"
    | "url-in-style"
    | "position-fixed-blocked";
  export interface ThemeDiagnostic {
    code: ThemeDiagnosticCode;
    severity: "error" | "warn";
    variableName?: string;
    propName?: string;
    componentName?: string;
    expected?: string;
    actual?: string;
    message: string;
  }
  ```

  ```ts
  // theme-validator.ts
  import type { ThemeVarMetadata } from "...";
  export function validateTheme(
    resolved: ReadonlyMap<string, string>,           // var name → value
    declarations: ReadonlyMap<string, ThemeVarMetadata>,
    opts?: { strict?: boolean },
  ): ThemeDiagnostic[];
  ```

  ```ts
  // style-prop-validator.ts
  export interface InlineStyleContext {
    componentName: string;
    propName: string;
    rawValue: string | number | undefined;
  }
  export function validateInlineStyle(
    ctx: InlineStyleContext,
    opts?: { strict?: boolean; allowRawCss?: boolean },
  ): { value: string | number | undefined; diagnostics: ThemeDiagnostic[] };
  ```

  ```ts
  // index.ts — barrel
  ```

- Wire `"theming"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document the two new appGlobals keys in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).

### Files

- `xmlui/src/components-core/theming/validator/theme-validator.ts` (new)
- `xmlui/src/components-core/theming/validator/style-prop-validator.ts` (new)
- `xmlui/src/components-core/theming/validator/diagnostics.ts` (new)
- `xmlui/src/components-core/theming/validator/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `theming/validator/theme-validator.test.ts`
  - Empty resolved map returns no diagnostics.
  - Validator with no declarations tolerates any input.

### Acceptance

- `strictTheming` and `allowInlineRawCss` read through `App.appGlobals`.
- New module compiles; barrel exports are stable.
- No existing test changes behaviour.

### Dependencies

None.

---

## Phase 1 — Typed Theme Variables

The theme variable declaration today carries `name` and `description`.
This phase adds `valueType` so values can be validated structurally —
the same vocabulary the
[verified-type-contracts plan](./verified-type-contracts.md) introduces
for props.

### Step 1.1 — Extend Theme Variable Metadata

**Priority:** 1

#### Scope

- Extend the theme variable declaration shape with an optional
  `valueType`:

  ```ts
  export type ThemeValueType =
    | "color" | "length" | "integer" | "number"
    | "duration" | "easing" | "shadow" | "border"
    | "fontFamily" | "fontWeight" | "lineHeight"
    | "string";        // free-form; opts out of validation
  export interface ThemeVarMetadata {
    name: string;
    description?: string;
    valueType?: ThemeValueType;          // default "string" (opt-out)
    availableValues?: readonly string[]; // closed enum
  }
  ```

- Annotate every built-in component's `themeVars` block with
  `valueType`. Pure metadata change; no runtime behaviour shift.
- Reuse the `coercionRules` table from the verified-type-contracts
  plan Step 1.2 — `color`, `length`, `integer`, `number` share rules
  with their prop-side counterparts. New rules introduced here:
  - `duration` — `<number>(ms|s)`.
  - `easing` — `linear | ease | ease-in | ease-out | ease-in-out |
    cubic-bezier(...) | steps(...)`.
  - `shadow` — comma-separated `<offset-x> <offset-y> [blur]
    [spread] [color] [inset]`.
  - `border` — `<length> <line-style> [<color>]` shorthand.
  - `fontFamily` — comma-separated stack with quoted family names.
  - `fontWeight` — `100..900` step 100, or
    `normal|bold|lighter|bolder`.
  - `lineHeight` — number or length.

#### Files

- `xmlui/src/abstractions/ComponentDefs.ts` (extend `ThemeVarMetadata`)
- `xmlui/src/components-core/theming/validator/rules/` (new directory;
  one file per new rule: `duration.ts`, `easing.ts`, `shadow.ts`,
  `border.ts`, `fontFamily.ts`, `fontWeight.ts`, `lineHeight.ts`)
- Each built-in component's `themeVars` annotation file (Button,
  TextBox, Modal, etc.)

#### Tests

- `theming/validator/rules/*.test.ts`, one per rule:
  - Positive cases (valid input → no diagnostic).
  - Negative cases (invalid input → exact diagnostic shape).
  - Boundary cases (empty string, multi-value where applicable).

#### Acceptance

- All new types are documented in
  [`.ai/xmlui/theming-styling.md`](../../../.ai/xmlui/theming-styling.md).
- Existing theme overrides compile unchanged — `valueType: "string"`
  is the default opt-out so legacy declarations are not affected
  until they are explicitly annotated.

#### Dependencies

Step 0; verified-type-contracts plan Step 1.2 (coercion rule table).

---

### Step 1.2 — Validate Theme at Resolution Time

**Priority:** 2

#### Scope

- In
  [`StyleProvider`](../../src/components-core/theming/StyleContext.tsx),
  after the merged theme is resolved (existing `$reference` walk),
  call `validateTheme(resolved, declarations)`.
- For each `ThemeDiagnostic`:
  - In non-strict mode, emit a `kind: "theming"` warn trace and
    keep the value (the browser will drop it if invalid).
  - In strict mode, drop the declaration from the resolved map and
    emit an `error` trace plus a one-shot toast.
- Validation is dev-only by default (gated by `import.meta.env.DEV`
  in Vite, and by `strictTheming` in standalone) — zero production
  cost when both are off.

#### Files

- `xmlui/src/components-core/theming/StyleContext.tsx`
- `xmlui/src/components-core/theming/validator/theme-validator.ts`
  (fill in)

#### Tests

- `theming/validator/theme-validator.test.ts`
  - A theme override `backgroundColor-Button: "not a color"` produces
    `code: "invalid-theme-value", expected: "color"`.
  - Override of an unknown variable produces
    `code: "unknown-theme-variable"` (warn even in strict —
    third-party extension packages may register variables late).
  - The default theme passes with zero diagnostics.

#### Acceptance

- Default theme is diagnostic-clean.
- Custom themes with errors produce actionable warnings without
  breaking the app.
- Dev build of the docs site runs the validator with no perf
  regression > 5 ms on theme switch.

#### Dependencies

Step 1.1.

---

## Phase 2 — Restricted Inline-Style Surface

The bigger leak is the inline-style boundary. Today
`<Stack style="position: fixed; z-index: 99999;" />` works. Layout
shorthand props (`width`, `paddingHorizontal`, etc.) accept arbitrary
CSS-length strings including units like `1in` or unknown
calc-expressions.

### Step 2.1 — Token Allowlist for Layout Props

**Priority:** 3

#### Scope

- The base-component layout props (`width`, `height`, `minWidth`,
  `maxWidth`, `minHeight`, `maxHeight`, `padding*`, `margin*`, `gap`,
  `border*`, `borderRadius`, `boxShadow`, `opacity`, `zIndex`) all
  pass through `validateInlineStyle()` with the appropriate
  `ThemeValueType`.
- For `length`-typed props, accept only:
  - bare numbers (interpreted as px),
  - `<number>(px|rem|em|%|vw|vh|fr|auto)`,
  - theme references (`{$themevar}` resolved server-side),
  - `calc(...)` with operands matching the same allowlist (no nested
    `var()` outside `--xmlui-*`).
- Reject `cm|in|mm|pt|pc` (print units; rare and often a typo) and
  units the validator does not recognise. In non-strict mode, emit
  a warn and drop the declaration; in strict mode, emit an error
  and drop.
- For `zIndex`, cap at a configurable ceiling
  (`App.appGlobals.maxZIndex`, default `9999`). Higher values are
  clamped with a warn — addresses the "z-index: 999999" escape.

#### Files

- `xmlui/src/components-core/rendering/valueExtractor.ts` (the
  layout-prop coercion path)
- `xmlui/src/components-core/theming/validator/style-prop-validator.ts`
  (fill in)

#### Tests

- `theming/validator/style-prop-validator.test.ts`
  - `width="100px"` passes.
  - `width="1in"` warns (non-strict) / errors (strict).
  - `zIndex={999999}` clamps to `9999` with a warn.
  - `paddingHorizontal="20px 10px"` (multi-value where single
    expected) warns.

#### Acceptance

- All in-repo example markup passes with the validator on.
- Layout-prop perf overhead < 1 ms per component on the docs site.

#### Dependencies

Step 0; verified-type-contracts plan Step 1.1 (`length` rule).

---

### Step 2.2 — `style` Prop Token Funnel

**Priority:** 4

#### Scope

- The catch-all `style` prop (today: any CSS string) is parsed into
  individual declarations and each declaration is validated against
  the same rule table as the layout props.
- Banned declarations (warn in non-strict, drop+error in strict):
  - `position: fixed | sticky` — escapes parent stacking context.
    Components that legitimately need fixed positioning
    (`Modal`, `Drawer`, `Toast`, `Popover`) are framework-internal;
    user markup uses those components instead.
  - `pointer-events: none` on a non-decorative element — accessibility
    hazard.
  - Any URL value (`url(...)`) when `App.appGlobals.allowInlineRawCss
    === false`. URLs in styles are a known XSS exfil channel; the
    framework already provides `<Image src>` and theme variables
    for the legitimate cases.
  - `!important` flag on any declaration when
    `App.appGlobals.allowInlineRawCss === false` — defeats theme
    cascade.
- Properties not in the rule table (`grid-template-areas`,
  `clip-path`, …) are accepted in non-strict mode with a one-shot
  warn ("style property `<name>` is not validated; consider using
  a typed theme variable"). In strict mode they are accepted only
  if `allowInlineRawCss: true`.

#### Files

- `xmlui/src/components-core/rendering/valueExtractor.ts` (the
  `style`-prop path)
- `xmlui/src/components-core/theming/validator/style-prop-validator.ts`

#### Tests

- `theming/validator/style-prop.test.ts`
  - `style="background: red"` passes (plain `background` rule
    delegates to `color`).
  - `style="position: fixed"` → `position-fixed-blocked` warn /
    drop in strict.
  - `style="background: url(http://evil.example/x)"` →
    `url-in-style` warn / drop in strict (when
    `allowInlineRawCss: false`).
  - `style="z-index: 9999 !important"` → `important-blocked` warn
    / drop in strict (when `allowInlineRawCss: false`).
- `tests-e2e/theming/style-prop.spec.ts`
  - End-to-end: a fixture page with each violation pattern produces
    the expected diagnostic and renders without the offending
    declaration in strict mode.

#### Acceptance

- All in-repo example markup passes (some may need updates if they
  use `position: fixed` directly — those should migrate to
  `<Modal>` / `<Drawer>` / `<Popover>`).
- Perf overhead < 1 ms per `style`-prop-bearing component.

#### Dependencies

Step 2.1.

---

## Phase 3 — Documentation & Strict Default

### Step 3.1 — Theming Sandbox Chapter

**Priority:** 5

#### Scope

- New `xmlui/dev-docs/guide/31-theming-sandbox.md` chapter.
- Updates
  [`.ai/xmlui/theming-styling.md`](../../../.ai/xmlui/theming-styling.md)
  with the typed-variable vocabulary and the inline-style
  restriction list.
- Updates [`managed-react.md` §8](../managed-react.md) to mark the
  asymmetry resolved.
- Updates the §17 scorecard row from
  *"Mostly scoped"* to
  *"Sealed — typed theme variables, validated inline styles,
  position/!important/url restrictions."*
- Updates [`AGENTS.md` documentation map](../../../AGENTS.md).

#### Files

- `xmlui/dev-docs/guide/31-theming-sandbox.md` (new)
- `.ai/xmlui/theming-styling.md`
- `xmlui/dev-docs/managed-react.md`
- `AGENTS.md`

#### Acceptance

- Both chapters cover the three mechanisms (typed theme variables,
  validated layout props, `style` prop funnel) with at least one
  worked example each.
- A "rule reference" table lists every `ThemeDiagnosticCode` with
  cause, severity in non-strict / strict, and example fix.
- Migration section: "Replacing `style='position: fixed'` with
  `<Modal>` / `<Drawer>` / `<Popover>`".

#### Dependencies

Steps 1.1, 1.2, 2.1, 2.2.

---

### Step 3.2 — Default `strictTheming: true` and `allowInlineRawCss: false` in Next Major

**Priority:** 6 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip both
  defaults in the next major release:
  - `strictTheming: true`
  - `allowInlineRawCss: false`
- Add a changeset and migration note: invalid theme values, unknown
  layout units, `position: fixed`, `!important`, and inline `url()`
  now drop with an error.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts` (default flips)
- `.changeset/strict-theming-default.md`
- `xmlui/dev-docs/guide/31-theming-sandbox.md` (migration section)

#### Tests

- Existing test suite passes with the defaults flipped.
- A new spec under `xmlui/tests-e2e/theming/strict-mode.spec.ts`
  covers each diagnostic code producing the expected behaviour.

#### Acceptance

- All in-repo example apps and the docs site pass under strict mode.

#### Dependencies

Step 3.1.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **Foundations** | 0, 1.1 | Theme metadata extended; no user-visible behaviour | Next minor |
| **Theme validation** | 1.2 | Theme-time warnings on invalid values | Next minor + 1 |
| **Layout props** | 2.1 | Layout-prop value validation; z-index ceiling | Next minor + 1 |
| **`style` funnel** | 2.2 | `style` prop validated; `position`/`url`/`!important` warns | Next minor + 2 |
| **Docs + strict default** | 3.1, 3.2 | Guide chapter; strict-mode defaults in next major | Next major |

Each step is independently revertible: removing the
`validateTheme()` call from `StyleProvider` reverts theme behaviour;
removing the `validateInlineStyle()` call from `valueExtractor`
reverts inline-style behaviour.

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   ├─> Step 1.1 (extend ThemeVarMetadata)
   │      │
   │      └─> Step 1.2 (validate at theme resolution)
   │
   ├─> Step 2.1 (layout-prop allowlist)
   │      │
   │      └─> Step 2.2 (style-prop funnel)
   │
   └─────────────────────────────────────────> Step 3.1 (docs)
                                                  │
                                                  └─> Step 3.2 (strict defaults)
```

---

## Resolved Decisions

These are the design choices baked into the plan. Each has an
alternative noted for future revisitation.

1. **`valueType: "string"` is the default opt-out for theme
   variables.** Forces the migration onto component authors who
   want validation, not onto every existing override. Alternative
   considered: require `valueType` on every declared variable —
   rejected because it would break every existing component
   metadata file in a single release.

2. **Validator and rule table shared with verified-type-contracts.**
   The `color`, `length`, `integer`, `number` rules already exist in
   the prop-side coercion table; reusing them guarantees that a
   `valueType: "color"` prop and a `valueType: "color"` theme
   variable accept identical inputs. Alternative considered:
   parallel rule sets — rejected because they would drift.

3. **Validation is dev-only by default.** Production users do not
   pay the cost of re-validating on every theme switch. Strict mode
   in production keeps the validator on for apps that opt in.
   Same model as the
   [enforced-accessibility plan](./enforced-accessibility.md)
   contrast checker.

4. **`position: fixed | sticky` is structurally banned in the
   `style` prop.** The legitimate use cases (`Modal`, `Drawer`,
   `Toast`, `Popover`) are framework components that use the same
   declaration internally; user markup expresses the *intent*
   (a modal) rather than the *mechanism* (fixed positioning). This
   is the same "managed component for the legitimate case" pattern
   the [DOM-API hardening plan](./dom-api-hardening.md) used for
   WebSocket/EventSource.

5. **`!important` and inline `url()` are gated by
   `allowInlineRawCss`, not by `strictTheming`.** Two reasons:
   (a) `allowInlineRawCss: false` is itself a security tightening
   that an app may want even without enabling the rest of strict
   mode (e.g. an app embedding untrusted theme JSON);
   (b) the migration cost is non-trivial enough that it deserves
   an independent toggle.

6. **Z-index ceiling is configurable, not hard-coded.** Some legit
   apps (e.g. ones embedded in third-party shells) need higher
   z-indexes. `App.appGlobals.maxZIndex` defaults to `9999` but can
   be raised explicitly.

7. **No third-party namespace mechanism in this plan.** Already
   covered by [themevars-namespace](./themevars-namespace.md).
   This plan exclusively addresses §8's first two gaps.

8. **`strictTheming` default flip waits for a major.** Same
   rationale as the other plans — the warn-mode telemetry window is
   needed before failing on invalid values.

---

## Out of Scope

- **CSS Modules class-name escape.** Mangled class names already
  prevent the leak; no further work needed.
- **`@font-face` validation.** Custom fonts are a separate concern;
  no clear escape today since they go through a font-loading
  pipeline, not the theme.
- **CSS Container Queries / `@scope`.** Modern features that are not
  yet uniform across browsers; revisit when adoption is broader.
- **Theme-variable value computation in user expressions.** Users
  reading `App.theme.colorPrimary` and computing derived colours in
  script is a separate feature request; outside this plan's
  validation surface.
- **Accessibility colour-contrast verification.** Owned by the
  [enforced-accessibility plan](./enforced-accessibility.md)
  Step 3.1; this plan only validates *structural* correctness of
  values, not their *semantic* relationship to other variables.
- **Third-party theme-variable namespacing.** Owned by
  [themevars-namespace](./themevars-namespace.md).
