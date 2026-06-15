# Regression Repro Catalog

This catalog maps reported XMLUI failure modes to minimal executable repros.
The goal is to keep diagnosis concrete before changing framework behavior.

## Parser and Markup Repros

| Reported failure mode | Coverage | Status |
| --- | --- | --- |
| Curly braces in XML comments can corrupt unrelated component parsing | `xmlui/tests/parsers/xmlui/parser.test.ts` — "curly braces in XML comments do not affect the following component" | Covered as expected-good parser behavior |
| Double quotes inside `//` comments in double-quoted attributes can terminate the XML attribute | `xmlui/tests/parsers/xmlui/parser.test.ts` — "reports a quote-specific error for unescaped double quotes in a double-quoted handler comment" | Covered as invalid markup with quote-specific parser diagnostics |

## DataSource and `when` Repros

| Reported failure mode | Coverage | Status |
| --- | --- | --- |
| `when` on DataSource status should update after load | `xmlui/src/components/DataSource/DataSource.spec.ts` — "when can react to DataSource loaded status" | Covered |
| Deep payload path in `when` should be guarded by load state | `xmlui/src/components/DataSource/DataSource.spec.ts` — "when can guard a deep DataSource value path after load" | Covered |
| Bridging fetched payload into a simple boolean should drive visibility | `xmlui/src/components/DataSource/DataSource.spec.ts` — "onLoaded bridge can drive a simple when boolean" | Covered |

## Host Event Handler Repros

| Reported failure mode | Coverage | Status |
| --- | --- | --- |
| First external event after subscription should update reactive state | `xmlui/tests-e2e/event-handler-assignment-regression.spec.ts` — "first host event updates state through a simple subscriber assignment" | Covered |
| Error in one host subscriber callback should not poison a sibling subscription | `xmlui/tests-e2e/event-handler-assignment-regression.spec.ts` — "subscriber callback error does not poison sibling host subscription" | Covered |
| Simple synchronous subscriber assignment should be easy to measure for latency | `xmlui/tests-e2e/event-handler-assignment-regression.spec.ts` — first-event assignment repro is the minimal harness | Covered as a correctness characterization; no CI timing threshold |

## Remaining Diagnostic Gaps

- Runtime handler failures still need louder diagnostics: console warning and/or Inspector trace event.
- Statement queue latency needs a dedicated benchmark or trace-based measurement outside normal CI timing assertions.
