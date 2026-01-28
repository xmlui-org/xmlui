---
"xmlui": minor
---

Add inspector logging infrastructure for debugging XMLUI applications

- New `xsVerbose` app global enables detailed event tracing
- Logs handler execution, state changes, API calls, and user interactions
- Trace IDs correlate related events across async boundaries
- Window properties (`window._xsLogs`, etc.) expose data to external tooling
- Shared utilities extracted to `inspectorUtils.ts` for consistent logging
