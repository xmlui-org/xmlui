---
"xmlui": patch
---

Avoid resolving local variables and functions that participate in detected reactive cycles, preventing cyclic bindings from rendering fallback arithmetic results such as `NaN`.
