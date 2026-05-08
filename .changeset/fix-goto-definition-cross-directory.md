---
"xmlui": patch
---

Fix VS Code Go-to-Definition (F12) failing with "No definition found" for user-defined components whose `.xmlui` file lives in a different directory than the file being edited, when no `Main.xmlui` or `config.json` project root marker can be found. The language server's `findProjectRoot` fallback now returns `null` instead of the current document's directory, so the search covers all discovered `.xmlui` files when the project boundary cannot be determined.
