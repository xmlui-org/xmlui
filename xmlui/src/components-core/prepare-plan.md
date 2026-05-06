# XMLUI Parse / Transform-Time Preparation Plan

## Goal

Move work that the rendering pipeline currently performs _every render_ (or _on first eval, then memoizes_) into the **parse / transform phase** so it is computed exactly once per markup source. Cache the results on the `ComponentDef` (or attach them to the parsed expression / event ASTs).

This reduces:

- Per-render allocations and `useMemo` work.
- Repeated lazy parsing of `{expression}` strings.
- Dependency-collection and identifier-scope walks during evaluation.
- The fan-out of `parentState` to implicit containers (smaller `uses` sets → fewer re-renders).

---

## 1. What is _already_ prepared at transform time

Reference: `xmlui/src/parsers/xmlui-parser/transform.ts`.

| Item                      | How                                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Event handler statements  | `parseEvent()` → `{ __PARSED, statements, parseId }` is stored on `comp.events[name]` and `comp.api[name]`. |
| `<script>` / code-behind  | `processScriptTag()` → `comp.scriptCollected` (functions, vars, moduleErrors).                              |
| `uses` parsing            | `splitUsesValue(value)` (string → `string[]`).                                                              |
| Component ID uniqueness   | `seenUids` warns on duplicate IDs.                                                                          |
| Compound component shape  | Single nested component, vars hoisted, codeBehind path captured.                                            |
| Namespace resolution      | `getNamespaceResolvedComponentName`.                                                                        |
| Hoisted `scriptCollected` | `hoistScriptCollectedFromFragments`.                                                                        |

Everything else listed below currently happens **at render time**, often inside `useMemo` or `memoizeOne` caches keyed by the prop string.

---

## 2. Parse-time work the user explicitly proposed

These are first-class. Each is a new field on `ComponentDef` / `CompoundComponentDef`, populated by an additional pass after `nodeToComponentDef()`.

### 2.1 `requiresContainer: boolean`

Currently `isContainerLike(node)` runs inside `ComponentWrapper` via `useMemo`. It is a **pure function of the node shape** (`type === "Container"` OR any of `loaders | vars | uses | contextVars | functions | scriptCollected`).

- **Compute** during transform; store as `comp.requiresContainer`.
- **Use sites**: `ComponentWrapper.tsx:84` (`isContainerLike(...)`).
- **Bonus**: also precompute the `getWrappedWithContainer()` synthetic wrapper node (the shape never depends on runtime state) and store it on `comp.containerized`. Today this is recomputed every render — see `ContainerWrapper.tsx:184` and `:215`.

### 2.2 `uses` flow-down — precomputed per implicit container

Today, an implicit container (`uses === undefined`) receives **all** parent state via `extractScopedState(parentState, undefined)` → `parentState`. That is wasteful: the children only depend on a small subset of names.

