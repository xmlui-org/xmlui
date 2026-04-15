# Show different content per breakpoint

Use responsive when-xs, when-md, when-lg attributes to swap components at breakpoints.

A client list should show a full `Table` on desktop (≥ 768 px) and a card-based `List` on phones (< 768 px). Both components sit in the markup; `when-*` attributes mount or unmount them at the appropriate breakpoints without any JavaScript.

```xmlui-pg copy display name="Table on desktop, card list on mobile"
---app display
<App var.clients="{[
    {name:'Acme Corp', status:'Active'},
    {name:'Globex Ltd', status:'Pending'},
    {name:'Initech', status:'Active'},
    {name:'Umbrella Co', status:'Inactive'},
    {name:'Hooli', status:'Active'}
]}">
  <H3 fontSize="$fontSize-base" fontSize-md="$fontSize-xl">Client List</H3>
  <!-- visible on tablets and above (≥ 768 px) -->
  <Table data="{clients}" when-md>
    <Column bindTo="name" header="Name" />
    <Column bindTo="status" header="Status" />
  </Table>
  <!-- visible on phones only (xs and sm, below 768 px) -->
  <List data="{clients}" when-md="false">
    <property name="itemTemplate">
      <Card title="{$item.name}">
        <Badge value="{$item.status}" />
      </Card>
    </property>
  </List>
</App>
---desc
Pop this app into the playground (click the leftmost icon in the example header) and then click the “Preview in full screen” icon in the playground’s toolbar. Resize the app window to see how it behaves on wide and narrow screens.
```

## Key points

**`when-md` shows an element at ≥ 768 px and hides it below**: The shorthand `when-md` (no value) is equivalent to `when-md="true"`. Because no rule is defined below `md`, the framework infers the base visibility as the opposite — hidden. A single attribute is all you need for a "desktop-only" element:

| Attribute | Applies from |
|---|---|
| `when-xs` | All screens (≥ 0 px) |
| `when-sm` | ≥ 576 px |
| `when-md` | ≥ 768 px |
| `when-lg` | ≥ 992 px |
| `when-xl` | ≥ 1200 px |

**`when-md="false"` hides at ≥ 768 px and shows below**: The framework infers the base visibility as the opposite of `false`, so the element is visible below `md` without any extra attribute. This is the cleanest way to declare a "mobile-only" element:

```xmlui
<!-- desktop only: visible at ≥ 768 px, hidden below -->
<Table when-md>…</Table>

<!-- mobile only: hidden at ≥ 768 px, visible below -->
<List when-md="false">…</List>
```

**The active value is resolved by walking downward from the current breakpoint**: At any viewport width, XMLUI checks `when-{current}`, then `when-{one smaller}`, and so on, using the first defined value it finds. This means `when-sm="true"` also covers `md`, `lg`, and `xl` unless a larger breakpoint provides an override.

**Targeting a specific breakpoint range**: Combine a truthy lower bound with a falsy upper bound to show an element only within a range:

```xmlui
<!-- visible only between sm and lg -->
<Text when="false" when-sm="true" when-xl="false" value="Tablet only" />
```

**Layout-property breakpoints**: Properties like `fontSize`, `padding`, and `width` accept `-{breakpoint}` suffixes. The base value applies at all sizes; a breakpoint-suffixed value overrides it from that minimum width upward:

```xmlui
<H3 fontSize="$fontSize-base" fontSize-md="$fontSize-xl">Client List</H3>
<VStack width-md="50%">…</VStack>
```

---

**See also**
- [Visibility](/docs/visibility) — full `when-*` resolution rules, inference, and breakpoint range patterns
- [Layout Properties](/docs/styles-and-themes/layout-props) — breakpoint-suffixed sizing properties
- [Table component](/docs/reference/components/Table) — columns and sorting
- [List component](/docs/reference/components/List) — item templates
