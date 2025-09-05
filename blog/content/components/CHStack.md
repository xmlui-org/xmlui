# CHStack [#chstack]

This component is inherited from [Stack](/components/Stack)

See also: [CVStack](/components/CVStack), [HStack](/components/HStack), [VStack](/components/VStack)

`CHStack` is a specialized, shorthand version for the regular `Stack` component that has a horizontal orientation with its contents centered.

```xmlui-pg copy display name="Example: CHStack"
<App>
  <CHStack backgroundColor="cyan">
    <Stack height="32px" width="32px" backgroundColor="red" />
    <Stack height="32px" width="32px" backgroundColor="blue" />
    <Stack height="32px" width="32px" backgroundColor="green" />
  </CHStack>
</App>
```

>[!INFO]
> You cannot change the orientation of `CHStack` from horizontal to vertical by setting the `orientation` prop, as the engine ignores that setting.


