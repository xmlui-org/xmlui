# E2E Test Failures — 2026-05-16

> **Summary:** Optimization development involved multiple E2E runs to identify and fix regressions. After Bug 31 fix (2026-05-26), all major component suites pass (1343 passed, 0 failed).

---

## Summary table

| # | Group | File | Tests | Status |
|---|-------|------|-------|--------|
| ~~A~~ | ~~Event handler closure / `$context` binding~~ | ~~`open-a-context-menu-on-right-click.spec.ts`~~ | ~~6~~ | ✅ fixed |
| ~~B~~ | ~~`refreshOn` event handler closure updates~~ | ~~`Table.spec.ts` (refreshOn)~~ | ~~3~~ | ✅ fixed (Bug 20) |
| ~~C~~ | ~~Context vars in event handlers~~ | ~~`DataSource.spec.ts`~~ | ~~1~~ | ✅ fixed |
| ~~D~~ | ~~Deferred / background operations~~ | ~~`cancel-a-deferred-api-operation.spec.ts`~~ | ~~4~~ | ✅ fixed (Bug 23) |
| ~~E~~ | ~~DataSource dependency chain~~ | ~~`delay-a-datasource-until-another-ready.spec.ts`~~ | ~~2~~ | ✅ fixed (Bug 22) |
| ~~F~~ | ~~Table multi-row selection~~ | ~~`enable-multi-row-selection-in-a-table.spec.ts`~~ | ~~2~~ | ✅ fixed (Bug 23) |
| ~~G~~ | ~~Tree async loading (`loaded` field)~~ | ~~`Tree-loaded-field.spec.ts`~~ | ~~3~~ | ✅ fixed |
| ~~H~~ | ~~Flaky (past)~~ | ~~`MessageListener.spec.ts`~~ | ~~3~~ | ✅ fixed |
| ~~J~~ | ~~Compound components + `$queryParams`~~ | ~~`compound-component.spec.ts`~~ | ~~4~~ | ✅ fixed (Bug 24) |
| K | Timing / responsive / flaky | `ChangeListener.spec.ts`, `make-a-table-responsive.spec.ts` | 6 | ⚠️ flaky |
| ~~L~~ | ~~Extensions (all packages)~~ | ~~Multiple extension spec files~~ | ~~>130~~ | ✅ fixed |
| ~~M~~ | ~~Regressions (2026-05-20)~~ | ~~`APICall.spec.ts`, `retry-a-failed-api-call.spec.ts`~~ | ~~7~~ | ✅ fixed |
| ~~N~~ | ~~Select basic, grouping & multiselect~~ | ~~`Select.spec.ts`~~ | ~~15~~ | ✅ fixed (Bug 26) |
| ~~O~~ | ~~Table `syncWithVar`~~ | ~~`Table.spec.ts`~~ | ~~6~~ | ✅ fixed (Bug 26) |
| ~~P~~ | ~~Checkbox `inputTemplate` / Lexical Scoping~~ | ~~`Checkbox.spec.ts`~~ | ~~2~~ | ✅ fixed (Bug 27/28) |
| ~~Q~~ | ~~ModalDialog context propagation~~ | ~~`ModalDialog.spec.ts`~~ | ~~1~~ | ✅ fixed (Bug 28) |
| ~~R~~ | ~~Reactive derived variables~~ | ~~`communicate-between-sibling-components.spec.ts`~~ | ~~5~~ | ✅ fixed (Bug 29/30) |
| ~~S~~ | ~~RadioGroup wrap-around focus~~ | ~~`RadioGroup.spec.ts`~~ | ~~4~~ | ✅ fixed (Bug 31) |

---

## Group A — ✅ FIXED — Event handler closure / `$context` binding
**Fix:** Included `$context` in `nonDynamicReadDeps` path and used `fullParentStateRef` to propagate un-narrowed state to handlers.

## Group B — ✅ FIXED — `refreshOn` event handler closure updates
**Fix:** Bug 20. Enabled `includeAssignmentTargets` in `collectVariableDependencies` to include write-only targets in scope.

## Group C — ✅ FIXED — Context vars in event handlers
**Fix:** Refined fetch handler analysis to exclude injected names (`$url`, `$queryParams`) from parent dependencies.

## Group D — ✅ FIXED — Deferred / background operations
**Fix:** Bug 23. Respect runtime semantics of implicit containers to prevent stripping sibling APIs needed by background tasks.

## Group E — ✅ FIXED — DataSource dependency chain
**Fix:** Bug 22. Respect block scope in function invocation analyzer to prevent local params from leaking into `computedUses`.

## Group F — ✅ FIXED — Table multi-row selection
**Fix:** Bug 23. Implemented UID propagation to ensure sibling APIs remain visible during state narrowing.

## Group G — ✅ FIXED — Tree async loading (`loaded` field)
**Fix:** Indirectly fixed by improving dependency tracking through event handlers.

## Group H — ✅ FIXED — Flaky (past)
**Status:** Now passing consistently.

## Group I — ✅ FIXED — Extension smoke — xmlui-recharts
**Fix:** Improved extension test environment configuration.

## Group J — ✅ FIXED — Compound component state / `$queryParams`
**Fix:** Bug 24. Stripped stale `computedUses` from compound bodies during runtime restructuring.

## Group K — ⚠️ FLAKY — Timing / responsive layout
**Status:** Timing-sensitive tests; usually pass on retry.

## Group L — ✅ FIXED — New extension packages
**Status:** Infrastructure issues resolved.

## Group M — ✅ FIXED — Regressions (2026-05-20)
**Fix:** Resolved via Bug 24 fix (stale metadata removal).

## Group N — ✅ FIXED — Select basic, grouping & multiselect
**Fix:** Bug 26. Reverted mandatory shielding to restore internal reactive paths.

## Group O — ✅ FIXED — Table `syncWithVar`
**Fix:** Bug 26. Reverted mandatory shielding to keep `syncWithVar` visibility.

## Group P — ✅ FIXED — Checkbox `inputTemplate` / Lexical Scoping
**Fix:** Bug 27. Preserved all Symbol-keyed entries in `extractScopedState`.

## Group Q — ✅ FIXED — ModalDialog context propagation
**Fix:** Bug 28. Preserved all framework `$`-prefixed variables in `extractScopedState`.

## Group R — ✅ FIXED — Reactive derived variables
**Fix:** Bug 29/30. Restored spread order in `variable-resolution.ts` and cleared stale metadata between passes.

## Group S — ✅ FIXED — RadioGroup wrap-around focus
**Fix:** Bug 31. Explicitly forced focus on the next radio after value change in `RadioGroupReact`.
