---
"xmlui": patch
---

Compile event handlers written as arrow functions instead of re-interpreting them at run time.

An event handler written in the idiomatic `onClick="(ev) => …"` / `onMount="() => { … }"` form was never actually compiled. The emitted code serialized the arrow's entire source tree into a `runtime.arrow(…)` call, which handed the AST straight back to the tree-walking interpreter — so the handler paid for the embedded AST payload without gaining anything from compilation. Only handlers written as bare statement bodies benefited, and since naming event arguments requires the arrow form, the most common handlers were the ones missing out.

The outermost handler arrow is now emitted as a real JavaScript function, invoked with the handler's event arguments, bringing it in line with the nested callback arrows that already compiled natively. Handler bodies using control flow, `try`/`catch`, loops, `switch`, template literals, destructured and rest parameters all compile. For the reported `Lifecycle` `onMount` case this replaces an 11.5 KB serialized-AST payload with 2.4 KB of compiled JavaScript.

Handlers whose bodies use a construct the native emitter does not support (such as spread call arguments) still fall back to the previous interpreted path, and async arrow handlers are still rejected. A handler arrow that references a compiled local declared by an earlier statement now fails compilation — falling back to interpreted execution for the whole handler — instead of emitting an interpreted arrow that could not see that local.
