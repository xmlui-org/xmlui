---
"xmlui": patch
---

Add an optional `variant` field to `Text` segments, naming a span kind that is not a search hit — a changed word in a diff, for example — styled through `backgroundColor-mark-<variant>-Text` and `textColor-mark-<variant>-Text`. Precedence is `active` > `hit` > `variant`, variant spans render as `<span data-variant>` rather than `<mark>` so code that counts marks still counts only search hits, and only `hit` segments are counted by `highlightActiveIndex`.
