# Build-Time Validation Analyzers — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §13 "Build-Time Validation and Tooling"](./managed-react.md) and the §17 scorecard row **"Build-time validation — Parse only."**

---

## Goal

Close the §17 scorecard row:

> **Build-time validation — Parse only.**
> Path to managed: *Metadata-driven type/identifier diagnostics.*

Today the language server documented in
[`language-server.md`](../../../.ai/xmlui/language-server.md)
catches parse errors in `.xmlui` markup and expression text and
surfaces them as LSP diagnostics with line/column. That is where
build-time validation stops. Metadata-driven checks against
component existence, prop names, event names, method calls, and
reactive cycles are not run anywhere — even though the metadata
registry, the parser AST, and the dependency tracker all exist
and have the information needed.

The other §17 plans cover the **rule families**:

- [verified-type-contracts](./01-verified-type-contracts.md) — prop
  *value type* diagnostics.
- [enforced-versioning](./12-enforced-versioning.md) — deprecation /
  removal diagnostics.
- [reactive-cycle-detection](./03-reactive-cycle-detection.md) —
  cycles in expression dependency graphs.
- [enforced-accessibility](./05-enforced-accessibility.md) — a11y
  diagnostics from metadata.
- [structured-exception-model](./07-structured-exception-model.md) —
  error-handling diagnostics.

This plan delivers the **delivery vehicle**: the
metadata-driven *identifier* checks that §13 explicitly names
(*"unknown component"*, *"unknown event"*, *"unknown method"*,
*dead expressions*, *unused vars*) plus the missing tooling glue
that lets every other plan ship its rule family without
duplicating infrastructure: a single analyzer pipeline reachable
from three contexts — the **LSP** (live editor diagnostics), the
**Vite plugin** (build-time fail-the-build), and a **standalone
CLI** (`xmlui check`) for CI on buildless apps.

The work is split into independently shippable steps in priority
order:

1. **Identifier diagnostics** — *unknown component*, *unknown
   prop*, *unknown event*, *unknown method*, *unknown slot*.
2. **Expression-level diagnostics** — *unused var*,
   *dead-conditional expression*, *unbound identifier*,
   *handler returns no value*.
3. **Cross-binding diagnostics** — *event handler references
   undefined component id*, *`bindTo` references undefined
   form*, *`api.<name>` calls undefined exposed method*.
4. **Pipeline plumbing** — shared analyzer registry, three
   surfaces (LSP / Vite / CLI), severity escalation, suppression
   syntax.
5. **CI integration** — `xmlui check` ships in the create-app
   scaffold; failing diagnostics fail CI.
6. **Strict default flip + docs** in next major.

Every step lands behind `App.appGlobals.strictBuildValidation:
boolean` (see Step 0). Strict mode is also exposed at the
analyzer surface — `xmlui check --strict` flips `info` →
`warn` → `error` per the rule severity table.

---

## Conventions

- **Source of truth for component / prop / event / method
  metadata:**
  [`ComponentDefs.ts`](../../src/abstractions/ComponentDefs.ts)
  and the registries in
  [`componentRegistry.ts`](../../src/components-core/componentRegistry.ts).
  The analyzer reads the same registry the runtime uses; no
  parallel schema.
- **Source of truth for the expression AST:** the parser in
  [`parsers/scripting/`](../../src/parsers/scripting/) — already
  produces the AST with line/column. The analyzer walks this AST.
- **Source of truth for the markup AST:** the XML parser in
  [`parsers/xmlui-parser/`](../../src/parsers/xmlui-parser/) — the
  identifier checks walk the `Component` nodes it produces.
