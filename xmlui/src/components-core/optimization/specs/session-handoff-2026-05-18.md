# Session Handoff — 2026-05-18

> Branch: `yurii/computedUses`  
> Last work: debugging and fixing Group A e2e test failures (`open-a-context-menu-on-right-click.spec.ts`)  
> Status: **6/7 тестів GROUP A ПРОВАЛЕНО — фікс незавершений, є нова гіпотеза куди копати**

---

## 1. Background

The `computedUses` optimization narrows the `parentState` passed to each container to only the keys its subtree actually reads. Without this optimization, every parent state change re-renders all children. This is correct, but the **static analysis** had gaps that caused e2e test failures.

---

## 2. The Problem Being Solved

### Group A: `open-a-context-menu-on-right-click.spec.ts` (all 6 tests fail)

**Symptom:** Right-clicking a card does nothing — the context menu never opens. Even the simplest test ("right-clicking a card opens the context menu with all actions") fails.

### Root Cause (found via Playwright trace logs)

Three independent bugs interacted:

#### Bug 1 — `confirm` leaking into `computedUses`

The XMLUI handler for the Delete menu item calls `confirm(...)` (XMLUI's built-in dialog function, provided via `appContext`). The static analyzer saw `confirm` as an identifier and treated it as a **parent-state dependency**.

`confirm` is NOT in `JS_STDLIB_GLOBALS`, so it was NOT filtered → it appeared in the App container's `parentDependencies` → `App.computedUses = ['confirm']` → `extractScopedState(Fragment.state, ['confirm']) = {}` → App container received **empty parent state** → `projectMenu` (the ContextMenu API) never reached the Items/Card containers → the `onContextMenu` handler had `projectMenu = undefined` → calling `undefined.openAt(...)` failed silently.

**Fix:** Add `confirm` to a new `XMLUI_APPCONTEXT_GLOBALS` set in `computedUses.ts`. This set is ANDed into `isBuiltinGlobal()`.

#### Bug 2 — `$context` cascading into `computedUses` of ancestor containers

ContextMenu uses `openAt(e, item)` to store `$context`. Because ContextMenu is an **implicit container**, `updateState({ $context: item })` dispatches to the parent (App → Fragment). `$context` ends up in Fragment's state.

For ContextMenu to re-render when `$context` changes, `$context` must be in ContextMenu's `computedUses`. The `isRuntimeContextVar` filter was blocking it.

**Fix (partial):** Add `$context` to `PARENT_STATE_DYNAMIC_VARS` set so it is NOT filtered by `isRuntimeContextVar`. But naively doing this caused `$context` to cascade up to App's `parentDeps` → same empty-stateFromOutside problem as Bug 1.

**Additional fix required:**
- `$context` should appear in ContextMenu's `computedUses` (so it re-renders when `$context` changes) but should **NOT** propagate to its parent container's deps.
- When a container returns `[parentDependencies, escapingUIDs]` to its parent, `PARENT_STATE_DYNAMIC_VARS` must be filtered from `propagatedDeps` (the part that goes into the parent's `childDeps`).
- `isImplicitDefault` check must use `nonDynamicParentDeps.size > 0` instead of `parentDependencies.size > 0` — so that a component like `<Select>` with only `$context` as a dep is NOT promoted to an implicit container (which would produce `computedUses=['$context']` → `stateFromOutside={}` → broken).

#### Bug 3 — `stateRef` staleness when Container is memo-blocked

Even after `$context` is properly propagated via `computedUses`, event handlers (like `onClick="lastAction = 'Edit: ' + $context.name"`) still need access to `$context` at the time they **execute**. 

When the Container is memo-blocked between the time it last rendered and when the handler fires, `stateRef.current` may be stale. The `fullParentStateRef.current` (mutated by ComponentWrapper on every parent render) IS always fresh.

**Fix:** In `createEventHandlers` (`event-handlers.ts`), before executing any handler (`runCodeAsync` or `runCodeSync`), call `refreshStateRef()` which does:
```ts
stateRef.current = { ...fullParentStateRef.current, ...componentStateRef.current };
```
`componentStateRef` is a render-phase-updated ref added to Container to always track the latest `componentState`.

---

## 3. All Changes Made This Session

### Files Modified

#### `xmlui/src/components-core/optimization/computedUses.ts`

**Change 1 — `XMLUI_APPCONTEXT_GLOBALS` (new set):**
```ts
const XMLUI_APPCONTEXT_GLOBALS = new Set([
  "confirm",
  // Only add names that are UNAMBIGUOUSLY XMLUI-reserved and never user variable names.
  // Do NOT add toast, navigate, error, success etc — users may have components/vars with those names.
]);

const isBuiltinGlobal = (name: string): boolean =>
  JS_STDLIB_GLOBALS.has(name) || XMLUI_APPCONTEXT_GLOBALS.has(name);
```

**Change 2 — `PARENT_STATE_DYNAMIC_VARS` (new set):**
```ts
// $context is dispatched to parent state via ContextMenu's implicit container chain.
// It lives in parent state and must NOT be filtered by isRuntimeContextVar.
const PARENT_STATE_DYNAMIC_VARS = new Set(["$context"]);

const isRuntimeContextVar = (name: string): boolean =>
  name.startsWith("$") &&
  !ROUTING_STATE_KEYS.has(name) &&
  !PARENT_STATE_DYNAMIC_VARS.has(name);
```

**Change 3 — `nonDynamicParentDeps` and modified `isImplicitDefault`:**
```ts
const nonDynamicParentDeps = new Set(
  [...parentDependencies].filter((d) => !PARENT_STATE_DYNAMIC_VARS.has(d)),
);

// Use nonDynamicParentDeps so that implicit containers are not promoted
// purely because of a dynamic var dependency ($context etc.)
const isImplicitDefault = IMPLICIT_CONTAINER_COMPONENT_NAMES.has(node.type) && nonDynamicParentDeps.size > 0;
```

**Change 4 — Container returns `propagatedDeps` (not full parentDependencies) to parent:**
```ts
// After computing myEscapingUID, before return:
const propagatedDeps = nonDynamicParentDeps; // $context filtered out — does not cascade
return [propagatedDeps, myEscapingUID];
```
This ensures `$context` appears in ContextMenu's `computedUses` but does NOT go into App's `childDeps` and thus NOT into App's `computedUses`.

**Change 5 — Dev logging (TEMPORARY — should be removed before merge):**
```ts
// In the `if (node.uses === undefined && parentDependencies.size > 0 ...)` block:
if (process.env.NODE_ENV === "development") {
  const label = node.uid ? `${node.type}#${node.uid}` : node.type;
  console.log(`[computedUses] ${label}: ${JSON.stringify(node.computedUses)}`);
}
```

---

#### `xmlui/src/components-core/rendering/Container.tsx`

**Change 1 — `componentStateRef` (new ref):**
```ts
const componentStateRef = useRef<Record<string, any>>(componentState);
componentStateRef.current = componentState; // render-phase update (idempotent)
```

**Change 2 — Pass `componentStateRef` and `fullParentStateRef` to `createEventHandlers`:**
```ts
const { runCodeAsync, runCodeSync } = createEventHandlers({
  // ...existing config...
  componentStateRef,   // NEW
  fullParentStateRef,  // NEW (was not passed before)
  // ...
});
```

**Change 3 — Dev logging in layout effect (TEMPORARY — should be removed before merge):**
```ts
useIsomorphicLayoutEffect(() => {
  const fp = fullParentStateRef?.current;
  stateRef.current = fp ? { ...fp, ...componentState } : componentState;
  if (process.env.NODE_ENV === "development") {
    const keys = Object.keys(stateRef.current);
    const label = node.uid ? `...` : `...`;
    const hasProjectMenu = keys.includes("projectMenu");
    const hasProjects = keys.includes("projects");
    if (hasProjectMenu || hasProjects || "$context" in stateRef.current || keys.includes("lastAction")) {
      console.log(`[stateRef] ${label}: hasProjectMenu=${hasProjectMenu} ...`);
    }
  }
}, [componentState, fullParentStateRef]);
```

---

#### `xmlui/src/components-core/container/event-handlers.ts`

**Change 1 — New optional fields in `EventHandlerConfig`:**
```ts
componentStateRef?: React.MutableRefObject<Record<string, any>>;
fullParentStateRef?: React.MutableRefObject<Record<string, any> | undefined>;
```

**Change 2 — `refreshStateRef()` function (new):**
```ts
const refreshStateRef = () => {
  const fp = fullParentStateRef?.current;
  if (fp && componentStateRef) {
    stateRef.current = { ...fp, ...componentStateRef.current };
  }
};
```

**Change 3 — Call `refreshStateRef()` at start of `runCodeAsync` and `runCodeSync`:**
```ts
// In runCodeAsync, before getComponentStateClone():
refreshStateRef();

// In runCodeSync, before const evalContext:
refreshStateRef();
```

---

#### `xmlui/src/components-core/rendering/StateContainer.tsx`

**Change — Dev logging in Layer 1 (TEMPORARY):**
```ts
const stateFromOutside = useShallowCompareMemoize(
  useMemo(
    () => {
      const scoped = extractScopedState(parentState, node.uses ?? node.computedUses);
      if (process.env.NODE_ENV === "development" && (node.uses || node.computedUses)) {
        // logs dropped keys
        console.log(`[stateFromOutside] ...`);
      }
      return scoped;
    },
    [node.uses, node.computedUses, parentState],
  ),
);
```

---

#### `xmlui/src/components/ContextMenu/ContextMenuReact.tsx`

**Change — Dev logging in `openAt` (TEMPORARY):**
```ts
console.log("[ContextMenu.openAt] called, context=", JSON.stringify(context), "updateState=", typeof updateState);
```

---

#### `xmlui/tests/components-core/optimization/computedUses.test.ts`

**Changes:**
1. Updated Баг 17 section description (removed `$context` from "filtered" list since it's now in `PARENT_STATE_DYNAMIC_VARS`)
2. Removed `$context` from the `it.each([...])` "filtered out" test list
3. Added new tests:
   - `"$context IS kept in computedUses when mixed with real deps"` — verifies `$context` appears when there are other deps
   - `"$context alone does NOT make an implicit container"` — verifies Select with only `$context` dep gets no computedUses
   - `"$context does NOT cascade to grandparent"` — verifies the propagation stop behavior

---

## 4. Current State (what was proven vs. what's unproven)

### Proven (via unit tests)
- All 64 computedUses unit tests pass ✓
- All 9593+ total unit tests pass ✓
- `confirm` is now filtered → App no longer gets `computedUses=['confirm']`
- `$context` appears in ContextMenu-like container's `computedUses` when other deps exist
- `$context` does NOT cascade to parent container's deps
- `refreshStateRef()` logic is correct

### From Playwright trace analysis
After Bug 1 fix (`confirm` in `XMLUI_APPCONTEXT_GLOBALS`):
- `App.computedUses = ['$context']` (before Bug 2/3 fix) → still stateFromOutside={}
- After ALL fixes: App should have `computedUses = undefined` → full Fragment state flows → `projectMenu` reaches Items/Card

### NOT yet confirmed
- The Playwright e2e tests for Group A — **were about to run but session ended**
- Whether `$context` in ContextMenu's rendering context works correctly after all fixes
- Whether `refreshStateRef()` correctly resolves the handler staleness for inner Containers

---

## 5. What To Do Next (for continuing AI)

### Step 1: Run Group A tests
```bash
npx playwright test xmlui/tests-e2e/how-to-examples/open-a-context-menu-on-right-click.spec.ts --project=xmlui-nonsmoke
```

### Step 2: Analyze trace if still failing
```bash
find ./test-results -name 'trace.zip' | head -1 | while read f; do
  unzip -p "$f" | python3 -c "
import sys, json
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    try:
        e = json.loads(line)
        if e.get('type') == 'console' and 'stateRef' in e.get('text',''):
            print(e['text'][:300])
    except: pass
  " 2>/dev/null
done
```

Check the trace output for:
- Does `App` still have `computedUses`? (Should now be `undefined`)
- Does `Card` have `hasProjectMenu=true`? (Must be true for handler to work)
- After right-click: does `[ContextMenu.openAt]` log appear?

### Step 3: If more `XMLUI_APPCONTEXT_GLOBALS` needed
Inspect the trace for `computedUses=[...]` logs on App. If any non-state names appear (besides `$context`), add them to `XMLUI_APPCONTEXT_GLOBALS` in `computedUses.ts`.

### Step 4: Run all Group A–F failing tests
```bash
npx playwright test \
  xmlui/tests-e2e/how-to-examples/open-a-context-menu-on-right-click.spec.ts \
  xmlui/src/components/Table/Table.spec.ts \
  xmlui/src/components/DataSource/DataSource.spec.ts \
  xmlui/tests-e2e/how-to-examples/cancel-a-deferred-api-operation.spec.ts \
  xmlui/tests-e2e/how-to-examples/handle-background-operations.spec.ts \
  xmlui/tests-e2e/how-to-examples/delay-a-datasource-until-another-datasource-is-ready.spec.ts \
  xmlui/tests-e2e/how-to-examples/enable-multi-row-selection-in-a-table.spec.ts \
  --project=xmlui-nonsmoke 2>&1 | tail -30
```

### Step 5: After all tests pass — REMOVE debug logs
These files have TEMPORARY `console.log` statements to remove before merging:
- `xmlui/src/components-core/optimization/computedUses.ts` — `[computedUses]` log
- `xmlui/src/components-core/rendering/StateContainer.tsx` — `[stateFromOutside]` log  
- `xmlui/src/components-core/rendering/Container.tsx` — `[stateRef]` log
- `xmlui/src/components/ContextMenu/ContextMenuReact.tsx` — `[ContextMenu.openAt]` log

---

## 6. Key Architecture Understanding

### The testbed wrapping structure
The Playwright testbed wraps the howto `<App>` component inside multiple containers: `Fragment` (outermost testbed container) > `Theme#root` > (optional others) > howto App.

The howto `<App>` is **implicit** (no `uses` property, `type != "Container"`). Its `dispatch` and `registerComponentApi` bubble up to the first explicit container — which is the testbed's **Fragment** container. This means:
- ContextMenu's API (`projectMenu`) registers in **Fragment's** `componentApis`, not App's
- `$context` (dispatched by `openAt`) goes into **Fragment's** state, not App's

For `projectMenu` to reach Items/Card: App must have **no `computedUses`** (so `stateFromOutside = Fragment.state (full)`, which has `projectMenu`). Any `computedUses` on App that doesn't include `projectMenu` will drop it.

### The cascade problem
`confirm` (appContext function) and `$context` both appeared in App's `parentDeps`, giving App `computedUses = ['confirm', '$context']` (or just `['confirm']`). Neither is in Fragment's state initially → `stateFromOutside = {}` → App isolated from Fragment → `projectMenu` lost → handler fails.

### The `$context` rendering problem (ContextMenu)
ContextMenu has `computedUses = ['lastAction']`. When `openAt` sets `$context` in Fragment's state, ContextMenu's `scopedParentState = { lastAction }` (unchanged). ContainerWrapper is memo-blocked. `customRender` is NOT called with fresh state. Inner Container for MenuItems gets `contextVars: { $context: undefined }`. Menu items render without `$context`.

With the fix: ContextMenu's `computedUses = ['lastAction', '$context']`. When Fragment's state gets `$context: item`, `scopedParentState = { lastAction, $context: item }` — CHANGED → ContainerWrapper re-renders → `customRender` gets fresh `state.$context` → inner Container has correct `$context`.

---

## 7. Files Status Summary

| File | Change Type | Remove Before Merge |
|------|-------------|---------------------|
| `computedUses.ts` | Logic fix + dev log | Remove `[computedUses]` console.log |
| `Container.tsx` | Logic fix + dev log | Remove `[stateRef]` console.log |
| `StateContainer.tsx` | Dev log only | Remove entire `[stateFromOutside]` log block |
| `event-handlers.ts` | Logic fix | No logs — keep all logic |
| `ContainerWrapper.tsx` | None (from prev session) | — |
| `ContainerUtils.ts` | None (from prev session) | — |
| `ContextMenuReact.tsx` | Dev log only | Remove `[ContextMenu.openAt]` console.log |
| `computedUses.test.ts` | Test updates | Keep all new tests |

---

## 8. Previous Session Fixes (already landed, not to re-do)

These were fixed in earlier sessions and are already in the branch:

1. **P1** — `Container.tsx`: `useRef(componentState)` + layout effect merge (avoid wasted spread on every render)
2. **P2** — `hooks.tsx`: `value !== ref.current &&` guard in `useShallowCompareMemoize` (O(N) fast-path)
3. **B2/D1** — `ContainerUtils.ts`: unified `isContainerLike` function (runtime and static analysis had different definitions)

---

## 9. e2e Failure Groups Reference

From `e2e-failures-2026-05-16.md`:

| Group | File | Count | Root Cause |
|-------|------|-------|-----------|
| A | `open-a-context-menu-on-right-click.spec.ts` | 6 | **THIS SESSION** — `confirm`/`$context` computedUses cascade |
| B | `Table.spec.ts` (refreshOn section) | 3 | stale event handler closures |
| C | `DataSource.spec.ts` | 1 | `$url`, `$method` runtime context vars |
| D | `cancel-a-deferred-api-operation.spec.ts`, `handle-background-operations.spec.ts` | 4 | async state gating |
| E | `delay-a-datasource-until-another-datasource-is-ready.spec.ts` | 2 | DataSource dependency chain |
| F | `enable-multi-row-selection-in-a-table.spec.ts` | 2 | multi-row selection stale state |
| G | `Tree-loaded-field.spec.ts` | 3 | Tree loaded field (may be unrelated) |

---

## 10. АКТУАЛЬНИЙ СТАН ПІСЛЯ ЗАПУСКУ ТЕСТІВ (результат останнього запуску)

### Результат запуску Group A
```
npx playwright test xmlui/tests-e2e/how-to-examples/open-a-context-menu-on-right-click.spec.ts --project=xmlui-nonsmoke
```
**6 failed, 1 passed** — той самий результат що й до всіх змін цієї сесії.

### Що показав Playwright trace (ключові console.log)

```
[stateRef] Card: hasProjectMenu=false hasProjects=true $context=undefined computedUses=undefined keys=10
[stateRef] App:  hasProjectMenu=false hasProjects=true $context=undefined computedUses=["$context"] keys=7
...
[stateRef] App:  hasProjectMenu=true  hasProjects=true $context=undefined computedUses=["$context"] keys=8  ← остання ітерація після реєстрації API
[stateRef] Fragment: hasProjectMenu=true  computedUses=undefined keys=6
[stateRef] Theme#root: hasProjectMenu=true computedUses=undefined keys=5
```

**Ключові спостереження:**
1. `App.computedUses = ["$context"]` — App Container ВСЕ ЩЕ має `computedUses` з `$context`!
2. `Card.hasProjectMenu = false` — `projectMenu` НЕ доходить до Card level
3. В trace відсутні `[computedUses]` логи — а вони мали б з'явитись при виклику `computeUsesForTree`

### Головна гіпотеза чому фікс не спрацьовує

**`computeUsesForTree` MAY виконуватися поза браузером (в Node.js при парсингу).** Якщо XMLUI парсить і обчислює `computedUses` в Node.js на сервері (при завантаженні модуля), то:
- Браузерний `console.log` з `[computedUses]` не потрапить в Playwright trace
- Якщо сервер запускався до того як мої зміни набули чинності — `computedUses` обчислені зі СТАРОЮ логікою і закешовані

**Це пояснює:**
- Відсутність `[computedUses]` логів у trace (виконались не в browser context)
- `App.computedUses=["$context"]` — залишилось від OLD обчислення
- Навіть після my fix, якщо parseResult/computedUses закешований, старі значення залишаються

### Як перевірити цю гіпотезу

**Крок 1**: Додати `console.log` прямо в `computedUses.ts` але у вигляді помилки через `Error` щоб вона гарантовано потрапила в traces навіть якщо виконується в Node.js:

```ts
// тимчасово в computeUsesForTree:
if (typeof window !== 'undefined') {
  console.log('[computedUses-browser] running in browser');
} else {
  console.error('[computedUses-node] running in Node.js!');
}
```

**Крок 2**: Знайти де `computeUsesForTree` викликається:
```bash
grep -rn 'computeUsesForTree' xmlui/src/ --include='*.ts' --include='*.tsx'
```
Перевірити чи це відбувається в SSR/Node.js контексті або в браузері.

**Крок 3**: Якщо `computeUsesForTree` дійсно в Node.js — треба перезапустити Vite dev server щоб зміни в `computedUses.ts` набули чинності:
```bash
# Зупинити всі існуючі сервери і запустити тест заново
pkill -f vite || true
npx playwright test xmlui/tests-e2e/how-to-examples/open-a-context-menu-on-right-click.spec.ts --project=xmlui-nonsmoke
```

### Як запускати тести Group A
```bash
# Тільки Group A (швидко, ~1 хвилина):
npx playwright test xmlui/tests-e2e/how-to-examples/open-a-context-menu-on-right-click.spec.ts --project=xmlui-nonsmoke

# Один конкретний тест:
npx playwright test xmlui/tests-e2e/how-to-examples/open-a-context-menu-on-right-click.spec.ts --project=xmlui-nonsmoke --grep "right-clicking"
```

### Як читати Playwright trace після провалу

```bash
# Знайти trace.zip останнього провалу:
find ./test-results -name 'trace.zip' | head -2

# Витягти всі console.log з trace:
unzip -p "./test-results/<folder>/trace.zip" | python3 -c "
import sys, json
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    try:
        e = json.loads(line)
        if e.get('type') == 'console':
            print(f\"[{e.get('messageType','?')}] {e.get('text','')[:300]}\")
    except: pass
" 2>/dev/null
```

**На що звертати увагу в trace:**
- `[computedUses] App:` — якщо є, App отримав computedUses (погано — не має бути)
- `[stateRef] App: hasProjectMenu=true` — якщо true, projectMenu дійшов до App (добре)
- `[stateRef] Card: hasProjectMenu=true` — якщо true, фікс працює ✓
- `[ContextMenu.openAt] called` — якщо є, right-click handler спрацював ✓
- `[stateRef] MenuItem: $context={"id":...}` — якщо є, меню відкрилось з правильним context ✓

### Якщо фікс запрацює (hasProjectMenu=true в Card) але тести все одно провалюються

Тоді проблема перейде до рівня ContextMenu rendering: `$context` буде `undefined` коли рендеряться MenuItem (Archive's `enabled="{$context.status !== 'paused'}"` може крешитись). Перевірити:
1. Чи з'являється `[ContextMenu.openAt] called` у trace (меню відкривається?)
2. Чи є `[stateRef] MenuItem: $context={"id":...}` у trace після кліку

---
