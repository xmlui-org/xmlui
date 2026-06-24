# Data Operations Foundation Findings - 2026-06-23

## Scope

Wave F1A migrated the rewrite's existing `DataSource` and `APICall`
foundation behavior into component-owned modules.

## Original Sources Inspected

- `/Users/dotneteer/source/xmlui/xmlui/src/components/DataSource/DataSource.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DataSource/DataSource.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/APICall/APICall.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/APICall/APICallReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/APICall/APICall.spec.ts`

## Rewrite Changes

- Added component-owned metadata and docs:
  - `xmlui/src/components/DataSource/DataSource.tsx`
  - `xmlui/src/components/DataSource/DataSource.md`
  - `xmlui/src/components/APICall/APICall.tsx`
  - `xmlui/src/components/APICall/APICall.md`
- Moved the current experimental runtime behavior out of registry fallback use
  and behind component-owned renderers:
  - `xmlui/src/components/DataSource/DataSource.renderer.tsx`
  - `xmlui/src/components/APICall/APICall.renderer.tsx`
- Switched compiler contracts for both components to metadata-derived contracts.
- Added foundation E2E tests for current supported behavior:
  - `mockData`
  - scripted `onFetch`
  - API references
  - `refetch`
  - result selection/transformation
  - `execute`
  - `onBeforeRequest` cancellation
  - `onMockExecute`
  - `invalidates`

## Compatibility Debt

The literal old `DataSource` and `APICall` E2E suites are not fully migrated.
They depend on infrastructure or features that still need separate runtime
slices:

- old API interceptor fixture behavior;
- notifications;
- confirmation/deferred API calls;
- optimistic updates;
- paging selectors;
- CSV and SQL response handling;
- structural sharing;
- richer request lifecycle and retry/cancellation semantics.

Do not call the full `DataSource` or `APICall` migration complete until those
old test cases are either passing literally or mapped with explicit fixme notes
to later planned runtime/tooling work.
