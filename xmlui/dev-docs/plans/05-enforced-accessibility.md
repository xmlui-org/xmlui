# Enforced Accessibility — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §3 "Accessibility"](./managed-react.md) and the §17 scorecard row **"Accessibility — Documented only."**

---

## Goal

Close the §17 scorecard row:

> **Accessibility — Documented only.**
> Path to managed: *Parse-time linter; framework focus / live-region primitives; theme contrast checker.*

Today XMLUI components are built on semantic HTML primitives and the
[`.ai/xmlui/accessibility.md`](../../../.ai/xmlui/accessibility.md)
reference documents the conventions: aria-labels for icon-only triggers,
`aria-expanded` on disclosure widgets, focus traps in modals, arrow-key
navigation in option lists, and so on. Form inputs auto-pair with
`Label` via `htmlFor`/`id`. Nothing structurally **enforces** any of
this. An icon-only `<Button icon="trash" />` with no label ships
without complaint; a custom theme can produce 1.2:1 contrast; a modal
can be opened without a name; a developer can build a routing pattern
with no skip-link.

§3 spells out the four gaps:

1. No build-time a11y verification.
2. No automated contrast / hit-target validation.
3. No automation tree (no XMLUI-level automation IDs beyond `testId`).
4. Keyboard policy is component-local — no central focus manager,
   no skip-link primitive, no documented modal-stack discipline.

This plan converts each gap into a small, independently shippable,
independently testable step in priority order:

1. **Linter** that catches the most common violations at parse time
   through the existing diagnostic surfaces.
2. **Framework primitives** (`SkipLink`, `FocusScope`, `LiveRegion`)
   that components plug into — opt-in for users, mandatory for
   built-in components that need them.
3. **Theme contrast checker** at theme-resolution time.
4. **Tighten** with a strict mode that fails the build, plus an
   automation-ID surface for E2E tooling.

Every step lands behind a single `App.appGlobals.strictAccessibility`
switch (see Step 0) so the rollout can stage warn → opt-in → default-on
without touching call sites.

---

## Conventions

- **Source of truth for component metadata:** the same registry the
  [verified-type-contracts plan](./01-verified-type-contracts.md) consumes.
  Accessibility rules read metadata to know which components are
  "interactive" (`role: "button" | "link" | "switch" | …`) and which
  props provide accessible names (`label`, `aria-label`, `title`).
- **Source of truth for the parsed tree:** the `ComponentDef` produced
  by [`parseXmlUiMarkup()`](../../src/parsers/xmlui-parser/transform.ts)
  with attached source ranges — same input shape as the type-contract
  verifier, so the two analyzers can run in a single tree walk.
- **Existing infrastructure to reuse — do not reinvent:**
  - [`diagnostic.ts`](../../src/language-server/services/diagnostic.ts)
    is the LSP entry point; the a11y linter plugs in alongside the
    type-contract verifier.
  - [`vite-xmlui-plugin.ts`](../../src/nodejs/vite-xmlui-plugin.ts)
    runs the linter at build time. Same warn/strict pattern as the
    other three plans.
  - [`StyleProvider`](../../src/components-core/theming/StyleContext.tsx)
    resolves themes; the contrast checker hooks into the resolution
    pass.
  - [`Modal`](../../src/components/Modal/) already implements a focus
    trap; that implementation moves into a shared `FocusScope`
    primitive (Step 2.2) that other components can consume.
- **New module location:**
  `xmlui/src/components-core/accessibility/` (new directory) — keeps
  the linter, the focus-management primitives, the contrast checker,
  and the diagnostic formatter together so the LSP and the Vite plugin
  can import them without the React tree.
- **Diagnostic shape:** new `A11yDiagnostic` carrying
  `{ code: A11yCode, severity: "error" | "warn", componentName,
  range?, uri?, message, fix?: string }` where
  `A11yCode ∈ { "missing-accessible-name", "icon-only-button-no-label",
  "modal-no-title", "form-input-no-label", "duplicate-landmark",
  "missing-skip-link", "color-contrast-low", "interactive-not-keyboard-reachable",
  "live-region-missing", "redundant-aria-role" }`.
