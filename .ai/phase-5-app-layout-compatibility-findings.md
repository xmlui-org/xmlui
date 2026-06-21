# Phase 5 App Layout Compatibility Findings

Date: 2026-06-20

## Source of Truth

- Old App metadata and renderer: `/Users/dotneteer/source/xmlui/xmlui/src/components/App/App.tsx`
- Old App layout styles: `/Users/dotneteer/source/xmlui/xmlui/src/components/App/App.module.scss`
- Rewrite App files: `xmlui/src/components/App/App.tsx`, `xmlui/src/components/App/AppReact.tsx`, `xmlui/src/components/App/App.module.scss`

## Findings

- App visual compatibility is not only a theme-token problem. The old App relies on container geometry:
  - `.appContainer` uses `width: 100%`, `height: 100%`, `display: flex`, and `flex-direction: column`.
  - `.mainContentArea` flexes to fill the App container and carries `backgroundColor-content-App`.
- If the rewrite resolves `backgroundColor-content-App` correctly but the App root/content only grows to child content height, the page below the content shows the browser/body background. This looks like a background color mismatch but is actually incomplete App layout migration.
- The App metadata should stay in `App.tsx`, as in the old project.
- The list of App theme variables should be extracted from `App.module.scss` `createThemeVar("...")` declarations, not manually duplicated in metadata.

## Migration Guidance

- For Phase 5 Wave 2, verify App content layout with geometry-sensitive checks, not just CSS token checks.
- Tests should assert that the migrated App root/main content fills the viewport in the simple root-App case.
- Button appearance differences in App screenshots are not App migration issues; those belong to Button/component styling migration.

