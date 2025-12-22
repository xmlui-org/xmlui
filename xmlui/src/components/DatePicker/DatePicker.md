%-DESC-START

**Key features:**
- **Flexible modes**: Single date selection (default) or date range selection
- **Format customization**: Support for various date formats (MM/dd/yyyy, yyyy-MM-dd, etc.)
- **Date restrictions**: Set minimum/maximum dates and disable specific dates
- **Localization options**: Configure first day of week and show week numbers

%-DESC-END

%-API-START setValue

```xmlui-pg copy {3, 9, 12} display name="Example: setValue" height="500px"
<App>
  <HStack>
    <Button
      label="Set Date to 05/25/2024"
      onClick="picker.setValue('05/25/2024')" />
    <Button
      label="Remove Date"
      onClick="picker.setValue('')" />
  </HStack>
  <DatePicker inline id="picker" />
</App>
```

%-API-END

%-PROP-START initialValue

```xmlui-pg copy display name="Example: initialValue" height="440px"
<App>
  <DatePicker inline initialValue="05/25/2024" />
</App>
```

%-PROP-END

%-PROP-START placeholder

```xmlui-pg copy display name="Example: placeholder" height="500px"
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

```xmlui-pg copy display name="Example: validationStatus" height="500px"
<App>
  <DatePicker />
  <DatePicker validationStatus="valid" />
  <DatePicker validationStatus="warning" />
  <DatePicker validationStatus="error" />
</App>
```

%-PROP-END

%-PROP-START mode

```xmlui-pg copy {2-3} display name="Example: mode" height="560px"
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

```xmlui-pg copy display name="Example: dateFormat" height="440px"
<App>
  <DatePicker
    inline
    dateFormat="dd-MM-yyyy"
    initialValue="01-01-2024"
    endDate="01-01-2027"
/>
</App>
```

%-PROP-END

%-PROP-START showWeekNumber

```xmlui-pg copy display name="Example: showWeekNumber" height="500px"
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

```xmlui-pg copy display name="Example: weekStartsOn" height="440px"
<App>
  <DatePicker inline weekStartsOn="1" />
</App>
```

%-PROP-END

%-PROP-START minValue

```xmlui-pg copy display name="Example: minValue" height="440px"
<App>
  <DatePicker inline minValue="05/24/2024" />
</App>
```

%-PROP-END

%-PROP-START maxValue

```xmlui-pg copy display name="Example: maxValue" height="440px"
<App>
  <DatePicker inline maxValue="05/26/2024" />
</App>
```

%-PROP-END

%-PROP-START disabledDates

The `disabledDates` prop supports multiple patterns for disabling specific dates in the calendar. You can use Date objects, strings (parsed using the `dateFormat`), or complex matcher objects.

**Basic patterns:**

| Pattern | Description | Example |
| :------ | :---------- | :------ |
| Single string | Disable one specific date | `"05/25/2024"` |
| Array of strings | Disable multiple specific dates | `["05/25/2024", "05/26/2024"]` |
| Boolean | Disable all dates | `true` |

> [!INFO] You can use the [getDate()](/globals#getdate) function to query the current date.

```xmlui-pg copy display name="Example: Disable specific dates" height="440px"
<App>
  <DatePicker
    inline
    disabledDates="{['05/26/2024', '05/27/2024']}"
    initialValue="05/25/2024" />
</App>
```

**Advanced patterns:**

| Pattern | Description | Example |
| :------ | :---------- | :------ |
| Date range | Disable a range of dates | `{from: "05/20/2024", to: "05/25/2024"}` |
| Day of week | Disable specific weekdays (0=Sunday, 6=Saturday) | `{dayOfWeek: [0, 6]}` |
| Before date | Disable all dates before a specific date | `{before: "05/25/2024"}` |
| After date | Disable all dates after a specific date | `{after: "05/25/2024"}` |
| Date interval | Disable dates between two dates (exclusive) | `{before: "05/30/2024", after: "05/20/2024"}` |


```xmlui-pg copy display name="Example: Disable weekends" height="440px"
<App>
  <DatePicker inline disabledDates="{{dayOfWeek: [0, 6]}}" />
</App>
```

```xmlui-pg copy display name="Example: Disable date range" height="440px"
<App>
  <DatePicker
    inline
    disabledDates="{{from: '05/20/2024', to: '05/25/2024'}}"
    initialValue="05/18/2024" />
</App>
```

```xmlui-pg copy display name="Example: Disable dates before today" height="440px"
<App>
  <DatePicker
    inline
    disabledDates="{{before: getDate()}}"
    intialValue="{getDate()}"/>
</App>
```

```xmlui-pg copy display name="Example: Disable dates today and after" height="440px"
<App>
  <DatePicker
    inline
    disabledDates="{[getDate(), {after: getDate()}]}"
    intialValue="{getDate()}"/>
</App>
```


```xmlui-pg copy display name="Example: Complex combination" height="440px"
<App>
  <DatePicker
    inline
    disabledDates="{[
    {dayOfWeek: [0, 6]},
    {from: '12/24/2024', to: '12/26/2024'},
    '01/01/2025']}"
    initialValue="12/20/2024"
/>
</App>
```

%-PROP-END

%-EVENT-START didChange

Write in the input field and see how the `Text` underneath it is updated in parallel.

```xmlui-pg copy {2} display name="Example: didChange" height="520px"
<App var.field="(none)">
  <Text value="{field}" />
  <DatePicker
    inline
    initialValue="{field}"
    onDidChange="(val) => field = val" />
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

Clicking on the `DatePicker` in the example demo changes the label text.
Note how clicking elsewhere resets the text to the original.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus" height="540px"
<App var.isFocused="false">
  <Text value="{isFocused === true
    ? 'DatePicker focused' : 'DatePicker lost focus'}"
  />
  <DatePicker
    onGotFocus="isFocused = true"
    onLostFocus="isFocused = false"
  />
</App>
```

%-EVENT-END