- **Reporting mode:** when `strictAccessibility === false` (default
  during rollout) violations emit warn-level entries through the trace
  and through LSP `DiagnosticSeverity.Warning`; the Vite plugin logs
  but does not fail the build. In strict mode, the four "must-have"
  codes (`missing-accessible-name`, `icon-only-button-no-label`,
  `modal-no-title`, `form-input-no-label`) upgrade to `error`.
- **Test layout:** unit tests under
  `xmlui/tests/components-core/accessibility/`; one spec per step.
  End-to-end tests under `xmlui/tests-e2e/accessibility/`.

Each step lists: scope, files touched, tests, acceptance criteria,
dependencies.

---

## Step 0 — Switch + Accessibility Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictAccessibility: boolean` (default `false`).
- Create `xmlui/src/components-core/accessibility/` with three exported
  surfaces, all empty stubs:

  ```ts
  // diagnostics.ts
  export type A11yCode =
    | "missing-accessible-name"
    | "icon-only-button-no-label"
    | "modal-no-title"
    | "form-input-no-label"
    | "duplicate-landmark"
    | "missing-skip-link"
    | "color-contrast-low"
    | "interactive-not-keyboard-reachable"
    | "live-region-missing"
    | "redundant-aria-role";
  export interface A11yDiagnostic {
    code: A11yCode;
    severity: "error" | "warn";
    componentName: string;
    range?: { line: number; col: number; length?: number };
    uri?: string;
    message: string;
    fix?: string;        // suggested remediation
  }
  ```

  ```ts
  // linter.ts
  import type { ComponentDef, ComponentMetadata } from "...";
  export interface LintOptions {
    strict?: boolean;
    skipUnknown?: boolean;
  }
  export function lintComponentDef(
    def: ComponentDef,
    registry: ReadonlyMap<string, ComponentMetadata>,
    opts?: LintOptions,
  ): A11yDiagnostic[];
  ```

  ```ts
  // index.ts — barrel
  ```

- Wire `"a11y"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document `strictAccessibility` on `appGlobals` in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).

### Files

- `xmlui/src/components-core/accessibility/linter.ts` (new)
- `xmlui/src/components-core/accessibility/diagnostics.ts` (new)
- `xmlui/src/components-core/accessibility/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `accessibility/linter.test.ts`
  - Empty `ComponentDef` returns no diagnostics.
  - Linter with `skipUnknown: true` tolerates an unregistered component.

### Acceptance

- `strictAccessibility` reads through `App.appGlobals` in markup.
- New module compiles; barrel exports are stable.
- No existing test changes behaviour.

### Dependencies

None. The verified-type-contracts plan's Step 0 is independent — both
plans share the *idea* of a metadata-driven verifier walk but produce
different diagnostic taxonomies.

---

## Phase 1 — Parse-Time Linter

The most common violations are statically detectable from the markup
alone. This phase implements the rules and wires them into the LSP
and the Vite plugin.

### Step 1.1 — A11y Metadata Annotations

**Priority:** 1

#### Scope

- Extend `ComponentMetadata` with a small `a11y` block:

  ```ts
  export interface ComponentMetadata {
    // ...existing fields
    readonly a11y?: {
      readonly role?: "button" | "link" | "switch" | "checkbox"
        | "menuitem" | "tab" | "option" | "dialog" | "form-input"
        | "landmark" | "heading" | "list" | "image" | "decorative";
      readonly accessibleNameProps?: readonly string[];   // e.g. ["label", "aria-label", "title"]
      readonly requiresAccessibleName?: boolean;           // default true for "interactive" roles
      readonly landmark?: "main" | "navigation" | "banner" | "contentinfo" | "complementary" | "search";
    };
  }
  ```

- Annotate every built-in interactive component with `role` +
  `accessibleNameProps`. Pure metadata change; no runtime behaviour
  shifts.

#### Files

