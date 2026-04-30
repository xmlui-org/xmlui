# UDC Sandboxing — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §14 "Sandboxing of User-Defined Components"](./managed-react.md) and the §17 scorecard row **"UDC sandboxing — Absent."**

---

## Goal

Close the §17 scorecard row:

> **UDC sandboxing — Absent.**
> Path to managed: *Explicit prop/event contract for UDCs; capability scoping.*

Today, User-Defined Components (UDCs) — the compound components
documented in
[`user-defined-components.md`](../../../.ai/xmlui/user-defined-components.md)
— are an **extensibility mechanism, not a trust boundary**.
A UDC participates in the same state container model as its host:
it sees the parent's full state, vars, globals, and exposed APIs
through normal scoping. Its public interface (props, events,
slots) is *inferred* by walking `$props.<member>` references at
parse time, not *declared* by the author. There is no manifest,
no permission prompt, no enforced scope restriction. If a UDC
author is not the application author (third-party component
pack), the application has no contract to enforce.

The other §17 plans address adjacent problems but do not close
this one:

- [verified-type-contracts](./01-verified-type-contracts.md) checks
  *value types* on declared props — but UDCs do not declare prop
  types today.
- [build-validation-analyzers](./13-build-validation-analyzers.md)
  catches *unknown* identifiers — but everything is "known"
  inside a UDC because scope is fully open.
- [structured-exception-model](./07-structured-exception-model.md)
  catches *thrown* errors crossing boundaries — but a UDC has no
  boundary to cross.

This plan delivers the **trust boundary** itself: an explicit
declared contract surface for every UDC, enforced at
instantiation, with capability scoping and an opt-in untrusted
mode. The work is split into independently shippable phases:

1. **Declared contract surface** — `<Component name … props
   events methods slots>` with explicit `<Prop>`, `<Event>`,
   `<Method>`, `<Slot>` declarations; inference becomes a
   fallback.
2. **Scope enforcement** — UDCs only see what their declaration
   names; identifier reads outside the declared surface fail
   under strict mode.
3. **Capability declarations** — `<Component capabilities="…">`
   names which managed primitives (`App.fetch`, `Clipboard.copy`,
   `navigate`, `WebSocket`, …) the UDC may use; absent
   capabilities are blocked.
4. **Untrusted-component mode** — `<App udcTrust>` and per-UDC
   `<Component trust="trusted | untrusted">`; untrusted UDCs run
   with strict scope + capability enforcement *plus* a
   permission manifest the application can review.
5. **Third-party manifest format** — UDC packages ship a
   `udc.manifest.json` that declares contract + capabilities;
   the analyzer checks that the implementation matches the
   manifest.
6. **Docs + strict default** in next major.

Every step lands behind `App.appGlobals.strictUdcSandbox:
boolean` (see Step 0).

---

## Conventions

- **Source of truth for UDC mechanics:**
  [`user-defined-components.md`](../../../.ai/xmlui/user-defined-components.md)
  and the renderers in
  [`xmlui/src/components-core/CompoundComponent.tsx`](../../src/components-core/CompoundComponent.tsx).
  All work in this plan is gated by the same parse-time pipeline
  that today walks `$props.<member>` to infer the prop list.
- **Source of truth for scope construction:** the container
  assembly described in
  [`container-state.md`](../../../.ai/xmlui/container-state.md)
  — the implicit-variable-injection step (where `$props`,
  exposed values, and parent context become accessible) is where
  scope enforcement hooks in.
- **Source of truth for the managed primitives that capabilities
  govern:**
  [`bannedMembers.ts`](../../src/components-core/script-runner/bannedMembers.ts)
  and [`managed-react.md` §1 / §15](./managed-react.md) — the
  sanctioned replacements `App.fetch`, `App.randomBytes`,
  `Clipboard.copy`, `navigate`, `<WebSocket>`, `<EventSource>`,
  `Log.*`. The capability set is a closed enum derived from
  this list (see Step 3.1).
- **New module location:**
  `xmlui/src/components-core/udc-sandbox/` (new directory) holds
  the contract validator, scope enforcer, capability gate, and
  manifest loader. `udc-sandbox/index.ts` is the barrel.
