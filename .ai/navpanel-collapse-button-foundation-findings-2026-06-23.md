# NavPanelCollapseButton Foundation Findings - 2026-06-23

Phase 5 Wave D6F migrated the `NavPanelCollapseButton` foundation.

Original XMLUI references inspected:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavPanelCollapseButton/NavPanelCollapseButton.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/AppLayoutContext.ts`
- original `NavPanelCollapseButton` component folder contains no local
  `.spec.ts`, `.md`, `.defaults.ts`, `.module.scss`, or separate React file.

Implemented in the rewrite:

- added `NavPanelCollapseButton.tsx`, `NavPanelCollapseButtonReact.tsx`,
  `NavPanelCollapseButton.renderer.tsx`, `NavPanelCollapseContext.tsx`, and a
  short `NavPanelCollapseButton.md` stub;
- added a local collapse provider around migrated `NavPanel` so the collapse
  button can render inside a panel and toggle `data-nav-panel-collapsed`;
- preserved the original no-context behavior: outside a collapse context the
  component renders `null`;
- registered the component in compiler contracts, IR lower allowlist,
  component registry, transfer inventory, and testing fixtures;
- added `NavPanelCollapseButton.foundation.spec.ts`;
- added `?example=navPanelCollapseButtonFoundation` for visual checks with
  `npm run dev`.

Important compatibility debt:

- The old component uses `useAppLayoutContext` and toggles App-level
  `navPanelCollapsed`. The rewrite currently uses a local `NavPanel` collapse
  provider until full App shell context is restored.
- The old visual behavior is tied to vertical App layout and NavPanel styles.
  The foundation slice exposes collapsed state and a basic collapsed width only.
- There was no old component-local E2E suite to copy; future compatibility
  closure should rely on old App/NavPanel integration tests when those shell
  behaviors are migrated.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui test`
- `npx playwright test src/components/NavPanelCollapseButton/NavPanelCollapseButton.foundation.spec.ts src/components/NavPanel/NavPanel.foundation.spec.ts`
