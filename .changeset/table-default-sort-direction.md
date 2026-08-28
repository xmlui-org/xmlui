---
"xmlui": patch
---

Add `defaultSortDirection` to Table and Column, so a header click can sort descending first. Columns whose interesting rows are the largest ones — counts, totals, percentages — no longer need two clicks to reach the useful order. The cycle keeps three states and only its starting point moves; a Column's value overrides its Table's, and unset behaviour is unchanged.
