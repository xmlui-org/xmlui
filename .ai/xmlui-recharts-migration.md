# xmlui-recharts Migration Notes

## BarChart Tooltip Ref Exception

- Copied source: `packages/xmlui-recharts/src/BarChart/BarChartReact.tsx`
- Original source: `/Users/dotneteer/source/xmlui/packages/xmlui-recharts/src/BarChart/BarChartReact.tsx`
- Failing behavior: copied package E2E tests crashed in `BarChart` with React's "Maximum update depth exceeded" error. The stack pointed at the tooltip wrapper ref callback calling `setTooltipElement(el)` on each ref attach.
- Attempt 1: fixed testbed extension registration and package contract loading so `xmlui-recharts` components were known to the compiler.
- Attempt 2: fixed extension layout propagation so copied chart components received effective `width` and `height` styles from XMLUI layout props.
- Dependency check: both the original checkout and rewrite lockfile resolve `recharts` to `2.15.4`, so this is not caused by a rewrite-only Recharts version drift.
- Exception rationale: the final source edit makes the ref callback idempotent by capturing the first tooltip element in a ref before calling the state setter. This preserves the original tooltip scenario and only suppresses redundant state updates that caused the render loop when Recharts recreated tooltip wrapper nodes during layout.
