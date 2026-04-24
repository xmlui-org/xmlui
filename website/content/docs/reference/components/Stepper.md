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
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper | $color-surface-300 | $color-surface-300 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper--active | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper--completed | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper--error | $color-danger-500 | $color-danger-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Stepper | transparent | transparent |
| [borderColor](/docs/styles-and-themes/common-units/#color)-connector-Stepper | $borderColor | $borderColor |
| [borderColor](/docs/styles-and-themes/common-units/#color)-connector-Stepper--completed | $color-primary-500 | $color-primary-500 |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-connector-Stepper | solid | solid |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-connector-Stepper | 1px | 1px |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-description-Stepper | $fontSize-small | $fontSize-small |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-icon-Stepper | $fontSize-small | $fontSize-small |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-label-Stepper | $fontSize-base | $fontSize-base |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-icon-Stepper | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-label-Stepper | $fontWeight-normal | $fontWeight-normal |
| [gap](/docs/styles-and-themes/common-units/#size)-Stepper | 0 | 0 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-content-Stepper | $space-4 0 | $space-4 0 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Stepper | 0 | 0 |
| [size](/docs/styles-and-themes/common-units/#size-values)-icon-Stepper | 28px | 28px |
| [textColor](/docs/styles-and-themes/common-units/#color)-description-Stepper | $textColor-secondary | $textColor-secondary |
| [textColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper | $color-surface-50 | $color-surface-50 |
| [textColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper--active | $color-surface-50 | $color-surface-50 |
| [textColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper--completed | $color-surface-50 | $color-surface-50 |
| [textColor](/docs/styles-and-themes/common-units/#color)-icon-Stepper--error | $color-surface-50 | $color-surface-50 |
| [textColor](/docs/styles-and-themes/common-units/#color)-label-Stepper | $textColor-secondary | $textColor-secondary |
| [textColor](/docs/styles-and-themes/common-units/#color)-label-Stepper--active | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-label-Stepper--completed | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-label-Stepper--error | $color-danger-600 | $color-danger-600 |
