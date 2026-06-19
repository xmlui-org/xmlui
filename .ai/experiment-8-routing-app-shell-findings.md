# Experiment 8: Routing and App Shell Findings

Compatibility sources reviewed in the original XMLUI checkout:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Pages/Pages.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Pages/PagesReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLink.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLinkReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/App.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/AppReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/AppWrapper.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/state/routing-state.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/action/NavigateAction.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/routing`

Implemented compatibility subset:

- Hash routing is the default mode, with history routing selected by `App useHashBasedRouting="false"` or `{false}`.
- `Pages` discovers direct `Page` children, matches the current path, renders one route branch, renders non-`Page` children outside the route branch, and redirects to `fallbackPath` when no route matches.
- `Page` supports `url` with static and `:param` dynamic segments.
- Route context variables are available to compiled expressions and handlers: `$pathname`, `$routeParams`, `$queryParams`, and `$queryString`.
- `NavLink` supports `to`, `label`, `enabled`, `active`, `exact`, `target`, child-label fallback, href creation, navigation, and active-state attributes.
- `navigate(...)` is a special compiled handler call and updates routing state.
- `NavPanel` and `AppHeader` are structural containers only.

Important runtime finding:

- Route context should not be stored as XMLUI local/global variables. It is a separate runtime source attached to `RuntimeScope`, and bindings that read route context normalize to a `route` dependency so route changes can invalidate only the necessary expression layer.
- The old runtime uses React Router. The current experiment intentionally uses a small custom route store and matcher because the subset needs only hash/history synchronization, dynamic params, fallback routing, active links, and route-derived context variables.

Samples added:

- `routingBasic`: `Pages`, `Page`, `NavLink`, fallback route, and `$routeParams`.
- `routingQuery`: `navigate('/search', { ... })`, `$queryParams`, and `$queryString`.
- `routingState`: state mutation on one route and display on another route.
- `routingData`: `$routeParams` drives `DataSource.url` and managed refetch.

Deferred compatibility:

- React Router edge parity, nested routers, preview/SSR memory routing, host-router integration, app navigation events, guarded/defended routing, canonical URL policy, route diagnostics, scroll restoration, typed/coerced route/query constraints, `Redirect`, `PageMetaTitle`, `NavGroup`, drawer/mobile navigation, app-shell layout parity, and theme variables.

Verification:

- `npm --workspace xmlui run test`
- `npm --workspace xmlui run build`
- `npm run test:e2e`
