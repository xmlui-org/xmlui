---
"xmlui": patch
---

Use `Globals.xs` instead of `Main.xmlui.xs` for global variable and function declarations. `Main.xmlui.xs` declarations are now local to the Main component, consistent with how all other code-behind files work.
