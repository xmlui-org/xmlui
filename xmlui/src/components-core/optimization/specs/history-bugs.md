# Bugs Identified During Implementation

### Bug 1: `statePartChanged` Unstable — Cascading Re-render

**Symptom:** `Select: 56 renders` = number of App renders over 2s (20 timer ticks × ~2.8 due to React dev-mode). Optimization was not working at all.

**Cause:** `statePartChanged` in `StateContainer` had `resolvedLocalVars` and `stableCurrentGlobalVars` in `useCallback` dependencies:

```ts
const statePartChanged = useCallback(
  (pathArray, newValue, target, action) => {
    const isLocalVar = key in resolvedLocalVars; // reads from closure
    // ...
  },
  [dispatch, node.uid, resolvedLocalVars, stableCurrentGlobalVars, parentStatePartChanged, node.uses],
  //                   ^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^  ^^^^^^^^
  //                   changes every render → new function → memo is useless
);
```

Every `StateContainer` render → new `statePartChanged` → child `memo` receives a new prop → all descendants re-render.

**Fix:** Move mutable values into refs, leave only stable ones in dependencies:

```ts
const resolvedLocalVarsRef = useRef(resolvedLocalVars);
resolvedLocalVarsRef.current = resolvedLocalVars;
const stableCurrentGlobalVarsRef = useRef(stableCurrentGlobalVars);
stableCurrentGlobalVarsRef.current = stableCurrentGlobalVars;
const parentStatePartChangedRef = useRef(parentStatePartChanged);
parentStatePartChangedRef.current = parentStatePartChanged;
const nodeUsesRef = useRef(node.uses);
nodeUsesRef.current = node.uses;

const statePartChanged: StatePartChangedFn = useCallback(
  (pathArray, newValue, target, action) => {
    const localVars = resolvedLocalVarsRef.current;  // reads from ref
    // ...
    const uses = nodeUsesRef.current;
    if (!uses || uses.includes(key)) {
      parentStatePartChangedRef.current(pathArray, newValue, target, action);
    }
  },
  [dispatch, node.uid], // only stable deps
);
```

**Pattern:** "refs as event handlers" (React useEvent RFC) — store mutable values in refs so the callback function has a stable identity but always sees current data.

---

### Bug 2: `parentState` Not Isolated to ContainerWrapper — Select: 12 renders

**Symptom:** After fixing Bug 1 — `Select: 12` renders over 2s. Better, but not ≤ 5.

**Cause:** Even with a stable `statePartChanged`, `ContainerWrapper` itself received the full `state` from the parent and re-rendered on every change. Although `StateContainer` correctly isolated `stateFromOutside` internally, the `ContainerWrapper` component function was still executing.

**Fix:** Add `scopedParentState` in `ComponentWrapper` before passing to `ContainerWrapper` (see section 7 above). Now `ContainerWrapper` receives an object that changes only when `rarelyChanges` changes — `React.memo` skips re-renders.

---

### Bug 3: `computedUses` Not Removed from `wrappedNode`

**Symptom:** Select rendered twice — outer Container and inner wrappedSelect both became ContainerWrapper. The inner Select had an unnecessary StateContainer.

**Cause:** `getWrappedWithContainer` copied `computedUses` to the Container but didn't remove it from the inner node.

**Fix:**
```ts
const wrappedNode = { ...node };
delete wrappedNode.computedUses; // important: don't leave on inner node
```

---

### Bug 4: `isContainerLike` Didn't Check `computedUses`

**Symptom:** `Select` with `computedUses` didn't become a `ContainerWrapper` → rendered as a regular `ComponentAdapter` without its own state.

**Cause:** `isContainerLike` only checked `uses`, `vars`, `loaders`, etc. — not `computedUses`.

**Fix:** Add `node.computedUses !== undefined` to the condition.

---

### Bug 5: E2E Test Threshold `≤ 3` Too Strict

**Symptom:** E2E test failed even with fixed optimization.

**Cause:** React dev-mode calls component functions twice ("double invoke") during initialization. The actual number of init-renders is ≈ 4, not 1.

**Fix:** Threshold value changed from `≤ 3` to `≤ 5`.

---

### Bug 6: Incorrect `computedUses` Check in StateContainer

**Symptom:** Even after all fixes, some re-renders leaked through.

**Cause:** The original `statePartChanged` logic checked `node.uses`, but not `node.computedUses`. Therefore, state changes not in `computedUses` were still proxied up via `parentStatePartChanged`.

**Fix:** Read `nodeUsesRef.current` (which stores `node.uses`) — but also had to account that `node.uses` might be `undefined` while `computedUses` is not. In the final implementation, StateContainer receives an already scoped parentState (thanks to Bug 2 fix), so the additional check in `statePartChanged` is defense-in-depth.

---

### Bug 7: `computedUses = []` Breaks Implicit Containers — `{mySelect.value}` Empty

**Symptom:** After selecting an option in `<Select id="mySelect">` — `{mySelect.value}` in a neighboring `Text` shows an empty string. All tests checking Select value via uid fail.

**Cause:** The test-wrapper `initTestBed` wraps every markup in `<Fragment var.testState="{null}">`. This Fragment is a container (has `vars`) with `parentDependencies = {}`. The algorithm set `computedUses = []` (empty array). An empty array — **falsy is false**, meaning `node.computedUses = []` is truthy and `isContainerLike` returns true — even when not needed. But importantly: `extractScopedState(state, [])` returns `{}`, completely isolating the Fragment from parent state. Because of this:

1. ComponentWrapper for Fragment-wrapper passes `scopedParentState = {}` to ContainerWrapper.
2. StateContainer Fragment has `stateFromOutside = {}` — empty!
3. Fragment is `isImplicit = true` → `dispatch = parentDispatch` (App-level) → `COMPONENT_STATE_CHANGED` from Select goes to App, but Fragment doesn't see App state.
4. `{mySelect.value}` in Text cannot read the value — it's in App state, and Fragment is isolated.

**Fix:** Set `computedUses` only when `parentDependencies.size > 0`. An empty `computedUses = []` is semantically equivalent to explicit `uses = []` (total isolation) and breaks implicit containers that should receive full parent state.

```ts
if (node.uses === undefined && parentDependencies.size > 0) {  // added: && parentDependencies.size > 0
  node.computedUses = Array.from(parentDependencies);
}
```

**Keep in mind:** `computedUses = []` (empty array) and `computedUses = undefined` are NOT the same. An empty array via `extractScopedState` means "isolate all parent state", which breaks implicit containers. Therefore, `computedUses` should only be set when there is something to declare.

---

### Bug 8: Child UIDs (`id=`) Were Not in `localDeclared` — `{mySelect.value}` Empty

**Symptom:** `{mySelect.value}` in a `Text` neighboring `<Select id="mySelect">` always showed an empty string.

