---
"xmlui": patch
---

feat: expose programmatic `mountIsland(el, options?)` API on the standalone bundle for hosts that need to mount XMLUI islands after `DOMContentLoaded` (e.g., when `basePath` comes from an async source). The existing `data-xmlui-src` scanner is now a thin loop over the same primitive, so behavior is unchanged for static host pages.
