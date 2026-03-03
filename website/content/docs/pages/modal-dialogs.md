# Modal Dialogs

A `ModalDialog` can be invoked **declaratively** in markup or **imperatively** from code.

This is the declarative method. You don't need to invoke the `ModalDialog`'s `open()` and `close()` functions directly. The `when` attribute controls opening and closing.

```xmlui-pg display {2, 3, 19}
<App>
  <variable name="isDialogShown" value="{false}"/>
  <ModalDialog
    when="{isDialogShown}"
    onClose="{ isDialogShown = false }">
    Leslie is always number one to the coffee machine.
    He has a competitive personality but gets along with a lot people.
  </ModalDialog>
  <NavPanel>
    <NavLink label="Users" to="/" icon="user" />
  </NavPanel>
  <Pages>
    <Page url="/">
      <Card
        avatarUrl="https://i.pravatar.cc/100"
        title="Leslie Peters"
        subtitle="Executive Manager">
        Leslie is pretty smart when it comes to business.
        <Button label="Details" onClick="isDialogShown = true" />
      </Card>
    </Page>
  </Pages>
</App>
```

This is the imperative method. You invoke `ModalDialog`'s `open()` and `close()` functions explicitly via its ID.

```xmlui-pg display {3, 7, 19}
<App>
  <ModalDialog
    id="dialog"
    title="Leslie Peters">
    Leslie is always number one to the coffee machine.
    He has a competitive personality but gets along with a lot people.
    <Button label="Close" onClick="dialog.close()" />
  </ModalDialog>
  <NavPanel>
    <NavLink label="Users" to="/" icon="user" />
  </NavPanel>
  <Pages>
    <Page url="/">
      <Card
        avatarUrl="https://i.pravatar.cc/100"
        title="Leslie Peters"
        subtitle="Executive Manager">
        Leslie is pretty smart when it comes to business.
        <Button label="Details" onClick="dialog.open()" />
      </Card>
   </Page>
  </Pages>
</App>
```

When embedding a form in a dialog, the form's cancel and successful submit actions automatically close the dialog hosting the form (unless you change this logic). Note that you can pass data via `dialog.open()`, `ModalDialog` receives it as `$param`.


```xmlui-pg display {3, 23} height="400px"
<App>
  <ModalDialog id="dialog">
    <Text> ID: { $param } </Text>
    <Form
      data="{{ name: 'Leslie', age: 32 }}"
      onSubmit="(formData) => console.log(formData)"
    >
      <FormItem bindTo="name" label="User Name" />
      <FormItem bindTo="age" label="Age" type="integer" zeroOrPositive="true" />
    </Form>
  </ModalDialog>
  <NavPanel>
    <NavLink label="Users" to="/" icon="user" />
  </NavPanel>
  <Pages>
    <Page url="/">
      <variable name="employeeId" value="{ 123 }" />
      <Card
        avatarUrl="https://i.pravatar.cc/100"
        title="Leslie Peters"
        subtitle="Executive Manager">
        Leslie is pretty smart when it comes to business.
        <Button label="Details" onClick="dialog.open(employeeId)" />
      </Card>
    </Page>
  </Pages>
</App>
```


`ModalDialog` supports a few kinds of customization. For example, you can hide the close button displayed in the top-right dialog corner and add a restyled title to dialogs.

```xmlui-pg display height="220px"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" title="Example Dialog" closeButtonVisible="false">
    <Button label="Close Dialog" onClick="dialog.close()" />
  </ModalDialog>
</App>
```

See the [ModalDialog](/docs/reference/components/ModalDialog) reference for all properties and events.

## When to use declarative vs. imperative modals


**Imperative (`dialog.open()`):**
- Use for event-driven triggers (button clicks, user actions)
- Pass dynamic parameters (`$param`, `$params`) with the action
- Simplest approach for one-off actions or direct user interactions
- Good fit for complex event chains or code-initiated triggers
- Modal state is not reflected in the URL

**Declarative (`when="{expression}"`):**
- Use when modal visibility should be determined by a condition or state
- Essential for deep-linking: tie modal state to URL query parameters using `$queryParams` (e.g., `when="{$queryParams.showSettings}"` opens the modal when URL contains `?showSettings=true`)
- Useful when multiple parts of the app need to react to the same state that controls the modal
- Good for deriving visibility from application state or context variables
- Modal automatically opens/closes when the condition changes

**Mixed approach:**
- Combine both: use `when` to bind modal to URL or shared state, then add imperative methods (`dialog.open()`) for programmatic control from within your app
- Example: `when="{$queryParams.dialog === 'settings'}"` for deep-linking, plus `onClick="dialog.close()"` for a manual close button

**Key distinction:** Imperative is about **actions** ("open this now"), declarative is about **state** ("be open when this condition is true"). Choose imperative for user-triggered events, declarative when visibility should track a condition or be URL-addressable.