**Cause:** At runtime, the child component with `id="mySelect"` calls `registerComponentApi` → API registers in the nearest ancestor-`StateContainer`. Thus, the child component's uid is **locally owned** by the parent container. But the `computeUsesInternal` algorithm didn't know this and added `mySelect` to `parentDependencies` → `computedUses = ["mySelect"]` → `extractScopedState(state, ["mySelect"]) = {}` (parent state doesn't have `mySelect`) → isolation.

**Fix:** Algorithm returns a tuple `[freeVars, escapingUIDs]`. A non-container node passes its uid and descendant UIDs (through non-container intermediaries) as `escapingUIDs` upward. The parent container receives these UIDs and adds them to `localDeclared` via `processChildList`.

---

### Bug 9: Child UIDs Through Non-container Intermediary Didn't "Bubble Up"

**Symptom:** `<Stack var.x><VStack><Select id="mySelect"/></VStack><Text>{mySelect.value}</Text></Stack>` — `{mySelect.value}` is empty, even though `VStack` is not a container.

**Cause:** The previous fix (Bug 8) only added direct children's uids. At runtime, `registerComponentApi` passes through `ComponentAdapter` (non-container) transparently — the uid registers in the nearest ancestor-container, not the intermediary. But the algorithm didn't model this transparency.

**Fix:** `computeUsesInternal` returns `escapingUIDs` for non-container nodes: `{own uid} ∪ {child escapingUIDs}`. A container node captures everything — only `{own uid}` goes out. The chain can be of arbitrary depth.

**Keep in mind:** any node without `vars`/`loaders`/`functions`/`contextVars`/`scriptCollected`/`uses` is "UID-transparent" — its own uid and all descendant UIDs (not captured by intermediate containers) "bubble up" to the nearest ancestor-container.

---

### Bug 10: `$item` (contextVar) Leaked from Items → Select Became Implicit Container

**Symptom:** `<Select id="mySelect"><Items contextVar="$item" data="{someData}"><Option value="{$item.value}"/></Items></Select>` — after selecting an option, `{mySelect.value}` in a neighboring `Text` remained empty.

**Cause:** `contextVars` keys (`$item`, `$index`, etc.) were not in Items' `localDeclared`. Therefore, `$item` leaked as a free variable from Items → Select had `parentDependencies = {"$item"}` → became implicit container → `computedUses = ["$item"]` → `getWrappedWithContainer` wrapped Select in outer Container with `computedUses = ["$item"]` → `extractScopedState(fragmentState, ["$item"]) = {}` (Fragment doesn't have `$item`).

