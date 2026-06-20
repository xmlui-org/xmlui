%-DESC-START

**Key features:**
- **Name-based lookup**: Reference icons by name from the built-in registry (e.g., "home", "search", "trash")
- **Multiple sizes**: Choose from predefined sizes (xs, sm, md, lg) or set custom dimensions
- **Fallback support**: Specify backup icons when the primary icon name doesn't exist
- **Interactive**: Supports click events for creating icon buttons and clickable elements


%-DESC-END

%-PROP-START name

The engine looks up the icon in its registry and determines which icon is associated with the name that the component will show.
Nothing is displayed if the icon name is not found in the registry.

```xmlui-pg copy display name="Example: name"
<App>
  <HStack>
    <Icon name="message" />
    <Icon name="note" />
    <Icon name="cog" />
    <Icon name="start" />
    <Icon name="some-non-existing-icon" />
    <Icon name="some-non-existing-icon-with fallback" fallback="trash" />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START fallback

```xmlui-pg copy display name="Example: fallback"
<App>
  <Icon name="noicon" fallback="trash" />
</App>
```

%-PROP-END

%-PROP-START size

```xmlui-pg copy display name="Example: size"
<App>
  <HStack>
    <Icon name="like" />
    <Icon name="like" size="xs" />
    <Icon name="like" size="sm" />
    <Icon name="like" size="md" />
    <Icon name="like" size="lg" />
  </HStack>
</App>
```

%-PROP-END
