%-DESC-START

Use `FocusScope` when you build a custom overlay, popover-like panel, or inline
editor that should temporarily own keyboard focus. Built-in components such as
`ModalDialog` and `Drawer` already manage their own focus behavior; `FocusScope`
is for custom surfaces assembled from lower-level components.

To try the example, tab through the controls. Focus cycles inside the scoped
panel instead of moving to the button after it.

```xmlui-pg copy display height="320px" name="Example: trap focus in a panel"
<App>
  <VStack gap="$space-4">
    <FocusScope>
      <VStack padding="$space-4" gap="$space-3" border="1px solid $borderColor">
        <H3>Edit status</H3>
        <Select initialValue="open">
          <Option value="open" label="Open" />
          <Option value="closed" label="Closed" />
        </Select>
        <HStack>
          <Button label="Cancel" />
          <Button label="Save" />
        </HStack>
      </VStack>
    </FocusScope>

    <Button label="Outside scope" />
  </VStack>
</App>
```

%-DESC-END

By default, `Tab` and `Shift+Tab` cycle through focusable children inside the
scope. When the scope unmounts, focus returns to the element that was focused
before the scope opened.

%-PROP-START restore

Click **Edit customer**, then click **Cancel** or **Save**. Focus returns to
the button that opened the scope.

```xmlui-pg copy display height="360px" name="Example: restore focus on close"
<App>
  <Fragment var.editing="{false}">
    <Button label="Edit customer" onClick="editing = true" />

    <FocusScope when="{editing}" restore="true">
      <VStack padding="$space-4" gap="$space-3" border="1px solid $borderColor">
        <H3>Edit customer</H3>
        <TextBox label="Name" initialValue="Ada Lovelace" />
        <TextBox label="Email" initialValue="ada@example.com" />
        <HStack>
          <Button label="Cancel" onClick="editing = false" />
          <Button label="Save" onClick="editing = false" />
        </HStack>
      </VStack>
    </FocusScope>
  </Fragment>
</App>
```

%-PROP-END

Set `trap="false"` when you only want initial focus and focus restoration, but
do not want to keep keyboard navigation inside the scope.

%-PROP-START trap

```xmlui-pg copy display height="260px" name="Example: focus without trapping"
<App>
  <VStack gap="$space-4">
    <FocusScope trap="false" autoFocus="true" restore="true">
      <VStack padding="$space-4" border="1px solid $borderColor">
        <TextBox label="Quick note" />
        <Button label="Add note" />
      </VStack>
    </FocusScope>

    <Button label="Outside scope" />
  </VStack>
</App>
```

%-PROP-END
