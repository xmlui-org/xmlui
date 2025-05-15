# VStack [#component-vstack]

This component is inherited from `Stack`

`VStack` is a specialized, shorthand version for the regular [Stack](./Stack) component with a vertical orientation.
See also: [HStack](./HStack.mdx), [CHStack](./CHStack.mdx), [CVStack](./CVStack.mdx).

```xmlui-pg copy display name="Example: VStack"
<App>
  <VStack>
    <Stack height="32px" width="32px" backgroundColor="red" />
    <Stack height="32px" width="32px" backgroundColor="blue" />
    <Stack height="32px" width="32px" backgroundColor="green" />
  </VStack>
</App>
```

>[!INFO]
> You cannot change the orientation of `VStack` from vertical to horizontal by setting the `orientation` prop, as the engine ignores that setting.