- **Existing infrastructure to reuse — do not reinvent:**
  - The
    [verified-type-contracts](./01-verified-type-contracts.md) plan
    Step 2.1 introduces the parse-time validator walk; this plan
    is the framework that walk plugs into. The two plans are
    designed to land together — verified-type-contracts owns the
    *value-type* rules; this plan owns the *identifier* rules and
    the shared pipeline.
  - The
    [reactive-cycle-detection](./03-reactive-cycle-detection.md)
    plan owns cycle detection on the dependency graph the
    container builds at runtime; the analyzer surface here lets
    it produce the same diagnostics at parse time when the AST
    suffices.
  - The
    [enforced-versioning](./12-enforced-versioning.md) plan
    Step 1.2 hooks deprecation diagnostics into this same walk.
  - The LSP infrastructure documented in
    [`language-server.md`](../../../.ai/xmlui/language-server.md)
    — diagnostics added here flow through the same publisher.
  - The Vite plugin (`vite-xmlui-plugin`, in `xmlui/vite.config.ts`
    integration) — already parses every `.xmlui` file; this plan
    routes the parsed AST into the analyzer.
- **New module location:**
  `xmlui/src/components-core/analyzer/` (new directory) holds the
  rule registry, the walker, and the diagnostic emitter.
  `xmlui/scripts/cli/check.ts` (new) is the standalone CLI entry.
- **Diagnostic shape:** new `BuildDiagnostic` carrying
  `{ code: BuildDiagnosticCode, severity: "error" | "warn" |
  "info", file, line, column, length, message, data?,
  suggestions? }` where
  `BuildDiagnosticCode` is an open string union extended by each
  rule family. The analyzer reserves the `id-*` prefix for
  identifier rules:
  `BuildDiagnosticCode ⊇ { "id-unknown-component",
  "id-unknown-prop", "id-unknown-event",
  "id-unknown-method", "id-unknown-slot",
  "id-undefined-component-ref", "id-undefined-form-ref",
  "expr-unused-var", "expr-dead-conditional",
  "expr-unbound-identifier", "expr-handler-no-value" }`.
- **Severity escalation:** every rule has a default severity
  (`info | warn | error`) and a strict-mode override (always one
  step higher, capped at `error`). Apps can override per-rule
  via `xmlui.config.json`.
- **Suppression syntax:** XMLUI markup gets a comment-based
  suppression directive following the LSP norm:
  `<!-- xmlui-disable-next-line id-unknown-component -->`
  suppresses the next line; `<!-- xmlui-disable id-unused-var -->`
  / `<!-- xmlui-enable id-unused-var -->` toggle a region. No
  blanket "disable everything" form (matches the
  [reactive-cycle-detection](./03-reactive-cycle-detection.md)
  philosophy of single-rule suppression).
- **Reporting mode:** new trace `kind: "build"` in the runtime
  Inspector for echoes from the parse-time validator (the
  runtime mirrors what the build saw). The CLI prints diagnostics
  in `gnu` (default) or `json` format; the LSP publishes via
  `textDocument/publishDiagnostics` as today.
- **Test layout:** unit tests under
  `xmlui/tests/components-core/analyzer/`; one spec per rule.
  CLI tests under `xmlui/tests/scripts/cli/check.test.ts`.
  End-to-end tests under `xmlui/tests-e2e/build-validation/`.

Each step lists: scope, files touched, tests, acceptance criteria,
dependencies.

---

## Step 0 — Switch + Analyzer Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictBuildValidation: boolean`
  (default `false`; flips to `true` in the next major).
