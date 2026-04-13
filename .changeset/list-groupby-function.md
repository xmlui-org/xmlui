---
"xmlui": patch
---

Extended List `groupBy` property to accept a function in addition to a string. When a function is provided (e.g., `groupBy="{(item) => item.name[0]}"`), it receives each list item and returns the value used for grouping.