- **New trace `kind: "udc"`** in the runtime Inspector for
  contract / scope / capability violations. Shape:
  `{ kind: "udc", code: UdcDiagCode, severity, udc, … }`.
- **New analyzer rule prefix `udc-*`** integrated with
  [build-validation-analyzers](./13-build-validation-analyzers.md)
  Phase 4 surfaces (LSP, Vite, CLI) — same suppression syntax,
  same severity escalation under `--strict`.
- **Diagnostic codes** (open union `UdcDiagCode`):
  `udc-prop-undeclared`, `udc-prop-shape-mismatch`,
  `udc-event-undeclared`, `udc-method-undeclared`,
  `udc-slot-undeclared`, `udc-scope-leak`,
  `udc-capability-missing`, `udc-capability-undeclared`,
  `udc-manifest-mismatch`, `udc-untrusted-violation`.
- **No new globals injected into the UDC scope.** Capabilities
  *gate* existing globals; they do not introduce new ones.
- **Declared-over-inferred:** when a UDC has both an explicit
  `<Prop>` declaration *and* inferred references, the explicit
  declaration wins; references to undeclared identifiers become
  `udc-prop-undeclared` diagnostics.
- **Test layout:** unit tests under
  `xmlui/tests/components-core/udc-sandbox/`; one spec per rule.
  E2E tests under `xmlui/tests-e2e/udc-sandbox/`.

Each step lists: scope, files touched, tests, acceptance criteria,
dependencies.

---

## Step 0 — Switch + UDC-Sandbox Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictUdcSandbox: boolean` (default
  `false`; flips to `true` in the next major).
- Create `xmlui/src/components-core/udc-sandbox/` with stubs:

  ```ts
  // diagnostics.ts
  export type UdcDiagCode =
    | "udc-prop-undeclared"
    | "udc-prop-shape-mismatch"
    | "udc-event-undeclared"
    | "udc-method-undeclared"
    | "udc-slot-undeclared"
    | "udc-scope-leak"
    | "udc-capability-missing"
    | "udc-capability-undeclared"
    | "udc-manifest-mismatch"
    | "udc-untrusted-violation";

  export interface UdcDiagnostic {
    code: UdcDiagCode;
    severity: "error" | "warn" | "info";
    udc: string;
    file?: string;
    line?: number;
    column?: number;
    message: string;
    data?: unknown;
  }
  ```

  ```ts
  // contract.ts
  export interface UdcContract {
    name: string;
    props: ReadonlyMap<string, UdcPropDecl>;
    events: ReadonlySet<string>;
    methods: ReadonlySet<string>;
    slots: ReadonlySet<string>;
    capabilities: ReadonlySet<UdcCapability>;
    trust: "trusted" | "untrusted";
  }
  export interface UdcPropDecl {
    name: string;
    type?: string;            // see verified-type-contracts plan
    required?: boolean;
    defaultValue?: unknown;
  }
  export type UdcCapability =
    | "fetch" | "websocket" | "eventsource"
    | "navigate" | "clipboard" | "randomBytes"
    | "log" | "mark" | "environment";
  ```

  ```ts
  // scope.ts
  export interface UdcScopeGate {
    canRead(identifier: string): boolean;
    onLeak(identifier: string): UdcDiagnostic;
  }
  export function buildScopeGate(
    contract: UdcContract,
    parentScope: ReadonlyMap<string, unknown>,
    strict: boolean,
  ): UdcScopeGate;
  ```

  ```ts
  // capability.ts
  export function gateCapability(
    contract: UdcContract,
    capability: UdcCapability,
  ): UdcDiagnostic | null;
  ```

  ```ts
  // manifest.ts
  export interface UdcManifest {
    name: string;
    version: string;
    contract: Omit<UdcContract, "trust">;
    trust?: "trusted" | "untrusted";
  }
  export function loadManifest(path: string): UdcManifest;
  ```

  ```ts
  // index.ts — barrel
  ```

