# Smart Table Columns and Column Types

> Status: feature design draft, not implementation plan.
> Scope: public behavior and user-facing API for smarter `Table` and `Column` display.

## Motivation

`Table` should be useful with minimal markup when the data shape is already clear from the returned data:

```xml
<Table data="{orders}" />
```

When no explicit `Column` children are present, the table should infer a sensible column set and display the data instead of requiring boilerplate. When explicit `Column` children are present, developers should be able to describe common display semantics compactly:

```xml
<Table data="{orders}" columnInference="sample(100)">
  <Column bindTo="customerEmail" type="email" />
  <Column bindTo="total" type="currency(USD)" />
  <Column bindTo="margin" type="number(8,3)" />
</Table>
```

The goal is not to make `Table` magical at the expense of predictability. The goal is to provide good defaults, clear override points, and a compact vocabulary for common tabular display needs.

## Smart Table Behavior

### Explicit vs inferred columns

The proposed default behavior:

- If a `Table` has no `Column` children, it infers columns from the data.
- If a `Table` has one or more `Column` children, those explicit columns define the visible columns.
- Inferred columns are sortable by default, matching the current behavior of explicit columns with `bindTo`.
- Automatic completion of missing columns can be considered as a separate feature, but should not be the default.

This keeps the mental model simple: no columns means "show me the data"; at least one column means "I am curating the view."

### Column inference sampling

Possible property:

```xml
<Table data="{orders}" columnInference="first-only" />
<Table data="{orders}" columnInference="sample(100)" />
```

The property controls how many records from the resolved `data` array the table inspects when inferring both field names and type hints. This is a single combined setting because table data is assumed to be homogeneous by columns. API response envelopes should be shaped before they reach `Table`, for example with `DataSource resultSelector` or `transformResult`.

Suggested `columnInference` values:

| Value | Meaning | Useful when |
|---|---|---|
| `first-only` | Use only the first row. | Fastest and most predictable for uniform data. |
| `first-n(n)` | Use the first `n` rows. | Data is mostly uniform but the first row may have nulls. |
| `sample(n)` | Inspect up to `n` rows spread across the dataset. | Large data with occasional sparse fields. |
| `all` | Inspect every row. | Small local datasets where best inference matters more than cost. |
| `non-null-first` | For each field, infer from the first non-null/non-undefined value encountered. | APIs often return nulls in the first record. |
| `until-stable(n)` | Inspect rows until no new fields or type changes are found for `n` consecutive rows. | Mixed data where full scan may be unnecessary. |
| `visible-page` | Infer from the rows currently visible after pagination/windowing. | Very large or streaming data, but can change as the user pages. |
| `schema-only` | Do not inspect row values; use external schema/metadata if available. | Generated apps, typed APIs, or privacy-sensitive data. |
| `off` | Do not infer columns. | Existing strict behavior or custom no-data states. |

Recommended default for inferred columns: `first-n(25)`. This keeps inference bounded while avoiding the brittleness of `first-only` when the first row contains nulls or sparse fields.

### Field inclusion rules

For inferred columns, default field inclusion should be conservative:

- Include primitive fields: string, number, boolean, null, date-like strings.
- Include arrays and objects only with a compact default display, or mark them as complex and require explicit columns for rich rendering.
- Exclude internal framework fields such as `order` if added by the table runtime.
- Preserve field order from the first inspected row, then append newly discovered fields in discovery order.

Useful optional controls:

```xml
<Table
  data="{orders}"
  includeColumns="{['id', 'customer', 'total']}"
  excludeColumns="{['internalNotes']}"
/>
```

## Column `type`

`Column type` should be a display hint: it describes how a value is presented and lightly interacted with. It should not be a validation schema, and it should not silently mutate the underlying data.

Suggested principles:

- Explicit `type` wins over inferred type.
- Inferred type should produce the same metadata shape as an explicit type, so rendering is consistent.
- Formatting should respect `App.locale` where possible.
- Unknown or invalid type strings should fall back to text display and report a developer diagnostic.
- Complex formatting can still be handled with child content inside `Column`.

### Core type families

#### Text and string types

| Type | Display behavior |
|---|---|
| `text` | Default string rendering. |
| `short-text` | Single-line, clipped or ellipsized. |
| `long-text` | Multi-line wrapping, suitable for descriptions. |
| `markdown` | Render markdown content. |
| `code` | Monospace text, preserves meaningful spacing. |
| `json` | Compact JSON rendering for objects/arrays. |
| `email` | Email text, optionally mailto behavior. |
| `phone` | Phone number text, optionally tel behavior. |
| `url` | Link-like URL display. |
| `uuid` | Monospace or shortened stable identifier display. |
| `id` | Compact identifier display. |
| `name` | Human name display. |
| `address` | Address-like display, wrapping allowed. |
| `color` | Color swatch plus value. |

Potential parameters:

```xml
<Column bindTo="description" type="long-text(lines:3)" />
<Column bindTo="homepage" type="url(label:domain)" />
<Column bindTo="id" type="id(short)" />
```

#### Numeric types

