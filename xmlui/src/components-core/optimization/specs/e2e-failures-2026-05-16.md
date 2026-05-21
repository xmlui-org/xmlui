# E2E Test Failures — 2026-05-16 (updated with NEW FAILURES)

> **Original run (2026-05-16):** 4m 55s | Total: 6911 tests | **21 failed**, 2 flaky, 65 skipped, 6823 passed  
> **Re-run after fix (2026-05-18):** 15m 10s | Total: 6915 tests | **135 failed**, 3 flaky, 65 skipped, 6712 passed  
> **Run (2026-05-20 AM):** 4m 06s | Total: 6915 tests | **7 failed**, 5 flaky, 65 skipped, 6838 passed  
> **Run (2026-05-20 PM — FULL):** 4m22s | Total: 6917 tests | **0 failed** ✅, 5 flaky, 65 skipped, **6847 passed** ✅  
> **Run (2026-05-21 — Post Bug 26 Revert):** 4.0m | Total: 6921 tests | **0 failed** ✅, 3 flaky, 66 skipped, **6852 passed** ✅  
> Branch: `yurii/computedUses`

**ALL FIXED:** 0 failed tests.

---

## Summary table

| # | Group | File | Tests | Status |
|---|-------|------|-------|--------|
| ~~A~~ | ~~Event handler closure / `$context` binding~~ | ~~`open-a-context-menu-on-right-click.spec.ts`~~ | ~~6~~ | ✅ fixed |
| ~~B~~ | ~~`refreshOn` event handler closure updates~~ | ~~`Table.spec.ts` (refreshOn section)~~ | ~~3~~ | ✅ fixed |
| ~~C~~ | ~~Context vars in event handlers (`$url`, `$method`, `$queryParams`)~~ | ~~`DataSource.spec.ts`~~ | ~~1~~ | ✅ fixed |
| ~~D~~ | ~~Deferred / background async operations~~ | ~~`cancel-a-deferred-api-operation.spec.ts`, `handle-background-operations.spec.ts`~~ | ~~4~~ | ✅ fixed |
| ~~E~~ | ~~DataSource dependency chain~~ | ~~`delay-a-datasource-until-another-datasource-is-ready.spec.ts`~~ | ~~2~~ | ✅ fixed |
| ~~F~~ | ~~Table multi-row selection~~ | ~~`enable-multi-row-selection-in-a-table.spec.ts`~~ | ~~2~~ | ✅ fixed |
| ~~G~~ | ~~Tree async loading (`loaded` field)~~ | ~~`Tree-loaded-field.spec.ts`~~ | ~~3~~ | ✅ fixed |
| ~~H~~ | ~~Flaky (past)~~ | ~~`MessageListener.spec.ts`, `Select.spec.ts`, `FormBindingBehavior.spec.ts`~~ | ~~3~~ | ✅ fixed |
| ~~J~~ | ~~Compound components + `$queryParams` / `$this`~~ | ~~`compound-component.spec.ts`~~ | ~~4~~ | ✅ fixed (Bug 24) |
| K | Timing / responsive / flaky | `ChangeListener.spec.ts`, `Tree-spinnerDelay.spec.ts`, `make-a-table-responsive.spec.ts`, `use-the-same-modaldialog-to-add-or-edit.spec.ts` | 6 | ⚠️ flaky |
| ~~L~~ | ~~Extensions (all packages)~~ | ~~Multiple extension spec files~~ | ~~>130~~ | ✅ fixed |
| ~~M~~ | ~~Regressions (2026-05-20)~~ | ~~`APICall.spec.ts`, `retry-a-failed-api-call.spec.ts`, `update-ui-optimistically.spec.ts`~~ | ~~7~~ | ✅ fixed |
| ~~N~~ | ~~Select basic, grouping & multiselect~~ | ~~`Select.spec.ts`~~ | ~~15~~ | ✅ fixed (Bug 26 — Mandatory Shielding revert) |
| ~~O~~ | ~~Table `syncWithVar`~~ | ~~`Table.spec.ts`~~ | ~~6~~ | ✅ fixed (Bug 26 — Mandatory Shielding revert) |

