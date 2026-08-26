---
"xmlui": patch
---

Add a `rowClick` event to Table, fired when a table row is clicked. It reports the click without replacing or suppressing selection — pair it with `rowsSelectable` deliberately, and prefer `selectionDidChange` when what you actually care about is the selection. It does not fire for clicks on the selection checkbox or on an interactive control inside a cell.
