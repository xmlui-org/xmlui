# NoResult [#noresult]

`NoResult` displays a visual indication that a query or search returned nothing.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Publish/Subscribe | `subscribeToTopic` |
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
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NoResult | transparent | transparent |
| [border](/docs/styles-and-themes/common-units/#border)-NoResult | 0px solid $borderColor | 0px solid $borderColor |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-NoResult | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-NoResult | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-NoResult | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-NoResult | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-NoResult | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-NoResult | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-NoResult | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-NoResult | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-NoResult | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-NoResult | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-NoResult | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-NoResult | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-NoResult | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-NoResult | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-NoResult | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-NoResult | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-NoResult | *none* | *none* |
| [gap](/docs/styles-and-themes/common-units/#size)-icon-NoResult | $space-2 | $space-2 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-NoResult | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-NoResult | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-NoResult | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-NoResult | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-NoResult | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-NoResult | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-NoResult | $space-2 | $space-2 |
| [size](/docs/styles-and-themes/common-units/#size-values)-icon-NoResult | $space-8 | $space-8 |
