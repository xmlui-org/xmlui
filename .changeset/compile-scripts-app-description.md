---
"xmlui": patch
---

Honor `compileScripts` (and its `compileBindings` / `compileEventHandlers` aliases) declared in
the app description when building. `xmlui start` and `xmlui build` previously read script
compilation settings from `xmlui.config.json` only, so an app that set
`appGlobals.compileScripts: true` or `xmluiConfig.compileScripts: true` in `src/config.ts` or
`config.json` — the documented place for it — got no compiled artifacts in its modules, silently.
The CLI now reads the app description as well, with `xmlui.config.json` taking precedence per key.

The build also reports what compilation produced (`[xmlui] Script compilation: N compiled
artifact(s) …`) and warns when compilation was requested but produced no artifacts, so this class
of misconfiguration is visible from the console.
