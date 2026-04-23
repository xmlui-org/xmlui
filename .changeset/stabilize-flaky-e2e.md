---
"xmlui": patch
"xmlui-recharts": patch
---

Stabilize a few flaky E2E tests:
- `Option.spec.ts › handles boolean values correctly`: select the option directly with an exact accessibility-name match instead of going through the substring-matching `selectLabel` helper.
- `MessageListener.spec.ts › doesn't disrupt HStack layout gaps`: bump the layout-stabilization poll timeout from 5s to 10s to absorb CI load.
- `Select.spec.ts › simple Select with groupBy can select options`: scope the post-selection assertion to the first matching `Carrot` element so it is unambiguous when the dropdown is still closing.
- `datasource-responseHeaders.spec.ts › responseHeaders updated on refetch`: wait for the initial header counter to stabilize before triggering a refetch, then assert the post-refetch counter strictly increases instead of expecting a hard `+1` (React StrictMode and effect re-runs can cause additional intermediate refetches under load).
- `TooltipContent.spec.ts` (recharts): swallow the occasional `Element is not visible` thrown by `pieSector.hover()` inside a poll loop so the loop can retry, instead of failing the test on the first pre-paint hover.
- `Pdf.spec.ts`: serve a small local PDF from the test bed instead of fetching `https://www.w3.org/.../table1.pdf`, so the tests no longer depend on external network availability.
