# Experiment 7: Data Operations and Managed Fetching Plan

Status: implemented

Parent plan: `.plans/master-plan.md`, "Experiment 7: Data Operations and Managed Fetching"

## Purpose

Experiments 1 through 6 proved compiled expressions, async handlers, reactive state, component composition, and a small built-in component surface. Experiment 7 connects that runtime to managed data operations: declarative loading through `DataSource`, imperative mutations through `APICall`, and the global `Actions.callApi` bridge.

The central question is:

Can XMLUI's managed fetch lifecycle be rebuilt as a small runtime service that participates in compiled scope, reactive invalidation, request cancellation, cache reuse, and imperative component APIs without carrying over the old container stack?

## Compatibility Baseline

Before implementation, use these original XMLUI sources as the compatibility contract:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/DataSource/DataSource.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DataSource/DataSource.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/APICall/APICall.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/APICall/APICallReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/APICall/APICall.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/action/APICall.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/RestApiProxy`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/DataSource.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/APICall.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/managed-react/fetch-lifecycle.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/hide-an-element-until-its-datasource-is-ready.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/use-fetched-data-safely-in-when.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/chain-a-refetch.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/cancel-a-deferred-api-operation.md`

Compatibility facts already observed:

- `DataSource` is non-visual and requires `id` for programmatic access.
- `DataSource` public props include `method`, `id`, `url`, `mockData`, `body`, `rawBody`, `queryParams`, `headers`, `credentials`, `pollIntervalInSeconds`, `resultSelector`, `transformResult`, `dataType`, `structuralSharing`, and notification message props.
- `DataSource` events include `loaded`, `error`, and `fetch`; `fetch` can replace the default fetch implementation while preserving loader lifecycle.
- `DataSource` API exposes `value`, `inProgress`, `isRefetching`, `loaded`, `refetch()`, and `responseHeaders`.
- `APICall` is non-visual and executes only when triggered manually through `execute()`.
- `APICall` public props include `method`, `url`, `body`, `rawBody`, `queryParams`, `headers`, `credentials`, `invalidates`, `updates`, and confirmation/deferred-operation props.
- `APICall` events include `beforeRequest`, `success`, `error`, `mockExecute`, and deferred polling events.
- `APICall` API exposes `execute(...params)`, `inProgress`, `loaded`, `lastResult`, `lastError`, `lastResponseHeaders`, and deferred polling APIs.
- Managed fetching must deduplicate same-key requests, cache successful results, abort obsolete in-flight requests, and prevent stale responses from overwriting newer results.

## Scope

Implement a minimal but compatibility-shaped data layer:

- `DataSource` with `mockData`, basic HTTP fetch, `fetch` event override, result state, error state, and `refetch()`;
- `APICall` with `execute()`, `beforeRequest`, `success`, `error`, `mockExecute`, and mutation state;
- `Actions.callApi` for imperative calls from compiled handlers;
- a shared managed request service with request keying, cache, abort, and invalidation;
- component-reference integration so `ds.value`, `ds.loaded`, `api.execute()`, and `api.lastResult` work in compiled expressions/handlers;
- basic cache invalidation from `APICall invalidates`;
- deterministic tests using mock data and a test fetch adapter;
- routed samples that include both fetched display data and user-triggered data modification.

## Non-Goals

This experiment does not implement:

- full TanStack Query parity or a final decision to keep TanStack Query;
- forms and form binding;
- CSV parsing, SQL mode, file downloads, upload payloads, or streaming;
- deferred `202 Accepted` polling, cancellation endpoints, progress extraction, or polling notifications;
- retry policies beyond a simple explicit `refetch()`;
- full toast notification rendering;
- confirmation dialogs;
- auth/cookie policy beyond passing `credentials` to the fetch adapter;
- `Queue`, `RetryPolicy`, `Timer`, `WebSocket`, or lifecycle components;
- production request tracing, redaction, or inspector integration;
- server-side rendering or hydration of cached data.

## Design Direction

Introduce a small runtime data service instead of embedding data behavior inside individual components.

The service should own:

- stable request-key construction from method, URL, query params, body, headers, credentials, and explicit page params later;
- cache entries with `value`, `error`, `loaded`, `inProgress`, `isRefetching`, `responseHeaders`, and revision;
- in-flight request bookkeeping with `AbortController`;
- stale-response prevention through request sequence IDs;
- subscription/invalidation so expressions depending on component API values re-render;
- a fetch adapter interface so unit/E2E tests can use deterministic mock responses without browser network complexity.

Components should stay thin:

