# Cancellable Data Operations

## Goal

Add a consistent cancellation API to XMLUI data operations:

- `DataSource`
- `APICall`
- declarative/API upload operations (`FileUpload` / `Actions.upload`)
- declarative/API download operations (`FileDownload` / `Actions.download`)

Use `cancel()` as the public method name. It is shorter, matches the existing `APICall.cancel()` deferred-mode API, and reads well in markup:

```xmlui
<Button label="Cancel" onClick="orders.cancel()" />
```

The user-facing docs can describe the operation as "cancel the operation"; the actual method should be `cancel()`.

## User-Facing Contract

### Component/action API

Expose:

```ts
cancel(reason?: string): Promise<boolean>
```

Semantics:

- Returns `true` when there was an active operation and a cancellation request was issued.
- Returns `false` when there was no active cancellable operation.
- The default `reason` is `"user"`.
- Repeated calls are idempotent for the same in-flight operation.
- Cancellation should not call ordinary success handlers.
- Cancellation should not call ordinary error handlers unless a component has no better existing way to report aborts. Prefer a dedicated cancel event.

### Cancel event

Add a dedicated event named `cancel`, handled as `onCancel` in markup:

```xmlui
<DataSource id="orders" url="/api/orders" onCancel="reason => toast('Cancelled')" />
```

Signature:

```ts
cancel(reason: string): void
```

Recommended payload:

- `reason`: string, default `"user"`
- Optional second argument may be added if implementation needs operation details later, but keep the initial public surface small unless tests/docs need it.

### State

Expose cancellability/status consistently:

- `inProgress` becomes `false` after cancellation.
- Existing successful data/results stay available unless the component already clears them for equivalent lifecycle events.
- Do not mark a cancelled operation as a successful `loaded` result.
- Do not set `lastError` / `error` to a normal failure for user-initiated cancellation. If a state flag is needed, prefer `cancelled` and `lastCancelReason`.

Suggested additions:

```ts
cancelled: boolean
lastCancelReason: string | undefined
```

For API-like operations, reset `cancelled` to `false` when a new `execute()`/upload/download/fetch starts.

## Existing Architecture Notes

- `RestApiProxy.execute()` and `RestApiProxy.upload()` already accept `abortSignal` and pass it to `fetch` / upload-progress XHR.
- `DataSource` fetches flow through React Query, whose query functions already receive an `AbortSignal`.
- `DataSource` component APIs are currently registered in `Loader.tsx` and `PageableLoader.tsx`.
- `APICall` already has `cancel()` for deferred-mode polling and optional server-side `cancelUrl`; extend it rather than creating a second method.
- `FileUpload` and `FileDownload` are action components in `ApiBoundComponent`, backed by `Actions.upload()` and `Actions.download()`, not normal visual components today.
- Simple GET downloads use a hidden iframe path. That browser-managed request cannot be reliably aborted after `src` is assigned; the cancellable path is the fetch/XHR path used for custom headers, non-GET, mocked downloads, or explicit cancellable mode.

## Implementation Plan

### 1. Add shared cancellation helpers

Create a small internal helper module, likely under `xmlui/src/components-core/action/operationCancellation.ts` or similar, with:

- `createOperationAbortController()`
- `isAbortError(error)`
- `createCancelledOperationResult(reason)`
- common reason/default constants

Keep this separate from event-handler `$cancel` unless integration becomes straightforward. Component operation cancellation is per network operation; event-handler cancellation is scheduler-level and scoped by component/event.

### 2. DataSource

Files:

- `xmlui/src/components/DataSource/DataSource.tsx`
- `xmlui/src/components-core/loader/Loader.tsx`
- `xmlui/src/components-core/loader/PageableLoader.tsx`
- `xmlui/src/components-core/loader/DataLoader.tsx`
- `xmlui/src/components-core/LoaderComponent.tsx`
- `xmlui/src/components-core/rendering/containers.ts`
- `xmlui/src/components-core/rendering/reducer.ts`

