---
"xmlui": patch
---

Arrows stored in objects and arrays now compile instead of being interpreted on every call.

An arrow in value position — `{ onOk: () => save() }`, an array element, a ternary branch —
was emitted by serializing its entire syntax tree into the bundle and handing it back to
the interpreter each time it ran. For one 30-character source that came to 2895 characters
of generated JavaScript; it is now 148, and the body runs compiled.

Both compiler targets had the gap, and the event target's was subtler: native emission was
already attempted for arrows in *argument* position, so `items.some(x => …)` compiled while
`{ onOk: () => save() }` did not. Position decided whether a callback was compiled, which
is not a distinction an app author would predict. The fallback remains for bodies the
emitter cannot express — across a 70-source survey, one still needs it.

**Behaviour change worth knowing about.** An arrow value is now a real function rather than
an AST object. `typeof` reports `"function"` instead of `"object"`, and `JSON.stringify` on
a data structure holding handlers no longer dumps their syntax trees. This is the one place
where compiled and interpreted execution deliberately differ: `typeof (() => 1)` is
`"function"` in JavaScript, and XMLScript follows JavaScript semantics everywhere else, so
the compiled result is the correct one. Code that relied on stringifying handlers into
their AST form, or on `typeof` reporting `"object"`, will see the difference.
