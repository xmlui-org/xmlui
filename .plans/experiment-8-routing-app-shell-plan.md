# Experiment 8: Routing and App Shell Plan

Status: implemented

Parent plan: `.plans/master-plan.md`, "Experiment 8: Routing and App Shell"

## Purpose

Experiments 1 through 7 proved compiled expressions and handlers, reactive state, user-defined components, a small built-in component set, and managed data operations. Experiment 8 adds application routing and a minimal app shell so XMLUI apps can contain multiple addressable views and route-aware navigation.

The central question is:

Can XMLUI routing be rebuilt as a small runtime service that keeps `Pages`, `Page`, `NavLink`, route/query variables, and `navigate(...)` compatible while feeding all location changes through the existing compiled reactive graph?

## Compatibility Baseline

Before implementation, use these original XMLUI sources as the compatibility contract:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Pages/Pages.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Pages/PagesReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Pages/Pages.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Pages/Pages.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Pages/Page.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLink.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLinkReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLink.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavPanel/NavPanel.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavPanel/NavPanelReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/App.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/AppReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/App-navigation-events.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppHeader/AppHeader.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppHeader/AppHeaderReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/AppWrapper.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/AppContent.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/state/routing-state.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/action/NavigateAction.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/routing`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/App.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/AppHeader.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/NavLink.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/NavPanel.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/Pages.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/Page.md`

Compatibility facts already observed:

- The original runtime uses React Router and creates a `HashRouter` by default unless `useHashBasedRouting` is disabled, with `MemoryRouter` for preview/SSR-like contexts.
- `Pages` collects direct `Page` children as routes and renders non-`Page` children outside the route switch.
- `Page` uses `url` as the route pattern prop. Dynamic route segments follow React Router `:name` syntax, with newer constrained syntax such as `:id:int(min=1)`.
- `Pages fallbackPath` redirects unmatched routes to a fallback route.
- Route children are wrapped in a container boundary so route params and query params are available to child expressions.
- Route-derived variables include `$pathname`, `$routeParams`, `$queryParams`, `$queryString`, and `$linkInfo`.
- `NavLink` navigates through the router, supports `to`, `label`, `enabled`, `target`, `active`, `exact`, `displayActive`, `noIndicator`, `vertical`, `icon`, and level-related props.
- `navigate(...)` resolves relative paths against the current location, supports query-param construction, and flows through app navigation hooks in the old runtime.
- Original routing has later-stage diagnostics for constrained params, query constraints, canonical URL policy, route guards, and navigation tracing.

## Scope

Implement the minimal compatible routing surface:

- route service and provider integrated into the current `renderXmluiApp` root;
- hash routing as the default mode;
- history routing as an opt-in mode;
- `Pages` and `Page` built-ins with route matching and fallback route handling;
- `NavLink` built-in with active state and disabled state;
- `navigate(...)` function available in compiled event handlers;
- route-derived context variables available in compiled expressions and handlers;
- dynamic route params and plain query params;
- a small app-shell subset with `AppHeader` and `NavPanel` as structural containers;
- route-aware samples that include both navigation and state/data modification;
- unit and E2E tests proving route changes re-render expressions and preserve component state boundaries.

## Non-Goals

This experiment does not implement:

- full styling/theme parity for `App`, `AppHeader`, `NavPanel`, and `NavLink`;
- drawer behavior, mobile app-shell behavior, hamburger/collapse controls, or responsive navigation layout;
- `NavGroup`, `Redirect`, `PageMetaTitle`, `TableOfContents`, breadcrumbs, search indexing, or link metadata maps;
- guarded routes, `willNavigate`/`didNavigate` app events, popstate blocking, or defended-routing diagnostics;
- constrained route/query validation beyond documenting the old shape;
- canonical URL policy, route tracing, inspector integration, or strict-routing modes;
- SSG route discovery or static route prerendering;
- nested routers, preview mode, SSR router hydration, or external host router integration.

## Design Direction

Introduce routing as runtime state, not compiled rendering behavior.

The routing layer should own:

- current pathname, search string, hash, route params, and query params;
- subscriptions so expressions depending on route variables re-render after navigation;
- hash/history URL synchronization;
- route pattern matching and fallback path selection;
- programmatic navigation from compiled handlers.

Built-ins should stay thin:

- `Pages` chooses which `Page` branch to render for the current location.
- `Page` is a declarative route descriptor and should not render outside `Pages`.
- `NavLink` renders an anchor/button and delegates navigation to the routing service.
- `AppHeader` and `NavPanel` render structural containers only, enough for route samples and E2E tests.

