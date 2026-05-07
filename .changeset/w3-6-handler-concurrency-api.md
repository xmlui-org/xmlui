---
"xmlui": patch
---

Ship the W3-6 risk-probe API surface for handler concurrency: new `concurrency/` module exporting `CancellationToken`, `HandlerCancelledError`, `createCancellationToken`, `HandlerPolicy`, and a pass-through `createHandlerCoordinator()` stub. Each event handler now receives a fresh `$cancel` token in its evaluation context; the dispatcher-side coordinator runtime ships in W7-1.
