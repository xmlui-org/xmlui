---
"xmlui": patch
---

Optimize compiled event handlers so event-loop yields are checked per handler invocation at 100ms intervals instead of after every statement.
