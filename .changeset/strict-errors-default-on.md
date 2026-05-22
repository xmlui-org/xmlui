---
"xmlui": patch
---

Plan #07 W8-1: flip `appGlobals.strictErrors` default to `true`. Non-`AppError` throws from handlers now emit a `kind:"errors"` warn diagnostic in the Inspector trace with a migration hint. Set `appGlobals.strictErrors: false` to restore the previous warn-only behaviour during migration.
