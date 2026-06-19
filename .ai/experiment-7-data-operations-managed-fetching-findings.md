# Experiment 7: Data Operations and Managed Fetching Findings

Compatibility sources reviewed in the original XMLUI checkout:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/DataSource/DataSource.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DataSource/DataSource.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/APICall/APICall.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/APICall/APICallReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/APICall/APICall.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/action/APICall.tsx`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/DataSource.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/APICall.md`

Implemented compatibility subset:

- `DataSource` is non-visual, registers an API object by `id`, and exposes `value`, `error`, `inProgress`, `isRefetching`, `loaded`, `responseHeaders`, and `refetch()`.
- `DataSource` supports `mockData`, default fetch, `onFetch`, `onLoaded`, `onError`, `resultSelector`, `transformResult`, and simple interval refetching through `pollIntervalInSeconds`.
- `APICall` is non-visual, registers an API object by `id`, and exposes `execute()`, `inProgress`, `loaded`, `lastResult`, `lastError`, and `lastResponseHeaders`.
- `APICall` supports `onBeforeRequest`, `onMockExecute`, `onSuccess`, `onError`, `$param`, `$params`, request context variables, and basic `invalidates` refetching by named `DataSource` id.
- `Actions.callApi` is available in compiled handlers and routes through the same managed request builder/executor as the components.
- The managed fetch service owns request normalization, query string construction, JSON/text parsing, response headers, caching, deduplication, force refetch, abort handling, and stale-response protection.

Important runtime finding:

- Component API references are reactive but are not ordinary XMLUI variables. They should be updated in place and should invalidate only when public API values actually change.
- Object-valued expressions such as `mockData="{[{ id: 'x' }]}"` produce fresh arrays/objects on each render. Data components must compare stable request/data signatures and avoid unconditional reference invalidation, otherwise reference subscribers can create render loops.

Test harness decision:

- Unit tests exercise the managed fetch service directly with deterministic adapters.
- E2E tests use mock data or the Vite example API mock instead of external network calls.
- The new samples deliberately include both data display and user-triggered data modification, following the rule established after Experiment 2.
- Samples must not depend on Playwright-only request routing. The dev server now provides a small `/api` mock layer, inspired by the original XMLUI `ApiInterceptorDefinition` shape: mocked endpoints are matched by method and URL under a local `apiUrl`, keep in-memory state, and return JSON responses.

Deferred compatibility:

- Deferred operation polling, cancellation endpoints, confirmation dialogs, notifications, optimistic `updates`, paging selectors, structural sharing, CSV/SQL modes, upload/download payloads, request tracing, and inspector integration remain unimplemented.
- A later pass should port more of the old `DataSource` and `APICall` tests nearly literally once forms, notifications, and richer fetch lifecycle pieces exist.

Verification:

- `npm --workspace xmlui run test`
- `npm --workspace xmlui run build`
- `npm run test:e2e`