| Type | Display behavior |
|---|---|
| `number` | Locale-aware number formatting. |
| `number(p,s)` | Numeric display with precision `p` and scale `s`, such as `number(8,3)`. |
| `integer` | No fractional digits. |
| `decimal(s)` | Fixed or bounded fractional digits. |
| `percent` | Percent formatting. |
| `currency(code)` | Currency formatting, e.g. `currency(USD)`. |
| `accounting(code)` | Currency display with accounting-style negatives where supported. |
| `scientific` | Scientific notation for very large/small values. |
| `bytes` | Human-readable byte sizes. |
| `duration` | Human-readable duration. |
| `rating(max)` | Rating-like numeric display. |

Numeric display should use tabular digits where possible. Decimal-aligned display should be part of the numeric renderer, not just `text-align: right`.

For `number(8,3)`, proposed meaning:

- `8` is total precision: maximum count of significant digits.
- `3` is scale: maximum count of fractional digits.
- Values should be formatted for display, not truncated in the data model.
- Overflow should be visually handled in a predictable way rather than silently losing digits.

#### Date and time types

| Type | Display behavior |
|---|---|
| `date` | Locale-aware date. |
| `time` | Locale-aware time. |
| `datetime` | Locale-aware date and time. |
| `relative-time` | Relative display such as "2 hours ago". |
| `timestamp` | Timestamp-like display. |
| `iso-date` | ISO-style date display. |

Potential parameters:

```xml
<Column bindTo="createdAt" type="datetime(short)" />
<Column bindTo="dueDate" type="date(long)" />
```

#### Boolean and state types

| Type | Display behavior |
|---|---|
| `boolean` | Generic true/false display. |
| `checkbox` | Read-only checkbox-like display. |
| `yes-no` | Localized yes/no text. |
| `status` | Badge-like state display. |
| `enum` | Text display for a finite set. |
| `enum({...})` | Mapped labels/colors for known values. |
| `tag` | Tag/chip-like display for a single value. |
| `tags` | Tag/chip-like display for an array of values. |

`enum` and `status` should render as plain text by default. Visual badge-like rendering should require explicit type options or styling.

Status and enum types may need a value map:

```xml
<Column
  bindTo="state"
  type="enum"
  typeOptions="{{
    draft: { label: 'Draft', tone: 'muted' },
    sent: { label: 'Sent', tone: 'success' },
    failed: { label: 'Failed', tone: 'danger' }
  }}"
/>
```

This suggests `typeOptions` may be cleaner than putting every option into the type string.

#### Structured and media types

| Type | Display behavior |
|---|---|
| `image` | Thumbnail image. |
| `avatar` | Avatar-like image/name fallback. |
| `icon` | Icon display. |
| `link` | Link display with explicit label/value options. |
| `object` | Compact object summary. |
| `array` | Compact array summary. |
| `list` | Inline list rendering. |

### Type string vs options object

The type string should stay compact:

```xml
<Column bindTo="amount" type="currency(USD)" />
```

For richer behavior, an additional options property is likely cleaner:

```xml
<Column
  bindTo="amount"
  type="currency"
  typeOptions="{{ currency: 'USD', minimumFractionDigits: 2 }}"
/>
```

Suggested rule: introduce `typeOptions` alongside `type`. Simple, common parameters may be accepted in the type string; anything object-shaped belongs in `typeOptions`.

## Type inference hints

When inferring `Column type`, the table can use sampled values:

| Detected values | Suggested inferred type |
|---|---|
| all numbers | `number` or `integer` |
| numeric strings | `number` only when most sampled values are numeric strings |
| ISO date strings | `datetime` or `date` |
| booleans | `boolean` |
| short repeated string set | `enum` |
| email-like strings | `email` |
| URL-like strings | `url` |
| phone-like strings | `phone` |
| long strings | `long-text` |
| arrays | `array` or `tags` for arrays of short strings |
| plain objects | `object` or `json` |

Inference should avoid overconfidence. For example, a single value containing `@` should not make a column `email` unless the sampled non-empty values consistently match.

## Open Questions

- Should automatic completion of missing columns be offered with an explicit mode, such as `autoColumns="missing"`?
- Which simple `type` string parameters should be accepted directly instead of requiring `typeOptions`?

## Detailed Implementation Plan

This section is an implementation plan, broken into small slices that can be tested independently. The main architectural goal is to keep discovery, type parsing, type inference, and cell value formatting in pure TypeScript helpers, so most behavior can be verified with fast Vitest unit tests. Playwright E2E tests should focus on integration: XMLUI markup, rendered cells, sorting, explicit-column override behavior, and full coverage of visible column type output.

### Compatibility contract

- Existing `Table` markup with explicit `Column` children must behave the same unless a new `Column type` or `typeOptions` prop is used.
- Existing `Column` props keep their current names and meanings.
- If a `Table` contains one or more `Column` children, those columns override inferred columns completely.
- If a `Table` has no `Column` children, inferred columns are generated from `data`.
- Inferred columns are sortable by default.
- Default `columnInference` is `first-n(25)`.
- Inference operates on the resolved `data` array only. API envelopes remain the responsibility of `DataSource resultSelector`, `transformResult`, or caller expressions.

