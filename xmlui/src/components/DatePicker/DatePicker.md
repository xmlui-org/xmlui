%-DESC-START

**Key features:**
- **Flexible modes**: Single date selection (default) or date range selection
- **Format customization**: Support for various date formats (MM/dd/yyyy, yyyy-MM-dd, etc.)
- **Date restrictions**: Set minimum/maximum dates and disable specific dates
- **Localization options**: Configure first day of week and show week numbers

%-DESC-END

%-API-START setValue

```xmlui-pg copy {3, 9, 12} display name="Example: value and setValue"
<App>
  <DatePicker
    id="picker"
    readOnly="true"
  />
  <HStack>
    <Button
      label="Add Text"
      onClick="picker.setValue('05/25/2024')" />
    <Button
      label="Remove Text"
      onClick="picker.setValue('')" />
  </HStack>
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

%-PROP-START placeholder

```xmlui-pg copy display name="Example: placeholder" height="120px"
<App>
  <DatePicker placeholder="This is a placeholder" />
</App>  
```

%-PROP-END

%-PROP-START enabled

```xmlui-pg copy display name="Example: enabled" height="120px"
<App>
  <DatePicker enabled="false" />
</App>  
```

%-PROP-END

%-PROP-START validationStatus

| Value     | Description                                           |
| :-------- | :---------------------------------------------------- |
| `valid`   | Visual indicator for an input that is accepted        |
| `warning` | Visual indicator for an input that produced a warning |
| `error`   | Visual indicator for an input that produced an error  |

```xmlui-pg copy display name="Example: validationStatus" height="300px"
<App>
  <DatePicker />
  <DatePicker validationStatus="valid" />
  <DatePicker validationStatus="warning" />
  <DatePicker validationStatus="error" />
</App>
```

%-PROP-END

%-PROP-START mode

```xmlui-pg copy {2-3} display name="Example: mode" height="240px"
<App>
  <DatePicker mode="single" />
  <DatePicker mode="range" />
</App>
```

%-PROP-END

%-PROP-START dateFormat

Formats handle years (`y`), months (`m` or `M`), days of the month (`d`).
Providing multiple placeholder letters changes the display of the date.

The table below shows the available date formats:

| Format     | Example    |
| :--------- | :--------- |
| MM/dd/yyyy | 05/25/2024 |
| MM-dd-yyyy | 05-25-2024 |
| yyyy/MM/dd | 2024/05/25 |
| yyyy-MM-dd | 2024-05-25 |
| dd/MM/yyyy | 25/05/2024 |
| dd-MM-yyyy | 25-05-2024 |
| yyyyMMdd   | 20240525   |
| MMddyyyy   | 05252024   |

```xmlui-pg copy display name="Example: dateFormat" height="120px"
<App>
  <DatePicker dateFormat="dd-MM-yyyy" initialValue="05/25/2024" />
</App>
```

%-PROP-END

%-PROP-START showWeekNumber

```xmlui-pg copy display name="Example: showWeekNumber" height="120px"
<App>
  <DatePicker showWeekNumber="true" />
</App>
```

%-PROP-END

%-PROP-START weekStartsOn

| Day       | Number |
| :-------- | :----- |
| Sunday    | 0      |
| Monday    | 1      |
| Tuesday   | 2      |
| Wednesday | 3      |
| Thursday  | 4      |
| Friday    | 5      |
| Saturday  | 6      |

```xmlui-pg copy display name="Example: weekStartsOn" height="120px"
<App>
  <DatePicker weekStartsOn="1" />
</App>
```

%-PROP-END

%-PROP-START minValue

```xmlui-pg copy display name="Example: minValue" height="120px"
<App>
  <DatePicker minValue="05/24/2024" />
</App>
```

%-PROP-END

%-PROP-START maxValue

```xmlui-pg copy display name="Example: maxValue" height="120px"
<App>
  <DatePicker maxValue="05/26/2024" />
</App>
```

%-PROP-END

%-PROP-START disabledDates

```xmlui-pg copy display name="Example: disabledDates" height="120px"
<App>
  <DatePicker disabledDates="{['05/26/2024', '05/27/2024']}" initialValue="05/25/2024" />
</App>  
```

%-PROP-END

%-EVENT-START didChange

Write in the input field and see how the `Text` underneath it is updated in parallel.

```xmlui-pg copy {2} display name="Example: didChange" height="120px"
<App var.field="">
  <DatePicker initialValue="{field}" onDidChange="(val) => field = val" />
  <Text value="{field}" />
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

Clicking on the `DatePicker` in the example demo changes the label text.
Note how clicking elsewhere resets the text to the original.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus" height="120px"
<App var.isFocused="false">
  <Text value="{isFocused === true ? 'DatePicker focused' : 'DatePicker lost focus'}" />
  <DatePicker
    onGotFocus="isFocused = true"
    onLostFocus="isFocused = false"
  />
</App>
```

%-EVENT-END

