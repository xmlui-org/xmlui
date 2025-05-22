import { Callout } from 'nextra/components'
import { COMPONENT_MODALDIALOG } from "../../meta/pages"

# Using Modal Dialogs

<Callout type="info" emoji="💡">
  Modal dialogs are an inherent part of XMLUI. Dialogs can be invoked both **declaratively** in markup, or **imperatively** from code.
</Callout>

<Callout type="warning" emoji="💡">
When you try the examples in this section, pop them up into a separate window and test them there. If you do not, the modal dialogs will be displayed on the documentation page, perplexing your experience.
</Callout>

## Declarative Approach

The following example shows a simple dialog with details about a user. This sample demonstrates the declarative mode of displaying the dialog.

```xmlui copy /when="{isDialogShown}"/ /onClose="isDialogShown = false"/ /onClick="isDialogShown = true"/
<App>
  <variable name="isDialogShown" value="{false}"/>
  <ModalDialog
    when="{isDialogShown}"
    onClose="isDialogShown = false">
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

The declarative nature of displaying the dialog is in the behavior that the `when` attribute of `ModalDialog` is bound to the `isDialogShown` variable. By default, this variable is `false`. However, clicking the Details button sets it to `true`. When you trigger a closing action, the `onClose` event handler sets the variable to `false`.

<Callout type="info" emoji="📔">
Do not forget to pop out the example below. To close an opened dialog, click anywhere outside it or on the close button of a dialog itself.
</Callout>

<Playground
  name="Example: Declarative approach"
  app={`
    <App>
      <variable name="isDialogShown" value="{false}"/>
      <ModalDialog
        when="{isDialogShown}"
        onClose="isDialogShown = false">
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
  `}
/>

The declarative approach allows you to provide deep links to open modal dialogs. You can pass a query parameter with a flag indicating if the dialog is open and your declarative code can set the `when` property accordingly.

## Imperative Approach

<Callout type="info" emoji="💡">
  You can imperatively invoke the `open()` and `close()` exposed functions of a `ModalDialog` component instance via its ID.
</Callout>

```xmlui copy {3} /onClick="dialog.open()"/ /onClick="dialog.close()"/
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

<Playground
  name="Example: Imperative approach"
  app={`
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
  `}
/>

## Interoperability with Forms [#interoperability-with-forms]

<Callout type="info" emoji="💡">
  When embedding a form in a dialog, the form's cancel and successful submit actions (unless you change this logic) automatically close the dialog hosting the form.
</Callout>

```xmlui copy {2-8} /onClick="dialog.open()"/
<App>
  <ModalDialog id="dialog">
    <Form data="{{ name: 'Leslie', age: 32 }}">
      <FormItem bindTo="name" label="User Name" />
      <FormItem bindTo="age" label="Age" type="integer" zeroOrPositive="true" />
    </Form>
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

The following code contains only a `dialog.open` action, which displays the dialog. The form issues a close action when you cancel or submit it.

<Playground
  name="Example: Form in ModalDialog"
  app={`
  <App>
    <ModalDialog id="dialog">
      <Form data="{{ name: 'Leslie', age: 32 }}">
        <FormItem bindTo="name" label="User Name" />
        <FormItem bindTo="age" label="Age" type="integer" zeroOrPositive="true" />
      </Form>
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
  `}
/>

## Further Customization

The `ModalDialog` component lets you customize some parts of it directly. For example, you can hide the close button displayed in the top-right dialog corner and add a restyled title to dialogs.

```xmlui copy /closeButtonVisible="false"/
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" title="Example Dialog" closeButtonVisible="false">
    <Button label="Close Dialog" onClick="dialog.close()" />
  </ModalDialog>
</App>
```

<Playground
  name="Example: Customization"
  app={`
  <App>
    <Button label="Open Dialog" onClick="dialog.open()" />
    <ModalDialog id="dialog" title="Example Dialog" closeButtonVisible="false">
      <Button label="Close Dialog" onClick="dialog.close()" />
    </ModalDialog>
  </App>
  `}
/>

See the <SmartLink href={COMPONENT_MODALDIALOG}>ModalDialog reference article</SmartLink> to see all properties and events.
