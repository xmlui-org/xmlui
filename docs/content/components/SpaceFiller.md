# SpaceFiller [#spacefiller]

`SpaceFiller` works well in layout containers to fill remaining (unused) space. Its behavior depends on the layout container in which it is used.

## Using `SpaceFiller` [#using-spacefiller]

In a `Stack`, `SpaceFiller` pushes the children following it to the other end of the container:

```xmlui-pg copy display {3} name="SpaceFiller in an HStack"
<App>
  <HStack>
    <Stack width="36px" height="36px" backgroundColor="red" />
    <SpaceFiller />
    <Stack width="36px" height="36px" backgroundColor="blue" />
  </HStack>
</App>
```

In a `FlowLayout`, `SpaceFiller` acts as a line break for a row. The children following the `SpaceFiller` enters a new line.

```xmlui-pg copy display {3} name="Example: in a FlowLayout"
<App>
  <FlowLayout>
    <Stack width="20%" height="36px" backgroundColor="red" />
    <SpaceFiller />
    <Stack width="20%" height="36px" backgroundColor="green" />
    <Stack width="20%" height="36px" backgroundColor="blue" />
  </FlowLayout>
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

This component does not have any properties.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

`SpaceFiller` ignores all layout properties; it cannot be styled.