- Wire `"udc"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document the new appGlobals key in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).
- Reserve the `udc-*` diagnostic prefix in the
  [build-validation-analyzers](./13-build-validation-analyzers.md)
  `BuildDiagnosticCode` union so analyzer rules can extend it.

### Files

- `xmlui/src/components-core/udc-sandbox/diagnostics.ts` (new)
- `xmlui/src/components-core/udc-sandbox/contract.ts` (new)
- `xmlui/src/components-core/udc-sandbox/scope.ts` (new)
- `xmlui/src/components-core/udc-sandbox/capability.ts` (new)
- `xmlui/src/components-core/udc-sandbox/manifest.ts` (new)
- `xmlui/src/components-core/udc-sandbox/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `udc-sandbox/contract.test.ts` — empty contract round-trips;
  trust defaults to `"trusted"`.

### Acceptance

- `strictUdcSandbox` reads through `App.appGlobals`.
- New module compiles; barrel exports stable.
- No existing test changes behaviour.

### Dependencies

None (other than alignment with build-validation-analyzers Step 0
for the shared diagnostic prefix).

---

## Phase 1 — Declared Contract Surface

### Step 1.1 — `<Prop>`, `<Event>`, `<Method>`, `<Slot>` declarations

**Priority:** 1

#### Scope

- Extend the UDC root `<Component>` markup to accept an
  explicit declaration block:

  ```xmlui
  <Component name="MoneyInput">
    <Prop name="amount" type="number" required />
    <Prop name="currency" type="string" defaultValue="USD" />
    <Event name="changed" />
    <Method name="reset" />
    <Slot name="footer" />

    <!-- existing implementation markup follows -->
    <TextBox value="{$props.amount}" />
  </Component>
  ```

- Parser produces a `UdcContract` for every UDC at parse time.
- When declarations are present, they replace inference.
- When declarations are absent, the existing inference walk runs
  (backwards-compatible default).
- A new diagnostic `udc-prop-undeclared` (severity `info`;
  strict `error`) fires when the implementation references
  `$props.foo` and `foo` is not in the declared `<Prop>` list.
- Declared `type` integrates with
  [verified-type-contracts](./01-verified-type-contracts.md): the
  type string is checked at the parent boundary at every
  instantiation (the parent passes a value of the wrong type →
  `prop-shape-mismatch` diagnostic from that plan; declared
  type recorded as `udc-prop-shape-mismatch` here when it is
  the UDC contract that detected the mismatch).

#### Files

- The XMLUI parser
  ([`parsers/xmlui-parser/`](../../src/parsers/xmlui-parser/))
- `xmlui/src/components-core/CompoundComponent.tsx`
- `xmlui/src/components-core/udc-sandbox/contract.ts`
- New analyzer rule
  `xmlui/src/components-core/analyzer/rules/udc-prop-undeclared.ts`
  (extends build-validation-analyzers)

#### Tests

- `udc-sandbox/contract.test.ts` — declared `<Prop name="x"
  type="number" />` produces the expected `UdcContract`.
- `udc-prop-undeclared.test.ts` — `$props.unknown` reference in
  a UDC with declared props fires the diagnostic with suggestion.
- Backwards-compat: a UDC with no declarations still infers as
  today.

#### Acceptance

- Existing UDCs (no declarations) continue to work unchanged.
- New explicit declarations populate `componentDef.props/events/
  methods/slots` for use by the inspector and the analyzer.

#### Dependencies

Step 0; the build-validation-analyzers Phase 4 surfaces (the
new rule rides on that pipeline).

---

### Step 1.2 — Migrate inferred metadata into the explicit shape

**Priority:** 2

#### Scope

- The parse-time inference walk (today: collect `$props.<member>`
  refs) emits a *recommended* contract that authors can paste
  into the markup. New CLI subcommand `xmlui udc declare
  <component-file>` writes the inferred declarations into the
  UDC source file as a one-shot migration helper.
- An opt-in lint `udc-no-implicit-contract` (severity `info`;
  strict `warn`) flags any UDC missing explicit declarations.

#### Files

- `xmlui/scripts/cli/udc-declare.ts` (new)
- `xmlui/src/components-core/analyzer/rules/udc-no-implicit-contract.ts`
  (new)

#### Tests

- `udc-declare.test.ts` — running on a fixture UDC injects the
  expected `<Prop>` block.

#### Acceptance

- Existing UDCs in the docs site can be migrated by running the
  CLI in batch.

