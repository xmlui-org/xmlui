---
"xmlui": patch
---

Compiled arrow values are JavaScript functions throughout, and `async` arrows are refused consistently.

Arrows nested in a data structure were compiled to real functions while a top-level arrow
binding stayed an AST object, so `{(x) => x}` and `{{ f: (x) => x }}` produced different
kinds of value. Compiled arrow values are now functions everywhere: `typeof` reports
`"function"`, `instanceof Function` holds, `.length` reports arity, they are callable and
`.call`-able directly, and they can be handed to native APIs like `Array.prototype.map`.
The interpreter still produces AST objects and runs only when `compileScripts` is off.

Markdown's rendering of functions inside binding expressions is fixed to match. A function
renders as `[xmlui function]` whatever shape the engine gave it, where previously only the
interpreter's representation was recognised and a compiled one was dropped silently. The
same placeholder now applies to a function inside an array, which was rendering its syntax
tree.

`async` arrows are refused in every position. In callback position both paths used to run
them with the keyword quietly ignored — `xs.map(async x => x)` produced `[1]` where
JavaScript gives `[Promise]` — while the same arrow in value position was refused. XMLUI
awaits async calls on its own, so real promise semantics are not available, and refusing is
what the language already did everywhere else.
