---
"xmlui": patch
---

Fix a crash on a comment-only (or otherwise content-free) `@{...}` binding expression, e.g. `@{ /* note */ }`. `parseParameterString` now treats a braced section that parses to no expression as literal source text instead of building an expression segment around a `null` AST node, and `collectVariableDependencies` is null-tolerant as a defense-in-depth boundary check. Previously, passing such a segment into dependency collection threw `TypeError: Cannot read properties of null (reading 'type')`, which could take down the surrounding render tree. Refs #3774.
