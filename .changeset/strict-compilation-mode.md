---
"xmlui": patch
---

Added `strictCompilation`: any script that would run interpreted becomes an error.

Set it alongside `compileScripts` and XMLUI stops falling back quietly. It catches more
than a refused construct, which is the point — a script can end up interpreted three ways,
and only the first leaves a trace: the compiler refused something and a caller fell back;
the compiled path chose to interpret (a lazy arrow, or anything on the synchronous
statement queue, which has no compiled target); or the evaluation context never carried the
switch at all. An app could report zero fallbacks while running mostly interpreted, so the
rule enforced is not "no fallbacks" but "no interpretation", guarded at the interpreter's
own entry points.

The report shows the offending line with a caret under the construct, the component and
event it belongs to, what to write instead, the diagnostic code, and how to relax the
setting. A violation with no compiler error behind it reads differently on purpose — it
says the code was never handed to the compiler, rather than blaming a construct that is not
there.

`xmlui build` fails with every violation at once, sorted by file, so adopting strict mode
does not mean discovering constructs one build cycle at a time. `xmlui start` reports them
and keeps serving. Without `compileScripts` the setting is inert, and the CLI says so
rather than ignoring the combination.

Expect violations today: the synchronous statement queue has no compiled target, so
`Table` `rowDisabledPredicate`, `List` `groupBy`, `Slider` `valueFormat` and every sync
callback prop will be flagged. This is a diagnostic tool for finding what does not compile,
not yet a production setting.
