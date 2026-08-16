---
"xmlui": patch
---

Reuse compiled binding functions across component instances and mounts instead of recompiling on every evaluation, removing per-instance `new Function` cost from render.
