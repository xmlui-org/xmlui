---
"xmlui": patch
---

Fix: `fontVariant-*` theme variables (e.g. `fontVariant-Text`, `fontVariant-summary-ExpandableItem`) are now applied. The shared `textVars` mixin previously declared them but never output `font-variant`, so they had no effect on Badge, ExpandableItem, Heading, Link, Markdown, ModalDialog, NestedApp, TableOfContents and Text.
