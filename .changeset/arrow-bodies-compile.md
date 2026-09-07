---
"xmlui": patch
---

Arrow function bodies now compile, including helpers called from a binding.

A `Globals.xs` helper or a `<script>` function is stored as an arrow expression, so calling
one from a binding — `var.rows="{applyFilters(cases, query)}"` — walked its body through the
interpreter on every reactive invalidation, however much of the app had compiled. The body
now compiles through the synchronous statement target.

Arrow *values* keep their existing shape. Emitting plain JavaScript functions instead is
smaller and faster, and was tried: an XMLScript arrow is not a JavaScript function, and the
shape is how the framework recognises one and routes it through the callback plumbing that
supplies state propagation, synchronous calling and event arguments — as well as how
rendering shows a function as a placeholder rather than its source.

`async` arrows are now refused in every position. In callback position both paths used to
run them with the keyword quietly ignored — `xs.map(async x => x)` produced `[1]` where
JavaScript gives `[Promise]` — while the same arrow in value position was refused. XMLUI
awaits async calls on its own, so real promise semantics are not available, and refusing is
what the language already did elsewhere.

Markdown's rendering of functions inside binding expressions is more robust: a function
renders as `[xmlui function]` whatever shape the engine gave it, and the same placeholder
now applies inside an array, which previously rendered a syntax tree.
