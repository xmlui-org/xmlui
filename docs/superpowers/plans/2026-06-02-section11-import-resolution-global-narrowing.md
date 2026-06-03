# Section 11 — Cross-`.xs` Import Resolution for `computedGlobalUses` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unblock the ~35 myworkdrive containers whose `computedGlobalUses` is suppressed by `hasUnresolvableImports`, by ensuring imported `.xs` helper bodies are resolved *before* the optimizer pass and their global reads are folded into callers (direct and via §10 child propagation).

**Architecture:** Import resolution machinery already exists (`collectCodeBehindFromSourceWithImports` in the parser, `collectImportsFromStandaloneSources` in `StandaloneApp`) — it merges imported function bodies into `scriptCollected.functions` and clears `hasUnresolvableImports`. §10 already folds a function's global reads into children that call it. §11 = **(a)** confirm/repair the *wiring* so resolution actually runs on the tree the optimizer sees (especially dev mode), **(b)** prove the globals channel (`computedGlobalUses`, not just state `computedUses`) benefits from resolution, **(c)** keep a conservative fallback for genuinely unresolvable references.

**Tech Stack:** TypeScript, Vitest. Core files: `computedUses.ts`, `StandaloneApp.tsx`, `code-behind-collect.ts`. Test helpers already in `computedUses.test.ts` (`node`, `parseFn`, `originalComputeUsesForTree`) and `standalone-import-resolution.test.ts` (sources-map + `collectImportsFromStandaloneSources`).

---

## Current State — what already exists (read before writing any code)

| Capability | Where | Status |
|---|---|---|
| Resolve `.xs` imports into a merged `{ functions, vars }` | `src/parsers/scripting/code-behind-collect.ts` → `collectCodeBehindFromSourceWithImports` | ✅ exists, unit-tested (`tests/parsers/scripting/code-behind-import.test.ts`) |
| Merge resolved functions into `scriptCollected.functions`, set `hasUnresolvableImports=false` | `src/components-core/StandaloneApp.tsx` → `collectImportsFromStandaloneSources` (~L2130) | ✅ exists |
| Re-run optimizer after resolution (standalone fetch path) | `StandaloneApp.tsx` ~L1745: `if (resolvedAny) computeUsesForTree(...)` | ✅ exists for the **fetch** path |
| Vite build-time import resolution for **inline `<script>`** | `src/nodejs/vite-xmlui-plugin.ts` L224-290 | ✅ exists |
| §10 fold: a function's global reads → children that call it | `computedUses.ts` fold block + `safeToNarrowGlobals` | ✅ implemented (this branch) |
| `ownHasScript` blocks narrowing while `hasUnresolvableImports` true | `computedUses.ts` L498-504 | ✅ by design (conservative) |
| Resolution benefits the **globals** channel (`computedGlobalUses`) | — | ❌ **no test asserts this** (existing test only checks state `computedUses`) |
| Resolution fires on the rendered tree in **dev mode** | `StandaloneApp.tsx` dev branch L1200-1291 — **no `collectImportsFromStandaloneSources`, no `computeUsesForTree`** | ⚠️ **unverified — likely the real gap behind the 35** |

**Key consequence for this plan:** §11 is *not* "build an import resolver" — that exists. It is "make the existing resolver's output reach the globals channel, on the tree the renderer actually uses." The first task is therefore **localization, not construction** (per CLAUDE.md debugging policy: instrument with logs, then narrow to the exact gap before editing).

---

## File Structure

