---
"xmlui": patch
---

`List` rows now update when a variable outside the list changes, including row event handlers, and `refreshOn` now controls those updates as documented. Previously a row reading an outer variable stayed stale until `data` or another `List` property changed, unless an `emptyListTemplate` that rendered something happened to mask it.