- Create `xmlui/src/components-core/analyzer/` with stubs:

  ```ts
  // diagnostics.ts
  export interface BuildDiagnostic {
    code: string;                       // open union; see Conventions
    severity: "error" | "warn" | "info";
    file: string;
    line: number;
    column: number;
    length: number;
    message: string;
    data?: unknown;
    suggestions?: ReadonlyArray<{ title: string; replacement?: string }>;
  }
  ```

  ```ts
  // rule-registry.ts
  export interface AnalyzerRule {
    code: string;
    description: string;
    defaultSeverity: "error" | "warn" | "info";
    strictSeverity: "error" | "warn" | "info";
    appliesTo: "markup" | "expression" | "both";
    run: (ctx: RuleContext) => Iterable<BuildDiagnostic>;
  }
  export interface RuleContext {
    file: string;
    markupAst?: unknown;                // typed in Step 1.1
    exprAst?: unknown;
    componentRegistry: ComponentRegistry;
    strict: boolean;
  }
  export function registerRule(rule: AnalyzerRule): void;
  export function getRules(): readonly AnalyzerRule[];
  ```

  ```ts
  // walker.ts
  export interface AnalyzerInput {
    files: ReadonlyArray<{ file: string; source: string }>;
    componentRegistry: ComponentRegistry;
    strict: boolean;
  }
  export function analyze(input: AnalyzerInput): BuildDiagnostic[];
  ```

  ```ts
  // suppression.ts
  export function isSuppressed(
    code: string, file: string, line: number,
    suppressions: ReadonlyMap<string, ReadonlyArray<{ from: number; to: number; codes: readonly string[] }>>,
  ): boolean;
  ```

  ```ts
  // index.ts — barrel
  ```

- Wire `"build"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document the new appGlobals key in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).

### Files

- `xmlui/src/components-core/analyzer/diagnostics.ts` (new)
- `xmlui/src/components-core/analyzer/rule-registry.ts` (new)
- `xmlui/src/components-core/analyzer/walker.ts` (new)
- `xmlui/src/components-core/analyzer/suppression.ts` (new)
- `xmlui/src/components-core/analyzer/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `analyzer/walker.test.ts` — `analyze({ files: [], … })` returns
  `[]`; rule registration round-trips.

### Acceptance

- `strictBuildValidation` reads through `App.appGlobals`.
- New module compiles; barrel exports stable.
- No existing test changes behaviour.

### Dependencies

None.

---

## Phase 1 — Identifier Diagnostics

### Step 1.1 — `id-unknown-component`

**Priority:** 1

#### Scope

- For every `Component` node in the markup AST, look up the tag
  name in the merged registry of:
  - core component registry,
  - registered extension package components,
  - in-app `components/` directory user-defined components.
- Unknown tag → `id-unknown-component` (severity `error`; same in
  strict). Suggestion includes the closest registry name by
  Levenshtein distance.
- Special tags (`Slot`, `Items`, `Property`, etc.) live in a
  built-in allowlist consumed from the same registry.

#### Files

- `xmlui/src/components-core/analyzer/rules/id-unknown-component.ts`
  (new)
- `xmlui/src/components-core/analyzer/walker.ts`

#### Tests

- `analyzer/rules/id-unknown-component.test.ts` —
  `<Buttn>` on a fixture page produces the diagnostic with
  suggestion `"Button"`.

#### Acceptance

- Today's docs site passes (no unknown components).

#### Dependencies

Step 0; verified-type-contracts plan Step 2.1 (the registry
adapter that exposes the merged registry to the validator).

---

### Step 1.2 — `id-unknown-prop`

**Priority:** 2

#### Scope

- For every attribute on a known component, look up the prop in
  `ComponentDef.props`. Unknown prop → `id-unknown-prop`
  (severity `warn`; strict `error`).
- Allowlisted attributes (`testId`, `automationId`, `ref`,
  custom-data attributes via the `data-*` prefix) bypass the
  check.
- Suggestion: closest known prop by Levenshtein.

#### Files

- `xmlui/src/components-core/analyzer/rules/id-unknown-prop.ts` (new)

#### Tests

- `<Button labl="Save" />` produces the diagnostic with
  suggestion `"label"`.

#### Acceptance

- Today's docs site passes after the framework's own typo audit
  (any genuine misspelling is fixed in the same PR).

#### Dependencies

Step 1.1.

---

### Step 1.3 — `id-unknown-event` + `id-unknown-method`

**Priority:** 3

#### Scope

