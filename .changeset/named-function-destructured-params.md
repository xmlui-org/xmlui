---
"xmlui": patch
---

Destructured and rest parameters now compile on named function declarations.

`function pick({ a }) { return a; }` fell back to interpretation while `({ a }) => a`
compiled — the same pattern, two answers, depending on how the function was spelled. Both
compiler targets now route arrow and named-declaration parameters through the same
collector, so array, object, nested and aliased patterns work in either form, and rest
parameters with them.

Probing each remaining entry before implementing it removed two from the list rather than
closing them. Non-`let` for-init (`for (const i = 0; …)`) is rejected by the parser, so
neither path ever sees it, and `async` used as a statement value is rejected by the
interpreter. Both had been recorded as constructs the compiler fails to handle; they are
language boundaries.

One entry moved the other way. `xs.map(async x => x)` — `async` in callback position — does
run in the interpreter, ignoring the keyword, so it is a genuine gap and in a binding it is
a hard error rather than a fallback. It is left refused on purpose: matching the
interpreter means compiling `async` as though it were absent, and whether that suits
XMLUI's auto-await model is a language decision rather than a compiler one.
