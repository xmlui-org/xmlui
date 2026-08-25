---
"xmlui": patch
---

Reduce the default standalone bundle size by minifying injected CSS, omitting standalone sourcemaps by default, skipping standalone declaration generation, and avoiding the generated metadata snapshot in the browser runtime bundle. The standalone build also emits `.gz` and `.br` runtime files for static servers that support precompressed asset negotiation.