### Proposed file layout

Keep the infrastructure local to `Table`/`Column`, but independent from React where possible:

| File | Purpose |
|---|---|
| `xmlui/src/components/Table/table-column-inference.ts` | Sampling rows, discovering fields, inferring type hints, building inferred `OurColumnMetadata` objects. |
| `xmlui/tests/components/Table/table-column-inference.test.ts` | Unit tests for discovery and inference. |
| `xmlui/src/components/Column/column-types.ts` | Type string parser, normalized type model, type defaults, supported type registry. |
| `xmlui/tests/components/Column/column-types.test.ts` | Unit tests for parsing and normalization. |
| `xmlui/src/components/Table/table-cell-formatting.tsx` | Pure-ish cell display helpers and small renderer functions for normalized column types. Keep DOM-facing parts small. |
| `xmlui/tests/components/Table/table-cell-formatting.test.tsx` | Unit tests for formatting decisions, locale options, fallback text, and class/style metadata. |
| `xmlui/src/components/Table/TableReact.tsx` | Integration point: choose explicit columns or inferred columns, pass type metadata to TanStack column meta, render typed cell content. |
| `xmlui/src/components/Column/TableContext.tsx` | Extend `OurColumnMetadata` with `type` and `typeOptions` metadata. |
| `xmlui/src/components/Column/Column.tsx` | Add metadata and renderer extraction for `type` and `typeOptions`. |
| `xmlui/src/components/Table/Table.tsx` | Add `columnInference` metadata and renderer extraction. |
| `xmlui/src/components/Table/Table.spec.ts` | E2E tests for markup behavior and all column type rendering. |
| `website/content/docs/pages/howto/use-smart-table-columns.md` | How-to article for column-less smart tables and inference control. |
| `website/content/docs/pages/howto/format-table-columns-by-type.md` | How-to article for explicit `Column type` and `typeOptions` usage. |
| `xmlui/tests-e2e/how-to-examples/use-smart-table-columns.spec.ts` | Website example tests for the smart-table how-to article. |
| `xmlui/tests-e2e/how-to-examples/format-table-columns-by-type.spec.ts` | Website example tests for the column-formatting how-to article. |

If `table-cell-formatting.tsx` becomes too React-heavy, split it into `table-cell-formatting.ts` for pure value formatting and `TableTypedCell.tsx` for rendering.

### Unit test architecture

The implementation should make unit tests the primary safety net for infrastructure. E2E should prove that the infrastructure is correctly wired into XMLUI markup and the browser DOM.

Guidelines:

- Keep parser functions deterministic, side-effect-free, and exported.
- Keep sampling and inference functions deterministic. `sample(n)` must not use randomness.
- Keep render-independent formatting in pure functions that accept value, normalized type, options, and locale.
- Keep React components thin: they should mostly call pure helpers and apply returned text, attributes, class names, and small structured render models.
- Avoid testing private implementation details through E2E. If a behavior can be asserted through a pure helper, prefer Vitest.
- Unit tests should use table-driven cases for every accepted type string and inference mode.
- Unit tests should assert diagnostics/fallback models without depending on `console.warn` unless a warning is part of the public developer experience.
- Unit tests should include malformed input cases for every parser.

### Parser unit test matrix

The `Column type` parser deserves especially thorough coverage because it defines the mini-language accepted by the public API.

#### Accepted bare type names

Add table-driven tests that every supported bare type parses into the expected `NormalizedColumnType.name`:

- Text/string: `text`, `short-text`, `long-text`, `markdown`, `code`, `json`, `email`, `phone`, `url`, `uuid`, `id`, `name`, `address`, `color`
- Numeric: `number`, `integer`, `decimal`, `percent`, `currency`, `accounting`, `scientific`, `bytes`, `duration`, `rating`
- Date/time: `date`, `time`, `datetime`, `relative-time`, `timestamp`, `iso-date`
- Boolean/state: `boolean`, `checkbox`, `yes-no`, `status`, `enum`, `tag`, `tags`
- Structured/media: `image`, `avatar`, `icon`, `link`, `object`, `array`, `list`

Assertions:

- `source` is `explicit`.
- `args` is empty or undefined.
- `options` contains only defaults introduced by the parser.
- No diagnostics are returned.

#### Positional argument parsing

Add tests for compact positional syntax:

| Input | Expected |
|---|---|
| `number(8,3)` | `name: "number"`, precision `8`, scale `3`. |
| `decimal(2)` | `name: "decimal"`, scale `2`. |
| `currency(USD)` | `name: "currency"`, currency/code `USD`. |
| `accounting(EUR)` | `name: "accounting"`, currency/code `EUR`. |
| `rating(5)` | `name: "rating"`, max `5`. |
| `date(short)` | date style `short`. |
| `datetime(long)` | date/time style `long`. |
| `url(domain)` or `url(label:domain)` | label mode if direct type parameters are accepted. |
| `id(short)` | compact id display option. |

Assertions:

