%-DESC-START

Most properties of the component focus on the primary section (e.g. sizing).

See also: [HSplitter](/components/HSplitter), [VSplitter](/components/VSplitter).

%-DESC-END

%-PROP-START floating

```xmlui-pg copy display name="Example: floating"
<App>
  <Splitter height="200px" floating="true">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

%-PROP-END

%-PROP-START initialPrimarySize

```xmlui-pg copy display name="Example: initialPrimarySize"
<App>
  <Splitter height="200px" initialPrimarySize="40%">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

%-PROP-END

%-PROP-START maxPrimarySize

```xmlui-pg copy display name="Example: maxPrimarySize"
<App>
  <Splitter height="200px" maxPrimarySize="80%">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

%-PROP-END

%-PROP-START minPrimarySize

```xmlui-pg copy display name="Example: minPrimarySize"
<App>
  <Splitter height="200px" minPrimarySize="40px">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

%-PROP-END

%-PROP-START orientation

```xmlui-pg copy display name="Example: orientation"
<App>
  <Splitter height="200px" orientation="horizontal">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

%-PROP-END

%-PROP-START splitterTemplate

```xmlui-pg copy {2-4} display name="Example: splitterTemplate"
<App>
  <Splitter height="200px">
    <property name="splitterTemplate">
      <ContentSeparator backgroundColor="green" height="4px" />
    </property>
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

%-PROP-END

%-PROP-START swapped

```xmlui-pg copy display name="Example: swapped"
<App>
  <Splitter height="200px" swapped="true">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

%-PROP-END

%-EVENT-START resize

```xmlui-pg copy {2} display name="Example: resize"
<App height="200px" var.counter="{0}">
  <Splitter onResize="counter++">
    <Stack backgroundColor="lightblue" height="100%">
      <Text value="Resize event called {counter} number of times" />
    </Stack>
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

%-EVENT-END