Avoid introducing React Router unless the implementation proves it is needed. The first slice can use a small route matcher because the current experiment only needs hash/history synchronization, dynamic params, fallback handling, and active-link detection. Record the decision if later compatibility requires adopting React Router.

## Compatibility Subset

### App

Implement now:

- existing `App` behavior;
- `useHashBasedRouting` prop/config fallback if cheap to add;
- route provider root creation;
- route globals/context variables.

Defer:

- full app layouts, app navigation events, theme persistence, app state provider details, and strict runtime config.

### Pages

Implement now:

- `fallbackPath`;
- direct `Page` child discovery;
- non-`Page` children rendered outside the page switch;
- first matching `Page` renders its children;
- unmatched paths redirect/replace to `fallbackPath` when provided.

Defer:

- `defaultScrollRestoration`, canonical URL policy, route diagnostics display, route guards, search indexing, and SSG route discovery.

### Page

Implement now:

- `url`;
- dynamic route params with `:name` syntax;
- children rendered only when the route matches;
- route params available as `$routeParams`.

Defer:

- `queryParams`, `guard`, `searchIndexable`, `navLabel`, typed/coerced constraints, and diagnostics except as planned extension points.

### NavLink

Implement now:

- `to`;
- `label`;
- `enabled`;
- `active`;
- `exact`;
- `target`;
- child-label fallback;
- active marker through class/data attributes suitable for tests.

Defer:

- icons, indicator parts, visual parity, nav group levels, drawer/mobile behavior, and theme variables.

### Programmatic Navigation

Implement now:

- `navigate(pathOrDelta, queryParams?)` in compiled event handlers;
- absolute paths;
- query-only paths such as `"?tab=details"`;
- simple relative paths if low-cost;
- same-tab navigation through the routing service.

Defer:

- navigation hooks, guarded navigation, external targets, history delta edge cases, and tracing.

### Route Context Variables

Implement now:

- `$pathname`;
- `$routeParams`;
- `$queryParams`;
- `$queryString`.

Defer:

- `$linkInfo` until link metadata maps exist.

## Planned Samples

### `routing-basic`

Hash-routed pages with navigation:

```xml
<App>
  <NavPanel>
    <NavLink to="/" label="Home" />
    <NavLink to="/details/42" label="Details" />
  </NavPanel>
  <Pages fallbackPath="/">
    <Page url="/">
      <H1>Routing home</H1>
      <Text>Path: {$pathname}</Text>
    </Page>
    <Page url="/details/:id">
      <H1>Routing details</H1>
      <Text>Id: {$routeParams.id}</Text>
    </Page>
  </Pages>
</App>
```

Learning: `Pages`, `Page`, `NavLink`, fallback routing, and `$routeParams` work together.

### `routing-query`

Query-string driven state:

```xml
<App>
  <Button onClick="navigate('/search', { q: 'xmlui', page: 2 })">Search</Button>
  <Pages fallbackPath="/search">
    <Page url="/search">
      <H1>Routing query</H1>
      <Text>Query: {$queryParams.q || 'none'}</Text>
      <Text>Page: {$queryParams.page || 'none'}</Text>
    </Page>
  </Pages>
</App>
```

Learning: programmatic navigation updates query params and route-derived expressions.

### `routing-state`

Route navigation plus user-visible state modification:

```xml
<App global.count="{0}">
  <NavLink to="/" label="Counter" />
  <NavLink to="/summary" label="Summary" />
  <Pages fallbackPath="/">
    <Page url="/">
      <H1>Routing counter</H1>
      <Button onClick="count++">Count: {count}</Button>
    </Page>
    <Page url="/summary">
      <H1>Routing summary</H1>
      <Text>Count is {count}</Text>
    </Page>
  </Pages>
</App>
```

Learning: routing does not break global state updates and routed pages re-render after data modification.

### `routing-data`

Route params drive a data request:

```xml
<App>
  <NavLink to="/messages/1" label="Message 1" />
  <NavLink to="/messages/2" label="Message 2" />
  <Pages fallbackPath="/messages/1">
    <Page url="/messages/:id">
      <DataSource id="message" url="/api/messages/{$routeParams.id}" />
      <H1>Routing data</H1>
      <Text>{message.value.text || 'Loading'}</Text>
    </Page>
  </Pages>
</App>
```

Learning: route variables participate in managed fetch dependencies and trigger visible data changes.

## Implementation Steps