Steps:

1. Add `cancel` event metadata and `cancel()` / optional `cancelled` / `lastCancelReason` API metadata to `DataSourceMd`.
2. Thread `onCancel` from `DataLoader` into `Loader` and `PageableLoader`.
3. Register `cancel(reason?)` alongside `refetch()` in loader component APIs.
4. Implement cancellation with `queryClient.cancelQueries({ queryKey, exact: true })` so React Query aborts the in-flight request signal.
5. Dispatch a new loader cancellation state transition, or use existing dispatch paths plus a state update, so `inProgress` and `isRefetching` become `false` immediately.
6. Ensure aborted React Query errors are swallowed for user-initiated cancellation and do not trigger `onError`, error toasts, or fallback reporting.
7. Fire `onCancel(reason)` after state has been updated.
8. Cover both normal loaders and pageable loaders.

### 3. APICall — completed

Files:

- `xmlui/src/components/APICall/APICall.tsx`
- `xmlui/src/components/APICall/APICallReact.tsx`
- `xmlui/src/components-core/action/APICall.tsx`
- `xmlui/src/components-core/ApiBoundComponent.tsx`

Steps:

1. Extend `APICall.cancel()` beyond deferred polling to abort the active initial request or normal mutation request.
2. Store an `AbortController` for the current execution in `APICallReact`.
3. Pass `abortSignal` into `callApi()`.
4. Add `abortSignal?: AbortSignal` to the core `callApi` parameter type and pass it to `RestApiProxy.execute()`.
5. Preserve current deferred behavior:
   - stop polling immediately
   - if `cancelUrl` is configured and an initial result exists, call the cancel endpoint
   - do not require `cancelUrl` for local cancellation
6. Add `onCancel` event metadata and custom render wiring.
7. When an abort is observed, set `inProgress` to `false`, keep `loaded` as-is or `false` for an incomplete first execution, set `cancelled`/`lastCancelReason`, and avoid `onError`.
8. Reset the active controller and cancellation state when a new `execute()` begins.

Status: Implemented in `APICallReact`, core `callApi`, APICall metadata, nested action generation, and E2E coverage.

### 4. Upload — completed

Files:

- `xmlui/src/components-core/action/FileUploadAction.tsx`
- `xmlui/src/components-core/RestApiProxy.ts`
- `xmlui/src/components-core/ApiBoundComponent.tsx`
- metadata/doc generation source for `FileUpload`, if one exists or is generated from action definitions
- `website/content/docs/pages/globals.md`

Steps:

1. Add `abortSignal?: AbortSignal` and `onCancel?: string | function` to `UploadActionParams`.
2. Pass `abortSignal` to every `api.upload()` call.
3. In chunked uploads, check `abortSignal.aborted` before each chunk and stop before starting the next chunk.
4. Abort an active `FileReader` when cancellation occurs for non-form uploads.
5. Treat upload aborts as cancellation, not normal errors; invoke `onCancel(reason)` and skip `invalidates`.
6. Ensure declarative `<FileUpload>` actions generated in `ApiBoundComponent` forward an action-level signal/cancel context if available.
7. For direct `Actions.upload()`, support caller-provided `abortSignal`; document an ergonomic example using an `AbortController` only if component-addressable upload cancellation is not yet available.

Status: Implemented for direct/nested upload actions, including chunk guards, FileReader abort support in `RestApiProxy`, and focused unit coverage.

Preferred user-facing how-to example:

```xmlui
<FileInput id="file" label="File" />
<APICall
  id="upload"
  method="post"
  url="/api/upload"
  body="{{ file: file.value?.[0] }}"
  payloadType="multipart-form"
  onCancel="toast('Upload cancelled')"
/>
<Button label="Start upload" onClick="upload.execute()" />
<Button label="Cancel upload" onClick="upload.cancel()" enabled="{upload.inProgress}" />
```

