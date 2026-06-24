# Footer Foundation Findings - 2026-06-23

Phase 5 Wave D6E migrated the `Footer` foundation.

Original XMLUI references inspected:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Footer/Footer.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Footer/FooterReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Footer/Footer.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Footer/Footer.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Footer/Footer.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Footer/Footer.md`

Implemented in the rewrite:

- copied old `Footer.md` and literal old `Footer.spec.ts`;
- added `Footer.tsx` metadata, `Footer.defaults.ts`, `FooterReact.tsx`,
  `Footer.renderer.tsx`, and `Footer.module.scss`;
- registered `Footer` in compiler contracts, IR lower allowlist, component
  registry, transferred-component inventory, and test fixtures;
- added `createFooterDriver`;
- added `Footer.foundation.spec.ts` for content rendering, `contentinfo`
  semantics, interactive child focusability, `sticky` prop reflection, theme
  variables, and state mutation from a footer action;
- added `?example=footerFoundation` for visual checks with `npm run dev`.

Important compatibility debt:

- The original `Footer` depends on App layout context for content width and
  sticky behavior across layouts. The foundation slice only renders the direct
  footer authoring surface.
- Old sticky tests depend on restored App shell layouts and Pages scrolling
  containers. Keep the copied suite skipped until those are migrated.
- Full theme-variable parity, especially border/padding side families and
  layout-specific sticky behavior, remains deferred.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui test`
- `npx playwright test src/components/Footer/Footer.foundation.spec.ts src/components/Footer/Footer.spec.ts`