### Step 1: Compatibility Audit and Findings

- Read the original sources listed in the compatibility baseline.
- Record concise findings in `.ai/experiment-8-routing-app-shell-findings.md`.
- Extract the implemented subset and deferred subset for `App`, `Pages`, `Page`, `NavLink`, `NavPanel`, `AppHeader`, and `navigate`.
- Identify old tests that can be ported nearly literally and tests that need infrastructure translation.

Verification:

- Findings note exists and names source files, implemented subset, deferred subset, and compatibility risks.

### Step 2: Route Pattern Model

- Add a small route pattern compiler for static routes and `:param` dynamic segments.
- Normalize route paths to leading-slash form.
- Match current pathname to route patterns.
- Return route params as strings.
- Preserve extension points for constrained params and query constraints from the original `components-core/routing` package.

Verification:

- Unit tests for `/`, static routes, dynamic params, no-match, trailing slash behavior, and route specificity.

### Step 3: Routing Store and Provider

- Add a runtime routing store that tracks pathname, search, hash, query params, and navigation revision.
- Subscribe to `hashchange`/`popstate`.
- Default to hash routing.
- Add opt-in history routing via root config or `App useHashBasedRouting="{false}"`.
- Expose a subscribe/getSnapshot API compatible with React hooks and runtime state invalidation.

Verification:

- Unit tests for parsing hash URLs, parsing browser-history URLs, query maps, and subscriber notification.

### Step 4: Route Context Integration

- Extend runtime scopes or expression context lookup so route variables are visible as context values:
  - `$pathname`;
  - `$routeParams`;
  - `$queryParams`;
  - `$queryString`.
- Make route-dependent bindings resubscribe when the routing store changes.
- Ensure route context values do not shadow local/global variables except through the existing `$context` lookup path.

Verification:

- Unit tests that compiled expressions read route context values.
- E2E tests that route-variable text updates after navigation.

### Step 5: Programmatic `navigate`

- Add `navigate` to compiled event handler context.
- Support `navigate('/path')`.
- Support `navigate('/path', { page: 2 })`.
- Support query-only navigation such as `navigate('?tab=details')` if cheap.
- Update URL and routing store synchronously enough for immediate reactive updates.

Verification:

- Unit tests for URL creation and event-context availability.
- E2E test where a button navigates and route-derived text changes.

### Step 6: Compiler Contracts and IR Recognition

- Add built-in contracts for `Pages`, `Page`, `NavLink`, `NavPanel`, and `AppHeader`.
- Add these built-ins to IR lowering so uppercase names are not treated as user-defined components.
- Add the navigation global/function contract to script semantics if required.
- Keep prop/event names compatible with the original subset.

Verification:

- Contract tests assert accepted props/events.
- Existing unknown prop/event diagnostics still work.

### Step 7: `Pages` and `Page` Runtime

- Implement `Pages` renderer.
- Discover direct `Page` children.
- Match the current route and render exactly one matching `Page`.
- Render non-`Page` children outside the route branch.
- Apply `fallbackPath` for unmatched routes.
- Create a page scope containing matched route params.

Verification:

- Unit tests for matching, fallback, and route param scope.
- E2E test for direct URL load and fallback redirect.

### Step 8: `NavLink` Runtime

- Implement native anchor rendering for enabled links.
- Implement disabled button/span rendering for disabled links.
- Navigate internally for same-app links.
- Preserve default browser behavior for external URLs or `target`.
- Add active state attributes/classes for exact and prefix matching.
- Support label prop and child-label fallback.

Verification:

- Unit tests for active matching and disabled behavior.
- E2E test clicks links and checks active state.

### Step 9: Minimal App Shell Containers

- Implement `NavPanel` as a structural navigation container.
- Implement `AppHeader` as a structural header container.
- Keep styling native/minimal and avoid theme work.
- Ensure these containers render children and do not interfere with routing state.

Verification:

- E2E sample renders header/nav/page content together.
- Existing built-in samples remain unaffected.

### Step 10: Route-Driven Data Sample

- Extend the example API mock with `/api/messages/:id`.
- Add a `routing-data` sample where `DataSource.url` depends on `$routeParams.id`.
- Ensure navigation from one route param to another triggers refetch and visible data changes.

Verification:

- Unit tests for the new mock endpoint.
- E2E test navigates between message routes and verifies data changes.

### Step 11: State Modification Sample

- Add a route sample where a button mutates XMLUI state on one page and another page displays the updated value.
- Confirm page switching does not reset global state.
- Add a variant if useful where page-local state resets/remounts in a compatible way.

