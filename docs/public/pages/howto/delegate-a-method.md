# Delegate a method

Use `method.` attributes to directly delegate to internal component methods:

```xmlui-pg height="350px"
---app display
<App>
  <H3>Method Delegation Example</H3>

  <Button
    label="Open Modal"
    onClick="myModal.openDialog()" />

  <MyModalWrapper id="myModal" title="Hello World!" />
</App>

---comp display
<Component
  name="MyModalWrapper"
  method.openDialog="internalModal.open()"
  method.close="internalModal.close()">

  <ModalDialog
    id="internalModal"
    title="{$props.title}"
    maxWidth="400px">
    <VStack>
      <Text>This uses method.openDialog="internalModal.open()"</Text>
      <Text>Direct delegation - no custom logic needed</Text>

      <Button
        label="Close"
        onClick="internalModal.close()" />
    </VStack>
  </ModalDialog>
</Component>
```

**Use delegation when**: You want to expose internal methods directly without adding custom logic.

**Pros**: Simple, no JavaScript needed, clean syntax

**Cons**: No custom logic, just passes through calls

**See also**: [Expose a method from a component](/howto/expose-a-method-from-a-component) for adding custom logic to methods.