---
"xmlui": patch
---

`APICall`'s `mockExecute` handler now compiles like every other event handler.

It was the only event excluded from compilation, and no reason for the exclusion was
recorded anywhere — not in the commit that added it, not in that change's plan notes, not
in a comment. The likely motive is that `mockExecute` is the one handler whose return value
is load-bearing, since it replaces an API response outright, and the original compilation
work predated the step that copies a compiled handler's result into the same place the
interpreted one leaves it.

Verified against the shapes a real `mockExecute` takes before removing it: literal
responses, the injected request context (`$queryParams`, `$requestBody`, `$requestHeaders`,
`$cookies`), branching on a request value, the arrow form with both expression and block
bodies, and an awaited delegate. Compiled and interpreted agree on all of them.
