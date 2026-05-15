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
| `StateContainer.tsx` | `statePartChanged` useCallback deps: 7 → 2 (ref-based) | Could silently break state propagation upward |
| `ComponentWrapper.tsx` | `scopedParentState` wraps all state in shallow-memo | Could suppress re-renders in edge cases |
| `StateContainer.tsx` | 2 debug `console.log` still present | Noise; remove before final cleanup |

`COMPUTED_USES_ENABLED` flag (in `computedUses.ts`) disables the algorithm entirely when
set to `false`. Currently set to `false` for investigation. Must be `true` for all
diagnostic and fix phases.

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

This is log-driven debugging, not static analysis. Root causes are confirmed by
observing the rendering pipeline, not by reasoning about source code.

---

## Phase 0 — Cross-group Diagnosis

**Goal:** Determine whether groups A–M share a single root cause or have independent causes.

**Prerequisite:** Set `COMPUTED_USES_ENABLED = true` in `computedUses.ts` before starting.

### Scenarios

Three playground scenarios run simultaneously (same log additions, different markup):

| ID | Group | Scenario | Failure pattern to observe |
|----|-------|----------|---------------------------|
| S1 | A — context vars | `ModalDialog` opened with `$param` | Does `$param` arrive in modal's child state? |
| S2 | B — bindTo | `TextBox` with `bindTo` and `$data` display | Does `$data` update after typing? |
| S3 | E — List | `List` with `$item` referenced in a child `Select` | Is `$item` visible inside `Items`? |

### Log additions (3 points)

**Point 1 — `[CU]` in `computedUses.ts`**, right after `node.computedUses = Array.from(computedUsesSet)`:
```typescript
console.log('[CU] SET', node.type, node.uid ?? '', '=', node.computedUses);
```

**Point 2 — `[SC:in]` in `StateContainer.tsx`**, right after `stateFromOutside` is computed:
```typescript
console.log('[SC:in]', node.type, node.uid ?? '', 'keys=', Object.keys(stateFromOutside ?? {}));
```

**Point 3 — `[SP]` in `StateContainer.tsx`**, inside `statePartChanged` at the point
where it decides whether to propagate up:
```typescript
console.log('[SP]', node.type, node.uid ?? '', 'key=', key, 'isLocal=', isLocalVar, 'propagate=', !uses || uses.includes(key));
```

### What to look for

| Pattern in logs | Diagnosis |
|-----------------|-----------|
| `[CU] SET X = ['a','b']` but X needs key `c` at runtime | `computedUses` over-narrows — algorithm bug |
| `[SC:in] X keys=[]` when parent has many keys | `computedUses=[]` set incorrectly OR `extractScopedState` gets empty array |
| `[SP] propagate=false` when it should propagate | `node.uses` or ref stale, state update silently dropped |
| All 3 scenarios show same missing-key | Shared root cause → go to Phase 1 |
| Scenarios show different missing keys | Independent causes → skip Phase 1, go to Phase 2 |

### Decision gate

- **Single shared pattern across all 3** → Phase 1 (shared fix)
- **Different patterns** → Phase 1 skipped, go directly to Phase 2

---

## Phase 1 — Shared Root Cause Fix (conditional)

Only executed if Phase 0 reveals a single shared cause.

**Most likely candidates based on diff analysis:**

**Candidate A — `computedUses` over-narrowing**
Algorithm sets narrow `computedUses` that excludes keys components legitimately need.
Fix: correct `computeUsesInternal` to not narrow containers that receive context vars,
or ensure `isKnownContainer` detection is accurate.

**Candidate B — `statePartChanged` ref silently drops updates**
The ref-based `useCallback([dispatch, node.uid])` means `statePartChanged` never
re-creates even when `parentStatePartChanged` changes identity. In some scenarios
`parentStatePartChangedRef.current` may be stale at the moment of call.
Fix: revert to closure-based `useCallback` with correct deps, OR add a targeted test
to confirm the ref approach is safe.

**Candidate C — `scopedParentState` shallow-memo suppresses re-renders**
`useShallowCompareMemoize(useMemo(...))` in `ComponentWrapper` returns a stable
reference even when inner state values change, if the shallow comparison doesn't
detect the change (e.g., mutated objects).
Fix: remove the shallow memo from the `undefined`-uses code path (only apply when
`uses` or `computedUses` is actually defined).

**Verification after Phase 1:**
Run full test suite → record new baseline count. Expected drop: >50 tests.
If count drops to <100 → proceed to Phase 2 with remaining failures.
If count barely drops → Phase 1 diagnosis was wrong → re-diagnose.

---

