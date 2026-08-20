# Step [#step]

`Step` defines an individual step within a [Stepper](/components/Stepper) component. It provides the step header (label, description, icon) and the content shown when the step is active.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `completed` [#completed]

> [!DEF]  default: **false**

When `true`, the step header is rendered in the completed state (a checkmark glyph and the completed color). Ignored when `error` is also `true`.

### `description` [#description]

Optional secondary text shown under the step label.

### `error` [#error]

> [!DEF]  default: **false**

When `true`, the step header is rendered in the error state (red icon and label, with an `!` glyph in place of the step number).

### `icon` [#icon]

Optional icon name to display in the step indicator instead of the step number.

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

## Events [#events]

### `activated` [#activated]

Fires whenever this step becomes the active step.

**Signature**: `activated(): void`

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-icon-Stepper](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-icon-Stepper--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-icon-Stepper--completed](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-icon-Stepper--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Stepper](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-connector-Stepper](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-connector-Stepper--completed](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderStyle-connector-Stepper](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderWidth-connector-Stepper](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-description-Stepper](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-icon-Stepper](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-label-Stepper](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontWeight-icon-Stepper](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-label-Stepper](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [gap-Stepper](/docs/styles-and-themes/common-units/#size) | *none* | *none* |
| [padding-content-Stepper](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Stepper](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [size-icon-Stepper](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textColor-description-Stepper](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-icon-Stepper](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-icon-Stepper--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-icon-Stepper--completed](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-icon-Stepper--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-label-Stepper](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-label-Stepper--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-label-Stepper--completed](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-label-Stepper--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
