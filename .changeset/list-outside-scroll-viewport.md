---
"xmlui": patch
---

Fix List in outside-scroll mode so it virtualizes and its scroll APIs work: the virtualizer bound to the list's own root instead of the resolved scroll container, leaving scrollToTop, scrollToBottom, scrollToIndex, and scrollToId inert and every row mounted.
