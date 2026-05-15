# Test Fix Plan — yurii/computedUses Branch
**Date:** 2026-05-15  
**Branch:** `yurii/computedUses`  
**Failures:** 191 tests across 13 groups (A–M)  
**Strategy:** Root-cause-first → staged group fixes

---

## Context

The `computedUses` optimization was introduced on this branch. It adds a parse-time
algorithm (`computeUsesInternal`) that narrows which parent-state keys each container
subscribes to, reducing unnecessary re-renders.

Key changes that interact with the 191 failures:

| File | Change | Risk |
|------|--------|------|
| `computedUses.ts` | New algorithm sets `node.computedUses` at boot | Could over-narrow state, cutting off vars components need |
| `StateContainer.tsx` | `stateFromOutside` now uses `node.computedUses` | If computedUses is wrong, stateFromOutside is wrong |
| `StateContainer.tsx` | `statePartChanged` useCallback deps: 7 → 2 (ref-based) | Unlikely to cause failures — refs update synchronously during render |
| `ComponentWrapper.tsx` | `scopedParentState` wraps all state in shallow-memo | Could suppress re-renders when `uses`/`computedUses` is undefined |
| `StateContainer.tsx` | 2 debug `console.log` still in prod code | Noise; remove in Final Cleanup |

`COMPUTED_USES_ENABLED` flag (in `computedUses.ts`) disables the algorithm when `false`.
**Must be `true` for all diagnostic and fix phases.**

---

## Methodology

Each phase follows this loop:

```
1. I provide  → XMLUI playground markup + list of log lines to add to framework
2. You run    → playground, return full console output
3. I analyze  → form hypothesis, propose code fix
4. You apply  → fix in source files
5. You run    → test group for that phase
6. Result     → if green: next phase | if red: another log iteration
```

Root causes are confirmed by observing the rendering pipeline, not by reasoning
about source code alone.

---

## Phase 0 — Cross-group Diagnosis

**Goal:** Determine whether groups A–M share a single root cause or have independent causes.

**Prerequisite:** Set `COMPUTED_USES_ENABLED = true` in `computedUses.ts`.  
Without this, `computedUses` is never set and `[CU]` logs produce no output.

### Scenarios

Three separate playground runs (same log additions, different markup each time).
Collect and return console output from all three runs together.

| ID | Group | Scenario | What we're watching |
|----|-------|----------|---------------------|
| S1 | A — context vars | `ModalDialog` opened with `$param` | Does `$param` arrive in modal child's state? |
| S2 | B — bindTo | `TextBox` with `bindTo` + `$data` display | Does `$data` update after typing? |
| S3 | E — List | `List` with `$item` referenced in a child `Select` | Is `$item` present in Select's computedUses? |

**Note on S2:** `$data` flows through a Form context mechanism, not through parent-state
narrowing. Logs `[CU]` and `[SC:in]` will not show `$data`. If S2 fails, it needs a
separate diagnostic phase targeting the Form/bindTo dispatch path.