- `xmlui/src/abstractions/ComponentDefs.ts` (add `a11y` to metadata)
- Each interactive built-in's metadata file (e.g.
  `xmlui/src/components/Button/Button.tsx`, `Modal.tsx`, `TextBox.tsx`,
  `Select.tsx`, `Switch.tsx`, `RadioGroup.tsx`, `Checkbox.tsx`, `Tabs.tsx`,
  `MenuItem.tsx`, `Link.tsx`, `Form.tsx`)

#### Tests

- `accessibility/metadata.test.ts`
  - Every interactive built-in has `a11y.role` set.
  - Every component with `requiresAccessibleName: true` declares at
    least one entry in `accessibleNameProps`.

#### Acceptance

- The annotation table is documented in
  [`.ai/xmlui/accessibility.md`](../../../.ai/xmlui/accessibility.md).
- No existing component changes behaviour.

#### Dependencies

Step 0.

---

### Step 1.2 — Linter Walk + "Must-Have" Rules

**Priority:** 2

#### Scope

- Implement `lintComponentDef()` with the four "must-have" rules first
  — these are the ones that will eventually fail strict-mode builds:

  1. **`missing-accessible-name`** — for any component with
     `a11y.requiresAccessibleName !== false`, at least one of
     `accessibleNameProps` must be present *and non-empty*. Suggestion:
     names a specific prop and a placeholder value.
  2. **`icon-only-button-no-label`** — `<Button icon="..." />` without
     `label`, `aria-label`, or `title`. Suggestion: `aria-label="..."`.
  3. **`modal-no-title`** — `<Modal>` without a `title` prop or a
     `<ModalTitle>` slot child. Suggestion: add a title prop.
  4. **`form-input-no-label`** — A form input (`TextBox`, `NumberBox`,
     `Select`, etc.) used outside a `<FormItem>` and without a sibling
     `<Label htmlFor="...">`. Suggestion: wrap in `<FormItem label="..." />`.

- Three additional warn-level rules:

  5. **`duplicate-landmark`** — more than one component with
     `a11y.landmark === "main"` in the same page tree.
  6. **`redundant-aria-role`** — `<nav role="navigation">` etc. The
     linter flags ARIA roles that duplicate an HTML element's implicit
     role (cross-referenced from a small static table).
  7. **`missing-skip-link`** — `<App>` or `<Page>` with a `<NavPanel>`
     child but no `<SkipLink>` sibling. (Step 2.1 introduces
     `<SkipLink>`.)

#### Files

- `xmlui/src/components-core/accessibility/linter.ts` (fill in)
- `xmlui/src/components-core/accessibility/rules/` (new directory; one
  file per rule)
- `xmlui/src/components-core/accessibility/redundant-roles-table.ts`
  (new — small static map)

#### Tests

- `accessibility/rules/*.test.ts`, one per rule:
  - Positive cases (compliant markup → no diagnostic).
  - Negative cases (violation → exact `A11yDiagnostic` shape with the
    expected `fix` suggestion).
  - Boundary cases (empty string label, expression-valued label —
    accept the latter optimistically).

#### Acceptance

- Every `A11yCode` shipped in this step is reachable from a unit test.
- Linter is pure (no `console.*`, no I/O).
- Linter output is stable: identical input ⇒ identical diagnostic
  array (sorted by `range.line`, then `range.col`).

#### Dependencies

Step 1.1.

---

### Step 1.3 — LSP and Vite Plugin Integration

**Priority:** 3

#### Scope

- In
  [`diagnostic.ts`](../../src/language-server/services/diagnostic.ts),
  call `lintComponentDef()` after the existing schema-level checks and
  forward each `A11yDiagnostic` as an LSP `Diagnostic`. Suggestions
  with a single concrete `fix` become quick-fix code actions.
- In
  [`vite-xmlui-plugin.ts`](../../src/nodejs/vite-xmlui-plugin.ts),
  call the linter in the `transform` hook; non-strict logs a warning,
  strict throws and fails the build. Aggregate counts in `buildEnd`.