- Whitespace is ignored around type name, commas, and parentheses.
- Case handling is specified and tested. Prefer lowercase type names; decide whether `currency(usd)` normalizes to `USD`.
- Numeric arguments reject non-integers where integers are required.
- Invalid argument counts fall back safely or return diagnostics.

#### Named argument parsing

Add tests for named parameters accepted in type strings:

| Input | Expected |
|---|---|
| `long-text(lines:3)` | `options.lines === 3`. |
| `url(label:domain)` | `options.label === "domain"`. |
| `link(label:name,target:url)` | label/target mappings if accepted. |
| `image(size:sm)` | size option if accepted. |
| `avatar(name:fullName,image:avatarUrl)` | mapping options if accepted. |

Assertions:

- Named arguments may not silently override each other unless the last-wins rule is intentional and documented.
- Unknown named arguments are preserved for renderers or reported as diagnostics; choose one rule per type.
- Colons inside unsupported nested structures are rejected cleanly.

#### `typeOptions` merge behavior

Add explicit tests for merge precedence:

- Bare type plus `typeOptions`.
- Positional type args plus `typeOptions`.
- Named type args plus `typeOptions`.
- Conflicting compact args and `typeOptions`.

Preferred rule: `typeOptions` wins over compact type-string arguments because it is more explicit and can be expression-bound.

Test examples:

```ts
normalizeColumnType("currency(USD)", { currency: "EUR" })
// currency === "EUR"

normalizeColumnType("long-text(lines:2)", { lines: 4 })
// lines === 4
```

Also test:

- `typeOptions` is not mutated.
- Non-object `typeOptions` produces a diagnostic and is ignored.
- Array `typeOptions` is rejected unless a specific type accepts arrays.

#### Error and fallback cases

Add tests for malformed public input:

- Empty string.
- Whitespace-only string.
- Unknown type name.
- Unknown alias if aliases are not supported.
- Missing closing parenthesis.
- Extra closing parenthesis.
- Empty argument list where not allowed.
- Trailing comma.
- Double comma.
- Invalid numeric argument: `number(x,3)`.
- Invalid scale greater than precision: `number(3,8)`.
- Negative precision/scale.
- Unsupported nested expressions inside type string.
- Dangerous-looking strings are treated as data, not executed.

Assertions:

- Parser never throws for user-provided strings in normal render paths.
- Returned fallback is `text` unless a narrower safe fallback is deliberately selected.
- Diagnostics include the original input and enough information to help the developer fix the markup.

#### Round-trip and stability tests

If a serialization helper is added, test:

- Normalized models serialize predictably.
- Parsing the serialized form returns an equivalent model.
- Object key order in options does not affect equality helpers.

If no serialization helper is added, add equality tests for normalized models used in memoization to ensure stable results.

### Column inference unit test matrix

Add thorough unit tests for `table-column-inference.ts`.

#### `columnInference` mode parser

Test every accepted mode:

- `first-only`
- `first-n(25)`
- `sample(100)`
- `all`
- `non-null-first`
- `until-stable(10)`
- `visible-page`
- `schema-only`
- `off`

Also test:

- Default is `first-n(25)`.
- Whitespace handling.
- Invalid counts: zero, negative, decimal, non-numeric, missing.
- Unknown modes.
- Very large counts are capped or accepted according to a documented rule.
- Invalid values produce a diagnostic or fallback.

#### Sampling behavior

Test sample selection directly:

- `first-only` returns exactly the first row.
- `first-n(25)` returns at most 25 rows.
- `first-n(n)` returns all rows if there are fewer than `n`.
- `all` returns every row.
- `sample(n)` returns deterministic spread indices.
- `sample(n)` includes first and last rows when row count exceeds `n`, if that is the selected rule.
- `non-null-first` samples enough rows to find first non-null values per field.
- `until-stable(n)` stops after the stability threshold.
- `off` returns no sample.
- `visible-page` is represented as a mode but only resolved with visible rows in integration; pure helper should require visible rows explicitly.

#### Field discovery

Test:

- Field order from first sampled object.
- Later fields appended in discovery order.
- Symbol keys ignored.
- Non-enumerable properties ignored.
- Prototype properties ignored.
- Arrays as rows ignored unless explicitly supported.
- `Date` objects as rows ignored.
- `null` rows ignored.
- Runtime `order` field excluded.
- Fields with all null values are still discovered if the key exists in sampled rows.
- Explicit include/exclude behavior only if such props are accepted.

#### Type inference

Test each inference result:

- `integer` for finite integer numbers.
- `number` for finite non-integer numbers.
- `text` fallback for `NaN`, `Infinity`, and mixed numeric/non-numeric values.
- `boolean` for booleans.
- `date` for date-only strings.
- `datetime` for ISO datetime strings.
- `email` only above the chosen confidence threshold.
- `url` only above the chosen confidence threshold.
- `phone` only above the chosen confidence threshold.
- `enum` for low-cardinality short strings.
- `text` instead of `enum` for high-cardinality strings.
- `long-text` above the chosen length threshold.
- `tags` for arrays of short strings.
- `array` for other arrays.
- `object` or `json` for plain objects.
- `text` for mixed incompatible types.

