---
"xmlui": patch
---

Auto-generate metadata for user-defined (compound) components by statically analyzing their definition tree. This enables proper theme variable optimization — compound component theme vars are now collected into the global `componentThemeVars` set, so `ThemeProvider` resolves hierarchical variables for them correctly.