Verification:

- E2E test clicks, navigates, and verifies updated state on another route.

### Step 12: Hash and History Mode Coverage

- Add tests for default hash routing.
- Add a history-mode sample or test harness configuration.
- Ensure `fallbackPath`, `NavLink`, and `navigate` work in both modes.

Verification:

- E2E test for default hash URL shape.
- Unit or E2E test for history URL shape.

### Step 13: Old Test Porting Pass

- Port a small first group of original tests nearly literally:
  - `Pages` renders the matching `Page`;
  - `Pages fallbackPath`;
  - `Page` route params;
  - `NavLink` navigation;
  - `NavLink exact` active behavior;
  - `navigate` action with query params.
- Record old tests intentionally deferred and why.

Verification:

- Ported tests pass under the new infrastructure.
- Deferred tests are listed in the plan or findings note.

### Step 14: Regression and Closure

- Run unit tests after each implementation slice.
- Run build/typecheck before E2E.
- Run full E2E at the end.
- Update this plan with implementation closure and deferred compatibility notes.
- Update `.ai/experiment-8-routing-app-shell-findings.md`.

Verification:

- `npm --workspace xmlui run test`
- `npm --workspace xmlui run build`
- `npm run test:e2e`

## Success Criteria

Experiment 8 is successful when:

- `Pages` and `Page` render the correct route branch from the current URL;
- unmatched routes redirect or replace to `fallbackPath`;
- `NavLink` navigates and exposes active/disabled states;
- compiled expressions can read `$pathname`, `$routeParams`, `$queryParams`, and `$queryString`;
- compiled handlers can call `navigate(...)`;
- hash routing works by default;
- history routing works through an opt-in setting;
- route changes invalidate dependent expressions without forcing unrelated state resets;
- at least one sample proves user-visible state modification across navigation;
- at least one sample proves route-param-driven data fetching;
- unit and E2E tests prove the implemented subset.

## Risks and Open Questions

- The old runtime uses React Router. A small custom router may be enough for this experiment, but later compatibility may require adopting React Router or matching its edge behavior more closely.
- Active-link semantics can be surprisingly subtle for root routes, nested paths, query strings, and hash fragments.
- Route context values must participate in the reactive graph without becoming normal XMLUI variables.
- Page scope/remount behavior affects local state lifetime. The first implementation should document whether route changes remount page contents or preserve them.
- History mode needs dev-server fallback behavior for direct deep links. Vite dev mode can support this, but production and SSG will need a later route-discovery phase.
- Programmatic `navigate` should eventually flow through guarded-routing hooks and diagnostics, but those are intentionally deferred.
- Query-param typing/coercion exists in the old framework; the first slice will use strings and leave typed constraints as a planned extension.

## Implementation Closure

Implemented:

- Added a small runtime routing service with hash routing by default, history-mode support, URL parsing, subscriptions, route pattern compilation, dynamic `:param` matching, href creation, and programmatic navigation.
- Threaded routing through `RuntimeScope` and exposed route context variables:
  - `$pathname`;
  - `$routeParams`;
  - `$queryParams`;
  - `$queryString`.
- Added route-context dependency normalization so route-derived expressions re-render after navigation.
- Added `navigate(...)` as a compiled event-handler special function.
- Added minimal built-in contracts and runtime renderers for `Pages`, `Page`, `NavLink`, `NavPanel`, and `AppHeader`.
- Added `App useHashBasedRouting` contract support, with hash routing as the default and history routing selected by `useHashBasedRouting="false"` or `{false}`.
- Added routed examples for:
  - `routingBasic`;
  - `routingQuery`;
  - `routingState`;
  - `routingData`.
- Extended the example API mock with `/api/messages/:id` for route-param-driven data fetching.
- Added unit and E2E tests covering route matching, route context reactivity, navigation, active links, query params, state modification across pages, and route-driven data fetching.

Deferred:

- Full React Router parity, nested routers, preview/SSR memory routing, host-router integration, app navigation events, route guards, defended-routing diagnostics, canonical URL policy, scroll restoration, typed/coerced route/query constraints, `Redirect`, `PageMetaTitle`, `NavGroup`, drawer/mobile navigation, full app-shell layout, and theme parity.

Verification:

- `npm --workspace xmlui run test` passed: 21 files, 186 tests.
- `npm --workspace xmlui run build` passed, with only Vite's existing large-chunk warning.
- `npm run test:e2e` passed: 35 tests.
