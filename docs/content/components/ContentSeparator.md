# ContentSeparator [#contentseparator]

`ContentSeparator` creates visual dividers between content sections using horizontal or vertical lines. It's essential for improving readability by breaking up dense content, separating list items, or creating clear boundaries between different UI sections.

**Key features:**
- **Flexible orientation**: Create horizontal dividers (default) or vertical dividers between content
- **Customizable sizing**: Control thickness with the `thickness` property and length with the `length` property
- **Theme-driven defaults**: Uses theme variables for default sizing when props are not specified

## Properties [#properties]

### `length` [#length]

This property defines the component's width (if the `orientation` is horizontal) or the height (if the `orientation` is vertical). If not defined, the component uses the theme variable `length-ContentSeparator` (default: 100%).

### `orientation` (default: "horizontal") [#orientation-default-horizontal]

Sets the main axis of the component

Available values:

| Value | Description |
| --- | --- |
| `horizontal` | The component will fill the available space horizontally **(default)** |
| `vertical` | The component will fill the available space vertically |

See the demo for an example under [`thickness`](#thickness).

>[!INFO]
> The component will not be displayed if the orientation is set to `vertical` but the height of the parent container is not explicitly set to a value other than 0 or percentage is used as the length unit (e.g. 20%).
> This is true even if the `ContentSeparator` has siblings in the container.
> The demo below illustrates this.
> Notice how the first `ContentSeparator` does not show up while the second does:

```xmlui-pg copy display name="Example: no vertical space"
<App>
  <HStack horizontalAlignment="center">
    <ContentSeparator 
      orientation="vertical" 
      thickness="8px" 
      backgroundColor="blue" 
    />
  </HStack>
  <HStack horizontalAlignment="center" height="48px">
    <ContentSeparator 
      orientation="vertical" 
      thickness="8px" 
      backgroundColor="red" 
    />
  </HStack>
</App>
```

### `thickness` [#thickness]

This property defines the component's height (if the `orientation` is horizontal) or the width (if the `orientation` is vertical). If not defined, the component uses the theme variable `thickness-ContentSeparator` (default: 1px).

```xmlui-pg copy display name="Example: thickness"
<App>
  <Heading level="h2">
    Lorem Ipsum
  </Heading>
  <ContentSeparator />
  Lorem ipsum dolor sit amet, consectetur adipiscing elit,
  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
  ut aliquip ex ea commodo consequat.
  <ContentSeparator thickness="4px" />
  <HStack height="120px">
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
    dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
    non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    <ContentSeparator orientation="vertical" thickness="10px" />
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem
    accusantium doloremque laudantium, totam rem aperiam,
    eaque ipsa quae ab illo inventore veritatis et quasi architecto
    beatae vitae dicta sunt explicabo.
  </HStack>
</App>
```

>[!INFO]
> The `thickness` property controls the height for horizontal separators and the width for vertical separators.
> The `length` property controls the width for horizontal separators and the height for vertical separators.
> When not specified, these values are taken from the theme variables `thickness-ContentSeparator` (default: 1px) and `length-ContentSeparator` (default: 100%).

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-ContentSeparator | $color-surface-200 | $color-surface-200 |
| length-ContentSeparator | 100% | 100% |
| [marginBottom](../styles-and-themes/common-units/#size)-ContentSeparator | *none* | *none* |
| [margin](../styles-and-themes/common-units/#size)Horizontal-ContentSeparator | 0 | 0 |
| [marginLeft](../styles-and-themes/common-units/#size)-ContentSeparator | *none* | *none* |
| [marginRight](../styles-and-themes/common-units/#size)-ContentSeparator | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-ContentSeparator | *none* | *none* |
| [margin](../styles-and-themes/common-units/#size)Vertical-ContentSeparator | 0 | 0 |
| [paddingBottom](../styles-and-themes/common-units/#size)-ContentSeparator | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-ContentSeparator | 0 | 0 |
| [paddingLeft](../styles-and-themes/common-units/#size)-ContentSeparator | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-ContentSeparator | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-ContentSeparator | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-ContentSeparator | 0 | 0 |
| [thickness](../styles-and-themes/common-units/#size)-ContentSeparator | 1px | 1px |