## Phase 2 — Groups A + B (Context Variables + bindTo)

**Dependencies:** Phase 0 complete; Phase 1 applied if applicable.

**Group A — Context variable propagation**
Failing vars: `$param`, `$params`, `$context`, `$item`, `$row`, `$data`, `$this`.
Affected components: APICall, ModalDialog, ContextMenu, List, Table, Queue, Toast, Checkbox.

Likely cause: `computedUses` set on a container that wraps these components excludes
the key that carries context var info, or the context injection mechanism is disrupted.

**Group B — bindTo / $data synchronization**
Affected: 16 input components (TextBox, Select, Checkbox, DatePicker, …).
Likely cause: `statePartChanged` not correctly routing `$data` key up the tree,
or `stateFromOutside` filtering breaks the two-way sync.

**Verification:**
```bash
npx playwright test --grep "\\$param|\\$context|\\$item|\\$row|\\$data|\\$this|bindTo" --reporter=list
```

---

## Phase 3 — Groups C + D (APICall)

**Dependencies:** Groups A + B passing (APICall context vars are subset of Group A).

**Group C — APICall core**
Notifications, `execute()` params, `mockExecute` context variables.
Most failures are downstream of `$param`/`$context` fixes from Phase 2.

**Group D — APICall deferred mode**
Polling, cancellation, status updates.
Likely independent from context-var issues — may need separate log session
focusing on the polling state machine and async dispatch.

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

These groups likely share the same root cause as Group A (context var propagation),
so most should self-heal after Phase 2. Run verification before investigating individually.

**Verification:**
```bash
npx playwright test xmlui/src/components/List xmlui/src/components/Table \
  xmlui/src/components/Form xmlui/src/components/App --reporter=list
```

---

## Phase 5 — Groups H + I (Tree + refreshOn)

**Dependencies:** None — these are likely independent.

**Group H — Tree async loading**
`setAutoLoadAfter()`, `setDynamic()`, loaded-state tracking, load errors.
Possibly unrelated to `computedUses` — may be a `statePartChanged` async timing issue.

**Group I — refreshOn regressions**
TileGrid + Table `refreshOn` closure update / stale handler.
Likely related to `statePartChanged` ref change making the refresh callback stale.

**Verification:**
```bash
npx playwright test xmlui/src/components/Tree --reporter=list
npx playwright test --grep "refreshOn|TileGrid" --reporter=list
```

---

## Phase 6 — Group J (Toast / Queue / Option)

**Dependencies:** Groups A + B passing (`$param` in toast).

**Group J**
Toast show/update/`$param`, Queue progress template context vars, Option dynamic Items.

Most failures likely downstream of Group A fix. Verify first, investigate only
if failures remain after Phase 2.

**Verification:**
```bash
npx playwright test xmlui/src/components/Toast xmlui/src/components/Queue \
  xmlui/src/components/Option --reporter=list
```

---

## Phase 7 — Groups K + L + M (E2E + Extensions)

**Dependencies:** All unit-level groups (A–J) passing.

**Group K — E2E website examples**
Context menus, modals, deferred API, table selection, background queues.
Expected to self-heal once A–J are fixed.

**Group L — Extensions**
TableSelect (crm-blocks), Gauge (didChange), TiptapEditor (getMarkdown API).
Run after K; investigate only if they don't self-heal.

**Group M — Regression / infrastructure**
Compound component `$this`, cleanup/init AppState, context double-resolution.
May need separate log session if they don't self-heal.

**Verification:**
```bash
npx playwright test xmlui/tests-e2e --reporter=list
```

---

## Final Cleanup (after all phases pass)

1. Remove both debug `console.log` from `StateContainer.tsx` (lines with `$param`/`$item` check)
2. Remove render-count profiler block from `StateContainer.tsx` (dev-only `__renderCounts`)
3. Set `COMPUTED_USES_ENABLED = true` (the flag stays — it is intentionally dev/test-only for running E2E with optimization off; default must be `true`)
4. Remove `[CU]`, `[SC:in]`, `[SP]` log lines added during diagnosis
5. Run full test suite — green baseline

---

## Progress Tracker

| Phase | Status | Tests fixed |
|-------|--------|-------------|
| Phase 0 — Diagnosis | pending | — |
| Phase 1 — Shared fix | pending | — |
| Phase 2 — Groups A + B | pending | — |
| Phase 3 — Groups C + D | pending | — |
| Phase 4 — Groups E + F + G | pending | — |
| Phase 5 — Groups H + I | pending | — |
| Phase 6 — Group J | pending | — |
| Phase 7 — Groups K + L + M | pending | — |
| Cleanup | pending | — |
