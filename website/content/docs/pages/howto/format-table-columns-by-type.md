# Format table columns by type

Use `Column type` when a field should be displayed with common table-cell behavior without writing custom child markup.
Types are display hints: they do not validate, convert, or mutate the source data.

## Format common text values

Use link-like types for contact fields and text types for values that need different wrapping behavior.

```xmlui-pg display name="Format common text values" id="format-common-text-values"
<App>
  <Table
    data='{[
      {
        contact: "Ada",
        email: "ada@example.com",
        phone: "+1 555 123 4567",
        website: "https://example.com/profile",
        notes: "This is a long note that wraps instead of behaving like a compact one-line value."
      }
    ]}'
  >
    <Column bindTo="contact" type="name" />
    <Column bindTo="email" type="email" />
    <Column bindTo="phone" type="phone" />
    <Column bindTo="website" type="url(label:domain)" />
    <Column bindTo="notes" type="long-text" />
  </Table>
</App>
```

## Format numbers

Numeric types use locale-aware formatting.
`number(8,3)` keeps up to three decimal places and emits decimal-aware cell parts.

```xmlui-pg display name="Format numbers" id="format-numbers"
<App>
  <Table
    data='{[
      { amount: 1234.5678, count: 12.7, ratio: 0.12, total: 1234.5 }
    ]}'
  >
    <Column bindTo="amount" type="number(8,3)" />
    <Column bindTo="count" type="integer" />
    <Column bindTo="ratio" type="percent" />
    <Column bindTo="total" type="currency(USD)" />
  </Table>
</App>
```

## Format dates and times

Date and time types use browser `Intl` formatting.
Use `iso-date` or `timestamp` when you need a stable machine-style display.

```xmlui-pg display name="Format dates and times" id="format-dates-and-times"
<App>
  <Table
    data='{[
      {
        dueDate: "2026-08-06",
        dueTime: "2026-08-06T12:34:00Z",
        updated: "2026-08-06T12:00:00Z",
        machineDate: "2026-08-06T12:00:00Z",
        expires: "2999-01-01T00:00:00Z"
      }
    ]}'
  >
    <Column bindTo="dueDate" type="date" />
    <Column bindTo="dueTime" type="time" />
    <Column bindTo="updated" type="datetime" />
    <Column bindTo="machineDate" type="iso-date" />
    <Column bindTo="expires" type="relative-time" />
  </Table>
</App>
```

## Display enums and statuses

`enum` and `status` render as plain text by default.
Use `typeOptions` when raw values need readable labels.

```xmlui-pg display name="Display enums and statuses" id="display-enums-and-statuses"
<App>
  <Table
    data='{[
      { invoice: "INV-001", status: "pending", state: "sent" },
      { invoice: "INV-002", status: "ready", state: "draft" }
    ]}'
  >
    <Column bindTo="invoice" />
    <Column bindTo="status" type="status" />
    <Column
      bindTo="state"
      type="enum"
      typeOptions="{{sent:{label:'Sent to customer'}, draft:{label:'Draft'}}}"
    />
  </Table>
</App>
```

## Display structured and media values

Use structured and visual types when raw values benefit from a compact table display.

```xmlui-pg display name="Display structured and media values" id="display-structured-and-media-values"
<App>
  <Table
    data='{[
      {
        label: "Sample",
        metadata: { level: "admin" },
        tags: ["math", "logic"],
        color: "#336699",
        avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      }
    ]}'
  >
    <Column bindTo="label" />
    <Column bindTo="metadata" type="json" />
    <Column bindTo="tags" type="tags" />
    <Column bindTo="color" type="color" />
    <Column bindTo="avatar" type="avatar" typeOptions="{{label:'Sample avatar'}}" />
  </Table>
</App>
```

## Override a typed column with custom cell markup

Child content inside `Column` is the escape hatch.
When children are present, they render instead of the default `type` output.

```xmlui-pg display name="Override a typed column with custom cell markup" id="override-a-typed-column-with-custom-cell-markup"
<App>
  <Table data='{[{ total: 1234.5 }]}' >
    <Column bindTo="total" type="currency(USD)">
      <Text>Custom total: {$cell}</Text>
    </Column>
  </Table>
</App>
```

## Key points

**Use `type` for display, not validation**: Keep validation rules in forms, APIs, or your data layer.

**Use `typeOptions` for object-shaped options**: Enum/status label maps and image/avatar labels are easier to read there than inside the compact type string.

**Use child markup for custom layouts**: A typed column is convenient, but nested content remains the fully custom path.

---

## See also

- [Column](/docs/reference/components/Column) - all supported column properties
- [Table](/docs/reference/components/Table) - inferred and explicit table columns
- [Use interactive Column controls](/docs/howto/use-interactive-column-controls) - render checkbox, switch, and color controls in table cells
- [Display typed values outside tables](/docs/howto/display-typed-values-outside-tables) - use the same display types with `Value`
- [Use smart Table columns](/docs/howto/use-smart-table-columns) - render tables without writing `Column` children
