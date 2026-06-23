# App State and Listener Foundation Findings - 2026-06-23

## Scope

Wave F2A migrated a foundation slice for the non-visual `AppState`,
`ChangeListener`, and `Lifecycle` components.

## Original Sources Inspected

- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppState/AppState.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppState/AppStateReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppState/AppState.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ChangeListener/ChangeListener.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ChangeListener/ChangeListenerReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ChangeListener/ChangeListener.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Lifecycle/Lifecycle.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Lifecycle/LifecycleReact.tsx`

## Rewrite Changes

- Added component-owned metadata, docs, renderers, and focused E2E specs for:
  - `AppState`
  - `ChangeListener`
  - `Lifecycle`
- Registered the components in compiler contracts, IR lowering, and the runtime
  component registry.
- Added runnable example `?example=appStateListeners`.

## Foundation Behavior Covered

- `AppState`
  - app-instance-scoped buckets;
  - shared state across instances in the same bucket;
  - separate values for different buckets;
  - mount-time `initialValue` merge;
  - `update`, `appendToList`, and `removeFromList`;
  - `didUpdate` payload with current and previous values.
- `ChangeListener`
  - no visible DOM output;
  - `listenTo`;
  - `listenToSources`;
  - source-level change payloads;
  - debounce foundation.
- `Lifecycle`
  - `onMount`;
  - `onUnmount`;
  - key-value rearming.

## Compatibility Debt

- Literal old E2E suites are not fully transferred yet.
- `Lifecycle.onError` needs a reliable script-level throw/error trigger before
  its old error-path tests can be made meaningful.
- `ChangeListener` throttle edge cases and console warning behavior still need
  old-suite closure.
- Existing `FlowLayout` non-visual compatibility tests for these components are
  currently skipped by their own compatibility gating, so they did not provide
  verification signal in this slice.
