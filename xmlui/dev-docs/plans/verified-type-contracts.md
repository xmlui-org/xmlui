# Verified Type Contracts — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §4 "Type Safety and Metadata Contracts"](../managed-react.md) and the §17 scorecard row **"Type contracts — Metadata, not verified."**

---

## Goal

Close the §17 scorecard row:

> **Type contracts — Metadata, not verified.**
> Path to managed: *Parse-time prop validation against metadata.*

Today every component declares rich metadata
([`ComponentDefs.ts`](../../src/abstractions/ComponentDefs.ts)) — prop names,
`valueType`, `availableValues` enums, events, exposed methods. The
[`valueExtractor`](../../src/components-core/rendering/valueExtractor.ts)
performs deterministic coercion at runtime. The language server already reads
this metadata for completions. **Nothing currently verifies that markup
matches it.** A typo (`<Button labe="Save" />`), a wrong type
(`<NumberBox initialValue="hello" />`), a missing required prop
(`<Form />` without `data`), or a value outside an `availableValues` set
(`<Button variant="vibrant" />`) all parse, mount, and silently coerce.

This is, as §4 notes, *the largest single safety improvement after cycle
detection*: the metadata is already there, the coercion is already
centralised, and the language server already loads the registry. The work is
to spend the raw material that already exists.

The plan is split into small, independently shippable, independently
testable steps in priority order:

1. **Strengthen the metadata vocabulary** so verifiable claims can be
   expressed — today's `valueType` set is too coarse.
2. **Build a verifier** that takes a `ComponentDef` tree + the registry and
   produces a list of `TypeContractDiagnostic` entries.
3. **Surface diagnostics** through the existing pipelines — language server
   first, then Vite plugin, then runtime warn-mode.
4. **Tighten** with a strict mode that fails the build, plus a metadata
   ↔ TypeScript drift check.

Every step lands behind a single `App.appGlobals.strictTypeContracts`
switch (see Step 0) so the rollout can stage warn → opt-in → default-on
without touching call sites.

---

## Conventions

- **Source of truth for metadata:**
  [`ComponentDefs.ts`](../../src/abstractions/ComponentDefs.ts) defines
  `PropertyValueType`, `PropertyValueDescription`, and the
  `ComponentMetadata` shape. The verifier consumes the *resolved* metadata
  registry exposed by
  [`ComponentRegistryContext`](../../src/components-core/rendering/ContainerWrapper.tsx)
  — the same object the language server consumes — so the LSP, the Vite
  plugin, and the runtime all see identical contracts.
- **Source of truth for runtime coercion:**
  [`valueExtractor.ts`](../../src/components-core/rendering/valueExtractor.ts).
  The verifier and the extractor share a coercion-decision table (Step 1.2
  introduces the table; today the rules are inlined per `as*` helper).
- **Source of truth for the parsed tree:** the `ComponentDef` produced by
  [`parseXmlUiMarkup()`](../../src/parsers/xmlui-parser/transform.ts), with
  source ranges already attached (`__SOURCE` / `__SOURCE_RANGE` on each
  prop). The verifier reads these to produce LSP-shaped diagnostics with
  precise spans.
- **Existing infrastructure to reuse — do not reinvent:**
  - [`diagnostic.ts`](../../src/language-server/services/diagnostic.ts)
    already wires schema-level errors to LSP diagnostics. The verifier
    plugs in as an additional diagnostic producer.
  - [`vite-xmlui-plugin.ts`](../../src/nodejs/vite-xmlui-plugin.ts)
    already runs `transform` + `buildEnd` hooks — the same hooks the
    reactive-cycle-detection plan uses for build-time gating.
  - [`signError`](../../src/components-core/rendering/error-rendering.tsx)
    is the runtime warn-mode surface; trace `kind: "type-contract"` joins
    the existing inspector taxonomy.
- **New module location:**
  `xmlui/src/components-core/type-contracts/` (new directory) — keeps the
  verifier, the rule table, and the diagnostic formatter independent of
  rendering internals so the LSP and the Vite plugin can import them
  without dragging in the React tree.