- Event bindings (`onClick`, `onChange`, …) check against
  `ComponentDef.events`. Unknown → `id-unknown-event`
  (severity `warn`; strict `error`).
- Method calls in expressions (`buttonRef.flash()`) against
  `ComponentDef.api`. Unknown → `id-unknown-method`
  (severity `warn`; strict `error`).
- Both rules use the same Levenshtein suggester as Step 1.2.

#### Files

- `xmlui/src/components-core/analyzer/rules/id-unknown-event.ts` (new)
- `xmlui/src/components-core/analyzer/rules/id-unknown-method.ts` (new)

#### Tests

- `<Button onClik="…" />` produces `id-unknown-event`.
- `myForm.submitt()` produces `id-unknown-method`.

#### Acceptance

- Both rules require the
  [verified-type-contracts](./01-verified-type-contracts.md) plan's
  ref-tracking surface (Step 1.4 there) — the analyzer needs to
  know which component a ref points at.

#### Dependencies

Step 1.1; verified-type-contracts plan Step 1.4 (ref tracking).

---

### Step 1.4 — `id-unknown-slot`

**Priority:** 4

#### Scope

- Children placed in named slots (`<Tab slot="header">`) check
  against `ComponentDef.templates` / `slots`. Unknown slot →
  `id-unknown-slot` (severity `error`; same in strict — a typo
  here silently drops content).

#### Files

- `xmlui/src/components-core/analyzer/rules/id-unknown-slot.ts` (new)

#### Tests

- `<Modal><Button slot="footr" /></Modal>` on a `<Modal>` whose
  declared slots are `header | footer` produces the diagnostic.

#### Acceptance

- Existing slotted markup in the docs site passes.

#### Dependencies

Step 1.1.

---

## Phase 2 — Expression-Level Diagnostics

### Step 2.1 — `expr-unused-var` + `expr-unbound-identifier`

**Priority:** 5

#### Scope

- Walk the expression AST inside `<var.X>`, event handlers, and
  bound props.
- `expr-unused-var` (severity `info`; strict `warn`): a `var`
  declared on a component / page that is never referenced in
  any descendant expression.
- `expr-unbound-identifier` (severity `error`; same in strict):
  an identifier in an expression that resolves to neither
  - a `var` in scope,
  - a registered component id,
  - an `App.*` global,
  - a `$cancel | $error | $event | $routeParams | $queryParams`
    framework-provided context variable,
  - a registered global function (date/math/etc.).
- Suggestion: closest in-scope identifier by Levenshtein.

#### Files

- `xmlui/src/components-core/analyzer/rules/expr-unused-var.ts` (new)
- `xmlui/src/components-core/analyzer/rules/expr-unbound-identifier.ts`
  (new)

#### Tests

- `analyzer/rules/expr-unused-var.test.ts` — declared-but-unused
  `var.foo` produces the diagnostic.
- `expr-unbound-identifier` — typo in handler produces the
  diagnostic with suggestion.

#### Acceptance

- Today's docs site passes after the typo audit (genuine misses
  fixed in the same PR).

#### Dependencies

Step 0; the existing parser AST already exposes scope info via
the
[expression-eval](../../../.ai/xmlui/expression-eval.md)
machinery.

---

### Step 2.2 — `expr-dead-conditional` + `expr-handler-no-value`

**Priority:** 6

#### Scope

- `expr-dead-conditional` (severity `info`; strict `warn`):
  ternaries / conditionals whose condition is a literal
  (`true ? a : b`) or a tautology / contradiction
  (`x === x`, `1 < 0`). Catches debug code left behind.
- `expr-handler-no-value` (severity `info`; strict `warn`):
  event handlers whose body is a single bare identifier or a
  literal — almost always a developer mistake
  (`onClick="myAction"` instead of `onClick="myAction()"`).

#### Files

- `xmlui/src/components-core/analyzer/rules/expr-dead-conditional.ts`
  (new)
- `xmlui/src/components-core/analyzer/rules/expr-handler-no-value.ts`
  (new)

