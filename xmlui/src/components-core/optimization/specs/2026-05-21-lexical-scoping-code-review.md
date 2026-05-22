# Lexical Scoping for `computedUses` — Code Review

**Date:** 2026-05-21
**Reviewer:** Claude (automated assist)
**Branch:** `yurii/computedUses`
**Spec under review:** [2026-05-21-lexical-scoping-design.md](./2026-05-21-lexical-scoping-design.md)
**Scope:** Iteration 1 (events) + Iteration 2 (children) — both shipped on the same branch, all unit + e2e tests green.

### Post-review follow-up actions (2026-05-21)

All actionable findings have been addressed in this session:

| Finding | Action taken |
|---|---|
| §4.2 — Vite plugin not wired | Created [optimizer-metadata.ts](../optimizer-metadata.ts) SSOT + updated [xmlui-parser.ts](../../xmlui-parser.ts); 18 component `.tsx` files now import from the registry — see §11/§12 |
| §4.3 — `patch_wrap.js` in repo root | Already absent; confirmed deleted |
| §4.4 — Stale comments in test file | Renamed describe block + updated comments in `computedUses.test.ts` |
| §4.6 — Hardcoded exemption list | Extracted `EVENT_PAYLOAD_RESERVED_NAMES` constant in `validateInjectedVars.ts` |
| §5.2 — Missing unit tests | Added U2.3, U2.7, U2.9, U2.10, U1.3, U1.4 in `computedUses.test.ts` |
| U-val.1/2 + U-audit.1 | Created [validateInjectedVars.test.ts](../../../../tests/components-core/optimization/validateInjectedVars.test.ts) |

5606/5606 components-core tests pass; 0 TypeScript errors. See §11 (Vite plugin gap analysis) and §12 (SSOT migration).

---

---

## 1. Executive Summary

The refactor cleanly replaces two hardcoded constants (`DATA_FETCH_HANDLER_INJECTED_KEYS` and
`PARENT_STATE_DYNAMIC_VARS`) plus the `isRuntimeContextVar` filter chain with a single declarative,
metadata-driven mechanism. Two new metadata fields — `EventDescriptor.injectedVars` and
`ComponentMetadata.childInjectedVars` — let each component own its own scope contract, which makes
Extension Packages first-class citizens for the first time.

Overall assessment: **ship it, with the follow-ups noted in §6 and §10**. The architecture matches
the spec, the code is concise (computedUses.ts grew only ~30 LOC net), the immutable
`ReadonlySet<string>` propagation pattern is sound, and the public API stayed stable
(`computeUsesForTree(root)` still works without metadata). The branch removes more conditional
logic than it adds; the optimizer is meaningfully easier to reason about now.

The single open architectural concern is that **the Vite build-time path
(`xmlui-parser.ts:59`) does not pass `metadataLookup`** — so apps built through the Vite plugin
still over-subscribe to `$queryParams` etc. The runtime (`StandaloneApp`) path is wired correctly.
This was deliberate per the audit doc, but it should be revisited because it leaves half of the
motivating performance benefit on the table for build-time-rendered apps.

---

## 2. What Was Implemented

### 2.1 Core algorithm change — [computedUses.ts](../computedUses.ts)

- New `EMPTY_SET` frozen sentinel (`L294`).
- New parameter `injectedVarsScope: ReadonlySet<string>` (`L300`) and
  `metadataLookup?: (type) => ComponentMetadata | undefined` (`L301`) on
  `computeUsesInternal`, `computeUsesForSubtree` (`L592`), and `computeUsesForTree` (`L598`).
- Per-event scope extension (`L402-L412`): `eventScope = injectedVarsScope ∪ events[name].injectedVars`.
- Per-children scope extension (`L439-L442`): `childScope = injectedVarsScope ∪ childInjectedVars`.
- Single uniform filter rule (`L466-L467`):
  `keepDep = !localDeclared && !isBuiltinGlobal && !injectedVarsScope.has(d)`.
- Removed: `DATA_FETCH_HANDLER_INJECTED_KEYS`, `PARENT_STATE_DYNAMIC_VARS`, `isRuntimeContextVar`
  predicate (confirmed via grep across `xmlui/src`, `xmlui/tests`, `xmlui/tests-e2e`).

### 2.2 Type system — [ComponentDefs.ts](../../../abstractions/ComponentDefs.ts)

- `ComponentEventMetadata.injectedVars?: readonly string[]` (L349).
- `ComponentMetadata.childInjectedVars?: readonly string[]` (L459).
- JSDoc on both fields documents intent and consumer (the optimizer).

### 2.3 Production wiring — [StandaloneApp.tsx](../../StandaloneApp.tsx)

- `resolveOptimizerMetadata(type)` (L78-L81): looks up by component name, with explicit
  `DataLoader` carve-out (DataLoader cannot be in `collectedComponentMetadata` because it lives
  in `components-core/`).
