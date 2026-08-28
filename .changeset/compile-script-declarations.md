---
"xmlui": patch
---

Compile XMLUI script declaration functions when event-handler compilation is enabled, covering inline script tags, code-behind files, Globals.xs functions, and imported helpers while preserving interpreted fallback.

Compiled event handlers now also preserve explicit return values and yielding statement boundaries for awaited handlers.
