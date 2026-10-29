---
"xmlui": patch
---

Callbacks written as `function(p) { return …; }` or as block-body arrows (`(p) => { return …; }`) now work inside props that take callbacks, such as an `EChart` `option`'s tooltip or label `formatter`. Before, they failed with "Unclosed expression", because the callback's source text was re-parsed as a binding.
