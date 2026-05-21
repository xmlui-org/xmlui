# Lexical Scoping for computedUses — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace two hardcoded constants in `computedUses.ts` (`DATA_FETCH_HANDLER_INJECTED_KEYS` and `PARENT_STATE_DYNAMIC_VARS`) with a declarative metadata-driven Immutable Scope Propagation mechanism. Unblocks Extension Packages (custom data sources/containers) and eliminates the entire class of silent reactivity bugs caused by missing entries in hardcoded sets.

**Architecture:** A new 4th parameter `injectedVarsScope: ReadonlySet<string>` is threaded immutably through `computeUsesInternal`. Per-event scope is computed in-place inside the events loop (cannot leak horizontally). Per-children scope is computed before recursing into children. Component metadata gains two opt-in fields: `ComponentEventMetadata.injectedVars` (event-scoped) and `ComponentMetadata.childInjectedVars` (children-scoped). Hardcoded constants are removed after Parallel Change verification.

**Tech Stack:** TypeScript, Vitest (unit), Playwright (e2e), React 18, pnpm workspaces, xmlui monorepo.

**Design reference:** [`2026-05-21-lexical-scoping-design.md`](./2026-05-21-lexical-scoping-design.md)

**Branch policy:** All work happens on existing branch `yurii/computedUses`. Per project CLAUDE.md, never create new branches.

---

## Important Discoveries From Pre-Plan Research

1. **The actual type name is `ComponentEventMetadata`** (in `xmlui/src/abstractions/ComponentDefs.ts:334`), NOT `EventDescriptor`. The design spec used `EventDescriptor` as a placeholder name. This plan uses the actual name.

2. **Runtime event keys do NOT carry the `on` prefix.** In `computedUses.ts:432`, the check is `key === "fetch"` (not `"onFetch"`). When adding `injectedVars` to component metadata, the keys in `events: { ... }` are also un-prefixed (e.g., `events: { fetch: { ... } }` for DataSource). Verify per-component during audit.

3. **`node.contextVars` already exists on `ComponentDef`** and is consumed by `computedUses.ts:~390` to seed `localDeclared`. The metadata-propagation mechanism that copies `contextVars` from component metadata onto the ComponentDef is already in place — Task I1.2 below verifies that exact mechanism so Iteration 1 can reuse it.

4. **`isContainerLike`** is imported from `xmlui/src/components-core/rendering/ContainerUtils.ts` — used to gate scope behavior at container boundaries.

5. **`DataSource` is the actual component name**; `DataLoader` appears in code as an alias but has no separate directory. `APICall` is a sibling with its own metadata file (`xmlui/src/components/APICall/`) — Iteration 1 audit must check whether it also receives injected handler vars.

---

## File Structure Summary

| File | Iteration | Action |
|---|---|---|
| `xmlui/src/abstractions/ComponentDefs.ts` | 1 | Add `injectedVars` field to `ComponentEventMetadata` |
| `xmlui/src/abstractions/ComponentDefs.ts` | 2 | Add `childInjectedVars` field to `ComponentMetadata` |
| `xmlui/src/components-core/optimization/computedUses.ts` | 1 + 2 | Add `EMPTY_SET`, 4th parameter, per-event scope, children scope; remove three hardcoded constants |
| `xmlui/src/components/DataSource/DataSource.tsx` | 1 | Add `injectedVars` to fetch event metadata |
| `xmlui/src/components/APICall/APICall.tsx` (if applicable) | 1 | Same |
| `xmlui/src/components/List/List.tsx` | 2 | Add `childInjectedVars` |
| `xmlui/src/components/Items/Items.tsx` | 2 | Add `childInjectedVars` |
| `xmlui/src/components/Table/Table.tsx` | 2 | Add `childInjectedVars` |
| `xmlui/src/components/Select/Select.tsx` | 2 | Add `childInjectedVars` |
| `xmlui/src/components/ContextMenu/*.tsx` | 2 | (verify — `$context` may not need declaration; see design spec §2.5) |
| Audit-discovered container files | 2 | Add `childInjectedVars` |
| `xmlui/tests/components-core/optimization/computedUses.test.ts` | 1 + 2 | Add unit tests U1.1–U1.7 (Iter 1) and U2.1–U2.7 (Iter 2) |
| `xmlui/tests-e2e/computed-uses.spec.ts` | 1 | Add E1 (Bug 21 regression) |
| `xmlui/tests-e2e/computed-uses.spec.ts` | 2 | Add E2 (`$context` reactivity regression) |
| `xmlui/src/components-core/optimization/specs/TODO - computedUses-hardcoded-brittle-spots.md` | 1 + 2 | Mark spots resolved |
| `xmlui/src/components-core/optimization/specs/computed-uses-specification.md` | 2 | Update §4 |

---

## ITERATION 1 — Events Scope (Replaces `DATA_FETCH_HANDLER_INJECTED_KEYS`)

### Task I1.1: Pre-audit — Enumerate loader-like components and their injected vars

**Files:**
- Read-only: `xmlui/src/components/DataSource/DataSource.tsx`, `xmlui/src/components/APICall/APICall.tsx`, plus any other loader-like components found

- [ ] **Step 1: Find every callsite that injects `$`-prefixed vars into a handler context**

Run:
```bash
grep -rn 'injectedContextVars\|\$queryParams\|\$pageParams\|\$url\|\$method\|\$requestBody\|\$requestHeaders' xmlui/src/components/ | grep -v '\.spec\.\|\.test\.\|\.md'
```
Expected: a small set of files (DataSource, APICall, possibly internal loader machinery).

- [ ] **Step 2: For each handler that receives injected vars, list the exact var names**

For each component found in Step 1, open its renderer file and locate the place where it dispatches the handler. Document the EXACT var names being injected, and the EXACT event key the runtime uses (the key passed to `lookupEventHandler` / `executeEventHandler`).

- [ ] **Step 3: Produce the authoritative audit table**

Write the result as a checklist into a temporary scratch file `xmlui/src/components-core/optimization/specs/audit-iter1-injected-vars.md` with format:

```markdown
# Iteration 1 — Authoritative Injected Vars Audit

| Component | Event key (in metadata) | Runtime-injected vars |
|---|---|---|
| DataSource | fetch | $url, $method, $queryParams, $requestBody, $requestHeaders, $pageParams |
| APICall | (TBD per audit) | (TBD per audit) |
| ... | ... | ... |
```

This table is the **authoritative source** for Tasks I1.10 below. Do NOT skip — the design spec's preliminary table is preliminary precisely because this audit must finalize it.

- [ ] **Step 4: Commit the audit**

```bash
git add xmlui/src/components-core/optimization/specs/audit-iter1-injected-vars.md
git commit -m "docs: audit injected vars for Iteration 1 of lexical scoping"
```

---

### Task I1.2: Verify the metadata-propagation mechanism

The optimizer in `computedUses.ts` already consumes `node.contextVars` (see lines ~388–393). That means *something* copies component-metadata `contextVars` onto `ComponentDef.contextVars` before `computeUsesForTree` runs. We need to know what, so we can extend the same mechanism for `events[eventName].injectedVars`.

**Files:**
- Read-only: `xmlui/src/components-core/xmlui-parser.ts`, `xmlui/src/components-core/ComponentRegistry*.ts`, `xmlui/src/components-core/prepare-plan.md` (planning doc that may describe this)

- [ ] **Step 1: Find where `node.contextVars` is populated**

Run:
```bash
grep -rn 'contextVars' xmlui/src/components-core/ | grep -v 'computedUses\.ts\|\.test\.\|\.spec\.\|\.md' | head -30
```
Expected: a parse-time or prepare-time step that walks the ComponentDef tree and assigns `node.contextVars = metadata.contextVars`.

- [ ] **Step 2: Locate the propagation site and read it**

The most likely candidate is a `prepareComponentDef()` helper or a step inside `parseXmlUiMarkup()`. Read the surrounding code to confirm:
  - At what point is the metadata registry available?
  - Is `node.contextVars` set as a raw reference, or copied as keys-only?

- [ ] **Step 3: Plan the extension**

