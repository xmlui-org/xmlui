---
"xmlui": patch
---

Upgrade `react-router-dom` from 6.26.2 to 6.30.3 to address CVE-2025-68470 (XSS via Open Redirects in `@remix-run/router`). `axios` was already upgraded to 1.13.5 to address CVE-2026-25639 (DoS via `__proto__` key in `mergeConfig`).