Threshold tests:

- Exactly at the enum cardinality limit.
- One over the enum cardinality limit.
- Exactly at the long-text length limit.
- One over the long-text length limit.
- Empty strings ignored or counted according to a documented rule.

#### Column metadata construction

Test the final inferred metadata:

- `header` equals field name initially.
- `accessorKey` equals field name.
- `canSort` is true.
- `type` is populated with inferred type.
- `typeOptions` is populated only when needed.
- Stable object output for identical inputs where memoization benefits.
- Does not mutate input rows.

### Formatting and render-model unit test matrix

Keep formatting tests separate from parser tests. These tests should call formatting/render-model helpers without booting Playwright.

Test categories:

- Nullish values render as empty text for most types.
- `json` renders `null` as JSON only if explicitly specified.
- Number formatting with fixed locale.
- `number(8,3)` precision/scale behavior.
- Decimal split model includes integer part, decimal separator, and fractional part for alignment.
- Negative number rendering.
- Currency and accounting formatting with fixed locale and currency.
- Percent scaling behavior is specified and tested: `0.12` as `12%` or `0.12%`.
- Date/time formatting with fixed locale and stable input timezone expectations.
- Relative time with injected clock.
- Boolean/yes-no labels.
- Enum/status plain text by default.
- Enum mapped labels via `typeOptions`.
- Link-like types produce expected href models, not just text.
- Image/avatar/icon render models include accessible labels or alt text.
- Object/array/list summaries are deterministic and bounded in length.

### Normalized type model

Introduce a normalized model so the rest of the system does not repeatedly parse strings:

```ts
type ColumnTypeName =
  | "text" | "short-text" | "long-text" | "markdown" | "code" | "json"
  | "email" | "phone" | "url" | "uuid" | "id" | "name" | "address" | "color"
  | "number" | "integer" | "decimal" | "percent" | "currency" | "accounting"
  | "scientific" | "bytes" | "duration" | "rating"
  | "date" | "time" | "datetime" | "relative-time" | "timestamp" | "iso-date"
  | "boolean" | "checkbox" | "yes-no" | "status" | "enum" | "tag" | "tags"
  | "image" | "avatar" | "icon" | "link" | "object" | "array" | "list";

type NormalizedColumnType = {
  name: ColumnTypeName;
  args?: unknown[];
  options?: Record<string, unknown>;
  source: "explicit" | "inferred" | "fallback";
};
```

`typeOptions` should be merged after type-string arguments so explicit object options can override compact parameters. For example, `type="currency(USD)" typeOptions="{{ currency: 'EUR' }}"` should resolve to EUR or report a diagnostic; choose one behavior and unit-test it.

### Step 1: Add pure `Column type` parsing infrastructure

Implementation:

- Create `column-types.ts`.
- Parse simple forms: `number`, `number(8,3)`, `currency(USD)`, `date(short)`, `long-text(lines:3)`.
- Normalize aliases only if desired; keep the first pass conservative.
- Return a safe fallback for unknown or invalid values, with enough diagnostic information for the integration layer to warn.
- Do not render anything in this step.

Unit tests:

- Parses bare type names.
- Parses numeric positional arguments: `number(8,3)`.
- Parses simple named arguments: `long-text(lines:3)`.
- Parses currency code arguments: `currency(USD)`.
- Rejects or falls back on unknown type names.
- Rejects malformed arguments without throwing from React render paths.
- Merges `typeOptions` predictably.

No E2E tests yet. This is pure infrastructure.

### Step 2: Extend metadata and column registration without changing rendering

Implementation:

- Add `type` and `typeOptions` to `ColumnMd`.
- Extract them in `Column.tsx`.
- Add `type?: string` and `typeOptions?: any` to `OurColumnMetadata`.
- Thread normalized or raw type metadata through column registration.
- Keep existing explicit-column rendering unchanged until typed cells are implemented.

Unit tests:

- Add a narrow renderer/metadata test if there is an established metadata test pattern for component props.
- Otherwise rely on the metadata snapshot check later and use E2E once rendering exists.

Metadata:

- Because component metadata changes, regenerate/check language-server metadata snapshot with `npm --prefix xmlui run check:metadata-snapshot` when implementation begins.

### Step 3: Add `columnInference` prop and parser

Implementation:

- Add `columnInference` to `TableMd`.
- Add `columnInference?: string` to `TableProps`.
- Parse modes in `table-column-inference.ts`:
  - `first-only`
  - `first-n(n)`
  - `sample(n)`
  - `all`
  - `non-null-first`
  - `until-stable(n)`
  - `visible-page`
  - `schema-only`
  - `off`
- Set default to `first-n(25)`.
- `off` should disable inferred columns; with no explicit columns this yields the existing empty-column/no-data-like behavior.

Unit tests:

- Parses every supported mode.
- Invalid values fall back to `first-n(25)` or produce a safe disabled result; choose one and document it.
- `first-n(25)` is the default.
- Sampling never mutates the input data.
- `sample(n)` is deterministic, not random, so tests and UI are stable.

