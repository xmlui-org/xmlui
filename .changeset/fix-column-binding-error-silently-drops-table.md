---
"xmlui": patch
---

Fix a throwing binding expression on a `Column` property (most notably a reactive `header`) silently dropping the column — or, for `width`/`minWidth`/`maxWidth`, crashing the entire page — instead of failing loudly and locally (xmlui-org/xmlui#3867).

The root cause: every wrapped component forwards its declared metadata props through a generic extraction loop that runs *before* the component's own render logic (including `customRender`, e.g. `Column`'s). An exception there — e.g. a `header="{...}"` expression that dereferences a value which hasn't loaded yet — aborted the whole component's render before it could return anything. Since `Column` only registers itself with its parent `Table` from a mount effect, a column that never renders never registers, so it vanished from the table with no indication near the table that anything had gone wrong. Separately, `Table`'s `width`/`minWidth`/`maxWidth` validation threw inside a `useMemo` in the table's own inner render — past the point where XMLUI's per-component error containment applies — so an invalid value could crash far more than the one table.

- `wrapComponent`'s and `wrapCompound`'s prop-forwarding loops now catch a throwing binding per-property, log a clear, diagnosable console error identifying the component and the property, and fall back to `undefined` for just that property so the rest of the component keeps rendering.
- `Column`'s own `customRender` gained the same per-property guard as defense in depth.
- `Table` no longer throws on an invalid `width`/`minWidth`/`maxWidth` value; it logs a diagnosable error and falls back to the default width.
- The inner `Table` render is now wrapped in a local error boundary that resets whenever the table's columns or data change, so any remaining render error is contained to the table itself instead of taking down a larger part of the page.

A reactive `header` (or other Column property) that evaluates successfully continues to work as before — this fix only changes what happens when the binding throws.
