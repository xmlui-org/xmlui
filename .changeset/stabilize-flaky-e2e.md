---
"xmlui": patch
"xmlui-recharts": patch
---

Stabilize a few flaky E2E tests:
- `Option.spec.ts › handles boolean values correctly`: select the option directly with an exact accessibility-name match instead of going through the substring-matching `selectLabel` helper.
- `MessageListener.spec.ts › doesn't disrupt HStack layout gaps`: bump the layout-stabilization poll timeout from 5s to 10s to absorb CI load.
- `TooltipContent.spec.ts` (recharts): swallow the occasional `Element is not visible` thrown by `pieSector.hover()` inside a poll loop so the loop can retry, instead of failing the test on the first pre-paint hover.