- `DataSource` resolves its props reactively, registers a component API object by `id`, and delegates load/refetch to the data service.
- `APICall` resolves its props at execution time, registers an API object by `id`, and delegates mutation execution to the same request service.
- `Actions.callApi` should call the same execution path as `APICall` where practical.

Avoid compiling render-specific behavior. Data APIs should appear to expressions as ordinary runtime references, and state changes should flow through the existing invalidation mechanism.

## Compatibility Subset

### DataSource

Implement now:

- props: `id`, `url`, `method`, `mockData`, `body`, `rawBody`, `queryParams`, `headers`, `credentials`, `resultSelector`, `transformResult`, `dataType`, `pollIntervalInSeconds`;
- events: `loaded`, `error`, `fetch`;
- API: `value`, `inProgress`, `isRefetching`, `loaded`, `error`, `refetch()`, `responseHeaders`;
- behavior:
  - non-visual rendering;
  - automatic fetch on mount and whenever the request key changes;
  - `mockData` bypasses network and still triggers `loaded`;
  - `fetch` event override receives `$url`, `$method`, `$queryParams`, `$requestBody`, `$requestHeaders`, and returns the result;
  - `resultSelector` extracts a shallow/dotted property path from response data;
  - `transformResult` applies a compiled expression/function if current expression support allows it;
  - `pollIntervalInSeconds` can be implemented with a simple interval or deferred if it would distract from request lifecycle.

Defer:

- `prevPageSelector`, `nextPageSelector`, paging, structural sharing details, `csv`, `sql`, notifications, transaction headers, and full polling semantics.

### APICall

Implement now:

- props: `id`, `url`, `method`, `body`, `rawBody`, `queryParams`, `headers`, `credentials`, `invalidates`, `updates`;
- events: `beforeRequest`, `success`, `error`, `mockExecute`;
- API: `execute(...params)`, `inProgress`, `loaded`, `lastResult`, `lastError`, `lastResponseHeaders`;
- context variables for execution:
  - `$param`;
  - `$params`;
  - `$queryParams`;
  - `$requestBody`;
  - `$requestHeaders`;
  - `$pathParams` if URL path extraction is cheap enough;
- behavior:
  - does not run automatically;
  - `beforeRequest` returning explicit `false` cancels execution;
  - `mockExecute` bypasses network and returns the result;
  - successful execution fires `success(result)`;
  - failed execution fires `error(error)`;
  - `invalidates` refetches matching `DataSource` entries unless `success` explicitly returns `false`, matching old intent.

Defer:

- confirmation dialogs, optimistic updates, `updates`, deferred polling props/events/APIs, notification messages, and status polling cancellation.

### Actions.callApi

Implement now:

- available inside compiled event handlers as `Actions.callApi(...)`;
- supports at least object-form calls:
  - `Actions.callApi({ url, method, body, queryParams, headers })`;
- returns a promise resolving to response data or rejecting with the managed error object;
- uses the same request builder and test fetch adapter as `APICall`.

Defer:

- every old overload and integration with named API declarations until the metadata/source shape is audited.

## Planned Samples

Add routed samples:

### `data-source-mock`

Uses `mockData` to avoid network:

```xml
<App>
  <DataSource id="tasks" mockData="{[
    { id: 'build', title: 'Build runtime' },
    { id: 'test', title: 'Write tests' }
  ]}" />
  <Text>Loaded: {tasks.loaded ? 'yes' : 'no'}</Text>
  <Items data="{tasks.value}">
    <Text>{$itemIndex}: {$item.title}</Text>
  </Items>
</App>
```

Learning: component APIs are visible to compiled expressions and `Items` can consume fetched data.

### `data-source-refetch`

Uses a mock/test fetch adapter and a button:

```xml
<App>
  <DataSource id="stats" url="/api/stats" />
  <Text>Count: {stats.value.count}</Text>
  <Button onClick="stats.refetch()">Refresh</Button>
</App>
```

Learning: refetch updates API state and invalidates dependent expressions.

### `api-call-mutation`

Uses an `APICall` that invalidates a `DataSource`:

```xml
<App>
  <DataSource id="tasks" url="/api/tasks" />
  <APICall id="addTask" url="/api/tasks" method="post" body="{{ title: 'New task' }}" invalidates="tasks" />
  <Button onClick="addTask.execute()">Add task</Button>
  <Items data="{tasks.value}">
    <Text>{$item.title}</Text>
  </Items>
  <Text>Last result: {addTask.lastResult.title || 'none'}</Text>
</App>
```

Learning: user-visible data modification flows through managed mutation and cache invalidation.

### `actions-call-api`

Uses `Actions.callApi` from a handler:

