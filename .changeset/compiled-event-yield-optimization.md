---
"xmlui": patch
---

Optimize compiled event handlers so event-loop yields are checked per handler invocation at 100ms intervals instead of after every statement. Known synchronous built-in calls can now skip yield checks, and parse-time compiled event handler JavaScript can be logged for diagnostics.
