---
"xmlui": patch
---

Improve goto-definition in the language server: resolve components by their declared `name` attribute (falling back to filename), scope candidates to the same XMLUI project as the requesting document, and position the cursor on the `<Component>` tag name instead of the start of the file.