- `src/components-core/StandaloneApp.tsx` — boot wiring. The dev-mode branch (L1200-1291) is the prime suspect for the 35; may need a resolution + re-optimize step mirroring the fetch path (L1745). One responsibility: assemble the app def and ensure imports are resolved before/at optimizer time.
- `src/components-core/optimization/computedUses.ts` — already folds resolved function global reads. Expected to need **no change** (once functions are merged, the existing fold handles them). The plan *verifies* this rather than assuming it.
- `tests/components-core/optimization/computedUses.test.ts` — add unit tests proving that an imported helper present in `scriptCollected.functions` contributes to `computedGlobalUses` (direct caller) and propagates to children (§10 path). These tests model the **post-resolution** state and are independent of which boot path runs.
- `tests/components-core/standalone-import-resolution.test.ts` — extend the existing end-to-end test (sources map → `collectImportsFromStandaloneSources` → `computeUsesForTree`) to assert on `computedGlobalUses`, and add a conservative-fallback case.
- `docs/superpowers/reviews/2026-06-02-section11-diagnosis.md` — output artifact of Task 0 (the localization finding). Created by the diagnosis task; consumed by Task 4.

---

## Task 0: Localize the real gap (instrumented diagnosis — NO production edits)

**Goal:** Determine, for the myworkdrive 35, *which* link is broken: (G1) functions never merged into `scriptCollected.functions` on the rendered tree; (G2) `hasUnresolvableImports` still `true` when `computeUsesForTree` runs; (G3) `appGlobalNames` empty so global reads aren't recognized (overlaps §6); (G4) functions merged but fold not firing. Exactly one (or a known combination) is the cause. Do not guess — measure.

**Files:**
- Temp-instrument: `src/components-core/optimization/computedUses.ts` (inside `computeUsesInternal`, dev-only log)
- Temp-instrument: `src/components-core/StandaloneApp.tsx` (dev branch L1200-1291, after `setStandaloneApp`)
- Create: `docs/superpowers/reviews/2026-06-02-section11-diagnosis.md`

- [ ] **Step 1: Add a guarded diagnostic log to the optimizer**

In `computeUsesInternal`, immediately after `ownHasScript` is computed (L498-504), add a dev-only log keyed on nodes that have script + imports. This captures the per-node truth at optimizer time.

```typescript
// §11-DIAG (temporary — remove before commit). Logs why a script node is / isn't narrowed.
if (import.meta.env.VITE_XMLUI_DEV_MODE && node.scriptCollected) {
  const fnNames = Object.keys(node.scriptCollected.functions ?? {});
  // eslint-disable-next-line no-console
  console.log("[§11-DIAG]", {
    type: node.type,
    id: (node as any).uid ?? (node as any).id,
    hasUnresolvableImports: node.scriptCollected.hasUnresolvableImports,
    hasInvalidStatements: node.scriptCollected.hasInvalidStatements,
    fnCount: fnNames.length,
    fnNames,
    appGlobalNamesSize: appGlobalNames.size,
  });
}
```

- [ ] **Step 2: Add a boot-path marker to the dev branch**

In `StandaloneApp.tsx`, inside the dev-mode branch right before `return;` at L1290, log whether import resolution ran on this path.

```typescript
// §11-DIAG (temporary — remove before commit).
if (import.meta.env.VITE_XMLUI_DEV_MODE) {
  // eslint-disable-next-line no-console
  console.log("[§11-DIAG] dev-branch: collectImportsFromStandaloneSources NOT called here; appDef set directly");
}
```

- [ ] **Step 3: Run myworkdrive dev server and capture logs**

Run the myworkdrive dev server, open `/my-files`, and capture the `[§11-DIAG]` console output (browser console → save to a file). For each of the suspected containers (`Table#filesTable`, the `Fragment`s reading `events` via `shared.xs`, `Main` importing `copyOrCut,publishEvent`), record: `hasUnresolvableImports`, `fnNames` (does it contain the imported helper?), `appGlobalNamesSize`.

- [ ] **Step 4: Classify the gap and write the finding**