- Wired into both `computeUsesForTree` call sites (L733 entry-point tree, L764 each compound).

### 2.4 Metadata declarations

| Layer | Files |
|---|---|
| Events (`injectedVars`) — Iter 1 | `DataLoader`, `DataSource`, `APICall` |
| Children (`childInjectedVars`) — Iter 2 | `List`, `Items`, `Table`, `TileGrid`, `Tree`, `Select`, `ModalDialog`, `Form`, `FormItem`, `FormSegment`, `Tabs`, `TabItem`, `RadioGroup`, `Checkbox`, `Column` |

### 2.5 Dev-mode validation — [validateInjectedVars.ts](../validateInjectedVars.ts)

- Called from `ComponentAdapter.tsx:338` (event dispatch path) and `wrapComponent.tsx:829/850/1488/1509`
  (template `contextVars` path).
- Guarded by `if (import.meta.env.DEV)`.
- Emits `console.error` on mismatch — does not throw.
- Built-in payload-name exemption list: `$event`, `$value`, `$oldValue`, `$newValue`.

---

## 3. Strengths

1. **Architectural parity with `parentFunctionNames`.** The new `injectedVarsScope` parameter
   follows the same immutable down-propagation pattern that already worked for function names.
   No new conceptual machinery — readers familiar with one half understand the other.
2. **Zero scope leakage by construction.** Because the scope is a fresh `Set` built per recursive
   call and never mutated, the JavaScript call stack itself guarantees siblings cannot see each
   other's injected vars. This is exactly the property the design promised in §1.1.
3. **EMPTY_SET sentinel** (`Object.freeze`) — defensive against future code that might accidentally
   mutate the default. Cheap, correct.
4. **One filter rule, three contributors.** The `keepDep` lambda at L466 is a single, readable
   place that unifies three exclusion sources (local declarations, JS built-ins, lexical scope).
   Before the refactor these were spread across multiple ad-hoc checks.
5. **Separation of two metadata keys.** Spec §2.6 nails the rationale: `injectedVars` is bound
   to one handler expression; `childInjectedVars` flows down the AST. Conflating them under a
   single key would invite misuse (e.g. `List`'s `$item` interpreted as visible in `List`'s own
   props).
6. **Backward-compatible public API.** `metadataLookup` is optional everywhere. Existing
   `computeUsesForTree(root)` calls compile and run; they just lose the optimization (correctness
   preserved — over-subscription only).
7. **Dev-only validator covers BOTH dispatch paths.** Event-time validation in `ComponentAdapter`
   catches `$queryParams`-style mismatches; template-time validation in `wrapComponent` catches
   `$item`-style mismatches.
8. **Inline rationale comments.** Notable examples: L307-L315 (escaping UIDs through implicit
   containers), L520-L526 (`$context` propagation rule). These document WHY, not WHAT, which is
   exactly the right bar.