No E2E tests yet unless the prop is visible in metadata docs only.

### Step 4: Implement field discovery from sampled rows

Implementation:

- Add `discoverColumnFields(rows, mode)` in `table-column-inference.ts`.
- Treat only plain object rows as sources for inferred fields.
- Preserve key order from the first sampled row.
- Append new keys discovered in later sampled rows in discovery order.
- Exclude framework/runtime fields such as `order`.
- Apply optional `includeColumns` / `excludeColumns` only if these props are accepted in this feature. If not, leave them out of implementation.

Unit tests:

- Empty data returns no inferred columns.
- Non-array data returns no inferred columns.
- Primitive rows return no inferred columns.
- First row field order is preserved.
- Later sampled fields are appended.
- `first-only` ignores fields that appear only later.
- `first-n(25)` sees fields within the first 25 rows and ignores row 26+.
- `all` sees fields across all rows.
- Runtime `order` field is excluded.

No E2E tests yet, unless Step 5 immediately wires inferred fields into the rendered table.

### Step 5: Wire inferred columns into `TableReact`

Implementation:

- Fix the current inferred-column branch so it is reachable when no explicit columns are registered.
- Distinguish between "no explicit columns were provided" and "explicit columns array is empty because none registered yet".
- Prefer a signal such as `hasExplicitColumns` from `TableWithColumns`, based on registered `Column` children, instead of relying only on array truthiness.
- When explicit columns exist, pass them through unchanged.
- When no explicit columns exist, call the inference helper and build `OurColumnMetadata[]`.
- Generated metadata should include:
  - `header`: field name, possibly later humanized.
  - `accessorKey`: field name.
  - `canSort`: true.
  - inferred `type`.
  - inferred `typeOptions` if needed.

Unit tests:

- If practical, keep the selection function pure: `resolveTableColumns({ explicitColumns, data, columnInference })`.
- Test explicit columns override inferred columns.
- Test no explicit columns produces inferred columns.
- Test inferred columns are sortable by default.
- Test `columnInference="off"` produces no inferred columns.

E2E tests to add now:

- `<Table data="{rows}" />` renders inferred headers and cells.
- Explicit `<Column>` children override inferred columns.
- Inferred columns are sortable by clicking the header.
- `columnInference="first-only"` does not show a later-only field.
- Default `first-n(25)` shows a field first appearing within the first 25 rows.

### Step 6: Implement type inference

Implementation:

- Add `inferColumnType(values)` and `inferColumns(rows, mode)`.
- Use sampled non-null values for each field.
- Keep heuristics conservative:
  - all numbers -> `integer` if all finite integers, otherwise `number`
  - booleans -> `boolean`
  - ISO date-only strings -> `date`
  - ISO datetime strings -> `datetime`
  - email-like strings -> `email` only when most non-empty samples match
  - URL-like strings -> `url` only when most non-empty samples match
  - phone-like strings -> `phone` only when most non-empty samples match
  - repeated short string set -> `enum`
  - long strings -> `long-text`
  - arrays of short strings -> `tags`
  - arrays -> `array`
  - plain objects -> `object` or `json`
  - fallback -> `text`
- Do not infer `currency` without schema or explicit `Column type`; numeric data alone is not enough.

Unit tests:

- One test group per inferred type.
- Mixed null/non-null values infer from non-null samples.
- Conflicting samples fall back to `text` or a safe broad type.
- Numeric strings are not inferred as numbers unless the chosen threshold is met.
- Enum inference has a bounded cardinality threshold.
- Long text threshold is deterministic.

E2E tests:

- Add a compact inferred-type smoke test that proves visible formatting changes for at least number, boolean, date, email, URL, enum, object, and tags.
- Full per-type E2E coverage comes after typed renderers are implemented.

### Step 7: Add typed cell formatting and rendering

Implementation:

- Add value formatting helpers in `table-cell-formatting.ts`.
- Add a small typed-cell renderer path in `TableReact` when no custom `cellRenderer` is provided.
- Custom child content inside `Column` must continue to win over type rendering.
- For locale-aware formatting, use `App.locale`/formatters if accessible in the Table integration, or browser `Intl` with the app locale passed down.
- For nullish values, render a consistent empty display, not `"null"` or `"undefined"`, unless `type="json"` explicitly asks for JSON.
- For numeric cells, add a CSS class or structure for tabular digits and decimal alignment.

Unit tests:

- Formatting for each type family.
- Nullish fallback behavior.
- Locale-sensitive number/date tests using fixed locale inputs.
- Decimal parsing pieces for `number(8,3)`.
- Overflow/precision behavior for `number(8,3)`.
- Child renderer precedence can be tested at integration or E2E level.

E2E tests:

- Verify typed rendering appears in real table cells for the first small set: `number`, `integer`, `currency`, `date`, `datetime`, `boolean`, `email`, `url`, `enum`, `json`.
- Verify explicit child content overrides `type`.

### Step 8: Add styling hooks for typed cells

Implementation:

