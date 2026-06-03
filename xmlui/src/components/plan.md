# Plan: Replace `d()` Metadata Helper Usage

## Goal

Replace every `d(...)` call in component metadata with the literal `ComponentPropertyMetadata`
object that `d()` returns:

```ts
{
  description,
  isRequired,
  availableValues,
  valueType,
  defaultValue,
  isValid,
}
```

The practical target is to make every metadata field explicit, especially `valueType`, and then
remove `d()` from `xmlui/src/components/metadata-helpers.ts`.

## Current Scope

Initial scan:

```sh
rg -n "\bd\(" xmlui/src/components -g '*.ts' -g '*.tsx'
```

At the start of this plan there are 325 matches:

- 324 `d()` call sites in component metadata
- 1 `d()` function definition in `metadata-helpers.ts`
- 35 component files with call sites

Largest cluster:

- `HtmlTags/HtmlTags.tsx`: 196 call sites

Next largest clusters:

- `Table/Table.tsx`: 19
- `List/List.tsx`: 14
- `Pagination/Pagination.tsx`: 11
- `TileGrid/TileGrid.tsx`: 8
- `Select/Select.tsx`: 6

## Conversion Rule

Convert each call mechanically according to the positional arguments:

```ts
d(description);
```

becomes:

```ts
{
  description,
}
```

```ts
d(description, availableValues, valueType, defaultValue, isValid, isRequired);
```

becomes:

```ts
{
  description,
  availableValues,
  valueType,
  defaultValue,
  isValid,
  isRequired,
}
```

Omit fields that were not supplied unless preserving an explicit `undefined` is clearer during the
same edit. Prefer named object fields over positional placeholders like `undefined`.

Examples:

```ts
submitUrl: d("URL to submit the form data.", undefined, "url"),
```

becomes:

```ts
submitUrl: {
  description: "URL to submit the form data.",
  valueType: "url",
},
```

```ts
pageSize: d("Number of items per page", undefined, "number", defaultProps.pageSize),
```

becomes:

```ts
pageSize: {
  description: "Number of items per page",
  valueType: "number",
  defaultValue: defaultProps.pageSize,
},
```

## Batch Strategy

Keep each batch small enough to review by eye and verify independently. After every batch:

```sh
npx prettier --write <changed files>
npm --prefix xmlui run check:metadata
npm --prefix xmlui run build:xmlui-metadata
rg -n "\bd\(" <changed files>
```

The metadata build may emit existing Lightning CSS `:export` warnings. Treat the build as passing
when it exits successfully.

## Batch 1: Single-Call Components

Refactor files with one call site each:

- `FileInput/FileInput.tsx`
- `FileUploadDropZone/FileUploadDropZone.tsx`
- `IncludeMarkup/IncludeMarkup.tsx`
- `Items/Items.tsx`
- `Markdown/Markdown.tsx`
- `NavGroup/NavGroup.tsx`
- `Pages/Pages.tsx`
- `Slot/Slot.ts`
- `Tabs/TabItem.tsx`
- `Tabs/Tabs.tsx`

This batch validates the conversion style across props, context vars, and non-visual metadata with
minimal blast radius.

## Batch 2: Small Component Files

Refactor files with two or three call sites:

- `Link/Link.tsx`
- `NavLink/NavLink.tsx`
- `NumberBox/NumberBox.tsx`
- `Queue/Queue.tsx`
- `Text/Text.tsx`
- `TextArea/TextArea.tsx`
- `FormItem/FormItem.tsx`
- `Heading/Heading.tsx`
- `ModalDialog/ModalDialog.tsx`
- `Option/Option.tsx`
- `Slider/Slider.tsx`

Pay attention to module-level constants like `VALUE_DESC = d(...)`; convert those constants to
literal metadata objects too.

## Batch 3: Form and App-Surface Components

Refactor the medium files that describe app-level or form-level behavior:

- `AutoComplete/AutoComplete.tsx`
- `Form/Form.tsx`
- `FormSegment/FormSegment.tsx`
- `Inspector/Inspector.tsx`
- `StepperForm/StepperForm.tsx`
- `TabsForm/TabsForm.tsx`
- `Theme/Theme.tsx`
- `IFrame/IFrame.tsx`

These include a mix of props and context vars. Preserve existing `valueType`, `defaultValue`, and
available-value fields exactly when present.

## Batch 4: Data Components

Refactor data-heavy components:

- `Select/Select.tsx`
- `TileGrid/TileGrid.tsx`
- `Pagination/Pagination.tsx`
- `List/List.tsx`
- `Table/Table.tsx`

These are more likely to have props where `wrapComponent` behavior depends on explicit
`valueType`. During review, check each current `d()` call and decide whether the omitted
`valueType` is intentional. Do not invent a `valueType` as part of this mechanical refactor unless
there is already an explicit positional argument in the old call or a separate issue asks for it.

## Batch 5: Deprecated HTML Tags

Refactor `HtmlTags/HtmlTags.tsx` separately.

This file has 196 call sites and is mostly mechanical. Recommended sub-batches:

1. Link/media/form tags near the top of the file.
2. Text/heading/list tags.
3. Table-related tags.
4. Remaining void and inline tags.

Because `HtmlTags` uses `wrapComponent` config for boolean, number, and resource URL coercions,
keep this refactor metadata-only unless a test exposes a missing explicit `valueType`.

## Batch 6: Remove `d()`

After all component call sites are gone:

```sh
rg -n "\bd\(" xmlui/src/components -g '*.ts' -g '*.tsx'
```

Expected remaining match before deletion:

- `xmlui/src/components/metadata-helpers.ts`: the `d()` function definition

Then:

1. Remove the `d()` export from `metadata-helpers.ts`.
2. Remove now-unused imports from `metadata-helpers.ts`, especially:
   - `IsValidFunction`
   - `PropertyValueDescription`
   - `PropertyValueType`
     if no other helper uses them.
3. Run:

```sh
npx prettier --write xmlui/src/components/metadata-helpers.ts
npm --prefix xmlui run check:metadata
npm --prefix xmlui run build:xmlui-metadata
rg -n "\bd\(" xmlui/src/components -g '*.ts' -g '*.tsx'
```

The final `rg` should return no matches.

## Review Checklist

For each batch:

- No `d` import remains in changed files.
- Literal metadata objects preserve the same `description`.
- Explicit old positional arguments map to the correct field:
  - arg 2 -> `availableValues`
  - arg 3 -> `valueType`
  - arg 4 -> `defaultValue`
  - arg 5 -> `isValid`
  - arg 6 -> `isRequired`
- No new `valueType` is added during the mechanical replacement unless separately requested.
- `check:metadata` passes.
- `build:xmlui-metadata` passes.
