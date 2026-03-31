# Expose a method from a component

Use the `<method>` element to export imperative actions and state accessors from a user-defined component.

A `ModalTracker` component wraps a modal dialog and privately tracks how many times it has been opened. The parent has no direct access to that counter — it lives entirely inside the component. Two exported methods bridge the gap: `open()` increments the counter and opens the dialog, while `getOpenCount()` returns the current count so the parent can display it.

```xmlui-pg copy display name="Modal that tracks and exposes its open count" height="350px"
---app display /method/ /getOpenCount/ /openCount/
<App var.openCount="{0}">
  <HStack>
    <Button
      label="Open Modal"
      onClick="{
        tracker.open();
        openCount = tracker.getOpenCount();
      }"
    />
    <Text>Opened { openCount } time(s)</Text>
  </HStack>
  <ModalTracker id="tracker" title="Task Details" />
</App>
---comp display /method name/ ModalTracker
<Component name="ModalTracker" var.openCount="{0}">
  <ModalDialog id="internalModal" title="{$props.title ?? 'Details'}">
    <VStack>
      <Text>This dialog has been opened { openCount } time(s) in total.</Text>
      <Button label="Close" onClick="internalModal.close()" />
    </VStack>
  </ModalDialog>

  <method name="open">
    openCount++;
    internalModal.open();
  </method>

  <method name="getOpenCount">
    return openCount;
  </method>
</Component>
```

## Key points

**Declaring a method**: Add a `<method name="…">` element anywhere inside the `<Component>` definition. The body is plain JavaScript — it can read and write local variables, call other components' APIs via their `id`, and return values:

```xmlui
<Component name="ModalTracker" var.openCount="{0}">
  <ModalDialog id="internalModal" title="Details">…</ModalDialog>

  <method name="open">
    openCount++;          <!-- write internal state -->
    internalModal.open(); <!-- call a built-in component API -->
  </method>

  <method name="getOpenCount">
    return openCount;     <!-- expose internal state as a return value -->
  </method>
</Component>
```

**Calling a method from the parent**: Give the component an `id` and call the method like a regular function. The `id` registers a reference that built-in parent elements can use — it is not a `$props` value inside the component:

```xmlui
<Button onClick="tracker.open()" />
<ModalTracker id="tracker" />
```

**Reading the return value**: Assign the method call to a parent variable in the same event handler:

```xmlui
<App var.openCount="{0}">
  <Button onClick="{
    tracker.open();
    openCount = tracker.getOpenCount();
  }" />
  <Text>Opened { openCount } time(s)</Text>
  <ModalTracker id="tracker" />
</App>
```

**`<method>` vs `method.` — same semantics, different syntax**: Both forms register a named method on the component. `method.` is the compact attribute shorthand suited to a single expression; `<method>` is the element form that handles multi-line bodies more readably. Use whichever reads more clearly (see [Delegate a method](/docs/howto/delegate-a-method)):

```xmlui
<!-- element form — clear when the body spans multiple lines -->
<Component name="ModalTracker" var.openCount="{0}">
  <method name="open">
    openCount++;
    internalModal.open();
  </method>
</Component>

<!-- attribute shorthand — equally valid for a one-liner -->
<Component name="ModalTracker" var.openCount="{0}"
  method.open="{ openCount++; internalModal.open(); }"
>
```

**Internal state stays private**: The `openCount` variable is local to `ModalTracker`. The parent cannot read or write it directly — it can only access it through `getOpenCount()`. This encapsulation is intentional: internal state can be refactored freely without changing the caller's code.