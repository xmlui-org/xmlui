---
"xmlui": patch
---

Table: new `rowVariant` property for per-row styling that is independent of selection. The function receives a row item and returns a variant name (or nothing); a row with variant `<name>` is styled by the `backgroundColor-row-<name>-Table`, `backgroundColor-row-<name>-Table--hover` and `textColor-row-<name>-Table` theme variables. A variant background wins over striping; selected and hovered rows keep their own background while the variant's text color still applies. Rows re-evaluate the function when the state it reads changes.
