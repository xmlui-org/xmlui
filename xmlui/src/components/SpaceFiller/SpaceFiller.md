%-DESC-START

## Using `SpaceFiller`

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

%-DESC-END

%-STYLE-START

`SpaceFiller` ignores all layout properties; it cannot be styled.

%-STYLE-END
