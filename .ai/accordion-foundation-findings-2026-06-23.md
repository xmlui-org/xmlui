# Accordion Foundation Findings - 2026-06-23

Scope: Phase 5 Wave D3A migrated the initial `Accordion`/`AccordionItem`
foundation.

Original XMLUI reference:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Accordion`
- Old files inspected: `Accordion.tsx`, `AccordionReact.tsx`,
  `AccordionItem.tsx`, `AccordionItemReact.tsx`, `AccordionContext.tsx`,
  `Accordion.module.scss`, defaults, docs, and E2E suite.

Implemented in the rewrite:

- `Accordion` and `AccordionItem` component folder with metadata in
  `Accordion.tsx`, defaults, context, React renderers, SCSS, docs, copied old
  E2E suite, and foundation E2E suite.
- Runtime/compiler wiring for `Accordion` and `AccordionItem`.
- Test fixture driver `createAccordionDriver`.
- Visual example: `http://127.0.0.1:5173/?example=accordionFoundation`.

Important implementation notes:

- The old suite is copied literally but skipped until full API, keyboard,
  accessibility, icon, and theme-variable parity is implemented.
- `adapter.renderTemplate("headerTemplate")` returns an empty React fragment
  when the template is absent. For optional templates, check whether the
  property element exists before choosing the template over a normal prop.
- Current icon rendering is only a foundation substitute that displays icon
  names as text. Replace this with the migrated XMLUI icon pipeline.
- Current async event code generation still has limitations around some nested
  callback/member-call shapes. The Accordion example uses `ids => expanded =
  ids` instead of `ids => expanded = ids.join(",")` to avoid breaking module
  loading before that compiler debt is resolved.
- Theme-variable metadata follows the temporary source-string extraction
  workaround used by Splitter and Sticky components. Prefer direct SCSS
  extraction again once config-time path handling is fixed.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Accordion`
  - 3 passed, 9 skipped.
- `npm test`
  - 263 unit tests passed.
- `npm --workspace xmlui run test:e2e -- --list`
  - 3701 E2E tests in 107 files.

Next planned slice:

- Phase 5 Wave D3B - `ExpandableItem` foundation.
