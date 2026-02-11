---
"xmlui": patch
---

Improve inspector trace logging with additional event data

- Add emitEvent logging to capture component event emissions with arguments
- Include eventArgs in handler:start trace events for better debugging
- Use getCurrentTrace() consistently in NavigateAction and ComponentAdapter
- Add traceId fallback in DataLoader and standalone parser bundle
