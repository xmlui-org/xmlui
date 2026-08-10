# Value Component Refactor

> Status: complete.
> Scope: extract typed value display from table columns, expose it as a read-only `Value` XMLUI component, and keep `Column type` behavior compatible.

## Goal

`Column type` currently provides useful read-only display formatting, but the rendering path is table-specific. The goal is to create a reusable React `Value` component and XMLUI `<Value>` component that can display any value with the same type vocabulary:

```xml
<Value value="{order.total}" type="currency(EUR)" />
<Value value="{user.email}" type="email" />
<Value value="{invoice.state}" type="enum" typeOptions="{{paid:'Paid', open:'Open'}}" />
```

`Column` keeps its existing public API. A typed column should internally use the same value formatting/rendering implementation as `<Value>`.

## Compatibility Contract

- Existing `Column type` and `Column typeOptions` markup keeps the same behavior.
- Existing custom `Column` children still override typed rendering.
- `Value` is read-only and has no table schema behavior.
- `Value` uses `value`, not `bindTo`.
- `Value` does not expose `header`, `canSort`, `canResize`, `pinTo`, `width`, `minWidth`, or `maxWidth`.
- `Value` does not inject table context variables such as `$row`, `$cell`, `$itemIndex`, or `$colIndex`.
- Locale-aware formatting should use the same locale profile as typed columns.
- Invalid or unknown types should fall back to text display without throwing during render.

## Proposed File Layout

| File | Purpose |
|---|---|
| `xmlui/src/components/Value/value-types.ts` | Generic type names, parser, normalized type model, diagnostics. Initially moved or adapted from `Column/column-types.ts`. |
| `xmlui/src/components/Value/value-formatting.ts` | Pure value-to-render-model formatting helpers. Initially moved or adapted from `Table/table-cell-formatting.ts`. |
| `xmlui/src/components/Value/ValueReact.tsx` | Reusable React renderer for one formatted value. |
| `xmlui/src/components/Value/Value.tsx` | XMLUI metadata and renderer wrapper for `<Value>`. |
| `xmlui/src/components/Value/Value.module.scss` | Shared visual styling for typed value output. |
| `xmlui/src/components/Value/Value.spec.ts` | E2E coverage for the public XMLUI component. |
| `xmlui/tests/components/Value/value-types.test.ts` | Unit coverage for type parsing and option normalization. |
| `xmlui/tests/components/Value/value-formatting.test.ts` | Unit coverage for pure formatting. |
| `xmlui/src/components/Column/column-types.ts` | Temporary compatibility re-export, or thin adapter, if needed to avoid a large import churn in one step. |
| `xmlui/src/components/Table/TableReact.tsx` | Replace local typed cell renderer with the shared `ValueReact` component. |

## Step 1 - Move Type Parsing Behind Generic Names

Extract the public type vocabulary from `Column/column-types.ts` into `Value/value-types.ts`.

Status: complete.

Suggested exported names:

- `VALUE_TYPE_NAMES`
- `ValueTypeName`
- `ValueTypeSource`
- `ValueTypeDiagnostic`
- `NormalizedValueType`
- `normalizeValueType`
- `isValueTypeName`

Keep a compatibility layer in `Column/column-types.ts` so existing table code can continue to import the old names during the transition:

```ts
export {
  VALUE_TYPE_NAMES as COLUMN_TYPE_NAMES,
  normalizeValueType as normalizeColumnType,
};
export type {
  ValueTypeName as ColumnTypeName,
  NormalizedValueType as NormalizedColumnType,
};
```

Verification:

- Move or duplicate current parser unit coverage to `xmlui/tests/components/Value/value-types.test.ts`.
- Keep existing `Column` or `Table` tests passing through the compatibility exports.
- Run:

```bash
npx tsc --noEmit -p xmlui/tsconfig.json
npm run test:unit -w xmlui -- value-types
```

## Step 2 - Extract Pure Formatting To `Value`

Move the render-independent formatting logic from `Table/table-cell-formatting.ts` into `Value/value-formatting.ts`.

Status: complete.

The pure helper should accept:

- raw `value`
- `NormalizedValueType`
- locale options, including `localeProfile`
- optional `now` for relative time tests

It should return a generic render model, not table-specific names:

- `ValueRenderModel`
- `FormatValueOptions`
- `formatValue`

Avoid DOM, React, CSS module, or table imports in this file.

Verification:

- Move formatting unit tests to `xmlui/tests/components/Value/value-formatting.test.ts`.
- Cover null/undefined fallback, numeric locale formatting, currency, dates, relative time with fixed `now`, enum labels, JSON, image/avatar metadata, links, and malformed values.
- Run:

```bash
npm run test:unit -w xmlui -- value-formatting
npx tsc --noEmit -p xmlui/tsconfig.json
```

## Step 3 - Create The Reusable React `Value` Renderer

Create `ValueReact.tsx` and `Value.module.scss`.

Status: complete.

`ValueReact` should:

- receive `value`, `type`, `typeOptions`, optional pre-normalized type if useful, `className`, `style`, and `classes`
- normalize the type when needed
- call `formatValue`
- render the existing typed output shapes: text, long text, markdown, code/json, link, number parts, checkbox-like read-only display, color swatch, image/avatar, icon
- use `useLocaleProfile()` so standalone `<Value>` and typed table cells share locale behavior

