---
"xmlui": patch
---

Fix Tree pointer expand/collapse so gutter clicks do not trigger selection, expensive expand/collapse handlers run after the visual toggle paints, and focus stays on the same logical node when expanding a branch changes the visible row order.
