%-DESC-START

**Key features:**
- **Time format support**: 12-hour and 24-hour formats with customizable display
- **Precision control**: Configure precision for hours, minutes, and seconds
- **Input validation**: Real-time validation with visual feedback for invalid times
- **Accessibility**: Full keyboard navigation and screen reader support
- **Localization**: Automatic AM/PM labels based on user locale

%-DESC-END

%-API-START setValue

```xmlui-pg copy {3, 9, 12} display name="Example: setValue"
<App>
  <HStack>
    <Button
      label="Set Time to 14:30"
      onClick="picker.setValue('14:30')" />
    <Button
      label="Remove Time"
      onClick="picker.setValue('')" />
  </HStack>
  <TimeInput id="picker" />
</App>
```

%-API-END

%-PROP-START initialValue

```xmlui-pg copy display name="Example: initialValue" height="120px"
<App>
  <TimeInput initialValue="14:30:15" />
</App>  
```

%-PROP-END

%-PROP-START placeholder

```xmlui-pg copy display name="Example: placeholder" height="120px"
<App>
  <TimeInput placeholder="Select a time" />
</App>  
```

%-PROP-END

%-PROP-START enabled

```xmlui-pg copy display name="Example: enabled" height="120px"
<App>
  <TimeInput enabled="false" initialValue="14:30" />
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
  <TimeInput validationStatus="valid" initialValue="11:30" />
  <TimeInput validationStatus="warning" initialValue="11:30" />
  <TimeInput validationStatus="error" initialValue="11:30" />
</App>
```

%-PROP-END

%-PROP-START format

The `format` prop controls how time is displayed and which parts are editable. Based on Unicode Technical Standard #35.

| Format | Description | Example |
| :----- | :---------- | :------ |
| `H:mm` | 24-hour format with hours and minutes | 14:30 |
| `HH:mm:ss` | 24-hour format with hours, minutes, seconds | 14:30:15 |
| `h:mm a` | 12-hour format with AM/PM | 2:30 PM |
| `hh:mm:ss a` | 12-hour format with seconds and AM/PM | 02:30:15 PM |

```xmlui-pg copy display name="Example: format"
<App>
  <TimeInput format="H:mm" initialValue="14:30" />
  <TimeInput format="h:mm a" initialValue="14:30" />
  <TimeInput format="HH:mm:ss" initialValue="14:30:15" />
  <TimeInput format="HH:mm:ss a" initialValue="14:30:15" />
</App>
```

%-PROP-END

%-PROP-START clearable

When enabled, it displays a clear button that allows users to reset the time picker back to its initial value. Change the time value in this app and then click the clear button:

```xmlui-pg copy display name="Example: clearable" /clearable/
<App>
  <TimeInput initialValue="11:30" />
  <TimeInput clearable="true" initialValue="10:20" />
</App>
```

%-PROP-END

%-PROP-START clearIcon

```xmlui-pg copy display name="Example: clearIcon" /clearIcon/
<App>
  <TimeInput initialValue="11:30" clearIcon="trash" />
</App>
```

%-PROP-END

%-PROP-START required

Marks the time input as required for form validation.

```xmlui-pg copy display name="Example: required" height="120px"
<App>
  <TimeInput required="true" />
</App>
```

%-PROP-END

%-PROP-START readOnly

Makes the time picker read-only. Users can see the value but cannot modify it.

```xmlui-pg copy display name="Example: readOnly" height="120px"
<App>
  <TimeInput readOnly="true" initialValue="14:30" />
</App>
```

%-PROP-END

%-EVENT-START didChange

Fired when the time value changes. Receives the new time value as a parameter.

> [!INFO] The time value changes when the edited input part (hour, minute, second) loses focus or the AM/PM selectro changes.

```xmlui-pg copy {2} display name="Example: didChange" height="180px"
<App var.selectedTime="No time selected">
  <Text value="{selectedTime}" />
  <TimeInput 
    format="h:m:s a"
    initialValue="07:30:05" 
    onDidChange="(time) => selectedTime = time" />
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

Fired when the time picker receives focus.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus"
<App var.isFocused="{false}">
  <Text value="{isFocused 
    ? 'TimeInput focused' : 'TimeInput lost focus'}" 
  />
  <TimeInput
    format="HH:mm:ss a"
    onGotFocus="isFocused = true"
    onLostFocus="isFocused = false"
    initialValue="14:30"
  />
</App>
```

%-EVENT-END

%-EVENT-START invalidTime

Fired when the user enters an invalid time value.

```xmlui-pg copy {2} display name="Example: invalidTime"
<App var.errorMessage="">
  <Text value="{errorMessage}" />
  <TimeInput 
    onInvalidTime="(error) => errorMessage = 'Invalid time entered'"
    onDidChange="errorMessage = ''" />
</App>
```

%-EVENT-END
