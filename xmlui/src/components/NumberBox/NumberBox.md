%-DESC-START

**Key features:**
- **Flexible numeric input**: Accepts integers, floating-point numbers, or empty values (stored as null)
- **Input constraints**: Configure minimum/maximum values, integer-only mode, and positive-only restrictions
- **Spinner buttons**: Built-in increment/decrement buttons with customizable step values and icons
- **Visual adornments**: Add icons or text to the start and end of the input field
- **Validation**: Built-in validation status indicators and form compatibility
- **Smart paste handling**: Only accepts pasted content that results in valid numeric values

The `NumberBox` is often used in forms. See the [this guide](/docs/guides/forms) for details.

%-DESC-END

%-PROP-START autoFocus

If this boolean prop is set to true, the `NumberBox` input will be focused when appearing on the UI.

%-PROP-END

%-PROP-START enabled

Controls whether the input field is enabled (`true`) or disabled (`false`).

```xmlui-pg copy display name="Example: enabled"
<App>
  <NumberBox enabled="false" />
</App>
```

%-PROP-END

%-PROP-START endIcon

This string prop enables the display of an icon on the right side (left-to-right display) of the input field by providing a valid [icon name]().

```xmlui-pg copy display name="Example: endIcon"
<App>
  <NumberBox endIcon="email" />
</App>
```

It is possible to set the other adornments as well: [`endText`](#endtext), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <NumberBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

%-PROP-END

%-PROP-START endText

This string prop enables the display of a custom string on the right side (left-to-right display) of the input field.

```xmlui-pg copy display name="Example: endText"
<App>
  <NumberBox endText=".com" />
</App>
```

It is possible to set the other adornments as well: [`endIcon`](#endicon), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <NumberBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

%-PROP-END

%-PROP-START hasSpinBox

```xmlui-pg copy display name="Example: hasSpinBox"
<App>
  <NumberBox hasSpinBox="true" initialValue="3" />
  <NumberBox hasSpinBox="false" initialValue="34" />
</App>
```

%-PROP-END

%-PROP-START initialValue

The initial value displayed in the input field.

```xmlui-pg copy display name="Example: initialValue"
<App>
  <NumberBox initialValue="123" />
</App>
```

%-PROP-END

%-PROP-START integersOnly

```xmlui-pg copy display name="Example: integersOnly"
<App>
  <NumberBox integersOnly="true" initialValue="42" />
  <NumberBox integersOnly="false" initialValue="{Math.PI}" />
</App>
```

%-PROP-END

%-PROP-START maxValue

The maximum value the input field allows.
Can be a float or an integer if [`integersOnly`](#integersonly) is set to `false`,
otherwise it can only be an integer.

Try to enter a bigger value into the input field below than the maximum allowed.

```xmlui-pg copy display name="Example: maxValue"
<App>
  <NumberBox maxValue="100" initialValue="99" />
</App>
```

%-PROP-END

%-PROP-START minValue

Try to enter a bigger value into the input field below than the minimum allowed.

```xmlui-pg copy display name="Example: minValue"
<App>
  <NumberBox minValue="-100" initialValue="-99" />
</App>
```

%-PROP-END

%-PROP-START placeholder

A placeholder text that is visible in the input field when its empty.

```xmlui-pg copy display name="Example: placeholder"
<App>
  <NumberBox placeholder="This is a placeholder" />
</App>
```

%-PROP-END

%-PROP-START step

The default stepping value is **1**.

Note that only integers are allowed to be entered.

```xmlui-pg copy display name="Example: step"
<App>
  <NumberBox initialValue="10" step="10" />
</App>
```

%-PROP-END

%-PROP-START readOnly

If true, the component's value cannot be modified with user interactions.

```xmlui-pg copy display name="Example: readOnly"
<App>
  <NumberBox initialValue="123" readOnly="true" />
</App>
```

%-PROP-END

%-PROP-START startIcon

This string prop enables the display of an icon on the left side (left-to-right display) of the input field by providing a valid [icon name]().

```xmlui-pg copy display name="Example: startIcon"
<App>
  <NumberBox startIcon="hyperlink" />
</App>
```

It is possible to set the other adornments as well: [`endText`](#endtext), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <NumberBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

%-PROP-END

%-PROP-START startText

This string prop enables the display of a custom string on the left side (left-to-right display) of the input field.

```xmlui-pg copy display name="Example: startText"
<App>
  <NumberBox startText="www." />
</App>
```

It is possible to set the other adornments as well: [`endIcon`](#endicon), [`startIcon`](#starticon) and [`endText`](#endtext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <NumberBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

%-PROP-END

%-PROP-START validationStatus

This prop is used to visually indicate status changes reacting to form field validation.

| Value     | Description                                           |
| :-------- | :---------------------------------------------------- |
| `valid`   | Visual indicator for an input that is accepted        |
| `warning` | Visual indicator for an input that produced a warning |
| `error`   | Visual indicator for an input that produced an error  |

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <NumberBox />
  <NumberBox validationStatus="valid" />
  <NumberBox validationStatus="warning" />
  <NumberBox validationStatus="error" />
</App>
```

%-PROP-END

%-PROP-START zeroOrPositive

This boolean property determines whether the input value can only be 0 or positive numbers (`true`) or also negative (`false`).
By default, this property is set to `false`.

```xmlui-pg copy display name="Example: zeroOrPositive"
<App>
  <NumberBox initialValue="123" zeroOrPositive="true" />
</App>
```

%-PROP-END

%-API-START value

You can query this read-only API property to get the input component's current value.

See an example in the `setValue` API method.

%-API-END

%-API-START setValue

You can use this method to set the component's current value programmatically.

```xmlui-pg copy {3, 9, 12} display name="Example: value and setValue"
<App>
  <NumberBox
    id="numberbox"
    readOnly="true"
  />
  <HStack>
    <Button
      label="Set to 100"
      onClick="numberbox.setValue(100)" />
    <Button
      label="Set to 0"
      onClick="numberbox.setValue(0)" />
  </HStack>
</App>
```

%-API-END

%-EVENT-START didChange

This event is triggered after the user has changed the field value.

Write in the input field and see how the `Text` underneath it is updated in parallel.

```xmlui-pg copy {2} display name="Example: didChange"
<App var.field="0">
  <NumberBox initialValue="{field}" onDidChange="(val) => field = val" />
  <Text value="{field}" />
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

This event is triggered when the `NumberBox` receives focus. The following sample demonstrates this event.

```xmlui-pg
---app copy {3-4} display name="Example: gotFocus"
<App var.focused="{false}">
  <NumberBox
    onGotFocus="focused = true"
    onLostFocus="focused = false" />
  <Text>The NumberBox is {focused ? '' : 'not'} focused</Text>
</App>
---desc
Click into the `NumberBox` (and then click the text below):
```

%-EVENT-END

%-EVENT-START lostFocus

This event is triggered when the `NumberBox` loses focus.

(See the example above)

%-EVENT-END
