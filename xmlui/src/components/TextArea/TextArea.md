%-DESC-START

It is often used in forms, see [this guide](/docs/guide/forms) for details.

%-DESC-END

%-PROP-START autoSize

> **Note**: If either `autoSize`, `maxRows` or `minRows` is set, the `rows` prop has no effect.

Write multiple lines in the `TextArea` in the demo below to see how it resizes automatically.

```xmlui-pg copy display name="Example: autoSize" height="240px"
<App>
  <TextArea autoSize="true" />
</App>
```

%-PROP-END

%-PROP-START enabled

```xmlui-pg copy display name="Example: enabled"
<App>
  <TextArea enabled="false" />
</App>
```

%-PROP-END

%-PROP-START enterSubmits

Press `Enter` after writing something in the `TextArea` in the demo below.
See [Using Forms](/docs/forms) for details.

```xmlui-pg copy display name="Example: enterSubmits"
<App>
  <Form onSubmit="toast.success(JSON.stringify(address.value))">
    <TextArea
      id="address"
      enterSubmits="true"
      initialValue="Suzy Queue, 4455 Landing Lange, APT 4, Louisville, KY 40018-1234" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START initialValue

The initial value displayed in the input field.

```xmlui-pg copy display name="Example: initialValue"
<App>
  <TextArea initialValue="Example text" />
</App>
```

%-PROP-END

%-PROP-START maxRows

> **Note**: If either `autoSize`, `maxRows` or `minRows` is set, the `rows` prop has no effect.

```xmlui-pg copy {3} display name="Example: maxRows" height="160px"
<App>
  <TextArea
    maxRows="3"
    initialValue="Lorem ipsum dolor sit amet,
    consectetur adipiscing elit,
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam,
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." />
</App>
```

%-PROP-END

%-PROP-START minRows

> **Note**: If either `autoSize`, `maxRows` or `minRows` is set, the `rows` prop has no effect.

```xmlui-pg copy display name="Example: minRows" height="200px"
<App>
  <TextArea minRows="3" initialValue="Lorem ipsum dolor sit amet..." />
</App>
```

%-PROP-END

%-PROP-START placeholder

```xmlui-pg copy display name="Example: placeholder"
<App>
  <TextArea placeholder="This is a placeholder" />
</App>
```

%-PROP-END

%-PROP-START readOnly

```xmlui-pg copy display name="Example: readOnly"
<App>
  <TextArea initialValue="Example text" readOnly="{true}" />
</App>
```

%-PROP-END

%-PROP-START resize

If you allow resizing, the `TextArea` turns off automatic sizing.

When you allow vertical resizing, you can limit the sizable range according to `minRows` and `maxRows`.

Drag the small resize indicators at the bottom right on each of the controls in the demo.

```xmlui-pg copy display name="Example: resize" height="300px"
<App>
  <TextArea resize="vertical" minRows="1" maxRows="8" />
  <TextArea resize="both" />
</App>
```

%-PROP-END

%-PROP-START rows

> **Note**: If either `autoSize`, `maxRows` or `minRows` is set, the `rows` prop has no effect.

```xmlui-pg copy display name="Example: rows"
<App>
  <TextArea rows="10" />
</App>
```

%-PROP-END

%-PROP-START validationStatus

This prop is used to visually indicate status changes reacting to form field validation.

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <TextArea />
  <TextArea validationStatus="valid" />
  <TextArea validationStatus="warning" />
  <TextArea validationStatus="error" />
</App>
```

%-PROP-END

%-EVENT-START didChange

Write in the input field and see how the `Text` underneath it is updated in parallel.

```xmlui-pg copy display name="Example: didChange"
<App var.field="">
  <TextArea 
    initialValue="{field}" 
    onDidChange="(val) => field = val" 
  />
  <Text value="{field}" />
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

Clicking on the `TextArea` in the example demo changes the label text.
Note how clicking elsewhere resets the text to the original.

```xmlui-pg copy display name="Example: gotFocus/lostFocus"
<App>
  <TextArea
    initialValue="{focused === true ? 'I got focused!' : 'I lost focus...'}"
    onGotFocus="focused = true"
    onLostFocus="focused = false"
    var.focused="{false}" />
</App>
```

%-EVENT-END

%-API-START focus

```xmlui-pg copy display name="Example: focus"
<App>
  <Button label="Trigger Focus" onClick="inputComponent.focus()" />
  <TextArea id="inputComponent" />
</App>
```

%-API-END

%-API-START value

In the example below, typing in the `TextArea` will also display the length of the text typed into it above the field:

```xmlui-pg copy display name="Example: value"
<App>
  <Text value="TextArea content length: {inputComponent.value.length}" />
  <TextArea id="inputComponent" />
</App>
```

%-API-END

%-API-START setValue

```xmlui-pg copy display name="Example: setValue"
<App var.changes="">
  <TextArea
    id="inputField"
    readOnly="true"
    onDidChange="changes++" />
  <HStack>
    <Button
      label="Check"
      onClick="inputField.setValue('example ')" />
    <Text value="Number of changes: {changes}" />
  </HStack>
</App>
```

%-API-END