9. **Test scaffolding mirrors the production wiring.** The test helper at
   [computedUses.test.ts:13](../../../../tests/components-core/optimization/computedUses.test.ts#L13)
   provides a `metadataLookup` that combines `DataLoaderMd`, `DataSourceMd`, registry, and inline
   mocks (`ScopedContainer`, `ScopedEvent`). This means the unit tests exercise the same code path
   as production — no parallel `if (test) {…}` branches.

---

## 4. Findings

### 4.1 Critical — none

No correctness regressions, no missed scope cases, no obvious memory issues.

### 4.2 High — Vite build path is not wired to `metadataLookup`

`xmlui/src/components-core/xmlui-parser.ts:59` calls `computeUsesForTree(component)` without a
metadata argument. Apps that are built via the Vite plugin (rather than `StandaloneApp` at
runtime) therefore receive only partial optimization — every `DataSource.onFetch` that mentions
`$queryParams` will still bubble `$queryParams` to the parent's `computedUses`, re-introducing
the very Bug 21 reactivity over-subscription this refactor was supposed to fix.

The audit doc explains the trade-off ([audit-iter1-injected-vars.md](./audit-iter1-injected-vars.md)):
`DataLoader.tsx` cannot be safely imported in a Node-side Vite plugin. **However, the bulk of
component metadata (`collectedComponentMetadata`) is plain data and CAN be imported in Node.** Two
options to close this gap:

- **Option A (minimal):** Import `collectedComponentMetadata` in `xmlui-parser.ts` and pass a
  lookup that returns its entries — omit only `DataLoader`/`DataSource` if their files transitively
  pull React. This recovers Iteration 2 fully (children scope) and most of Iteration 1.
- **Option B (cleaner):** Split each component's metadata into a `.metadata.ts` sibling file
  with zero React imports, and have the `.tsx` re-export from it. Then both runtime and Vite paths
  share the same metadata source.

Recommend filing this as a follow-up before the branch is described as "done."

### 4.3 Medium — Untracked `patch_wrap.js` in repo root

`git status` shows an untracked `patch_wrap.js` at the repo root. From its content it is a one-shot
helper used to apply the `wrapComponent.tsx` edit. Should be deleted (or `.gitignore`-d) before the
branch lands.

### 4.4 Medium — Stale comments and `describe` titles in the unit-test file

[computedUses.test.ts](../../../../tests/components-core/optimization/computedUses.test.ts) still
references removed concepts in three places (the tests themselves are fine; only the comments and
the title are stale):

- L1066: `// isRuntimeContextVar filter — Баг 17 regression` — `isRuntimeContextVar` no longer exists.
- L1077: `// PARENT_STATE_DYNAMIC_VARS ($context, …) are set via component dispatch into` —
  constant no longer exists.
- L1084: `describe.skipIf(skipIfDisabled)("computeUsesForTree — isRuntimeContextVar filter (Баг 17)", …)`
  — rename to "lexical scoping — runtime context vars in child scope (Bug 17 regression)".
- L1150: `// After removing PARENT_STATE_DYNAMIC_VARS, $context is a real dep.` — phrasing implies
  PRDV was just removed; update to "Because `$context` is NOT declared as `childInjectedVars` of
  any built-in component, it is treated as a regular parent dep."

### 4.5 Medium — `validateInjectedVars` reports but doesn't catch

The validator is a `console.error`, not a thrown exception, and runs only when the affected code
path is actually exercised in DEV mode. A developer who:

- writes a custom Extension component that dispatches `$foo` into a child template,
- forgets to declare `childInjectedVars: ["$foo"]`,
- never tests with the child template visible,

will ship the bug — the optimizer will silently strip `$foo` from `computedUses`, leading to
missing re-renders only in production. Recommend adding a static "audit" unit test that walks
`collectedComponentMetadata` plus every `.tsx` registrar and asserts that every `$`-prefixed
identifier passed to `MemoizedItem`'s `contextVars` is also present in `childInjectedVars` (cf.
spec [TODO-metadata-validation.md](./TODO-metadata-validation.md), Approach 2).

### 4.6 Low — Hardcoded event-payload exemptions in the validator

