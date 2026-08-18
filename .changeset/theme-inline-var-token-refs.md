---
"xmlui": patch
---

Resolve `$token` references in theme variables declared inline on a `<Theme>`. Previously those values were written to CSS unchanged, so an app-defined variable given a value like `$color-danger-200` reached the DOM as that literal string and computed to nothing — silently, since an invalid custom property raises no error. Theme *definitions* already resolved these; the two paths now share one implementation so they cannot drift again.
