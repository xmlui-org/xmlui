# FormSegment [#formsegment]

`FormSegment` groups a subset of form fields within a `Form` and exposes segment-scoped context variables for the fields it contains. Use it to build multi-step wizards, collapsible sections, or any layout that needs per-section data and validation state without creating a nested form. Children are automatically wrapped in a VStack (or HStack if `orientation="horizontal"`) with layout properties transposed from the segment.

**Context variables available during execution:**

- `$hasSegmentValidationIssue`: A function that returns `true` when any field in this segment has a validation issue. Pass a field name as the first argument to check a specific field only.
- `$segmentData`: An object containing the current form values of the fields that belong to this segment, keyed by field name. Only fields registered with this segment are included.
- `$segmentValidationIssues`: An object keyed by field name containing an array of failed validation results for each field that belongs to this segment. Fields without validation issues are omitted.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `fields` [#fields]

An optional comma-separated list of field names (matching the `bindTo` values of nested inputs) that belong to this segment. When omitted the segment auto-discovers field names by inspecting its direct and nested children for `bindTo` attributes.

### `label` [#label]

An optional human-readable label for this segment. `StepperForm` uses this label as the corresponding step's title; on its own, `FormSegment` does not render the label (it is metadata only).

### `orientation` [#orientation]

> [!DEF]  default: **"vertical"**

Stack orientation for the implicit layout container. Use "vertical" (default) for a VStack or "horizontal" for an HStack. Layout properties (width, height, padding, gap, backgroundColor, etc.) are transposed to this container.

Available values: `horizontal`, `vertical` **(default)**

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

### `hasIssues` [#hasissues]

This property returns `true` when any field in this segment has a validation issue, and `false` when all fields are valid. This is the counterpart of `isValid`.

**Signature**: `hasIssues: boolean`

### `isDirty` [#isdirty]

This property returns `true` when at least one field in this segment has been modified by the user (touched), and `false` when no field has been changed yet. Useful for showing validation feedback only after the user has interacted with the segment.

**Signature**: `isDirty: boolean`

### `isValid` [#isvalid]

This property returns `true` when all fields in this segment have passed validation (no validation issues), and `false` when any field has a validation error.

**Signature**: `isValid: boolean`

## Styling [#styling]

This component does not have any styles.
