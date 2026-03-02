---
"xmlui": patch
---

Replace OverlayScrollbars with Radix Scroll Area in the Stack component (`StackScroller`). Scrollbar appearance and behaviour (`scrollStyle`, `showScrollerFade`) are unchanged. Fixes a bug where `scrollToTop`/`scrollToBottom`/`scrollToStart`/`scrollToEnd` APIs silently failed in overlay scroll modes.
