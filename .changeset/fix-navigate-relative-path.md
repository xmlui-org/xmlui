---
"xmlui": patch
---

Fix `Actions.navigate` with relative paths (e.g. `'.'`) and query params now correctly stays on the current page instead of redirecting to the `Pages` fallback. The relative pathname is resolved to an absolute path before being passed to the router, because the wrapped navigate introduced in 12.4 for `willNavigate`/`didNavigate` events runs in a higher-level React context that lacked the nested route matches needed for correct relative-path resolution.
