---
"xmlui": patch
---

Fix compiled event handlers so inline callback arrows (e.g. the predicate in `items.some(item => ...)`) are compiled to native JS instead of silently falling back to the interpreter, and ensure such compiled callbacks commit pending state correctly when invoked as stored/deferred handlers.