#### Tests

- `1 ? a : b` produces `expr-dead-conditional`.
- `onClick="myAction"` produces `expr-handler-no-value` with
  suggestion `"myAction()"`.

#### Acceptance

- The two rules combined catch a class of "I forgot the parens"
  mistakes that the runtime silently swallows today.

#### Dependencies

Step 2.1.

---

## Phase 3 — Cross-Binding Diagnostics

### Step 3.1 — `id-undefined-component-ref` + `id-undefined-form-ref`

**Priority:** 7

#### Scope

- An expression referencing a component id (`myButton.flash()`,
  `myForm.dirty`) checks that the id is declared somewhere in
  the same `<App>` scope.
- Undeclared id → `id-undefined-component-ref` (severity
  `error`; same in strict).
- A `<FormItem bindTo="x">` declared outside any `<Form>` or
  inside a `<Form>` that does not declare `x` in its `data`
  shape → `id-undefined-form-ref` (severity `warn`; strict
  `error`).

#### Files

- `xmlui/src/components-core/analyzer/rules/id-undefined-component-ref.ts`
  (new)
- `xmlui/src/components-core/analyzer/rules/id-undefined-form-ref.ts`
  (new)

#### Tests

- `myButtn.flash()` (typo) produces both `expr-unbound-identifier`
  and `id-undefined-component-ref` if the typo cannot be resolved
  to a known id.
- `<FormItem bindTo="phon">` inside a Form whose `data` declares
  `phone` produces the diagnostic with suggestion.

#### Acceptance

- Cross-binding rules respect the existing scoping rules in
  [container-state.md](../../../.ai/xmlui/container-state.md).

#### Dependencies

Step 1.3 (ref tracking); Step 2.1 (expression scope tracking).

---

## Phase 4 — Pipeline Surfaces

### Step 4.1 — LSP Wiring

**Priority:** 8

#### Scope

- The LSP server runs the analyzer on every save (and on edit
  with a debounce). Diagnostics flow through the existing
  `textDocument/publishDiagnostics` channel.
- Severities map to LSP `DiagnosticSeverity`
  (`error → 1`, `warn → 2`, `info → 3`).
- Suggestions surface as `CodeAction`s
  (`textDocument/codeAction`) — clicking "Replace `Buttn` →
  `Button`" applies the rename.
- Suppression directives parse from the markup before the walker
  runs.

#### Files

- `tools/vscode/src/extension/diagnostics.ts` (or current LSP
  diagnostic publisher)
- `tools/vscode/src/extension/codeActions.ts` (new — surface
  suggestions)

#### Tests

- LSP integration test: opening a fixture file with three
  diagnostics produces three problem entries.

#### Acceptance

- Suggestion-driven `CodeAction`s work for every rule that
  produces `suggestions`.

#### Dependencies

Phases 1–3.

---

### Step 4.2 — Vite Plugin Integration

**Priority:** 9

#### Scope

- `vite-xmlui-plugin` (existing) routes every parsed `.xmlui`
  through the analyzer.
- Diagnostics:
  - `info` → printed to console at build time.
  - `warn` → printed; build succeeds.
  - `error` → fail the build with a clear file:line:col message.
- A new option `xmlui({ analyze: 'off' | 'warn' | 'strict' })` in
  the Vite config controls the mode (`'warn'` is the default —
  warns but does not fail). Strict mode runs the analyzer with
  `strict: true` (severity escalation per Step 0).

#### Files

- The Vite plugin source (locate in the repo at build time;
  current path: `xmlui/src/vite-plugin/` or
  `tools/vite-xmlui-plugin/`)

#### Tests

- `tests/vite-plugin/analyze.test.ts` — `analyze: 'strict'`
  fails the build on a fixture with `id-unknown-component`.

#### Acceptance

- The docs site (Vite mode) builds clean.
- A deliberately broken fixture build fails as expected.

#### Dependencies

