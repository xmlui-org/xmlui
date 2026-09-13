---
"xmlui": patch
---

Fix: a fill-height child of a `TabItem` (for example a `Splitter` with `height="100%"`) no longer overflows the tabs box and gets clipped. The tab panel can now shrink into the space the tabs container offers, so `Tabs height="*"` → `Splitter height="100%"` works without an explicit `height` on the `TabItem`.
