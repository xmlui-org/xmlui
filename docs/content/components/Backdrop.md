# Backdrop [#backdrop]

The `Backdrop` component is a semi-transparent overlay that appears on top of its child component to obscure or highlight the content behind it.

```xmlui-pg copy display name="Example: using Backdrop"
<App>
  <Backdrop opacity="0.6">
    <Image 
      src="/resources/images/components/image/breakfast.jpg" 
      fit="cover" width="400px" />
    <property name="overlayTemplate">
      <VStack verticalAlignment="center" height="100px">
        <H1 color="white" textAlign="center">Great breakfast!</H1>
      </VStack>
    </property>
  </Backdrop>
</App>
```

## Properties [#properties]

### `backgroundColor` [#backgroundcolor]

The background color of the backdrop.

### `opacity` [#opacity]

The opacity of the backdrop.

### `overlayTemplate` [#overlaytemplate]

This property defines the component template for an optional overlay to display over the component.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-Backdrop | black | black |
| [opacity](../styles-and-themes/common-units/#opacity)-Backdrop | 0.1 | 0.1 |
