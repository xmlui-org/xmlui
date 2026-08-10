%-DESC-START

`Value` displays a read-only value with optional type-aware formatting. It uses
the same display type vocabulary as `Column type`, but it can be used anywhere,
not only inside a `Table`.

**Key features:**

- **Typed display**: Format numbers, currencies, dates, booleans, JSON, links, images, avatars, and enum labels
- **Locale aware**: Uses the app or nearest `Locale` formatting context by default
- **Display only**: Does not validate, convert, or mutate the underlying value

`Value` has no table behavior. Use `value`, not `bindTo`; it does not provide
headers, sorting, resizing, pinning, or row/cell context variables.

For a task-oriented walkthrough, see
[Display typed values outside tables](/docs/howto/display-typed-values-outside-tables).

%-DESC-END

%-PROP-START value

`value` is the raw value to display. Without an explicit `type`, `Value` displays
the value as text.

```xmlui-pg copy display name="Example: Basic Value"
<App>
  <VStack>
    <Value value="Ada Lovelace" />
    <Value value="{42}" />
    <Value value="{true}" />
  </VStack>
</App>
```

Nullish values render empty by default. With `type="json"`, a null value displays
as `null`.

```xmlui-pg copy display name="Example: Null Values"
<App>
  <HStack>
    <Text value="Default:" />
    <Value value="{null}" />
    <Text value="JSON:" />
    <Value value="{null}" type="json" />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START type

`type` selects read-only display formatting. The type affects display only; it
does not validate, convert, or mutate the underlying data. If a value cannot be
formatted for the selected type, `Value` falls back to plain text.

Use a bare type name for default behavior:

```xmlui
<Value value="{user.email}" type="email" />
<Value value="{invoice.createdAt}" type="datetime" />
<Value value="{payload}" type="json" />
```

Some types accept compact arguments:

```xmlui
<Value value="{order.total}" type="currency(EUR)" />
<Value value="{score}" type="number(8,3)" />
<Value value="{dueAt}" type="date(short)" />
```

```xmlui-pg copy display name="Example: Typed Values"
<App>
  <VStack>
    <Value value="ada@example.com" type="email" />
    <Value value="{1299.95}" type="currency(USD)" />
    <Value value="2026-08-10T08:30:00Z" type="datetime(short)" />
    <Value value="{true}" type="yes-no" />
  </VStack>
</App>
```

Structured and media-like values are supported too:

```xmlui-pg copy display name="Example: Structured Values"
<App>
  <VStack>
    <Value value="{{ id: 1, name: 'Ada' }}" type="json" />
    <Value value="https://example.com/docs" type="url(label:domain)" />
    <Value
      value="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      type="avatar"
      typeOptions="{{label:'Ada avatar'}}"
    />
  </VStack>
</App>
```

%-PROP-END

%-PROP-START typeOptions

`typeOptions` provides object-shaped display options for the selected `type`.
It is most useful when compact type syntax is not expressive enough. Values in
`typeOptions` override compact arguments in `type`.

Use `typeOptions` to map raw values to readable labels:

```xmlui-pg copy display name="Example: Enum Labels"
<App>
  <VStack>
    <Value
      value="sent"
      type="enum"
      typeOptions="{{sent:{label:'Sent to customer'}, draft:'Draft'}}"
    />
    <Value
      value="blocked"
      type="status"
      typeOptions="{{blocked:'Blocked', ready:'Ready'}}"
    />
  </VStack>
</App>
```

Use `typeOptions` for locale overrides and long-text display options:

```xmlui-pg copy display name="Example: Type Options"
<App>
  <VStack>
    <Value value="{1234.5}" type="decimal(1)" typeOptions="{{locale:'hu-HU'}}" />
    <Value
      value="A longer body of text that can be clamped to a small number of visual lines."
      type="long-text"
      typeOptions="{{maxLines:2}}"
    />
  </VStack>
</App>
```

For `image` and `avatar`, use `typeOptions` for accessible labels:

```xmlui-pg copy display name="Example: Media Alt Text"
<App>
  <Value
    value="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    type="avatar"
    typeOptions="{{label:'Ada avatar'}}"
  />
</App>
```

%-PROP-END
