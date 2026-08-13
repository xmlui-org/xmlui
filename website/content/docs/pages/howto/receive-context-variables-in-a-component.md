# Receive context variables in a component

Use `receivesContextVars` when a user-defined component wraps a built-in component that creates runtime context variables, and caller-supplied slot content needs to read those variables.

Most user-defined components get their data through `$props` and explicit slot properties. That keeps the component boundary predictable. Some built-in components, though, create context variables only while rendering a nested template. A `Column` inside a `Table`, for example, exposes `$cell`, `$item`, and `$rowIndex` to its cell template.

If you hide that `Column` inside a reusable component, the caller's slot content does not automatically receive the `Column` context. Add `receivesContextVars` to the component definition to opt in.

```xmlui-pg copy display /receivesContextVars/ /\$cell/ /\$rowIndex/ id="reusable-table-column-receives-cell" name="Reusable table column receives cell context"
<App>
  <Table
    data="{[
      { id: 0, name: 'Apples', quantity: 5, unit: 'pieces' },
      { id: 1, name: 'Bananas', quantity: 6, unit: 'pieces' },
      { id: 2, name: 'Carrots', quantity: 100, unit: 'grams' }
    ]}"
  >
    <HighlightColumn bindTo="name" header="Item">
      <Text testId="item-cell">{$rowIndex + 1}. {$cell}</Text>
    </HighlightColumn>
    <Column bindTo="quantity" header="Quantity" />
    <Column bindTo="unit" header="Unit" />
  </Table>
</App>

<Component name="HighlightColumn" receivesContextVars="$cell, $rowIndex">
  <Column bindTo="{$props.bindTo}" header="{$props.header}">
    <Stack backgroundColor="lightyellow" padding="$space-2">
      <Slot />
    </Stack>
  </Column>
</Component>
```

`HighlightColumn` receives `$cell` and `$rowIndex` from the `Column` cell render site, then forwards them to the caller's `<Slot />` content. The `Text` written inside `<HighlightColumn>` can therefore render the row number and current cell value.

## Key points

**Use a narrow list when you know what the slot needs**: Prefer `receivesContextVars="$cell, $rowIndex"` for a table cell wrapper. Context variable names must include the leading `$`, matching the way they are read in markup.

**Use the key-only form for broad wrapper components**: `<Component name="CellShell" receivesContextVars>` is the same as boolean `true` and receives all available non-reserved context variables. This is useful for generic wrappers, but a named list is easier to reason about.

**The missing attribute is not the same as `true`**: Leaving `receivesContextVars` off preserves the component boundary. Existing components do not suddenly receive every ambient context variable from the caller or from nested built-ins.

**`false` is an explicit opt-out**: `receivesContextVars="false"` and `receivesContextVars="{false}"` receive none of the new context variables. This is mainly useful when you want to override a generated or shared component definition.

**Invalid values fail during parsing**: Arbitrary expressions, `*`, empty list entries, invalid identifiers, and reserved names such as `$props`, `$self`, and `$this` are rejected.

**Slot props still win on name collisions**: Attributes you put on `<Slot />` become slot props and take precedence over received context variables with the same `$` name. Avoid reusing the same name for two different meanings.

---

## See also

- [Pass a template slot to a component](/docs/howto/pass-a-template-slot-to-a-component) — the basic slot mechanics this feature builds on
- [Render a custom cell with components](/docs/howto/render-a-custom-cell-with-components) — the `Table` and `Column` context variables used in cell templates
- [Create a reusable component](/docs/howto/create-a-reusable-component) — props, component boundaries, and when to extract markup
