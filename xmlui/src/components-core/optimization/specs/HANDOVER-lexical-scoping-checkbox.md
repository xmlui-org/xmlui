# Handover: Checkbox Reactivity Bug in Lexical Scoping — ✅ RESOLVED (2026-05-22)

## Outcome

E2E `Checkbox.spec.ts` Group P tests are passing:
- 885:3 — `$checked has no meaning outside component` → ✅ Pass
- 900:3 — `$setChecked has no meaning outside component` → ✅ Pass

All 114 `Checkbox.spec.ts` tests pass; all 95 `computedUses` unit tests pass;
the wider `RadioGroup` / `Form` / `Tabs` / `List` suites (479 tests) pass.

## What the bug actually was

The original hypothesis ("missing `childInjectedVars` in `Checkbox` metadata")
was wrong. Both `OPTIMIZER_METADATA.Checkbox.childInjectedVars` and
`CheckboxMd.childInjectedVars` already declared `["$checked", "$setChecked"]`.

The real root cause was in
[ContainerUtils.ts](xmlui/src/components-core/rendering/ContainerUtils.ts)
`extractScopedState`:

```ts
for (const sym of Object.getOwnPropertySymbols(parentState)) {
  if (sym.description && usesSet.has(sym.description)) {
    picked[sym] = (parentState as any)[sym];
  }
}
```

The filter only preserved Symbol-keyed entries whose `description` was in
`uses`. Component-instance state (e.g. Checkbox's `value`) is stored under
`Symbol(uid)` in the parent StateContainer's state — but `uid` is rarely in
`uses` (and is empty when the component has no `id`), so the filter
unconditionally stripped these entries.

## How the failure mode chained together

1. `<Button testId="outer" label="{$checked}"/>` sibling of the Checkbox.
2. Optimizer sees `$checked` as a free variable at the host scope and adds it
   to the host container's `computedUses=["$checked"]`. (Correct per design —
   `$checked` is a Checkbox-injected name, not a sibling-injected name.)
3. At render time, `extractScopedState(parentState, ["$checked"])` walks the
   parent state. The string-key branch picks `$checked` if present (it isn't,
   so nothing is added). The Symbol branch then filters by `description ∈
   usesSet` — `usesSet` is `{"$checked"}`, so `Symbol(checkbox-uid)` with
   description `""` (or any other non-matching value) is **stripped**.
4. `ComponentAdapter` builds `rendererContext.state = state[uid] ||
   EMPTY_OBJECT`. With the Checkbox's slice gone, this returns `EMPTY_OBJECT`.
5. `wrapComponent` does `props.value = state.value` → `undefined`.
6. `Toggle` receives `value={undefined}`, computes `$checked =
   transformToLegitValue(undefined) = false`, and renders `"false"` into the
   inner template. The initial `useEffect`'s `updateState({value: true})` is
   discarded by the next narrowing pass — there is no escape from the loop.

## The fix

[ContainerUtils.ts:extractScopedState](xmlui/src/components-core/rendering/ContainerUtils.ts):
preserve ALL `Symbol`-keyed entries. Reactive narrowing of string keys is
unchanged. Symbols represent internal component-instance state, not external
subscribable names — there is no reason to filter them by the consumer-facing
`uses` list.

## Regression test

[tests/components-core/optimization/computedUses.test.ts](xmlui/tests/components-core/optimization/computedUses.test.ts)
→ describe block "extractScopedState preserves Symbol-keyed component state
across narrowing".

## Tooling lessons (for future sessions)

- **Don't trust the handover diagnosis.** The original handover's recommended
  next steps would not have found this bug — they all pointed at the
  optimizer's static analysis layer, but the failure was in the runtime
  state-extraction layer.
- **Use differential E2E runs.** Running the simpler tests at 846/857/870
  (passing) and the full tests at 885/900 (failing) side-by-side, with browser
  `console.log` capture, isolated the cause to the outer-sibling reference
  itself (not to anything inside Checkbox or its template).
- **Add a tiny page-on('console') probe.** A one-off
  `Checkbox.debug.spec.ts` (deleted post-fix) ran the failing markup with
  `page.on("console", …)` and a `console.log` in `Toggle.tsx`'s render — that
  caught the smoking gun (`rawValue=false initialValue=true legitChecked=false`
  repeating across 5 renders, no convergence) in under a minute.
