---
"xmlui": patch
---

Fix dev-server dep scanner failing on `.xmlui` files. The scanner runs in its own Rolldown pipeline that does not inherit Vite's main `plugins` array, so the xmlui transform never ran and the scan crashed with `[PARSE_ERROR] Unexpected token` / `Unexpected JSX expression` for every `.xmlui` source picked up via `import.meta.glob('/src/**')`. The xmlui plugin is now also registered under `optimizeDeps.rolldownOptions.plugins`, so the scanner can transform XML markup before parsing.
