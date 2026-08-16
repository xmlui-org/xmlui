---
"xmlui": patch
---

Fix List scrollToIndex and scrollToId so they account for content that appears above the list after mount, by measuring the start margin when the call is made and letting the virtualizer's spacer carry it exactly once.