Phases 1–3.

---

### Step 4.3 — Standalone CLI (`xmlui check`)

**Priority:** 10

#### Scope

- New CLI entry `xmlui check [path]` that:
  - Walks the given directory (default `.`).
  - Discovers `.xmlui` files via the same algorithm the
    standalone runtime uses.
  - Loads the registry of available components (core +
    installed extension packages + local `components/` dir).
  - Runs the analyzer.
  - Prints diagnostics in `--format gnu` (default) or
    `--format json`.
  - Exits with non-zero on any `error`-severity diagnostic.
- `--strict` flag escalates per the rule severity table.
- `--rule <code>` runs a single rule for debugging.
- `--no-rule <code>` skips a specific rule.
- Lives in the existing CLI (`tools/create-app/`), or a new
  `tools/cli/` package if the create-app CLI does not have a
  general entry point — to be confirmed at implementation time.

#### Files

- `xmlui/scripts/cli/check.ts` (new)
- `xmlui/scripts/cli/format-gnu.ts` (new)
- `xmlui/scripts/cli/format-json.ts` (new)

#### Tests

- `tests/scripts/cli/check.test.ts` — fixtures with three
  diagnostics produce three lines in `gnu` format and a
  non-zero exit code under `--strict`.

#### Acceptance

- Standalone-mode apps (no Vite, no LSP) get the same diagnostics
  via CI.

#### Dependencies

Phases 1–3.

---

## Phase 5 — CI Integration

### Step 5.1 — `xmlui check` in the Create-App Scaffold

**Priority:** 11

#### Scope

- The
  [`create-app`](../../../tools/create-app/) scaffold gains an
  `npm run check` script that calls `xmlui check` and a default
  GitHub Actions workflow that runs it on every PR.
- The workflow runs in `--strict` mode by default for new apps;
  existing apps adopt incrementally.
- Exit code surfaces as a PR check; failing diagnostics block
  merge per repo policy.

#### Files

- `tools/create-app/templates/<each>/package.json` (add script)
- `tools/create-app/templates/<each>/.github/workflows/check.yml`
  (new)
- `tools/create-app/templates/<each>/xmlui.config.json` (default
  rule severities)

#### Tests

- `tools/create-app/tests/scaffold.test.ts` — every generated
  template includes the check script and workflow.

#### Acceptance

- A freshly scaffolded app fails CI when a deliberately broken
  fixture is added.

#### Dependencies

Step 4.3.

---

## Phase 6 — Documentation & Strict Default

### Step 6.1 — Build-Validation Chapter

**Priority:** 12

#### Scope

- New `xmlui/dev-docs/guide/36-build-validation.md` chapter.
- Updates
  [`language-server.md`](../../../.ai/xmlui/language-server.md)
  with the new rule families and the LSP diagnostic flow.
- Updates [`managed-react.md` §13](./managed-react.md):
  - Mark "No type checking against component metadata at parse
    time" as resolved (delegated to verified-type-contracts +
    this plan).
  - Mark "No 'unknown component' diagnostic" as resolved.
  - Mark "No 'unknown event' / 'unknown method' diagnostic" as
    resolved.
  - Mark "No detection of obviously dead expressions or unused
    vars" as resolved.
  - Mark "No detection of the reactive cycles" as resolved
    (cross-reference reactive-cycle-detection plan).
- Updates the §17 scorecard row from
  *"Parse only"* to
  *"Sealed — identifier, expression, cross-binding, and
  cycle analyzers; LSP / Vite / CLI surfaces."*
- Updates [`AGENTS.md` documentation map](../../../AGENTS.md).

#### Files

- `xmlui/dev-docs/guide/36-build-validation.md` (new)
- `.ai/xmlui/language-server.md`
- `xmlui/dev-docs/plans/managed-react.md`
- `AGENTS.md`

#### Acceptance

- Chapter covers each rule family with at least one worked
  example, plus a migration section for adopting the analyzer
  on an existing project.