#### Dependencies

Step 1.1.

---

## Phase 2 — Scope Enforcement

### Step 2.1 — Strict scope gate on identifier reads

**Priority:** 3

#### Scope

- The container assembled for a UDC (per
  [`user-defined-components.md`](../../../.ai/xmlui/user-defined-components.md)
  step 2) installs a `UdcScopeGate` ahead of the implicit
  variable injection.
- Identifiers read from inside a UDC's expressions resolve in
  this order (no change from today):
  1. Local `var` / `function` declarations inside the UDC.
  2. `$props` (declared prop set only — see below).
  3. Parent slot context (`$item`, `$index`, etc.) when the UDC
     occupies a slot.
  4. App globals (`App.*`, `Log.*`, `Clipboard.*`, `navigate`,
     gated by capabilities — see Phase 3).
- **What changes**: identifier reads outside this set
  (e.g. reaching for a parent-page `var.parentSecret` that the
  UDC was not passed as a prop) produce `udc-scope-leak`.
  - Default severity: `info` (today's leaks become visible
    without breaking).
  - Strict severity: `error` (the read fails with `UdcScopeError`
    — see [structured-exception-model](./07-structured-exception-model.md)
    for the error class shape).
- Implementation hook: the existing parent-scope fallback in
  the script runner consults `UdcScopeGate.canRead(identifier)`
  before climbing to the parent container. The gate only blocks
  the climb; everything inside the UDC's own container remains
  reachable.

#### Files

- `xmlui/src/components-core/script-runner/eval-tree-common.ts`
- `xmlui/src/components-core/CompoundComponent.tsx`
- `xmlui/src/components-core/udc-sandbox/scope.ts`

#### Tests

- `udc-sandbox/scope.test.ts`:
  - Reading `$props.amount` inside a UDC succeeds.
  - Reading `var.parentSecret` declared on the parent page fires
    `udc-scope-leak` (and throws under strict).
  - Reading `App.now()` succeeds (gated by capability instead —
    see Phase 3).
- `xmlui/tests-e2e/udc-sandbox/scope-leak.spec.ts` covers the
  end-to-end behaviour with the inspector trace.

#### Acceptance

- Today's docs site runs warn-mode clean (genuine leaks fixed in
  the same PR; declared as part of the migration in Step 1.2).
- Under strict mode, any leak produces a structured error
  message naming the leaked identifier and the parent variable
  it shadowed.

#### Dependencies

Step 1.1 (declared prop set is the bound for `$props.*`
membership).

---

### Step 2.2 — Slot context contract

**Priority:** 4

#### Scope

- A UDC that exposes a `<Slot name="…">` declares which
  context vars it provides to slot content (`$item`,
  `$index`, etc.). Today this is implicit.

  ```xmlui
  <Slot name="row" provides="item, index" />
  ```

- Slot consumers reading a context var the slot does not
  declare → `udc-slot-undeclared` (severity `warn`; strict
  `error`).

#### Files

- The XMLUI parser
- `xmlui/src/components-core/udc-sandbox/contract.ts`
- `xmlui/src/components-core/analyzer/rules/udc-slot-undeclared.ts`
  (new)

#### Tests

- A UDC declaring `<Slot name="row" provides="item" />` and
  consumed with `$index` references fires the diagnostic.

#### Acceptance

- Slot contracts become self-documenting; the analyzer catches
  silent mis-uses.

#### Dependencies

Step 1.1; Step 2.1.

---

## Phase 3 — Capability Declarations

### Step 3.1 — Capability set + gate

**Priority:** 5

#### Scope

- `<Component capabilities="…">` declares a comma-separated
  capability set drawn from the closed enum in Step 0
  (`fetch | websocket | eventsource | navigate | clipboard |
  randomBytes | log | mark | environment`).
- Default capability set when the attribute is absent: **all
  capabilities granted** (backwards-compatible).
- When `capabilities` is present, only the listed capabilities
  resolve in the UDC's scope:
  - `App.fetch(…)` / `<DataSource>` / `<APICall>` → requires
    `fetch`.
  - `<WebSocket>` → requires `websocket`.
  - `<EventSource>` → requires `eventsource`.
  - `navigate(…)` → requires `navigate`.
  - `Clipboard.copy(…)` → requires `clipboard`.
  - `App.randomBytes(…)` → requires `randomBytes`.
  - `Log.*` → requires `log`.
  - `App.now/mark/measure` → requires `mark`.
  - `App.environment` → requires `environment`.
