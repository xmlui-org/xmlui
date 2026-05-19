# Routing — AI Reference

## Overview

XMLUI routing is a declarative wrapper over **react-router-dom v6**. The `Pages` component
coordinates a `<Routes>` container; each `Page` child becomes a `<Route>`. Router type
(Hash/Browser/Memory) is chosen at bootstrap by `AppWrapper`. Routing state (`$pathname`,
`$routeParams`, `$queryParams`) is injected as Layer 6 of the state composition pipeline,
making it reactive in all expressions.

---

## Architecture

```
AppWrapper                    → selects Router type (Hash / Browser / Memory)
  └── AppContent              → provides navigate(), handles navigation events
        └── App               → exposes willNavigate / didNavigate events
              ├── Pages        → <Routes> coordinator; filters Page children
              │    └── Page    → <Route path={url}> → RouteWrapper (injects $routeParams)
              │         └── children (access $routeParams, $pathname, $queryParams)
              ├── NavPanel     → navigation UI via buildNavHierarchy()
              └── LinkInfoContext → $linkInfo for the active page
```

---

## Router Selection (AppWrapper)

| Condition | Router Used |
|---|---|
| `previewMode === true` | `MemoryRouter` |
| `typeof window === "undefined"` (SSR) | `MemoryRouter` |
| `useHashBasedRouting === true` (default) | `HashRouter` |
| `useHashBasedRouting === false` | `BrowserRouter` |
| Already inside a router context | Reuses existing context |

- `useHashBasedRouting` comes from `globalProps` (runtime config). Default is `true`.
- `basename` is passed to `BrowserRouter` only; ignored for `HashRouter`.
- **HashRouter** produces `/#/path` URLs — no server routing required.
- **BrowserRouter** produces `/path` — requires server-side routing (all paths → `index.html`).

---

## Pages Component

**File:** `xmlui/src/components/Pages/Pages.tsx` + `PagesReact.tsx`

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `fallbackPath` | `string` | `"/"` | Redirect target for unmatched URLs (`<Route path="*">`) |
| `defaultScrollRestoration` | `boolean` | `false` | Restore scroll position on browser back/forward |

### Behavior

- Iterates `node.children`, separates `type === "Page"` from other children.
- Renders `<Routes>` containing one `<Route>` per Page.
- Non-Page children are rendered outside `<Routes>` (below the route switcher).
- `fallbackPath` generates a catch-all `<Route path="*" element={<Navigate to={fallbackPath} replace />} />`.
- When `defaultScrollRestoration` is `true`, calls `context.setScrollRestorationEnabled(true)` via `AppLayoutContext`.

---

## Page Component

**File:** `xmlui/src/components/Pages/Pages.tsx` (metadata: `PageMd`, renderer: `pageRenderer`)

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `url` | `string` | — | React Router v6 path pattern. Required for routing. |
| `queryParams` | `string` | — | Optional defended-routing query constraint declaration, e.g. `page:int(min=1)?,sort:enum(asc,desc)?`. |
| `guard` | `function` | — | Optional page-level navigation guard. Return `false` to reject, or `{ redirect: "/path" }` / `"/path"` to redirect. |
| `navLabel` | `string` | — | Internal. Navigation display label. Used by NavPanel. |
| `searchIndexable` | `boolean` | `true` | Internal. Whether page content is indexed for search. |

### Render pipeline

```
pageRenderer (customRender)
  → <TableOfContentsProvider>   ← for on-page anchor/heading nav
      → <RouteWrapper>          ← injects $routeParams
          → renderChild(node.children)
```

- The `key` on `RouteWrapper` is `extractValue(node.props.url)` — forces remount on URL pattern change.
- `RouteWrapper` calls `useParams()` and wraps children in an implicit container (`vars: {}`).

### URL Patterns (React Router v6 syntax)

| Pattern | Example | Notes |
|---|---|---|
| Static | `/about` | Exact match |
| Dynamic segment | `/users/:id` | Captured as `$routeParams.id` |
| Constrained segment | `/users/:id:int(min=1)` | Validates and coerces `$routeParams.id` to a number. |
| Multiple segments | `/posts/:postId/comments/:commentId` | Multiple params |
| Optional segment | `/users/:id?` | Param may be absent |
| Wildcard | `/files/*` | Matches any suffix |
| Index (empty) | ` ` / `""` | Matches parent path with no extra segment |

---

## Defended Routing (Wave 4)

**Files:** `xmlui/src/components-core/routing/*`, `PagesReact.tsx`, `routing-state.ts`

Wave 4 adds a managed validation layer above React Router. It is additive: unconstrained routes
keep their previous behavior.

### Route and query constraints

Supported constraint forms:

| Constraint | Example | Result |
|---|---|---|
| `string` | `:slug:string` | String value |
| `int` | `:id:int`, `:id:int(min=1,max=999)` | Number value |
| `number` | `:amount:number(min=0)` | Number value |
| `enum` | `:tab:enum(profile,billing)` | String limited to allowed values |

Query params use the `Page queryParams` prop:

