# FileUploadDropZone Re-Migration Findings - 2026-07-01

## Original Sources

- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZoneReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZone.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZone.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZone.spec.ts`

## Compatibility Decisions

- Restored the original `react-dropzone` dependency (`14.3.8`) instead of
  maintaining a hand-rolled drag/drop implementation. The package owns subtle
  behavior around hidden inputs, accept maps, max file count, paste forwarding,
  drag acceptance state, and programmatic `open()`.
- Kept old React/SCSS component behavior protected and adapted only at the
  renderer boundary:
  - `enabled` maps to old `disabled`.
  - `maxFiles` is coerced from XML string values to numbers.
  - empty XML children are passed as `undefined` so the old placeholder path
    renders.
  - upload events are dispatched through the rewrite adapter.
  - component API/state registration publishes `open` and `value`.
- Added a shared `getComposedRef` shim for old source that expects composed
  React refs. The shim must filter `null` as well as `undefined`; third-party
  ref callbacks can send both during mount/unmount.
- Added legacy `data-icon` markers to the placeholder icon call sites because
  the current Icon renderer exposes `data-icon-name`, while the transferred
  drop-zone tests still check the old marker.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/FileUploadDropZone/FileUploadDropZone.spec.ts`
  - Passes: 37/37.
- `npm --workspace xmlui run check:metadata`
  - Passes; generated metadata includes 234 components.

## Reusable Lessons

- Prefer restoring the original browser interaction package for complex input
  primitives before attempting style or event parity. File/drop/paste behavior
  is a browser edge-case surface, not just a visual component.
- Empty rendered child arrays can break source-preserved placeholder logic.
  Renderer bridges should check the XML node's actual child list when old React
  source branches on `children`.
- Shared compatibility shims are better than one-off edits in copied source
  when an old helper import is likely to recur.