- Document the new diagnostics in the
  [VS Code extension README](../../../tools/vscode/README.md).

#### Files

- `xmlui/src/language-server/services/diagnostic.ts`
- `xmlui/src/nodejs/vite-xmlui-plugin.ts`
- `tools/vscode/README.md`

#### Tests

- `tests-e2e/accessibility/lsp.spec.ts`
  - Open a `.xmlui` file with `<Button icon="trash" />`; assert the
    diagnostic appears with the expected message and code action.
  - Toggle `strictAccessibility` in workspace settings; assert
    severity flips between Warning and Error for the must-have codes.
- `tests-e2e/accessibility/vite.spec.ts`
  - Build a fixture with a violation; assert log in non-strict, fail
    in strict.

#### Acceptance

- Existing LSP tests continue to pass.
- Build perf overhead < 5 % on the docs site.
- A11y diagnostics appear in the Problems panel with quick-fix
  availability where applicable.

#### Dependencies

Step 1.2.

---

## Phase 2 — Framework Primitives

Some accessibility patterns cannot be enforced by markup alone — they
require shared runtime primitives. §3 names three: `SkipLink`,
`FocusScope`, `LiveRegion`. Each lands as a built-in component.

### Step 2.1 — `<SkipLink>` Primitive

**Priority:** 4

#### Scope

- New built-in component `xmlui/src/components/SkipLink/` following the
  standard two-file pattern.
