# Icon [#icon]

`Icon` displays scalable vector icons from XMLUI's built-in icon registry using simple name references. Icons are commonly used in buttons, navigation elements, and status indicators.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `fallback` [#fallback]

This optional property provides a way to handle situations when the icon with the provided [icon name](#name) name does not exist. If the icon cannot be found, no icon is displayed.

### `name` [#name]

This string property specifies the name of the icon to display. All icons have unique, case-sensitive names identifying them. If the icon name is not set, the `fallback` value is used.

### `size` [#size]

This property defines the size of the `Icon`. Note that setting the `height` and/or the `width` of the component will override this property. You can use az explicit size value (e.g., 32px) or one of these predefined values: `xs`, `sm`, `md`, `lg`.

Available values: `xs`, `sm`, `md`, `lg`

## Events [#events]

### `click` [#click]

This event is triggered when the icon is clicked.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [size](/docs/styles-and-themes/common-units/#size-values)-Icon | 1.2em | 1.2em |
