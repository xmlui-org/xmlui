# StickyBox [#stickybox]

`StickyBox` remains fixed at the top or bottom of the screen as the user scrolls.

## Properties [#properties]

### `to (default: "top")` [#to-default-top]

This property determines whether the StickyBox should be anchored to the `top` or `bottom`.

Available values: `top` **(default)**, `bottom`

```xmlui-pg copy display name="Example: to" height="200px"
<App>
  <StickyBox to="top">
    This part of the UI sticks to the top
  </StickyBox>
  <Stack backgroundColor="red" height="80px" width="100%" />
  <Stack backgroundColor="green" height="80px" width="100%" />
  <Stack backgroundColor="blue" height="80px" width="100%" />
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
| [backgroundColor](../styles-and-themes/common-units/#color)-StickyBox | $backgroundColor | $backgroundColor |
