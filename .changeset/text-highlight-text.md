---
"xmlui": patch
---

Add `highlightText` and `highlightActiveIndex` to `Text`, matching `Markdown`'s properties of the same names. Highlighting plain text no longer requires either a Markdown parse or a hand-rolled construction of nested inline `Text` segments, and occurrences are numbered so a find-in-page can step through a list of mixed `Text` and `Markdown` rows as one sequence.