- **Diagnostic shape:** new `TypeContractDiagnostic` carrying
  `{ code: TypeContractCode, severity: "error" | "warn", componentName,
  propName?, expected?, actual?, range?, message }` where
  `TypeContractCode ∈ { "unknown-prop", "wrong-type", "missing-required",
  "value-not-in-enum", "unknown-event", "unknown-exposed-method",
  "deprecated-prop" }`.
- **Reporting mode:** when `strictTypeContracts === false` (default during
  rollout) the verifier emits warn-level entries through the trace and
  through LSP `DiagnosticSeverity.Warning`; the Vite plugin logs but does
  not fail the build. In strict mode, `unknown-prop`, `wrong-type`,
  `missing-required`, and `value-not-in-enum` upgrade to `error` and the
  Vite plugin fails the build.
- **Test layout:** unit tests under
  `xmlui/tests/components-core/type-contracts/`; one spec per step.
  End-to-end tests for the LSP and Vite-plugin paths under
  `xmlui/tests-e2e/type-contracts/`.

Each step lists: scope, files touched, tests, acceptance criteria,
dependencies.

---

## Step 0 — Switch + Verifier Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictTypeContracts: boolean` (default `false`).
- Create `xmlui/src/components-core/type-contracts/` with three exported
  surfaces, all empty stubs:

  ```ts
  // diagnostics.ts
  export type TypeContractCode =
    | "unknown-prop"
    | "wrong-type"
    | "missing-required"
    | "value-not-in-enum"
    | "unknown-event"
    | "unknown-exposed-method"
    | "deprecated-prop";
  export interface TypeContractDiagnostic {
    code: TypeContractCode;
    severity: "error" | "warn";
    componentName: string;
    propName?: string;
    expected?: string;
    actual?: string;
    range?: { line: number; col: number; length?: number };
    uri?: string;
    message: string;
  }
  ```

  ```ts
  // verifier.ts
  import type { ComponentDef, ComponentMetadata } from "...";
  export interface VerifyOptions {
    strict?: boolean;            // gate "warn" vs "error"
    skipUnknown?: boolean;       // tolerate unregistered components
  }
  export function verifyComponentDef(
    def: ComponentDef,
    registry: ReadonlyMap<string, ComponentMetadata>,
    opts?: VerifyOptions,
  ): TypeContractDiagnostic[];
  ```

  ```ts
  // index.ts — barrel
  ```

- Wire `"type-contract"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document `strictTypeContracts` on `appGlobals` in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).

### Files

- `xmlui/src/components-core/type-contracts/verifier.ts` (new)
- `xmlui/src/components-core/type-contracts/diagnostics.ts` (new)
- `xmlui/src/components-core/type-contracts/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `type-contracts/verifier.test.ts`
  - Empty `ComponentDef` returns no diagnostics.
  - Verifier with `skipUnknown: true` tolerates an unregistered component.
  - Verifier without `skipUnknown` emits one `unknown-component` warn.

### Acceptance

- `strictTypeContracts` reads through `App.appGlobals` in markup.
- New module compiles; barrel exports are stable.
- No existing test changes behaviour.

### Dependencies

None.

---

## Phase 1 — Stronger Metadata Vocabulary

