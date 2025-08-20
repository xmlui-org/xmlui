# Expose a method from a component

```xmlui-pg
---app display
<App height="300px" >
  <UsingInternalModal id="component"/>
  <Button label="Open the internal dialog" onClick="component.openDialog()" />
</App>
---comp display
<Component name="UsingInternalModal">
  <ModalDialog id="dialog" title="Example Dialog">
    <Button label="Close Dialog" onClick="dialog.close()" />
  </ModalDialog>

  <H1>Using an Internal Modal Dialog</H1>

  <method name="openDialog">
    console.log('internal method called')
    dialog.open();
  </method>
</Component>
```
