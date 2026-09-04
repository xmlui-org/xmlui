---
"xmlui": patch
---

Compile the expression forms that used to force interpretation, and report what compilation
actually did.

The event-handler compiler refused conditional (`a ? b : c`), sequence, `new`, and spread
expressions, so any handler or declaration function containing one silently fell back to
interpretation — a ternary inside a `function` declaration was enough. All four now compile, in
the async emitter and in the native emitter, so callbacks such as `rows.filter(r => r.tag ? a : b)`
stay compiled instead of falling back to a lazy interpreted arrow.

Fallbacks are no longer silent. Diagnostics name the construct and its source position instead of
a raw node number, code-behind compilation warnings reach the build log (they were being dropped),
the emitted block carries the reason as `compiledUnsupportedReason`, and the startup banner reports
the effective state — how many artifacts were compiled, how many fell back, and why — instead of
the requested flags.

Production builds no longer ship compiled-script debug payload. `getViteConfig` applied the
dev-server source-map default to every command, so builds embedded per-token mappings, complete
original sources, and absolute developer paths. Those now belong to `xmlui start` only, and build
artifacts keep project-relative source ids.

`compileScripts` is honoured as the umbrella switch at the parse-time binding call sites and in
`evalBinding`, and an app description that only Vite can evaluate (the `getLocalIcons()` /
`import.meta.glob` pattern) is now read through Vite's module runner, so `appGlobals.compileScripts`
works where the docs say it does.

Three interpreter bugs found while checking compiled/interpreted parity are fixed as well:
`Array.prototype.sort(comparator)` was a silent no-op (script callbacks are async and the native
`sort` coerced the returned promise to `NaN`), comma-sequence expressions evaluated every operand
from the pre-sequence state and produced a pending promise as their value, and object-literal
spread threw on a `null` operand instead of ignoring it as JavaScript does.
