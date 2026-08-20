# NoResult [#noresult]

`NoResult` displays a visual indication that a query or search returned nothing.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Live Region | `withLiveRegion`, `liveRegionMessage`, `liveRegionPoliteness` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `hideIcon` [#hideicon]

> [!DEF]  default: **false**

This boolean property indicates if the icon should be hidden.

```xmlui-pg copy display name="Example: hideIcon"
<App>
  <FlowLayout>
    <NoResult hideIcon="true" width="50%" />
    <NoResult hideIcon="false" width="50%" />
  </FlowLayout>
</App>
```

### `icon` [#icon]

> [!DEF]  default: **"noresult"**

This property defines the icon to display with the component.

This property defines the icon to display with the component. For a list of of available icons consult [`Icon` documentation](/docs/reference/components/Icon).

```xmlui-pg copy display name="Example: icon"
<App>
  <NoResult icon="error" height="100%" />
</App>
```

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

Customize the displayed text using this property. Leave empty to omit it.

```xmlui-pg copy display name="Example: label"
<App>
  <NoResult label="Sorry, found nothing!" height="100%" />
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-NoResult](/docs/styles-and-themes/common-units/#color) | transparent | transparent |
| [border-NoResult](/docs/styles-and-themes/common-units/#border) | 0px solid $borderColor | 0px solid $borderColor |
| [borderBottom-NoResult](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-NoResult](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-NoResult](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-NoResult](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-NoResult](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-NoResult](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-NoResult](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-NoResult](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-NoResult](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-NoResult](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-NoResult](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-NoResult](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-NoResult](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-NoResult](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-NoResult](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRight-NoResult](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-NoResult](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-NoResult](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-NoResult](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-NoResult](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-NoResult](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-NoResult](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-NoResult](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-NoResult](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-NoResult](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-NoResult](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-NoResult](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-NoResult](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-NoResult](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-NoResult](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-NoResult](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [gap-icon-NoResult](/docs/styles-and-themes/common-units/#size) | $space-2 | $space-2 |
| [padding-NoResult](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-NoResult](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-NoResult](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-NoResult](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-NoResult](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-NoResult](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-NoResult](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [size-icon-NoResult](/docs/styles-and-themes/common-units/#size-values) | $space-8 | $space-8 |
