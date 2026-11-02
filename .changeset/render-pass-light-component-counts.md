---
"xmlui": patch
---

Each `render:pass` trace entry now counts the components rendered in that pass, by type (`rendered`), with a total (`renderedCount`). Components rendered while no pass was open are reported with the container's next entry (`renderedOutsidePass`). This shows how far one change spread, including components that aren't containers, such as `Text` or `Button`. Recorded only when `xsVerbose` is on.
