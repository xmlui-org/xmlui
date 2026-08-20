# Breadcrumbs [#breadcrumbs]

Breadcrumb navigation rendered from the current route's `linkInfo` (label and `pathSegments`).

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `defaultItems`

Explicit list of breadcrumb items `{ label, to? }`. When provided and non-empty, these items are rendered instead of deriving the trail from the current route's `linkInfo`. The last item is rendered as the current (non-link) page.

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [color-Breadcrumbs](/docs/styles-and-themes/common-units/#color) | $textColor-secondary | $textColor-secondary |
| [color-Breadcrumbs--current](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [color-Breadcrumbs--hover](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [fontWeight-Breadcrumbs--current](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [gap-Breadcrumbs](/docs/styles-and-themes/common-units/#size) | $space-2 | $space-2 |
