# Icon [#icon]

`Icon` displays scalable vector icons from XMLUI's built-in icon registry using simple name references. Icons are commonly used in buttons, navigation elements, and status indicators.

**Key features:**
- **Name-based lookup**: Reference icons by name from the built-in registry (e.g., "home", "search", "trash")
- **Multiple sizes**: Choose from predefined sizes (xs, sm, md, lg) or set custom dimensions
- **Fallback support**: Specify backup icons when the primary icon name doesn't exist
- **Interactive**: Supports click events for creating icon buttons and clickable elements

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

```xmlui-pg copy display name="Example: fallback"
<App>
  <Icon name="noicon" fallback="trash" />
</App>
```

### `name` [#name]

This string property specifies the name of the icon to display. All icons have unique, case-sensitive names identifying them. If the icon name is not set, the `fallback` value is used.

The engine looks up the icon in its registry and determines which icon is associated with the name that the component will show.
Nothing is displayed if the icon name is not found in the registry.

```xmlui-pg copy display name="Example: name"
<App>
  <HStack>
    <Icon name="message" />
    <Icon name="note" />
    <Icon name="cog" />
    <Icon name="start" />
    <Icon name="some-non-existing-icon" />
    <Icon name="some-non-existing-icon-with fallback" fallback="trash" />
  </HStack>
</App>
```

### `size` [#size]

This property defines the size of the `Icon`. Note that setting the `height` and/or the `width` of the component will override this property. You can use az explicit size value (e.g., 32px) or one of these predefined values: `xs`, `sm`, `md`, `lg`.

Available values: `xs`, `sm`, `md`, `lg`

```xmlui-pg copy display name="Example: size"
<App>
  <HStack>
    <Icon name="like" />
    <Icon name="like" size="xs" />
    <Icon name="like" size="sm" />
    <Icon name="like" size="md" />
    <Icon name="like" size="lg" />
  </HStack>
</App>
```

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
