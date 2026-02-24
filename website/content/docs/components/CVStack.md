# CVStack [#cvstack]

This component is inherited from [Stack](/components/Stack)

See also: [CHStack](/components/CHStack), [HStack](/components/HStack), [VStack](/components/VStack)

`CVStack` is a specialized, shorthand version for the regular `Stack` component with a vertical orientation centered on its contents.

```xmlui-pg copy display name="Example: CVStack"
<App>
  <CVStack width="33%" backgroundColor="cyan">
    <Stack height="32px" width="32px" backgroundColor="red" />
    <Stack height="32px" width="32px" backgroundColor="blue" />
    <Stack height="32px" width="32px" backgroundColor="green" />
  </CVStack>
</App>
```

>[!INFO]
> You cannot change the orientation of `CVStack` from vertical to horizontal by setting the `orientation` prop, as the engine ignores that setting.


