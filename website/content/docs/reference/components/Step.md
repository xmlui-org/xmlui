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

### `description` [#description]

Optional secondary text shown under the step label.

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
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper--active | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper--completed | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper--error | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Stepper | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-connector-Stepper | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-connector-Stepper--completed | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-connector-Stepper | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-connector-Stepper | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-description-Stepper | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-icon-Stepper | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-label-Stepper | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-icon-Stepper | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-label-Stepper | *none* | *none* |
| [gap](/docs/styles-and-themes/common-units/#size)-Stepper | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-content-Stepper | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Stepper | *none* | *none* |
| [size](/docs/styles-and-themes/common-units/#size-values)-icon-Stepper | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-description-Stepper | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper--active | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper--completed | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-label-Stepper | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-label-Stepper--active | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-label-Stepper--completed | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-label-Stepper--error | *none* | *none* |
