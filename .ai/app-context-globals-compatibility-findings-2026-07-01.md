# AppContext Globals Compatibility Findings - 2026-07-01

## Source Of Truth

- Original contract: `/Users/dotneteer/source/xmlui/xmlui/src/abstractions/AppContextDefs.ts`
- Original date utility exports: `/Users/dotneteer/source/xmlui/xmlui/src/components-core/appContext/date-functions.ts`
- Triggering regression: XMLUI scripts such as `formatDateTime(getDate())` compiled with
  `[plugin:xmlui-rs:xmlui] Unresolved XMLUI script identifier 'formatDateTime'`.

## Finding

The rewrite compiler resolves ordinary global helper names by checking the
default `createXmluiAppContextObject()` own properties through
`hasXmluiAppContextProperty`. Before this migration, that object exposed only a
small subset (`appGlobals`, `$appGlobals`, `mediaSize`, `toast`, `confirm`, and
`navigate`), so many original XMLUI global helpers were rejected during script
semantic analysis.

The original framework treats the top-level `AppContextObject` as the
compatibility surface for application globals. That includes date helpers
(`formatDateTime`, `smartFormatDate`, `isToday`, etc.), math/file utilities,
theme/user/storage helpers, `Log`, `App`, `Clipboard`, and pub/sub names.

## Rewrite Strategy

- Expand `xmlui/src/runtime/appContextObject.ts` so the default app context
  exposes the original top-level identifiers as own properties.
- Keep existing compiler precedence for names that are already special or
  built-in in the rewrite:
  - `navigate` and `delay` remain special event-context helpers.
  - `getDate` remains a built-in reference for existing compiled output.
- Provide lightweight fallback implementations where the rewrite has no full
  service yet, with browser APIs guarded for non-browser compilation.

## Verification

- `npm --workspace xmlui exec -- vitest run tests/compiler/scriptSemantics.test.ts`
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`

The compiler suite now checks that every original `AppContextObject` top-level
identifier binds without unresolved diagnostics and that
`formatDateTime(getDate())` parses through the default app-context contract.
