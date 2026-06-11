---
"xmlui": patch
---

Reuse a single API interceptor worker instance and serialize its start/stop
lifecycle. Previously each (re)initialization created a new MSW worker and
stopped the old one, so an overlapping stop/start could race over the shared
Service Worker registration and silently disable request mocking. This caused
intermittent failures (e.g. requests falling through unhandled) when the app
re-initialized with an interceptor.