- Add classes in `Table.module.scss` only where needed:
  - numeric cell wrapper
  - decimal-aligned number parts
  - long text wrapping
  - code/json monospace
  - color swatch
  - image/avatar thumbnail
- Avoid turning `enum` and `status` into badges by default; render plain text unless `typeOptions` requests a visual style.
- Keep existing cell layout and overflow behavior backward compatible.

Unit tests:

- Prefer unit tests for class selection if class names are assigned by pure helpers.
- Avoid DOM-heavy unit tests for CSS details.

E2E tests:

- Decimal-aligned numeric cells have the expected decimal-part structure.
- `long-text` wraps or exposes multiline behavior.
- `code`/`json` use monospace styling if that is part of the visible contract.
- `color` shows a swatch and value.
- `image`/`avatar` render accessible image/thumbnail output.

### Step 9: Full E2E coverage for all explicit column types

Create a dedicated `test.describe("Column type rendering", ...)` section in `Table.spec.ts`, or split to a new `TableColumnTypes.spec.ts` if the file becomes too large.

Required E2E coverage:

| Type | E2E assertion focus |
|---|---|
| `text` | Basic value rendering. |
| `short-text` | Single-line/clipped rendering. |
| `long-text` | Wrapped/multiline rendering. |
| `markdown` | Markdown syntax renders as formatted content. |
| `code` | Monospace/preformatted display. |
| `json` | Object/array value renders as JSON-like text. |
| `email` | Email text and optional `mailto:` behavior if implemented. |
| `phone` | Phone text and optional `tel:` behavior if implemented. |
| `url` | URL/link display. |
| `uuid` | Identifier display. |
| `id` | Compact identifier display. |
| `name` | Plain human-name display. |
| `address` | Wrapping address display. |
| `color` | Swatch plus value. |
| `number` | Locale-aware numeric display. |
| `number(8,3)` | Decimal precision/scale display and decimal alignment structure. |
| `integer` | No fractional digits. |
| `decimal(s)` | Fractional digit behavior. |
| `percent` | Percent display. |
| `currency(code)` | Currency display. |
| `accounting(code)` | Negative accounting display if supported. |
| `scientific` | Scientific notation. |
| `bytes` | Human-readable byte size. |
| `duration` | Human-readable duration. |
| `rating(max)` | Rating display. |
| `date` | Date display. |
| `time` | Time display. |
| `datetime` | Date+time display. |
| `relative-time` | Relative display with stable test clock or tolerant assertion. |
| `timestamp` | Timestamp display. |
| `iso-date` | ISO-style date. |
| `boolean` | True/false display. |
| `checkbox` | Read-only checkbox-like display. |
| `yes-no` | Yes/no text. |
| `status` | Plain text by default. |
| `enum` | Plain text or mapped label via `typeOptions`. |
| `tag` | Single tag/chip behavior if implemented. |
| `tags` | Multiple tag/chip behavior for arrays. |
| `image` | Thumbnail image. |
| `avatar` | Avatar/fallback display. |
| `icon` | Icon rendering. |
| `link` | Explicit link label/target behavior. |
| `object` | Compact object summary. |
| `array` | Compact array summary. |
| `list` | Inline list rendering. |

Use small focused fixtures, not one giant table, so failures point to a specific type. Group related types to keep runtime reasonable.

### Step 10: E2E coverage for inferred column types

Add a smaller inferred-type E2E suite after explicit type rendering is stable:

- Inferred `integer`/`number`.
- Inferred `boolean`.
- Inferred `date` and `datetime`.
- Inferred `email`, `url`, and `phone`.
- Inferred `enum` renders plain text.
- Inferred `long-text`.
- Inferred `tags` for arrays of short strings.
- Inferred `object`/`array` fallback display.

These tests verify the complete pipeline: sampling -> type inference -> column metadata -> typed renderer.

### Step 11: Component reference documentation

Implementation:

- Update `Column.md` with `type` and `typeOptions`.
- Update `Table.md` with column-less inferred table examples and `columnInference`.
- Update `Column.tsx` metadata descriptions for `type` and `typeOptions`.
- Update `Table.tsx` metadata description for `columnInference`.
- Include examples for:
  - zero-column inferred table
  - explicit columns overriding inference
  - numeric formatting
  - enum/status plain text plus explicit visual options
- Add human-readable `name="..."` to new `xmlui-pg` examples.
- Preserve existing `xmlui-pg` fence options and IDs where examples already have website tests.

`Table.md` content outline:

- Description update: `Table` can now render structured data with inferred columns when no `Column` children are provided.
- `columnInference` prop section:
  - default `first-n(25)`
  - `first-only`
  - `sample(n)`
  - `all`
  - `off`
  - guidance that response envelopes should be handled before `Table`
- "Inferred columns" example:
  - `<Table data="{orders}" />`
  - verify headers and primitive values
- "Explicit columns override inference" example:
  - data has many fields
  - markup provides two `Column` children
  - docs explain only those two render
- "Sorting inferred columns" example:
  - show inferred columns are sortable by default

`Column.md` content outline:

