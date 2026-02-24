---
"xmlui": patch
---

Fix variables declared in `Main.xmlui.xs` not propagating to child components and not updating after mutation.

Variables in `Main.xmlui.xs` are now treated as globals (equivalent to `global.*` attributes on `<App>`), making them visible to user-defined child components. Mutations such as `codeBehindCount++` now correctly propagate to all child components.
