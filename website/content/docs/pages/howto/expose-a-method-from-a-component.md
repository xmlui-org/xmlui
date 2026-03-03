# Expose a method from a component

Use the `<method>` element to create custom methods with JavaScript logic:

```xmlui-pg height="350px"
---app display {6}
<App>
  <H3>Custom Method Example</H3>

  <Button
    label="Open Modal"
    onClick="myModal.openDialog()" />

  <MyModalWrapper id="myModal" title="Hello World!" />
</App>
---comp display {13-16}
<Component name="MyModalWrapper">
  <ModalDialog id="internalModal" title="{$props.title}" maxWidth="400px">
    <VStack gap="$space-3" padding="$space-4">
      <Text>This uses a custom method with JavaScript logic</Text>
      <Text>Check the console for the log message</Text>

      <Button
        label="Close"
        onClick="internalModal.close()" />
    </VStack>
  </ModalDialog>

  <method name="openDialog">
    console.log('Custom method called - opening modal');
    internalModal.open();
  </method>
</Component>
```

**Use custom methods when**: You need to add logging, validation, or other logic before/after calling internal methods.

**Pros**: Full JavaScript control, can add custom logic

**Cons**: More complex, requires JavaScript knowledge

**See also**: [Delegate a method](/docs/howto/delegate-a-method) for a simpler approach without custom logic.