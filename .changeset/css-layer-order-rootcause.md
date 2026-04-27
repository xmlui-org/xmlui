---
"xmlui": patch
---

Fix root cause of CSS `@layer` order regression: `metadata-helpers.ts` no longer transitively imports a React component (`ItemWithLabel.tsx`) and its SCSS module. The shared `defaultProps` constant was extracted into a new leaf module `ItemWithLabel.defaults.ts` with no React/SCSS dependencies, eliminating the stray per-module CSS chunk that inverted the cascade in production builds.

Adds `npm run check:metadata-purity` (a build-time guard that fails CI if any `.tsx` or `.module.scss` becomes reachable from `metadata-helpers.ts`) and `npm run check:css-chunks` (a build-output inspector that flags suspicious per-module CSS chunks and missing layer-order declarations in produced `dist/` directories). The existing `cssLayerOrderPlugin` is retained as defence-in-depth.
