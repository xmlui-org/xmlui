# Group items in List by a property

Automatically split a flat data array into labelled sections using a single `groupBy` prop.

Setting `groupBy` on a `List` divides rows into named sections without you needing to pre-sort or pre-partition the data. Pair it with `groupHeaderTemplate` to render a custom section heading and `groupFooterTemplate` to add a per-section summary row.

```xmlui-pg copy display name="Employee list grouped by department"
---app
<App
  var.employees="{[
    { id: 1, name: 'Alice Chen',    department: 'Engineering', role: 'Senior Dev' },
    { id: 2, name: 'Bob Martinez',  department: 'Engineering', role: 'Junior Dev' },
    { id: 3, name: 'Carol Kim',     department: 'Design',      role: 'UI Designer' },
    { id: 4, name: 'Dave Lee',      department: 'Engineering', role: 'DevOps' },
    { id: 5, name: 'Eve Torres',    department: 'Design',      role: 'UX Researcher' },
    { id: 6, name: 'Frank Brown',   department: 'Marketing',   role: 'Content Lead' }
  ]}"
>
  <List data="{employees}" groupBy="department">
    <property name="groupHeaderTemplate">
      <HStack verticalAlignment="center">
        <Text fontWeight="bold">{$group.key}</Text>
        <Badge value="{$group.count}" />
      </HStack>
    </property>
    <property name="groupFooterTemplate">
      <Text variant="secondary">{$group.count} team members</Text>
    </property>
    <HStack verticalAlignment="center">
      <Text>{$item.name}</Text>
      <SpaceFiller />
      <Text variant="secondary">{$item.role}</Text>
    </HStack>
  </List>
</App>
```

## Key points

**`groupBy` takes the name of the data property to group by**: Setting `groupBy="department"` splits rows into sections using each item's `department` value as the section key. Items in the same group are rendered together in the order they appear in the source array.

**`$group` context in header and footer templates**: Both `groupHeaderTemplate` and `groupFooterTemplate` receive `$group.key` (the group value), `$group.count` (number of items in the group), `$group.index` (0-based group position), and `$group.items` (the full array of items in that group).

**`groupFooterTemplate` appears after the last item in each group**: It is not a global list footer — it renders once per group, immediately after the group's last row. Use it for per-group aggregates like a member count, a subtotal, or a "load more" action.

**Groups start expanded by default**: Set `groupsInitiallyExpanded="{false}"` to collapse all sections on load. Each group header acts as a toggle; users can expand individual groups by clicking the header.

**`hideEmptyGroups="{false}"` preserves placeholder sections**: By default, groups with no matching items are hidden. Set this prop to `false` and supply `availableGroups` to guarantee that specific group names always appear even when they have no data.

---

## See also

- [Render a flat list with custom cards](/docs/howto/render-a-flat-list-with-custom-cards) — replace the default row with a fully custom Card layout
- [Display an empty-state illustration](/docs/howto/display-an-empty-state-illustration) — show a friendly placeholder when a group or the whole list has no data
- [Paginate a list](/docs/howto/paginate-a-list) — combine grouping with server-side pagination for large datasets
