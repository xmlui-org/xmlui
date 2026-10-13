---
"xmlui-pdf": patch
"xmlui-website-blocks": patch
---

Republish `xmlui-pdf` and `xmlui-website-blocks` built against the current `xmlui` API. The published builds still imported the `d` metadata helper, which `xmlui` no longer exports (removed in #3546), so bundling an app that uses either package with `xmlui` 0.12.30 or later failed with `"d" is not exported by "xmlui"`. The package sources were already updated; this release ships rebuilt bundles.
