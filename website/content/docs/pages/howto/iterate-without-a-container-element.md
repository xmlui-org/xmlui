# Iterate without a container element

Use `Items` to stamp out repeated markup inline when you do not want `List`'s visual chrome or scroll container.

`Items` is a non-visual component. It renders the child template for each data item and places the results directly inside its parent's layout context, with no wrapping element of its own. This makes it the right choice when you need the stamped children to participate in an outer `HStack`, `VStack`, or form. This is where an extra container would break the layout.

```xmlui-pg copy display name="Dashboard stat cards with Items in HStack"
---app
<App
  var.metrics="{[
    { label: 'Active Users', value: 1284, icon: 'users'       },
    { label: 'Open Tickets', value: 47, icon: 'compactlist'},
    { label: 'Deployments', value: 12, icon: 'box'         },
    { label: 'Uptime', value: '99.8 %', icon: 'arrowup'    }
  ]}"
>
  <HStack wrapContent>
    <Items data="{metrics}">
      <Card width="$space-30" title="{$item.label}">
        <HStack verticalAlignment="center">
          <Icon name="{$item.icon}" />
          <Text fontSize="$fontSize-2xl" fontWeight="bold">{$item.value}</Text>
        </HStack>
      </Card>
    </Items>
  </HStack>
</App>
```

## Key points

**`Items` contributes no wrapper element**: Unlike `List`, which renders its own scroll container, `Items` is purely structural. The filled-in cards appear as direct children of `HStack`, so `wrapContent`, gap, and child widths work as if you had written the cards by hand.

**Use an explicit card width when wrapping**: With no width, each card uses its content width and the row can feel uneven. With `width="*"`, the cards divide one row instead of wrapping. A small fixed width such as `width="200px"` may clip longer titles. A spacing token like `width="$space-30"` gives the cards enough room for the titles and lets `HStack wrapContent` reflow them responsively.

**Context variables are the same as `List`**: `$item`, `$itemIndex`, `$isFirst`, and `$isLast` are all available inside the child template, with the same semantics as in `List`.

**No virtualization**: `Items` renders every element in the array on every render. It is appropriate for short lists (typically fewer than ~100 items). For longer lists, use `List`, which only renders the visible rows.

**`data` and `items` props are equivalent**: Pass the array to either one. If `data` is a plain object rather than an array, `Items` iterates the object's own values in insertion order.

**`reverse="{true}"` renders items in reverse order**: Useful for displaying newest-first content (like a message thread) without needing to pre-sort the data array.

---

## See also

- [Render a flat list with custom cards](/docs/howto/render-a-flat-list-with-custom-cards) - use `List` when you need virtualization, grouping, or built-in selection
- [Build a responsive card grid](/docs/howto/build-a-responsive-card-grid) - use `HStack wrapContent` or `TileGrid` for responsive card layouts
- [Group items in List by a property](/docs/howto/group-items-in-list-by-a-property) - use `List` when you need automatic section headers and footers
