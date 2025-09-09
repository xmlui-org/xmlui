%-DESC-START

**Key features:**
- **Date format support**: Multiple date formats including MM/dd/yyyy, yyyy-MM-dd, and dd/MM/yyyy
- **Direct input**: Keyboard-only date entry with input fields for day, month, and year
- **Input validation**: Real-time validation with visual feedback for invalid dates
- **Range support**: Single date selection (default) or date range selection
- **Accessibility**: Full keyboard navigation and screen reader support

%-DESC-END

%-API-START setValue

```xmlui-pg copy {3, 9, 12} display name="Example: setValue"
<App>
  <HStack>
    <Button
      label="Set Date to 05/25/2024"
      onClick="picker.setValue('05/25/2024')" />
    <Button
      label="Clear Date"
      onClick="picker.setValue('')" />
  </HStack>
  <DateInput id="picker" />
</App>
```

%-API-END

%-PROP-START initialValue

```xmlui-pg copy display name="Example: initialValue" height="120px"
<App>
  <DateInput initialValue="05/25/2024" />
</App>  
```

%-PROP-END

%-PROP-START enabled

```xmlui-pg copy display name="Example: enabled" height="120px"
<App>
  <DateInput enabled="false" initialValue="05/25/2024" />
</App>  
```

%-PROP-END

%-PROP-START validationStatus

| Value     | Description                                           |
| :-------- | :---------------------------------------------------- |
| `valid`   | Visual indicator for an input that is accepted        |
| `warning` | Visual indicator for an input that produced a warning |
| `error`   | Visual indicator for an input that produced an error  |

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <DateInput validationStatus="valid" initialValue="05/25/2024" />
  <DateInput validationStatus="warning" initialValue="05/25/2024" />
  <DateInput validationStatus="error" initialValue="05/25/2024" />
</App>
```

%-PROP-END

%-PROP-START dateFormat

The `dateFormat` prop controls how dates are displayed and entered. Different formats change the order and separators of day, month, and year fields.

> [!NOTE] Regardless of the dateFormat, the year input field always accepts and displays 4-digit years. When entering a 2-digit year, it will be automatically normalized to a 4-digit year.

| Format | Description | Example |
| :----- | :---------- | :------ |
| `MM/dd/yyyy` | US format with slashes | 05/25/2024 |
| `MM-dd-yyyy` | US format with dashes | 05-25-2024 |
| `yyyy/MM/dd` | ISO-like format with slashes | 2024/05/25 |
| `yyyy-MM-dd` | ISO format with dashes | 2024-05-25 |
| `dd/MM/yyyy` | European format with slashes | 25/05/2024 |
| `dd-MM-yyyy` | European format with dashes | 25-05-2024 |
| `yyyyMMdd` | Compact format without separators | 20240525 |
| `MMddyyyy` | US compact format | 05252024 |

```xmlui-pg copy display name="Example: dateFormat"
<App>
  <DateInput dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />
  <DateInput dateFormat="yyyy-MM-dd" initialValue="2024-05-25" />
  <DateInput dateFormat="dd/MM/yyyy" initialValue="25/05/2024" />
  <DateInput dateFormat="yyyyMMdd" initialValue="20240525" />
</App>
```

%-PROP-END

%-PROP-START clearable

When enabled, it displays a clear button that allows users to reset the date input back to its initial value. Enter a date in this app and then click the clear button:

```xmlui-pg copy display name="Example: clearable" /clearable/
<App>
  <DateInput initialValue="05/25/2024" />
  <DateInput clearable="true" initialValue="05/25/2024" />
</App>
```

%-PROP-END

%-PROP-START clearIcon

```xmlui-pg copy display name="Example: clearIcon" /clearIcon/
<App>
  <DateInput initialValue="05/25/2024" clearable="true" clearIcon="trash" />
</App>
```

%-PROP-END

%-PROP-START clearToInitialValue

When `true`, the clear button resets the input to its initial value. When `false`, it clears the input completely.

```xmlui-pg copy display name="Example: clearToInitialValue"
<App>
  <DateInput clearable="true" clearToInitialValue="true" initialValue="05/25/2024" />
  <DateInput clearable="true" clearToInitialValue="false" initialValue="05/25/2024" />
</App>
```

%-PROP-END

%-PROP-START mode

Available values:

| Value | Description |
| --- | --- |
| `single` | Single date selection **(default)** |
| `range` | Date range selection |

%-PROP-END

%-PROP-START required

Marks the date input as required for form validation.

```xmlui-pg copy display name="Example: required" height="120px"
<App>
  <DateInput required="true" />
</App>
```

%-PROP-END

%-PROP-START readOnly

Makes the date input read-only. Users can see the value but cannot modify it.

```xmlui-pg copy display name="Example: readOnly" height="120px"
<App>
  <DateInput readOnly="true" initialValue="05/25/2024" />
</App>
```

%-PROP-END

%-PROP-START emptyCharacter

Character to use as placeholder for empty date values. If longer than 1 character, uses the first character. Defaults to '-'.

```xmlui-pg copy display name="Example: emptyCharacter"
<App>
  <DateInput emptyCharacter="." />
  <DateInput emptyCharacter="*" />
  <DateInput emptyCharacter="abc" />
</App>
```

%-PROP-END

%-EVENT-START didChange

Fired when the date value changes. Receives the new date value as a parameter.

> [!INFO] The date value changes when the edited input part (day, month, year) loses focus and contains a valid value.

```xmlui-pg copy {2} display name="Example: didChange" height="180px"
<App var.selectedDate="No date selected">
  <Text value="{selectedDate}" />
  <DateInput 
    dateFormat="yyyy-MM-dd"
    initialValue="2024-05-25" 
    onDidChange="(date) => selectedDate = date" />
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

Fired when the date input receives focus.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus"
<App var.isFocused="{false}">
  <Text value="{isFocused 
    ? 'DateInput focused' : 'DateInput lost focus'}" 
  />
  <DateInput
    dateFormat="MM/dd/yyyy"
    onGotFocus="isFocused = true"
    onLostFocus="isFocused = false"
    initialValue="05/25/2024"
  />
</App>
```

%-EVENT-END
