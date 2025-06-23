%-DESC-START

**Key features:**
- **Exclusive selection**: Only one option can be selected at a time within the group
- **Form integration**: Built-in validation states and seamless form compatibility
- **Flexible layout**: Contains [Option](/components/Option) that can be arranged in any layout structure
- **State management**: Automatically handles selection state and change events
- **Accessibility support**: Proper keyboard navigation and screen reader compatibility
- **Validation indicators**: Visual feedback for error, warning, and valid states

`RadioGroup` is often used in forms. See [this guide](/forms) for details.

%-DESC-END

%-PROP-START initialValue

This property defines the initial value of the selected option within the group.

```xmlui-pg copy display name="Example: initialValue"
<App>
  <RadioGroup initialValue="first">
    <HStack padding="$space-normal">
      <Option label="First Item" value="first"/>
      <Option label="Second Item" value="second"/>
      <Option label="Third Item" value="third"/>
    </HStack>
  </RadioGroup>
</App>
```

%-PROP-END

%-PROP-START enabled

This property indicates whether the input accepts user actions (`true`) or not (`false`). The default value is `true`.

```xmlui-pg copy display name="Example: enabled"
<App>
  <RadioGroup initialValue="first" enabled="false">
    <HStack padding="$space-normal">
      <Option label="First Item" value="first"/>
      <Option label="Second Item" value="second"/>
      <Option label="Third Item" value="third"/>
    </HStack>
  </RadioGroup>
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
  <HStack>
    <RadioGroup initialValue="first" validationStatus="error">
      <Option label="First Item" value="first"/>
      <Option label="Second Item" value="second"/>
    </RadioGroup>
    <RadioGroup initialValue="first" validationStatus="warning">
      <Option label="First Item" value="first"/>
      <Option label="Second Item" value="second"/>
    </RadioGroup>
    <RadioGroup initialValue="first" validationStatus="valid">
      <Option label="First Item" value="first"/>
      <Option label="Second Item" value="second"/>
    </RadioGroup>
  </HStack>
</App>
```

%-PROP-END

%-API-START setValue

You can use this method to set the component's current value programmatically.

```xmlui-pg copy {2, 7-8} display name="Example: value and setValue"
<App>
  <RadioGroup id="radio">
    <Option label="First Item" value="first"/>
    <Option label="Second Item" value="second"/>
  </RadioGroup>
  <HStack>
    <Button label="Set First" onClick="radio.setValue('first')" />
    <Button label="Set Second" onClick="radio.setValue('second')" />
  </HStack>
</App>
```

%-API-END

%-EVENT-START didChange

This event is triggered after the user has changed the field value. The following example uses this event to display the selected option's value:

```xmlui-pg
---app copy display name="Example: didChange"
<App var.field="">
  <RadioGroup initialValue="{field}" onDidChange="(val) => field = val">
    <Option label="First Item" value="first"/>
    <Option label="Second Item" value="second"/>
  </RadioGroup>
  <Text value="{field}" />
</App>
---desc
Select one of the available options and see how the `Text` underneath it is updated in parallel:
```

%-EVENT-END

%-STYLE-START

`RadioGroup` is a component that governs its children and stores the selected value. It does not support styling; however, you can style the options within the group. When you set the theme variables for the group's options, use the `RadioGroupOption` name.

%-STYLE-END
