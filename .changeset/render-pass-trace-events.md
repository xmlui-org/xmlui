---
"xmlui": patch
---

The Inspector trace now records a `render:pass` entry for each render of `App`, a user-defined component or an explicit container. Each entry gives the pass's cause (its own variables, a component's state, a DataSource, changed props, or the parent), its inclusive duration and start time, and the trace id of the handler that caused it. Item and implicit containers are folded into their owner's pass with a count. Entries are recorded only when `xsVerbose` is on. The trace buffer now honours `xsVerboseLogMax` for every entry; previously most entries trimmed it to 200.
