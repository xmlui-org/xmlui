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

`comp.when` and `comp.responsiveWhen[bp]` are raw strings today. Parse once. Constant-fold trivially-true / trivially-false `when` to a `boolean` flag (`comp.alwaysVisible`, `comp.neverVisible`) — `renderChild` can short-circuit before any other work.

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

Slot resolution (`renderChild`'s `Slot` branch) walks `parentRenderContext` at runtime to find slot children by name. Slot names are _static strings_ in the markup.

- During transform, build a `compound.slotMap: Record<slotName, ComponentDef[]>` for the _default content_ (the `<Slot>` body) so the runtime needs only one keyed lookup with a fallback.
- For consumers (call sites), pre-bucket children by which slot they target (`<property name="<slotName>">…</property>`) so the runtime doesn't filter per render.

---

## 10. `bubbleEvents`, `testId`, `uid` — short-circuit pure values

All three are usually static literals.

- `bubbleEvents="['click','focus']"` → parse to `string[]` at transform.
- `testId="foo"` → mark `pure: true`; runtime skips `extractParam`.
- `id` → already a string at transform; ensure no `{}` interpolation at transform (currently the value is just stored verbatim).

---

## 11. Constant folding inside expressions

`simplify-expression.ts` already does some folding. Apply it eagerly at transform on every parsed expression so the runtime evaluator never sees `0 + x` or `2 + 3`.

- Run `simplifyExpression()` once per AST during transform; replace the AST in-place.

---

## 12. Pre-parse `keybinding` strings

`parsers/keybinding-parser` runs at runtime today. Keybinding strings in markup are static (e.g. `<Keyboard binding="CmdOrCtrl+S" .../>`).

- During transform, parse all `<Keyboard>` `binding` props and store the `ParsedKeyBinding` directly.

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

## 16. Suggested implementation order

1. **§3 first** — pre-parse all attribute / text expressions and add `pure` short-circuit. Biggest immediate win, fewest moving parts. Largely contained in `transform.ts` + `valueExtractor.ts` + `variable-resolution.ts`.
2. **§2.4 + §2.3** — precompute per-expression deps and identifier classification. Builds on §3.
3. **§2.1** — `requiresContainer` flag + precomputed wrapper node.
4. **§4** — move structural transforms into transform pass.
5. **§6 / §7** — apiBound / layout classification flags.
6. **§5** — behavior pre-binding (needs registry coupling — do after the easier wins).
7. **§2.2** — `computedUses` for implicit containers (most invasive: changes the state-fanout model; needs careful test coverage on the existing Container/StateContainer reducer).
8. **§8 / §9** — compound component prop / slot derivation.
9. **§11 / §12 / §13** — constant folding, keybinding, style-typed values.

Each step should be guarded by tests in `xmlui/tests/` (the parser has its own suite under `xmlui/tests/parsers/` and the rendering pipeline is covered by E2E + integration tests). The `__PARSED` marker pattern is already established for events; reuse it for the prop-value parsing introduced in §3 to keep migration mechanical.

---

## 17. Risks & open questions

- **Standalone vs Vite mode.** All transforms must run in the browser too. Pure-AST work is fine; anything that needs the component registry (§4.1, §5) must be staged so it runs _after_ registry setup but _before_ first render. A `prepareComponentDef(comp, registry)` helper invoked once on app boot solves this.
- **Source-map / inspector fidelity.** Pre-parsing and constant-folding loses original-source positions. Keep `source` strings on `ParsedPropertyValue` (mirroring `ParsedEventValue.source`) under a dev-mode flag.
- **Identifier classification staleness.** A precomputed `idScope` becomes wrong if a parent container's `vars` or `id` set changes. Mark `idScope` keyed on a hash of the enclosing scope's declarations and bust on mismatch — easy because the markup is immutable post-parse.
- **`uses` narrowing (§2.2)** changes observable state-bubble semantics for _implicit_ containers. Mutations to a name not in `computedUses` would no longer reach the parent. Verify with the existing dispatching tests in `tests/components/StateContainer.spec.tsx` (and friends) before flipping this on.
- **Compound metadata derivation (§8)** must respect `$props` accesses inside _event handlers_ and _code-behind_ — those ASTs exist at transform time, so the walk is straightforward.
