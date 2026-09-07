---
"xmlui": patch
---

`compileScripts` set in `xmlui.config.json` now reaches the browser, so bindings actually compile.

Binding expressions — every `var.` initializer and every attribute binding — are the one script
kind with no build-time artifact: prop values are stored as strings and parsed lazily in the
browser, so each binding compiles there on first evaluation and is cached. That makes the runtime
switch the whole story for bindings.

The runtime read that switch only from the app description (`src/config.ts` / `config.json`).
`xmlui.config.json` — the documented place for it, and the one the CLI reads — lives on the build
machine and never reached the browser. An app that configured compilation there got its event
handlers and script declarations compiled into the emitted modules and then, at runtime, neither
used them (compiled-handler dispatch is gated on the same runtime switch) nor compiled a single
binding. The build reported hundreds of compiled artifacts while the app ran fully interpreted.

`xmlui start` and `xmlui build` now bake the script-compilation settings stated in
`xmlui.config.json` into the app, and the runtime reads them back, keeping the documented
precedence: the file wins over the app description, in both directions. An app that configures
compilation only in its description is unaffected. `xmlui build` also stopped discarding the
`define` block assembled by `getViteConfig`.

The build summary now names what it compiled and what it did not:

```
[xmlui] Script compilation: 128 compiled artifact(s) (74 event handler(s), 54 declaration function(s)) from 130 script block(s) in 24 file(s)
[xmlui] Binding expressions (`var.` initializers and attribute bindings) are not compiled here: prop values are parsed lazily in the browser, so each one compiles on its first evaluation and is cached. The app's startup line reports the mode it actually runs in.
```

A single undifferentiated total read as complete success while an entire category sat at zero,
which is what made this expensive to diagnose from the outside. The startup inventory line says
the same thing in the browser console.