- For every container subtree, walk all expressions inside it (props, `var`, event handlers, `<TextNode>` interpolation, `when`/`responsiveWhen`) and collect the set of _free_ identifiers (names not declared inside that subtree's own `vars`/`globalVars`/`functions`/`scriptCollected`/parameters).
- That set is the actual `uses` of the implicit container.
- **Store** as `comp.computedUses: string[]` (distinct from authored `comp.uses` so we can fall back when needed).
- **Component IDs flow down too.** Each component carries a `uid` (the authored `id` attribute). Identifiers that resolve to a sibling/ancestor component ID are accessed at runtime exactly like reactive variables (their entry in container state is keyed by the `id` string). Treat component IDs as part of the same name set: when collecting free identifiers, names that match a `uid` reachable from the parent container belong in `computedUses`. This lets implicit containers narrow their inherited state to only the IDs whose APIs they actually call (e.g., `myInput.value`, `dialog.open()`).
- **Effect**: `extractScopedState` now picks a small dictionary instead of returning the whole parent state, dramatically narrowing the change-detection surface in nested forms/lists.
- **Caveat**: Member-access roots are what matter (`obj.prop.nested` → only the root `obj` flows down). We already have this distinction in `collectVariableDependencies`.

### 2.3 Identifier classification per expression

For every parsed expression / event handler, walk the AST once and tag each `Identifier` node with its **resolved category**:

| Category       | Meaning                                                                                                                                                                                                                                                             | Runtime action                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `block`        | Declared inside this expression (let/const/param/destructure).                                                                                                                                                                                                      | No outer lookup.                                                               |
| `containerVar` | Matches a `vars`/`globalVars`/`functions` name in some enclosing container. Tag with the container's container-uid.                                                                                                                                                 | Direct read from that container's slice (skip the scope walk).                 |
| `componentId`  | Matches an `id` of a component reachable at this subtree.                                                                                                                                                                                                           | Direct API/state lookup keyed on the symbol.                                   |
| `contextVar`   | Matches a framework `$`-prefixed name allowed at this scope (`$item`, `$itemIndex`, `$param`, `$params`, `$result`, `$error`, `$pathname`, `$routeParams`, `$queryParams`, `$linkInfo`, `$data`, `$value`, `$setValue`, `$validationResult`, `$props`, `$slot`...). | Read directly from the contextVar layer; no other layer needs to be consulted. |
| `appContext`   | Recognised global helper (`Actions`, `navigate`, `goBack`, `toast`, `delay`, `App`, `Log`, `Clipboard`, `mediaSize`, `theme`, `appGlobals`, etc.).                                                                                                                  | Read from appContext directly.                                                 |
| `banned`       | Listed in `bannedMembers.ts` denylist or `bannedFunctions.ts`.                                                                                                                                                                                                      | Emit parse-time warning (W-series); runtime guard becomes a no-op.             |
| `globalThis`   | Anything not in any of the above.                                                                                                                                                                                                                                   | Same as today; only category requiring late binding.                           |

- Stored in-place on the `Identifier` AST node as `idScope: { kind, ownerUid?, contextLayer? }`.
- The runtime `getIdentifierScope()` (`eval-tree-common.ts:87`) becomes a one-line dispatch on `idScope.kind` for the vast majority of identifiers.
- For ambiguous cases (e.g., a `let foo` shadowing a parent var only on some branches), fall back to the current dynamic lookup. Mark the identifier `idScope.kind = "dynamic"`.

### 2.4 Precomputed dependency list per expression

Today `collectVariableDependencies()` is called the first time an expression is evaluated and memoized in `memoedVarsRef`. It still allocates a fresh `Set` per parse, walks the AST again, and consults `referenceTrackedApis` at runtime.

- Precompute the **static base** of dependencies (names that don't depend on `referenceTrackedApis`) at transform time. Store as `expr.deps: string[]` on each expression AST and `propValue.deps` on `ParsedPropertyValue`.
- The runtime path becomes: read `expr.deps` and only union the small reference-tracked set on demand.
- `useVars` (`variable-resolution.ts:82`) and `valueExtractor` (`valueExtractor.ts:115`) become significantly cheaper — both currently call `parseParameterString(value)` + `collectVariableDependencies(...)` on first access.

---

## 3. Eagerly parse all attribute / text expressions

This is the single biggest opportunity. Today, every prop value is stored as a **raw string** in `comp.props`; only `events` and `api` get pre-parsed. The parsing happens lazily through `parseAttributeValue` / `parseParameterString` (each calling `Parser.parseExpr()`) the first time the value is read.

### 3.1 `comp.props[k]` becomes `ParsedPropertyValue`

```ts
type ParsedPropertyValue = {
  __PARSED: true;
  parseId: number;
  pure: true | false;            // true = no expression segments; runtime returns `value` verbatim
  value?: string;                // present when pure = true
  segments?: Array<              // present when pure = false
    | { literal: string }
    | { expr: Expression; deps: string[]; idScope: ... }
  >;
};
```

- During transform, after collecting attributes, walk every entry in `comp.props`, `comp.vars`, `comp.globalVars`, `comp.contextVars`, `comp.when`, `comp.responsiveWhen[bp]` and replace the string with `ParsedPropertyValue`.
- Set `pure: true` when there is no `{` in the source (after escape handling) — a _huge_ fraction of all attributes (every literal label, URL, type, variant, etc.).
- `valueExtractor` short-circuits: `if (parsed.pure) return parsed.value`.
- Eliminates `parseParameterString` and `parseAttributeValue` from the hot path entirely.
- Eliminates the `memoedVarsRef.current.set(expressionString, …)` initial population cost (still useful for caching per-state evaluations, but the parse + dep-collection is already done).

### 3.2 Same treatment for `TextNode` children

Today, `renderChild()` calls `extractParam()` on the raw text of each `TextNode`. Pre-parse to `ParsedPropertyValue` at transform time and stamp it on the `TextNode` itself. (`TextNodeCData` is already opaque-string by design — leave it alone.)

### 3.3 Same treatment for `when` / `when-*`

`comp.when` and `comp.responsiveWhen[bp]` are raw strings today, but they may contain binding expressions just like any other prop value (e.g. `when="{user.isAdmin && hasPermission}"`, `when-md="{showOnMedium}"`, or even mixed-segment values). Parse them through the same `ParsedPropertyValue` pipeline as §3.1, so the runtime gets the pre-parsed AST + dep list rather than re-parsing on every render. Constant-fold the trivially-true / trivially-false cases to a `boolean` flag (`comp.alwaysVisible`, `comp.neverVisible`) — `renderChild` can short-circuit before any other work. Genuinely dynamic `when` values still go through normal evaluation, but with the parse and dep collection already done.

---

## 4. Structural transformations now done in `ComponentWrapper`

The `useMemo` pipeline at `ComponentWrapper.tsx:48-82` runs four transformations on every component on every render. None of them depends on runtime state (with one exception, noted below). All four can be done once in transform.

### 4.1 `childrenAsTemplate`

`transformNodeWithChildrenAsTemplate` moves children to a named prop when the component descriptor declares `childrenAsTemplate: "<propName>"`. The descriptor is metadata available at registration time.

- **Plan**: at transform time we don't have access to component metadata directly (the markup parser must remain decoupled from the runtime registry). Solution: do a _post-transform_ preparation pass in `parseXmlUiMarkup()` (or a sibling `prepareComponentDef()` step) that takes the `ComponentRegistry` (or a metadata map) and rewrites the node. In **standalone mode** this runs in the browser once at app startup; in **Vite mode** the registry is known at build time.
- The rewritten node has a fixed `props[childrenAsTemplate] = children; children = []` — never recomputed.

### 4.2 `transformNodeWithChildDatasource`

Pure structural — depends only on which children have `type === "DataSource"` (plus the `Fragment + scriptCollected` special case at `ComponentWrapper.tsx:172`). Move to transform: produce `comp.loaders` directly, drop the DataSource children. Today this allocates a new node every render.

### 4.3 `transformNodeWithDataSourceRefProp`

Replaces `props[k]` with `{ type: "DataSourceRef", uid }` when the resolved value matches a known loader. The set of loader UIDs in scope is statically computable.

- For every prop expression that is _purely_ a single identifier matching a loader UID, rewrite to `{ type: "DataSourceRef", uid }` at transform time.
- For dynamic cases (computed loader id) the runtime path stays. Note this happens rarely.

### 4.4 `transformNodeWithDataProp`

The exception: it depends on `extractParam(state, props.data, ...)` returning `string` (URL) vs object (resolved DS). However:

- If the `data` prop is a _literal string_ with no expression segments → safe to rewrite to an implicit `<DataSource>` at transform time.
- If the `data` prop is `{loaderId}` → already covered by 4.3.
- Only the genuinely dynamic case (`data="{maybeUrl}"` where `maybeUrl` flips at runtime) needs the runtime check.

### 4.5 `transformNodeWithRawDataProp`

Pure — `raw_data` → `data` + `__DATA_RESOLVED: true`. Move to transform.

---

## 5. Behavior pre-binding

Reference: `behaviors/behaviorConditionEvaluator.ts`, `wrapcomponent.md`.

`canBehaviorAttachToComponent()` evaluates a static condition tree against `(componentType, metadata, props, events, apis, contextVars)`. _None_ of the evaluator's inputs depend on runtime state — they are all metadata and node-shape.

- For every node, compute the _list_ of behaviors that **may** attach (`{ behaviorName, attachConditionsHash }[]`). Store as `comp.applicableBehaviors`.
- ComponentAdapter's behavior loop iterates this short precomputed list instead of every registered behavior.
- For behaviors whose `canAttach` only depends on node shape (e.g., `BookmarkBehavior` — `nonVisual` check), the attach/skip decision is **final at transform**. Tag those as `attach: "always"` or `attach: "never"`.
- Behaviors with prop-value dependencies (e.g., `validationBehavior` on `validationState`) need a runtime check, but only the prop is read — store the prop name to read.

Also note: `isCompoundComponent === true` skips behaviors entirely. That flag is also known after transform (it's whether the type resolves to a `CompoundComponentDef`).

---

## 6. ApiBound detection

`ComponentAdapter.tsx:264-272` scans `node.props` and `node.events` every render to decide whether to wrap in `ApiBoundComponent`. The detection is purely structural (which prop values are `DataSource`/`DataSourceRef`, which events are `APICall`/`FileDownload`/`FileUpload`).

- Compute `comp.apiBound: { props: string[]; events: string[] } | null` at transform.
- Runtime: `if (!comp.apiBound) skip ApiBoundComponent wrap.`

---

## 7. Layout property classification

`ComponentAdapter.tsx:389-417` calls `parseLayoutProperty(key)` on **every prop key** of **every node** of **every render**, in order to identify part/breakpoint/state-suffixed layout props. The parse is purely a function of the key string.

- During transform, partition `comp.props` into:
  - `comp.layoutProps: { key, parsed }[]` — keys that pass `parseLayoutProperty` and have a part/breakpoint/state suffix.
  - `comp.baseLayoutProps: string[]` — keys in `layoutOptionKeys`.
  - `comp.regularProps: string[]` — everything else.
- Render-time loops iterate the precomputed slice instead of `Object.keys(safeNode.props)`.

---

## 8. Compound component metadata

`generateUdComponentMetadata()` (in `udMetadata` / `CompoundComponentRenderer`) scans the template AST for `$props.X` accesses to derive the prop schema of a user-defined component. Today this happens lazily on first use of the compound component.

- During transform, when `CompoundComponentDef` is built, walk the nested template tree once. Collect:
  - `compound.derivedProps: string[]` (from `$props.X` reads).
  - `compound.derivedEvents: string[]` (from `emitEvent("Y", ...)` calls — already an event name string literal in 99% of cases).
  - `compound.usesSlots: { name: string }[]` (from `<Slot name="x" />` occurrences).
- Stored on `CompoundComponentDef` and surfaced via the registry's `descriptor`.

---

## 9. `<Slot/>` wiring

Slot resolution (`renderChild`'s `Slot` branch) walks `parentRenderContext` at runtime to find slot children by name.

- **Applies only when the slot `name` is a pure literal string** (no `{}` interpolation). The XMLUI markup grammar effectively guarantees this in practice (slot names sit in `<Slot name="...">` and `<property name="...">` where dynamic names would not make sense), but the implementation must still verify the value is `pure: true` and skip the optimisation otherwise.
- During transform, build a `compound.slotMap: Record<slotName, ComponentDef[]>` for the _default content_ (the `<Slot>` body) so the runtime needs only one keyed lookup with a fallback.
- For consumers (call sites), pre-bucket children by which slot they target (`<property name="<slotName>">…</property>`) so the runtime doesn't filter per render.
- If a slot or property name turns out to be an expression, fall back to the current runtime-walk path.

---

## 10. `bubbleEvents`, `testId`, `uid` — short-circuit pure values

**This section only applies to raw string values or binding expressions whose contents are entirely static (no expression segments).** When any of these props contain `{...}` interpolation, leave the runtime path unchanged.

- `bubbleEvents="['click','focus']"` → if the value is a literal JSON-style array string, parse to `string[]` at transform. If it contains a binding expression, evaluate at runtime as today.
- `testId="foo"` → when `pure: true`, mark and runtime skips `extractParam`. When the value contains `{}`, evaluate as today.
- `id` → already stored verbatim at transform. The optimisation is to assert at parse time that no `{}` interpolation is present (component IDs must be static for ID-based resolution to work); if any is found, treat that as a parser warning and fall back to the dynamic path.

---

## 11. Constant folding inside expressions

`simplify-expression.ts` already does some folding. Apply it eagerly at transform on every parsed expression so the runtime evaluator never sees `0 + x` or `2 + 3`.

- Run `simplifyExpression()` once per AST during transform; replace the AST in-place.

---

## 12. Pre-parse `keybinding` strings

`parsers/keybinding-parser` runs at runtime today. Keybinding strings in markup are typically static (e.g. `<Keyboard binding="CmdOrCtrl+S" .../>`).

- **This optimisation only applies when the `binding` value is a pure string literal** (no `{}` segments). Verify `pure: true` on the prop and only then run `parseKeyBinding()` at transform, storing the resolved `ParsedKeyBinding`.
- If the binding is dynamic (`binding="{userKeyChoice}"`), keep the current runtime parse path.

---

## 13. Pre-parse `style`-typed prop values

Style-parser invocations (`asSize`, `asBorder`, `parseSize`) happen at runtime. For literal CSS values (`width="200px"`), pre-parse to `SizeNode` at transform — runtime is a direct read.

- Hook into the same `pure` short-circuit from §3: if a prop's metadata says `valueType: "size" | "border" | "color"` and the source has no `{}`, run the corresponding `StyleParser` method now and store the result.

---

## 14. Suggested `ComponentDef` additions

```ts
interface ComponentDef {
  // existing fields...

  // §2.1
  requiresContainer?: boolean;
  containerized?: ComponentDef;

  // §2.2
  computedUses?: string[];

  // §3
  // (props/vars/globalVars/contextVars/when become Record<string, ParsedPropertyValue>)

  // §4
  loadersResolved?: boolean; // childDatasource pass already applied
  dataResolved?: boolean; // dataProp pass already applied (when statically decidable)

  // §5
  applicableBehaviors?: Array<{
    name: string;
    attach: "always" | "never" | "runtime";
    runtimePropName?: string;
  }>;

  // §6
  apiBound?: { props: string[]; events: string[] } | null;

  // §7
  layoutPropClassification?: {
    base: string[];
    extended: Array<{ key: string; parsed: ParsedLayoutProp }>;
    regular: string[];
  };

  // §10 / §11 already in-place via ParsedPropertyValue

  // §12
  keybinding?: ParsedKeyBinding;
}

interface CompoundComponentDef {
  // existing fields...
  derivedProps?: string[];
  derivedEvents?: string[];
  usesSlots?: string[];
}
```

---

## 15. What must remain at render time

Not everything can move. The hot-path render still owns:

- Reactive **values** of expressions (depend on container state).
- `extractScopedState`'s actual picking (uses the precomputed `uses` set, but reads parent state).
- Two-pass variable resolution for forward references.
- `useReducer` dispatch / proxy mutation tracking.
- Theme class generation (`useComponentThemeClass`) — depends on theme context.
- Resource URL resolution via `useTheme().getResourceUrl()`.
- The `data` prop's runtime URL/object distinction in genuinely dynamic cases (§4.4).
- Behavior conditions whose truth depends on runtime prop values.

---

## 16. Implementation order

The work is split into two phases:

- **Phase A — Prepare and verify.** Add the new fields to `ComponentDef` / `CompoundComponentDef` / parsed AST nodes and populate them, **without** changing any render-time consumer. The goal is that all existing unit tests and all existing E2E tests still pass exactly as before, while a new battery of unit tests verifies that the prepared data is correct for a wide range of markup. Phase A is a pure information-gathering pass; rendering does not look at the new fields yet.
- **Phase B — Switch over consumers, one step at a time.** Each step replaces a render-time computation with a read of the precomputed field, behind a feature flag (e.g., `appGlobals.usePreparedX`). Each step lands its own dedicated unit + E2E tests, then the flag is removed once the green run is stable.

Mark every step with **(transform-time)** if it can be done by `vite-xmlui-plugin` and survives serialisation, or **(boot-time)** if it must run when `StandaloneApp` initialises (because it depends on the runtime registry / metadata).

---

### Phase A — Build the parse/transform preparation

Each Phase A step adds preparation logic and unit tests that read back the prepared structure. **No render-time consumer changes.** The existing test suite (`pnpm test` for unit, `pnpm test:e2e` for E2E) must pass unchanged at the end of every step.

#### A1. Pre-parse all attribute / text expressions (§3) — **transform-time**

Walk every `comp.props`, `comp.vars`, `comp.globalVars`, `comp.contextVars`, `comp.when`, `comp.responsiveWhen[bp]`, and every `TextNode` text value. Replace strings with `ParsedPropertyValue` objects. Set `pure: true` for values without `{}` segments.

Unit tests:

- Parse a markup with literal-only props (`label="hello"`, `width="200px"`) — assert all are `pure: true` with `value` set and no `segments`.
- Parse interpolated props (`value="Count: {count}"`) — assert mixed literal + expression segments, expression AST present.
- Parse pure expression (`value="{count}"`) — assert single `expr` segment, no literals around it.
- Parse escaped braces (`value="\\{ literal }"`) — assert `pure: true` and the unescaped literal value.
- Parse object/array literal expressions (`data="{ ['a','b'] }"`) — assert single `expr` segment with `T_ARRAY_LITERAL`.
- Parse `<Text>Hello {name}</Text>` — assert the `TextNode`'s `parsed` field has the right segments.
- Parse `when="{a > b}"` — assert it becomes a `ParsedPropertyValue`.
- Parse `when-md="{x}"` — same for responsive `when-*`.
- Parse `<TextNodeCData>` — assert it is **not** parsed (stays opaque).
- Round-trip through `vite-xmlui-plugin` serialisation: parsed values survive intact (no `Function`/non-serialisable references on parsed AST nodes).
- Negative: malformed expression (`value="{1 +"`) reports the same parser diagnostic that the runtime would have raised, with original source positions.

E2E tests:

- All existing tests pass unchanged. (Phase A introduces no rendering behaviour change.)

#### A2. Constant folding (§11) — **transform-time**

Run `simplifyExpression()` on every parsed expression after A1.

Unit tests:

- `{2 + 3}` folds to `{5}`.
- `{0 + count}` folds to `{count}`.
- `{1 * count}` folds to `{count}`.
- `{true ? a : b}` folds to `{a}`.
- `{false ? a : b}` folds to `{b}`.
- Folding is idempotent (running twice = running once).
- Folding does not mutate the original source string stored alongside (for inspector).

#### A3. Per-expression dependency lists (§2.4) — **transform-time**

After A1+A2, walk every parsed expression and store `expr.deps: string[]` plus `parsedValue.deps` aggregated across segments.

Unit tests:

- `{count}` → deps `["count"]`.
- `{a + b * c}` → deps `["a", "b", "c"]`.
- `{user.name}` → deps `["user"]` (root only).
- `{user["name"]}` (literal computed access) → deps `["user"]` and the runtime form is consistent.
- `{(x) => x + count}` → deps `["count"]` (`x` is block-scoped).
- `{let r = 1; r + count}` (in event handler) → deps `["count"]`.
- `{$item.name}` → deps `["$item"]`.
- Pure literal value → deps `[]`.

#### A4. Identifier classification (§2.3) — **boot-time**

Walk every parsed expression in the tree from the root. Maintain a stack of declarations (`vars`, `globalVars`, `functions`, `scriptCollected`, component IDs, recognised context vars per scope, banned names). Tag each `Identifier` AST node with `idScope: { kind, ownerUid?, contextLayer? }`. Marks identifiers as `dynamic` when classification is ambiguous.

Unit tests:

- Identifier matching a `vars` name on the same component → `containerVar` with `ownerUid` set.
- Identifier matching an authored `id` of a sibling → `componentId` with `ownerUid`.
- `$item` inside `<List>` → `contextVar` with `contextLayer: "$item"`.
- `$param` inside an APICall event handler → `contextVar`.
- `Actions` → `appContext`.
- `navigate`, `toast`, `delay`, `App.fetch` root → `appContext`.
- `eval`, `setTimeout`, `document` → `banned` (and a parse-time warning is emitted).
- `let foo` shadowing a parent `vars.foo` only on one branch → `dynamic`.
- Block-scoped param `(x) => x` → `block`.
- A name not declared anywhere in the tree → `globalThis`.
- Compound component template referencing `$props.something` → `contextVar` (`$props`).
- A change to the parent container's vars invalidates the cached classification (verified by re-classifying the whole tree from scratch on every `prepareComponentDef` call).

#### A5. `requiresContainer` flag + precomputed wrapper (§2.1) — **transform-time** (flag) / **boot-time** (wrapper, since serialisation roundtripping is fine)

Set `comp.requiresContainer` based on the same rule as `isContainerLike`. Build `comp.containerized` for nodes that need wrapping.

Unit tests:

- `<Stack>` with no state attributes → `requiresContainer === false`, no `containerized`.
- `<Stack var.count="0">` → `requiresContainer === true`; `containerized.type === "Container"`; original node moved to `children[0]` with `vars` stripped.
- `<Container>` → `requiresContainer === true`; `containerized` is the node itself (no extra wrap).
- `<Stack uses="['a']">` → `requiresContainer === true`; explicit container.
- `<Stack>` with `<DataSource>` child → after A6's loader extraction, `requiresContainer === true`.
- `<Stack>` with `scriptCollected` from a `<script>` block → `requiresContainer === true`.
- The shape of `containerized` matches exactly what `getWrappedWithContainer()` produces today (compare for parity).

#### A6. Structural transforms moved to prep (§4) — **boot-time** (`childrenAsTemplate` and `DataSourceRef` need registry + uid map; `childDatasource`, `dataProp` literal, `rawDataProp` are transform-time-safe but rely on knowing which props are loader refs, so are simplest to do all at boot)

Apply the four (now five with A6.4) transforms once during preparation:

- A6.1 `transformNodeWithChildrenAsTemplate` (needs descriptor — boot-time)
- A6.2 `transformNodeWithChildDatasource` (transform-time-safe)
- A6.3 `transformNodeWithDataSourceRefProp` for prop expressions that are pure single identifiers matching a loader uid (boot-time, needs uid map)
- A6.4 `transformNodeWithDataProp` for the *literal-string* `data` case (transform-time-safe; the dynamic case stays at runtime)
- A6.5 `transformNodeWithRawDataProp` (transform-time-safe)

Unit tests:

- Component with `descriptor.childrenAsTemplate = "rowTemplate"` and children → children moved into `props.rowTemplate`, `children` empty.
- `<Stack><DataSource id="ds" url="..."/></Stack>` → `comp.loaders` contains a `DataLoader` entry with the right uid; `comp.children` no longer has the DataSource.
- `<Table data="{ds}">` where `ds` is a known loader → `props.data` rewritten to `{ type: "DataSourceRef", uid: ... }`.
- `<Table data="https://api/users">` (literal URL) → `props.data` rewritten to implicit `<DataSource>` node.
- `<Table data="{maybeUrl}">` (dynamic) → unchanged at prep, runtime path still kicks in.
- `<Table raw_data="{...}">` → `data: ...` and `__DATA_RESOLVED: true`.
- The Fragment + scriptCollected special case is handled (cf. `ComponentWrapper.tsx:172`).

#### A7. apiBound detection (§6) — **boot-time** (needs to know which prop/event values resolve to DataSource/APICall components after A6 has run)

Compute `comp.apiBound: { props: string[]; events: string[] } | null`.

Unit tests:

- Component with no API-bound props/events → `apiBound === null`.
- `<Component data="{ds}">` (after A6.3 rewrite to `DataSourceRef`) → `apiBound.props === ["data"]`.
- `<Button onClick="<APICall .../>">` → `apiBound.events === ["click"]`.
- `<Button onClick="<FileDownload .../>">` → `apiBound.events === ["click"]`.

#### A8. Layout property classification (§7) — **boot-time** (parse is static, but partitioning depends on `layoutOptionKeys` which is registry-influenced)

Compute `comp.layoutPropClassification = { base, extended, regular }`.

Unit tests:

- `width="200px"` → `base: ["width"]`.
- `fontSize-md="14px"` → `extended` includes `{ key: "fontSize-md", parsed: { property: "fontSize", screenSizes: ["md"], ... } }`.
- `padding-input-Button="4px"` → `extended` with part name `"input"`.
- `borderColor-Button--focus="red"` → `extended` with `states: ["focus"]`.
- `label="hello"` → `regular: ["label"]`.
- Invalid keys (e.g., gibberish) end up in `regular`.

#### A9. Behavior pre-binding (§5) — **boot-time** (needs registered behaviors)

Compute `comp.applicableBehaviors: { name, attach: "always"|"never"|"runtime", runtimePropName? }[]`.

Unit tests:

- `<Button>` with no `tooltip` prop → `tooltipBehavior` is **not** in the list (or is `attach: "never"`).
- `<Button tooltip="...">` → `tooltipBehavior` is `attach: "always"`.
- `<NumberBox>` with `validationState` prop → `validationBehavior` is `attach: "runtime"` with `runtimePropName: "validationState"`.
- Compound (user-defined) component → `applicableBehaviors === []` (never attached).
- `<DataSource>` (nonVisual) → behaviors guarded by `visual` condition are pruned.
- The list order matches the registered behavior order (innermost-first stays innermost).

#### A10. `computedUses` for implicit containers (§2.2) — **boot-time** (depends on A4 identifier classification and the uid map)

For every implicit container, collect all free identifiers (vars + reachable component IDs) referenced by descendants. Store as `comp.computedUses`.

Unit tests:

- `<Stack var.a="0" var.b="0"><Text>{a}</Text></Stack>` — outer container's `computedUses` excludes `b` if no descendant uses `b`.
- Nested `<Stack var.x="0"><Stack var.y="0"><Text>{x + y}</Text></Stack></Stack>` — inner implicit container's `computedUses` includes `x` (free in inner subtree).
- Component-id reach: `<TextBox id="t" /><Stack><Text>{t.value}</Text></Stack>` — outer's `computedUses` includes `t`.
- Deep member access: `{user.profile.name}` contributes only `user` to `computedUses`.
- An identifier that is shadowed by a child's `var` is not double-counted in the parent's `computedUses` (only what is genuinely free at the parent level).
- An identifier that resolves to an `appContext` global (`Actions`, `navigate`, etc.) is **not** in `computedUses` (no inheritance from parent state needed).

#### A11. Compound component metadata (§8) — **boot-time** (or transform-time if registry-independent)

Walk the compound component's template + code-behind. Store `derivedProps`, `derivedEvents`, `usesSlots`.

Unit tests:

- `<Component name="X"><Text>{$props.title}</Text></Component>` → `derivedProps === ["title"]`.
- `<Component name="X"><Button onClick="emitEvent('saved', $props.value)" /></Component>` → `derivedEvents === ["saved"]`, `derivedProps === ["value"]`.
- `<Component name="X"><Slot/></Component>` → `usesSlots === ["default"]`.
- `<Component name="X"><Slot name="header"/><Slot name="footer"/></Component>` → `usesSlots === ["header", "footer"]`.
- `$props` access inside an event handler is also collected.
- `$props` access inside `.xmlui.xs` code-behind is also collected.

#### A12. Slot pre-bucketing (§9) — **boot-time**, **only for pure-literal slot names**

Build `compound.slotMap` and bucket call-site children by slot name. Skip if the slot/property name is an expression.

Unit tests:

- `<MyCard><property name="header">...</property><Text>body</Text></MyCard>` → call-site has `slotChildren.header` = the property children, `slotChildren.default` = the bare `<Text>`.
- `<property name="{slotName}">...</property>` — name is dynamic → bucketing is skipped, runtime fallback applies.
- Component definition with `<Slot/>` only (no name) → `slotMap.default` exists.
- Mixed: `<Slot name="x"/>` and `<Slot/>` → both `slotMap.x` and `slotMap.default` exist.

#### A13. Pre-parse pure-literal `bubbleEvents` / `testId` / `id` (§10) — **transform-time**

Only transform values that are `pure: true` after A1.

Unit tests:

- `bubbleEvents="['click','focus']"` (literal string) → stored as `string[]`.
- `bubbleEvents="{['click','focus']}"` (expression) → unchanged; runtime evaluation still applies.
- `testId="login-btn"` → `pure: true`.
- `testId="btn-{i}"` → not pure; runtime still extracts.
- `id="myInput"` → stored as authored.
- `id="my-{x}"` (interpolation present) → emit a parser warning; runtime fallback path applies.

#### A14. Pre-parse pure-literal keybindings (§12) — **transform-time**

Only when `binding` is `pure: true`.

Unit tests:

- `<Keyboard binding="CmdOrCtrl+S" />` → stored as `ParsedKeyBinding`.
- `<Keyboard binding="{userKey}" />` (dynamic) → not pre-parsed; runtime path applies.
- Invalid pure-literal binding (e.g. `"???"`) → parser-time error with source position.

#### A15. Pre-parse pure-literal style-typed values (§13) — **boot-time** (needs metadata to know which prop has which `valueType`)

Only when the prop is `pure: true` AND its metadata `valueType` is `"size" | "border" | "color"`.

Unit tests:

- `width="200px"` (size) → stored as `SizeNode { value: 200, unit: "px" }`.
- `width="{200}"` → not pure; runtime path applies.
- `borderColor="#FF0000"` (color) → stored as `ColorNode`.
- `border="2px solid #000"` (border) → stored as `BorderNode`.
- Theme-id sizes (`width="$space-md"`) → stored as `ThemeIdDescriptor`.

#### Phase A exit criteria

- All existing unit tests pass.
- All existing E2E tests pass.
- All new unit tests above pass.
- Memory and serialisation footprint of `ComponentDef` measured (record baseline before/after).
- No render-time consumer reads the new fields yet.

---

### Phase B — Switch render-time consumers to the prepared data

Each Phase B step replaces a render-time computation with a read from the field populated in Phase A. Each step is feature-flagged (`appGlobals.preparedXyz`) so it can be enabled per app and rolled back if a regression appears. After the flag has been on for a release with no regressions, the flag and the legacy code path are removed.

Order is chosen so that low-risk wins ship first:

#### B1. Use `pure` short-circuit in `valueExtractor` (§3.1)

Replaces `parseParameterString` / `parseAttributeValue` calls in the hot path.

Tests: regression run of value-extraction tests across every component; new unit test asserts no `Parser.parseExpr()` is called when extracting from a pre-parsed pure value (mock the parser and count invocations).
E2E: all existing pages still render identically. Add a perf-counter test that opens a heavy page (e.g. the Tube Stops sample) and asserts a parse-call drop ≥ 80%.

#### B2. Use precomputed `expr.deps` in `valueExtractor` and `useVars` (§2.4)

Replaces `collectVariableDependencies` calls.

Tests: every existing reactivity test still passes (mutate a variable → dependent expressions re-evaluate). New unit test confirms `collectVariableDependencies` is **not** invoked when the AST already carries `deps`.
E2E: full E2E run of reactive forms / live data pages.

#### B3. Use precomputed `idScope` in `eval-tree-common.getIdentifierScope` (§2.3)

Replaces the multi-layer scope walk for tagged identifiers; `dynamic` identifiers fall through to the legacy walk.

Tests: every identifier-resolution edge case (var shadowing, closures, $-prefixed names, banned names) — covered by new and existing unit tests; verify `dynamic` fallback still works.
E2E: full run of complex apps (Test bed apps with deeply nested compound components and code-behind functions).

#### B4. Use `requiresContainer` + `containerized` in `ComponentWrapper` (§2.1)

Replaces `isContainerLike(...)` and `getWrappedWithContainer(...)` `useMemo` calls.

Tests: existing container tests (`StateContainer.spec.tsx`, `Container.spec.tsx`); new unit test mounts a node and asserts the container shape is structurally identical to the legacy code's output.
E2E: existing tests for components with `vars`, `loaders`, `uses`, code-behind.

#### B5. Use prep-pass results from §4 in `ComponentWrapper` (§4)

Replaces the `useMemo` chain at `ComponentWrapper.tsx:48-82`.

Tests: every existing data-source / `data="..."` test, plus tests for the dynamic-data fallback (the `transformNodeWithDataProp` runtime case).
E2E: data-driven sample apps (DataSources, Forms with API calls, Tables with DataSourceRef props).

#### B6. Use `apiBound` flag (§6)

Replaces the `useMemo` scan in `ComponentAdapter.tsx:264`.

Tests: one regression test per API-bound case (DataSource prop, APICall event, FileDownload, FileUpload); negative test that nothing extra is wrapped when `apiBound === null`.
E2E: pages that use `<APICall>` events and DataSource-bound components.

#### B7. Use `layoutPropClassification` (§7)

Replaces the per-render `Object.keys(safeNode.props)` + `parseLayoutProperty(key)` loop.

Tests: regression tests for all part/breakpoint/state-suffixed layout props; verify generated CSS class identical before/after.
E2E: theming + responsive layout pages render identically across viewport sizes.

#### B8. Use `applicableBehaviors` (§5)

Replaces the per-render iteration over all registered behaviors.

Tests: each behavior (label, animation, tooltip, variant, bookmark, formBinding, validation) — pages exercising each; verify behaviors still attach and order is preserved. Verify compound components still skip behaviors entirely.
E2E: forms (FormBinding + Validation), tooltips on buttons, bookmarks on headings.

#### B9. Use `compound.derivedProps` / `derivedEvents` / `usesSlots` (§8)

Replaces lazy `generateUdComponentMetadata`.

Tests: user-defined components — each props/events/slots metadata surface is identical to the legacy lazy-derived version.
E2E: the Tube Stops sample (heavily compound).

#### B10. Use `compound.slotMap` and call-site slot bucket (§9)

Replaces the runtime walk over `parentRenderContext`.

Tests: components with default slot, named slots, multiple slots; expression-named slots fall back to legacy path.
E2E: ModalDialog with slotted content; Card with named header/footer slots.

#### B11. Use `computedUses` for implicit containers (§2.2)

**Most invasive** — changes which parent state names propagate into an implicit container. Run *last*. Behind a feature flag for an extra release before removing the legacy path.

Tests:
- New unit tests: each implicit container in a test markup gets the expected narrow `computedUses`.
- Regression: every existing test that mutates a parent variable and expects a child to update still works.
- Negative test: a name that is genuinely unused by the subtree is **not** in `computedUses` and assigning to it from inside the subtree (which would have bubbled before) does NOT bubble — confirm the new semantics with a deliberate test, and document the change in the upgrade notes.
- Stress test: deeply nested implicit containers (5+ levels) with overlapping var names and component IDs.

E2E:
- Full E2E suite.
- A focused performance E2E that mutates a variable in a large list and measures re-render count (expect a meaningful drop because narrower `uses` short-circuits more `useMemo`s).

#### B12. Use pre-parsed `bubbleEvents` / `testId` / `id` (§10)

Replaces the per-render `extractParam` calls when the value is `pure`.

Tests: regression on `testId` selectors used by E2E; `bubbleEvents` array passed unchanged.
E2E: every E2E test relies on `testId` — full run is the regression check.

#### B13. Use pre-parsed `keybinding` (§12)

Replaces `parseKeyBinding()` at runtime for static bindings.

Tests: each `<Keyboard>` binding test in unit + E2E.
E2E: keyboard shortcut sample.

#### B14. Use pre-parsed style-typed values (§13)

Replaces `StyleParser` invocations in the layout resolver for pure literals.

Tests: every theme variable / size / border parsing unit test still passes.
E2E: theming sample, responsive sample.

#### B15. Use folded expressions (§11)

Replaces evaluation of trivial-arithmetic expressions with the folded constant.

Tests: golden output of expression evaluation is unchanged for hundreds of expressions across the test markup corpus; folded case observably bypasses `eval-tree-sync`.
E2E: full run.

#### Phase B exit criteria (per step)

- All unit tests (existing + new) pass with the flag ON.
- All E2E tests pass with the flag ON.
- A focused micro-benchmark shows the targeted operation is measurably faster (parse-call count drop, render-count drop, or wall-time drop on a representative page).
- The flag has been on in CI for ≥ 1 week with no regressions reported.
- Then: remove the flag and delete the legacy path in a follow-up commit.

---

The `__PARSED` marker pattern is already established for events; reuse it for the prop-value parsing introduced in A1 to keep migration mechanical. Tests live alongside existing suites: parser-level unit tests under `xmlui/tests/parsers/`, runtime/integration tests in the `xmlui-test/` package or the relevant component's test file, and E2E tests in the `xmlui-test/tests-e2e` tree.

---

## 17. Risks & open questions

- **Standalone vs Vite mode — two-stage preparation.** The `vite-xmlui-plugin` performs the parse/transform phase at build time and serialises the resulting `ComponentDef` into the `runtime` parameter passed to `StandaloneApp`. Anything we compute purely from the markup (§3 expression pre-parsing, §2.4 dep lists, §11 constant folding, §3.3 `when` parsing, §10 pure-literal `testId`/`bubbleEvents` parsing, §12 keybinding parsing for pure values, §13 style values for pure literals) belongs in this stage and travels through serialisation. Anything that needs the runtime component registry / metadata / loader-uid map (§2.1's wrapper-node precompute that needs descriptor, §2.2's `computedUses` that needs to know which IDs are reachable, §2.3 identifier classification that needs appContext keys and registered behaviors, §4.1 `childrenAsTemplate`, §4.3 `DataSourceRef` rewriting, §5 behavior pre-binding, §6 apiBound, §7 layout-prop classification, §8 compound metadata that depends on registry types, §9 slot map) must run **once when `StandaloneApp` is initialised**, after the registry is populated but before the first render. Concretely: introduce a `prepareComponentDef(comp, registry, ctx)` helper that walks the tree and fills these fields. Call it from `StandaloneApp` boot. The result is cached on the `ComponentDef` so subsequent renders read directly. (Mark each preparation step explicitly as "transform-time" or "boot-time" in the implementation order below.)
- **Source-map / inspector fidelity.** Pre-parsing and constant-folding loses original-source positions. Keep `source` strings on `ParsedPropertyValue` (mirroring `ParsedEventValue.source`) under a dev-mode flag.
- **Identifier classification staleness.** A precomputed `idScope` becomes wrong if a parent container's `vars` or `id` set changes. Mark `idScope` keyed on a hash of the enclosing scope's declarations and bust on mismatch — easy because the markup is immutable post-parse.
- **`uses` narrowing (§2.2)** changes observable state-bubble semantics for _implicit_ containers. Mutations to a name not in `computedUses` would no longer reach the parent. Verify with the existing dispatching tests in `tests/components/StateContainer.spec.tsx` (and friends) before flipping this on.
- **Compound metadata derivation (§8)** must respect `$props` accesses inside _event handlers_ and _code-behind_ — those ASTs exist at transform time, so the walk is straightforward.