- A "rule reference" table lists every `BuildDiagnosticCode`
  with default severity, strict severity, cause, suggestion.

#### Dependencies

Steps 1–5.

---

### Step 6.2 — Default `strictBuildValidation: true` in Next Major

**Priority:** 13 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip the
  default in the next major release: `strictBuildValidation: true`.
- Effects under strict:
  - All `info` rules become `warn`.
  - All `warn` rules become `error`.
  - Vite plugin defaults to `analyze: 'strict'`.
  - `xmlui check` defaults to `--strict`.
- Add a changeset and migration note.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts`
- The Vite plugin defaults
- `xmlui/scripts/cli/check.ts`
- `.changeset/strict-build-validation-default.md`
- `xmlui/dev-docs/guide/36-build-validation.md` (migration section)

#### Tests

- Existing test suite passes with the default flipped.
- `xmlui/tests-e2e/build-validation/strict-mode.spec.ts` covers
  each diagnostic under strict.

#### Acceptance

- All in-repo example apps and the docs site pass under strict
  build validation.

#### Dependencies

Step 6.1.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **Foundations** | 0 | Switch + analyzer module skeleton | Next minor |
| **Identifier rules** | 1.1, 1.2, 1.3, 1.4 | Unknown component / prop / event / method / slot | Next minor + 1 |
| **Expression rules** | 2.1, 2.2 | Unused / unbound / dead / no-value | Next minor + 2 |
| **Cross-binding rules** | 3.1 | Undefined ref, undefined `bindTo` | Next minor + 2 |
| **Surfaces** | 4.1, 4.2, 4.3 | LSP, Vite, CLI | Next minor + 3 |
| **CI integration** | 5.1 | Scaffold + workflow | Next minor + 3 |
| **Docs + strict default** | 6.1, 6.2 | Guide chapter; strict default in next major | Next major |

Each step is independently shippable: rules can ship to LSP first
and CI later (or vice versa); the suppression syntax is
forward-compatible (rules added later honour the same
directives).

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   ├─> Step 1.1 (id-unknown-component)              ← verified-type-contracts Step 2.1
   │      │
   │      ├─> Step 1.2 (id-unknown-prop)
   │      │
   │      ├─> Step 1.3 (id-unknown-event/method)    ← verified-type-contracts Step 1.4
   │      │      │
   │      │      └─> Step 3.1 (cross-binding refs)
   │      │
   │      └─> Step 1.4 (id-unknown-slot)
   │
   ├─> Step 2.1 (expr-unused / unbound)
   │      │
   │      └─> Step 2.2 (expr-dead / no-value)
   │
   └────────────────────────────────────> Step 4.1 (LSP wiring)
                                          Step 4.2 (Vite plugin)
                                          Step 4.3 (CLI)
                                                  │
                                                  └─> Step 5.1 (CI scaffold)
                                                          │
                                                          ▼
                                                    Step 6.1 (docs)
                                                          │
                                                          └─> Step 6.2 (strict default)
```

---

## Resolved Decisions

These are the design choices baked into the plan. Each has an
alternative noted for future revisitation.

1. **Three surfaces share one analyzer pipeline.** LSP, Vite, and
   CLI all call `analyze(input)` from the same module — the
   diagnostic on a missing prop is identical text in all three
   surfaces. Alternative considered: separate implementations
   per surface — rejected as the source of guaranteed drift.

2. **Every rule has both default and strict severities.** Apps
   choose how loud the analyzer is via one switch; per-rule
   overrides in `xmlui.config.json` are a finer-grained escape
   hatch. Alternative considered: one severity per rule —
   rejected because the strict-mode story relies on uniform
   escalation.

3. **Severity floor is `info`, not "off".** A rule that does not
   apply to a project should not be in the registry; if it is,
   it produces at least an `info` finding so authors are aware.
   Apps that disagree use `--no-rule` or the suppression
   directive. Alternative considered: per-rule "off" —
   rejected because it normalises sweeping suppression which is
   the opposite of what the plan exists to achieve.

