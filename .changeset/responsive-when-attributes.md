---
"xmlui": patch
---

Add responsive `when-xs`, `when-sm`, `when-md`, `when-lg`, `when-xl`, `when-xxl` attributes
that control component visibility per breakpoint, following Tailwind's mobile-first (min-width)
convention. When any responsive `when-*` attribute is defined it becomes the exclusive source of
truth — the base `when` is only consulted when no responsive attributes are present, preserving
full backward compatibility.