Decide which of these two implementation paths Iteration 1 will take:

  **Path A (preferred if mechanism exists):** Extend the same prepare step to also copy `node.events.<key>.injectedVars` (or a flattened `node.eventInjectedVars: Record<string, readonly string[]>`) from the metadata.

  **Path B (fallback):** Pass a `ComponentRegistry`-like lookup function as a new parameter to `computeUsesForTree` / `computeUsesInternal`, and look up `metadata.events[key].injectedVars` on demand.

Write the decision (3-4 sentences) into `audit-iter1-injected-vars.md` under a new "Implementation Path Decision" section. Path A is preferred (zero new parameter, reuses the established `contextVars` pattern). Pick Path B only if Path A is impossible (e.g., parse-time has no registry access).

- [ ] **Step 4: Commit the decision**

```bash
git add xmlui/src/components-core/optimization/specs/audit-iter1-injected-vars.md
git commit -m "docs: confirm metadata-propagation path for Iteration 1"
```

---

### Task I1.3: Extend `ComponentEventMetadata` type with `injectedVars`

**Files:**
- Modify: `xmlui/src/abstractions/ComponentDefs.ts:334-348`

- [ ] **Step 1: Open and read the existing type**

Read `xmlui/src/abstractions/ComponentDefs.ts` lines 330-350. The existing type:

```typescript
export type ComponentEventMetadata = {
  readonly description: string;
  readonly signature?: string;
  readonly parameters?: Record<string, string>;
};
```

- [ ] **Step 2: Add the new optional field**

Apply edit:

```typescript
export type ComponentEventMetadata = {
  readonly description: string;
  readonly signature?: string;
  readonly parameters?: Record<string, string>;

  /**
   * Names of variables that XMLUI runtime injects into THIS event's handler
   * scope (in addition to standard event args).
   *
   * The computedUses optimizer treats these names as locally scoped within
   * the handler — they will NOT be registered as parent-state dependencies.
   *
   * Example: DataSource's `fetch` injects `$queryParams`, `$pageParams`, etc.
   * Without this declaration, a handler like
   *   onFetch="{ fetch('/api?q=' + $queryParams.q) }"
   * would falsely register `$queryParams` as a parent dependency, causing
   * the loader to re-fetch infinitely when the router updates query params.
   */
  readonly injectedVars?: readonly string[];
};
```

- [ ] **Step 3: TypeScript build sanity check**

Run:
```bash
cd xmlui && pnpm tsc --noEmit
```
Expected: zero errors (the field is optional, no existing callsite breaks).

- [ ] **Step 4: Commit**

```bash
git add xmlui/src/abstractions/ComponentDefs.ts
git commit -m "feat(optimization): add ComponentEventMetadata.injectedVars field

Optional declarative field that lists per-event runtime-injected variable
names. The computedUses optimizer will consume this in Iteration 1 to
replace the hardcoded DATA_FETCH_HANDLER_INJECTED_KEYS Set."
```

---

### Task I1.4: Write failing unit test U1.6 — Fallback path (no metadata declared)

This test pins down behavior BEFORE the new logic ships: a node without `injectedVars` metadata should keep `$queryParams` etc. as parent deps (safe fallback — over-subscribing is safe; under-subscribing breaks reactivity).

