# Scheduling Foundation Findings - 2026-06-23

## Scope

Wave F3A migrated foundation behavior for `Timer` and `Queue`.

## Original Sources Inspected

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Timer/Timer.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Timer/TimerReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Timer/Timer.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Queue/Queue.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Queue/QueueReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Queue/Queue.spec.ts`

## Rewrite Changes

- Added component-owned metadata, docs, renderers, and focused E2E specs for:
  - `Timer`
  - `Queue`
- Registered both components in compiler contracts, IR lowering, and the
  runtime component registry.
- Added runnable example `?example=schedulingFoundation`.

## Foundation Behavior Covered

- `Timer`
  - hidden diagnostic element with old-style timer data attributes;
  - `enabled`, `interval`, `initialDelay`, and `once`;
  - `onTick`;
  - `pause`, `resume`, `isPaused`, and `isRunning`;
  - no overlapping tick handler execution.
- `Queue`
  - id-based API registration;
  - `enqueueItem`, `enqueueItems`, `remove`, `getQueuedItems`,
    `getQueueLength`, and `clearCompleted`;
  - FIFO processing;
  - `onWillProcess`, `onProcess`, `onDidProcess`, and `onComplete`;
  - basic queue context variables for future closure.

## Compatibility Debt

- Literal old E2E suites are not fully transferred.
- Queue progress/result feedback templates and toast integration are deferred.
- Queue error-path tests need script throw/error support to be meaningful.
- Some old Queue tests use JavaScript constructs not yet supported by the
  current XMLUI event parser, such as multi-parameter arrow callbacks and local
  `const` declarations.
