# Website Docs Route Findings

Date: 2026-06-27

## Scope

This note records the first restored copied docs markdown route for the
website migration. The immediate goal was display: prove that real markdown
from the copied website content can render through the current workspace.

## Source of Truth

- Old website docs content:
  `/Users/dotneteer/source/xmlui/website/content/docs/pages/intro.md`
- Migrated content:
  `website/content/docs/pages/intro.md`
- Current route:
  `website/src/Main.xmlui`
- Current config content loader:
  `website/src/config.ts`

## Implemented Slice

- Added a `/docs/intro` website route.
- Rendered copied `content/docs/pages/intro.md` through the `Markdown`
  component.
- Passed docs content through `appGlobals` from website config into the runtime.
- Added `$appGlobals` as a runtime context alias so XMLUI markup can access the
  migrated content deterministically.

## Verification

Commands:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui-website run build`
- `npm --workspace xmlui-website run start`

Browser smoke:

- URL: `http://localhost:5173/docs/intro`
- Verified title: `Introduction`
- Verified copied body text includes `building user interfaces declaratively`
- Verified copied body text includes the tiny app example copy
- Verified copied body text includes section `Markup`
- Console/page errors: none

Known build warnings are unchanged: Sass deprecations from copied theme code,
Smart UI direct-eval warning, and large bundle chunk warning.

## Compatibility Gaps Found

- `DocumentPage` is not yet restored as an XMLUI user-defined component in the
  website route. A route using `<DocumentPage>` failed with `Unknown XMLUI
  component: DocumentPage`. The display slice uses direct `Markdown` rendering
  until UDC package/content registration parity is restored.
- Bare `appGlobals` expression parity remains uncertain. The route currently
  uses `$appGlobals.docsContent['pages/intro.md']` as a runtime bridge.
- `TableOfContents` mounts without browser errors, but the quick smoke did not
  prove markdown heading extraction. The selector only observed the top-level
  navigation links.
- Old responsive prop shorthand such as `when-lg` was rejected by current
  parser/prop validation in this route, so it was omitted for the display
  milestone.

## Next Useful Step

Restore `DocumentPage`/user-defined component registration enough for the docs
route to match the old website structure, or continue adding real docs routes
through the direct markdown bridge if visible coverage remains the higher
priority.
