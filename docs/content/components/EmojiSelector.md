# EmojiSelector [#emojiselector]

`EmojiSelector` enables users to browse, search and select emojis from their system's native emoji set.

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `autoFocus` [#autofocus]

-  default: **false**

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
