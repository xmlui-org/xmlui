%-DESC-START

**Key features:**
- **Time format support**: 12-hour and 24-hour formats with customizable display
- **Precision control**: Configure precision for hours, minutes, and seconds
- **Input validation**: Real-time validation with visual feedback for invalid times
- **Accessibility**: Full keyboard navigation and screen reader support
- **Localization**: Automatic AM/PM labels based on user locale

%-DESC-END

%-API-START setValue

```xmlui-pg copy {3, 9, 12} display name="Example: setValue" height="500px"
<App>
  <HStack>
    <Button
      label="Set Time to 14:30"
      onClick="picker.setValue('14:30')" />
    <Button
      label="Remove Time"
      onClick="picker.setValue('')" />
  </HStack>
  <TimePicker id="picker" />
</App>
```

%-API-END

%-PROP-START initialValue

```xmlui-pg copy display name="Example: initialValue" height="120px"
<App>
  <TimePicker initialValue="14:30:15" />
</App>  
```

%-PROP-END

%-PROP-START placeholder

```xmlui-pg copy display name="Example: placeholder" height="120px"
<App>
  <TimePicker placeholder="Select a time" />
</App>  
```

%-PROP-END

%-PROP-START enabled

```xmlui-pg copy display name="Example: enabled" height="120px"
<App>
  <TimePicker enabled="false" initialValue="14:30" />
</App>  
```

%-PROP-END

%-PROP-START validationStatus

| Value     | Description                                           |
| :-------- | :---------------------------------------------------- |
| `valid`   | Visual indicator for an input that is accepted        |
| `warning` | Visual indicator for an input that produced a warning |
| `error`   | Visual indicator for an input that produced an error  |

```xmlui-pg copy display name="Example: validationStatus" height="200px"
<App>
  <TimePicker validationStatus="valid" initialValue="14:30" />
  <TimePicker validationStatus="warning" initialValue="14:30" />
  <TimePicker validationStatus="error" initialValue="14:30" />
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

```xmlui-pg copy display name="Example: format" height="200px"
<App>
  <TimePicker format="H:mm" initialValue="14:30" />
  <TimePicker format="h:mm a" initialValue="14:30" />
  <TimePicker format="HH:mm:ss" initialValue="14:30:15" />
</App>
```

%-PROP-END

%-PROP-START maxDetail

Controls the precision of time selection and which input fields are shown.

| Value    | Description                          | Displayed Fields |
| :------- | :----------------------------------- | :--------------- |
| `hour`   | Only hours are editable              | Hours only       |
| `minute` | Hours and minutes are editable       | Hours, Minutes   |
| `second` | Hours, minutes, and seconds editable | Hours, Minutes, Seconds |

```xmlui-pg copy display name="Example: maxDetail" height="200px"
<App>
  <TimePicker maxDetail="hour" initialValue="14:30:15" />
  <TimePicker maxDetail="minute" initialValue="14:30:15" />
  <TimePicker maxDetail="second" initialValue="14:30:15" />
</App>
```

%-PROP-END

%-PROP-START minTime

Sets the minimum selectable time. Times before this value will be invalid.

```xmlui-pg copy display name="Example: minTime" height="120px"
<App>
  <TimePicker minTime="09:00" initialValue="08:30" />
</App>
```

%-PROP-END

%-PROP-START maxTime

Sets the maximum selectable time. Times after this value will be invalid.

```xmlui-pg copy display name="Example: maxTime" height="120px"
<App>
  <TimePicker maxTime="17:00" initialValue="18:30" />
</App>
```

%-PROP-END

%-PROP-START clearable

When enabled, shows a clear button (×) that allows users to reset the time value to empty.

```xmlui-pg copy display name="Example: clearable" height="120px"
<App>
  <TimePicker clearable="true" initialValue="14:30" />
</App>
```

%-PROP-END

%-PROP-START required

Marks the time input as required for form validation.

```xmlui-pg copy display name="Example: required" height="120px"
<App>
  <TimePicker required="true" />
</App>
```

%-PROP-END

%-PROP-START readOnly

Makes the time picker read-only. Users can see the value but cannot modify it.

```xmlui-pg copy display name="Example: readOnly" height="120px"
<App>
  <TimePicker readOnly="true" initialValue="14:30" />
</App>
```

%-PROP-END

%-PROP-START startIcon

Adds an icon at the start (left side) of the time picker input.

```xmlui-pg copy display name="Example: startIcon" height="120px"
<App>
  <TimePicker startIcon="clock" initialValue="14:30" />
</App>
```

%-PROP-END

%-PROP-START endIcon

Adds an icon at the end (right side) of the time picker input.

```xmlui-pg copy display name="Example: endIcon" height="120px"
<App>
  <TimePicker endIcon="clock" initialValue="14:30" />
</App>
```

%-PROP-END

%-PROP-START startText

Adds text at the start (left side) of the time picker input.

```xmlui-pg copy display name="Example: startText" height="120px"
<App>
  <TimePicker startText="Time:" initialValue="14:30" />
</App>
```

%-PROP-END

%-PROP-START endText

Adds text at the end (right side) of the time picker input.

```xmlui-pg copy display name="Example: endText" height="120px"
<App>
  <TimePicker endText="hrs" initialValue="14:30" />
</App>
```

%-PROP-END

%-EVENT-START didChange

Fired when the time value changes. Receives the new time value as a parameter.

```xmlui-pg copy {2} display name="Example: didChange" height="180px"
<App var.selectedTime="No time selected">
  <Text value="{selectedTime}" />
  <TimePicker 
    initialValue="14:30" 
    onDidChange="(time) => selectedTime = time || 'No time selected'" />
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

Fired when the time picker receives focus.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus" height="180px"
<App var.isFocused="false">
  <Text value="{isFocused === true 
    ? 'TimePicker focused' : 'TimePicker lost focus'}" 
  />
  <TimePicker
    onGotFocus="isFocused = true"
    onLostFocus="isFocused = false"
    initialValue="14:30"
  />
</App>
```

%-EVENT-END

%-EVENT-START invalidTime

Fired when the user enters an invalid time value.

```xmlui-pg copy {2} display name="Example: invalidTime" height="180px"
<App var.errorMessage="">
  <Text value="{errorMessage}" />
  <TimePicker 
    onInvalidTime="(error) => errorMessage = 'Invalid time entered'"
    onDidChange="errorMessage = ''" />
</App>
```

%-EVENT-END