- Missing capability:
  - Default severity `warn`; strict severity `error` (call
    fails with `UdcCapabilityError`, see
    [structured-exception-model](./07-structured-exception-model.md)).
  - Diagnostic `udc-capability-missing`.
- Declaring a capability the UDC does not actually use:
  diagnostic `udc-capability-undeclared` (severity `info`;
  strict `warn`) — keeps capability sets tight and reviewable.

#### Files

- The XMLUI parser
- `xmlui/src/components-core/udc-sandbox/capability.ts`
- The script runner integration points where managed
  primitives resolve
- New analyzer rules
  `xmlui/src/components-core/analyzer/rules/udc-capability-{missing,undeclared}.ts`
  (new)

#### Tests

- `udc-sandbox/capability.test.ts`:
  - UDC with `capabilities="fetch"` calling `Clipboard.copy(…)`
    fires `udc-capability-missing` and throws under strict.
  - UDC with `capabilities="fetch, clipboard"` that never
    calls clipboard fires `udc-capability-undeclared`.

#### Acceptance

- Existing UDCs with no `capabilities` attribute work unchanged.
- A UDC declaring a tight capability set sees the listed
  primitives only.

#### Dependencies

Step 0; Step 2.1.

---

### Step 3.2 — Capability narrowing per call site

**Priority:** 6

#### Scope

- The parent that *instantiates* a UDC may **further narrow**
  capabilities at the call site:

  ```xmlui
  <MoneyInput amount="{99}" capabilities="" />     <!-- no managed primitives -->
  <MoneyInput amount="{99}" capabilities="log" />  <!-- only Log.* -->
  ```

- The effective capability set is the intersection of the UDC
  declaration and the call-site override.
- Call-site override that *adds* a capability the UDC did not
  declare is rejected at parse time:
  `udc-capability-undeclared` (severity `error`; same in
  strict). Parents cannot grant capabilities the author did not
  request.

#### Files

- The XMLUI parser
- `xmlui/src/components-core/CompoundComponent.tsx`
- `xmlui/src/components-core/udc-sandbox/capability.ts`

#### Tests

- Parent passing `capabilities=""` to a UDC declared with
  `fetch, log` results in zero capabilities at runtime.
- Parent passing `capabilities="websocket"` to a UDC declared
  with `fetch` fires the parse-time error.

#### Acceptance

- Capability narrowing composes cleanly; the analyzer surfaces
  invalid widening attempts.

#### Dependencies

Step 3.1.

---

## Phase 4 — Untrusted-Component Mode

### Step 4.1 — `trust="untrusted"` per UDC + `<App udcTrust>`

**Priority:** 7

#### Scope

- New attribute `<Component trust="trusted | untrusted">` (default
  `"trusted"` for backwards-compatibility).
- New app-level toggle `<App udcTrust="open | review | strict">`:
  - `"open"` (default): trust attribute is informational only.
  - `"review"`: every untrusted UDC produces a
    `udc-untrusted-violation` (severity `warn`) on every
    instantiation, listing its declared capabilities, so the
    application owner sees the surface in CI.
  - `"strict"`: untrusted UDCs run with strict scope + capability
    enforcement *unconditionally*, regardless of
    `App.appGlobals.strictUdcSandbox`.
- Untrusted UDCs:
  - Cannot omit the explicit declaration block — implicit
    inference is rejected (`udc-prop-undeclared` becomes
    `error` even outside strict mode).
  - Cannot declare `capabilities` absence (the attribute is
    required; an empty list is a valid declaration).
  - Are visually marked in the inspector trace (`trust:
    "untrusted"` field on the `kind: "udc"` entry).

#### Files

- The XMLUI parser
- `xmlui/src/components-core/udc-sandbox/contract.ts`
- `xmlui/src/components-core/CompoundComponent.tsx`
- `xmlui/src/components-core/abstractions/standalone.ts`
- New analyzer rule
  `xmlui/src/components-core/analyzer/rules/udc-untrusted-violation.ts`

