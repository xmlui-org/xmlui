---
"xmlui": patch
---

Optimize compiled event handlers so event-loop yields are checked per handler invocation at 100ms intervals instead of after every statement. Known synchronous built-in calls can now skip yield checks, parse-time compiled event handler JavaScript can be logged for diagnostics, Vite builds can create parse-time compiled event artifacts, and handler-prefix directives (`"async"`, `"sync"`, `"queue"`, `"block"`) are supported.
