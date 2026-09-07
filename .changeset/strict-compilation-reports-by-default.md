---
"xmlui": patch
---

`strictCompilation` now reports by default whenever `compileScripts` is on.

The setting accepts `"off" | "report" | "error"` as well as a boolean. Left unset with
`compileScripts` on it reports: every script that would run interpreted is named once in
the console, and nothing fails. `true` still makes it an error, failing the build with
every violation at once. `false` restores silent fallbacks.

Reporting rather than failing is the default deliberately. A hard error would break an app
the moment it met any interpretation nobody predicted, and finding out what nobody
predicted is the entire reason to have this on. One case settles it: an app declaring
`compileScripts` in its app description rather than in `xmlui.config.json` still gets an
interpreted mock backend, so failing by default would break every mock request in it.

Each distinct site is reported once rather than once per evaluation, because these checks
sit on per-row, per-render paths and a violation logged every time would bury what it
exists to surface.
