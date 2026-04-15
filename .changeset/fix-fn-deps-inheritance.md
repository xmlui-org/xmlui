---
"xmlui": patch
---

Fix function dependency tracking in nested containers (Items, List, etc.)

Script-defined functions used in expressions inside Items/List children were not triggering re-evaluation when the variables they reference changed. This was because child containers created by iteration components replaced the parent's function dependency context instead of merging with it.
