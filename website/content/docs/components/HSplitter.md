# HSplitter [#hsplitter]

This component is inherited from [Splitter](/components/Splitter)

See also: [VSplitter](/components/VSplitter)

`HSplitter` is a specialized, shorthand version for the regular `Splitter` component with a vertical orientation.

```xmlui-pg copy display name="Example: HSplitter"
<App >
  <HSplitter height="200px">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </HSplitter>
</App>
```

>[!INFO]
> You cannot change the orientation of `HSplitter` from vertical to horizontal by setting the `orientation` prop, as the engine ignores that setting.


