# Tooltip Foundation Findings - 2026-06-23

Scope: Phase 5 Wave D4C migrated a foundation version of `Tooltip`.

Old source anchors:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Tooltip/Tooltip.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Tooltip/TooltipReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Tooltip/Tooltip.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Tooltip/Tooltip.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Tooltip/Tooltip.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Tooltip/Tooltip.md`

Implemented in the rewrite:

- `xmlui/src/components/Tooltip/` now contains source-adjacent metadata,
  defaults, SCSS module, React renderer, runtime renderer, copied docs, copied
  old E2E suite, and a focused foundation E2E suite.
- `Tooltip` is wired into built-in contracts, runtime registry, metadata
  reporting, the IR built-in-name list, and the dev example router.
- Visual check: run `npm run dev` in `xmlui/` and open
  `?example=tooltipFoundation`.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui test`
- From `xmlui/`:
  `npx playwright test src/components/Tooltip/Tooltip.foundation.spec.ts src/components/Tooltip/Tooltip.spec.ts`
  produced 4 passed foundation tests and 19 skipped copied old tests.

Compatibility debt:

- The copied old `Tooltip.spec.ts` suite is intentionally skipped until old
  Radix Tooltip parity is migrated.
- Remaining old-suite behavior includes portal/root integration, `asChild`
  trigger semantics, exact side/align/offset/collision positioning,
  accessibility details, full Markdown component rendering, behavior-driven
  tooltip integration on other components, and full theme-variable coverage.
- The current renderer uses a wrapper trigger span and local fixed positioning
  to support foundation tests. It is deliberately not final visual/positioning
  parity.
- The tiny markdown renderer is only a foundation helper. Do not treat it as the
  migrated `Markdown` component or as support for XMLUI's non-standard markdown
  features.
