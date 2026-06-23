# Feedback and Accessibility Foundation Findings - 2026-06-23

## Scope

Phase 5 Wave F5A migrated the first compatibility slice for user feedback and
accessibility service components:

- `LiveRegion`
- `Bookmark`
- `SkipLink`
- `Toast`

`FocusScope` and `Animation` were inspected but deferred because they require a
larger accessibility/focus utility and animation-runtime closure.

## Original Sources Inspected

- `/Users/dotneteer/source/xmlui/xmlui/src/components/LiveRegion/LiveRegion.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/LiveRegion/LiveRegionReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Bookmark/Bookmark.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Bookmark/BookmarkReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/SkipLink/SkipLink.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/SkipLink/SkipLinkReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Toast/Toast.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Toast/ToastReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FocusScope/FocusScope.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FocusScope/FocusScopeReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Animation/AnimationReact.tsx`

## Preserved Foundation Behavior

- `LiveRegion` renders visually hidden live-region content, defaults to
  `polite`, and switches to alert/assertive semantics when requested.
- `Bookmark` renders an anchor, preserves children, exposes
  `scrollIntoView()`, and carries bookmark metadata attributes used by the
  current foundation tests.
- `SkipLink` stays visually hidden until focused, links to a target, and
  keyboard activation focuses the target or the first focusable descendant.
- `Toast` exposes `show`, `success`, `error`, and `loading` APIs through the
  component id and uses the existing runtime toast host.

## Deferred Compatibility Debt

- Literal old component E2E suites are not fully transferred yet.
- `LiveRegion` global announcement helper behavior is deferred.
- `Bookmark` TableOfContents registration and nested scroll-container behavior
  are deferred to the TableOfContents/Bookmark closure.
- `SkipLink` portal parity and full keyboard/visual-hidden suite are deferred.
- `Toast` template rendering, update-in-place semantics, and full
  `react-hot-toast` parity are deferred.
- `FocusScope` should migrate with the old focus-scope utility behavior.
- `Animation` should migrate with the old `@react-spring/web` option parsing,
  presets, API registration, and in-view behavior.

## Verification

- `npm --workspace xmlui exec -- playwright test src/components/LiveRegion/LiveRegion.spec.ts src/components/Bookmark/Bookmark.spec.ts src/components/SkipLink/SkipLink.spec.ts src/components/Toast/Toast.spec.ts`
  - 8 passed, 4 explicit fixme skips.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui test`
  - 37 files, 263 tests passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit`
