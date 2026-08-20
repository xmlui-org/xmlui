# Value [#value]

`Value` displays a read-only value with optional type-aware formatting. Use it for scalar values, structured values, links, dates, numbers, currencies, images, avatars, icons, JSON, enum labels, and similar display-only output outside tables.

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

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `type` [#type]

A display hint for the value. Use compact values such as `text`, `email`, `number(8,3)`, `currency(USD)`, `date(short)`, `datetime`, `boolean`, `enum`, `image`, or `json` to select common read-only formatting behavior. The type affects display only.

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

### `typeOptions` [#typeoptions]

Additional display options for the selected type. Use it for object-shaped configuration, such as enum/status label maps, link labels, image/avatar alt text, locale overrides, and long-text options such as `maxLines`. Values in `typeOptions` override compact options specified in the `type` string.

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

### `value` [#value]

The raw value to display. `Value` formats this value for display only; it does not validate, convert, or mutate the underlying data. Nullish values render empty except with `type="json"`, which displays `null`.

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

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [borderColor-Value](/docs/styles-and-themes/common-units/#color) | $borderColor | $borderColor |
