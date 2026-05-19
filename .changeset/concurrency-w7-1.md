---
"xmlui": patch
---

Plan #6 Cooperative Concurrency — W7-1 (Phases 2–4): real `HandlerCoordinator` runtime backing the four declarative handler policies (`parallel`, `single-flight`, `queue`, `drop-while-running`); per-handler timeout via `handlerTimeoutMs` and ambient `appGlobals.defaultHandlerTimeoutMs` (default 30 s, `<= 0` disables); transactional state writes opt-in with `transactional` / `transactional:<event>`, buffered and replayed in one batch on success and discarded on cancellation; `Button.busyOnClick` convenience that auto-disables the button while its `onClick` handler is in flight. Default behaviour (`parallel`, 30 s ambient timeout, no buffering) is unchanged for existing apps; supersession, drop, timeout and cancellation are surfaced as `kind:"concurrency"` Inspector traces.
