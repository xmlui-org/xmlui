---
"xmlui": patch
---

Synchronous callbacks now compile their whole body, not just their expressions.

`Table` `rowDisabledPredicate`, `List` `groupBy`, `Slider` `valueFormat` and every sync
callback prop ran through a statement queue with no compiled target. With `compileScripts`
on, their leaf expressions compiled while the loops and branches around them stayed
interpreted — and that combination measured *slower* than interpreting the lot, because a
small expression pays the artifact cache lookup without earning it back. These run per row,
per render.

A `statement-sync` target closes it. A statement-heavy body over 1000 rows went from 1.9×
slower than the interpreter to 2.47× faster. Across the shapes this path serves: a branch
is 1.44× faster, an array method 1.62× faster, a simple predicate is parity, and a bare
member chain is about 1.18× slower — roughly 0.4 ns per evaluation, where the compiled path
pays a call and a cache lookup without doing less work.

Handlers written as an arrow — `rowDisabledPredicate="{(row) => row.locked}"`, the common
form — compile too, along with the per-statement hook that flushes state changes outward,
so a handler's writes surface at the same moment they did before.
