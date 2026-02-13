# EmojiSelector [#emojiselector]

`EmojiSelector` enables users to browse, search and select emojis from their system's native emoji set.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | N/A |

## Properties [#properties]

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

```xmlui-pg copy display name="Example: autoFocus" height="420px"
<App>
  <EmojiSelector autoFocus="true" />
</App>
```

## Events [#events]

### `select` [#select]

This event is fired when the user selects an emoticon from this component.

**Signature**: `select(emoji: string): void`

- `emoji`: The selected emoji character.

```xmlui-pg copy display name="Example: select" height="420px"
<App>
  <HStack var.selected="">
    <EmojiSelector onSelect="(emoji) => { selected = emoji }" />
    <Text value="Selected emoji: {selected}" />
  </HStack>
</App>
```

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
