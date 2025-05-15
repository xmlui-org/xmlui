# EmojiSelector [#component-emojiselector]

>[!WARNING]
> This component is in an **experimental** state; you can use it in your app. However, we may modify it, and it may even have breaking changes in the future.The `EmojiSelector` component provides users with a graphical interface to browse, search and select emojis to insert into text fields, messages, or other forms of communication.

## Properties

### `autoFocus (default: false)`

If this property is set to `true`, the component gets the focus automatically when displayed.

```xmlui-pg copy display name="Example: autoFocus" height="420px"
<App>
  <EmojiSelector autoFocus="true" />
</App>
```

## Events

### `select`

This event is fired when the user selects an emoticon from this component.

```xmlui-pg copy display name="Example: select" height="420px"
<App>
  <HStack var.selected="">
    <EmojiSelector onSelect="(emoji) => { selected = emoji }" />
    <Text value="Selected emoji: {selected}" />
  </HStack>
</App>
```

## Exposed Methods

This component does not expose any methods.

## Styling

This component does not have any styles.
