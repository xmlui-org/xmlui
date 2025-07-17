# Component Scoping

Components in XMLUI follow hierarchical scoping rules based on the component tree structure. Understanding these rules is crucial for sharing components like modals across your application.

## Scoping Rules

Component IDs are visible to:
- The component where they're defined
- All descendant components (children, grandchildren, etc.)

## Example: Modal Sharing

Here's what won't work.

### Wrong: Modal defined in a child component

```xml
<App>
  <AppHeader>
    <!-- AppHeader wants to open the modal but can't see it -->
    <Button onClick="userDialog.open()" />
  </AppHeader>
  <Pages>
    <Page url="/home">
      <Home>
        <!-- Modal defined here - only visible to Home and its children -->
        <ModalDialog id="userDialog" />
      </Home>
    </Page>
  </Pages>
</App>
```

In this example, `Header` cannot access `userDialog` because the modal is defined in `Home`, which is a sibling component.

### Correct: Modal defined in shared parent

```xml
<App>
  <!-- Modal defined at App level - visible to ALL descendants -->
  <ModalDialog id="userDialog" title="User Profile" />

  <AppHeader>
    <!-- AppHeader can access userDialog -->
    <Button onClick="userDialog.open()" />
  </AppHeader>
  <Pages>
    <Page url="/home">
      <Home>
        <!-- Home can also access userDialog -->
        <Button onClick="userDialog.open()" />
      </Home>
    </Page>
    <Page url="/settings">
      <Settings>
        <!-- Settings can also access userDialog -->
        <Button onClick="userDialog.open()" />
      </Settings>
    </Page>
  </Pages>
</App>
```
