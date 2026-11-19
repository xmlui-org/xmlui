---
"xmlui": patch
---

`localStorage["xmlui:xsVerbose"] = "true"` turns tracing on for a browser session again, even when the app's config sets `xsVerbose: false`, and `xmlui:xsVerboseLogMax` sets the buffer size. The overrides reached only the globals markup reads, not the `xmluiConfig` that tracing reads.