```xml
<Page
  url="/search"
  queryParams="q:string,page:int(min=1)?,sort:enum(asc,desc)?">
  <Text>Page {$queryParams.page ?? 1}</Text>
</Page>
```

`?` marks a query parameter optional. Required query parameters must be present and pass validation.
Validated route/query values are injected through `CoercedRouteParamsContext` and
`CoercedQueryParamsContext`, so `$routeParams` and `$queryParams` expose coerced values where
constraints exist.

### Page guards

`Page guard` runs after route/query validation and before rendering. It receives the target and
source navigation snapshots, including coerced `routeParams` and `queryParams`.

Accepted guard results:
- `false` rejects navigation.
- `null`, `undefined`, or `true` allows navigation.
- A string redirects to that path.
- An object with `redirect` redirects to that path.

Rejected guards emit a `kind: "navigate"` trace with a `guard-bypass-attempt` routing diagnostic.

### URL canonicalisation

`App` exposes internal URL policy props:

| Prop | Values | Effect |
|---|---|---|
| `urlCase` | `preserve`, `lower` | Lowercase path when configured. |
| `urlTrailingSlash` | `preserve`, `always`, `never` | Normalize trailing slash. |
| `urlQueryParamOrder` | `preserve`, `alphabetical` | Normalize query parameter order. |
| `nonCanonicalUrl` | `warn`, `rewrite`, `redirect` | Emit diagnostic, then optionally replace URL. |

Non-canonical URLs emit `routingDiagnostic.code === "non-canonical-url"`.

## Routing State Variables (Layer 6)

**File:** `xmlui/src/components-core/state/routing-state.ts`

Injected as `useRoutingParams()` — available in every component expression automatically.

| Variable | Type | Source | Description |
|---|---|---|---|
| `$pathname` | `string` | `useLocation().pathname` | Current URL path (e.g., `"/users/123"`) |
| `$routeParams` | `Record<string, unknown>` | `useParams()` + coerced route constraints | Dynamic segment values (e.g., `{ id: 123 }` when constrained as `int`) |
| `$queryParams` | `Record<string, unknown>` | `useSearchParams()` + coerced query constraints | Query string values (e.g., `{ page: 1 }` when constrained as `int`) |
| `$queryString` | `string` | `useLocation().search` | Raw query string without parsing. |
| `$linkInfo` | `NavHierarchyNode \| {}` | `LinkInfoContext` | Nav metadata for the current page |

All four variables are memoized — expressions re-evaluate only when routing state actually changes.

### Access patterns

```xml
<!-- Display current path -->
<Text>{$pathname}</Text>

<!-- Access dynamic route param -->
<Text>User ID: {$routeParams.id}</Text>

<!-- Access query string -->
<Text>Page: {$queryParams.page ?? 1}</Text>

<!-- Conditional rendering based on route -->
<HStack visible="{$pathname.startsWith('/admin')}">...</HStack>
```

---

## navigate() Global Function

**Definition:** `AppContextDefs.ts`; **Implementation:** `AppContent.tsx`

```ts
navigate(to: string | number, options?: NavigateOptions & { queryParams?: Record<string, any> }): void
```

| Argument | Type | Notes |
|---|---|---|
| `to` | `string` | Absolute or relative path |
| `to` | `number` | History delta (e.g., `-1` = back, `1` = forward) |
| `options.queryParams` | `Record<string, any>` | Appended as `?key=value` to URL |
| `options.replace` | `boolean` | Replace history entry instead of push |

### Behavior

- Wraps react-router's `useNavigate()`.
- Before navigating: fires `willNavigate(to, queryParams)` — returning `false` cancels navigation.
- After navigating: fires `didNavigate(to, queryParams)` via location-change effect.
- Works in `on*` event handlers: `<Button onClick="navigate('/home')" />`
- Also accessible as `Actions.navigate(path)` in non-handler contexts.

---

## App Navigation Events

Declared on `App` component metadata in `App.tsx`.

| Event | Fires When | Can Cancel? | Signature |
|---|---|---|---|
| `willNavigate` | Before `navigate()` call | Yes — return `false` | `(to, queryParams?) => Promise<false \| void>` |
| `didNavigate` | After any navigation completes | No | `(to, queryParams?) => Promise<void>` |

**Limitation:** `willNavigate` does NOT fire for `<Link>` clicks or browser back/forward.  
`didNavigate` fires for all navigation types.

```xml
<App willNavigate="(to) => { if (isDirty) return false; }"
     didNavigate="(to) => trackPageView(to)">
```

---

## NavPanel / NavGroup / NavLink

**File:** `xmlui/src/components/NavPanel/NavPanelNative.tsx`

### buildNavHierarchy()

Recursively walks NavPanel children, building a `NavHierarchyNode[]` tree.

```ts
interface NavHierarchyNode {
  type: "NavLink" | "NavGroup";
  label: string;
  to?: string;
  icon?: string;
  children?: NavHierarchyNode[];   // NavGroup only
  parent?: NavHierarchyNode;
  pathSegments?: NavHierarchyNode[]; // ancestors from root
  prevLink?: NavHierarchyNode;
  nextLink?: NavHierarchyNode;
  firstLink?: boolean;
  lastLink?: boolean;
}
```