**Files:**
- Read-only first: `xmlui/tests/components-core/optimization/computedUses.test.ts` (read lines 1-80 for imports and test helpers)
- Modify: `xmlui/tests/components-core/optimization/computedUses.test.ts` (append at end of file, or inside an existing describe block — match the file's style)

- [ ] **Step 1: Read existing test file structure**

Read `xmlui/tests/components-core/optimization/computedUses.test.ts` lines 1-80. Identify:
  - How `computeUsesForTree` is imported and called in existing tests
  - How test fixtures (synthetic ComponentDef trees) are constructed
  - The assertion style used (`expect(node.computedUses).toEqual([...])` or similar)

- [ ] **Step 2: Write the failing test**

Append to the test file (or insert inside the most logically related describe block). Adapt the fixture-construction style to match the existing file; the body below is a template:

```typescript
describe("lexical scoping — Iteration 1 fallback", () => {
  it("U1.6: a loader-like node without injectedVars metadata keeps $queryParams as a parent dep", () => {
    // No metadata registered → safe fallback: $queryParams is treated as parent dep.
    // (Over-subscribing is safe; under-subscribing breaks reactivity.)
    const root = makeRootContainer({
      vars: { tableQ: { value: "x" } },
      children: [
        makeNode({
          type: "UnknownLoader",  // not in hardcoded set, no metadata
          events: { fetch: "() => fetch('/api?q=' + $queryParams.q + '&t=' + tableQ)" },
        }),
      ],
    });

    computeUsesForTree(root);

    const loader = root.children![0];
    // Loader does not become a container, so its deps bubble to root.
    // We expect $queryParams in root's computedUses (safe fallback).
    expect(root.computedUses).toContain("$queryParams");
    expect(root.computedUses).toContain("tableQ");
  });
});
```

> Note: Replace `makeRootContainer` / `makeNode` with the actual fixture helpers used in the file. If no helpers exist, define inline `ComponentDef` objects literally; see existing tests as the model.

- [ ] **Step 3: Run the test, expect PASS on master (proves the fallback)**

Run:
```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts -t "U1.6"
```
Expected: PASS. (This test pins the pre-existing fallback behavior; it should already pass with no code changes.)

> If it fails, investigate. Either the fixture is wrong, or the legacy hardcode is silently swallowing `$queryParams` for unknown types — in which case understand why before proceeding.

- [ ] **Step 4: Commit**

```bash
git add xmlui/tests/components-core/optimization/computedUses.test.ts
git commit -m "test(optimization): U1.6 pin fallback behavior for unregistered loader-like nodes"
```

---

### Task I1.5: Write failing unit test U1.2 — Extension loader with injectedVars metadata

The headline test for Iteration 1: a custom loader type (not in the hardcoded set), with declared metadata, gets its `$queryParams` correctly filtered.

**Files:**
- Modify: `xmlui/tests/components-core/optimization/computedUses.test.ts`

- [ ] **Step 1: Write the failing test**

Append:

```typescript
describe("lexical scoping — Iteration 1 events", () => {
  it("U1.2: a custom extension loader with metadata.events.fetch.injectedVars filters $queryParams", () => {
    // ARRANGE: register a fake metadata entry for "ExtensionLoader" with
    // an injectedVars declaration on its `fetch` event.
    registerComponentMetadataForTest("ExtensionLoader", {
      events: {
        fetch: {
          description: "test",
          injectedVars: ["$queryParams"],
        },
      },
    });

    const root = makeRootContainer({
      vars: { tableQ: { value: "x" } },
      children: [
        makeNode({
          type: "ExtensionLoader",
          events: { fetch: "() => fetch('/api?q=' + $queryParams.q + '&t=' + tableQ)" },
        }),
      ],
    });

    // ACT
    computeUsesForTree(root);

    // ASSERT: $queryParams is filtered (lexical scope), tableQ remains.
    expect(root.computedUses).not.toContain("$queryParams");
    expect(root.computedUses).toContain("tableQ");
  });
});
```

> Note: `registerComponentMetadataForTest` is a helper that may or may not exist. If it doesn't, create it in the test file (or a sibling test-utils file) as a thin wrapper around whatever metadata-propagation mechanism Task I1.2 identified. Document the helper inline.

- [ ] **Step 2: Run the test, expect FAIL**

Run:
```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts -t "U1.2"
```
Expected: FAIL — `$queryParams` is in `computedUses` because the new logic isn't there yet.

- [ ] **Step 3: Do NOT commit yet** — this test stays in the working tree until the implementation lands together with it (single commit pair).

---

### Task I1.6: Add `EMPTY_SET` constant and 4th parameter to `computeUsesInternal`

**Files:**
- Modify: `xmlui/src/components-core/optimization/computedUses.ts` (around line 60 for constant, line 336 for signature, line 645 + 664 for callsites)

- [ ] **Step 1: Add `EMPTY_SET` module-level constant near the other constants**

Find the block around line 60 (where `COMPUTED_USES_ENABLED` and `IMPLICIT_CONTAINER_COMPONENT_NAMES` live). Insert just below:

```typescript
/**
 * Frozen empty Set used as the default `injectedVarsScope` parameter.
 * The freeze is defensive — guarantees the default is never mutated, even
 * by a buggy callsite.
 */
const EMPTY_SET: ReadonlySet<string> = Object.freeze(new Set<string>());
```

- [ ] **Step 2: Extend `computeUsesInternal` signature**

Locate the signature at ~line 336:

```typescript
function computeUsesInternal(
  node: ComponentDef,
  parentFunctionNames: Set<string> = new Set(),
  disableNarrowing: boolean = false,
): [Set<string>, Set<string>, Set<string>] {
```

Replace with:

```typescript
function computeUsesInternal(
  node: ComponentDef,
  parentFunctionNames: Set<string> = new Set(),
  disableNarrowing: boolean = false,
  injectedVarsScope: ReadonlySet<string> = EMPTY_SET,
): [Set<string>, Set<string>, Set<string>] {
```

- [ ] **Step 3: Thread the new parameter through the recursive call**

Locate `processChildList` (around line 475):

```typescript
const [deps, escapingUIDs, depsReads] = computeUsesInternal(child, childFunctionNames, nextDisableNarrowing);
```

Replace with (Iteration 1 passes scope through unchanged — Iteration 2 will extend it):

```typescript
const [deps, escapingUIDs, depsReads] = computeUsesInternal(
  child,
  childFunctionNames,
  nextDisableNarrowing,
  injectedVarsScope,
);
```

- [ ] **Step 4: Verify TypeScript compiles**

Run:
```bash
cd xmlui && pnpm tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 5: Run existing tests — they must all still pass**

Run:
```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts
```
Expected: every pre-existing test still passes. U1.2 still fails (no logic uses the new param yet). U1.6 still passes.

- [ ] **Step 6: Do NOT commit yet** — combine with Step in I1.7.

---

### Task I1.7: Implement per-event scope filtering (Expand)

**Files:**
- Modify: `xmlui/src/components-core/optimization/computedUses.ts:~388-450` (the events loop area)

- [ ] **Step 1: Locate the events loop**

Find the block around line 430-450:

```typescript
const isDataLoader = node.type === "DataLoader" || node.type === "DataSource";
const events = node.events as Record<string, unknown> | undefined;

const addEvent = (raw: unknown) => { ... };

if (events) {
  for (const [key, raw] of Object.entries(events)) {
    if (isDataLoader && key === "fetch" && raw != null) {
      const { all: fetchAll, reads: fetchReads } = depsOfValue(raw);
      for (const r of fetchAll) {
        const d = rootIdentifier(r);
        if (!DATA_FETCH_HANDLER_INJECTED_KEYS.has(d)) usedHere.add(d);
      }
      for (const r of fetchReads) {
        const d = rootIdentifier(r);
        if (!DATA_FETCH_HANDLER_INJECTED_KEYS.has(d)) usedHereReads.add(d);
      }
    } else {
      addEvent(raw);
    }
  }
}
```

- [ ] **Step 2: Refactor the events loop to use metadata-driven event scope (Expand phase — keep the legacy branch alongside)**

Per the Task I1.2 decision, look up event-level `injectedVars` from the node-attached metadata. The exact accessor depends on Path A vs Path B from Task I1.2. The body below shows Path A (event-injected vars attached at parse-time to `node.eventInjectedVars: Record<string, readonly string[]>`):

```typescript
const isDataLoader = node.type === "DataLoader" || node.type === "DataSource";
const events = node.events as Record<string, unknown> | undefined;
const eventInjectedMap = (node as any).eventInjectedVars as
  | Record<string, readonly string[]>
  | undefined;

const addEvent = (raw: unknown) => { /* unchanged */ };

if (events) {
  for (const [key, raw] of Object.entries(events)) {
    // 1. Compute per-event scope (component scope ∪ event-declared injected vars)
    const eventInjected = eventInjectedMap?.[key] ?? [];
    const eventScope: ReadonlySet<string> = eventInjected.length
      ? new Set([...injectedVarsScope, ...eventInjected])
      : injectedVarsScope;  // reuse parent reference — zero allocation if empty

    // 2. Legacy hardcoded branch — KEEP during Parallel Change; remove in I1.12.
    if (isDataLoader && key === "fetch" && raw != null) {
      const { all: fetchAll, reads: fetchReads } = depsOfValue(raw);
      for (const r of fetchAll) {
        const d = rootIdentifier(r);
        if (!DATA_FETCH_HANDLER_INJECTED_KEYS.has(d) && !eventScope.has(d)) usedHere.add(d);
      }
      for (const r of fetchReads) {
        const d = rootIdentifier(r);
        if (!DATA_FETCH_HANDLER_INJECTED_KEYS.has(d) && !eventScope.has(d)) usedHereReads.add(d);
      }
      continue;
    }

    // 3. New unified path: any event with declared injectedVars uses eventScope.
    if (eventInjected.length > 0 && typeof raw === "string") {
      const { all, reads } = depsOfValue(raw);
      for (const r of all) {
        const d = rootIdentifier(r);
        if (!eventScope.has(d)) usedHere.add(d);
      }
      for (const r of reads) {
        const d = rootIdentifier(r);
        if (!eventScope.has(d)) usedHereReads.add(d);
      }
      continue;
    }

    // 4. Default branch: no injected vars declared → behave as before.
    addEvent(raw);
  }
}
```

> Note: This shape lets both the legacy hardcoded path AND the metadata-driven path coexist temporarily. The legacy branch will be deleted in Task I1.12 after the metadata-driven path is verified.

- [ ] **Step 3: Run U1.2 — expect PASS**

Run:
```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts -t "U1.2"
```
Expected: PASS. The extension loader now correctly filters `$queryParams` via metadata.

- [ ] **Step 4: Run full unit-test file — all must pass**

Run:
```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts
```
Expected: all previously-passing tests still pass.

- [ ] **Step 5: Commit**

```bash
git add xmlui/src/components-core/optimization/computedUses.ts xmlui/tests/components-core/optimization/computedUses.test.ts
git commit -m "feat(optimization): add lexical event scope (Expand step for Iteration 1)

Threads injectedVarsScope as a 4th immutable parameter through
computeUsesInternal. Per-event scope is computed in-place inside the
events loop using ComponentEventMetadata.injectedVars when available.
The legacy DATA_FETCH_HANDLER_INJECTED_KEYS branch is preserved
during the Parallel Change refactor; it will be removed after the
metadata-driven path is verified on built-in loaders."
```

---

### Task I1.8: Write remaining unit tests U1.1, U1.3, U1.4, U1.5, U1.7

These tests guard the 3 critical hot-spots (Scope Leakage, Deep Nesting, Mixed Global/Local) per the design spec §4.3.

**Files:**
- Modify: `xmlui/tests/components-core/optimization/computedUses.test.ts`

- [ ] **Step 1: U1.1 — Built-in DataSource with onFetch using `$queryParams`**

```typescript
it("U1.1: built-in DataSource with fetch handler filters $queryParams via lexical scope", () => {
  registerComponentMetadataForTest("DataSource", {
    events: { fetch: { description: "x", injectedVars: ["$queryParams"] } },
  });
  const root = makeRootContainer({
    vars: { tableQ: { value: "x" } },
    children: [
      makeNode({
        type: "DataSource",
        events: { fetch: "() => fetch('/api?q=' + $queryParams.q + '&t=' + tableQ)" },
      }),
    ],
  });
  computeUsesForTree(root);
  expect(root.computedUses).not.toContain("$queryParams");
  expect(root.computedUses).toContain("tableQ");
});
```

- [ ] **Step 2: U1.3 — Same node has fetch (with `$queryParams` injected) AND onSuccess (using global `$queryParams`)**

```typescript
it("U1.3: a node's other events do NOT inherit fetch's eventScope (no horizontal leak)", () => {
  registerComponentMetadataForTest("DataSource", {
    events: {
      fetch:    { description: "x", injectedVars: ["$queryParams"] },
      success:  { description: "x" /* no injectedVars */ },
    },
  });
  const root = makeRootContainer({
    children: [
      makeNode({
        type: "DataSource",
        events: {
          fetch:   "() => fetch('/api?q=' + $queryParams.q)",
          success: "() => log($queryParams.q)",  // genuine global $queryParams (router)
        },
      }),
    ],
  });
  computeUsesForTree(root);
  // $queryParams must appear in computedUses BECAUSE success uses it as a real dep,
  // even though fetch filters it. The two scopes are independent.
  expect(root.computedUses).toContain("$queryParams");
});
```

- [ ] **Step 3: U1.4 — Two sibling DataSource nodes**

```typescript
it("U1.4: two sibling DataSources do not leak event scope between each other", () => {
  registerComponentMetadataForTest("DataSource", {
    events: { fetch: { description: "x", injectedVars: ["$queryParams"] } },
  });
  const root = makeRootContainer({
    children: [
      makeNode({ type: "DataSource", events: { fetch: "() => fetch('/a?q=' + $queryParams.q)" } }),
      makeNode({ type: "DataSource", events: { fetch: "() => fetch('/b?q=' + $queryParams.q)" } }),
    ],
  });
  computeUsesForTree(root);
  expect(root.computedUses).not.toContain("$queryParams");
});
```

- [ ] **Step 4: U1.5 — Mixed global and event-scoped vars in one expression**

```typescript
it("U1.5: handler mixing scoped ($queryParams) and unscoped ($context) vars filters only the scoped one", () => {
  registerComponentMetadataForTest("DataSource", {
    events: { fetch: { description: "x", injectedVars: ["$queryParams"] } },
  });
  const root = makeRootContainer({
    children: [
      makeNode({
        type: "DataSource",
        events: { fetch: "() => Actions.submit($queryParams, $context)" },
      }),
    ],
  });
  computeUsesForTree(root);
  expect(root.computedUses).not.toContain("$queryParams");
  // $context is NOT declared as injectedVars anywhere → genuine parent dep
  // (Note: until Iteration 2 removes PARENT_STATE_DYNAMIC_VARS, $context is still
  // hardcoded-filtered. This assertion is the strong form; if it fails on Iter 1,
  // mark with .todo and revisit in Iter 2.)
  expect(root.computedUses).toContain("$context");
});
```

- [ ] **Step 5: U1.7 — AST cache reuse does not leak scope**

```typescript
it("U1.7: AST cache reuse between sibling handlers does not leak scope", () => {
  // Same handler source string used by two siblings — the parser cache returns the
  // same AST node both times. The scope filter must still apply independently.
  registerComponentMetadataForTest("DataSource", {
    events: { fetch: { description: "x", injectedVars: ["$queryParams"] } },
  });
  registerComponentMetadataForTest("RegularButton", {
    events: { click: { description: "x" /* no injectedVars */ } },
  });
  const shared = "() => log($queryParams.q)";
  const root = makeRootContainer({
    children: [
      makeNode({ type: "DataSource",     events: { fetch: shared } }),   // scope filters $queryParams
      makeNode({ type: "RegularButton",  events: { click: shared } }),   // no scope — must register
    ],
  });
  computeUsesForTree(root);
  // The DataSource branch filters; the button branch does not → $queryParams must appear.
  expect(root.computedUses).toContain("$queryParams");
});
```

- [ ] **Step 6: Run all U1.x tests**

Run:
```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts -t "U1\\."
```
Expected: all 7 U1.x tests PASS.

> If U1.5 fails on `expect(root.computedUses).toContain("$context")`: this is because `PARENT_STATE_DYNAMIC_VARS` still filters `$context` in Iteration 1. Mark the offending assertion with `.todo` (or rewrite to use a different non-router parent dep like `someVar`) and revisit in Iteration 2 once `PARENT_STATE_DYNAMIC_VARS` is removed.

- [ ] **Step 7: Commit**

```bash
git add xmlui/tests/components-core/optimization/computedUses.test.ts
git commit -m "test(optimization): add U1.1, U1.3, U1.4, U1.5, U1.7 (event scope + hot-spots)"
```

---

### Task I1.9: Add `injectedVars` metadata to built-in `DataSource`

**Files:**
- Modify: `xmlui/src/components/DataSource/DataSource.tsx:~8-` (the `createMetadata({ ... })` call)

- [ ] **Step 1: Locate the events block in `DataSourceMd`**

Open `xmlui/src/components/DataSource/DataSource.tsx`. The `createMetadata({ ... })` call should have an `events: { ... }` section. If it does NOT (currently `DataSource` may declare events implicitly elsewhere), add one:

```typescript
events: {
  fetch: {
    description: "Custom fetch handler invoked instead of XMLUI's default HTTP fetch.",
    injectedVars: ["$url", "$method", "$queryParams", "$requestBody", "$requestHeaders", "$pageParams"],
  },
  // ... any pre-existing event entries ...
},
```

> Use the EXACT names from Task I1.1 audit table.

- [ ] **Step 2: Run DataSource tests**

Run:
```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts
```
Expected: all U1.x pass. Existing tests still pass.

- [ ] **Step 3: Sanity-check DataSource Playwright spec**

Run:
```bash
cd xmlui && pnpm test:e2e -- src/components/DataSource/DataSource.spec.ts
```
Expected: all DataSource e2e tests still pass — this proves the metadata-driven path produces identical runtime behavior.

- [ ] **Step 4: Commit**

```bash
git add xmlui/src/components/DataSource/DataSource.tsx
git commit -m "feat(DataSource): declare injectedVars for fetch event metadata"
```

---

### Task I1.10: Add `injectedVars` to other loader-like built-ins from audit (e.g., APICall)

**Files:**
- Modify: each loader file found in Task I1.1 audit table

- [ ] **Step 1: For EACH loader-like component in the audit table, apply the same change as Task I1.9**

For each row in the audit table (excluding DataSource, already done):
1. Open the component's `*.tsx` file.
2. In the `createMetadata({ events: { ... } })` block, add `injectedVars: [...]` to the relevant event.
3. Run relevant unit tests for that component.
4. Commit as `feat(<Component>): declare injectedVars for <event> metadata`.

> If the audit shows APICall does NOT receive any runtime-injected `$`-vars, skip it and document this in the audit file ("APICall: no injected vars — handler receives standard event args only").

- [ ] **Step 2: Run the full unit suite**

Run:
```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts
```
Expected: all passes. Cumulative state: every built-in loader now has metadata AND the legacy hardcoded branch.

---

### Task I1.11: Run the complete unit-test file and the full e2e baseline

**Goal:** Snapshot a "green before contract" state.

- [ ] **Step 1: Run the entire computedUses unit test file**

Run:
```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts
```
Expected: 100% pass.

- [ ] **Step 2: Run the existing e2e file**

Run:
```bash
cd xmlui && pnpm test:e2e -- tests-e2e/computed-uses.spec.ts
```
Expected: all existing e2e tests pass (no new tests yet — that's Task I1.13).

- [ ] **Step 3: Record baseline numbers**

In a temporary note (`audit-iter1-injected-vars.md` works), record:
- Unit test count for the file
- E2E test count + pass count
- Save the timestamp

This is the "green baseline" against which Task I1.12 (Contract) is judged.

---

### Task I1.12: Remove `DATA_FETCH_HANDLER_INJECTED_KEYS` and `isDataLoader` hardcode (Contract)

**Files:**
- Modify: `xmlui/src/components-core/optimization/computedUses.ts:~150-170` (constant), `~388-450` (isDataLoader branch)

- [ ] **Step 1: Delete the constant**

Remove the entire block (lines ~150-165):

```typescript
const DATA_FETCH_HANDLER_INJECTED_KEYS = new Set([
  "$url",
  "$method",
  "$queryParams",
  "$requestBody",
  "$requestHeaders",
  "$pageParams",
]);
```

- [ ] **Step 2: Delete the `isDataLoader` variable and its branch**

Remove:
```typescript
const isDataLoader = node.type === "DataLoader" || node.type === "DataSource";
```

And the entire `if (isDataLoader && key === "fetch" && raw != null) { ... continue; }` branch from the events loop. The events loop should now read:

```typescript
if (events) {
  for (const [key, raw] of Object.entries(events)) {
    const eventInjected = eventInjectedMap?.[key] ?? [];
    const eventScope: ReadonlySet<string> = eventInjected.length
      ? new Set([...injectedVarsScope, ...eventInjected])
      : injectedVarsScope;

    if (eventInjected.length > 0 && typeof raw === "string") {
      const { all, reads } = depsOfValue(raw);
      for (const r of all) {
        const d = rootIdentifier(r);
        if (!eventScope.has(d)) usedHere.add(d);
      }
      for (const r of reads) {
        const d = rootIdentifier(r);
        if (!eventScope.has(d)) usedHereReads.add(d);
      }
      continue;
    }

    addEvent(raw);
  }
}
```

- [ ] **Step 3: TypeScript build**

Run:
```bash
cd xmlui && pnpm tsc --noEmit
```
Expected: zero errors. If any errors mention `DATA_FETCH_HANDLER_INJECTED_KEYS` or `isDataLoader`, find and remove stale references.

- [ ] **Step 4: Re-run unit tests**

Run:
```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts
```
Expected: 100% pass — same as Task I1.11. The metadata-driven path now does ALL the filtering.

- [ ] **Step 5: Re-run e2e tests**

Run:
```bash
cd xmlui && pnpm test:e2e -- tests-e2e/computed-uses.spec.ts xmlui/src/components/DataSource/DataSource.spec.ts
```
Expected: same pass count as Task I1.11 Step 2.

- [ ] **Step 6: Commit**

```bash
git add xmlui/src/components-core/optimization/computedUses.ts
git commit -m "refactor(optimization): remove DATA_FETCH_HANDLER_INJECTED_KEYS hardcode (Contract step for Iteration 1)

The lexical-scope mechanism in ComponentEventMetadata.injectedVars now
fully replaces the hardcoded Set and the node.type === 'DataLoader' ||
'DataSource' check. Extension Packages can now declare custom loader
components without modifying core."
```

---

### Task I1.13: Write E2E regression test E1 (Bug 21)

**Files:**
- Modify: `xmlui/tests-e2e/computed-uses.spec.ts`

- [ ] **Step 1: Read existing e2e test structure**

Read the first 60 lines of `xmlui/tests-e2e/computed-uses.spec.ts`. Identify:
- How `initTestBed` is imported / used
- The describe/test pattern
- How URL changes are made (`page.goto` / a navigation helper)

- [ ] **Step 2: Write the E1 regression test**

Append to the file (adapt the API style to match existing tests):

```typescript
test.describe("E1: Bug 21 regression — DataSource with $queryParams in fetch", () => {
  test("changing router query params does NOT cause infinite re-fetch", async ({
    initTestBed,
    page,
  }) => {
    let fetchCount = 0;
    await initTestBed(
      `<App>
        <variable name="counter" value="0" />
        <DataSource id="ds"
          onFetch="() => { counter = counter + 1; return 'q=' + $queryParams.q; }" />
        <Text testId="counter" value="{counter}" />
      </App>`,
    );

    // Initial mount fires fetch once.
    await page.waitForFunction(() => {
      const t = document.querySelector('[data-testid="counter"]');
      return t && t.textContent === "1";
    });

    // Navigate to a new query string. Should fire ONE more fetch.
    await page.goto(page.url() + "?q=abc");
    await page.waitForFunction(() => {
      const t = document.querySelector('[data-testid="counter"]');
      return t && t.textContent === "2";
    });

    // Wait for any stray re-fetches.
    await page.waitForTimeout(500);
    const final = await page.locator('[data-testid="counter"]').textContent();

    // Hard assertion: NO additional re-fetches occurred.
    expect(final).toBe("2");
  });
});
```

> Adapt the markup template syntax (`<App>`, `<DataSource>`, `<Text>`) to match how `initTestBed` is used in existing tests. The exact API may differ (e.g., `xmlUiSrc:` prop, JSX-vs-string, etc).

- [ ] **Step 3: Run the new e2e test**

Run:
```bash
cd xmlui && pnpm test:e2e -- tests-e2e/computed-uses.spec.ts -t "Bug 21"
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add xmlui/tests-e2e/computed-uses.spec.ts
git commit -m "test(e2e): E1 regression — DataSource with \$queryParams does not infinite-loop"
```

---

### Task I1.14: Full e2e suite + performance spot-check

- [ ] **Step 1: Run the full e2e suite**

Run:
```bash
cd xmlui && pnpm test:e2e
```
Expected: pass count equal to (or greater than, due to new E1 test) the baseline from Task I1.11. Zero new failures vs. master.

- [ ] **Step 2: Manual performance check**

In a separate terminal:
```bash
cd xmlui && pnpm dev
```

Open the heaviest example page (e.g., `http://localhost:5173/examples/<heavy-dashboard>`). Open Chrome DevTools → Performance → Record cold load. Compare boot time vs. master (you can checkout master in a separate worktree if needed for precise comparison).

Acceptance: boot time within ±5% of master. No visible re-render storms in React Profiler.

- [ ] **Step 3: Document performance result**

Add a short note at the bottom of `audit-iter1-injected-vars.md`:

```markdown
## Performance verification (manual)
- Page tested: <name>
- Boot time master: <ms>
- Boot time this branch: <ms>
- Delta: <%>
- React Profiler: no regressions observed.
- Verified by: <name>, <date>
```

- [ ] **Step 4: Commit**

```bash
git add xmlui/src/components-core/optimization/specs/audit-iter1-injected-vars.md
git commit -m "docs: record Iteration 1 performance verification result"
```

---

### Task I1.15: Update TODO spec marking spot 3 as resolved

**Files:**
- Modify: `xmlui/src/components-core/optimization/specs/TODO - computedUses-hardcoded-brittle-spots.md`

- [ ] **Step 1: Open the TODO doc and locate "3. Loader type checks + DATA_FETCH_HANDLER_INJECTED_KEYS"**

- [ ] **Step 2: Mark it resolved**

Edit the section heading or status line to indicate resolution. Add a small note pointing to this design and plan:

```markdown
## 3. Loader type checks + `DATA_FETCH_HANDLER_INJECTED_KEYS`

**Status:** ✅ RESOLVED — replaced by `ComponentEventMetadata.injectedVars`
in Iteration 1 of the [Lexical Scoping refactor](./2026-05-21-lexical-scoping-design.md).
See [implementation plan](./2026-05-21-lexical-scoping-plan.md).
```

Also update the file's preamble counter from "Currently, there are **3** remaining hardcoded spots" to "Currently, there are **2** remaining hardcoded spots".

- [ ] **Step 3: Commit and prepare PR description**

```bash
git add "xmlui/src/components-core/optimization/specs/TODO - computedUses-hardcoded-brittle-spots.md"
git commit -m "docs: mark hardcoded-spot #3 resolved by Iteration 1"
```

PR title suggestion: `refactor(optimization): replace DATA_FETCH_HANDLER_INJECTED_KEYS with metadata-driven event scope (Iter 1)`

PR description template (in commit message or push body):
```
Implements Iteration 1 of the Lexical Scoping for computedUses refactor
(spec: xmlui/src/components-core/optimization/specs/2026-05-21-lexical-scoping-design.md).

What:
- Adds optional `injectedVars` field to `ComponentEventMetadata`.
- Threads `injectedVarsScope: ReadonlySet<string>` immutably through
  `computeUsesInternal` as the 4th parameter.
- Computes per-event scope in-place inside the events loop.
- Migrates built-in `DataSource` (and [audit-discovered loaders]) to the
  metadata path.
- Removes `DATA_FETCH_HANDLER_INJECTED_KEYS` constant and the
  `node.type === "DataLoader" || "DataSource"` hardcoded branch.

Why:
- Unblocks Extension Packages: custom loader components can now declare
  their injected vars without modifying core computedUses.ts.
- Eliminates a silent-regression class: adding a new fetch-injected var
  is now a one-line metadata change, not a search-and-add in core.

Risk: low. Parallel Change pattern: legacy branch kept until metadata
path verified; full unit + e2e suite green at every step. See plan
Task I1.11 baseline for pre-Contract assertion of green state.

Tests:
- 7 new unit tests U1.1-U1.7 covering all scoping rules and the 3 hot-spots.
- 1 new e2e regression test E1 (Bug 21).
- Full unit + e2e suites pass.
```

---

## ITERATION 2 — Children Scope (Replaces `PARENT_STATE_DYNAMIC_VARS` + `isRuntimeContextVar`)

### Task I2.1: Pre-audit — Enumerate container components and their childInjectedVars

**Files:**
- Read-only: all candidate container components (List, Items, Table, DataGrid, Select, ContextMenu, etc.)

- [ ] **Step 1: Find every component that injects `$`-prefixed vars into children's context**

Run:
```bash
grep -rn 'contextVars=' xmlui/src/components/ | grep -v '\.spec\.\|\.test\.\|\.md' | head -40
```

Also check metadata `contextVars: { ... }` declarations:
```bash
grep -rln 'contextVars: {' xmlui/src/components/
```

Expected: List, Items, Table, DataGrid, Select, ContextMenu, possibly more.

- [ ] **Step 2: For each container, list its exact childInjectedVars**

For each component:
1. Open the React renderer (`*.tsx`).
2. Find the JSX where `contextVars={{ ... }}` is passed to children.
3. Document the EXACT keys.
4. Also check `metadata.contextVars` keys — they should match.

- [ ] **Step 3: Produce the authoritative audit table**

Write to `xmlui/src/components-core/optimization/specs/audit-iter2-child-injected-vars.md`:

```markdown
# Iteration 2 — Authoritative Child Injected Vars Audit

| Component | childInjectedVars |
|---|---|
| List | $item, $index, $isFirst, $isLast |
| Items | $item, $index, $isFirst, $isLast |
| Table | $item, $itemIndex, $row, $rowIndex |
| DataGrid | $item, $row, $rowIndex, $col, $colIndex |
| Select | $item |
| ContextMenu | (see design §2.5 — likely none; $context flows as parent dep) |
| ... | ... |
```

- [ ] **Step 4: Commit**

```bash
git add xmlui/src/components-core/optimization/specs/audit-iter2-child-injected-vars.md
git commit -m "docs: audit child-injected vars for Iteration 2"
```

---

### Task I2.2: Extend `ComponentMetadata` with `childInjectedVars`

**Files:**
- Modify: `xmlui/src/abstractions/ComponentDefs.ts:~374-420` (the `ComponentMetadata` type)

- [ ] **Step 1: Add the new optional field**

Inside the `ComponentMetadata` type, near the existing `contextVars` field, add:

```typescript
/**
 * Names of variables that this component injects into the SCOPE OF ITS
 * CHILDREN at render time (via per-render contextVars, not parent state).
 *
 * The computedUses optimizer adds these to the child scope so children
 * don't treat them as parent-state dependencies.
 *
 * Example: `List` injects `$item`, `$index`, `$isFirst`, `$isLast`,
 * so a template like `<Text value="{$item.name}" />` doesn't register
 * `$item` as a parent dependency.
 *
 * Typically mirrors the keys of {@link contextVars} metadata.
 */
readonly childInjectedVars?: readonly string[];
```

- [ ] **Step 2: TypeScript compile check**

Run:
```bash
cd xmlui && pnpm tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add xmlui/src/abstractions/ComponentDefs.ts
git commit -m "feat(optimization): add ComponentMetadata.childInjectedVars field"
```

---

### Task I2.3: Extend the metadata-propagation mechanism for `childInjectedVars`

> By Task I1.2's decision, the same prepare step that propagates `node.contextVars` should also propagate `node.childInjectedVars` (or whatever shape was chosen in I1.2).

**Files:**
- Modify: the prepare/propagation site identified in Task I1.2 (e.g., `xmlui-parser.ts` or a `prepareComponentDef()` helper)

- [ ] **Step 1: Locate the propagation site (per I1.2 decision)**

- [ ] **Step 2: Add a single line that copies `metadata.childInjectedVars` onto `node.childInjectedVars`**

Pseudo-code:
```typescript
if (metadata?.childInjectedVars?.length) {
  (node as any).childInjectedVars = metadata.childInjectedVars;
}
```

- [ ] **Step 3: TypeScript compile check**

```bash
cd xmlui && pnpm tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add <propagation-file>
git commit -m "feat(parser): propagate metadata.childInjectedVars onto ComponentDef nodes"
```

---

### Task I2.4: Write failing unit tests U2.1, U2.3, U2.6

These three tests cover: basic children-scope filtering (U2.1), `$context` flowing as a parent dep after `PARENT_STATE_DYNAMIC_VARS` removal (U2.3), and extension-component support (U2.6).

**Files:**
- Modify: `xmlui/tests/components-core/optimization/computedUses.test.ts`

- [ ] **Step 1: U2.1 — List child references `$item.name`, container's computedUses should not include `$item`**

```typescript
describe("lexical scoping — Iteration 2 children", () => {
  it("U2.1: List with {$item.name} child filters $item from parent computedUses", () => {
    registerComponentMetadataForTest("List", {
      childInjectedVars: ["$item", "$index", "$isFirst", "$isLast"],
    });
    const root = makeRootContainer({
      vars: { rows: { value: "[]" } },
      children: [
        makeNode({
          type: "List",
          props: { data: "{rows}" },
          children: [
            makeNode({ type: "Text", props: { value: "{$item.name}" } }),
          ],
        }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).not.toContain("$item");
    expect(root.computedUses).toContain("rows");
  });
});
```

- [ ] **Step 2: U2.3 — `$context` flows naturally as a parent dep**

```typescript
it("U2.3: ContextMenu with {$context.label} child includes $context in parent computedUses", () => {
  // ContextMenu has NO childInjectedVars for $context (per design §2.5);
  // $context is dispatched into parent state and must be a real dep.
  registerComponentMetadataForTest("ContextMenu", { /* no childInjectedVars */ });
  registerComponentMetadataForTest("MenuItem", {});
  const root = makeRootContainer({
    children: [
      makeNode({
        type: "ContextMenu",
        children: [
          makeNode({ type: "MenuItem", props: { label: "{$context.label}" } }),
        ],
      }),
    ],
  });
  computeUsesForTree(root);
  expect(root.computedUses).toContain("$context");
});
```

- [ ] **Step 3: U2.6 — Custom extension container with childInjectedVars**

```typescript
it("U2.6: extension component MyCarousel with childInjectedVars filters $slide", () => {
  registerComponentMetadataForTest("MyCarousel", {
    childInjectedVars: ["$slide"],
  });
  const root = makeRootContainer({
    vars: { slides: { value: "[]" } },
    children: [
      makeNode({
        type: "MyCarousel",
        props: { items: "{slides}" },
        children: [
          makeNode({ type: "Text", props: { value: "{$slide.title}" } }),
        ],
      }),
    ],
  });
  computeUsesForTree(root);
  expect(root.computedUses).not.toContain("$slide");
  expect(root.computedUses).toContain("slides");
});
```

- [ ] **Step 4: Run — expect FAIL (logic not yet implemented)**

Run:
```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts -t "U2\\.(1|3|6)"
```
Expected: U2.1 and U2.6 FAIL (children-scope logic not yet added). U2.3 likely FAILS too (because `PARENT_STATE_DYNAMIC_VARS` still filters `$context`).

- [ ] **Step 5: Do NOT commit yet** — combine with implementation in I2.5.

---

### Task I2.5: Implement children-scope logic (Expand)

**Files:**
- Modify: `xmlui/src/components-core/optimization/computedUses.ts:~470-490` (the `processChildList` area)

- [ ] **Step 1: Compute `childScope` before recursing into children**

Locate `processChildList` near line 475. Currently:

```typescript
const processChildList = (children: ComponentDef[]) => {
  for (const child of children) {
    const [deps, escapingUIDs, depsReads] = computeUsesInternal(
      child,
      childFunctionNames,
      nextDisableNarrowing,
      injectedVarsScope,   // ← added in Iter 1
    );
    // ...
  }
};
```

Before the loop, compute the extended scope:

```typescript
const childInjected = (node as any).childInjectedVars as readonly string[] | undefined;
const childScope: ReadonlySet<string> = childInjected && childInjected.length > 0
  ? new Set([...injectedVarsScope, ...childInjected])
  : injectedVarsScope;  // reuse parent reference — zero allocation when not needed

const processChildList = (children: ComponentDef[]) => {
  for (const child of children) {
    const [deps, escapingUIDs, depsReads] = computeUsesInternal(
      child,
      childFunctionNames,
      nextDisableNarrowing,
      childScope,  // ← extended scope flows down
    );
    // ... (unchanged below)
  }
};
```

- [ ] **Step 2: Apply the `injectedVarsScope.has(d)` filter in `keepDep`**

Locate `keepDep` (around line 495-497):

```typescript
const keepDep = (d: string) =>
  !localDeclared.has(d) && !isBuiltinGlobal(d) && !isRuntimeContextVar(d);
```

Replace with (keep `isRuntimeContextVar` during Parallel Change):

```typescript
const keepDep = (d: string) =>
  !localDeclared.has(d) &&
  !isBuiltinGlobal(d) &&
  !injectedVarsScope.has(d) &&
  !isRuntimeContextVar(d);  // legacy — removed in I2.8
```

- [ ] **Step 3: Run U2.1 and U2.6 — expect PASS**

```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts -t "U2\\.(1|6)"
```
Expected: PASS. U2.3 still fails because `isRuntimeContextVar` still filters `$context`.

- [ ] **Step 4: Run full file — all other tests stay green**

```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts
```
Expected: zero regressions; U2.3 still fails.

- [ ] **Step 5: Commit**

```bash
git add xmlui/src/components-core/optimization/computedUses.ts xmlui/tests/components-core/optimization/computedUses.test.ts
git commit -m "feat(optimization): add lexical children scope (Expand step for Iteration 2)"
```

---

### Task I2.6: Add `childInjectedVars` to built-in containers (List, Items, Table, DataGrid, Select)

**Files:**
- Modify: `xmlui/src/components/List/List.tsx`, `xmlui/src/components/Items/Items.tsx`, `xmlui/src/components/Table/Table.tsx`, `xmlui/src/components/Select/Select.tsx`, plus any other from audit (e.g., DataGrid)

- [ ] **Step 1: Add `childInjectedVars` to each `createMetadata({ ... })` call**

For each container, add the field from the audit table. Example for List:

```typescript
export const ListMd = createMetadata({
  status: "stable",
  description: "...",
  childInjectedVars: ["$item", "$index", "$isFirst", "$isLast"],
  // ... rest of metadata
});
```

- [ ] **Step 2: After each file, run the file's own tests**

For List:
```bash
cd xmlui && pnpm test:e2e -- xmlui/src/components/List/List.spec.ts
```

- [ ] **Step 3: Commit per file (or one commit if grouped)**

```bash
git add xmlui/src/components/List/List.tsx
git commit -m "feat(List): declare childInjectedVars metadata"
```

Repeat for each container.

---

### Task I2.7: Write unit tests U2.2, U2.4, U2.5, U2.7

These cover deep nesting (U2.2), sibling isolation (U2.4), mixed scopes (U2.5), and the no-childInjectedVars fallback (U2.7).

**Files:**
- Modify: `xmlui/tests/components-core/optimization/computedUses.test.ts`

- [ ] **Step 1: U2.2 — Deep nesting (Table containing List)**

```typescript
it("U2.2: deeply nested List inside Table composes child scopes correctly", () => {
  registerComponentMetadataForTest("Table", {
    childInjectedVars: ["$item", "$itemIndex", "$row", "$rowIndex"],
  });
  registerComponentMetadataForTest("List", {
    childInjectedVars: ["$item", "$index", "$isFirst", "$isLast"],
  });
  const root = makeRootContainer({
    children: [
      makeNode({
        type: "Table",
        children: [
          makeNode({
            type: "List",
            children: [
              // Both $item (List's) and $row (Table's) are in scope here:
              makeNode({ type: "Text", props: { value: "{$item.label + $row.id}" } }),
            ],
          }),
        ],
      }),
    ],
  });
  computeUsesForTree(root);
  expect(root.computedUses).not.toContain("$item");
  expect(root.computedUses).not.toContain("$row");
});
```

- [ ] **Step 2: U2.4 — Sibling Lists do not leak scope**

```typescript
it("U2.4: two sibling Lists do not leak $item scope between each other", () => {
  registerComponentMetadataForTest("List", {
    childInjectedVars: ["$item", "$index", "$isFirst", "$isLast"],
  });
  const root = makeRootContainer({
    vars: { a: { value: "[]" }, b: { value: "[]" } },
    children: [
      makeNode({
        type: "List", props: { data: "{a}" },
        children: [ makeNode({ type: "Text", props: { value: "{$item.x}" } }) ],
      }),
      makeNode({
        type: "List", props: { data: "{b}" },
        children: [ makeNode({ type: "Text", props: { value: "{$item.y}" } }) ],
      }),
    ],
  });
  computeUsesForTree(root);
  expect(root.computedUses).not.toContain("$item");
  expect(root.computedUses).toContain("a");
  expect(root.computedUses).toContain("b");
});
```

- [ ] **Step 3: U2.5 — Mixed: DataSource inside List handler uses both `$item` (children scope) and `$queryParams` (event scope)**

```typescript
it("U2.5: handler inside List using both $item and $queryParams filters both via their respective scopes", () => {
  registerComponentMetadataForTest("List", {
    childInjectedVars: ["$item", "$index", "$isFirst", "$isLast"],
  });
  registerComponentMetadataForTest("DataSource", {
    events: { fetch: { description: "x", injectedVars: ["$queryParams"] } },
  });
  const root = makeRootContainer({
    children: [
      makeNode({
        type: "List",
        children: [
          makeNode({
            type: "DataSource",
            events: { fetch: "() => fetch('/api/' + $item.id + '?q=' + $queryParams.q)" },
          }),
        ],
      }),
    ],
  });
  computeUsesForTree(root);
  expect(root.computedUses).not.toContain("$item");
  expect(root.computedUses).not.toContain("$queryParams");
});
```

- [ ] **Step 4: U2.7 — Container without childInjectedVars (fallback)**

```typescript
it("U2.7: container without childInjectedVars metadata leaves child scope unchanged", () => {
  registerComponentMetadataForTest("Stack", { /* no childInjectedVars */ });
  const root = makeRootContainer({
    vars: { x: { value: "1" } },
    children: [
      makeNode({
        type: "Stack",
        children: [
          makeNode({ type: "Text", props: { value: "{x}" } }),
        ],
      }),
    ],
  });
  computeUsesForTree(root);
  expect(root.computedUses).toContain("x");
});
```

- [ ] **Step 5: Run all U2.x**

```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts -t "U2\\."
```
Expected: U2.1, U2.2, U2.4, U2.5, U2.6, U2.7 PASS. U2.3 still fails (waiting for I2.8).

- [ ] **Step 6: Commit**

```bash
git add xmlui/tests/components-core/optimization/computedUses.test.ts
git commit -m "test(optimization): add U2.2, U2.4, U2.5, U2.7 (deep nesting, sibling isolation, mixed scopes, fallback)"
```

---

### Task I2.8: Remove `PARENT_STATE_DYNAMIC_VARS`, `isRuntimeContextVar`, and dependent filter chains (Contract)

**Files:**
- Modify: `xmlui/src/components-core/optimization/computedUses.ts:~70-180` (constants block), `~495-530` (keepDep + parentDependencies filters)

- [ ] **Step 1: Delete the `PARENT_STATE_DYNAMIC_VARS` constant**

Remove (lines ~140-150):

```typescript
const PARENT_STATE_DYNAMIC_VARS = new Set(["$context"]);
```

(Including the block comment above it.)

- [ ] **Step 2: Delete the `isRuntimeContextVar` function**

Remove (lines ~170-175):

```typescript
const isRuntimeContextVar = (name: string): boolean =>
  name.startsWith("$") &&
  !ROUTING_STATE_KEYS.has(name) &&
  !PARENT_STATE_DYNAMIC_VARS.has(name);
```

- [ ] **Step 3: Update `keepDep` — remove the legacy `isRuntimeContextVar` check**

Locate `keepDep` (now at line ~495):

```typescript
const keepDep = (d: string) =>
  !localDeclared.has(d) &&
  !isBuiltinGlobal(d) &&
  !injectedVarsScope.has(d) &&
  !isRuntimeContextVar(d);  // ← remove this line
```

Result:

```typescript
const keepDep = (d: string) =>
  !localDeclared.has(d) &&
  !isBuiltinGlobal(d) &&
  !injectedVarsScope.has(d);
```

- [ ] **Step 4: Remove the two `parentDependencies.filter(...)` chains**

Locate lines ~519 and ~527:

```typescript
[...parentDependencies].filter((d) => !PARENT_STATE_DYNAMIC_VARS.has(d)),
// ...
[...parentDependenciesReads].filter((d) => !PARENT_STATE_DYNAMIC_VARS.has(d)),
```

Replace with the unfiltered arrays (per design §3.2 — confirmed in user review that these chains should be removed entirely):

```typescript
[...parentDependencies],
// ...
[...parentDependenciesReads],
```

> Rationale (from design review): once lexical scope filters scoped names earlier in the pipeline, `parentDependencies` no longer contains `PARENT_STATE_DYNAMIC_VARS` members, so the filter is a no-op. Removing simplifies the code.

- [ ] **Step 5: TypeScript compile check**

```bash
cd xmlui && pnpm tsc --noEmit
```
Expected: zero errors. If any error mentions `PARENT_STATE_DYNAMIC_VARS` or `isRuntimeContextVar`, find and remove the stale reference.

- [ ] **Step 6: Run U2.3 — expect PASS**

```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts -t "U2\\.3"
```
Expected: PASS. `$context` now flows as a genuine parent dep.

- [ ] **Step 7: Run the full unit-test file**

```bash
cd xmlui && pnpm vitest run tests/components-core/optimization/computedUses.test.ts
```
Expected: 100% PASS. If U1.5's `expect(root.computedUses).toContain("$context")` was `.todo`'d in Iteration 1, un-`.todo` it now — it should pass.

- [ ] **Step 8: Commit**

```bash
git add xmlui/src/components-core/optimization/computedUses.ts xmlui/tests/components-core/optimization/computedUses.test.ts
git commit -m "refactor(optimization): remove PARENT_STATE_DYNAMIC_VARS + isRuntimeContextVar (Contract step for Iteration 2)

The lexical-scope mechanism in ComponentMetadata.childInjectedVars now
fully replaces the hardcoded Set and the isRuntimeContextVar function.
The two filter chains in parentDependencies/parentDependenciesReads
(which post-filtered PARENT_STATE_DYNAMIC_VARS) are also removed —
they were defending against a no-longer-possible case.

\$context now flows as a real parent dep through the same path as any
other parent-state variable, restoring full reactivity for components
that read it (e.g., ContextMenu customRender)."
```

---

### Task I2.9: Write E2E regression test E2 ($context reactivity)

**Files:**
- Modify: `xmlui/tests-e2e/computed-uses.spec.ts`

- [ ] **Step 1: Write E2**

```typescript
test.describe("E2: $context reactivity regression (after PARENT_STATE_DYNAMIC_VARS removal)", () => {
  test("ContextMenu customRender re-runs when $context changes between opens", async ({
    initTestBed, page,
  }) => {
    await initTestBed(
      `<App>
        <ContextMenu id="cm">
          <property name="customRender">
            <Text testId="ctx" value="{$context.label}" />
          </property>
        </ContextMenu>
        <Button testId="b1" onClick="cm.openAt({ label: 'first' })" />
        <Button testId="b2" onClick="cm.openAt({ label: 'second' })" />
      </App>`,
    );

    await page.getByTestId("b1").click();
    await expect(page.getByTestId("ctx")).toHaveText("first");

    await page.getByTestId("b2").click();
    await expect(page.getByTestId("ctx")).toHaveText("second");
  });
});
```

> Adapt API (e.g., `ContextMenu` activation API) to match how it actually works in this codebase. Read existing `ContextMenu/*.spec.ts` for the exact pattern.

- [ ] **Step 2: Run**

```bash
cd xmlui && pnpm test:e2e -- tests-e2e/computed-uses.spec.ts -t "E2"
```
Expected: PASS.

- [ ] **Step 3: Run the full e2e suite**

```bash
cd xmlui && pnpm test:e2e
```
Expected: pass count ≥ baseline; zero regressions.

- [ ] **Step 4: Performance spot-check (same as I1.14)**

Record into `audit-iter2-child-injected-vars.md`.

- [ ] **Step 5: Commit**

```bash
git add xmlui/tests-e2e/computed-uses.spec.ts xmlui/src/components-core/optimization/specs/audit-iter2-child-injected-vars.md
git commit -m "test(e2e): E2 regression — \$context reactivity after PARENT_STATE_DYNAMIC_VARS removal"
```

---

### Task I2.10: Update spec docs

**Files:**
- Modify: `xmlui/src/components-core/optimization/specs/TODO - computedUses-hardcoded-brittle-spots.md`
- Modify: `xmlui/src/components-core/optimization/specs/computed-uses-specification.md` (Section 4)

- [ ] **Step 1: Mark spot 2 resolved in TODO doc**

Same shape as I1.15. Update the preamble counter from "2 remaining hardcoded spots" to "1 remaining hardcoded spot" (only `IMPLICIT_CONTAINER_COMPONENT_NAMES` remains, out of scope for this work).

- [ ] **Step 2: Update `computed-uses-specification.md` §4 — Architectural Decisions**

Locate the section that describes `PARENT_STATE_DYNAMIC_VARS` (the "Фільтрація динамічних змінних" subsection). Replace with a description of the new lexical scoping mechanism:

```markdown
### Lexical Scope for Injected Variables

`computeUsesInternal` threads `injectedVarsScope: ReadonlySet<string>`
as its 4th immutable parameter. Two metadata fields drive scope extension:

- `ComponentEventMetadata.injectedVars` — names injected by the runtime
  into a single event handler. Extended in-place inside the events loop
  to produce a per-event `eventScope`. Does not propagate to siblings
  or children.
- `ComponentMetadata.childInjectedVars` — names injected by the runtime
  into the rendered scope of this component's children. Extended before
  recursing into children to produce a `childScope`. Flows down the tree.

Both lookups have a safe default (`undefined → []`): components without
metadata declarations behave exactly as before (over-subscribing, never
under-subscribing).

Variables matching no scope (e.g., `$context` from `ContextMenu.openAt()`)
flow naturally into `computedUses` as genuine parent-state dependencies.
```

- [ ] **Step 3: Commit**

```bash
git add "xmlui/src/components-core/optimization/specs/TODO - computedUses-hardcoded-brittle-spots.md" xmlui/src/components-core/optimization/specs/computed-uses-specification.md
git commit -m "docs: mark hardcoded-spot #2 resolved; document lexical scope in §4"
```

PR title suggestion: `refactor(optimization): replace PARENT_STATE_DYNAMIC_VARS with metadata-driven children scope (Iter 2)`

PR description template (same shape as Iter 1, with appropriate scope adjustments).

---

## Cleanup After Both Iterations

### Task C1: Remove audit scratch files (optional, after both PRs merge)

The two audit files (`audit-iter1-injected-vars.md`, `audit-iter2-child-injected-vars.md`) served their purpose. They can either:
- Stay as historical record (recommended — they document the final lists).
- Be deleted in a small follow-up commit if the team prefers a clean specs folder.

Either choice is fine. If kept, link them from the main design doc's §5.4 audit-tasks list.

---

## Self-Review Summary

After writing this plan, I checked the design spec against the tasks:

1. **Spec §1 (Architecture):** Implemented across Tasks I1.6, I2.5 (signature extension, scope threading), I1.7 (per-event scope), I2.5 (per-children scope). ✅
2. **Spec §2 (Metadata API):** Tasks I1.3 (events field), I2.2 (children field). ✅
3. **Spec §3 (Algorithm per Iteration):** Direct match — Tasks I1.6–I1.12 = Iteration 1, Tasks I2.2–I2.8 = Iteration 2. ✅
4. **Spec §4 (Testing):** Tasks I1.4, I1.5, I1.8 cover U1.1–U1.7. Tasks I2.4, I2.7 cover U2.1–U2.7. Tasks I1.13, I2.9 cover E1, E2. ✅
5. **Spec §5 (Migration & rollback):** Tasks I1.1, I2.1 are the pre-iteration audits. Each PR is independently revertable. ✅
6. **Spec §6 (Summary):** All listed files appear in tasks above. ✅

**One area requiring engineer judgment:**
- Task I1.2 (metadata-propagation mechanism research) cannot be fully prescribed without running the search first. The two paths (A: extend prepare step; B: pass registry parameter) are both viable; the engineer picks based on what exists. All subsequent tasks reference "per Task I1.2 decision" where this matters.

**Names used consistently throughout:**
- Type: `ComponentEventMetadata.injectedVars` (singular field name)
- Type: `ComponentMetadata.childInjectedVars`
- Parameter: `injectedVarsScope: ReadonlySet<string>`
- Sentinel: `EMPTY_SET`
- Per-event local: `eventScope`
- Per-children local: `childScope`
- Node-attached map (Path A): `node.eventInjectedVars: Record<string, readonly string[]>` and `node.childInjectedVars: readonly string[]`
