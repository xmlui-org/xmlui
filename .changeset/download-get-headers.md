---
"xmlui": patch
---

Fix `Actions.download()` so GET requests with custom per-call headers use the fetch download path instead of the headerless iframe path.
