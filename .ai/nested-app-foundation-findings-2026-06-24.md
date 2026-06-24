# NestedApp Foundation Findings - 2026-06-24

## Scope

Phase 5 Wave G4A migrated the first `NestedApp` boundary slice.

## Original Sources Inspected

- `/Users/dotneteer/source/xmlui/xmlui/src/components/NestedApp/NestedApp.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NestedApp/NestedAppReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NestedApp/NestedApp.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NestedApp/NestedApp.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/App.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Markdown/Markdown.spec.ts`

## Preserved Foundation Behavior

- `NestedApp` keeps the old public component name and source-adjacent file
  organization: metadata, renderer, React implementation, stylesheet, docs,
  and component-local E2E tests.
- The `app` property accepts XMLUI source text and compiles it through the
  current compiler/runtime path.
- The nested app uses its own runtime root and state store, so nested local
  variables mutate independently from the parent app.
- The `height` prop applies to the nested app container.
- Invalid nested source is reported inside the nested app boundary instead of
  breaking the parent app.
- A runnable `npm run dev` sample is available as
  `?example=nestedAppFoundation`.

## Deferred Compatibility Debt

- Shadow DOM isolation, stylesheet cloning/adoption, nested portal root,
  `isNested` global prop propagation, and old App nested-layout class behavior
  remain deferred.
- Playground frame, split view, reset controls, splash screen, lazy viewport
  activation, `AppWithCodeView`, and Markdown playground integration remain
  deferred.
- `api`, `components`, `config`, `activeTheme`, and `activeTone` are present in
  metadata but not yet fully implemented.
- The old nested `dark` default theme-var block could not be represented in the
  current metadata type and remains deferred until tone-specific theme defaults
  are supported.
- Literal old `NestedApp`-related tests are indirect in the old project through
  App and Markdown suites; full transfer remains deferred.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui exec -- playwright test src/components/NestedApp/NestedApp.spec.ts`
  - 3 passed.
- `npm --workspace xmlui test`
  - 37 files, 263 tests passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit`
