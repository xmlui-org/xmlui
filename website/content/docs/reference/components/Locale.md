# Locale [#locale]

`Locale` creates a scoped locale context for its descendants. It can override the locale ID and locale formatting traits such as decimal and grouping separators.

`Locale` creates a scoped locale context for its descendants. Use it when part
of a page should translate or format values differently from the root
`App locale`.

The component is non-visual: it renders only its children. `App.locale` still
returns the root app locale inside the scope, while locale-aware helpers such
as `App.formatNumber()`, `App.t()`, and `I18n` use the nearest `Locale`.

```xmlui-pg copy display name="Example: scoped locale"
<App
  locale="en-US"
  localeBundles="{{
    'en-US': { greeting: 'Hello' },
    'de-DE': { greeting: 'Hallo' }
  }}">
  <VStack gap="$space-2">
    <I18n key="greeting" />
    <Text value="{App.formatNumber(12345.5)}" />
    <Locale locale="de-DE">
      <I18n key="greeting" />
      <Text value="{App.formatNumber(12345.5)}" />
    </Locale>
  </VStack>
</App>
```

```xmlui-pg copy display name="Example: formatting trait overrides"
<App locale="en-US">
  <Locale decimalSeparator="," groupSeparator=" ">
    <Text value="{App.formatNumber(12345.5)}" />
  </Locale>
</App>
```

`Locale` scopes typed table formatting too. A `Column` with
`typeOptions.locale` keeps its explicit locale and does not inherit the
surrounding `Locale`.

```xmlui-pg copy display name="Example: scoped table formatting"
<App locale="en-US">
  <Locale locale="hu-HU">
    <Table
      data="{[
        { local: 12345.5, us: 12345.5 }
      ]}">
      <Column bindTo="local" type="decimal(1)" />
      <Column bindTo="us" type="decimal(1)" typeOptions="{{ locale: 'en-US' }}" />
    </Table>
  </Locale>
</App>
```

## Behaviors [#behaviors]

No behaviors are applicable to this component.

## Properties [#properties]

### `currency` [#currency]

Default currency trait for descendants.

### `decimalSeparator` [#decimalseparator]

Override for the decimal separator used by descendant number formatting.

Overrides the decimal separator used by descendant number formatting.

```xmlui
<Locale decimalSeparator=",">
  <Text value="{App.formatNumber(12.5)}" />
</Locale>
```

### `groupSeparator` [#groupseparator]

Override for the grouping separator used by descendant number formatting.

Overrides the grouping separator used by descendant number formatting.

```xmlui
<Locale groupSeparator=" ">
  <Text value="{App.formatNumber(12345)}" />
</Locale>
```

### `locale` [#locale]

BCP-47 locale ID used by descendants for translation and formatting.

Sets the BCP-47 locale ID for descendants.

```xmlui
<Locale locale="de-DE">
  <I18n key="summary" />
</Locale>
```

### `minusSign` [#minussign]

Override for the minus sign used by descendant number formatting.

Overrides the minus sign used by descendant number formatting.

```xmlui
<Locale minusSign="−">
  <Text value="{App.formatNumber(-12)}" />
</Locale>
```

### `numberingSystem` [#numberingsystem]

Unicode numbering system identifier forwarded to Intl number formatting when supported.

Forwards a Unicode numbering system identifier to `Intl.NumberFormat` where
the runtime supports it.

```xmlui
<Locale locale="en-US" numberingSystem="arab">
  <Text value="{App.formatNumber(12345)}" />
</Locale>
```

### `thousandSeparator` [#thousandseparator]

Alias for `groupSeparator`. Use this to override the thousands/grouping separator.

Alias for `groupSeparator`.

```xmlui
<Locale thousandSeparator=" ">
  <Text value="{App.formatNumber(12345)}" />
</Locale>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
