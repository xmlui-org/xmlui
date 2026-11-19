---
"xmlui": patch
---

Containers no longer rebuild their combined state on every render. `useCombinedState` memoized on its rest-parameter array, which is new on every call, so the memo never hit. It now depends on the individual layers and merges them in one pass. On a 50-row test app this cuts startup allocation by about 30 MB (#3969).
