---
"xmlui": patch
---

`List` no longer jumps toward the bottom when its data is replaced by a longer list with a different first row.

`List` keeps the viewed row in place when rows are prepended (chat history, for example) by turning on virtua's `shift`. It used to treat any change of the first row's key as a prepend, so a filter or sort that replaced the data was shifted too. virtua then kept the distance from the end, and a short → long switch landed near the bottom of the new list (#3936).

A change now counts as a prepend only when the previous rows survive intact at the end of the new ones. Filters, sorts, wholesale replacements and the first data after an empty list keep the scroll offset instead: at the top they stay at the top. True prepends behave as before.