---

## Group A — ✅ FIXED — Event handler closure / `$context` binding

**Fixed by:** `computedUses` now correctly includes `$context` in the `nonDynamicReadDeps` path;
`fullParentStateRef` propagates un-narrowed state to event handlers.

All 6 tests in `xmlui/tests-e2e/how-to-examples/open-a-context-menu-on-right-click.spec.ts` now pass.

---

## Group B — ✅ FIXED — `refreshOn` event handler closure updates

**Fixed by:** Bug 20 — `collectVariableDependencies` now includes LHS of assignment expressions
when called with `includeAssignmentTargets: true`. Table's `computedUses` correctly includes
`testState` (write-only target), making it available in scope for cell event handlers.

All 3 tests in `xmlui/src/components/Table/Table.spec.ts` (refreshOn Property) now pass.

---

## Group C — ✅ FIXED — Context vars in event handlers (`$url`, `$method`, `$queryParams`)

**Fixed by:** 
1. `computedUses` no longer treats `DataLoader` and `DataSource` `onFetch` references to fetch-injected names (`$url`, `$method`, `$queryParams`, …) as parent-scope deps. `$queryParams` collided with `ROUTING_STATE_KEYS` and narrowed the test Fragment to router query state, breaking merge with handler context.
2. The logic was refined to analyze `fetch` dependencies separately before adding them, rather than deleting them from the overall `usedHere` set, to prevent accidentally removing genuine dependencies that come from other props like `url="{$queryParams.q}"`.
3. `event-handlers`: always mirror `componentStateRef` into `stateRef` in `refreshStateRef` when `fullParentStateRef` is absent; apply handler `context` via `Object.assign` after `cloneDeep(originalState)` so injected fetch params reliably override router `$queryParams`.

**File:** `xmlui/src/components/DataSource/DataSource.spec.ts`

| Line | Test name |
|------|-----------|
| 549:3 | onFetch event › handler can use `$url`, `$method` and `$queryParams` context vars |

---

## Group D — ✅ FIXED — Deferred / background async operations

**Fixed by:** Bug 23 — `computedUses` static analysis now respects the runtime semantics of **implicit containers**. 
Implicit containers (vars/loaders/etc. but no explicit `uses`) delegate component API registration to the parent container.
The analyzer now correctly adds escaping child UIDs to the `computedUses` of implicit containers when narrowing is triggered by other dependencies. 
This prevents narrowed parent state from stripping sibling APIs (like `exportJob` or `fileUpload`) that descendants need to read to show progress feedback.

---

## Group E — ✅ FIXED — DataSource dependency chain

**Fixed by:** Bug 22 — `collectVariableDependencies` тепер поважає block scope у гілці `T_FUNCTION_INVOCATION_EXPRESSION`. Параметри arrow-функцій (`departments` у `onLoaded`) більше не витікають у `computedUses` через виклики `param.method(...)`. Це звільняє App від хибного звуження до `["departments"]` і дозволяє DataSource APIs (`users_for_ds_dependency`) бути видимими сусіднім компонентам.

All 3 tests in `xmlui/tests-e2e/how-to-examples/delay-a-datasource-until-another-datasource-is-ready.spec.ts` тепер проходять.

---

## Group F — ✅ FIXED — Table multi-row selection

**Fixed by:** Bug 23 (Implicit UID Propagation) — Table components with multi-row selection often read the selection state via sibling APIs. Including escaping UIDs in `computedUses` ensures these APIs remain visible even when the container state is narrowed.

---

## Group G — ✅ FIXED — Tree async loading (`loaded` field)

All 3 tests in `xmlui/src/components/Tree/Tree-loaded-field.spec.ts` now pass.
Likely fixed as a side-effect of the `computedUses` improvements (better dep tracking through event handlers).

---

## Group H — ✅ FIXED — Flaky (past)

The tests in `MessageListener.spec.ts`, `Select.spec.ts`, and `FormBindingBehavior.spec.ts` are now passing consistently in recent runs.

