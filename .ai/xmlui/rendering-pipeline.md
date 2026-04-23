# Rendering Pipeline

## Overview

The rendering pipeline transforms a `ComponentDef` tree into a React element tree. The pipeline runs recursively, driven by `renderChild()`.

```
renderChild()
  └── ComponentWrapper           ← node transformations + routing decision
        ├── ContainerWrapper     ← if container-like (has vars/loaders/functions/uses/script)
        │     └── ErrorBoundary
        │           └── StateContainer  ← 6-layer state composition
        │                 └── Container  ← event handlers + children rendered via renderChild()
        └── ComponentAdapter     ← if stateless (direct render, no container)
              └── renderer()     ← component's renderer function
                    └── behaviors applied (wrap rendered output)
```

## renderChild — Decision Tree

Called for every `ComponentDef` node. Returns `ReactNode`.

1. Evaluate `when` / `responsiveWhen`:
   - SSR mode: always render; use `buildWhenStyleObject()` for CSS-based hide
   - Client mode: if false → return `null` (exception: node has `init` event → render once)
2. `TextNodeCData` → return raw value (no expression parsing)
3. `TextNode` → evaluate via `extractParam()` → return text
4. `Slot` → resolve named or default slot children from `parentRenderContext`; render with parent context
5. All others → `<ComponentWrapper node={...} />`

## ComponentWrapper — Node Transformations

Applied in order, all memoized:

| Transform | Condition | Effect |
|-----------|-----------|--------|
| `transformNodeWithChildrenAsTemplate` | `descriptor.childrenAsTemplate` | Moves children to a named prop |
| `transformNodeWithChildDatasource` | Child nodes of type `DataSource` | Extracts children as `loaders` array |
| `transformNodeWithDataSourceRefProp` | Props reference a loader by id | Replaces prop value with virtual `DataSourceRef` node |
| `transformNodeWithDataProp` | `data` prop is a string URL | Wraps in implicit `<DataSource>` child |
| `transformNodeWithRawDataProp` | `raw_data` prop present | Converts to pre-resolved data |

**Routing decision** after transforms:

```typescript
function isContainerLike(node): boolean {
  return !!(node.loaders || node.vars || node.uses ||
            node.contextVars || node.functions || node.scriptCollected);
}
// isContainerLike → ContainerWrapper → StateContainer → Container
// else            → ComponentAdapter (direct render)
```

## ContainerWrapper

Wraps the node in a `StateContainer` + `Container` pair. Also handles:

- **Implicit wrapping**: node has `vars`/`loaders`/`functions` but is not a `Container` type → creates a synthetic container node, moves state properties up, keeps original as child
- **Explicit**: node type is `Container` or has `uses` → no rewrapping needed
- **Implicit flag**: `uses === undefined` → implicit (inherits all parent state); `uses` set → state boundary

Always wraps in `<ErrorBoundary node={node} location="container">`.

## ComponentAdapter — Stateless Rendering

Performs the final render for stateless nodes. Key steps:

1. Create `uid` Symbol (unique per instance)
2. `createValueExtractor()` — evaluates `{expressions}` in props against current state
3. Resolve resource URLs via `useTheme().getResourceUrl()`
4. `resolveLayoutProps()` — extract CSS layout properties (width, padding, margin, etc.), handle responsive variants
5. `componentRegistry.lookupComponentRenderer(node.type)` → `{ renderer, descriptor, isCompoundComponent }`
6. Build `RendererContext` object
7. Call `renderer(rendererContext)` → `renderedNode`
8. **Apply behaviors** (loop over registered behaviors):
   - Skipped entirely for compound (user-defined) components
   - Skipped for behaviors listed in `descriptor.excludeBehaviors`
   - Each: `behavior.canAttach(context, node, descriptor)` → if true: `renderedNode = behavior.attach(context, renderedNode, descriptor)`
9. Apply theme class via `useComponentThemeClass()`
10. If `testId` set: wrap in `ComponentDecorator` (injects `data-testid`)
11. Detect `DataSource`/`APICall`/`FileDownload` props → wrap in `ApiBoundComponent`
12. Handle `init` / `cleanup` event lifecycle

## Component Registry & Lookup