- Description update: `Column` can bind fields, customize rendering with child markup, or use `type` for common display semantics.
- `type` prop section:
  - overview of supported type families
  - compact examples: `email`, `number(8,3)`, `currency(USD)`, `date(short)`, `enum`
  - note that `type` is display-oriented, not validation
- `typeOptions` prop section:
  - mapped labels for `enum`
  - currency/number formatting options
  - link/image/avatar mapping options if implemented
- "Child content wins over type" example:
  - `Column type="currency"` with child content showing custom layout
  - explain that custom children remain the escape hatch
- "Status and enum are plain text by default" example:
  - demonstrate mapped labels without badges

Reference doc verification:

- Run `npm run generate-all-docs -w xmlui`.
- Inspect generated `website/content/docs/reference/components/Table.md`.
- Inspect generated `website/content/docs/reference/components/Column.md`.
- Do not hand-edit generated reference pages.

Verification:

- Run metadata snapshot check after metadata updates.
- Cover the new how-to article examples with website example tests in Step 12.

### Step 12: Website how-to articles with working samples

Create how-to articles under `website/content/docs/pages/howto/`. Every runnable code fence must use `xmlui-pg` and include a human-readable `name="..."`; examples covered by website tests must also include stable `id="..."`.

#### Article: `use-smart-table-columns.md`

Purpose: teach users how to display data with no `Column` children and control inference.

Suggested sections:

- "Render a table without writing columns"
  - sample data with `id`, `customer`, `total`, `status`
  - `<Table data="{orders}" />`
  - display-only example
- "Use `columnInference` when the first row is incomplete"
  - data where the first row has nulls or missing values
  - compare `first-only` and default `first-n(25)` in two small tables
- "Turn inference off"
  - `columnInference="off"`
  - explain when strict/empty behavior is useful
- "Use explicit columns when you want control"
  - same data, explicit two-column view
  - emphasize backward compatibility and override semantics

Suggested website tests:

- Initial inferred-table example renders expected headers and cells.
- Default `first-n(25)` example includes a field that appears after the first row.
- `first-only` example does not include the later-only field.
- Explicit-column example renders only explicit headers.
- Inferred column sorting works from the how-to example if the article includes a sortable sample.

#### Article: `format-table-columns-by-type.md`

Purpose: teach users how to use `Column type` and `typeOptions`.

Suggested sections:

- "Format common text values"
  - `email`, `phone`, `url`, `long-text`
- "Format numbers"
  - `number(8,3)`, `integer`, `percent`, `currency(USD)`
- "Format dates and times"
  - `date`, `time`, `datetime`, `relative-time` with stable example data
- "Display enums and statuses"
  - plain-text default
  - label mapping with `typeOptions`
- "Display structured and media values"
  - `json`, `tags`, `color`, `image` or `avatar` if implemented
- "Override a typed column with custom cell markup"
  - demonstrate child content taking precedence

Suggested website tests:

- One initial-state test per runnable example.
- For link-like examples, assert rendered links have expected text and href.
- For numeric examples, assert formatted visible text and decimal alignment structure where applicable.
- For enum/status examples, assert plain text, not badge-only semantics.
- For custom-cell override example, assert custom content appears instead of default type formatting.

#### Website example test requirements

- Add specs under `xmlui/tests-e2e/how-to-examples/`.
- Use `getExampleSource` and `extractXmluiExample`; do not duplicate markup in specs.
- Each eligible `xmlui-pg` fence needs `name="..."` and `id="..."`.
- Each `test.describe` uses `{ tag: "@website" }`.
- Display-only examples get an initial-state test plus the standard display-only comment.
- Interactive examples get initial-state and interaction tests.
- Run single-worker first, then a parallel stability pass:

```bash
npm run test:e2e-website-examples -- tests-e2e/how-to-examples/use-smart-table-columns.spec.ts --workers=1 --reporter=line
npm run test:e2e-website-examples -- tests-e2e/how-to-examples/format-table-columns-by-type.spec.ts --workers=1 --reporter=line
npm run test:e2e-website-examples -- tests-e2e/how-to-examples/use-smart-table-columns.spec.ts --workers=10
npm run test:e2e-website-examples -- tests-e2e/how-to-examples/format-table-columns-by-type.spec.ts --workers=10
```

### Step 13: Changeset and verification

Because this is a user-facing framework feature, add a patch changeset for `xmlui`.

Suggested focused verification commands:

```bash
npm --prefix xmlui run check:metadata-snapshot
npx vitest run xmlui/tests/components/Column/column-types.test.ts
npx vitest run xmlui/tests/components/Table/table-column-inference.test.ts
npx vitest run xmlui/tests/components/Table/table-cell-formatting.test.tsx
npx playwright test xmlui/src/components/Table/Table.spec.ts --reporter=line
npm run test:e2e-website-examples -- tests-e2e/how-to-examples/use-smart-table-columns.spec.ts --workers=1 --reporter=line
npm run test:e2e-website-examples -- tests-e2e/how-to-examples/format-table-columns-by-type.spec.ts --workers=1 --reporter=line
```

If a separate `TableColumnTypes.spec.ts` is created, run that spec directly during development, then run the broader Table spec before finishing.
