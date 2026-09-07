---
"xmlui": patch
---

Regular expressions now compile instead of silently producing wrong answers.

Regular expressions are the only non-primitive literal XMLScript produces, and both
compiler targets handed them to `JSON.stringify`, which renders one as `{}`.

In binding expressions that was silent. `text.replace(/ /g, "-")` compiled to a call with
an empty object as its pattern and returned the text unchanged; `text.split(/,\s*/)`
returned the whole string as a single element; `/^a/.test(text)` returned `undefined`. No
error, no diagnostic, no fallback marker — the build reported success while the app
computed the wrong thing. In event handlers a guard caught the same case and fell back to
interpretation, so it was merely slow, and any handler containing a pattern lost its
compilation.

Both paths now render patterns as real ones: `new RegExp(source, flags)` for direct
emission, and the same inside the serialized AST that lazy arrows embed for the
interpreter. Regular expressions are no longer a reason for a script to fall back.

The interpreter had a related bug this exposed. The parser builds a literal's `RegExp`
once and stores it on the AST node, so every evaluation returned the same instance and a
`g` or `y` pattern carried its `lastIndex` across evaluations — `/a/g.test(s)` evaluated
four times returned `true, true, true, false`. A regular expression literal builds a fresh
object each time it is evaluated in JavaScript; both paths do that now.
