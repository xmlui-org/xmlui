---
"xmlui": patch
---

Warn in development builds when a `List`'s `idKey` column holds duplicate or empty values, and document that those values are the row's identity. Duplicates and empties previously corrupted virtualized rows and collapsed selection state with nothing on the console.
