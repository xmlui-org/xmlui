---
"xmlui": patch
---

Support object and array destructuring in reactive `var` declarations. `var {a, b} = expr` and `var [a, b] = expr` are now valid in code-behind scripts and markup script blocks. Destructured declarations are expanded into temporary variables to preserve reactive semantics.
