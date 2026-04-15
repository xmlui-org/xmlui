# Delegate a method

Forward a user-defined component's API surface to an internal built-in component using `method.` attributes.

A `TaskDialog` component wraps a `ModalDialog` internally. The parent needs to open and close it by calling `taskDialog.open()` and `taskDialog.close()`, but it should not reach inside the component to talk to the `ModalDialog` directly. The `method.` shorthand on `<Component>` wires those two names to the internal dialog calls with no JavaScript required.

```xmlui-pg copy display name="TaskDialog with delegated open and close methods" height="400px"
---app display /method\./ /MyModalWrapper/
<App>
  <Button label="Open Task" onClick="taskDialog.open()" />
  <TaskDialog id="taskDialog" title="Fix login bug" assignee="Alice" />
</App>
---comp display /method\./ TaskDialog
<Component
  name="TaskDialog"
  method.open="internalModal.open()"
  method.close="internalModal.close()"
>
  <ModalDialog id="internalModal" title="{$props.title ?? 'Task'}">
    <VStack>
      <Text variant="strong">{ $props.title }</Text>
      <Text>Assigned to: { $props.assignee }</Text>
      <Button label="Close" onClick="internalModal.close()" />
    </VStack>
  </ModalDialog>
</Component>
```

## Key points

**`method.` attribute shorthand**: Declare a delegated method directly on the `<Component>` tag as `method.<name>="<expression>"`. The expression is evaluated when the method is called from the parent — typically a single built-in component API call:

```xmlui
<Component
  name="TaskDialog"
  method.open="internalModal.open()"
  method.close="internalModal.close()"
>
```

**No JavaScript needed**: Delegation is pure attribute syntax. The component definition stays clean and readable — there is no `<method>` block or script to maintain.

**Calling delegated methods from the parent**: Give the component an `id` and call the method as a normal function on that reference:

```xmlui
<Button onClick="taskDialog.open()" />
<Button onClick="taskDialog.close()" />
<TaskDialog id="taskDialog" />
```

**`method.` vs `<method>` — same semantics, different syntax**: The two forms are equivalent. `method.` is a compact attribute shorthand best suited to a single expression; `<method>` is the element form that fits multi-line bodies more naturally. Use whichever reads more clearly (see [Expose a method from a component](/docs/howto/expose-a-method-from-a-component)):

```xmlui
<!-- attribute shorthand — concise for one-liners -->
<Component name="TaskDialog"
  method.open="internalModal.open()"
  method.close="internalModal.close()"
>

<!-- element form — the same thing, easier to read when the body grows -->
<Component name="TaskDialog">
  <method name="open">internalModal.open();</method>
  <method name="close">internalModal.close();</method>
</Component>
```