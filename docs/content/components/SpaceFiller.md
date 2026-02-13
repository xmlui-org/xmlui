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

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | N/A |

## Properties [#properties]

This component does not have any properties.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

`SpaceFiller` ignores all layout properties; it cannot be styled.
