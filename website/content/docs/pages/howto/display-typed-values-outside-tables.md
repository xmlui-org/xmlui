# Display typed values outside tables

Use `Value` when you want the same read-only typed display behavior as `Column type`, but the value is not inside a `Table`.

`Value` is useful in detail panels, summaries, cards, lists, and confirmation screens. It formats the value you pass through the `value` prop; it does not validate, convert, edit, sort, or provide table context variables.

## Format summary values

Use `type` to choose the display shape. Numeric and date-like types use the active locale, link-like types render links, and boolean display types stay read-only.

```xmlui-pg copy display name="Display summary values with Value" id="display-summary-values-with-value"
<App>
  <VStack gap="$space-3">
    <Text variant="strong">Invoice summary</Text>

    <HStack gap="$space-2">
      <Text>Total:</Text>
      <Value value="{1299.95}" type="currency(USD)" />
    </HStack>

    <HStack gap="$space-2">
      <Text>Due:</Text>
      <Value value="2026-08-10T08:30:00Z" type="date(short)" />
    </HStack>

    <HStack gap="$space-2">
      <Text>Paid:</Text>
      <Value value="{false}" type="yes-no" />
    </HStack>

    <HStack gap="$space-2">
      <Text>Contact:</Text>
      <Value value="billing@example.com" type="email" />
    </HStack>
  </VStack>
</App>
```

## Reuse table display types in a detail panel

If a table uses `Column type`, use the same `type` value in a nearby detail view. The column keeps table behavior such as headers and sorting; `Value` only renders the typed value.

```xmlui-pg copy display name="Reuse table display types in a detail panel" id="reuse-table-display-types-in-detail-panel"
<App var.selected="{{
  invoice: 'INV-001',
  client: 'Ada Lovelace',
  total: 1299.95,
  status: 'sent'
}}">
  <VStack gap="$space-4">
    <Table data="{[selected]}">
      <Column bindTo="invoice" />
      <Column bindTo="client" />
      <Column bindTo="total" type="currency(USD)" />
      <Column
        bindTo="status"
        type="enum"
        typeOptions="{{sent:'Sent to customer'}}"
      />
    </Table>

    <VStack gap="$space-2">
      <Text variant="strong">Selected invoice</Text>
      <HStack gap="$space-2">
        <Text>Total:</Text>
        <Value value="{selected.total}" type="currency(USD)" />
      </HStack>
      <HStack gap="$space-2">
        <Text>Status:</Text>
        <Value
          value="{selected.status}"
          type="enum"
          typeOptions="{{sent:'Sent to customer'}}"
        />
      </HStack>
    </VStack>
  </VStack>
</App>
```

## Display structured and visual values

Use `typeOptions` when the type needs object-shaped options, such as readable enum labels or accessible labels for images and avatars.

```xmlui-pg copy display name="Display structured and visual values" id="display-structured-and-visual-values-with-value"
<App>
  <VStack gap="$space-3">
    <Value
      value="ready"
      type="status"
      typeOptions="{{ready:'Ready for review', blocked:'Blocked'}}"
    />

    <Value value="https://example.com/docs/value" type="url(label:domain)" />

    <Value value="{{ retries: 3, cache: true }}" type="json" />

    <Value
      value="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      type="avatar"
      typeOptions="{{label:'Project avatar'}}"
    />
  </VStack>
</App>
```

## Key points

**Use `Value` for display only**: It renders a value with a type hint, but it does not validate, edit, or mutate the source data.

**Use `value`, not `bindTo`**: `bindTo` is a `Column` concept. Outside a table, pass the expression you want to display directly to `value`.

**Keep table behavior in `Column`**: Headers, sorting, resizing, pinning, `$item`, and `$cell` belong to `Column`. `Value` is just the typed read-only display part.

**Prefer `typeOptions` for richer options**: Use compact type strings for simple cases such as `currency(USD)` or `url(label:domain)`, and `typeOptions` for maps, labels, locale overrides, and media alt text.

---

## See also

- [Value](/docs/reference/components/Value) - all supported properties
- [Format table columns by type](/docs/howto/format-table-columns-by-type) - use the same display types inside `Table`
- [Format values for the active locale](/docs/howto/format-values-for-the-active-locale) - use formatter helpers directly in expressions