Additionally, the inner `wrappedSelect` had `uid = undefined` (it's removed), so all `updateState({value: "Zero"})` dispatched with `uid = Symbol(undefined)` → `Symbol(undefined).description = undefined` → didn't show up as a string property in `mergeComponentApis` → `{mySelect.value}` never updated.

**Fix:** `contextVars` keys are added to `localDeclared` at the beginning of `computeUsesInternal`. They are locally provided by the framework — not external dependencies.

**Keep in mind:** `contextVars` on a node (`{ $item: "$item" }`) mean these identifiers are **injected by the framework** into this node's subtree at runtime. They don't come from parent scope — thus should be in `localDeclared`, not `computedUses`.

---

### Bug 11: JavaScript Built-in Globals (`JSON`, `Math`, etc.) Leaked into `computedUses`

**Symptom:** Test-wrapper `initTestBed` always caused tests to fail even after Bug 7 fix. `{mySelect.value}` showed empty string in all tests using static `<Option>`.

**Cause:** `initTestBed` adds marker text:
```xml
<Text value="{ typeof testState === 'undefined' ? 'undefined' : JSON.stringify(testState) }"/>
```
`collectVariableDependencies` returns all identifiers including standard JS global objects: `testState` and `JSON`. `testState` — local Fragment variable, filtered. But `JSON` — JavaScript built-in — came out as a free variable → Fragment received `computedUses = ["JSON"]` → `extractScopedState(appRootState, ["JSON"]) = {}` (app state doesn't have `JSON`) → `stateFromOutside = {}` → Fragment isolated.

**Fix:** Curated set `JS_STDLIB_GLOBALS` containing ECMAScript standard globals and universally-available platform globals:
```ts
const isBuiltinGlobal = (name: string): boolean => JS_STDLIB_GLOBALS.has(name);

for (const d of usedHere)
  if (!localDeclared.has(d) && !isBuiltinGlobal(d)) parentDependencies.add(d);
```

**Why NOT `name in globalThis`:** `globalThis` in browsers contains hundreds of legacy DOM/BOM properties (`window.external`, `window.screen`, `window.status`, `window.frames`, etc.) — an XMLUI developer might legitimately name their variable `external` or `screen`, and they would be incorrectly filtered out. For example, `jsdom` (Vitest test environment) exposes `window.external` → `"external" in globalThis = true` → test checking variable `{external}` breaks.

**Keep in mind:** `JS_STDLIB_GLOBALS` covers ECMAScript standard globals and universally-available globals (available in both browser and Node.js). It **does not** include browser-only legacy (`window.external`, `window.screen`) or Node.js-only (`process`, `require`) which could be XMLUI var names. When new ECMAScript globals appear (e.g., `Temporal` already included), they must be added manually.

---

### Bug 12: Transitive Function Calls in Implicit Containers — `navigateTo` Not in Scope

**Symptom:** `SharesTableView.xmlui` defines `function handleNameClick(item) { if (item.webClientEnabled) navigateTo(item); }` and uses `<Table id="sharesTable">`. Clicking a share threw:
```
TypeError: Cannot read properties of undefined (reading 'call')
at evalFunctionInvocationAsync (eval-tree-async.ts:592)
```
Function `handleNameClick` was found, but `navigateTo` (which it calls) was `undefined`.

**Cause:** `Table` becomes an implicit container via `isImplicitContainerByDefault`. The algorithm set `computedUses = ['$props', '$item', 'handleNameClick']` — only what is **directly** mentioned in the template. `navigateTo` is used only **inside function body** of `handleNameClick` — not in a template expression — so it didn't enter the Table's `parentDependencies`. At runtime `extractScopedState(parentState, ['$props', '$item', 'handleNameClick'])` → `navigateTo` missing from scope → call `navigateTo(item)` → TypeError.

**Fix:** `computeUsesInternal` receives parameter `parentFunctionNames: Set<string>` — set of function names declared in parent scope. If `parentDependencies` has at least one function from `parentFunctionNames`, **all** parent functions are included in `computedUses`:

```ts
const needsParentFunction = parentFunctionNames.size > 0 &&
  [...parentDependencies].some(d => parentFunctionNames.has(d));
const computedUsesSet = needsParentFunction
  ? new Set([...parentDependencies, ...parentFunctionNames])
  : parentDependencies;
node.computedUses = Array.from(computedUsesSet);
```

Functions are **non-reactive** — including extra functions in `computedUses` never causes re-renders but prevents runtime TypeError.

**Keep in mind:** `parentFunctionNames` is passed only from known containers (with `vars`/`loaders`/`functions`/`scriptCollected`/`contextVars`). A non-container node inherits `parentFunctionNames` from ancestor (scope doesn't change).

---

### Bug 13: `Object.keys(node.scriptCollected)` → Structural Keys Instead of Function Names

**Symptom:** After fixing Bug 12, `navigateTo` still didn't enter `computedUses`. In logs: `Table sharesTable [implicitDefault] -> ['$props', '$item', 'handleNameClick']` — without `navigateTo`. Also, structural keys like `'vars'`, `'functions'`, `'moduleErrors'`, `'hasInvalidStatements'` entered `computedUses` of some `Table`s.

**Cause:** `CollectedDeclarations` (type `scriptCollected`) has structure:
```ts
type CollectedDeclarations = {
  vars: Record<string, CodeDeclaration>;
  functions: Record<string, CodeDeclaration>;   // ← real functions here
  moduleErrors?: ModuleErrors;
  hasInvalidStatements?: boolean;
};
```
The code used `Object.keys(node.scriptCollected)` — this returned **object structural keys**: `['vars', 'functions', 'moduleErrors', 'hasInvalidStatements']`, not real function names. Same keys entered both `localDeclared` and `nodeFunctionNames`.

This caused three defects simultaneously:
1. `navigateTo` wasn't in parent component's `nodeFunctionNames` → Bug 12 fix didn't fire.
2. Strings `'vars'`, `'functions'`, etc. entered `localDeclared` → certain real identifiers with these names were incorrectly ignored.
3. Structural keys entered `computedUses` of implicit containers (e.g., `linksTable` → `['...', 'vars', 'functions', 'moduleErrors', 'hasInvalidStatements']`).

**Fix:** Always access `scriptCollected.functions` and `scriptCollected.vars` directly:

```ts
// was:
for (const k of Object.keys(sc)) localDeclared.add(k);
// ...
new Set([...Object.keys(node.scriptCollected ?? {})])

// now:
for (const k of Object.keys(sc.functions ?? {})) localDeclared.add(k);
for (const k of Object.keys(sc.vars ?? {})) localDeclared.add(k);
// ...
new Set([...Object.keys(node.scriptCollected?.functions ?? {})])
```

**Keep in mind:** `CollectedDeclarations` is not a flat map `{name → fn}`, but a **nested object** with fields `vars`, `functions`, `moduleErrors`, `hasInvalidStatements`. Any code traversing `scriptCollected` via `Object.keys(sc)` actually traverses these four structural keys, not the content. Correct is `Object.keys(sc.functions ?? {})` and `Object.keys(sc.vars ?? {})`.

---

### Bug 14: Empty `vars: {}` / `functions: {}` from `StandaloneApp` Merge Created False Containers

**Symptom:** Components without any own variables (e.g., `AppPages` — just a `<Stack>` with prop `mediaSize`) became containers and received `computedUses = ['mediaSize']`. This isolated their child components from parent state.

**Cause:** `StandaloneApp.tsx` during code-behind merge always creates empty objects:
```ts
const componentWithCodeBehind = {
  ...compound,
  component: {
    ...compound.component,
    vars: {                        // ← always an object, even if empty
      ...compound.component?.vars,
      ...componentCodeBehind?.vars,
    },
    functions: componentCodeBehind?.functions,  // ← could be {}
  },
};
```
An empty object `{}` is **truthy** in JavaScript. `isKnownContainer` and `isRegularContainer` checked `node.vars` / `node.functions` without checking if the object is non-empty → every compound component with code-behind (even without real vars) became a container.

**Fix:** Check **non-emptiness** via `Object.keys(...).length > 0`:

```ts
// was:
const isKnownContainer = !!(node.vars || node.functions || ...);

// now:
const isKnownContainer = !!(
  (node.vars && Object.keys(node.vars).length > 0) ||
  (node.functions && Object.keys(node.functions).length > 0) ||
  ...
);
```

Similarly for `isRegularContainer`.

**Keep in mind:** this check is only relevant for `vars` and `functions`. For `scriptCollected` (even if empty), a truthiness check is enough — if a node has `scriptCollected`, it **already is** a known container because it meant it had a `<script>` or `.xs` file. Similarly for `contextVars`, `uses`, `loaders`.

---

### Bug 15: `computedUses` Narrowed State for Components with `scriptCollected` — functions in `.xs` Files Saw `undefined`

**Symptom (real myworkdrive app):** After feature introduction, `FoldersTree` component stopped displaying in sidebar. Clicking a share ("Documents") threw "function is not a function" error — similar to what happens when functions are not imported in `.xs` file.

**Cause:** The algorithm set `computedUses` for **any** regular container — including components with `scriptCollected` (those with `.xs` files or `<script>` tags). State narrowing `stateFromOutside = extractScopedState(parentState, computedUses)` was determined solely based on template expression analysis.

But **function bodies in `.xs` files ARE NOT scanned** by the algorithm. These functions might access any global state variables. As a result:

| Component | `computedUses` (template analysis) | Actually needed by `.xs` functions |
|-----------|--------------------------------|--------------------------------|
| `FoldersTree` | `['events']` | + `fileClipboard`, `catalogSelection` (via `copyOrCut`) |
| `DesktopNameCell` | `['selectMode']` | + everything needed by `handleItemClick` (via `emitEvent`) |
| `FilesPage` | `['events', 'drives', 'catalogSelection', ...]` | + `pendingFileSelection`, `serverConfig`, ... |
| `SharesPage` | `['drives', 'view']` | + `events` in `publishEvents` |

Functions received `undefined` instead of real values → runtime errors or incorrect behavior.

**Fix:** Skip `computedUses` narrowing for nodes with `scriptCollected`:

```ts
// was:
if (node.uses === undefined && parentDependencies.size > 0) {
  node.computedUses = Array.from(parentDependencies);
}

// now:
if (node.uses === undefined && parentDependencies.size > 0 && !node.scriptCollected) {
  node.computedUses = Array.from(parentDependencies);
}
```

**Why it's safe:** `scriptCollected` exists **only** for user-defined components (`.xs` files / `<script>` tags in `.xmlui`). Built-in components (`Select`, `Table`, `List`, `DataGrid`) don't have `scriptCollected` — optimization remains for them. Similarly, `VStack var.x="{...}"` (only `vars`, no script) — is also safe for narrowing.

**Keep in mind:** `computedUses` optimization for components with `scriptCollected` is possible only if the algorithm scans `.xs` function bodies too — requiring AST analysis of imported functions and transitive dependency tracking. This is complex (transitive deps via `import { fn } from 'shared.xs'`) and deferred as a future optimization (see TODO).

**⚠️ Incompleteness of this fix:** Bug 15 disabled narrowing for the node with `scriptCollected` itself. But `nextDisableNarrowing` — the flag passed to **children** — only checked `!!node.scriptCollected`, ignoring code-behind components via `node.functions`. This spawned separate Bug 16 (see below).

---

### Bug 16: `var.` Declarations on `<Component>` Invisible in Event Handlers of Children — `nextDisableNarrowing` Didn't Account for `node.functions`

**Symptom:** In `PageToolbar` component (only `.xmlui.xs` code-behind, no `<script>` tag), variable `var.selectAllIndeterminate="{false}"` declared on root `<Component>` tag. In child `ChangeListener`, attempt to write `selectAllIndeterminate = false` threw: `Left value variable "selectAllIndeterminate" not found`.

**Cause:** Two different paths for scripts to reach a node:

| Source | Stored where on node | Set when |
|---------|--------------------------|---------------------|
| `<script>` tag in `.xmlui` | `node.scriptCollected` | during parsing in `transform.ts` |
| External `.xmlui.xs` file | `node.functions` | during merge in `StandaloneApp.tsx` (lines 733–746) |

`nextDisableNarrowing` controls whether **children** of the current node will be narrowed:

```ts
// was: checks only <script> tag
const nextDisableNarrowing = disableNarrowing || !!node.scriptCollected;
```

Components with only `.xs` file have `scriptCollected === undefined` → `nextDisableNarrowing = false` → algorithm narrowed `ChangeListener` to `computedUses = ['events']` (only what's visible in template) → `selectAllIndeterminate` was cut off.

**Fix:**

```ts
// now: checks both paths
const hasCodeBehind = !!(node.functions && Object.keys(node.functions).length > 0);
const nextDisableNarrowing = disableNarrowing || !!node.scriptCollected || hasCodeBehind;
```

**Why `node.functions` corresponds to code-behind:** Built-in components (`Select`, etc.) are implemented in TypeScript — they never have `node.functions` from `.xs`. Only user-defined compound components receive `functions` from `StandaloneApp` merge. Thus, `node.functions.length > 0` check is a reliable indicator of code-behind presence.

**Keep in mind:** `isKnownContainer` already correctly checked both channels (both `scriptCollected` and `functions`), but `nextDisableNarrowing` lagged behind. After fix, both places are synchronized.

---

### Bug 17: Runtime Context Vars (`$param`, `$item`, `$row`, etc.) Leaked into `parentDependencies`

**Symptom:** E2E tests for `ModalDialog` (and other components using `$param`, `$item`, `$row`, `$data`, `$checked`, `$context`, `$this`) failed when `COMPUTED_USES_ENABLED = true`. With `COMPUTED_USES_ENABLED = false` — all tests passed. Specifically: `ModalDialog` didn't open after `modalDialog.open({ msg: "Hello" })`.

**Cause:** Runtime context vars (`$param`, `$item`, `$rowKey`, etc.) **are not parent state keys** — they are injected by the framework directly into child context during render (e.g., `ModalDialog.open()` injects `$param`; `Items` injects `$item`). These variables **are not declared** in `contextVars` of the node itself (unlike `$item` in `Items`, where `contextVars: { $item: ... }` is populated on the Items node itself).

If a child node (e.g., `Text` inside `ModalDialog`) contains `{$param.msg}`, the algorithm finds `$param` neither in `localDeclared` of the node nor in `isBuiltinGlobal` → `$param` enters `parentDependencies` → `computedUses = ['$param']` set on ModalDialog → `extractScopedState(parentState, ['$param'])` returns `{}` (as `$param` is never a key in `parentState`) → `stateFromOutside = {}` → ModalDialog receives empty state → cannot open.

**Fix approach 1 (rejected):** explicit allowlist of all runtime context vars in `XMLUI_RUNTIME_CONTEXT_VARS = new Set(['$param', '$item', ...])`. Problem: requires constant synchronization as new context vars appear.

**Fix approach 2 (accepted):** all `$`-identifiers are by definition either runtime context vars or router variables. Router variables that actually live in `parentState` — only four: `$pathname`, `$routeParams`, `$queryParams`, `$linkInfo`. Thus:

```ts
// routing-state.ts — single source of truth
export const ROUTING_STATE_KEYS = new Set([
  "$pathname", "$routeParams", "$queryParams", "$linkInfo",
]);

// computedUses.ts
import { ROUTING_STATE_KEYS } from "../state/routing-state";
const isRuntimeContextVar = (name: string): boolean =>
  name.startsWith("$") && !ROUTING_STATE_KEYS.has(name);

for (const d of usedHere)
  if (!localDeclared.has(d) && !isBuiltinGlobal(d) && !isRuntimeContextVar(d))
    parentDependencies.add(d);
```

**Keep in mind:** `ROUTING_STATE_KEYS` is defined in `routing-state.ts` — alongside `useRoutingParams()` which is the only place where these keys are actually written to state. When adding a new router variable, only one file needs updating. All other `$`-identifiers (`$param`, `$item`, `$row`, future ones) are automatically filtered without any changes in `computedUses.ts`.

---

### Bug 18: `computedUses` Narrowed eval-context of Event Handlers — Writing to Parent Variables Threw `"variable not found in scope"`

**Symptom:** Any event handler in a component with `computedUses` that tried to assign a **parent variable not in `computedUses`** — threw:
```
Error: Left value variable (selectedItem) not found in the scope.
```
Example: `<List items="{items}" onSelectionDidChange="(sel) => selectedItem = sel[0]">` where `selectedItem` is a `var.` at App level, `items` — in `computedUses` of List.

**Cause (full chain):**
1. `ComponentWrapper`: `scopedParentState = extractScopedState(state, computedUses)` → `{items: ...}` (without `selectedItem`).
2. `ContainerWrapper` → `StateContainer` receive already narrowed `parentState = {items}`.
3. `StateContainer` → `Container`: `componentState = resolvedCombinedState` built over narrowed `stateFromOutside` → also without `selectedItem`.
4. `Container.stateRef = useRef(componentState)` → without `selectedItem`.
5. `getComponentStateClone()` → Proxy over `stateRef.current` → without `selectedItem`.
6. `evalContext.localContext` → without `selectedItem`.
7. Eval engine (`getIdentifierScope`): searches `selectedItem` in block scopes → `localContext` → `appContext` → **`globalThis`** → not found → `evalAssignmentCore` throws error.

`statePartChanged` **was never called** — error thrown before Proxy SET could record the change.

**Key point:** `parentState` in `StateContainer` — is already narrowed (ComponentWrapper narrowed it before passing to ContainerWrapper). Thus, passing `fullParentState = StateContainer.parentState` is pointless — it's already narrow. Need to pass through `ComponentWrapper.state` (before narrowing).

**Fix:** Pass through full (un-narrowed) `state` from `ComponentWrapper` through the chain down to `Container.stateRef` as a **`MutableRefObject`** (not a value-prop). Narrowing remains for rendering (`parentState = scopedParentState`), event handlers get access to full state via stable ref.

**Why ref, not value-prop:** If passed as `fullParentState={state}` regular prop, then every `oftenChanges` tick `state` changes → `ContainerWrapper.memo` sees new `fullParentState` → Select re-renders despite stable `scopedParentState`. Optimization fully defeated (34 renders instead of ≤ 5). MutableRefObject is stable as React prop — `memo` doesn't react to `.current` change.

```typescript
// ComponentWrapper.tsx — creates stable ref, updates .current during render:
const fullParentStateRef = useRef<Record<string, any> | undefined>(undefined);
fullParentStateRef.current = (nodeUses || nodeComputedUses) ? state : undefined;

<ContainerWrapper
  parentState={scopedParentState}      // ← narrowed, for rendering
  fullParentStateRef={fullParentStateRef}  // ← stable ref, for event handlers
  ...
/>

// ContainerWrapper.tsx → StateContainer.tsx — Props + destructuring + threading:
fullParentStateRef?: MutableRefObject<ContainerState | undefined>;

// Container.tsx — reads .current when building stateRef:
const fullParentState = fullParentStateRef?.current;
const stateRef = useRef(
  fullParentState ? { ...fullParentState, ...componentState } : componentState,
);
useIsomorphicLayoutEffect(() => {
  const fp = fullParentStateRef?.current;
  stateRef.current = fp ? { ...fp, ...componentState } : componentState;
}, [componentState, fullParentStateRef]); // fullParentStateRef is stable → effect = [componentState]
```

Now `selectedItem` is present in `stateRef.current` → `getComponentStateClone()` → Proxy SET fires → `changes.push(...)` → `statePartChanged("selectedItem", value)` → bubbling to parent StateContainer → dispatch → state updated ✓

**Result:** all 58 regressions eliminated. Full test suite: **9593/9596 passed (176 files)** (3 non-failures: 2 skipped + 1 todo).

---

### Bug 19: `computedUses=["$context"]` on App Isolated Component from Parent's `registerComponentApi`

**Symptom:** E2E tests `open-a-context-menu-on-right-click.spec.ts` (6 tests) failed when `COMPUTED_USES_ENABLED=true`. `ContextMenu.openAt(event, data)` didn't open the menu. The app in myworkdrive worked normally (there `computedUses` was not set on App).

**Cause (identified via `[registerApi]` logs):**

Markup tree:
```xml
<App>
  <ContextMenu id="projectMenu">...</ContextMenu>
  <Items data="{projects}">
    <Card onContextMenu="(e) => projectMenu.openAt(e, $item)">
```

Analyzer `computeUsesInternal` found `$context` in `MenuItem.onClick` handlers. `ContextMenu` is not a container (no `vars`/`loaders`/`contextVars` in XML node). Thus `$context` bubbled through ContextMenu → App. App received `parentDependencies = {"$context"}` → `computedUses = ["$context"]`.

At runtime: `extractScopedState(Theme#root_state, ["$context"])` → `{}` (as `$context` is not yet in state before first `openAt`). App received `stateFromOutside = {}` instead of full Theme#root state. ContextMenu registered its API (`projectMenu`) in Theme#root via `registerComponentApi`. App didn't see it. Card didn't find `projectMenu` → `TypeError: projectMenu.openAt is not a function`.

Confirmed by logs:
```
[stateFromOutside] App: computedUses=["$context"] parentState.keys=[] kept=[] DROPPED=[]
[registerApi] key="projectMenu" → storing in container "Theme#root"
[stateRef] Card: hasProjectMenu=false  ← NEVER true
```

**Fix:** guard for setting `computedUses` changed from `parentDependencies.size > 0` to `nonDynamicParentDeps.size > 0`.

```ts
// was:
if (node.uses === undefined && parentDependencies.size > 0 && safeToNarrow) {
// now:
if (node.uses === undefined && nonDynamicParentDeps.size > 0 && safeToNarrow) {
```

Now `computedUses` is set only when there are real (non-dynamic) dependencies on parent state. If the only dependency is `$context` (or other `PARENT_STATE_DYNAMIC_VARS`), the node is not narrowed and receives full parent state. If real deps + `$context` exist — `$context` is still included in `computedUses` for reactivity (container re-renders on `openAt`).

**Why no bug in myworkdrive:** in Vite/StandaloneApp mode, `computedUses` was not set for App — for another reason (maybe App had `functions` via code-behind or `disableNarrowing` triggered).

**File:** `xmlui/src/components-core/optimization/computedUses.ts`

**Keep in mind:** `PARENT_STATE_DYNAMIC_VARS` (`$context` etc.) — are not just "runtime context vars". They actually live in parent state (ContextMenu.openAt dispatches `$context` via `statePartChanged`). But their initial value is `undefined`. If a container narrows only to `$context`, it isolates itself from all other parent state keys including component APIs registered via `registerComponentApi`.

---

### Bug 20: LHS of Assignments in Event Handlers Were Not Counted in `computedUses`

**Symptom:** Tests `Table.spec.ts › refreshOn Property` (3 tests) failed with `Expected: "1", Received: null`. In browser logs:

```
[xmlui] Left value variable (testState) not found in the scope.
```

Test case XML:
```xml
<VStack var.parentValue="1">
  <Table data="{[{id: 1, name: 'Row A' }]}" refreshOn="{parentValue}">
    <Column header="Name">
      <Text onClick="testState = parentValue">{$item.name}</Text>
    </Column>
  </Table>
</VStack>
```

`testState` lives in root Fragment of test bed as `var.testState="{null}"`. Expected: `Text.onClick` handler writes to it from Table cell area.

**Root:** `collectVariableDependencies` (in [visitors.ts](../../script-runner/visitors.ts)) when visiting `T_ASSIGNMENT_EXPRESSION` returned dependencies of right part only (`program.expr`), completely ignoring left (`program.leftValue`):

```ts
case T_ASSIGNMENT_EXPRESSION:
  return collectDependencies(program.expr, program, "right");
```

Thus for `testState = parentValue` analysis saw only `parentValue` — as RHS expression. `testState` never entered free variables of Text → Column → Table.

Table as implicit container received `computedUses = ["parentValue"]`. Runtime narrowing in `ComponentWrapper`:
```
extractScopedState(state, ["parentValue"]) → {parentValue: 1}
```

Cell handler executed in scope where `testState` was absent. `evalAssignmentCore` ([eval-tree-common.ts](../../script-runner/eval-tree-common.ts):438):
```ts
if (leftScope === globalThis && !(leftIndex in leftScope)) {
  throw new Error(`Left value variable (${leftIndex}) not found in the scope.`);
}
```

**Fix (two-stage):**

**Stage 1 — opt-in parameter in `collectVariableDependencies`:**

Added optional parameter `options.includeAssignmentTargets`. When `true` — `T_ASSIGNMENT_EXPRESSION` traverses **both** sides of assignment. Default `false` to not break reactive dependency tracking (if `x = expr` adds `x` to its deps, then write to `x` triggers re-execution → infinite loop).

```ts
case T_ASSIGNMENT_EXPRESSION:
  return options.includeAssignmentTargets
    ? collectDependencies(program.leftValue, program, "left").concat(
        collectDependencies(program.expr, program, "right"),
      )
    : collectDependencies(program.expr, program, "right");
```

`computedUses` analyzer passes `includeAssignmentTargets: true`, as engine requires LHS in scope.

**Stage 2 — splitting `reads` vs `all` deps in `computedUses`:**

First attempt (just `includeAssignmentTargets: true`) broke test `Select › clear button triggers didChange event` (`<Select onDidChange="testState = 'changed'">`). LHS `testState` entered `parentDependencies` of Select → `isImplicitDefault` triggered → Select wrapped in extra `StateContainer`. This broke Select clearable internal logic.

Thus `depsOfValue` and `depsOfRecord` now return **two sets**:
- `all` = reads + assignment targets → in `node.computedUses` (for resolve scope)
- `reads` = only right sides and member-access roots → in `nonDynamicReadDeps`, which controls:
  - `isImplicitDefault` (promotion to implicit container)
  - condition `if (... nonDynamicReadDeps.size > 0 ...)` for setting `computedUses`

```ts
const isImplicitDefault =
  metadata?.isImplicitContainerByDefault && nonDynamicReadDeps.size > 0;
```

`parentDependencies` further contains both writes and reads — so when container is created (via `isKnownContainer` or via `isImplicitDefault` from true reads), `computedUses` included ALL identifiers needed in scope.

**Why splitting is correct:**

- Write-only target must be **in scope** (otherwise `evalAssignmentCore` throws error).
- But write-only target **DOES NOT need** re-render trigger: when value changes — only the handler itself changed it; it's not a reactive read that should re-render the container.

Thus:
- Table with `onClick="testState = parentValue"`: `reads = {parentValue}` (from refreshOn and from RHS), `all = {parentValue, testState}`. `isImplicitDefault = true` (via `parentValue`). `computedUses = ["parentValue", "testState"]`. ✓
- Select with `onDidChange="testState = 'changed'"`: `reads = {}`, `all = {testState}`. `isImplicitDefault = false` → Select **NOT** wrapped in StateContainer, handler executes in parent scope where `testState` is naturally available. ✓

**Files:**
- `xmlui/src/components-core/script-runner/visitors.ts` — `includeAssignmentTargets` parameter.
- `xmlui/src/components-core/optimization/computedUses.ts` — `depsOfValue`/`depsOfRecord` return `{all, reads}`; `computeUsesInternal` keeps parallel sets `parentDependencies`/`parentDependenciesReads`; returns tuple `[allDeps, escapingUIDs, readDeps]`.

**Keep in mind:**
1. Other calls to `collectVariableDependencies` (reactive deps in `useVars`, `valueExtractor`, etc.) still DON'T pass `includeAssignmentTargets`. This is intentional — reactive subscription should not react to its own writes.
2. Compound assignment (`+=`, `*=` etc.) is automatically correct: both LHS and RHS are counted in `all` (LHS-as-expression is still read for compound operation).
3. Member-access assignment (`obj.field = val`) works: `traverseMemberAccessChain` extracts root `obj`, which must be in scope for reading. This was covered by RHS-only traversal earlier in some cases, now consistently with both sides.

---

### Bug 21: `$queryParams` in `onFetch` Collided with Router `$queryParams` in `computedUses`

**Symptom:** E2E `handler can use $url, $method and $queryParams context vars` — `ds.value` empty when `COMPUTED_USES_ENABLED=true`.

**Cause:** 
1. `$url` / `$method` already filtered as `isRuntimeContextVar`, but `$queryParams` belongs to `ROUTING_STATE_KEYS` → not filtered → `onFetch` adds `$queryParams` to `parentDependencies` of the node → ancestor (e.g., test `Fragment`) receives `computedUses` with router key → state narrowing / merge with handler `context` breaks injected fetch parameters.
2. During tree construction (before rendering) node still has type `"DataSource"`, not `"DataLoader"`, thus `node.type === "DataLoader"` check ignored such nodes.
3. Simply doing `usedHere.delete(d)` was dangerous as it could remove a true `$queryParams` dependency (if used, e.g., in `url="{$queryParams.q}"`), breaking loader reactivity.

**Fix:** 
1. Type check changed: `node.type === "DataLoader" || node.type === "DataSource"`.
2. Improved dependency collection: `fetch` event removed from `events` before calling `addRecord(eventsWithoutFetch)`. Then its dependencies analyzed separately and added to `usedHere` ONLY if they DON'T belong to `DATA_FETCH_HANDLER_INJECTED_KEYS`. This preserves true dependencies if they came from other properties (e.g., `url`).
3. In `event-handlers.ts`: `refreshStateRef` always updates `stateRef` from `componentStateRef` when `fullParentStateRef` is absent; `getComponentStateClone` does `Object.assign(poj, context)` after `cloneDeep(originalState)`.

**Files:** `computedUses.ts`, `event-handlers.ts`, `tests/components-core/optimization/computedUses.test.ts`.

---

### Bug 22: Local Parameters of Arrow Functions Leaked into `computedUses` via `T_FUNCTION_INVOCATION_EXPRESSION` Branch

**Symptom:** Group E E2E tests failed — Select with `when="{userOptions.length > 0}"` never became visible. First DataSource made request, got 200 OK, but `users_for_ds_dependency.loaded` never passed to App state: state seen by App children was narrowed to `["departments"]`, where `departments` — is an **arrow function parameter** in `onLoaded`, not parent state variable.

Test case XML (fragment):
```xml
<DataSource id="departments_with_ds_dependency"
  onLoaded="(departments) => {
    userOptions = users_for_ds_dependency.value.map(user => {
      const department = departments.find(d => d.id === user.departmentId);
      return { id: user.id, label: user.name + ' (' + department.name + ')' };
    });
  }" />
```

`departments` — arrow function parameter. Scope analysis in `visitors.ts` correctly handles `T_ARROW_EXPRESSION` (pushes block, declares args, processes body, pops block). Lookup via `T_IDENTIFIER` and `traverseMemberAccessChain` looks at `getIdentifierScope` and filters block-local names. But `T_FUNCTION_INVOCATION_EXPRESSION` branch (for `caller.member(...)` where `caller.obj` is `T_IDENTIFIER`) BYPASSED this check — and directly pushed `caller.obj.name` into `uncDeps` without `getIdentifierScope`:

```ts
// xmlui/src/components-core/script-runner/visitors.ts
if (caller.obj.type === T_IDENTIFIER) {
  if (typeof get(referenceTrackedApis, `${caller.obj.name}.${caller.member}`) === "function") {
    uncDeps.push(`${caller.obj.name}.${caller.member}`);
  } else {
    uncDeps.push(`${caller.obj.name}`); // ← block-local `departments` leaked here
  }
}
```

For `departments.find(d => ...)` this meant: `departments` (LOCAL block param) → bubble up as free var → `App.computedUses = ["departments"]` → `extractScopedState(parentState, ["departments"])` returned `{}` (no such key) → App lost ALL its state, including child `<DataSource id="users_for_ds_dependency">` API → `users_for_ds_dependency.loaded` always `undefined` → second DataSource never started.

**Fix:** added `getIdentifierScope` lookup before push:

```ts
// xmlui/src/components-core/script-runner/visitors.ts
if (caller.obj.type === T_IDENTIFIER) {
  // Respect block scope: a function call like `param.method(...)` where
  // `param` is a locally declared identifier (arrow-fn parameter,
  // const/let in the current scope, etc.) is NOT a parent-state
  // dependency. Skip it to avoid polluting computedUses with names
  // that don't live in the parent container.
  const callerScope = getIdentifierScope(caller.obj, evalContext, thread);
  if (callerScope.type !== "block") {
    if (typeof get(referenceTrackedApis, `${caller.obj.name}.${caller.member}`) === "function") {
      uncDeps.push(`${caller.obj.name}.${caller.member}`);
    } else {
      uncDeps.push(`${caller.obj.name}`);
    }
  }
}
```

**Why it's safe:**
1. Only one `T_FUNCTION_INVOCATION_EXPRESSION` code branch for `T_IDENTIFIER`-caller now symmetrically uses scope-check, just like neighboring `T_MEMBER_ACCESS_EXPRESSION` (via `traverseMemberAccessChain`) and `T_IDENTIFIER` (another switch case) branches.
2. `getIdentifierScope` is already instantiated — no overhead; we only read the result.
3. Reactive dependency tracking (another `collectVariableDependencies` call without `includeAssignmentTargets`) also wins: method call on local identifier should not trigger reactive re-render.

**Keep in mind:** other places manually pushing names into deps should be checked for the same pattern. Currently, this is the only branch that bypassed scope-aware lookup. Symmetrical case with `T_CALCULATED_MEMBER_ACCESS_EXPRESSION` (`arr[expr]`) in function call passes object into recursive `collectDependencies`, which already correctly filters locals.

**Files:** `xmlui/src/components-core/script-runner/visitors.ts` (1 hunk: scope-guard before push in `T_FUNCTION_INVOCATION_EXPRESSION`).

---

### Bug 23: Implicit Containers Isolated Child APIs Due to Static vs Runtime Owner Discrepancy

**Symptom:** Group D E2E tests failed — "Cancel" buttons remained in incorrect state (`enabled`). Reason was handlers seeing `exportJob = undefined`, even though declared next to it in XML:
```xml
<Fragment var.testState>
  <APICall id="exportJob" ... />
  <Button enabled="{exportJob.inProgress}" ... />
</Fragment>
```

**Cause:** 
1. **Runtime semantics:** "Implicit container" (node with `vars`/`loaders`, but WITHOUT explicit `uses`) in XMLUI delegates `registerComponentApi` call to parent. Thus child components' API (`exportJob`) actually enters parent container's state, not the implicit container itself.
2. **Static analysis (error):** The algorithm thought ANY container (including implicit one) owns child UIDs. It added `exportJob` to implicit container's `localDeclared` and, accordingly, **filtered** it from `parentDependencies`.
3. **Result:** When some other dependency (e.g., `toast`) triggered `computedUses` creation for the implicit container, this list DID NOT contain `exportJob`.
4. **Consequence:** `extractScopedState(parentState, ["toast"])` REMOVED `exportJob` from state. Button inside container saw `exportJob = undefined`.

**Fix:**
1. Introduced **Explicit Owner** (`isExplicitOwner`) concept: either a `Container` type node, or any node with explicitly defined `uses`. Only such nodes truly capture child APIs into their state at runtime.
2. **UID Propagation:** Implicit containers now don't consider child UIDs "locally declared". These UIDs continue "bubbling up" (`escapingUIDs`) to the nearest explicit owner.
3. **Inclusion in `computedUses`:** If `computedUses` is created for an implicit container (via other deps), we FORCIBLY add all child escaping UIDs (`childEscapingUIDs`). Since at runtime they live in parent state, they MUST be in allowed keys list to not be filtered during state narrowing.

**Files:** `computedUses.ts`, `tests/components-core/optimization/computedUses.test.ts`.

---

### Bug 24: Compound Component Body Left with **Stale** `computedUses` After Runtime Restructuring in `CompoundComponent`

**Symptom:** Inside user-defined component (`<Component name="FilteredView" var.selectedFilter="{$queryParams.filter ? $queryParams.filter : 'all'}">  <Text>{selectedFilter}</Text></Component>`) `Text` showed emptiness/`null` after SPA navigation or direct URL load `/#/?filter=hello`. Expected — `"hello"`. DOM snapshot showed literal `"null"`. With `COMPUTED_USES_ENABLED` disabled, both tests passed.

**Cause (full chain):**
1. **Boot phase** (`StandaloneApp.tsx:753`) calls `computeUsesForTree(compDef.component)` for each compound definition body. At this point `vars` (including `selectedFilter`) are still INSIDE `compDef.component`. Algorithm correctly adds `selectedFilter` to `localDeclared` and builds `compDef.component.computedUses = ["$queryParams"]` (only external dependencies, without own vars — this is intended).
2. **Runtime** `CompoundComponent.tsx` for each `<FilteredView />` creates a new wrapper `Container`:
   ```ts
   const { loaders, vars, functions, scriptError, ...rest } = compound;
   return {
     type: "Container",
     vars,                  // ← vars move to WRAPPER
     uses: globalKeys,
     children: [rest],      // ← body without vars becomes child
   };
   ```
   But `rest` via spread retains `compound.computedUses = ["$queryParams"]`.
3. Now `rest` by `isContainerLike` recognized as container (`hasComputedUses === true`), thus `ComponentWrapper`/`StateContainer` for it calls `extractScopedState(parentState, rest.computedUses)`.
4. `parentState` for `rest` — is `combinedState` of wrapper `Container` (includes `selectedFilter: "hello"` from resolved `vars` + `$queryParams` from `routingParams`).
5. `extractScopedState(combinedState, ["$queryParams"])` returns `{ $queryParams: ... }` — **`selectedFilter` LOST**, as it's not in `uses`.
6. `Text` sees `selectedFilter = undefined` → renders empty/`null`.

**Why it worked with `COMPUTED_USES_ENABLED` disabled:** `computeUsesForTree` exits early, `compound.computedUses` not set, `rest.computedUses === undefined` → `extractScopedState` returns full `parentState`, `selectedFilter` remains visible.

**Why static result correct in isolation but incorrect after runtime unpacking:** `computedUses` calculated RELATIVE to hierarchy existing during analysis. When `CompoundComponent` changes hierarchy at runtime (moves vars from body to wrapper), body's `computedUses` becomes semantically stale: what was `localDeclared` then, is now external dependency.

**Fix:** In destructure in `CompoundComponent.tsx` add `computedUses: _staleComputedUses` — so `...rest` DOES NOT carry this stale list. Without `computedUses` and without `uses`, `rest` body becomes stateless (`isContainerLike → false`), doesn't create its own `StateContainer`, and `Text` reads `selectedFilter` directly from wrapper `Container` state via `ComponentAdapter`.

```ts
// xmlui/src/components-core/CompoundComponent.tsx
const {
  loaders, vars, functions, scriptError,
  computedUses: _staleComputedUses,  // ← new destructure
  ...rest
} = compound;
```

**Alternatives considered and rejected:**
- *Recalculate computedUses on new hierarchy at runtime* — more complex, repeats static analysis, gives no win: rest after vars removal has no own dependencies requiring separate StateContainer.
- *Don't run computeUsesForTree for `compDef.component`* — lose optimization for nested containers inside compound body (e.g., `<Select>` inside).
- *Always include vars-keys in body's computedUses* — violates semantics: these vars are local from analysis point of view, shouldn't be in `computedUses`.

**Files:** `xmlui/src/components-core/CompoundComponent.tsx`, `xmlui/tests/components-core/optimization/computedUses.test.ts` (inline describe `"Bug 24 — stale computedUses after CompoundComponent restructure"`, 4 cases), `xmlui/tests-e2e/computed-uses.spec.ts` (section 7 — minimal e2e repro without routing dependency), `xmlui/tests-e2e/compound-component.spec.ts:722,759` (e2e regression on original $queryParams scenario).

**General lesson (for future refactors):** Any code that RESTRUCTURES component tree between boot-time analysis and runtime rendering MUST ACCOUNT FOR all tree-derived properties (`computedUses`, maybe future static annotations). Spread (`...rest`) is safe for unchanged subtrees, but dangerous for metadata depending on previous structure. Formulated as invariant — see section "Non-obvious architectural decisions → 22. Invariant: runtime restructure invalidates static `computedUses`".

---

### Bug 26: Mandatory Shielding Broke `syncWithVar` and clearable/multiSelect Select

**Symptom:** After introducing Mandatory Shielding (commit `e50613830`) e2e regress: 21 tests (15 in `Select.spec.ts`, 6 in `Table.spec.ts`).

- **Group O (Table `syncWithVar`):** `Table syncWithVar="syncState"` inside `<Fragment var.syncState="{{}}">`. Expected — checkbox click writes `{selectedIds:[1]}` into `syncState`, `JSON.stringify(syncState)` display updates. Actual — display remained `"{}"`.
- **Group N (Select):** 15 `Select.spec.ts` tests (multiSelect, groupBy, clearable, valueTemplate, ungrouped headers). After option selection, trigger didn't show badge with selected label. Some tests (`clear button triggers didChange event`) failed with `Target page, context or browser has been closed` — browser crashed because Select internal state was inconsistent.

**Root:** Mandatory Shielding unconditionally wrapped heavy components in own `StateContainer` even without read-deps, setting `computedUses = []`:

1. **Table:** Render-time code `Table.tsx:723` does `extractValue(`{${syncVarName}}`)`. Due to `computedUses=[]` narrowed parent state is `{}`, thus `extractValue("{syncState}")` returns `undefined`. `if (currentSyncVarValue != null)` check breaks `syncAdapter` creation. Write to `syncState` doesn't happen.
2. **Select:** Bug 20 fix explicitly fixes: wrapping Select in `StateContainer` (when no read-deps) breaks clearable/multiSelect internal logic. Mandatory Shielding cancels this fix — adds `StateContainer` shield to Select with static content, restoring Bug 20 in new form.

**Why it worked with `COMPUTED_USES_ENABLED` disabled:** algorithm exits early, `computedUses` not set on Select/Table, both components remain "bare" within parent `Fragment`. `extractValue("{syncState}")` sees full `combinedState` of Fragment, Table-adapter is created and writes to `syncState`. Select-internals work without extra shield.

**Fix:** Revert Mandatory Shielding in `computedUses.ts`:

```ts
// was (Mandatory Shielding):
const isImplicitDefault = !!metadata?.isImplicitContainerByDefault;
const isContainer = isKnownContainer || isImplicitDefault;
// ...
if (node.uses === undefined && (nonDynamicReadDeps.size > 0 || isImplicitDefault) && safeToNarrow) { ... }

// now (returned to Bug 20 state):
const isImplicitDefault = !!metadata?.isImplicitContainerByDefault && nonDynamicReadDeps.size > 0;
const isContainer = isKnownContainer || isImplicitDefault;
// ...
if (node.uses === undefined && nonDynamicReadDeps.size > 0 && safeToNarrow) { ... }
```

Bug 25 (Symbol UID-filter) left — it doesn't depend on Mandatory Shielding.

**Alternatives considered and rejected:**
- *Add `syncWithVar` as special dependency in `computedUses`:* fixes only Group O. Group N (Select) breaks for another reason — internal clearable/multiSelect logic incompatible with `StateContainer` wrapping without read-deps.
- *Fix Select internals to work with `computedUses=[]`:* requires deep re-engineering of `useSelectionContext`/popover mechanism. Bug 20 showed this is not a trivial task, and without runtime diagnostics risk of new regressions is high.
- *Leave Mandatory Shielding only for Table:* illogical — same mechanism breaks different things in both components. Cleaner approach — return to pre-Mandatory logic.

**Consequences:** Completely static Select/List/Table/DataGrid again re-render on every parent state tick. This matches behavior before 2026-05-21 PM run (0 failed) and doesn't block user scenarios — real apps almost always have `data={...}` as read-dep, which naturally triggers promotion.

**Files:**
- `xmlui/src/components-core/optimization/computedUses.ts` — revert isImplicitDefault/narrowing-guard.
- `xmlui/tests/components-core/optimization/computedUses.test.ts` — updated 4 unit-tests.
- `xmlui/tests-e2e/computed-uses.spec.ts` — `test.skip` for render-count test of static Select.

**Keep in mind (TODO):** Future non-narrowing shield for static heavy components (e.g., `React.memo` wrapper without `StateContainer`) should be orthogonal to `extractScopedState` to avoid repeating this conflict.

---

### Bug 27: `extractScopedState` Filtered Symbol-keyed Entries When `computedUses` Present

**Symptom:** `Checkbox` with `inputTemplate` and outer neighbor referencing `$checked` (e.g., `<Button label="{$checked}"/>` next to `<Checkbox>`), — Toggle persistently remained in `false` state regardless of user interaction. useEffect on Toggle correctly called `updateState({value: true})`, but next narrowing phase discarded this update.

Correct behavior: Toggle receives and stores new `value=true`, `$checked` evaluates to `true`, `inputRenderer({$checked: true})` renders correctly.

**Cause (full chain):**

1. Button (Checkbox neighbor) contains `label="{$checked}"`. Optimizer sees `$checked` as free variable at parent container level (Fragment) and adds `$checked` to Fragment `parentDependencies` → `computedUses=["$checked"]`. (Correct — `$checked` is a name injected by Checkbox, not neighbor.)

2. `extractScopedState(parentState, ["$checked"])` in `ComponentWrapper` for Fragment narrows parent state. String-branch `if (key in parentState)` — adds nothing (as `parentState` never has `$checked` as string-key). Symbol-branch contains:
   ```ts
   for (const sym of Object.getOwnPropertySymbols(parentState)) {
     if (sym.description && usesSet.has(sym.description)) {  // ← error here
       picked[sym] = (parentState as any)[sym];
     }
   }
   ```
   Checkbox state is stored under `Symbol(checkbox-uid)`. Symbol has `description = "checkbox-uid"`. `usesSet = {"$checked"}`, thus `usesSet.has("checkbox-uid") = false`. Symbol **discarded**.

3. `ComponentAdapter` for Checkbox: `state: state[uid] || EMPTY_OBJECT`. Without Checkbox-slice in state — `state[uid] = EMPTY_OBJECT`.

4. `wrapComponent` in Checkbox renderer: `props.value = state.value` → `undefined`.

5. Toggle receives `value={undefined}`, calls `transformToLegitValue(undefined) = false`, renders `"false"` in innerTemplate. Initial `useEffect` writes `updateState({value: true})` → state change → Checkbox re-renders.

6. **But:** ComponentAdapter re-renders with same narrowed `state={...}` (without Checkbox-slice), `props.value = undefined` again, Toggle again renders as `"false"` → infinite loop without convergence.

**Why simpler tests passed:** Without outer reference to `$checked`, no parent container ever received `computedUses` with `$checked`. Fragment had `computedUses = undefined` → `extractScopedState` returned full `parentState` → Symbol-filter never activated.

**Fix:** [ContainerUtils.ts:extractScopedState](../../src/components-core/rendering/ContainerUtils.ts) — preserve ALL Symbol-keys without filtering:

```ts
// was:
for (const sym of Object.getOwnPropertySymbols(parentState)) {
  if (sym.description && usesSet.has(sym.description)) {
    picked[sym] = (parentState as any)[sym];
  }
}

// now:
for (const sym of Object.getOwnPropertySymbols(parentState)) {
  picked[sym] = (parentState as any)[sym];
}
```

Symbols are internal component state, not external subscribable names. Reactive narrowing of string-keys remains unchanged. Symbols are always preserved because they are never part of consumer-facing `uses`.

**Regression test:** [tests/components-core/optimization/computedUses.test.ts](../../tests/components-core/optimization/computedUses.test.ts) → describe block `"extractScopedState preserves Symbol-keyed component state across narrowing"`.

**Files:** `xmlui/src/components-core/rendering/ContainerUtils.ts`, `xmlui/tests/components-core/optimization/computedUses.test.ts`.

---

### Bug 28 (Group Q): ModalDialog Loses Lexical Context Variables During `computedUses`

**Symptom:** `ModalDialog.spec.ts` "Preserves $item context variable from Table Column" test failed:
```
Expected: "Acme Corp" (value of $item.name)
Received: "close" (close button text)
```
When ModalDialog opened inside Table → Column → MemoizedItem with `$item`, the context variable was lost.

**Cause:** Architectural problem in `extractScopedState(parentState, uses)`:

1. **ModalDialog as implicit container:** ModalDialog has `isImplicitContainerByDefault: true`.
2. **computedUses calculated:** ModalDialog used no parent variables → `computedUses = ["dialog"]` (own UID only).
3. **State filtering:** `extractScopedState(parentState, ["dialog"])` picked only `{dialog: ...}`.
4. **Lexical variables loss:** `$item` (populated by MemoizedItem from Column) didn't enter `uses` → removed from narrowed state → child Text received `{dialog: ..., $item: undefined}`.

**Fix:** [ContainerUtils.ts:extractScopedState](../../src/components-core/rendering/ContainerUtils.ts) — three layers of preservation:

1. **All Symbols** (as in Bug 27).
2. **All $-prefixed variables EXCEPT unstable global variables:**
   ```ts
   for (const key of Object.keys(parentState)) {
     if (
       typeof key === "string" &&
       key.startsWith("$") &&
       !UNSTABLE_GLOBAL_VARS.has(key) &&
       !(key in picked)
     ) {
       picked[key] = (parentState as any)[key];
     }
   }
   ```
   **Why exclude UNSTABLE_GLOBAL_VARS:** `$pathname`, `$routeParams`, `$queryParams`, `$linkInfo` — are navigation keys recomputed at every StateContainer. Their value objects are not reference-stable. Preserving them in narrowed state would trigger re-renders on every navigation, defeating optimization.
3. **Selected string-keys from `uses`** (as before).

**Files:** `xmlui/src/components-core/rendering/ContainerUtils.ts`, `xmlui/tests/components-core/rendering/ContainerUtils.test.ts`, `xmlui/src/components-core/optimization/optimizer-metadata.ts`.
