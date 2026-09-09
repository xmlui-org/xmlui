---
"xmlui": patch
---

Fix: `Table`'s `rowDetailTemplate` now renders beneath its row instead of beside it. An expanded row already carried `flex-wrap: wrap`, but the row's `min-width: max-content` reserved space for the detail on the cell line (a wrapping flex container measures `max-content` as if every item shared one line), and the detail's flex basis matched the column total rather than the row. The detail therefore sat to the right of the last cell, and scrolled off-screen entirely once the columns overflowed horizontally.
