%-DESC-START

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

%-DESC-END

%-PROP-START locale

Sets the BCP-47 locale ID for descendants.

```xmlui
<Locale locale="de-DE">
  <I18n key="summary" />
</Locale>
```

%-PROP-END

%-PROP-START decimalSeparator

Overrides the decimal separator used by descendant number formatting.

```xmlui
<Locale decimalSeparator=",">
  <Text value="{App.formatNumber(12.5)}" />
</Locale>
```

%-PROP-END

%-PROP-START groupSeparator

Overrides the grouping separator used by descendant number formatting.

```xmlui
<Locale groupSeparator=" ">
  <Text value="{App.formatNumber(12345)}" />
</Locale>
```

%-PROP-END

%-PROP-START thousandSeparator

Alias for `groupSeparator`.

```xmlui
<Locale thousandSeparator=" ">
  <Text value="{App.formatNumber(12345)}" />
</Locale>
```

%-PROP-END

%-PROP-START minusSign

Overrides the minus sign used by descendant number formatting.

```xmlui
<Locale minusSign="−">
  <Text value="{App.formatNumber(-12)}" />
</Locale>
```

%-PROP-END

%-PROP-START numberingSystem

Forwards a Unicode numbering system identifier to `Intl.NumberFormat` where
the runtime supports it.

```xmlui
<Locale locale="en-US" numberingSystem="arab">
  <Text value="{App.formatNumber(12345)}" />
</Locale>
```

%-PROP-END