```xml
<App var.message="{''}">
  <Button onClick="message = (await Actions.callApi({ url: '/api/message' })).text">
    Load message
  </Button>
  <Text>{message || 'No message'}</Text>
</App>
```

Learning: compiled async handlers can await managed API calls and update XMLUI state.

## Implementation Steps

### Step 1: Compatibility Audit and Findings

- Read the original files listed in the compatibility baseline.
- Record a concise note in `.ai/experiment-7-data-operations-managed-fetching-findings.md`.
- Extract the implemented subset and deferred subset for `DataSource`, `APICall`, and `Actions.callApi`.
- Identify old tests that can be ported nearly literally and tests that need infrastructure translation.

Verification:

- Findings note exists and names source files, implemented subset, deferred subset, and compatibility risks.

### Step 2: Data Contract Metadata

- Add compiler contracts for `DataSource` and `APICall`.
- Mark both as non-visual built-ins that allow `id` and component API registration.
- Add props/events/apis/context variables from the compatibility subset.
- Ensure `onLoaded`, `onError`, `onFetch`, `onBeforeRequest`, `onSuccess`, and `onMockExecute` normalize to the correct event names.

Verification:

- Contract tests assert prop/event/API names match the original metadata subset.
- Unknown prop/event diagnostics still work.

### Step 3: Runtime Reference Shape

- Extend the component reference model so non-visual built-ins can register reactive API objects by `id`.
- Ensure expressions can read `tasks.value`, `tasks.loaded`, `api.inProgress`, and `api.lastResult`.
- Ensure event handlers can call `tasks.refetch()` and `api.execute()`.
- Make API value updates trigger existing render invalidation.

Verification:

- Unit tests read registered API values from compiled expressions.
- Unit tests call registered API methods from compiled handlers.

### Step 4: Fetch Adapter and Request Builder

- Add a runtime fetch adapter interface.
- Implement default adapter over browser `fetch`.
- Implement test adapter for deterministic unit/E2E fixtures.
- Build request objects from method/url/body/rawBody/queryParams/headers/credentials.
- Normalize JSON request bodies and response parsing for `dataType="json"` and `dataType="text"`.

Verification:

- Unit tests for query string construction, body/rawBody precedence, headers, credentials, JSON parsing, text parsing, and HTTP error shaping.

### Step 5: Managed Request Cache

- Implement a small cache keyed by normalized request identity.
- Track `value`, `error`, `loaded`, `inProgress`, `isRefetching`, `responseHeaders`, and revision.
- Deduplicate simultaneous identical `DataSource` loads.
- Abort stale in-flight requests when a key changes or a newer request supersedes an older one.
- Ignore stale responses that arrive after a newer request has started.

Verification:

- Unit tests for cache reuse, deduplication, abort on key change, stale response suppression, and subscriber notifications.

### Step 6: DataSource Runtime

- Implement non-visual `DataSource` renderer.
- Resolve props reactively.
- Register API by `id`.
- Start load on mount and request-key changes.
- Support `mockData`, default fetch, `fetch` event override, `loaded`, `error`, `resultSelector`, `transformResult`, and `refetch()`.

Verification:

- Unit tests for mock data, loaded/error events, result selector, transform result, refetch, and reactive prop changes.
- E2E sample renders fetched/mock data and updates after refetch.

### Step 7: APICall Runtime

- Implement non-visual `APICall` renderer.
- Register API by `id`.
- Implement `execute(...params)` with `$param`/`$params` context.
- Support `beforeRequest`, `mockExecute`, default fetch, `success`, `error`, and mutation state fields.
- Support `invalidates` by refetching named `DataSource` APIs.

Verification:

- Unit tests for execute, method/body/query/header handling, beforeRequest cancellation, success/error payloads, mockExecute, and invalidation.
- E2E sample modifies server/test-adapter data and refreshes visible `DataSource` output.

### Step 8: Actions.callApi

- Expose `Actions.callApi` in compiled handler runtime context.
- Route calls through the same request builder and adapter.
- Ensure handlers can `await` the returned promise.
- Shape errors consistently with `APICall` and `DataSource`.

Verification:

- Unit tests for `await Actions.callApi(...)`.
- E2E sample updates XMLUI state from an awaited API result.

### Step 9: Test Harness Infrastructure

- Add a deterministic API fixture layer for E2E samples.
- Decide whether to use Playwright request routing, an in-runtime mock adapter, or a tiny Vite dev-server mock endpoint.
- Keep old XMLUI test markup as literal as practical while adapting only the harness.
- Document the chosen approach in the findings note.

Verification:

