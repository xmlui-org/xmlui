---
"xmlui": patch
---

`TextArea` exposes its caret and selection: a `getSelection()` method returns `{ start, end }` character offsets, and a `selectionDidChange` event fires whenever the caret moves or the selection changes, including after a click inside a field that already has focus. Both work inside a shadow root too (a `NestedApp` playground or an island).
