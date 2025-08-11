%-desc-START

**Key features:**
- **Pre-styled elements**: Built-in support for `title`, `subtitle`, and `avatarUrl` properties
- **Flexible layout**: Choose `vertical` (default) or `horizontal` orientation
- **Visual grouping**: Automatic styling with background, borders, and spacing
- **Clickable areas**: Supports click events for interactive cards
## Using Card

`Card` is a container; it does not have any explicit properties.
You can nest the card's content into the `<Card>` tag:

```xmlui-pg copy display name="Example: using Card"
<App>
  <Card maxWidth="200px">
    <HStack verticalAlignment="center">
      <Icon name="info" />
      <Text value="Information" variant="strong" />
    </HStack>
    <Text value="This is an example text" />
  </Card>
</App>
```

There are also prestyled properties one can make use of, detailed in the [Properties section](#properties).
Prestyled elements always appear above other children.

```xmlui-pg copy display name="Example: using Card with prestyled elements"
<App>
  <Card
    avatarUrl="https://i.pravatar.cc/100"
    title="Example Title"
    subtitle="Predefined subtitle"
    maxWidth="300px">
    <HStack verticalAlignment="center">
      <Icon name="info"/>
      This is a card
    </HStack>
  </Card>
</App>
```

%-DESC-END

%-PROP-START showAvatar

Note that in the demo below if the `avatarUrl` is specified, `showAvatar` is automatically set to true but can still be hidden.

```xmlui-pg copy display name="Example: showAvatar"
<App>
  <Card maxWidth="300px" avatarUrl="https://i.pravatar.cc/100" />
  <Card maxWidth="300px" showAvatar="true" title="Example Card" />
  <Card maxWidth="300px" showAvatar="true" />
</App>
```

%-PROP-END

%-PROP-START subtitle

This prop sets the prestyled subtitle.

```xmlui-pg copy display name="Example: subtitle"
<App>
  <Card maxWidth="300px" subtitle="Example Subtitle" />
</App>
```

%-PROP-END

%-PROP-START title

This prop sets the prestyled title.

```xmlui-pg copy display name="Example: title"
<App>
  <Card maxWidth="300px" title="Example Title" />
</App>
```

%-PROP-END

%-PROP-START orientation

```xmlui-pg copy display name="Example: orientation"
<App>
  <Card title="Example Title" subtitle="Example Subtitle" orientation="horizontal">
    <SpaceFiller />
    <Text>Text child #1</Text>
    <Text>Text child #2</Text>
    <Button label="Button Child" />
  </Card>
</App>
```

%-PROP-END

%-EVENT-START click

This event is triggered when the `Card` is clicked.

```xmlui-pg copy display name="Example: click"
<App>
  <Card maxWidth="300px" onClick="toast('Clicked!')">
    <HStack verticalAlignment="center">
      <Icon name="info" />
      <Text value="Information" variant="strong" />
    </HStack>
    <Text value="This is an example text" />
  </Card>
</App>
```

%-EVENT-END