If the existing upload path must remain `Actions.upload()` / `<FileUpload>`, create the example around a stored controller and make the plan implementation expose an `id`-addressable upload operation before documenting `upload.cancel()`.

### 5. Download — completed

Files:

- `xmlui/src/components-core/action/FileDownloadAction.tsx`
- `xmlui/src/components-core/RestApiProxy.ts`
- `xmlui/src/components-core/ApiBoundComponent.tsx`
- `website/content/docs/pages/globals.md`

Steps:

1. Add `abortSignal?: AbortSignal` and `onCancel?: string | function` to download action parameters.
2. Pass `abortSignal` into the fetch-backed `api.execute()` branch.
3. For iframe downloads, document and implement best-effort cancellation:
   - before iframe creation: cancel means no iframe is created
   - after iframe creation: remove the iframe and fire `onCancel`, but clearly document that browser/native download UI may continue
4. Consider an explicit prop such as `forceFetch` or `cancellable="true"` only if tests show users cannot reliably cancel the current simple GET iframe path. If added, it must be documented and covered by tests.
5. Skip success side effects when cancellation wins before the anchor click.

Status: Implemented for fetch-backed downloads and best-effort iframe cleanup, with focused unit coverage.

### 6. Generated event-action cancellation — completed

`ApiBoundComponent` currently turns declarative action children into calls such as `Actions.upload(...)`. Update this generated code so action components can participate in cancellation where the surrounding event system supplies a signal.

Plan the generated arguments to include:

- the event-handler `$cancel.signal` when available
- `onCancel` forwarded from declarative action events
- stable params/context behavior identical to existing success/error/progress forwarding

This should let a parent handler cancellation (`App.cancel()` or handler timeout) abort the underlying network operation. Component-level `someAction.cancel()` still requires an id-addressable component/action API.

Status: Implemented in `ApiBoundComponent`; generated `APICall`, `FileUpload`, and `FileDownload` action calls now forward `$abortSignal` or the surrounding `$cancel.signal`, plus `onCancel`.

### 7. Documentation — completed

Reference metadata:

- Add `cancel()` and `onCancel` to `DataSource`.
- Update `APICall` metadata to clarify that `cancel()` cancels any in-flight request; in deferred mode it also stops polling and optionally calls `cancelUrl`.
- Update globals docs for `Actions.callApi`, `Actions.upload`, and `Actions.download` with `abortSignal` and cancellation behavior.

How-to articles:

1. Add `website/content/docs/pages/howto/cancel-a-datasource-request.md`
   - Show a slow `DataSource`, a Cancel button, and `onCancel`.
2. Add `website/content/docs/pages/howto/cancel-an-api-call.md`
   - Show a normal non-deferred `APICall` with `execute()` and `cancel()`.
3. Add `website/content/docs/pages/howto/cancel-an-upload.md`
   - Must include a working upload example.
   - Use the final public API chosen by implementation, preferably `upload.cancel()` if upload becomes id-addressable, or `APICall.cancel()` with multipart body if upload is represented through APICall.
4. Update `website/content/docs/pages/howto/cancel-a-deferred-api-operation.md`
   - Keep the existing deferred example but clarify the relationship between `stopPolling()` and the broader `cancel()`.
5. Optionally update `website/content/docs/pages/howto/download-a-file-from-an-api.md`
   - Add a note/example for cancellable fetch-backed downloads if the API is public.

Status: Added DataSource, APICall, and upload cancellation how-to articles; updated deferred API and download how-tos; updated `globals.md`; added website example specs for the three new articles.

Update `website/src/Main.xmlui`:

- Add the new how-to pages under the "Data Loading & APIs" NavGroup near the existing API/download/deferred-cancel entries.
- Suggested labels:
  - "Cancel a DataSource request"
  - "Cancel an API call"
  - "Cancel an upload"

### 8. E2E Tests

Component tests:

