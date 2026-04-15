# Iterate without a container element

Use `Items` to stamp out repeated markup inline when you do not want `List`'s visual chrome or scroll container.

`Items` is a non-visual component — it renders the child template for each data item and places the results directly inside its parent's layout context, with no wrapping element of its own. This makes it the right choice when you need the stamped children to participate in an outer `FlowLayout`, `HStack`, or form — where an extra container would break the layout.

```xmlui-pg copy display name="Dashboard stat cards with Items in FlowLayout"
---app
<App
  var.metrics="{[
    { label: 'Active Users', value: 1284, icon: 'users'       },
    { label: 'Open Tickets', value: 47, icon: 'compactlist'},
    { label: 'Deployments', value: 12, icon: 'box'         },
    { label: 'Uptime', value: '99.8 %', icon: 'arrowup'    }
  ]}"
>
  <FlowLayout>
    <Items data="{metrics}">
      <Card width="*" title="{$item.label}">
        <HStack verticalAlignment="center">
          <Icon name="{$item.icon}" />
          <Text fontSize="$fontSize-2xl" fontWeight="bold">{$item.value}</Text>
        </HStack>
      </Card>
    </Items>
  </FlowLayout>
</App>
```

## Key points

**`Items` contributes no wrapper element**: Unlike `List`, which renders its own scroll container, `Items` is purely structural. The filled-in cards appear as direct children of `FlowLayout`, so star sizing (`width="*"`), gap, and wrapping all work as expected.

**Context variables are the same as `List`**: `$item`, `$itemIndex`, `$isFirst`, and `$isLast` are all available inside the child template, with the same semantics as in `List`.

**No virtualization**: `Items` renders every element in the array on every render. It is appropriate for short lists (typically fewer than ~100 items). For longer lists, use `List`, which only renders the visible rows.

**`data` and `items` props are equivalent**: Pass the array to either one. If `data` is a plain object rather than an array, `Items` iterates the object's own values in insertion order.

**`reverse="{true}"` renders items in reverse order**: Useful for displaying newest-first content (like a message thread) without needing to pre-sort the data array.

---

## See also

- [Render a flat list with custom cards](/docs/howto/render-a-flat-list-with-custom-cards) — use `List` when you need virtualization, grouping, or built-in selection
- [Make a set of equal-width cards](/docs/howto/make-a-set-of-equal-width-cards) — combine star sizing and `FlowLayout` for an even-width stat row
- [Group items in List by a property](/docs/howto/group-items-in-list-by-a-property) — use `List` when you need automatic section headers and footers
