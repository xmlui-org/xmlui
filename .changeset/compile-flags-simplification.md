---
"xmlui": patch
---

Script compilation is now configured by two flags instead of five.

`compileScripts` is the single switch: when it is on, XMLUI compiles everything it can —
binding expressions, event handlers, inline `<script>` functions, `.xmlui.xs` code-behind,
`Globals.xs`, imported `.xs` helpers, and inline component `codeBehind`. It is read from
`appGlobals`, `xmluiConfig`, and `xmlui.config.json` (top level or nested), with
`xmlui.config.json` winning per key, and the same value now travels unchanged through parser
options, code-behind options, eval options, plugin options, the test bed, and the runtime.

`reportCompileFallbacks` is the new optional diagnostics switch. It prints every script block
that could not be compiled, with a code — `compile-unsupported-node`,
`compile-unserializable-literal`, `compile-runtime-fallback`, `compile-source-unavailable` — the
construct that stopped compilation, and its source position, at build time and at run time. With
it off, the build and the startup line still report how many blocks fell back, and the reason
still ships with the block as `compiledUnsupportedReason`; only the per-block console detail is
withheld.

Four keys are removed: `compileBindings` and `compileEventHandlers` (use `compileScripts`),
`compiledScriptSourceMaps` (source maps follow `xmlui start` and are left out of builds), and
`logCompiledEventHandlerSource` (`xsVerbose` already traces every artifact). A project that still
carries one is told which replacement to use, once, by the CLI and at app startup — it is never
ignored in silence. The `XMLUI_COMPILE_BINDINGS` and `XMLUI_COMPILE_EVENT_HANDLERS` test
environment variables collapse into `XMLUI_COMPILE_SCRIPTS`.

The startup banner drops its per-path breakdown: with one switch there is one mode, so it reads
`[xmlui] App started in compiled script mode`.
