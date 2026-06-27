# Website Blog Route Findings

Date: 2026-06-27

## Source Baseline

- Old website app/routes: `/Users/dotneteer/source/xmlui/website/src/Main.xmlui`
- Old website runtime entry: `/Users/dotneteer/source/xmlui/website/index.ts`
- Old website config globals: `/Users/dotneteer/source/xmlui/website/src/config.ts`
- Blog extension source: `/Users/dotneteer/source/xmlui/packages/xmlui-docs-blocks/src/blog`

## Implemented Slice

- Restored website blog routes in `website/src/Main.xmlui`:
  - `/blog`
  - `/blog/:slug`
- Added a top-level `Blog` navigation link in the website shell.
- Restored config-backed blog globals by adding `blog.posts` to
  `website/src/config.ts`.
- Restored the website runtime glob to `/src/**` in `website/index.ts` so
  `src/config.ts`, themes, and utility modules participate in startup like the
  old website.
- Added an XMLUI app context bridge so old extension-authoring `useAppContext`
  consumers can read `appGlobals`.
- Restored the old public `SEARCH_CATEGORIES` export shape used by copied
  website utilities.
- Added a `Blog` slug fallback for the rewrite router. The old blog component
  reads `useParams()` from React Router; the current XMLUI router does not
  provide those params, so the migrated component also reads
  `window.location.pathname` for `/blog/:slug`.

## Compatibility Notes

- The old website used app-level components named `BlogOverview` and
  `BlogPage`; the display-ready path uses the registered `Blog` component from
  `xmlui-docs-blocks` for both routes.
- This keeps the route visible quickly while preserving the old blog data
  source (`appGlobals.blog.posts`) and markdown content source
  (`appGlobals.prefetchedContent`).
- The migrated blog cards originally emitted nested anchors because the old
  card wrapper and inner `Read more` action were both links. The current
  compatibility slice keeps the card-wide link and renders `Read more` as text
  inside that link.
- The old blog passed `scrollStyle` and `showScrollerFade` to
  `TableOfContents`. The current `TableOfContents` supports `omitH1` and
  `maxHeadingLevel`, so the unsupported visual props were removed for now.

## Verification

- `npm --workspace xmlui-docs-blocks run build`: passed with known Sass
  deprecation warnings.
- `npm --workspace xmlui-website run build`: passed with known Sass, Smart UI
  direct-eval, and large chunk warnings.
- `npm --workspace xmlui-website run start`: running at
  `http://localhost:5173/`.
- Browser smoke:
  - `/blog` renders the `Blog` heading and a migrated `Introducing XMLUI`
    post link.
  - `/blog/introducing-xmlui` renders the `Introducing XMLUI` title, copied
    markdown body text, and sections including `Components` and `Reactivity`.
  - Console error/pageerror list is empty for the smoke pass.

## Follow-Ups

- Restore or map old `BlogOverview` and `BlogPage` authoring names if the full
  old `Main.xmlui` requires them.
- Add an automated website smoke test for `/blog` and `/blog/:slug`.
- Continue Step 8 with docs overview, component reference, extension reference,
  and metadata/docs-reference parity.
