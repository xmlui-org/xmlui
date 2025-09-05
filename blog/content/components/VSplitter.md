# VSplitter [#vsplitter]

This component is inherited from [Splitter](/components/Splitter)

See also: [HSplitter](/components/HSplitter)

`VSplitter` is a specialized, shorthand version for the regular `Splitter` component with a vertical orientation.

```xmlui-pg copy display name="Example: VSplitter"
<App>
  <VSplitter height="200px">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </VSplitter>
</App>
```

>[!INFO]
> You cannot change the orientation of `VSplitter` from vertical to horizontal by setting the `orientation` prop, as the engine ignores that setting.


