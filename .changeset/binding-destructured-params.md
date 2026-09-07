---
"xmlui": patch
---

Destructured and rest arrow parameters now compile in binding expressions.

`{items.map(({ id }) => id)}` is an ordinary idiom, and it compiled inside an event handler
while raising a hard error inside a binding. That asymmetry mattered more than it looks:
the binding path has no fallback catch, so a refused construct there is an app-breaking
error rather than a slow path. Turning on `compileScripts` could crash an app over a
parameter shape that worked everywhere else.

`event-async` already knew how to compile these. The collectors that flatten a
destructuring pattern now live in one place and both targets use them, so the two cannot
drift apart again. Array, object, nested and aliased patterns are covered, as are rest
parameters.

Sharing them turned up a mis-coded diagnostic and fixed it. Both targets carried a copy of
the identifier check, testing the same thing and failing differently: one raised an
unsupported-node error naming the construct, the other a plain `Error`, which was then
reported as `compile-source-unavailable` — "compilation failed for some other reason". Same
input, two diagnostics, depending on where it appeared.
