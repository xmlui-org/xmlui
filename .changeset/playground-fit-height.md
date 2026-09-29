---
"xmlui": patch
---

Playgrounds (`xmlui-pg` fences and `AppWithCodeView`) without an explicit `height` now grow to fit their content after they mount, instead of scrolling inside a fixed 320px box. They still reserve 320px before mounting, grow again when content grows later, never shrink, and stop at 85% of the viewport height, past which they scroll. An explicit `height` stays fixed.
