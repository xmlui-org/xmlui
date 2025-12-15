# NoResult [#noresult]

`NoResult` displays a visual indication that a query or search returned nothing.

## Properties [#properties]

### `hideIcon` (default: false) [#hideicon-default-false]

This boolean property indicates if the icon should be hidden.

```xmlui-pg copy display name="Example: hideIcon"
<App>
  <FlowLayout>
    <NoResult hideIcon="true" width="50%" />
    <NoResult hideIcon="false" width="50%" />
  </FlowLayout>
</App>
```

### `icon` (default: "noresult") [#icon-default-noresult]

This property defines the icon to display with the component.

This property defines the icon to display with the component. For a list of of available icons consult [`Icon` documentation](/components/Icon).

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
| [backgroundColor](../styles-and-themes/common-units/#color)-NoResult | $backgroundColor | $backgroundColor |
| [border](../styles-and-themes/common-units/#border)-NoResult | 0px solid $borderColor | 0px solid $borderColor |
| [borderBottom](../styles-and-themes/common-units/#border)-NoResult | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-NoResult | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-NoResult | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-NoResult | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-NoResult | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-NoResult | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-NoResult | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-NoResult | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-NoResult | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-NoResult | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-NoResult | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-NoResult | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-NoResult | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-NoResult | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-NoResult | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-NoResult | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-NoResult | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-NoResult | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-NoResult | *none* | *none* |
| [gap](../styles-and-themes/common-units/#size)-icon-NoResult | $space-2 | $space-2 |
| [padding](../styles-and-themes/common-units/#size)-NoResult | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-NoResult | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-NoResult | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-NoResult | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-NoResult | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-NoResult | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-NoResult | $space-2 | $space-2 |
| [size](../styles-and-themes/common-units/#size)-icon-NoResult | $space-8 | $space-8 |
