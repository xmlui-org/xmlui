%-DESC-START

**Key features:**
- **Visual enhancements**: Add icons and text at start/end positions for context and branding
- **Validation states**: Built-in visual indicators for valid, warning, and error states
- **Input control**: Support for initial values, programmatic focus, and value setting

Often used in forms, see [this guide](/forms) for details.

%-DESC-END

%-PROP-START placeholder

```xmlui-pg copy display name="Example: placeholder"
<App>
  <TextBox placeholder="This is a placeholder" />
</App>
```

%-PROP-END

%-PROP-START initialValue

```xmlui-pg copy display name="Example: initialValue"
<App>
  <TextBox initialValue="Example text" />
</App>
```

%-PROP-END

%-PROP-START maxLength

Try to enter a longer value into the input field below.

```xmlui-pg copy display name="Example: maxLength"
<App>
  <TextBox maxLength="16" />
</App>
```

%-PROP-END

%-PROP-START readOnly

```xmlui-pg copy display name="Example: readOnly"
<App>
  <TextBox initialValue="Example text" readOnly="true" />
</App>
```

%-PROP-END

%-PROP-START enabled

```xmlui-pg copy display name="Example: enabled"
<App>
  <TextBox enabled="false" />
</App>
```

%-PROP-END

%-PROP-START validationStatus

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <TextBox />
  <TextBox validationStatus="valid" />
  <TextBox validationStatus="warning" />
  <TextBox validationStatus="error" />
</App>
```

%-PROP-END

%-PROP-START startText

```xmlui-pg copy display name="Example: startText"
<App>
  <TextBox startText="www." />
</App>
```

It is possible to set the other adornments as well: [`endIcon`](#endicon), [`startIcon`](#starticon) and [`endText`](#endtext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <TextBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

%-PROP-END

%-PROP-START startIcon

```xmlui-pg copy display name="Example: startIcon"
<App>
  <TextBox startIcon="hyperlink" />
</App>
```

It is possible to set the other adornments as well: [`endText`](#endtext), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <TextBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

%-PROP-END

%-PROP-START endText

```xmlui-pg copy display name="Example: endText"
<App>
  <TextBox endText=".com" />
</App>
```

It is possible to set the other adornments as well: [`endIcon`](#endicon), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <TextBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

%-PROP-END

%-PROP-START endIcon

```xmlui-pg copy display name="Example: endIcon"
<App>
  <TextBox endIcon="email" />
</App>
```

It is possible to set the other adornments as well: [`endText`](#endtext), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <TextBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

%-PROP-END

%-EVENT-START didChange

Write in the input field and see how the `Text` underneath it is updated in parallel.

```xmlui-pg copy {3} display name="Example: didChange"
<App var.field="">
  <TextBox initialValue="{field}" onDidChange="(val) => field = val" />
  <Text value="{field}" />
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

Clicking on the `TextBox` in the example demo changes the label text.
Note how clicking elsewhere resets the text to its original.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus"
<App>
  <TextBox
    initialValue="{focused === true ? 'I got focused!' : 'I lost focus...'}"
    onGotFocus="focused = true"
    onLostFocus="focused = false"
    var.focused="{false}"
  />
</App>
```

%-EVENT-END

%-API-START value

In the example below, typing in the `TextBox` will also display the length of the text typed into it above the field:

```xmlui-pg copy {2-3} display name="Example: value"
<App>
  <Text value="TextBox content length: {inputComponent.value.length}" />
  <TextBox id="inputComponent" />
</App>
```

%-API-END

%-API-START setValue

```xmlui-pg copy {10} display name="Example: setValue"
<App var.changes="">
  <TextBox
    id="inputField"
    readOnly="true"
    onDidChange="changes++"
  />
  <HStack>
    <Button
      label="Check"
      onClick="inputField.setValue('example ')"
    />
    <Text value="Number of changes: {changes}" />
  </HStack>
</App>
```

%-API-END

%-API-START focus

```xmlui-pg copy {2-3} display name="Example: focus"
<App>
  <Button label="Trigger Focus" onClick="inputComponent.focus()" />
  <TextBox id="inputComponent" />
</App>
```

%-API-END