Write `docs/superpowers/reviews/2026-06-02-section11-diagnosis.md` answering exactly:
- G1 (functions not merged): is the imported helper name present in `fnNames`? (No ⇒ resolution didn't reach this tree.)
- G2 (flag still set): is `hasUnresolvableImports === true` at optimizer time? (Yes ⇒ resolution/re-optimize ordering is wrong on this path.)
- G3 (no globals): is `appGlobalNamesSize === 0`? (Yes ⇒ §6 overlap — optimizer ran before `appGlobalNames` was authoritative.)
- G4 (fold not firing): functions merged, flag clear, globals present, but `computedGlobalUses` still undefined ⇒ optimizer bug to fix in `computedUses.ts`.

State the single dominant cause (or ordered combination). **Task 4's concrete edit is selected by this finding.**

- [ ] **Step 5: Remove both diagnostic logs**

Revert the Step 1 and Step 2 instrumentation. Confirm with `git diff` that no `§11-DIAG` strings remain.

Run: `git diff -G'§11-DIAG'`
Expected: empty output.

---

## Task 1: Imported helper's global reads reach a direct caller's `computedGlobalUses`

**Files:**
- Test: `tests/components-core/optimization/computedUses.test.ts` (append to the existing globals describe block)

This task models the **post-resolution** state: the imported helper body already lives in `scriptCollected.functions` (exactly what `collectImportsFromStandaloneSources` produces via its `{ ...resolved.functions, ...own }` merge). It proves the optimizer already credits imported globals to the owning container — establishing the baseline before the propagation and wiring tasks.

- [ ] **Step 1: Write the failing test**

```typescript
it("§11: resolved imported helper's global read lands in the owner's computedGlobalUses", () => {
  // Post-resolution shape: publishEvent was imported from shared.xs and merged
  // into scriptCollected.functions. It reads the global `events`.
  const owner = node("Container", {
    uses: [],
    props: { onMount: "{publishEvent('open')}" },
    scriptCollected: {
      functions: { publishEvent: parseFn("(name) => { events = events.concat(name); }") },
      vars: {},
      hasInvalidStatements: false,
      hasUnresolvableImports: false, // cleared by the resolver
    },
  });
  const globals = new Set(["events", "unrelated"]);
  originalComputeUsesForTree(owner, getOptimizerMetadata, globals);

  expect(owner.computedGlobalUses).toBeDefined();
  expect(owner.computedGlobalUses).toContain("events");
  expect(owner.computedGlobalUses).not.toContain("unrelated");
});
```

- [ ] **Step 2: Run the test to see whether it already passes**

Run: `npx vitest run tests/components-core/optimization/computedUses.test.ts -t "§11: resolved imported helper"`
Expected: **PASS** is the likely outcome (the fold already handles any function in the map). If it FAILS, the failure localizes a real optimizer gap (G4) — proceed to Step 3; if it PASSES, this task is a guard test only — skip Step 3 and commit.

- [ ] **Step 3 (only if Step 2 failed): minimal optimizer fix**

If the owner's own `publishEvent` global reads are not credited, the issue is in how `usedHereReads` feeds `globalDepsUsed`. Inspect the block at `computedUses.ts` L466-496 (`collectScriptFunctionDeps` → `addAll(usedHereReads, fnReads)`) and the `globalDepsUsed` assembly. The fix must keep `isGlobalDep` filtering intact. Re-run until green.

- [ ] **Step 4: Commit**

```bash
git add tests/components-core/optimization/computedUses.test.ts
git commit -m "test(§11): assert resolved imported helper global reads reach owner computedGlobalUses"
```

---

## Task 2: Imported helper's global reads propagate to a CHILD that calls it (§10 path)

**Files:**
- Test: `tests/components-core/optimization/computedUses.test.ts` (append to globals describe block)

This is the headline §11 scenario: a child (e.g. `Table#filesTable`) calls a helper that the parent imported from `shared.xs`. After resolution the helper is in the parent's `scriptCollected.functions`, so §10's `childParentFunctionDeps` should carry its global reads to the child.

- [ ] **Step 1: Write the failing test**

```typescript
it("§11: child calling parent's IMPORTED helper gets the helper's global in computedGlobalUses", () => {
  // Parent imported publishEvent from shared.xs (now merged). Child calls it.
  const child = node("Table", { props: { onSelect: "{publishEvent('select')}" } });
  const parent = node("Container", {
    uses: [],
    scriptCollected: {
      functions: { publishEvent: parseFn("(name) => { events = events.concat(name); }") },
      vars: {},
      hasInvalidStatements: false,
      hasUnresolvableImports: false,
    },
    children: [child],
  });
  const globals = new Set(["events", "sortBy", "unrelated"]);
  originalComputeUsesForTree(parent, getOptimizerMetadata, globals);

  expect(child.computedGlobalUses).toBeDefined();
  expect(child.computedGlobalUses).toContain("events");
  expect(child.computedGlobalUses).not.toContain("sortBy");
  expect(child.computedGlobalUses).not.toContain("unrelated");
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run tests/components-core/optimization/computedUses.test.ts -t "§11: child calling parent's IMPORTED helper"`
Expected: **PASS** if §10's machinery is name-agnostic (it is — it folds any resolvable parent function). A FAIL localizes a §10-coverage gap for imported names; fix in `computedUses.ts` keeping the `parentDependencies`-based fold guard.

- [ ] **Step 3: Commit**

```bash
git add tests/components-core/optimization/computedUses.test.ts
git commit -m "test(§11): child inherits imported helper global reads via §10 propagation"
```

---

## Task 3: End-to-end — `collectImportsFromStandaloneSources` enables the GLOBALS channel

**Files:**
- Test: `tests/components-core/standalone-import-resolution.test.ts` (add a sibling test next to the existing state-channel test)

The existing test asserts `computedUses` (state). This adds the missing globals assertion, exercising the real resolver end-to-end (parse → resolve → merge → optimize with a non-empty `appGlobalNames`).

- [ ] **Step 1: Write the failing test**

```typescript
it("§11: resolving imports enables computedGlobalUses for an imported global-reading helper", async () => {
  const sources = {
    "/app/components/MyComp.xmlui": `
      <Component name="MyComp">
        <Container>
          <script>
            import { publishEvent } from "./shared.xs";
            var a = 1;
          </script>
          <Text value="{publishEvent(a)}"/>
        </Container>
      </Component>
    `,
    "/app/components/shared.xs": `
      function publishEvent(x) { events = events.concat(x); return x; }
    `,
  };

  const compDef = transformSource(sources["/app/components/MyComp.xmlui"]) as CompoundComponentDef;
  const actualComponent = compDef.component;
  expect(actualComponent.scriptCollected!.hasUnresolvableImports).toBe(true);

  const appDef: StandaloneAppDescription = { sources, components: [compDef as any] };
  const projectCompilation: ProjectCompilation = {
    entrypoint: { filename: "/app/Main.xmlui", definition: null as any, dependencies: new Set() },
    components: [{
      filename: "/app/components/MyComp.xmlui",
      markupSource: sources["/app/components/MyComp.xmlui"],
      definition: compDef as any,
      dependencies: new Set(),
    }],
    themes: {},
  };
  const dummyHandler = {
    componentRegistered: () => true,
    getComponentProps: () => ({}),
    getComponentEvents: () => ({}),
    acceptArbitraryProps: () => true,
    getComponentValidator: () => null,
  };

  const resolvedAny = await collectImportsFromStandaloneSources(appDef, projectCompilation, dummyHandler as any);
  expect(resolvedAny).toBe(true);
  expect(actualComponent.scriptCollected!.hasUnresolvableImports).toBe(false);
  expect(actualComponent.scriptCollected!.functions.publishEvent).toBeDefined();

  // The crux: optimizer must now credit `events` to computedGlobalUses.
  const dummyMetadataLookup = () => ({}) as any;
  computeUsesForTree(actualComponent, dummyMetadataLookup, new Set(["events", "unrelated"]));

  expect(actualComponent.computedGlobalUses).toBeDefined();
  expect(actualComponent.computedGlobalUses).toContain("events");
  expect(actualComponent.computedGlobalUses).not.toContain("unrelated");
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run tests/components-core/standalone-import-resolution.test.ts -t "§11: resolving imports enables computedGlobalUses"`
Expected: PASS once the resolver merges `publishEvent` and `computeUsesForTree` receives a non-empty `appGlobalNames`. A FAIL here that contradicts Task 1 indicates the resolver's merged arrow shape differs from a `parseFn` arrow — inspect `collectCodeBehindFromSourceWithImports`'s `T_ARROW_EXPRESSION` wrapping vs what `collectScriptFunctionDeps` expects, and reconcile.

- [ ] **Step 3: Commit**

```bash
git add tests/components-core/standalone-import-resolution.test.ts
git commit -m "test(§11): end-to-end import resolution enables computedGlobalUses"
```

---

## Task 4: Wire resolution into the path that feeds the renderer (gap fix from Task 0)

**Files:**
- Modify: `src/components-core/StandaloneApp.tsx` — the branch identified by Task 0 (most likely the dev-mode branch L1200-1291 and/or the `appGlobalNames` argument passed to `computeUsesForTree`).

> **This task's exact edit is selected by the Task 0 finding.** Pick the matching sub-step. Do not apply more than the finding justifies — every added call has a cost (extra async work on boot).

- [ ] **Step 1: Write the failing test for the located gap**

Add a regression test in `tests/components-core/standalone-import-resolution.test.ts` that reproduces the boot-path gap. For **G2/G1** (resolution not run on the path), assert that a component which starts with `hasUnresolvableImports=true` ends with `computedGlobalUses` set after the boot path runs resolution. For **G3** (empty `appGlobalNames`), assert that `computeUsesForTree` is called with the authoritative global-names set (non-empty) — e.g. extend Task 3's test to first call the optimizer with `EMPTY_SET` (showing it stays undefined) then with the real set (showing it resolves), documenting the ordering requirement.

```typescript
it("§11: boot path resolves imports before optimizing (regression for the 35)", async () => {
  // Arrange: same sources as Task 3 but assert the post-boot tree, not a manual computeUsesForTree.
  // (Use the smallest harness that exercises the branch Task 0 identified.)
  // ...assemble appDef/projectCompilation as in Task 3...
  const resolvedAny = await collectImportsFromStandaloneSources(appDef, projectCompilation, dummyHandler as any);
  expect(resolvedAny).toBe(true);
  // The re-optimize MUST run with the authoritative appGlobalNames after resolution:
  computeUsesForTree(actualComponent, () => ({}) as any, new Set(["events"]));
  expect(actualComponent.computedGlobalUses).toContain("events");
});
```

Run it: Expected FAIL (or PASS if Task 0 found the dev path already resolves — in which case Task 4 is a no-op and you record that in the diagnosis doc).

- [ ] **Step 2: Apply the minimal wiring fix matching Task 0**

**If G1/G2 (dev branch never resolves imports):** in the dev-mode branch of the `useIsomorphicLayoutEffect` (`StandaloneApp.tsx` ~L1247, after `setStandaloneApp(appDef)`), mirror the fetch path: resolve imports, then re-optimize only if anything resolved. Keep it inside the existing `async` IIFE so it does not block first paint synchronously.

```typescript
// §11: dev/inline path — resolve cross-.xs imports so computedGlobalUses is not
// suppressed by hasUnresolvableImports, mirroring the standalone fetch path.
const resolvedAny = await collectImportsFromStandaloneSources(
  appDef,
  resolvedRuntime.projectCompilation,
  wrappedMetadataHandler, // reuse the same handler object the fetch path builds
);
if (resolvedAny) {
  computeUsesForTree(
    appDef.entryPoint as ComponentDef,
    resolveOptimizerMetadata,
    resolvedRuntime.appGlobalNames,
  );
  appDef.components?.forEach((compound) => {
    if (compound.component) {
      computeUsesForTree(compound.component, resolveOptimizerMetadata, resolvedRuntime.appGlobalNames);
    }
  });
  setStandaloneApp({ ...appDef }); // new ref so React re-renders with the narrowed tree
}
```

**If G3 (empty `appGlobalNames`):** locate the `computeUsesForTree` call that runs with `EMPTY_SET` and supply the resolved `appGlobalNames` (`resolvedRuntime.appGlobalNames`) instead. This converges with §6; note the cross-reference in the diagnosis doc.

**If G4 (optimizer bug):** the fix belongs in Task 1/Task 2, not here — Task 4 becomes a no-op. Record that.

- [ ] **Step 3: Run the regression test + full optimizer suite**

Run: `npx vitest run tests/components-core/standalone-import-resolution.test.ts tests/components-core/optimization/computedUses.test.ts`
Expected: all PASS (including the §10 suite — the wiring must not regress it).

- [ ] **Step 4: Commit**

```bash
git add src/components-core/StandaloneApp.tsx tests/components-core/standalone-import-resolution.test.ts
git commit -m "fix(§11): resolve cross-.xs imports before optimizing on the dev/inline boot path"
```

---

## Task 5: Conservative fallback for genuinely unresolvable references

**Files:**
- Test: `tests/components-core/standalone-import-resolution.test.ts`

§11 must only narrow when resolution truly succeeded. Dynamic import paths, missing/third-party modules, and parse failures in the imported file must keep `hasUnresolvableImports=true` (or set `hasInvalidStatements`) so `ownHasScript` continues to block narrowing — no false subscription, no stale-render risk.

- [ ] **Step 1: Write the failing test**

```typescript
it("§11: a missing/unresolvable imported module keeps narrowing blocked", async () => {
  const sources = {
    "/app/components/Bad.xmlui": `
      <Component name="Bad">
        <Container>
          <script>
            import { ghost } from "./does-not-exist.xs";
            var a = 1;
          </script>
          <Text value="{ghost(a)}"/>
        </Container>
      </Component>
    `,
    // note: ./does-not-exist.xs intentionally absent from sources
  };
  const compDef = transformSource(sources["/app/components/Bad.xmlui"]) as CompoundComponentDef;
  const actualComponent = compDef.component;
  expect(actualComponent.scriptCollected!.hasUnresolvableImports).toBe(true);

  const appDef: StandaloneAppDescription = { sources, components: [compDef as any] };
  const projectCompilation: ProjectCompilation = {
    entrypoint: { filename: "/app/Main.xmlui", definition: null as any, dependencies: new Set() },
    components: [{ filename: "/app/components/Bad.xmlui", markupSource: sources["/app/components/Bad.xmlui"], definition: compDef as any, dependencies: new Set() }],
    themes: {},
  };
  const dummyHandler = {
    componentRegistered: () => true, getComponentProps: () => ({}), getComponentEvents: () => ({}),
    acceptArbitraryProps: () => true, getComponentValidator: () => null,
  };

  await collectImportsFromStandaloneSources(appDef, projectCompilation, dummyHandler as any);

  // Resolution failed (module not found / fetch throws) → flag stays set, narrowing blocked.
  expect(actualComponent.scriptCollected!.hasUnresolvableImports).toBe(true);
  computeUsesForTree(actualComponent, () => ({}) as any, new Set(["events"]));
  expect(actualComponent.computedGlobalUses).toBeUndefined();
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run tests/components-core/standalone-import-resolution.test.ts -t "§11: a missing/unresolvable imported module"`
Expected: PASS — `collectImportsFromStandaloneSources` wraps resolution in try/catch and only clears the flag on success (verify this: its catch block must NOT set `hasUnresolvableImports=false`). If the flag is wrongly cleared on failure, fix the catch in `collectImportsFromStandaloneSources` to leave it `true`.

- [ ] **Step 3: Commit**

```bash
git add tests/components-core/standalone-import-resolution.test.ts
git commit -m "test(§11): genuinely unresolvable imports keep global-narrowing blocked"
```

---

## Task 6: Re-audit and quantify (close the loop with the field evidence)

**Files:**
- Modify: `src/components-core/optimization/specs/TODO-computedGlobalUses-improvements.md` (update §11 status + E.1/E.2 counts after the fix)

- [ ] **Step 1: Re-run the myworkdrive narrowing audit**

With Task 4 merged, re-instrument as in Task 0 Step 1 (temporarily) and re-open `/my-files`. Count how many of the 35 now have `computedGlobalUses` set. Record the new ON-vs-OFF re-render delta for the 5 E.3 scenarios.

- [ ] **Step 2: Remove instrumentation and update the spec**

Revert temp logs. In `TODO-computedGlobalUses-improvements.md`, update the §11 row in the Summary table to reflect the resolved count, and refresh E.1/E.2 with post-§11 numbers. Note remaining genuinely-unresolvable cases (Task 5 class).

- [ ] **Step 3: Commit**

```bash
git add src/components-core/optimization/specs/TODO-computedGlobalUses-improvements.md
git commit -m "docs(§11): update audit — imports resolved, refreshed narrowing coverage"
```

---

## Self-Review

**Spec coverage (TODO §11 requirements):**
- "Resolve `.xs` imports so imported `{ all, reads }` is available" → already exists (Current State); Task 3 proves it reaches the optimizer; Task 4 wires the dev path.
- "Fold imported function global reads into caller's `globalDepsUsed` (reuse §10)" → Task 1 (direct caller) + Task 2 (child via §10).
- "Only genuinely unresolvable references keep the conservative guard" → Task 5.
- "Build-mode vs dev-mode must produce identical read-sets" → Task 0 G3 + Task 4 G3 branch (converges with §6); Task 6 verifies in dev.
- "Cycles & diamonds / per-function memo" → covered by the existing resolver's `ModuleLoader`/cache and §10's union-vs-per-function caveat already in `collectScriptFunctionDeps`; no new code, but Task 3's `shared.xs` and the existing `code-behind-import.test.ts` cycle tests guard it.
- "Converge with in-flight import-tracking work, don't duplicate" → the entire plan builds on `collectImportsFromStandaloneSources` / `collectCodeBehindFromSourceWithImports` rather than adding a parallel resolver. ✅

**Placeholder scan:** Task 4 is deliberately branch-selected by Task 0's finding rather than a single fixed edit — each branch (G1/G2, G3, G4) carries concrete code or an explicit no-op. This is a genuine decision gate, not a "TBD": the localization is a prerequisite, exactly as the project's debugging policy requires. All other tasks carry complete test code.

**Type/name consistency:** `originalComputeUsesForTree(root, getOptimizerMetadata, globalsSet)` and `parseFn` / `node` match the existing §10 test helpers; `computeUsesForTree(comp, metadataLookup, appGlobalNames)` matches the public signature used in `standalone-import-resolution.test.ts`; `collectImportsFromStandaloneSources(appDef, projectCompilation, handler)` matches `StandaloneApp.tsx`. `hasUnresolvableImports` / `scriptCollected.functions` match the `CollectedDeclarations` shape.

**Risk note:** Task 4's dev-path edit adds async work to boot. It is gated on `resolvedAny` and reuses the existing handler — keep it inside the current async IIFE and trigger a single `setStandaloneApp({...appDef})` so it costs one extra render, not a loop.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-02-section11-import-resolution-global-narrowing.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Note: Task 0 (diagnosis) needs the running myworkdrive dev server, so it's best done interactively before handing Tasks 1-6 to subagents.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints for review.

Which approach?
