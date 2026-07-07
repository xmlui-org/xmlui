# Masonry [#masonry]

`Masonry` arranges children in a responsive multi-column layout where items flow top-to-bottom then left-to-right, with columns automatically adapting to container width.

**Context variables available during execution:**

- `$isFirst`: `true` when this is the first item.
- `$isLast`: `true` when this is the last item.
- `$item`: The current data item.
- `$itemIndex`: The zero-based index of the current item.

## Use children as Content Template

The [itemTemplate](#itemtemplate) property can be replaced by setting the item template component directly as the Masonry's child.
In the following example, the two Masonry are functionally the same:

```xmlui copy
<App>
  <!-- This is the same -->
  <Masonry>
    <property name="itemTemplate">
      <Text>Template</Text>
    </property>
  </Masonry>
  <!-- As this -->
  <Masonry>
    <Text>Template</Text>
  </Masonry>
</App>
```

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `columnGap`

Gap between columns. Overrides gap for the horizontal axis.

### `columns`

> [!DEF]  default: **3**

Maximum number of columns.

### `data`

The array of items to render. Each item is exposed as `$item` inside the child template.

### `gap`

> [!DEF]  default: **"16px"**

Gap between columns and between items. Accepts CSS lengths or theme tokens (e.g. '$space-3'). Overridden by columnGap/rowGap if set.

### `itemTemplate`

The template used to render each item. Use `$item` to access the current data item.

### `minColumnWidth`

> [!DEF]  default: **"250px"**

Minimum width per column. Columns reduce automatically when the container is too narrow. Any CSS length value.

### `rowGap`

Gap between items within a column. Overrides gap for the vertical axis.

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

This component does not have any styles.