---

## Group I — ✅ FIXED — Extension smoke — xmlui-recharts

Fixed by improving the extension test environment configuration. All 23 tests now pass.

---

## Group J — ✅ FIXED — Compound component state / `$queryParams` / `$this`

**Fixed by:** Bug 24 — `CompoundComponent` now strips the stale `computedUses` from the
compound body before placing it as a child of the freshly created outer Container.
The static `computedUses` produced by `computeUsesForTree` excludes the compound's own
`vars` (correctly treating them as local), but once those vars are moved out to the
outer Container at runtime, the body's stale `computedUses` would narrow them OUT of
its `parentState`. Result: `Text` reading `{selectedFilter}` saw `undefined`.
See [computed-uses-specification.md — Бaг 24](./computed-uses-specification.md).

Regression unit test: `xmlui/tests/components-core/optimization/compound-stale-computedUses.test.ts`.

**File:** `xmlui/tests-e2e/compound-component.spec.ts`

| Line | Test name | Status (2026-05-20 PM) |
|------|-----------|-------------------|
| 585:1 | `$this` works in compound components | ✅ Pass |
| 599:1 | call api with id works in compound components | ✅ Pass |
| 722:1 | var initialized with `$queryParams` resolves correctly after SPA navigation | ✅ Pass |
| 759:1 | var initialized with `$queryParams` resolves correctly on direct URL load | ✅ Pass |

All 35 tests in `compound-component.spec.ts` pass (also confirmed in a broader sweep:
no regressions in Groups A, D, F, G, M, context-menu, DataSource chain, Table refreshOn).

---

## Group K — ⚠️ FLAKY — Timing / responsive layout

These tests are timing-sensitive. Most passed on retry or became flaky.

| File | Test name | Status (2026-05-21) |
|------|-----------|-------------------|
| `ChangeListener.spec.ts` | debounceWaitInMs resets timer... | ✅ Pass |
| `Tree-spinnerDelay.spec.ts` | spinnerDelay Property › ... | ✅ Pass |
| `make-a-table-responsive.spec.ts` | Make a Table responsive › ... | ⚠️ Flaky |
| `use-the-same-modaldialog-to-add-or-edit.spec.ts` | Use the same ModalDialog to add or edit › ... | ⚠️ Flaky |

---

## Group L — ✅ FIXED — New extension packages

Infrastructure issue resolved. `xmlui-search`, `xmlui-tiptap-editor`, and `xmlui-website-blocks` tests now pass.

---

## Group M — ✅ FIXED — Regressions (2026-05-20)

**Fixed by:** Bug 24 fix — Full re-run on 2026-05-20 PM confirms all 7 tests now pass.

All tests in the regression group now pass:
- `APICall.spec.ts` — State Tracking › stores lastError after failed execution ✅
- `retry-a-failed-api-call.spec.ts` — All Retry tests ✅
- `update-ui-optimistically.spec.ts` — All optimistic update tests ✅

---

## Group N — ✅ FIXED — Select basic, grouping & multiselect

**Fixed by:** Bug 26 (Mandatory Shielding revert). All 15 tests in `Select.spec.ts` now pass.

---

## Group O — ✅ FIXED — Table `syncWithVar`

**Fixed by:** Bug 26 (Mandatory Shielding revert). All 6 tests in `Table.spec.ts` now pass.

---

## Summary of Results — Post Bug 26 Revert

**FAILURES:** 0 failed tests! ✅

### Status by group:
- **A–O:** ✅ FIXED
- **Flaky:** ⚠️ FLAKY (3 tests)

### Flaky tests in the new run:
1. `AutoComplete.spec.ts:1235:3` — Validation Feedback › shows valid icon in concise mode when valid
2. `Form.spec.ts:3439:1` — regression: data url through modal context
3. `run-a-one-time-action-on-page-load.spec.ts:26:3` — One-time page load action › onInit fires on mount and the initialized card appears @website

---

## Priority for investigation

1. **Medium:** Flaky tests — improve test stability for timing-sensitive cases.
