---
"xmlui": patch
---

`Items` can report a text selection made across its rendered items: a `textSelectionDidChange` event and a `getTextSelection()` method return `{ text, startItem, endItem, startIndex, endIndex }`. Opt-in: an `Items` without the handler or an `id` renders exactly as before.
