# FileUploadDropZone Migration Findings - 2026-06-23

Wave: Phase 5 Wave B6.2, FileUploadDropZone Foundation.

Original XMLUI sources inspected:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZone.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZoneReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZone.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZone.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZone.md`

Implemented rewrite shape:

- component folder stays source-adjacent under `xmlui/src/components/FileUploadDropZone`;
- metadata is in `FileUploadDropZone.tsx`;
- native renderer is in `FileUploadDropZoneReact.tsx`;
- visual styling is class-based in `FileUploadDropZone.module.scss`;
- E2E coverage is colocated in `FileUploadDropZone.spec.ts`;
- the runtime/compiler registry and metadata generation know about the
  transferred component.

Behavior covered:

- children rendering and default placeholder rendering;
- hidden file input, accepted type attributes, and `maxFiles`;
- drag/drop upload payloads, accepted-type filtering, and max-file limiting;
- paste disabled by default;
- `allowPaste` upload behavior and suppression from nested text-editing
  controls;
- `enabled` state;
- `open()` API registration;
- component theme variables.

Correction:

- The first migrated `FileUploadDropZone.spec.ts` was only focused coverage and
  did not copy the full old E2E suite. The old component has 37 E2E test cases.
  The rewrite migration must use those old cases literally, changing only
  fixtures/drivers/infrastructure where needed.
- The corrected migrated suite now uses the old `FileUploadDropZone.spec.ts`
  cases and passes with all 37 tests.

Important implementation notes:

- API registration should not happen in a React `ref` callback that invalidates
  XMLUI runtime references. That caused a maximum update depth loop when an
  XMLUI handler referenced `dropzone.open()`. Use a stable effect-based API
  registration path instead.
- Playwright `locator.evaluate` callbacks cannot call helper functions defined
  in the test driver module. Browser-side drag/drop and paste helpers must be
  defined inside the evaluated function or otherwise injected into the page.
- Correction after comparing with the original XMLUI script runner: avoiding
  nested arrow callbacks in samples is only a temporary workaround, not a
  compatibility rule. Original XMLUI does not allow users to write `async` or
  `await`, but its async script interpreter detects promise-producing calls and
  awaits them. It also replaces array methods such as `map`, `filter`,
  `forEach`, `some`, `every`, `find`, `flatMap`, and `reduce` with async-aware
  proxies when their callbacks may produce promises. The rewrite compiler must
  preserve that behavior without injecting `await` into nested non-async
  callback source.
- The copied old FileUploadDropZone tests prove that the current E2E path can
  execute simple upload callback handlers such as
  `files => testState = files.map(f => f.name)`. The broader event-compiler
  backlog is still to match the old async script runner for promise-producing
  calls and async-aware array helpers, without requiring users to write
  `async` or `await`.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run compatibility:component-transfer`
- `npm --workspace xmlui run compatibility:component-e2e-audit`
- `npm --workspace xmlui run test:e2e -- src/components/FileUploadDropZone/FileUploadDropZone.spec.ts`
  passed with 37 passed.
