# HStack [#hstack]

This component is inherited from [Stack](/components/Stack)

See also: [CHStack](/components/CHStack), [CVStack](/components/CVStack), [VStack](/components/VStack)

`HStack` is a specialized, shorthand version for the regular `Stack` component with a horizontal orientation.

```xmlui-pg copy display name="Example: HStack"
<App>
  <HStack>
    <Stack height="32px" width="32px" backgroundColor="red" />
    <Stack height="32px" width="32px" backgroundColor="blue" />
    <Stack height="32px" width="32px" backgroundColor="green" />
  </HStack>
</App>
```

>[!INFO]
> You cannot change the orientation of `HStack` from horizontal to vertical by setting the `orientation` prop, as the engine ignores that setting.