- Renders a visually hidden anchor that becomes visible on focus,
  jumping to a `target` element by id (default: the first child of the
  page's `<main>` landmark).
- Auto-inserted by `<App>` when the linter would otherwise emit
  `missing-skip-link` and the user has set
  `App.appGlobals.autoSkipLink: true` (default `false` until the
  next major).
- Themed via standard theme variables; documented in `SkipLink.md`.

#### Files

- `xmlui/src/components/SkipLink/SkipLink.tsx` (new)
- `xmlui/src/components/SkipLink/SkipLinkReact.tsx` (new)
- `xmlui/src/components/SkipLink/SkipLink.module.scss` (new)
- `xmlui/src/components/SkipLink/SkipLink.md` (new)
- `xmlui/src/components/SkipLink/SkipLink.spec.ts` (new)
- `xmlui/src/components/ComponentRegistry.ts` (registration)

#### Tests

- `SkipLink.spec.ts` (Playwright):
  - Renders hidden by default; visible on Tab focus.
  - Activating jumps focus to the target.
  - Auto-insertion fires only when `autoSkipLink: true`.

#### Acceptance

- Available in markup as `<SkipLink target="..." />`.
- Linter rule `missing-skip-link` mentions `<SkipLink>` in its `fix`.

#### Dependencies

Step 1.2.

---

### Step 2.2 — `<FocusScope>` Primitive

**Priority:** 5

#### Scope

- Extract the focus-trap logic currently inlined in
  [`Modal`](../../src/components/Modal/) into a shared
  `useFocusScope()` hook plus a thin `<FocusScope>` component.
- `<FocusScope trap={true} restore={true}>` traps Tab cycling within
  its subtree and restores focus to the previously focused element on
  unmount.
- `Modal`, `Drawer`, `ContextMenu`, `DropdownMenu`, and any other
  built-in that needs focus management consume `useFocusScope()`
  internally — no markup change required for users of those
  components.
- A central `focusScopeStack` (singleton in
  `accessibility/focusScopeStack.ts`) tracks nesting so a `Modal`
  opened from inside a `Drawer` correctly restores to the `Drawer`
  trap on close — the modal-stack discipline §3 calls out.

#### Files

- `xmlui/src/components-core/accessibility/useFocusScope.ts` (new)
- `xmlui/src/components-core/accessibility/focusScopeStack.ts` (new)
- `xmlui/src/components/FocusScope/FocusScope.tsx` (new)
- `xmlui/src/components/FocusScope/FocusScopeReact.tsx` (new)
- `xmlui/src/components/FocusScope/FocusScope.md` (new)
- `xmlui/src/components/Modal/ModalReact.tsx` (refactor to use hook)
- `xmlui/src/components/Drawer/DrawerReact.tsx` (refactor)
- `xmlui/src/components/ComponentRegistry.ts` (registration)

#### Tests

- `accessibility/useFocusScope.test.ts` (unit; jsdom).
- `FocusScope.spec.ts` (Playwright):
  - Tab cycles within trap; Shift-Tab cycles backwards.
  - Focus restores on unmount.
  - Nested scopes restore in stack order (inner closes → outer
    re-traps).
- Existing `Modal` and `Drawer` E2E specs pass unchanged.

#### Acceptance

- No regression in modal / drawer keyboard behaviour.
- Stack discipline verified by an end-to-end "drawer-opens-modal"
  scenario.

#### Dependencies

Step 0.

---

### Step 2.3 — `<LiveRegion>` Primitive

**Priority:** 6

#### Scope

- New built-in component `xmlui/src/components/LiveRegion/` —
  visually hidden, `role="status"` (polite) or `role="alert"`
  (assertive), with a single `message` prop.
- The existing toast pipeline
  ([`toast.ts`](../../src/components-core/toast.ts)) gets a
  parallel announcement via a singleton live region inserted by
  `<App>` so screen readers hear toasts without depending on the
  visible toast surface.
- Available to user markup for custom announcements
  (`<LiveRegion message="{state.statusMessage}" politeness="polite" />`).

#### Files

- `xmlui/src/components/LiveRegion/LiveRegion.tsx` (new)
- `xmlui/src/components/LiveRegion/LiveRegionReact.tsx` (new)
- `xmlui/src/components/LiveRegion/LiveRegion.md` (new)
- `xmlui/src/components/LiveRegion/LiveRegion.spec.ts` (new)
- `xmlui/src/components-core/toast.ts` (announce-on-toast wiring)
- `xmlui/src/components/ComponentRegistry.ts` (registration)

#### Tests

- `LiveRegion.spec.ts`:
  - Updating `message` updates the DOM text node.
  - Toast announcements appear in the singleton region.

#### Acceptance

- Toasts are now announced to assistive tech by default.
- User-defined live regions work without conflicting with the
  singleton.

#### Dependencies

Step 0.

---

## Phase 3 — Theme Contrast Checker

The contrast gap is a separate analyzer: it runs at theme-resolution
time, not on markup. It reads resolved CSS custom properties and flags
foreground/background pairs below WCAG AA (4.5:1 for body text, 3:1
for large text and UI elements).

### Step 3.1 — Contrast Check at Theme Resolution

**Priority:** 7

#### Scope

- In
  [`StyleProvider`](../../src/components-core/theming/StyleContext.tsx),
  after the merged theme is resolved, run a contrast check on a small
  static set of "well-known pairs":
  - `--xmlui-color-primary` on `--xmlui-color-surface`
  - `--xmlui-color-text-default` on `--xmlui-color-background`
  - `--xmlui-color-text-on-primary` on `--xmlui-color-primary`
  - `--xmlui-color-error` on `--xmlui-color-surface`
  - …extensible via a registry that components can contribute to.
- Each violation emits a `kind: "a11y"` trace entry with the pair and
  computed ratio. In strict mode, `console.error` plus a one-shot toast.
- The contrast checker is **dev-only** (gated by `import.meta.env.DEV`
  in Vite, and by `App.appGlobals.strictAccessibility` in standalone)
  — zero production cost.

#### Files

- `xmlui/src/components-core/accessibility/contrast.ts` (new)
- `xmlui/src/components-core/accessibility/wellKnownPairs.ts` (new)
- `xmlui/src/components-core/theming/StyleContext.tsx` (call hook
  after resolve)

#### Tests

- `accessibility/contrast.test.ts`
  - Known WCAG fixtures (white on white → 1:1, black on white → 21:1,
    AA boundary).
  - The default theme passes.
  - A deliberately bad theme produces the expected violation list.

#### Acceptance

- Default theme is contrast-clean.
- Custom themes produce actionable diagnostics without breaking the
  app.

#### Dependencies

Step 0.

---

## Phase 4 — Tightening

### Step 4.1 — Automation ID Surface

**Priority:** 8

#### Scope

- §3 names the absence of an automation tree as a gap. Today users
  pass `testId` to mark elements for E2E tests. Generalise:
  - `testId` continues to forward to `data-testid`.
  - New optional `automationId` prop on the base component metadata
    — when set, the framework emits a stable `aria-describedby` /
    `data-automation-id` pair the testing harness can target.
  - The
    [`accessibility.md`](../../../.ai/xmlui/accessibility.md) reference
    documents the convention: `automationId` is for assistive-tech
    -scoped identifiers, `testId` for browser-test selectors.
- Pure plumbing change; no behaviour shift.

#### Files

- `xmlui/src/components-core/component-hooks.ts` (base metadata
  declaration)
- `xmlui/src/components-core/rendering/ComponentAdapter.tsx`
  (forward `automationId` to `data-automation-id`)
- `.ai/xmlui/accessibility.md` (document the split)

#### Tests

- `tests-e2e/accessibility/automation-id.spec.ts`
  - `<Button automationId="save-btn" />` renders
    `data-automation-id="save-btn"`.

#### Acceptance

- `automationId` is universally available without per-component opt-in.
- No regression in `testId` behaviour.

#### Dependencies

Step 0.

---

### Step 4.2 — Default `strictAccessibility: true` in Next Major

**Priority:** 9 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip the
  default to `true` in the next major release.
- Add a changeset and migration note: the four "must-have" codes
  (`missing-accessible-name`, `icon-only-button-no-label`,
  `modal-no-title`, `form-input-no-label`) now fail builds.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts` (default flip)
- `.changeset/strict-accessibility-default.md`
- `xmlui/dev-docs/guide/28-accessibility.md` (migration section)

#### Tests

- Existing test suite passes with the default flipped.
- A new spec under `xmlui/tests-e2e/accessibility/strict-mode.spec.ts`
  covers each must-have code producing the expected diagnostic.

#### Acceptance

- All in-repo example apps and the docs site pass under strict mode.

#### Dependencies

Steps 1.3, 4.1.

---

### Step 4.3 — Documentation

**Priority:** 10 (lands alongside Steps 1.3 / 2.x in practice)

#### Scope

- New `xmlui/dev-docs/guide/28-accessibility.md` chapter.
- Promote
  [`.ai/xmlui/accessibility.md`](../../../.ai/xmlui/accessibility.md)
  from "convention reference" to "enforced contract", linking each
  pattern to the rule that enforces it.
- Updates [`managed-react.md` §3](./managed-react.md) to mark the
  asymmetry resolved.
- Updates the §17 scorecard row from
  *"Documented only"* to
  *"Enforced — parse-time linter, focus/live-region primitives,
  contrast checker, automation IDs."*
- Updates [`AGENTS.md` documentation map](../../../AGENTS.md).

#### Files

- `xmlui/dev-docs/guide/28-accessibility.md` (new)
- `.ai/xmlui/accessibility.md` (revise to "enforced contract")
- `xmlui/dev-docs/plans/managed-react.md`
- `AGENTS.md`

#### Acceptance

- Both chapters cover the four phases (linter, primitives, contrast,
  strict switch) with at least one worked example each.
- A "rule reference" table lists every `A11yCode` with cause,
  severity in non-strict / strict, and example fix.

#### Dependencies

Steps 1.3, 2.1, 2.2, 2.3, 3.1.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **Foundations** | 0, 1.1 | Metadata annotated; no user-visible behaviour | Next minor |
| **Linter** | 1.2, 1.3 | LSP + Vite warn on the must-have + warn-level codes | Next minor + 1 |
| **Primitives** | 2.1, 2.2, 2.3 | `<SkipLink>`, `<FocusScope>`, `<LiveRegion>` available; toasts announced | Next minor + 1 |
| **Contrast + automation** | 3.1, 4.1 | Dev-only contrast warnings; `automationId` shipped | Next minor + 2 |
| **Docs + strict default** | 4.2, 4.3 | Guide chapter; `strictAccessibility: true` is the default | Next major |

Each step is independently revertible: removing the linter call from
`diagnostic.ts` reverts the LSP to today's behaviour without touching
markup; removing the focus-scope refactor from `Modal` falls back to the
inlined trap.

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   ├─> Step 1.1 (metadata annotations)
   │      │
   │      └─> Step 1.2 (linter rules)
   │             │
   │             └─> Step 1.3 (LSP + Vite)
   │
   ├─> Step 2.1 (<SkipLink>)
   ├─> Step 2.2 (<FocusScope>)
   ├─> Step 2.3 (<LiveRegion>)
   ├─> Step 3.1 (contrast checker)
   ├─> Step 4.1 (automationId)
   │
   └─────────────────────────────────────────> Step 4.3 (docs)
                                                  │
                                                  └─> Step 4.2 (strict default)
```

---

## Resolved Decisions

These are the design choices baked into the plan. Each has an
alternative noted for future revisitation.

1. **Metadata-driven linting, not AST-pattern matching.** The linter
   reads `a11y.role` + `accessibleNameProps` from metadata rather than
   hard-coding "Button needs label". A new component declares its
   contract once and the linter applies automatically. Alternative
   considered: a built-in rule registry — rejected because it puts
   knowledge in two places.

2. **Four "must-have" codes, the rest stay warn even in strict.**
   `missing-accessible-name`, `icon-only-button-no-label`,
   `modal-no-title`, and `form-input-no-label` are uncontroversial
   structural failures. The remaining codes (duplicate landmark,
   missing skip link, redundant role, low contrast,
   not-keyboard-reachable, missing live region) stay at warn even in
   strict because they are easier to over-report and could break
   existing apps without clear remediation.

3. **`<FocusScope>` is opt-in for users, mandatory for built-ins.**
   `Modal` and `Drawer` consume it internally so existing user markup
   doesn't change. Users authoring custom overlays can opt in via
   `<FocusScope>`. Alternative considered: auto-wrap any element with
   `aria-modal="true"` — rejected because it leaks into raw HTML and
   bypasses the metadata vocabulary.

4. **Single `<LiveRegion>` in `<App>` powers toasts.** Ensures every
   toast is announced without per-toast wiring. Users can still add
   their own regions with distinct politeness levels.

5. **Contrast checker is dev-only.** Production users do not need to
   pay the cost of re-running the checker on every theme switch.
   Strict mode in production keeps the checker on for apps that opt
   in.

6. **Automation IDs are separate from `testId`.** The two surfaces
   serve different audiences (assistive tech vs E2E test harnesses)
   and conflating them risks leaking test-only identifiers into
   accessible names.

7. **`strictAccessibility` default flip waits for a major.** Same
   rationale as the other three plans — existing apps have
   accessibility debt that needs a documented migration window.

---

## Out of Scope

- **Hit-target size enforcement.** §3 names this as a gap. Hit-target
  enforcement requires per-component minimum-size constraints
  cross-referenced with theme spacing variables. Address in a future
  "spacing contracts" plan that builds on
  [verified-type-contracts](./01-verified-type-contracts.md).
- **Reading-order verification.** Visual order vs DOM order checks
  require a layout-aware analyzer (Flexbox `order`, CSS Grid
  reordering). Out of scope for a markup-level linter.
- **Screen-reader compatibility matrix.** Per-AT testing is a release
  process concern, not a framework primitive. Document expectations,
  do not encode them in the linter.
- **A full WAI-ARIA Authoring Practices conformance pass.** This plan
  picks the highest-value rules; a comprehensive APG compliance pass
  is a separate, much larger project.
- **Internationalisation-related a11y (RTL, locale-aware
  announcements).** Belongs in the "i18n" gap (§11); coordinate when
  that plan is drafted.