4. **Suppression is single-rule only, no blanket disable.**
   `<!-- xmlui-disable -->` (no code) is intentionally not
   supported. Same philosophy as the
   [reactive-cycle-detection](./03-reactive-cycle-detection.md)
   plan — suppression should require deliberate per-rule choice.

5. **Identifier rules use Levenshtein for suggestions.** Cheap,
   well-understood, good UX. Alternative considered: word-vector
   similarity / LLM-based suggestions — rejected as overkill for
   a typo on a known finite identifier set.

6. **Expression rules walk the same AST the runtime walks.** No
   parallel "lint AST"; the analyzer reuses the parser output.
   Alternative considered: a separate lighter-weight AST —
   rejected because a separate AST is a parallel implementation
   that drifts.

7. **Cross-binding rules require ref tracking from
   verified-type-contracts.** This plan does not duplicate ref
   tracking; it consumes the surface that plan ships. The order
   of plan adoption matters: verified-type-contracts Step 1.4
   ships before this plan's Step 1.3 / 3.1.

8. **Vite plugin warns by default, not fails.** Existing
   projects upgrading to a new XMLUI version see findings but do
   not break their builds. Strict mode (or `analyze: 'strict'`)
   is opt-in until the next major. Alternative considered: fail
   by default — rejected because it would force a single big-bang
   migration on every consumer.

9. **`xmlui check` is a separate CLI, not a flag on existing
   build commands.** Build commands run the analyzer as a side
   effect (Vite plugin); `xmlui check` is for buildless apps and
   for IDE-less CI environments where running the analyzer
   directly is cleaner. Alternative considered: bundle into
   create-app build script only — rejected because standalone
   apps with no build step would have no way to run it.

10. **Strict default flip waits for a major.** Same rationale as
    the other plans — the warn-mode telemetry window is needed
    before failing on `id-unknown-prop` and the long tail of
    expression-level findings.

---

## Out of Scope

- **Auto-fix codemods.** Suggestions are surfaced; mechanical
  rewriting (`xmlui check --fix`) is a separate tooling effort.
  The
  [reactive-cycle-detection](./03-reactive-cycle-detection.md)
  plan also explicitly excludes `--fix`; the same rationale
  applies (auto-fix on identifier typos is rarely safe — the
  Levenshtein closest match may not be the right one).
- **Type inference for expressions.** The analyzer checks
  *identifier presence*, not *value-type compatibility* across
  expressions. Value-type checks belong to the
  [verified-type-contracts](./01-verified-type-contracts.md) plan
  at the prop boundary; full expression-level type inference is
  a much larger effort and not §13's scope.
- **Performance budgets** (e.g. "this component renders > N
  child nodes"). Performance audit is a separate concern, not a
  build-validation concern.
- **Custom user-authored rules / plugins.** The rule registry is
  internal in this plan; opening it to apps multiplies the
  testing surface without a clear use case yet. A future plan
  can promote `registerRule` to public API.
- **Cross-file flow analysis** (e.g. tracking a value passed
  from `<App.Main>` through a slot into a deeply nested
  component). Too expensive for the LSP latency budget; the
  cross-binding rules in Phase 3 cover the high-value cases.
- **Lint of theme files / SCSS modules.** Owned by the
  [sealed-theming-sandbox plan](./08-sealed-theming-sandbox.md)
  Step 5.1 (physical-CSS lint).
- **Lint of changeset metadata.** Owned by the
  [enforced-versioning plan](./12-enforced-versioning.md) Step 3.2
  (release guard).
- **JSON / YAML / `config.json` validation.** Outside the
  `.xmlui` markup + expression scope; the
  [verified-type-contracts](./01-verified-type-contracts.md) plan's
  config-validation surface (its Step 3.x) covers this.