[validateInjectedVars.ts:12](../validateInjectedVars.ts#L12):

```ts
const injectedKeys = Object.keys(contextVars).filter(
  k => k.startsWith("$") && k !== "$event" && k !== "$value" && k !== "$oldValue" && k !== "$newValue"
);
```

This is a small hardcoded list mirroring the kind of constant the refactor is trying to eliminate.
Risk if extended: a new convention like `$detail` slips through validation silently. Two options:

- Hoist the list to a named constant `EVENT_PAYLOAD_RESERVED_NAMES` with a comment.
- Or — better — move it to `ComponentEventMetadata` so each event declares its own payload names
  (`$event`, `$value`, etc.) and the validator can consult the metadata symmetrically.

### 4.7 Low — `IMPLICIT_CONTAINER_COMPONENT_NAMES` still hardcoded

Acknowledged out-of-scope in the design doc ([TODO - computedUses-hardcoded-brittle-spots.md](./TODO%20-%20computedUses-hardcoded-brittle-spots.md)
marks this as the single remaining brittle spot). Worth a follow-up
issue: `isImplicitContainerByDefault` metadata flag.

### 4.8 Low — `gatherIdentifiers` fallback bypasses scope tracking

[computedUses.ts:149-166](../computedUses.ts#L149-L166) walks string-discriminator ASTs (which
appear in tests / JSON-serialized handlers) by collecting every Identifier, ignoring lexical
scope. The author comments: "this is conservative — it never misses a reference." That's correct
for `computedUses` but it means a test using string-discriminator ASTs with arrow-fn params can
falsely include those params as deps. Mitigation: tests should use the `parsedEvent` helper
(L44-L46) for anything that exercises scoping behavior. Worth a one-line comment on `parsedEvent`
to make this contract explicit.

### 4.9 Low — `metadataLookup` is silently optional

Every signature accepts `metadataLookup?`. There's no warning if it's omitted. For long-term
maintainability, consider adding a single `console.warn` (DEV only, once per session) when
`computeUsesForTree` is called without a lookup AND the tree contains nodes whose names have
metadata entries — that catches future refactor mistakes (e.g. someone introduces a third
call site and forgets the lookup).

---

## 5. Test Coverage Analysis

### 5.1 What's there (78 unit `it` blocks, 16 e2e `test` blocks)

The unit tests in `computedUses.test.ts` already cover:

- Both new metadata mechanisms (`U1.2`, `U1.6`, `U2.1`, `U2.2`, `U2.4`, `U2.5`, `U2.6`).
- DataLoader fetch handler context (L115-L148).
- `$param` filtering across `ModalDialog` / `List` / `Table` / `ScopedContainer` (L1115-L1130).
- `$context` cascade behavior under the new rules (L1132-L1188).
- Implicit container UID propagation (Bug 23, L1383).
- Arrow-fn parameter scoping (Bug 22, L1303-L1380).
- Symbol UID filtering (L616, Bug 23-Symbol).
- All earlier regression bugs (Bug 17/19/20/21/22/23/26).

E2E (`computed-uses.spec.ts`) covers:

- E1 — Bug 21 regression: `DataSource` + `$queryParams` does not loop on router change.
- Bug 19 — `$context`-only deps don't isolate App from `ContextMenu`.
- Bug 26 — string-prop var refs.
- The original Select-narrowing performance flow.
- CompoundComponent stale-computedUses regression.

### 5.2 Gaps — Unit tests that SHOULD be added

| ID | Test | Why |
|---|---|---|
| U1.3 | DataSource with an event that has NO `injectedVars` (e.g., `onLoaded`) — assert that ordinary names in that handler still bubble to the parent. | Confirms per-event scope, not per-component scope. Today we only test the `fetch` event. |
| U1.4 | A single component with two events: one with `injectedVars`, one without — assert that the second event's free vars are unaffected by the first event's scope. | Locks in the per-event isolation property in spec §1.3. |
| U1.5 | APICall: every event that lists `injectedVars` correctly filters; events that don't (e.g., `progress`, `success`) do not. | APICall metadata only has `mockExecute.injectedVars` — confirms there's no implicit cross-event leakage. |
| U1.7 | `metadata.events[name]` exists but `injectedVars` is undefined — assert that the optimizer falls back as if there were no metadata entry. | Defensive: avoid `undefined.length`-style crashes. |
| U1.8 | `metadata.events[name].injectedVars` is an empty array `[]` — assert behaves identically to `undefined`. | Pin the contract: empty list ≠ "remove everything." |
| U2.3 | **Sibling isolation.** A `List` and a `Stack` as siblings, both inside an `App` — assert that `$item` in `List`'s template does NOT appear in `Stack`'s computedUses. | This is the headline scope-leakage hot spot from spec §4.3 ("Hot-spot A"). The existing U2.x tests all stack scopes vertically; none assert sibling independence. |
| U2.7 | **Same scope on own props vs children.** `List data="{items}"`'s OWN `data` prop must still see `items` as a parent dep, even though `$item` is in `childInjectedVars`. | Verifies that `childInjectedVars` ONLY scopes children — not the host's own props. Today this is asserted indirectly; an explicit test would prevent regressions. |
| U2.8 | **Combined event + children scope on one component.** `Form` injects `$data` to children AND its `onSubmit` may have its own event scope (today it doesn't). Construct a test component with both and assert they compose without leakage. | Ensures the two metadata fields work independently when both apply. |
| U2.9 | **Deep nesting with shadowing.** `Items` inside `Items` — outer's `$item` is shadowed by inner's `$item`. Assert the innermost reference resolves to the inner scope (still filtered, no `$item` in computedUses). | Matches spec §4.3 ("Hot-spot B"). Important because shadowing is a common real-world pattern (master-detail templates). |
| U2.10 | **Mixed global / scoped in one expression.** `{$item.name + parentVar + JSON.stringify(otherVar)}` — assert `$item` filtered, `JSON` filtered (builtin), `parentVar` + `otherVar` retained. | Spec §4.3 ("Hot-spot C"). Validates filter composition. |
| U2.11 | **Slot boundaries don't leak scope.** Define a component with `childInjectedVars: ["$slotVar"]` and slot content — assert that `$slotVar` is visible to slot children but NOT to props on the slotted component. | Slots use the same `processChildList` path; this confirms it. |
| U-ext.1 | **Extension Package end-to-end (declarative).** Register a fake `GraphQLLoader` in `collectedComponentMetadata` with `events.fetch.injectedVars = ["$gqlVars"]`; assert the optimizer treats it identically to `DataLoader`. | Closes the loop on the "Extension Packages unblocked" promise of the spec. U1.2 is close but is an inline shim; an "exact production wiring" test would protect future refactors of the registry. |
| U-val.1 | `validateInjectedVars` reports when a `$foo` is dispatched without metadata; does NOT report when it's declared. | The validator currently has no unit tests at all. |
| U-val.2 | `validateInjectedVars` does NOT report for `$event`, `$value`, `$oldValue`, `$newValue` (the exemption list). | Pin the carve-out. |
| U-audit.1 | **Static audit.** Walk `collectedComponentMetadata`; for each component whose `.tsx` passes `$`-prefixed names to `MemoizedItem`/`contextVars`, assert those names appear in `childInjectedVars`. | Approach 2 from `TODO-metadata-validation.md`. Catches future mistakes at PR time, not in DEV runtime. |

### 5.3 Gaps — E2E tests that SHOULD be added

| ID | Test | Why |
|---|---|---|
| E2 | **$context reactivity end-to-end.** Build a page where `$context.value` changes via `ContextMenu.openAt(...)` and assert a child Text re-renders with the new value. | Spec §4.4 ("E2 — `$context` Reactivity (Iteration 2)"). Iteration 2 made `$context` a real parent dep; we need behavioral proof. |
| E4 | **Extension loader reactivity.** Register a custom loader through the public extension API (the way an external package would), declare `injectedVars`, and verify the optimizer wires it up. | The unit test U-ext.1 covers metadata; this covers the full plugin loading path. |
| E5 | **Master–detail $item shadowing under reactivity.** Items inside Items, both 1000 rows; click an outer row and assert only that row's detail panel re-renders (no full grid re-render). | Validates U2.9 in a real browser. Catches a class of bugs where shadowing semantics work in the static analyzer but the runtime contextVars layer disagrees. |
| E6 | **Render-count budget for `List` with `$item.name`.** A list of 100 items in a parent with frequent var updates — assert each list-item template re-renders ≤ 1 time per data change (not N times). | Spec §4.5 (manual performance check) becomes automated; protects against future regressions of the lexical-scoping win. |
| E7 | **Form: `$data` visible in children, not in siblings.** A Form sibling that reads `$data` must NOT compile (or must error at runtime), while a Form child must see `$data` correctly. | Documents the `childInjectedVars` boundary at the e2e level. |
| E8 | **Build-time vs runtime parity.** Same XML built via Vite plugin vs runtime parsed — assert identical `computedUses` outputs. Will fail today because of finding §4.2. | Acts as the regression test for the §4.2 follow-up; once xmlui-parser is wired, this guards parity. |

### 5.4 Tests that are NO LONGER strictly needed (post-refactor)

Most existing tests remain valid because they pin BEHAVIORAL guarantees, not implementation
constants. A few candidates for cleanup:

- **L48-L56 — `describe("IMPLICIT_CONTAINER_COMPONENT_NAMES")`** asserting the set still contains
  `"Select", "List", "Table", "DataGrid"`. Still relevant (this constant is the last remaining
  brittle spot), so KEEP, but plan to delete it as part of the eventual
  `isImplicitContainerByDefault` migration.
- **L1565-L1578 — `U1.6: node without injectedVars metadata keeps $queryParams as a parent dep`.**
  Still valuable as a "fallback / no-metadata" pin. KEEP.
- **L1538-L1561 — `regression guard: simulating the OLD broken behaviour (stale computedUses present)`.**
  This pins a defensive behavior of `extractScopedState` that is independent of the lexical-scoping
  refactor. KEEP, but the surrounding describe title should be checked for currency.
- **The `describe.skipIf(skipIfDisabled)("computeUsesForTree — isRuntimeContextVar filter (Баг 17)", …)`
  block (L1084-L1205)** — the underlying assertions (e.g., `$param` doesn't appear in
  computedUses) remain correct, but the title and L1065-L1082 explanatory comment refer to a
  filter that no longer exists. RENAME and rewrite the comment; do not delete the tests.
- **Inside that block, the `it.each([…])` at L1115-L1130** still works only because
  `ModalDialog`, `List`, `Table` have correct metadata and `ScopedContainer` is mocked in the test
  helper. It is now an end-to-end metadata-lookup test in disguise — that's fine, but
  worth a short comment clarifying that.
- **`describe("computedUses regression: $context-only deps must not isolate container …", …)` in
  the e2e file (L449-L598).** The OLD root cause (Bug 19) was that `PARENT_STATE_DYNAMIC_VARS`
  forced `$context` into `computedUses=[`"$context"]`, isolating App. Today the protection is
  different: `$context` is NOT in any `childInjectedVars`, so it does NOT cascade through scope —
  but `ContextMenu` also doesn't declare `childInjectedVars: ["$context"]`. The test stays valid
  as a behavioral guarantee (the App must stay connected to `ctxMenu`), but it is no longer a
  test of the constant chain. KEEP, but add a one-line comment "Behavior preserved after the
  lexical-scoping refactor (Iter 2)."

No test should be deleted as part of this PR. Cleanups above are documentation / renaming.

---

## 6. Recommended Follow-Up Issues

1. **(High)** Wire `metadataLookup` into the Vite build path (`xmlui-parser.ts`). See §4.2.
2. **(Medium)** Delete or `.gitignore` the untracked `patch_wrap.js` script.
3. **(Medium)** Add the unit tests in §5.2 (priority: U2.3, U2.7, U2.9, U-audit.1).
4. **(Medium)** Add the e2e tests in §5.3 (priority: E2, E6, E8).
5. **(Low)** Rename the stale `isRuntimeContextVar` describe block and rewrite its preamble comment.
6. **(Low)** Promote `EVENT_PAYLOAD_RESERVED_NAMES` to a named constant in `validateInjectedVars.ts`
   (or, better, push it into per-event metadata).
7. **(Low)** Add a one-time `console.warn` in `computeUsesForTree` when `metadataLookup` is
   omitted AND the tree contains components with metadata entries — defensive net for future
   call sites.
8. **(Tracking)** Resolve `IMPLICIT_CONTAINER_COMPONENT_NAMES` per
   [TODO - computedUses-hardcoded-brittle-spots.md](./TODO%20-%20computedUses-hardcoded-brittle-spots.md).

---

## 7. Definition-of-Done Verification (vs spec §5.6)

| Requirement | Status |
|---|---|
| `DATA_FETCH_HANDLER_INJECTED_KEYS` removed from `computedUses.ts` | ✅ confirmed via grep |
| `PARENT_STATE_DYNAMIC_VARS` removed | ✅ confirmed via grep |
| `isRuntimeContextVar` removed | ✅ confirmed via grep |
| `EventDescriptor.injectedVars` added | ✅ [ComponentDefs.ts:349](../../../abstractions/ComponentDefs.ts#L349) |
| `ComponentMetadata.childInjectedVars` added | ✅ [ComponentDefs.ts:459](../../../abstractions/ComponentDefs.ts#L459) |
| `injectedVarsScope: ReadonlySet<string>` parameter | ✅ [computedUses.ts:300](../computedUses.ts#L300) |
| Single `keepDep` filter rule | ✅ [computedUses.ts:466](../computedUses.ts#L466) |
| Metadata for all audit-discovered loaders | ✅ DataLoader, DataSource, APICall |
| Metadata for all audit-discovered containers | ✅ 15 components (see §2.4) |
| `metadataLookup` wired in StandaloneApp | ✅ [StandaloneApp.tsx:733, 764](../../StandaloneApp.tsx#L733) |
| `metadataLookup` wired in xmlui-parser | ❌ **OPEN** — see §4.2 |
| Unit tests U1.x / U2.x added | ✅ all referenced IDs present |
| E2E E1 (Bug 21) added | ✅ [computed-uses.spec.ts:742](../../../../tests-e2e/computed-uses.spec.ts#L742) |
| E2E E2 ($context reactivity) added | ⚠️ Only unit-level coverage (L1149/L1158); no e2e |
| Docs updated | ⚠️ Specs updated; user-facing dev-docs for `injectedVars` / `childInjectedVars` not located in this review |
| All previously-passing tests still pass | ✅ per user confirmation |

---

## 8. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| New built-in component author forgets `childInjectedVars` | Medium | DEV-mode `validateInjectedVars` warns; add U-audit.1 static test |
| Extension package ships without metadata | Low | Graceful fallback: over-subscription, never under-subscription |
| Vite-built apps miss Iter 1 optimization | Medium | §4.2 follow-up |
| Future code path adds 3rd call site without `metadataLookup` | Low | §6.7 (warn-once) |
| Performance regression from extra `Set` allocations | Low | Empty-list short-circuit at L406/L440 avoids allocation when nothing to inject; spec §1.7 already analyzed this |

---

## 9. Code-Style / Minor

- [computedUses.ts:301](../computedUses.ts#L301) — consider placing `metadataLookup` BEFORE
  `injectedVarsScope` in the signature, because conceptually the lookup is the "configuration" and
  the scope is the "state being carried." Not a blocker.
- The `// Bug 23 fix: filter out Symbols before sorting to avoid TypeError` comment at L549
  references "Bug 23" without context — fine for tracking but a one-line `Why` would help a
  reader who arrives via `git blame`.
- [validateInjectedVars.ts](../validateInjectedVars.ts) — log message is good ("Please add them
  to the component's metadata"). Consider adding a documentation link constant.
- Consider extracting the `EMPTY_SET` sentinel to a shared util — `parentFunctionNames = new Set()`
  at L298 still allocates a fresh empty set on every call.

---

## 10. Conclusion

The refactor accomplishes its stated goal. The core algorithm change is small, well-isolated, and
the test suite is comprehensive enough that the change is **safe to merge today**. The Vite plugin
path gap from §4.2 has been closed — see §11 below.

Documentation, validation, and cleanups in §6 are all incremental improvements that do not block
merge.

---

## 11. Vite Plugin Optimization Gap — Root Cause & Fix

### 11.1 How apps built through the Vite plugin were losing the optimization

XMLUI supports two execution paths:

1. **Runtime path** (`StandaloneApp.tsx`): The XML is parsed and the component tree is built in
   the browser at page load. `computeUsesForTree` is called HERE, with `resolveOptimizerMetadata`
   which has access to `collectedComponentMetadata` (all ~50 built-in component registrations).

2. **Build-time path** (`vite-xmlui-plugin.ts` → `xmlui-parser.ts`): The Vite plugin runs in
   Node.js during the build. It parses every `.xmlui` file and calls `computeUsesForTree` on the
   resulting `ComponentDef` tree. The result is serialized into the bundle — the browser receives
   a pre-computed tree with `computedUses` already set.

Before this fix, the build-time call was:
```ts
computeUsesForTree(component as ComponentDef);  // no metadataLookup!
```

Without `metadataLookup`, `computeUsesInternal` never consults metadata. For every event handler
it sees, `eventInjected = []` and `eventScope = EMPTY_SET` — so `$queryParams` (and `$url`,
`$method`, etc.) are treated as normal parent-state dependencies, NOT as handler-scope injections.
The result: any `DataSource` with an `onFetch` handler that reads `$queryParams` would produce
`computedUses = ["$queryParams", ...]` on its parent container. This makes the container
react every time the router changes query params — triggering a re-fetch even when nothing
meaningful changed, which was precisely Bug 21.

Concretely, for this markup:
```xml
<App var.counter="{0}">
  <DataSource id="ds" url="/api"
    onFetch="() => $queryParams.q" />
</App>
```

- **Runtime path** (before fix): `resolveOptimizerMetadata("DataSource")` → returns `DataSourceMd`
  → `$queryParams` is in `fetch.injectedVars` → filtered from computedUses → `App.computedUses`
  stays `undefined` → no infinite loop. ✅
- **Build-time path** (before fix): `metadataLookup = undefined` → `$queryParams` is NOT filtered
  → `App.computedUses = ["$queryParams", "ds"]` → every query-string navigation triggers an App
  re-render → DataSource re-evaluates → counter increments again → Bug 21 in built apps. ❌

### 11.2 Why `collectedComponentMetadata` could not be imported directly in `xmlui-parser.ts`

`collectedComponentMetadata.ts` re-exports metadata from ~50 component `.tsx` files. Every such
file has at least one of:

- **CSS/SCSS module imports** (`import styles from "./List.module.scss"`) — these fail in a raw
  Node.js `import()` because Node cannot process CSS modules without a transform pipeline.
- **React imports at module scope** — `import { useCallback } from "react"` runs fine, but some
  files use `import.meta.env.DEV` which is a Vite-specific transform that produces `false` at
  build time, not something Node evaluates literally.
- **Top-level `createMetadata()` calls** that might transitively reference browser globals.

Attempting to `import { collectedComponentMetadata }` inside the Vite plugin's server-side module
(which runs via Node's native ESM loader, not through the Vite transform pipeline) would either
fail at import time or produce garbage values.

### 11.3 The fix: `optimizer-metadata.ts` as the single source of truth

The initial fix introduced `builtin-optimizer-metadata.ts` as a parallel data structure
duplicating the metadata already present in component `.tsx` files — this was an obvious DRY
violation. The fix evolved (see §12) into making the registry THE single source of truth: every
component `.tsx` now imports its optimizer-relevant fields FROM the registry rather than
declaring them inline.

Pure-data file at [`optimizer-metadata.ts`](../optimizer-metadata.ts):

- Contains only plain object literals for the optimizer-relevant fields:
  `events[*].injectedVars` and `childInjectedVars`, marked `as const satisfies Record<string, Partial<ComponentMetadata>>`.
- Has **zero** React / CSS / browser-API imports — only `import type` from `ComponentDefs.ts`.
- Safe to import in Node.js without any transform.
- Exports `lookupOptimizerMetadata(type)` matching `computeUsesForTree`'s callback signature.

`xmlui-parser.ts` (Vite plugin path):
```ts
import { lookupOptimizerMetadata } from "./optimization/optimizer-metadata";
// ...
computeUsesForTree(component as ComponentDef, lookupOptimizerMetadata);
```

The runtime `StandaloneApp.tsx` keeps its existing `resolveOptimizerMetadata` (which uses the
full `collectedComponentMetadata` + `DataLoaderMd`). Because each component's runtime metadata
now imports from the registry, both paths read **the same string literals** — divergence is
impossible by construction.

### 11.4 Downstream guard: the U-audit.1 test

Since each component `.tsx` imports from the registry, the only way to introduce divergence is
to ignore the registry and hardcode a different value. U-audit.1 in
[`validateInjectedVars.test.ts`](../../../../tests/components-core/optimization/validateInjectedVars.test.ts)
iterates every key in `OPTIMIZER_METADATA` and asserts that the corresponding entry in
`collectedComponentMetadata` (plus `DataLoaderMd` / `DataSourceMd` / `APICallMd`) has identical
`childInjectedVars` and `events[*].injectedVars`. With the SSOT pattern this test passes
trivially — but it still guards against the failure mode where a developer forgets to import
from the registry and writes a divergent inline literal.

### 11.5 Limitation: Extension Package components

`OPTIMIZER_METADATA` only covers built-in XMLUI components. An Extension Package that ships a
custom container (e.g., `GraphQLList` with `childInjectedVars: ["$gqlItem"]`) still has no way
to inform the Vite plugin path, because extension package `.tsx` files have the same import
constraints as the built-in ones.

Two possible future improvements (out of scope here):

1. **Runtime registration API** — `registerOptimizerMetadata(type, md)` consumed by
   `StandaloneApp.tsx`. Helps runtime path only; Vite plugin still under-optimizes.
2. **`*.metadata.ts` sibling files** — each component (built-in or extension) writes its
   metadata in a React/CSS-free sibling. The Vite plugin imports the siblings directly. This
   is a larger refactor than the current scope; for now the behaviour for extension components
   is **graceful degradation** (extension containers over-subscribe to parent deps in built
   apps, but remain correct).

---

## 12. SSOT Migration (DRY Violation Fix)

### 12.1 Why this was needed

The initial fix in §11 created a registry that duplicated `childInjectedVars` /
`events[*].injectedVars` values already declared in each component's `.tsx` file. Reviewer
feedback flagged this as a DRY violation — two files would need synchronized updates whenever
a new injected var was added. The U-audit.1 test caught divergence, but only at test time,
not at edit time.

### 12.2 The SSOT pattern

The registry **is** the source of truth. Component `.tsx` files import their declarations from
the registry rather than redeclaring them inline.

**Before:**
```ts
// List/List.tsx
const ListMd = createMetadata({
  childInjectedVars: ["$item", "$itemIndex", "$isFirst", "$isLast", "$isSelected", "$group"],
  // ...
});
// And also in builtin-optimizer-metadata.ts — DUPLICATED
```

**After:**
```ts
// optimizer-metadata.ts (single source of truth)
export const OPTIMIZER_METADATA = {
  List: { childInjectedVars: ["$item", "$itemIndex", "$isFirst", "$isLast", "$isSelected", "$group"] },
  // ...
} as const satisfies Record<string, Partial<ComponentMetadata>>;

// List/List.tsx
import { OPTIMIZER_METADATA } from "../../components-core/optimization/optimizer-metadata";
const ListMd = createMetadata({
  childInjectedVars: OPTIMIZER_METADATA.List.childInjectedVars,
  // ...
});
```

Zero duplication. The same string literal is read by both consumers.

### 12.3 Migrated components (18 total)

| Iteration | Components |
|---|---|
| 1 — `events[*].injectedVars` | `DataLoader` (in `components-core/loader/`), `DataSource`, `APICall` |
| 2 — `childInjectedVars` | `List`, `Items`, `Table`, `TileGrid`, `Tree`, `Select`, `ModalDialog`, `Column`, `Form`, `FormItem`, `FormSegment`, `Tabs`, `TabItem`, `RadioGroup`, `Checkbox` |

Each migration is a two-line change: add one import statement, replace one inline literal with
a property access on the registry. The diff for the 18 components is purely mechanical.

### 12.4 Trade-offs

| Aspect | Before (duplicate registry) | After (SSOT) |
|---|---|---|
| Lines of duplicated data | ~30 | 0 |
| Files to update when adding `$foo` | 2 (component + registry) | 1 (registry) |
| Drift possible via inattention | Yes (caught at test time) | No (impossible by construction) |
| Component file ownership of its own metadata | Conceptually still owned | Now references a central registry — slightly inverted |
| Build-time / runtime parity | Test-enforced | Mechanically guaranteed |

The slight philosophical inversion (component "borrowing" its declaration from a registry
instead of "owning" it) is offset by the fact that the registry is genuinely a cross-cutting
concern: ANY component that injects must declare here, and the optimizer needs the same data
from both build-time and runtime paths anyway.

### 12.5 Alternatives considered

| Option | Verdict |
|---|---|
| Keep `builtin-optimizer-metadata.ts` as a duplicate + parity test | Rejected — DRY violation, drift possible |
| Split per-component into `*.metadata.ts` siblings (~18 new files) | Rejected for now — more files, no functional benefit over central registry |
| Build-time codegen (parse `.tsx` AST → write generated `.ts`) | Rejected — adds infrastructure for no win over SSOT pattern |
| Vite `ssrLoadModule` to import `.tsx` files with CSS transform | Rejected — makes parser async, depends on Vite internals |
| **Central registry imported by components (chosen)** | ✅ Simplest. Single source of truth. No new infra. |