#### Tests

- An untrusted UDC without explicit declarations fails parse.
- An untrusted UDC under `<App udcTrust="strict">` reading a
  parent var throws `UdcScopeError`.

#### Acceptance

- Application authors can opt to require all third-party UDCs to
  be marked `trust="untrusted"`.

#### Dependencies

Phases 1–3.

---

### Step 4.2 — Permission manifest review surface

**Priority:** 8

#### Scope

- The inspector gains a "UDC Permissions" panel listing every
  UDC in the loaded app with:
  - declared capabilities,
  - effective capabilities (after call-site narrowing),
  - trust level,
  - file path / package origin.
- The CLI `xmlui udc audit` (new subcommand) prints the same
  table for CI consumption — exits non-zero under
  `--fail-on-untrusted` if any UDC is `trust="untrusted"` and
  the application has not whitelisted it via
  `<App udcTrust trustedAuthors="…">`.

#### Files

- `xmlui/src/components-core/inspector/UdcPermissionsPanel.tsx`
  (new)
- `xmlui/scripts/cli/udc-audit.ts` (new)

#### Tests

- `udc-audit.test.ts` — fixture app prints the expected table;
  exits non-zero with `--fail-on-untrusted` when an untrusted
  UDC is present.

#### Acceptance

- A reviewable surface exists in both interactive (inspector) and
  CI (CLI) modes.

#### Dependencies

Step 4.1.

---

## Phase 5 — Third-Party Manifest Format

### Step 5.1 — `udc.manifest.json` ships with each UDC package

**Priority:** 9

#### Scope

- A UDC distributed as part of an extension package (or as a
  standalone `.xmlui` file pulled into a project) ships a
  sibling `udc.manifest.json`:

  ```json
  {
    "name": "MoneyInput",
    "version": "1.2.3",
    "contract": {
      "props": [
        { "name": "amount", "type": "number", "required": true },
        { "name": "currency", "type": "string", "defaultValue": "USD" }
      ],
      "events": ["changed"],
      "methods": ["reset"],
      "slots": [{ "name": "footer" }],
      "capabilities": ["log"]
    },
    "trust": "untrusted"
  }
  ```

- At load time, the framework compares the manifest with the
  UDC's actual declarations. Drift fires
  `udc-manifest-mismatch` (severity `warn`; strict `error`).
- The application's `<App udcTrust trustedAuthors="…">` may
  whitelist manifest signers (out-of-scope for code, in-scope for
  the data shape).

#### Files

- `xmlui/src/components-core/udc-sandbox/manifest.ts`
- The component-discovery loader (loaders that walk the
  `components/` directory or extension package indices)
- New analyzer rule
  `xmlui/src/components-core/analyzer/rules/udc-manifest-mismatch.ts`

#### Tests

- A fixture UDC + manifest pair: editing the UDC to add a prop
  not in the manifest fires `udc-manifest-mismatch`.

#### Acceptance

- Third-party UDC packages can ship machine-checkable contracts;
  consumers can audit before installing.

#### Dependencies

Phase 1; Phase 3.

---

## Phase 6 — Documentation & Strict Default

### Step 6.1 — UDC-Sandbox Chapter

**Priority:** 10

#### Scope

- New `xmlui/dev-docs/guide/37-udc-sandbox.md` chapter.
- Updates
  [`user-defined-components.md`](../../../.ai/xmlui/user-defined-components.md)
  with the declared contract syntax, scope gate, capability
  enum, trust modes, and manifest format.
- Updates [`managed-react.md` §14](./managed-react.md):
  - Mark *"No isolation boundary"* as resolved (delegated to
    Phase 2 scope enforcement).
  - Mark *"No capability declaration"* as resolved (delegated to
    Phase 3 capabilities).
  - Mark *"No untrusted-component story"* as resolved (delegated
    to Phase 4 trust modes + Phase 5 manifest).
- Updates the §17 scorecard row from
  *"Absent"* to
  *"Sealed — declared contract surface, scope gate, capability
  enum, trust modes, manifest review."*
- Updates [`AGENTS.md` documentation map](../../../AGENTS.md).

