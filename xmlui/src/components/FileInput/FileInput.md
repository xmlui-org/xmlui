%-DESC-START

**Key features:**
- **File type filtering**: Restrict selection to specific file types using `acceptsFileType`
- **Multiple file selection**: Enable users to select multiple files simultaneously
- **Directory selection**: Allow folder selection instead of individual files
- **Customizable button**: Configure button text, icons, position, and styling to match your design

%-DESC-END


%-PROP-START acceptsFileType

```xmlui-pg copy display name="Example: acceptsFileType"
<App>
  <FileInput acceptsFileType="{['.txt', '.jpg']}" />
</App>
```

%-PROP-END

%-PROP-START buttonIcon

```xmlui-pg copy display name="Example: buttonIcon"
<App>
  <FileInput buttonIcon="drive" buttonLabel="Let there be drive" />
  <FileInput buttonIcon="drive" />
</App>
```

%-PROP-END

%-PROP-START buttonIconPosition

```xmlui-pg copy display name="Example: buttonIconPosition"
<App>
  <FileInput buttonIcon="drive" buttonLabel="End" buttonIconPosition="end" />
</App>
```

%-PROP-END

%-PROP-START buttonLabel

This property is an optional string to set a label for the button part.

```xmlui-pg copy display name="Example: label"
<App >
  <FileInput />
  <FileInput buttonLabel="I am the button label" />
</App>
```

%-PROP-END

%-PROP-START buttonSize

```xmlui-pg copy display name="Example: buttonSize"
<App>
  <FileInput buttonSize="lg" />
</App>
```

%-PROP-END

%-PROP-START buttonThemeColor

```xmlui-pg copy display name="Example: buttonThemeColor"
<App>
  <FileInput buttonThemeColor="secondary" />
</App>
```

%-PROP-END

%-PROP-START buttonVariant

```xmlui-pg copy display name="Example: buttonVariant"
<App>
  <FileInput buttonLabel="outlined" buttonVariant="outlined" />
</App>
```

%-PROP-END

%-PROP-STAR directory

```xmlui-pg copy display name="Example: directory"
<App>
  <FileInput directory="true" />
</App>
```

%-PROP-END

%-PROP-START multiple

```xmlui-pg copy display name="Example: multiple"
<App>
  <FileInput multiple="false" />
  <FileInput multiple="true" />
</App>
```

%-PROP-END

%-PROP-START validationStatus

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <FileInput />
  <FileInput validationStatus="valid" />
  <FileInput validationStatus="warning" />
  <FileInput validationStatus="error" />
</App>
```

%-EVENT-START didChange

Write in the input field and see how the `Text` underneath it is updated in accordingly.

```xmlui-pg copy {2} display name="Example: didChange"
<App var.field="">
  <FileInput onDidChange="(file) => field = file[0]?.name" />
  <Text value="{field}" />
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

Clicking on the `FileInput` in the example demo changes the label text.
Note how clicking elsewhere resets the text to the original.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus"
<App>
  <FileInput
    buttonLabel="{focused === true ? 'I got focused!' : 'I lost focus...'}"
    onGotFocus="focused = true"
    onLostFocus="focused = false"
    var.focused="{false}"
  />
</App>
```

%-EVENT-END

%-EVENT-START lostFocus

(See the example above)

%-EVENT-END

%-API-START focus

```xmlui-pg copy /fileInputComponent.focus()/ display name="Example: focus"
<App>
  <HStack>
    <Button label="Focus FileInput" onClick="fileInputComponent.focus()" />
    <FileInput id="fileInputComponent" />
  </HStack>
</App>
```

%-API-END

%-API-START open

```xmlui-pg copy /fileInputComponent.open()/ display name="Example: open"
<App>
  <HStack>
    <Button label="Open FileInput" onClick="fileInputComponent.open()" />
    <FileInput id="fileInputComponent" />
  </HStack>
</App>
```

%-API-END

%-API-START setValue

(**NOT IMPLEMENTED YET**) You can use this method to set the component's current value programmatically.

%-API-END

%-API-START value

In the example below, select a file using the file browser of the `FileInput` component
and note how the `Text` component displays the selected file's name:

```xmlui-pg copy {3-4} display name="Example: value"
<App>
  <HStack>
    <Text value="Selected file name: {fileInputComponent.value}" />
    <FileInput id="fileInputComponent" />
  </HStack>
</App>
```

%-API-END

%-STYLE-START

The `FileInput` component does not theme variables directly.
However, it uses the [`Button`](/components/Button) and [`TextBox`](/components/TextBox) components under the hood.
Thus, modifying the styles of both of these components affects the `FileInput`.

See [Button styling](/components/Button#styling) and [TextBox styling](/components/TextBox#styling).

%-STYLE-END