`ComponentRegistry` (in `ComponentProvider.tsx`) stores components in three namespaces with priority:

```
CORE_NS > APP_NS > EXTENSIONS_NS
```

Supports namespaced lookup: `"MyNS.MyComponent"`.

**Entry shape**:
```typescript
type ComponentRegistryEntry = {
  renderer: ComponentRendererFn<any>;
  descriptor?: ComponentMetadata;
  isCompoundComponent?: boolean;  // true for user-defined components
};
```

**Registration**:
- Built-in: `this.registerCoreComponent(componentNameComponentRenderer)`
- User-defined (runtime): `this.registerAppComponent(compoundRenderer)`
- Extensions: `this.registerComponentRenderer(renderer, EXTENSIONS_NS)`

## User-Defined (Compound) Components

Resolved via `createUserDefinedComponentRenderer()`. Differences from built-in:

- `isCompoundComponent: true` in registry entry
- **Behaviors are never applied**
- `generateUdComponentMetadata()` extracts props by scanning `$props.X` accesses in the template AST
- Code-behind `vars` and `functions` are merged into the component's `vars`/`functions` before rendering
- Renders via `CompoundComponentRenderer` which sets up slot context and calls `renderChild()` on the template

## Behavior System

### Interface

```typescript
interface Behavior {
  metadata: BehaviorMetadata;
  canAttach(context: RendererContext, node: ComponentDef, metadata: ComponentMetadata): boolean;
  attach(context: RendererContext, node: ReactNode, metadata?: ComponentMetadata): ReactNode;
}
```

### Registration Order (ComponentProvider.tsx)

Behaviors are registered in this order. **Last registered = outermost wrapper** when applied:

| Registration order | Behavior | Trigger |
|-------------------|----------|---------|
| 1 (innermost) | `labelBehavior` | `label` prop + visual component |
| 2 | `animationBehavior` | `animation` prop |
| 3 | `tooltipBehavior` | `tooltip` prop |
| 4 | `variantBehavior` | `variant` prop |
| 5 | `bookmarkBehavior` | `bookmark` prop |
| 6 | `formBindingBehavior` | `bindTo` prop + component has `value`/`setValue` APIs |
| 7 (outermost) | `validationBehavior` | `validationState`/`required`/`pattern` props |

### BehaviorCondition Types

```typescript
type BehaviorCondition =
  | { type: "and" | "or"; conditions: BehaviorCondition[] }
  | { type: "visual" | "nonVisual" }         // visual = has SCSS/theme vars
  | { type: "hasProp" | "hasNoProp"; propName: string }
  | { type: "hasApi"; apiName: string }
  | { type: "isType" | "isNotType"; nodeType: string }
  // + ~5 more condition types
```

## ErrorBoundary

- React class component; wraps every `ContainerWrapper`
- `getDerivedStateFromError` → sets `hasError: true`, stores error
- `componentDidCatch` → logs to console + calls `pushXsLog({ kind: "error:boundary", ... })` for inspector
- Auto-resets: `componentDidUpdate` → if `prevProps.node !== this.props.node`, clears error state
- Renders fallback div with error message on catch; renders `children` normally

## Key Files

| File | Path |
|------|------|
| renderChild | `xmlui/src/components-core/rendering/renderChild.tsx` |
| ComponentWrapper | `xmlui/src/components-core/rendering/ComponentWrapper.tsx` |
| ComponentAdapter | `xmlui/src/components-core/rendering/ComponentAdapter.tsx` |
| ContainerWrapper | `xmlui/src/components-core/rendering/ContainerWrapper.tsx` |
| ErrorBoundary | `xmlui/src/components-core/rendering/ErrorBoundary.tsx` |
| StateContainer | `xmlui/src/components-core/rendering/StateContainer.tsx` |
| Container | `xmlui/src/components-core/rendering/Container.tsx` |
| ComponentProvider | `xmlui/src/components-core/ComponentProvider.tsx` |
| renderers | `xmlui/src/components-core/renderers.ts` |
| Behavior interface | `xmlui/src/components-core/behaviors/Behavior.tsx` |
| formBindingBehavior | `xmlui/src/components-core/behaviors/FormBindingBehavior.tsx` |