Styling should be moved from `Table.module.scss` to `Value.module.scss` where it is genuinely shared. `Table` should keep table layout styles only.

Compatibility detail:

- Keep `data-column-cell-kind` in typed table cells until tests/docs are deliberately updated, or add a table-only attribute passthrough to `ValueReact`.
- Add new generic attributes such as `data-value-kind` for the `Value` component tests.

Verification:

- Add focused React/unit coverage only if render-model-to-DOM logic is not already covered by E2E.
- Run:

```bash
npx tsc --noEmit -p xmlui/tsconfig.json
```

## Step 4 - Switch `TableReact` To Use `ValueReact`

Replace `renderTypedCellValue`, `renderCellModel`, and related local typed-cell rendering helpers in `TableReact.tsx` with the shared `ValueReact` component.

Status: complete.

Keep table-owned behavior in `TableReact.tsx`:

- type-aware default column width
- type-aware minimum width
- type-aware numeric/end alignment
- column registration and TanStack metadata
- custom child `Column` renderers
- sorting, resizing, pinning, selection, and cell layout

Table should pass the raw cell value and normalized type into `ValueReact`.

Verification:

- Existing `Table.spec.ts` typed column tests should pass unchanged.
- Add or update one regression test proving custom `Column` children still override `type`.
- Run:

```bash
npx playwright test Table.spec.ts --reporter=line
npx tsc --noEmit -p xmlui/tsconfig.json
```

## Step 5 - Add The XMLUI `<Value>` Component

Create `Value.tsx` metadata and register the component in `ComponentProvider.tsx`.

Status: complete.

Public props:

| Prop | Type | Notes |
|---|---|---|
| `value` | `any` | Raw value to display. Required in docs, but undefined should render empty. |
| `type` | `string` | Same vocabulary as `Column type`; default fallback is `text`. |
| `typeOptions` | `any` | Same option semantics and precedence as `Column typeOptions`. |

Do not add events or APIs initially. This keeps the component read-only and avoids implying input behavior.

Metadata notes:

- Mark as visual.
- Describe it as a read-only formatter for scalar, structured, media, and link-like values.
- Mention that it does not validate, convert, or mutate the underlying data.
- Mention that `typeOptions` wins over compact type-string arguments.

Verification:

- Add `xmlui/src/components/Value/Value.spec.ts`.
- Cover basic text, currency, locale override, email/link, enum map, JSON, image/avatar alt text, markdown/long-text clamp, null/undefined empty rendering, and invalid type fallback.
- Run:

```bash
npx playwright test Value.spec.ts --reporter=line
npx tsc --noEmit -p xmlui/tsconfig.json
```

## Step 6 - Documentation And Examples

Add handwritten docs for `Value` in `xmlui/src/components/Value/Value.md`.

Status: complete.

Docs should include:

- a short description
- simple examples for `text`, `currency`, `date`, `email`, `enum`, `json`, `image`, and `avatar`
- the relationship to `Column type`
- the restriction that `Value` has no table behavior and no `bindTo`

Add `xmlui-pg` examples with human-readable `name="..."` attributes.

Verification:

- Run docs/example checks that are standard for changed component docs, or at minimum ensure generated metadata can be rebuilt if component metadata changed.
- Run:

```bash
npm --prefix xmlui run check:metadata-snapshot
```

If the metadata snapshot changes, include `xmlui/src/language-server/xmlui-metadata-generated.js` and rerun the command.

## Step 7 - Public API Cleanup And Changeset

After `Value` is wired and tested, decide whether to keep compatibility aliases permanently or complete the import rename from `ColumnType` to `ValueType`.

Status: complete.

Recommended cleanup:

- Use generic `ValueType` names in new code.
- Keep `Column type` docs unchanged except for a note that it uses the same formatting model as `Value`.
- Keep compatibility exports only if they reduce churn or preserve test readability.

Because this adds a public component, add a patch changeset:

```md
---
"xmlui": patch
---

Add a read-only Value component for displaying typed values outside tables.
```

Verification:

```bash
npx changeset status
npx tsc --noEmit -p xmlui/tsconfig.json
```

## Final Verification

Run the focused suites first:

```bash
npm run test:unit -w xmlui -- value-types
npm run test:unit -w xmlui -- value-formatting
npx playwright test Value.spec.ts --reporter=line
npx playwright test Table.spec.ts --reporter=line
```

Then run a stability pass for affected E2E specs:

```bash
npx playwright test Value.spec.ts Table.spec.ts --workers=10
```

Do not run the full E2E suite without explicit user confirmation.

## Open Decisions

- Should `<Value>` support child fallback content for empty values? Initial recommendation: no.
- Should table cells keep `data-column-cell-kind` indefinitely? Initial recommendation: keep it for compatibility and add `data-value-kind` as the generic attribute.
- Should invalid type diagnostics become visible developer diagnostics? Initial recommendation: preserve current fallback behavior first, then consider diagnostics separately.
- Should status/tag visual treatment become richer in `Value`? Initial recommendation: no; match current `Column type` behavior first.
