# Stepper [#stepper]

`Stepper` displays a sequence of steps for a multi-step workflow or wizard. Individual steps are declared with [Step](/components/Step) children. Inspired by the Material UI Stepper, it supports horizontal and vertical orientations, an alternative-label layout, and a nonLinear mode that allows users to navigate between steps freely.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `activeStep` [#activestep]

> [!DEF]  default: **0**

The 0-based index of the currently active step. If not set, the first step (index 0) is active. When out of range, it falls back to 0.

### `nonLinear` [#nonlinear]

> [!DEF]  default: **false**

When `true`, step headers become clickable so users can jump to any step. Default is `false` (linear navigation via the `next`/`prev` APIs).

### `orientation` [#orientation]

> [!DEF]  default: **"horizontal"**

Layout orientation of the stepper. In `horizontal` mode the step headers are laid out in a row above a shared content area; only the active step's content is shown. In `vertical` mode each step renders its own header with the active step's content expanding beneath it.

Available values: `horizontal` **(default)**, `vertical`

### `stackedLabel` [#stackedlabel]

> [!DEF]  default: **false**

When `true`, step labels are placed below the step icons instead of next to them. Works in both horizontal and vertical orientations.

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of Stepper has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

## Exposed Methods [#exposed-methods]

### `next` [#next]

Advances to the next step. If the current step is the last, no change occurs.

**Signature**: `next(): void`

### `prev` [#prev]

Moves back to the previous step. If the current step is the first, no change occurs.

**Signature**: `prev(): void`

### `reset` [#reset]

Resets the stepper back to the first step (index 0).

**Signature**: `reset(): void`

### `setActiveStep` [#setactivestep]

Sets the active step by its 0-based index.

**Signature**: `setActiveStep(index: number): void`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-icon-Stepper](/docs/styles-and-themes/common-units/#color) | $color-surface-300 | $color-surface-300 |
| [backgroundColor-icon-Stepper--active](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [backgroundColor-icon-Stepper--completed](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [backgroundColor-icon-Stepper--error](/docs/styles-and-themes/common-units/#color) | $color-danger-500 | $color-danger-500 |
| [backgroundColor-Stepper](/docs/styles-and-themes/common-units/#color) | transparent | transparent |
| [borderColor-connector-Stepper](/docs/styles-and-themes/common-units/#color) | $borderColor | $borderColor |
| [borderColor-connector-Stepper--completed](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [borderStyle-connector-Stepper](/docs/styles-and-themes/common-units/#border-style) | solid | solid |
| [borderWidth-connector-Stepper](/docs/styles-and-themes/common-units/#size-values) | 1px | 1px |
| [fontSize-description-Stepper](/docs/styles-and-themes/common-units/#size-values) | $fontSize-small | $fontSize-small |
| [fontSize-icon-Stepper](/docs/styles-and-themes/common-units/#size-values) | $fontSize-small | $fontSize-small |
| [fontSize-label-Stepper](/docs/styles-and-themes/common-units/#size-values) | $fontSize-base | $fontSize-base |
| [fontWeight-icon-Stepper](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [fontWeight-label-Stepper](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-normal | $fontWeight-normal |
| [gap-Stepper](/docs/styles-and-themes/common-units/#size) | 0 | 0 |
| [padding-content-Stepper](/docs/styles-and-themes/common-units/#size-values) | $space-4 0 | $space-4 0 |
| [padding-Stepper](/docs/styles-and-themes/common-units/#size-values) | 0 | 0 |
| [size-icon-Stepper](/docs/styles-and-themes/common-units/#size-values) | 28px | 28px |
| [textColor-description-Stepper](/docs/styles-and-themes/common-units/#color) | $textColor-secondary | $textColor-secondary |
| [textColor-icon-Stepper](/docs/styles-and-themes/common-units/#color) | $color-surface-50 | $color-surface-50 |
| [textColor-icon-Stepper--active](/docs/styles-and-themes/common-units/#color) | $color-surface-50 | $color-surface-50 |
| [textColor-icon-Stepper--completed](/docs/styles-and-themes/common-units/#color) | $color-surface-50 | $color-surface-50 |
| [textColor-icon-Stepper--error](/docs/styles-and-themes/common-units/#color) | $color-surface-50 | $color-surface-50 |
| [textColor-label-Stepper](/docs/styles-and-themes/common-units/#color) | $textColor-secondary | $textColor-secondary |
| [textColor-label-Stepper--active](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [textColor-label-Stepper--completed](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [textColor-label-Stepper--error](/docs/styles-and-themes/common-units/#color) | $color-danger-600 | $color-danger-600 |