**Note on S3:** `$item` is a `contextVar` injected by `Items` — it is NOT a parent-state
key. `[SC:in]` will correctly show `$item` is absent from parent-state (that's expected).
The relevant question for S3 is whether `[CU]` sets a correct (non-empty) `computedUses`
on the Select, and whether `extractScopedState` does not strip the data the Select needs.

### Log additions

**Reuse existing logs first.** `StateContainer.tsx` already has:
- Line 171: logs `node.contextVars`, `node.computedUses`, `node.uses` for `$param`/`$item` nodes
- Line 360: logs `combinedState.$param` for `$param`/`$item` nodes

Add **2 new log lines** (the existing ones cover combinedState for S1):

**Point `[CU]`** in `computedUses.ts`, right after `node.computedUses = Array.from(computedUsesSet)`:
```typescript
console.log('[CU] SET', node.type, node.uid ?? '', '=', JSON.stringify(node.computedUses));
```
Filter: look for lines where `node.type` matches the component under test (e.g. `Select`, `Container`).

**Point `[SC:in]`** in `StateContainer.tsx`, right after `stateFromOutside` is computed (after the `useShallowCompareMemoize` block):
```typescript
console.log('[SC:in]', node.type, node.uid ?? '', 'keys=', Object.keys(stateFromOutside ?? {}));
```
Filter: look for the container wrapping the failing component — verify expected parent-state keys are present.

### What to look for

| Pattern in logs | Diagnosis |
|-----------------|-----------|
| `[CU] SET Select = ['a']` but Select needs key `b` | `computedUses` over-narrows — algorithm bug |
| `[SC:in] Container keys=[]` when parent has many keys | Empty `computedUses` set incorrectly |
| Line-360 shows `combinedState.$param= undefined` | `$param` lost before it reaches children |
| Line-171 shows `computedUses= ['x']` but modal needs `$param` | Modal container narrowed incorrectly |
| All 3 scenarios show same missing-key pattern | Shared root cause → go to Phase 1 |
| Scenarios show different patterns | Independent causes → skip Phase 1, go directly to Phase 2 |

### Decision gate

- **Single shared pattern across all 3 runs** → Phase 1 (fix shared cause first)
- **Different patterns** → Phase 1 skipped, proceed directly to Phase 2

---

## Phase 1 — Shared Root Cause Fix (conditional)

Only executed if Phase 0 reveals a single shared cause.

**Most likely candidates based on diff analysis:**

**Candidate A — `computedUses` over-narrowing**  
Algorithm sets narrow `computedUses` that excludes keys containers legitimately need
from parent state. This would explain failures across all groups that rely on parent
state (A, B, C, E, F, G, J, M).  
Fix: correct `computeUsesInternal` — ensure containers that wrap components needing
full parent state are not narrowed (e.g. if `isKnownContainer` misclassifies them).

**Candidate B — `scopedParentState` shallow-memo in ComponentWrapper**  
`useShallowCompareMemoize(useMemo(...))` runs for every component — even those where
`uses`/`computedUses` are `undefined` (i.e. full state should pass through unchanged).
A shallow comparison may incorrectly return a stale state reference if a nested object
is mutated in place rather than replaced.  
Fix: only apply shallow-memo when `uses` or `computedUses` is actually defined:
```typescript
const scopedParentState = (nodeUses ?? nodeComputedUses)
  ? useShallowCompareMemoize(useMemo(() => extractScopedState(...), [...]))
  : state;
```

**Verification after Phase 1:**
Run full test suite → record new baseline count.
If count drops significantly → proceed to Phase 2.
If count barely drops → candidate was wrong → re-run Phase 0 with additional log points.

---

## Phase 2 — Groups A + B (Context Variables + bindTo)

**Dependencies:** Phase 0 complete; Phase 1 applied if applicable.

**Group A — Context variable propagation**  
Failing vars: `$param`, `$params`, `$context`, `$item`, `$row`, `$data`, `$this`.  
Affected components: APICall, ModalDialog, ContextMenu, List, Table, Queue, Toast, Checkbox.

**Group B — bindTo / $data synchronization**  
Affected: 16 input components (TextBox, Select, Checkbox, DatePicker, …).  
Note: `$data` flows through the Form context mechanism, independent of `computedUses`.
If Group B failures persist after Phase 1, they need a separate log session targeting
the Form/bindTo dispatch path.

**Verification:**
```bash
npx playwright test --grep "\\$param|\\$context|\\$item|\\$row|\\$data|\\$this|bindTo" --reporter=list
```

---

## Phase 3 — Groups C + D (APICall)

**Dependencies:** Groups A + B passing (most APICall context vars are subset of Group A).

**Group C — APICall core**  
Notifications, `execute()` params, `mockExecute` context variables.  
Most failures expected to self-heal once Group A is fixed.

**Group D — APICall deferred mode**  
Polling, cancellation, status updates.  
Async state machine — may be independent from context-var issues.
If failures remain after Phase 2, needs separate log session focusing on polling dispatch.

**Verification:**
```bash
npx playwright test xmlui/src/components/APICall --reporter=list
```

---

## Phase 4 — Groups E + F + G (Selection, Table, Modal)

**Dependencies:** Groups A + B passing.

**Group E — List selection**  
`selectionDidChange`, `rowDoubleClick`, `selectAll`, `getSelectedIds`, keyboard shortcuts.

**Group F — Table**  
Context menu `$context`/`$row`, `refreshOn` closure, copy action.

**Group G — Modal / Form / Navigation**  
Nested context propagation, `willNavigate`, `didNavigate`, modal focus.

These groups depend heavily on context-var propagation (Group A). Verify first —
most failures are expected to self-heal after Phase 2.

**Verification:**
```bash
npx playwright test xmlui/src/components/List xmlui/src/components/Table \
  xmlui/src/components/Form xmlui/src/components/App --reporter=list
```

---

## Phase 5 — Groups H + I (Tree + refreshOn)

**Dependencies:** None — likely independent from context-var issues.

**Group H — Tree async loading**  
`setAutoLoadAfter()`, `setDynamic()`, loaded-state tracking, load errors.  
May be related to async timing in `statePartChanged`, not `computedUses`.

**Group I — refreshOn regressions**  
TileGrid + Table `refreshOn` closure update / stale handler.  
Potentially caused by `statePartChanged` ref change making refresh callback captured
at the wrong render cycle. Needs dedicated log session if not self-healing.

**Verification:**
```bash
npx playwright test xmlui/src/components/Tree --reporter=list
npx playwright test --grep "refreshOn|TileGrid" --reporter=list
```

---

## Phase 6 — Group J (Toast / Queue / Option)

**Dependencies:** Groups A + B passing (`$param` in toast, context vars in queue).

Most failures expected to self-heal after Phase 2. Verify first.

**Verification:**
```bash
npx playwright test xmlui/src/components/Toast xmlui/src/components/Queue \
  xmlui/src/components/Option --reporter=list
```

---

## Phase 7 — Groups K + L + M (E2E + Extensions)

**Dependencies:** All unit-level groups (A–J) passing.

**Group K — E2E examples**  
Context menus, modals, deferred API, table selection, background queues.  
Almost entirely downstream — expected to self-heal once A–J pass.

**Group L — Extensions**  
TableSelect (crm-blocks), Gauge (didChange), TiptapEditor (getMarkdown).  
Investigate individually only if they don't self-heal after K.

**Group M — Regressions / infrastructure**  
Compound component `$this`, cleanup/init AppState, context double-resolution.  
May need a dedicated log session if they don't self-heal after Group A fix.

**Verification:**
```bash
npx playwright test xmlui/tests-e2e --reporter=list
```

---

## Final Cleanup (after all phases pass)

1. Remove both debug `console.log` from `StateContainer.tsx` (lines 171 and 360)
2. Remove render-count profiler block from `StateContainer.tsx` (`__renderCounts`, `__resetRenderCounts`, `__topRenderCounts`)
3. Set `COMPUTED_USES_ENABLED = true` — the flag stays as a dev/test tool; default must be `true`
4. Remove `[CU]` and `[SC:in]` log lines added during diagnosis
5. Run full test suite — confirm green baseline

---

## Progress Tracker

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 — Diagnosis | pending | Prerequisite: COMPUTED_USES_ENABLED = true |
| Phase 1 — Shared fix | pending | Conditional on Phase 0 findings |
| Phase 2 — Groups A + B | pending | |
| Phase 3 — Groups C + D | pending | |
| Phase 4 — Groups E + F + G | pending | |
| Phase 5 — Groups H + I | pending | |
| Phase 6 — Group J | pending | |
| Phase 7 — Groups K + L + M | pending | |
| Cleanup | pending | |
