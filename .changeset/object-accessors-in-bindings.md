---
"xmlui": patch
---

Object literal getters and setters now compile in binding expressions.

`{ ({ get total() { return items.length; } }).total }` was refused by the compiler while
the interpreter evaluated it correctly, closure and all. In a binding that refusal was a
hard error rather than a fallback, because the binding path has no catch.

Event handlers still fall back on an accessor, and that is deliberate rather than an
oversight. Every function body the event target emits is `async` and threads awaits through
its expressions; a property accessor cannot be async, because it has to return a value
rather than a promise. Compiling one there needs a synchronous emission mode that does not
exist yet. The asymmetry points the right way: refusing costs a fallback in the event path,
which catches it, and cost a crash in the binding path, which does not.
