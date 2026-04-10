---
"xmlui": patch
---

Upgrade from Vite 7 to Vite 8 (Rolldown/Oxc). Migrates build config from rollupOptions to rolldownOptions, removes deprecated esbuild transform options, adds moduleType to vite-xmlui-plugin transform output for Rolldown compatibility, and updates server.ws to server.hot API. Bumps @vitejs/plugin-react to v6, vite-plugin-svgr to v5, vite-plugin-lib-inject-css to v2.
