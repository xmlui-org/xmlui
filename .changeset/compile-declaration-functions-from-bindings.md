---
"xmlui": patch
---

Helper functions called from a binding now run compiled, and a refused construct no longer crashes the app.

A `Globals.xs` helper or a `<script>` function is stored as an arrow expression, so calling
one from a binding — `var.rows="{applyFilters(cases, query)}"` — walked its body through the
interpreter on every reactive invalidation, however much of the app had compiled. This was
the shape the original performance report was about. The build-time artifact on the
declaration could not serve here: it targets the async event path and returns a promise,
which a synchronous binding cannot accept. The synchronous statement target now compiles the
same body for this context.

Two related fixes came with it. Synchronous binding evaluation had no fallback for a
construct the compiler refuses, so instead of running slowly it threw and took the app down;
the asynchronous path has caught this since compilation was introduced, and now both do.
And the strict-compilation guard for arrow bodies was firing before compilation was
attempted, reporting arrows that compile perfectly well — a guard that reports
interpretation has to stand where interpretation happens.