### Component props

| Component | Required Props | Optional Props | Notes |
|---|---|---|---|
| `NavLink` | `label`, `to` | `icon`, `exact` | `exact` forces exact-match active state |
| `NavGroup` | `label` | `to`, `icon` | Collapsible container |
| `NavPanel` | — | contents | Root container; renders logo + scrollable nav |

- `NavLink` `exact={true}` → active only on exact URL match (default: prefix match).
- `$linkInfo` in expressions gives the active page's `NavHierarchyNode` (from `LinkInfoContext`).

---

## LinkInfoContext and $linkInfo

**File:** `xmlui/src/components/App/LinkInfoContext.ts`

- Stores a `Map<pathname, NavHierarchyNode>` built from NavGroup/NavLink tree.
- Injected into routing state as `$linkInfo`.
- Used for breadcrumbs, prev/next links, and page metadata in layouts.

```xml
<!-- Previous/next page navigation -->
<Link to="{$linkInfo.prevLink?.to}">{$linkInfo.prevLink?.label}</Link>
<Link to="{$linkInfo.nextLink?.to}">{$linkInfo.nextLink?.label}</Link>

<!-- Breadcrumb from $linkInfo -->
<HStack>
  <For each="{$linkInfo.pathSegments}">
    <Link to="{$item.to}">{$item.label}</Link>
  </For>
</HStack>
```

---

## TableOfContentsContext

**File:** `xmlui/src/components-core/TableOfContentsContext.tsx`

**Not for routing.** Used for in-page heading/anchor navigation only.

- Each `Page` renders inside `<TableOfContentsProvider>`.
- Stores registered headings on the current page.
- Tracks active anchor via `IntersectionObserver`.
- Provides `scrollToAnchor()` for on-page TOC components.
- Does NOT interact with react-router routes.

---

## Scroll Restoration

When `<Pages defaultScrollRestoration={true}>`:

1. `Pages` → `AppLayoutContext.setScrollRestorationEnabled(true)`
2. `AppContent` sets `window.history.scrollRestoration = "manual"`
3. On every scroll: saves position to `sessionStorage` keyed by location key
4. On POP navigation (back/forward): restores from sessionStorage with `behavior: "instant"`

---

## Nested Routing

- A `Pages` component can be nested inside a `Page`'s children.
- Nested `Pages` resolves routes relative to parent path.
- Params accumulate: parent `/users/:userId` + nested `/posts/:postId` → child sees both.
- Each level adds its own `RouteWrapper` container; inner state doesn't conflict with outer.

---

## Key Files

| File | Role |
|---|---|
| `xmlui/src/components/Pages/Pages.tsx` | `Pages` + `Page` metadata (props, descriptions) |
| `xmlui/src/components/Pages/PagesReact.tsx` | `Pages` render logic; `RouteWrapper` component |
| `xmlui/src/components-core/routing/constraint-compiler.ts` | Route/query constraint parser, validator, coercer |
| `xmlui/src/components-core/routing/canonicalise.ts` | URL canonicalisation policy |
| `xmlui/src/components-core/routing/guard-dispatcher.ts` | Page guard result normalization |
| `xmlui/src/components-core/rendering/AppWrapper.tsx` | Router selection (Hash/Browser/Memory) |
| `xmlui/src/components-core/rendering/AppContent.tsx` | `navigate()` implementation, navigation events |
| `xmlui/src/components-core/state/routing-state.ts` | `useRoutingParams()` — routing state Layer 6 |
| `xmlui/src/components/App/App.tsx` | `willNavigate` / `didNavigate` event declarations |
| `xmlui/src/components/NavPanel/NavPanelNative.tsx` | `buildNavHierarchy()`, `NavHierarchyNode` |
| `xmlui/src/components/App/LinkInfoContext.ts` | Link metadata context, `$linkInfo` source |
| `xmlui/src/components-core/TableOfContentsContext.tsx` | On-page heading anchors (not routing) |

---

## Anti-Patterns

| Anti-Pattern | Problem | Correct Approach |
|---|---|---|
| Using `window.location.href` for navigation | Bypasses react-router, causes full page reload | Use `navigate(path)` |
| Reading URL params with `new URLSearchParams(window.location.search)` | Not reactive; won't update on navigation | Use `$queryParams` |
| Using `$pathname` to parse dynamic segments with string operations | Fragile, breaks with path changes | Use `$routeParams.paramName` |
| Using BrowserRouter without server routing configuration | 404 on direct URL access or refresh | Configure server to serve `index.html` for all paths |
| Placing `Pages` outside `App` | RouterContext may be unavailable | `Pages` must live inside the XMLUI `App` component |
| Confusing `TableOfContentsContext` with route discovery | They serve different purposes | TOC = in-page anchors; `Pages`/`Page` = URL routing |
| Navigating with `willNavigate` guard but using `<Link>` | `willNavigate` doesn't fire for Link clicks | Use `navigate()` when guard logic is needed |
| Setting query params manually in path string `navigate("/path?foo=bar")` | Works but bypasses encoding | Use `navigate("/path", { queryParams: { foo: "bar" } })` |
