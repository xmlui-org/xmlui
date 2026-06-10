---
"xmlui": patch
---

Fix analyzer false positives around reusable Component definitions and parsed event-handler arrows.

Vars declared on reusable Component definitions are no longer reported as unused from the transformed component body, and single-parameter event-handler arrows such as `primarySize => ...` are covered by regression tests.
The VS Code extension also now discovers the current `xmlui/dist/nodejs/server.cjs`/`.mjs` language-server build instead of only probing for the old `server.js` path.
