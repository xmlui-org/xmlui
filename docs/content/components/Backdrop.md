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

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

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
| [backgroundColor](../styles-and-themes/common-units/#color)-Backdrop | transparent | transparent |
| [opacity](../styles-and-themes/common-units/#opacity)-Backdrop | 0.1 | 0.1 |
