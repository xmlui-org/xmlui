---
"xmlui": patch
---

Each `render:pass` cause now says whether the container's bindings read what it changed (`read`, with `readPaths` when they don't), and each entry says whether any cause was read (`necessary`). A pass with `necessary: false` changed nothing a binding reads. The read paths come from the container's markup and code-behind, not its event handlers. Recorded only when `xsVerbose` is on.
