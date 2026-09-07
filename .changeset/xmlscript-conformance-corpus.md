---
"xmlui": patch
---

Added an XMLScript conformance corpus that measures coverage against the language.

Every case runs through both the interpreter and the compiler, comparing the returned
value and the resulting local context — a construct that merely compiles is not covered,
it has to mean the same thing either way.

What makes it different from the hand-written parity lists it joins is that coverage is
derived rather than declared. Each case's parsed tree is walked to see which AST node types
it actually reaches, and the total is asserted against the node types the language
declares, so a gap fails the suite by name instead of going unnoticed. Node types that no
case can reach carry a written reason, and that excuse list is itself guarded against
becoming a dumping ground.

Coverage is measured on a second axis too, because the first one is not enough: a regular
expression is a `T_LITERAL`, indistinguishable from a string to a walk over node types.
Deleting the regex case costs no node-type coverage at all — which is precisely how the
regular-expression miscompile survived a corpus of several hundred hand-written parity
cases. Literal value kinds are therefore asserted separately.

Building it corrected three entries in the framework's own picture of what does not
compile. `await`, destructuring assignment (`[a, b] = pair`) and `void` are rejected by the
interpreter as well, so they are language boundaries rather than constructs the compiler
fails to handle. It also pinned a wart: `var` parses and is then discarded by both paths,
so `var a = 1; return a;` evaluates to `undefined`.