- `xmlui/src/components/DataSource/DataSource.spec.ts`
  - `cancel()` aborts an in-flight initial load.
  - `onCancel` fires and `onError` does not fire.
  - `inProgress` becomes false.
  - previously loaded value remains visible when cancelling a refetch.
  - pageable loader cancellation aborts `fetchNextPage()` / `fetchPrevPage()` if applicable.

- `xmlui/src/components/APICall/APICall.spec.ts`
  - normal in-flight `execute()` can be cancelled.
  - `onCancel` fires and `onError` does not.
  - `inProgress` becomes false and a second `execute()` can run afterward.
  - deferred `cancel()` still stops polling and still calls `cancelUrl`.
  - cancelling before the initial deferred request resolves aborts the request and does not start polling.

Action/unit tests:

- `xmlui/tests/components-core/action/FileDownloadAction.test.ts`
  - fetch-backed download passes the abort signal to `fetch`.
  - abort before response prevents anchor click and fires cancel path.
  - iframe path cancellation is best-effort and removes the iframe if implemented.

- Add `xmlui/tests/components-core/action/FileUploadAction.test.ts`
  - upload passes abort signal to `RestApiProxy.upload`.
  - chunked upload stops before the next chunk after abort.
  - cancellation skips invalidation and does not call normal error handler.

Website example tests:

- Add `xmlui/tests-e2e/how-to-examples/cancel-a-datasource-request.spec.ts`.
- Add `xmlui/tests-e2e/how-to-examples/cancel-an-api-call.spec.ts`.
- Add `xmlui/tests-e2e/how-to-examples/cancel-an-upload.spec.ts`.
- Update `xmlui/tests-e2e/how-to-examples/cancel-a-deferred-api-operation.spec.ts` if the article changes visible labels or behavior.

Testing guidelines:

- Use `apiInterceptor` handlers that delay long enough for cancellation assertions.
- Prefer durable state assertions with `testState` and `expect.poll()`.
- Avoid `waitForTimeout()` except where existing tests need a tiny post-click observation window and no event/state hook exists.
- Verify focused specs first, then run parallel stability.

Suggested commands:

```bash
npx playwright test xmlui/src/components/DataSource/DataSource.spec.ts --reporter=line
npx playwright test xmlui/src/components/APICall/APICall.spec.ts --reporter=line
npx playwright test xmlui/tests-e2e/how-to-examples/cancel-a-datasource-request.spec.ts xmlui/tests-e2e/how-to-examples/cancel-an-api-call.spec.ts xmlui/tests-e2e/how-to-examples/cancel-an-upload.spec.ts --reporter=line
npm --prefix xmlui run check:metadata-snapshot
npx changeset status
```

## Edge Cases To Decide During Implementation

- Whether `cancel()` should set `loaded` to `true` after cancelling an initial `DataSource` load. Recommendation: no; keep `loaded=false` if no successful value exists.
- Whether to expose `cancelled` / `lastCancelReason` publicly on all four operation types. Recommendation: yes for consistency, but keep docs focused on `inProgress`, `lastError`, and `onCancel` unless the flags are needed in examples.
- Whether declarative `<FileUpload>` and `<FileDownload>` should become `id`-addressable non-visual components. Recommendation: avoid a larger component model change unless required; first support cancellation through `Actions.*` signals and use `APICall` multipart upload for the how-to if that gives users an ergonomic `upload.cancel()`.
- How to classify abort traces in the inspector. Recommendation: info-level, aligned with `concurrency-handler-cancelled`.

## Validation Checklist

- Public method name is `cancel()`.
- `onCancel` exists where cancellation is user-observable.
- Cancellation does not surface as a normal error.
- `inProgress` is false after cancellation.
- Upload cancellation is covered by a website how-to example.
- New how-to pages are linked from `website/src/Main.xmlui`.
- Component metadata snapshot is regenerated.
- A patch changeset is added for `xmlui`.
