---
"xmlui": patch
---

NavGroup: hide collapsed children from browser find-in-page (Ctrl+F) and assistive tech by toggling `visibility: hidden` on the collapsed content (with a delayed transition so the collapse animation still plays). Previously, NavLink labels inside a collapsed NavGroup remained discoverable via Ctrl+F because they were only faded out (`opacity: 0`).
