%-DESC-START

**Key features:**
- **Flexible modes**: Single date selection or date range selection.
- **Format customization**: Supports the same public date formats as the original component.
- **Date restrictions**: Supports minimum/maximum date bounds and disabled date matchers.
- **Localization options**: Configurable first day of week and optional week-number cells.

%-DESC-END

%-API-START setValue

```xmlui-pg copy {3, 9, 12} display name="Example: setValue" height="180px"
<App>
  <HStack>
    <Button
      label="Set Date to 05/25/2024"
      onClick="picker.setValue('05/25/2024')" />
    <Button
      label="Remove Date"
      onClick="picker.setValue('')" />
  </HStack>
  <DatePicker id="picker" />
</App>
```

%-API-END

%-PROP-START initialValue

```xmlui-pg copy display name="Example: initialValue" height="120px"
<App>
  <DatePicker initialValue="05/25/2024" />
</App>
```

%-PROP-END

%-PROP-START mode

```xmlui-pg copy {2-3} display name="Example: mode" height="190px"
<App>
  <DatePicker mode="single" />
  <DatePicker mode="range" />
</App>
```

%-PROP-END

%-EVENT-START didChange

```xmlui-pg copy {2} display name="Example: didChange" height="180px"
<App var.field="(none)">
  <Text value="{field}" />
  <DatePicker
    initialValue="{field}"
    onDidChange="(val) => field = val" />
</App>
```

%-EVENT-END