- E2E tests do not depend on external network.
- Tests can simulate success, error, slow request, and mutation invalidation.

### Step 10: Samples and Routes

- Add routes for:
  - `dataSourceMock`;
  - `dataSourceRefetch`;
  - `apiCallMutation`;
  - `actionsCallApi`.
- Ensure each sample demonstrates user-visible state/data modification.
- Add route entries in `xmlui/src/main.tsx`.

Verification:

- E2E tests cover every new route.

### Step 11: Old Test Porting Pass

- Select a small first group of original tests to port nearly literally:
  - `DataSource` mock/basic load;
  - `DataSource` error event;
  - `APICall execute`;
  - `APICall method/body/query`;
  - invalidation/refetch;
  - handler-level `Actions.callApi`.
- Record old tests intentionally deferred and why.

Verification:

- Ported tests pass under the new infrastructure.
- Deferred tests are listed in the plan or findings note.

### Step 12: Regression and Closure

- Run unit tests after each implementation slice.
- Run build/typecheck before E2E.
- Run full E2E at the end.
- Update this plan with implementation closure and deferred compatibility notes.
- Update `.ai/experiment-7-data-operations-managed-fetching-findings.md`.

Verification:

- `npm --workspace xmlui run test`
- `npm --workspace xmlui run build`
- `npm run test:e2e`

## Success Criteria

Experiment 7 is successful when:

- `DataSource` values can be read from compiled expressions through component APIs;
- `DataSource` exposes `value`, `loaded`, `inProgress`, `error`, `responseHeaders`, and `refetch()` with reactive updates;
- `APICall.execute()` runs from compiled handlers and updates `lastResult`, `lastError`, `loaded`, and `inProgress`;
- `APICall invalidates` causes visible `DataSource` data to refresh after a mutation;
- `Actions.callApi` can be awaited inside an async XMLUI handler;
- duplicate loads are deduplicated, stale in-flight requests are aborted or ignored, and stale responses cannot overwrite newer data;
- tests prove both data display and user-triggered data modification.

## Risks and Open Questions

- The old framework uses React Query. This experiment should prove whether a small service is enough now or whether TanStack Query should remain behind an adapter.
- `transformResult` and `fetch`/`mockExecute` event overrides may need richer return-value plumbing than current event execution exposes.
- Component API registration must be reactive without turning every API property into regular XMLUI state.
- Request-key stability must avoid accidental refetch loops when object-valued props are recreated.
- `invalidates` semantics may be broader than named `DataSource` IDs in the original framework.
- `Actions.callApi` may have old overloads or named API integration that require a second compatibility pass.
- Polling and deferred operations are intentionally deferred, but the architecture must leave room for them.

## Implementation Closure

Implemented:

- Added `DataSource` and `APICall` as non-visual built-ins with compatibility-shaped compiler contracts.
- Added component-reference dependencies so expressions and handlers can react to `DataSource`, `APICall`, and `Actions` APIs.
- Added a small managed fetch runtime service with request construction, query parameter handling, normalized request keys, caching, in-flight deduplication, force refetch, abort handling, response header capture, JSON/text parsing, and result selection.
- Added `DataSource` runtime support for `id`, `url`, `method`, `mockData`, `body`, `rawBody`, `queryParams`, `headers`, `credentials`, `dataType`, `resultSelector`, `transformResult`, `pollIntervalInSeconds`, `onFetch`, `onLoaded`, `onError`, API registration, and `refetch()`.
- Added `APICall` runtime support for `execute(...params)`, `$param`, `$params`, request context variables, `onBeforeRequest`, `onMockExecute`, `onSuccess`, `onError`, mutation state, and `invalidates`.
- Added `Actions.callApi(...)` to compiled handler runtime context.
- Added routed samples for `dataSourceMock`, `dataSourceRefetch`, `apiCallMutation`, and `actionsCallApi`.
- Added unit and E2E tests covering display data, refetch, mutation invalidation, and awaited imperative calls.
- Stabilized object-valued data props and API invalidation so reactive references do not create render loops when expressions return fresh objects or arrays.

Deferred:

- Full deferred operation and polling semantics for `APICall`.
- Confirmation dialogs, notifications, optimistic `updates`, paging selectors, structural sharing, CSV/SQL modes, uploads/downloads, tracing, and inspector integration.
- A deeper literal port of the original `DataSource` and `APICall` specs once the surrounding compatibility surface grows.

Verification:

- `npm --workspace xmlui run test` passed: 19 files, 179 tests.
- `npm --workspace xmlui run build` passed, with only Vite's existing large-chunk warning.
- `npm run test:e2e` passed: 31 tests.