#### Files

- `xmlui/dev-docs/guide/37-udc-sandbox.md` (new)
- `.ai/xmlui/user-defined-components.md`
- `xmlui/dev-docs/plans/managed-react.md`
- `AGENTS.md`

#### Acceptance

- Chapter contains a worked example for each phase: declared
  contract, scope leak diagnostic, capability narrowing,
  untrusted UDC review, manifest mismatch.
- "Migration" section walks through `xmlui udc declare` + audit
  for an existing project.

#### Dependencies

Phases 1–5.

---

### Step 6.2 — Default `strictUdcSandbox: true` in Next Major

**Priority:** 11 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip
  the default in the next major: `strictUdcSandbox: true`.
- Effects under strict:
  - `udc-prop-undeclared`, `udc-scope-leak`, and
    `udc-capability-missing` become hard errors.
  - `udc-no-implicit-contract` becomes `warn`.
  - The default `<App udcTrust>` mode flips from `"open"` to
    `"review"` (still does not break apps; surfaces untrusted
    UDCs as warn-level diagnostics).
- Changeset + migration note.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts`
- `.changeset/strict-udc-sandbox-default.md`
- `xmlui/dev-docs/guide/37-udc-sandbox.md` (migration section)

#### Tests

- Existing test suite passes with the default flipped.
- `xmlui/tests-e2e/udc-sandbox/strict-mode.spec.ts` covers each
  diagnostic under strict.

#### Acceptance

- All in-repo example apps and the docs site pass under strict
  UDC sandboxing.

#### Dependencies

Step 6.1.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **Foundations** | 0 | Switch + sandbox module skeleton | Next minor |
| **Declared contract** | 1.1, 1.2 | `<Prop>` / `<Event>` / `<Method>` / `<Slot>` blocks; CLI helper | Next minor + 1 |
| **Scope enforcement** | 2.1, 2.2 | Scope gate; slot context contract | Next minor + 2 |
| **Capabilities** | 3.1, 3.2 | Capability enum + narrowing | Next minor + 2 |
| **Trust modes** | 4.1, 4.2 | `trust=untrusted`; permission review surface | Next minor + 3 |
| **Manifest** | 5.1 | `udc.manifest.json` for third-party packs | Next minor + 3 |
| **Docs + strict default** | 6.1, 6.2 | Guide chapter; strict default in next major | Next major |

Each step is independently shippable: declarations can land
without scope enforcement; capabilities can land without trust
modes; manifests are an opt-in surface.

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   ├─> Step 1.1 (declared <Prop>/<Event>/<Method>/<Slot>)
   │      │
   │      ├─> Step 1.2 (xmlui udc declare CLI)
   │      │
   │      ├─> Step 2.1 (scope gate)                ← container-state
   │      │      │
   │      │      └─> Step 2.2 (slot context contract)
   │      │
   │      ├─> Step 3.1 (capability enum + gate)
   │      │      │
   │      │      └─> Step 3.2 (call-site narrowing)
   │      │
   │      └─> Step 5.1 (manifest)
   │
   └─> Step 4.1 (trust=untrusted; <App udcTrust>)   ← needs Phases 1–3
          │
          └─> Step 4.2 (permission review surface)
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

1. **Declared-over-inferred, not inferred-only.** The existing
   parse-time inference walk that collects `$props.<member>`
   stays, *but* explicit declarations win when present and a
   migration CLI exists to convert. Alternative considered:
   strip inference entirely — rejected because every existing
   UDC in the wild would break in one step.

2. **Capability enum is closed.** The capability set
   (`fetch | websocket | …`) is the same closed list as the
   sanctioned managed primitives in §1 / §15. Apps cannot
   define custom capabilities. Alternative considered: open
   capability strings — rejected because untrusted UDC review
   relies on a finite, well-known surface.

3. **Default capability set is "all granted".** Backwards
   compatibility wins at default. Tightening is opt-in via
   either declaring `capabilities` on the UDC or narrowing at
   the call site. Alternative considered: default to "none
   granted" — rejected because every existing UDC that uses
   `App.fetch` would break.

4. **Capabilities can only be narrowed at call sites, not
   widened.** A parent cannot grant a UDC a capability its
   author did not request. This is a one-way valve — the UDC
   declaration is the upper bound. Alternative considered:
   parents may widen — rejected because the UDC author's
   declared capability set should be auditable as a *cap*, not
   a starting point.

5. **Scope gate blocks the parent climb, not the local
   container.** A UDC's own vars / functions / slot context
   stay reachable from inside; what becomes blocked is the
   silent climb to the parent page's vars and APIs. Alternative
   considered: total isolation (UDC sees nothing it did not
   explicitly declare) — rejected because it would break every
   UDC that legitimately uses parent-provided slot context like
   `$item` and `$index`. The slot-contract step (2.2) makes
   that surface explicit instead.

6. **Trust modes are tri-state.** `open | review | strict` lets
   apps adopt incrementally: visibility first, enforcement
   second. Alternative considered: bi-state (trusted /
   untrusted) — rejected because adoption needs a "show me
   what's there" mode before "block what's there".

7. **`udc-untrusted-violation` is on by default in `review`
   mode regardless of `strictUdcSandbox`.** Untrusted UDCs are
   a security topic; their visibility should not depend on a
   correctness-oriented strict toggle. Alternative considered:
   gate review mode under strict — rejected because security
   review should be cheap to opt into without committing to all
   of strict mode.

8. **Manifest is JSON, not XMLUI markup.** UDC contracts
   distributed independently of the implementation file are
   data, not markup. Alternative considered: a sibling `.xmlui`
   declaration — rejected because manifests are consumed by
   tooling that should not depend on the XMLUI parser.

9. **Manifest signing is data-only in this plan.** The
   `trustedAuthors` field is recognised but cryptographic
   verification is out of scope here — it sits with future
   third-party-package distribution work. Alternative
   considered: ship signing now — rejected because the signing
   key infrastructure is much larger than the contract surface.

10. **Strict-mode flip waits for a major.** Same rationale as
    every other §17 plan — warn-mode telemetry is needed before
    failing on `udc-scope-leak` and the long tail of capability
    misses.

11. **No new globals are introduced.** Capabilities *gate*
    existing globals (`App.fetch`, `Clipboard.copy`, …). The
    plan does not add a parallel set of "sandboxed" primitives;
    the same primitives the app uses are the ones the UDC
    primitives gate. Alternative considered: a separate
    `Sandbox.*` namespace — rejected because it would split the
    API surface in two.

---

## Out of Scope

- **Iframe / Web Worker isolation for UDCs.** A UDC remains a
  same-realm React subtree; the sandbox is a *contract* sandbox,
  not an *origin* sandbox. True origin isolation is a much
  larger effort (post-message bridges, async props, no
  shared-memory) and not the §14 scope.
- **Resource quotas** (memory, CPU time, fetch concurrency).
  Cooperative-concurrency
  ([cooperative-concurrency](./06-cooperative-concurrency.md))
  ships handler-level concurrency policies; per-UDC resource
  quotas are a separate plan.
- **Cryptographic manifest signing.** The data shape supports
  it; the verification pipeline is a future plan tied to UDC
  package distribution.
- **DOM-level sandboxing** of UDCs (e.g. shadow-DOM
  isolation). Today's
  [theming sandbox](./08-sealed-theming-sandbox.md) covers style
  bleed; structural DOM bleed remains the responsibility of the
  UDC author. A future plan could introduce
  `<Component shadowRoot />` for opt-in shadow encapsulation.
- **`Form` / `DataSource` capability splits** beyond the enum in
  Step 3.1. Splitting `fetch` into `fetch:get` / `fetch:post` /
  per-host scopes is a follow-up that will likely come from
  consumers; the enum is intentionally kept short for the first
  shipment.
- **UDC-to-UDC trust delegation.** A trusted UDC instantiating
  an untrusted UDC inherits the parent's trust treatment (the
  inner UDC's declared contract still applies). Cross-UDC trust
  inheritance trees are not modelled in this plan.
- **Auto-fix codemods** for declarations. `xmlui udc declare`
  produces declarations once; ongoing maintenance is manual.
  Auto-fix matches the
  [build-validation-analyzers](./13-build-validation-analyzers.md)
  out-of-scope rationale.