Today's `PropertyValueType = "boolean" | "string" | "number" | "any" |
"ComponentDef"` is too coarse to verify anything interesting. A button's
`size="medium"` is structurally a `string`, but the *intent* is "one of
these four enum values". `availableValues` already captures that for some
props, but is not used for verification. This phase widens the vocabulary
without breaking any existing metadata declaration.

### Step 1.1 — Extend `PropertyValueType` with Refinements

**Priority:** 1

#### Scope

- Add new value types to `PropertyValueType` while keeping every existing
  value supported:
  - `"integer"` — number coerced via `Number.isInteger`.
  - `"color"` — string matching CSS color syntax (delegate to a tiny
    parser; reject empty).
  - `"length"` — string matching `<number><unit>` with a known CSS unit,
    or a bare number.
  - `"url"` — string parsed by `new URL(value, base)`; relative URLs
    accepted.
  - `"icon"` — string matching a registered icon name (lookup the
    `IconRegistry`).
  - `"id-ref"` — string that must resolve to a sibling component's `id`
    in the same container scope.
- Each new type ships with a verifier rule and a runtime `as*` helper in
  `valueExtractor.ts` (Step 1.2 unifies them).
- `availableValues` becomes **the** way to declare a closed enum, even
  for `valueType: "string"`. The verifier treats
  `availableValues` as authoritative when present.

#### Files

- `xmlui/src/abstractions/ComponentDefs.ts` (extend `PropertyValueType`)
- `xmlui/src/components-core/type-contracts/rules/` (new directory; one
  file per rule: `integer.ts`, `color.ts`, `length.ts`, `url.ts`,
  `icon.ts`, `id-ref.ts`, `enum.ts`)
- `xmlui/src/components-core/rendering/valueExtractor.ts`
  (add `asInteger`, `asColor`, `asLength`, `asUrl`, `asIcon` helpers)

#### Tests

- `type-contracts/rules/*.test.ts`, one per rule:
  - Positive cases (valid input → no diagnostic).
  - Negative cases (invalid input → exact `TypeContractDiagnostic` shape).
  - Boundary cases (empty string, `null`, `undefined`).

#### Acceptance

- All new types are documented in
  [`component-architecture.md`](../../../.ai/xmlui/component-architecture.md)
  with one example each.
- Existing metadata declarations compile unchanged (the new union members
  are additive).
- `valueExtractor.asInteger` etc. are exported and used by at least one
  built-in component each (refactor opportunity, not required).

#### Dependencies

Step 0.

---

### Step 1.2 — Unified Coercion Decision Table

**Priority:** 2

#### Scope

- Extract the coercion logic currently inlined across `valueExtractor.ts`
  into a single decision table:

  ```ts
  // rules/coerce.ts
  export interface CoercionRule {
    valueType: PropertyValueType;
    verify(raw: unknown, ctx: VerifyContext): TypeContractDiagnostic | null;
    coerce(raw: unknown, ctx: VerifyContext): unknown;
  }
  export const coercionRules: ReadonlyMap<PropertyValueType, CoercionRule>;
  ```

- `valueExtractor.as*` helpers delegate to `coercionRules` — same
  decision table that the verifier uses, by construction. This is the
  single chokepoint §4 calls out.
- Backwards-compatible: existing `as*` helpers keep their signatures;
  the implementation moves under the hood.

#### Files

- `xmlui/src/components-core/type-contracts/rules/coerce.ts` (new)
- `xmlui/src/components-core/rendering/valueExtractor.ts` (delegate)

#### Tests

- `type-contracts/rules/coerce.test.ts`
  - Each rule's `verify` and `coerce` agree (verify says "ok" iff coerce
    is lossless).
  - Existing `valueExtractor.test.ts` continues to pass unchanged.

#### Acceptance

- Single coercion chokepoint exists; verifier and runtime cannot drift.
- No regression in `valueExtractor.test.ts`.

#### Dependencies

Step 1.1.

---

## Phase 2 — Verifier

The verifier walks a `ComponentDef` tree with the registry in hand and
produces diagnostics. Pure function, no side effects, no React, no DOM.

### Step 2.1 — Walk + Per-Component Checks

**Priority:** 3

#### Scope

- Implement `verifyComponentDef()`:
  1. Look up the component's metadata by `def.type`. If absent and
     `skipUnknown !== true`, emit one `unknown-component` warn and skip
     prop checks for this node.
  2. For each declared prop in metadata: if `isRequired && !(name in
     def.props)`, emit `missing-required`.
  3. For each entry in `def.props`: if `name` is not in metadata, emit
     `unknown-prop` (with a "did you mean…?" suggestion via Levenshtein
     distance ≤ 2 against known prop names — same trick the LSP uses).
  4. For each entry in `def.props` whose value is a literal (not an
     expression): run `coercionRules.get(valueType)?.verify(value)` and
     forward the diagnostic.
  5. For each entry whose value is an `availableValues` enum: check
     literal membership; emit `value-not-in-enum`.
  6. For each entry in `def.events`: if not in metadata, emit
     `unknown-event`.
  7. Recurse into `def.children`.
- Expression-valued props (e.g. `value="{state.x}"`) are **not** verified
  in this step — the value is unknown until runtime. They are covered
  by Phase 4.1 (runtime extension of the same diagnostics) and by an LSP
  hover hint that surfaces the expected type.

#### Files

- `xmlui/src/components-core/type-contracts/verifier.ts` (fill in)
- `xmlui/src/components-core/type-contracts/suggestions.ts` (new — small
  Levenshtein helper)

#### Tests

- `type-contracts/verifier.test.ts`
  - Each `TypeContractCode` has a positive test: verifier emits exactly
    one diagnostic of the expected code with the expected fields.
  - Recursion: a deeply nested unknown prop is found.
  - Suggestion: `<Button labe="Save" />` produces an `unknown-prop`
    diagnostic with `suggestion: "label"`.
  - Performance: verifier handles a 1000-node tree in < 50 ms (fixture
    in `tests/fixtures/large-tree.json`).

#### Acceptance

- Every `TypeContractCode` is reachable from a unit test.
- Verifier is pure (no `console.*`, no I/O).
- Verifier output is stable: identical input ⇒ identical diagnostic
  array (sorted by `range.line`, then `range.col`).

#### Dependencies

Step 1.2.

---

## Phase 3 — Surface Diagnostics

The diagnostic shape is universal; only the surface differs.

### Step 3.1 — Language Server Integration

**Priority:** 4

#### Scope

- In
  [`diagnostic.ts`](../../src/language-server/services/diagnostic.ts),
  call `verifyComponentDef()` after the existing schema-level checks and
  forward each `TypeContractDiagnostic` as an LSP `Diagnostic` with the
  appropriate severity (`Warning` in non-strict, `Error` in strict).
- Suggestions become LSP code actions: for `unknown-prop` with a
  `suggestion`, offer a "Replace with `<suggestion>`" quick fix.
- Document the new diagnostics in the
  [VS Code extension README](../../../tools/vscode/README.md).

#### Files

- `xmlui/src/language-server/services/diagnostic.ts`
- `tools/vscode/README.md`

#### Tests

- `tests-e2e/type-contracts/lsp.spec.ts`
  - Open a `.xmlui` file with a typo prop; assert the diagnostic appears
    with the expected message, range, and code action.
  - Toggle `strictTypeContracts` in workspace settings; assert severity
    flips between Warning and Error.

#### Acceptance

- Existing LSP tests continue to pass.
- Verifier diagnostics appear in the Problems panel with the expected
  severity and quick-fix availability.

#### Dependencies

Step 2.1.

---

### Step 3.2 — Vite Plugin Integration

**Priority:** 5

#### Scope

- In
  [`vite-xmlui-plugin.ts`](../../src/nodejs/vite-xmlui-plugin.ts):
  - `transform` hook: call the verifier on each `.xmlui` file. In
    non-strict mode, log warnings to the dev console. In strict mode,
    throw to fail the build.
  - `buildEnd` hook: aggregate diagnostics across all files into a
    single summary report (count by code).
- Add a CLI summary line: `xmlui: 3 type-contract warnings (run with
  --strict to fail)`.

#### Files

- `xmlui/src/nodejs/vite-xmlui-plugin.ts`

#### Tests

- `tests-e2e/type-contracts/vite.spec.ts`
  - Build a fixture project with a known typo; assert the build logs
    the warning in non-strict and fails in strict.

#### Acceptance

- No build-time perf regression > 5 % on the docs site (verified via
  the existing build-time benchmark).
- Strict mode produces a single, actionable error per offending prop.

#### Dependencies

Step 2.1.

---

### Step 3.3 — Runtime Warn-Mode for Expression-Valued Props

**Priority:** 6

#### Scope

- Expression-valued props bypass the static verifier (their value is
  unknown until runtime). Extend
  [`valueExtractor`](../../src/components-core/rendering/valueExtractor.ts)
  to call `coercionRules.get(valueType).verify(resolvedValue)` and emit
  a `kind: "type-contract"` trace entry with a single deduplication
  window per `(componentUid, propName)` to avoid log spam from
  repeated re-renders.
- In strict mode, the warn upgrades to a `console.error` plus a
  one-shot toast — same pattern as the cycle detection plan.

#### Files

- `xmlui/src/components-core/rendering/valueExtractor.ts`
- `xmlui/src/components-core/type-contracts/runtime.ts` (new — the
  dedup cache and emit helper)

#### Tests

- `type-contracts/runtime.test.ts`
  - `<NumberBox initialValue="{state.s}" />` with `state.s = "hello"`
    emits exactly one warn; updating `state.s = "world"` emits one
    more (different value, same prop, dedup by value-hash).
  - Strict mode produces the toast exactly once per session.

#### Acceptance

- Runtime overhead negligible: dedup cache avoids more than one verify
  per `(uid, prop, valueHash)` triple.
- No regression in existing runtime warning surfaces.

#### Dependencies

Step 1.2, Step 2.1.

---

## Phase 4 — Tightening

### Step 4.1 — TypeScript ↔ Metadata Drift Check

**Priority:** 7

#### Scope

- Each built-in component has a TypeScript `Props` type next to its
  metadata. They drift today: a TS-side rename does not break the
  metadata. Add a build-time check that, for every component, the TS
  `Props` keys are a superset of the metadata `props` keys (extra TS
  props are allowed; metadata props missing from TS are an error).
- Implemented as a small `scripts/check-metadata-drift.ts` Node script
  using the TypeScript compiler API. Wired into `package.json` as
  `npm run check:metadata` and gated in CI.

#### Files

- `xmlui/scripts/check-metadata-drift.ts` (new)
- `xmlui/package.json` (script entry)
- `.github/workflows/*.yml` (CI step)

#### Tests

- `tests/scripts/check-metadata-drift.test.ts`
  - Fixture with matching TS + metadata: passes.
  - Fixture with missing metadata key: fails with a specific message.

#### Acceptance

- All in-repo components pass the drift check.
- The check runs in < 5 s on the full repo (tsc has metadata files
  in-memory already).

#### Dependencies

Step 1.1 (new value types must round-trip through the check).

---

### Step 4.2 — Default `strictTypeContracts: true` in Next Major

**Priority:** 8 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip the
  default to `true` in the next major release.
- Add a changeset and migration note: typos and unknown props will
  now fail builds.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts` (default flip)
- `.changeset/strict-type-contracts-default.md`
- `xmlui/dev-docs/guide/27-type-contracts.md` (migration section)

#### Tests

- Existing test suite must pass with the default flipped.
- A new spec under `xmlui/tests-e2e/type-contracts/strict-mode.spec.ts`
  covers each `TypeContractCode` producing the expected diagnostic.

#### Acceptance

- All in-repo example apps and the docs site pass under strict mode.

#### Dependencies

Step 4.1.

---

### Step 4.3 — Documentation

**Priority:** 9 (lands alongside Step 3.1 / 3.2 in practice)

#### Scope

- New `xmlui/dev-docs/guide/27-type-contracts.md` chapter and matching
  `.ai/xmlui/type-contracts.md` reference.
- Updates [`managed-react.md` §4](../managed-react.md) to mark the
  asymmetry resolved.
- Updates the §17 scorecard row from
  *"Metadata, not verified"* to
  *"Verified — parse-time, build-time, runtime warn-mode."*
- Updates [`AGENTS.md` documentation map](../../../AGENTS.md) with the
  new AI doc.

#### Files

- `xmlui/dev-docs/guide/27-type-contracts.md` (new)
- `.ai/xmlui/type-contracts.md` (new)
- `xmlui/dev-docs/managed-react.md`
- `AGENTS.md`

#### Acceptance

- Both chapters cover the four primitives (extended `PropertyValueType`,
  the verifier, the surfaces, the strict switch) with at least one
  worked example each.
- A "rule reference" table lists every `TypeContractCode` with cause,
  severity in non-strict / strict, and example fix.

#### Dependencies

Steps 1.1, 2.1, 3.1, 3.2.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **Foundations** | 0, 1.1, 1.2 | Vocabulary widens, single coercion table; no user-visible behaviour | Next minor |
| **Verifier + LSP** | 2.1, 3.1 | Diagnostics in Problems panel; quick-fix code actions | Next minor + 1 |
| **Build-time + runtime** | 3.2, 3.3 | Vite warns; runtime trace dedup-warns; both upgrade in strict | Next minor + 2 |
| **Drift check + docs** | 4.1, 4.3 | CI-gated drift; guide chapter shipped | Next minor + 2 |
| **Strict default** | 4.2 | `strictTypeContracts: true` is the default | Next major |

Each step is independently revertible: removing the verifier call from
`diagnostic.ts` reverts the LSP to today's behaviour without touching
markup; removing the call from `vite-xmlui-plugin.ts` reverts the build.

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   ├─> Step 1.1 (extend PropertyValueType)
   │      │
   │      └─> Step 1.2 (unified coercion table)
   │             │
   │             ├─> Step 2.1 (verifier walk)
   │             │      │
   │             │      ├─> Step 3.1 (LSP)
   │             │      ├─> Step 3.2 (Vite)
   │             │      └─> Step 3.3 (runtime warn-mode)
   │             │
   │             └─> Step 4.1 (TS-drift check)
   │
   └────────────────────────────────────────> Step 4.3 (docs)
                                                 │
                                                 └─> Step 4.2 (strict default)
```

---

## Resolved Decisions

These are the design choices baked into the plan. Each has an
alternative noted for future revisitation.

1. **`availableValues` is authoritative when present.** A prop with both
   `valueType: "string"` and `availableValues: [...]` is verified as a
   closed enum. Alternative considered: require a separate
   `valueType: "enum"` — rejected because it forces a metadata
   migration on every existing enum prop and the runtime coercion is
   identical.

2. **Expression-valued props skip the static verifier.** Static
   verification of `value="{state.x}"` would require type inference
   over the script-runner AST, which is a much larger project (and
   overlaps with the reactive-cycle analyzer). Step 3.3 covers
   expression values at runtime; the LSP surfaces the expected type
   via hover.

3. **Single coercion chokepoint.** §4's "raw material" claim is the
   coexistence of metadata + a single coercion site. The verifier
   *must* share its decision table with the runtime extractor or the
   two surfaces will drift. Step 1.2 enforces this.

4. **No new "Validator" abstraction in user code.** Users do not write
   custom verifiers. Refining a prop's contract means refining its
   metadata declaration — the same surface they already use. The
   managed-validator list stays closed and central.

5. **Drift check is build-time only.** Runtime drift is impossible
   because the runtime reads the metadata directly; the only drift
   risk is between TypeScript `Props` types and metadata declarations,
   which is purely an authoring concern.

---

## Out of Scope

- **Static type inference over expressions.** A full type checker for
  the script-runner AST is a separate plan (see "Reactive cycle
  detection" for the sister analyzer; type inference would build on
  the same dependency graph).
- **Generated TypeScript types from metadata.** A `xmlui-codegen`
  command that emits a `*.d.ts` per component for downstream React
  consumers is interesting but orthogonal — track separately.
- **`PropertyValueType: "ComponentDef"` slot constraints.** Verifying
  that `<Form>`'s child slot only accepts `<FormItem>` requires a
  slot-type vocabulary that does not exist yet; address in a future
  "slot contracts" plan.
- **Theme variable verification.** Theme variables are a separate
  contract (see [`themevars-namespace.md`](./themevars-namespace.md)).
