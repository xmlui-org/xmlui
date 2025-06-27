# Context variables

These are the key context variables available in XMLUI forms and components.

| Variable            | Scope/Context       | What it Represents                     |
| ------------------- | ------------------- | -------------------------------------- |
| `$data`             | Inside `<Form>`     | The form's current data object         |
| `$item`             | Inside iterators    | The current item in a list/array       |
| `$param`            | In event handlers   | The event's payload (e.g., form data)  |
| `$itemIndex`        | Inside iterators    | The current index in a list/array      |
| `$validationResult` | In FormItem         | Result of latest validation            |
| `$setValue`         | In FormItem         | Function to set the value              |
| `$value`            | In FormItem         | The current value                      |
| `$routeParams`      | In Page             | Capture values from route placeholders |
| `var.myVar`         | Declared in markup  | A scoped variable                      |
| `myComponentId`     | Component with `id` | Reference to the component instance    |

## `$data`

- **Scope:** Available inside a `<Form>` and its children.
- **What it is:** The current state of the form's data object (all fields/values).
- **Usage:**
  - Read or display the entire form's data: `{JSON.stringify($data)}`
- **Example:**
  ```xmlui
  <Text value="{JSON.stringify($data)}" />
  ```

## `$item`

- **Scope:** Available inside components that iterate over lists, such as `<Table>`, `<Items>`, or inside a FormItem of type "items".
- **What it is:** The current item in the iteration (e.g., a row in a table, an option in a select, or a line item in an invoice).
- **Usage:**
  - Access properties of the current item: `$item.name`, `$item.price`
- **Example:**
  ```xmlui
  <Table data="{clients}">
    <Column bindTo="Name">
      <Text>{$item.Name}</Text>
    </Column>
  </Table>
  ```

In forms:

## `$validationResult`

- **Scope:** Inside a `FormItem`.
- **What it is:** The result of the latest validation for the field.
- **Example:**
  ```xmlui
  <FormItem bindTo="email">
    <Text value="{JSON.stringify($validationResult)}" />
  </FormItem>
  ```

## `$setValue`

- **Scope:** Inside a `FormItem`.
- **What it is:** A function to set the value of the field.
- **Example:**
  ```xmlui
  <Button onClick="$setValue('new value')" label="Set Value" />
  ```

## `$value`

- **Scope:** Inside a `FormItem`.
- **What it is:** The current value of the field.
- **Example:**
  ```xmlui
  <FormItem bindTo="name">
    <Text value="{$value}" />
  </FormItem>
  ```

In iterators:

## `$itemIndex`

- **Scope:** Inside iterators (e.g., `<Items>`, `<Table>`, or FormItem of type "items").
- **What it is:** The current index in the array.
- **Example:**
  ```xmlui
  <Items data="{products}">
    <Text>Index: {$itemIndex}, Name: {$item.name}</Text>
  </Items>
  ```

In event handlers:

## `$param`

- **Scope:** Available in event handlers, especially in `<event name="submit">` or API calls.
- **What it is:** The data passed to the event or API call, often the form data at the time of submission.

In components:

## `var.myVar`

- **Scope:** Declared in markup with `var.` prefix; available in the declaring component and its children.
- **What it is:** A scoped variable.
- **Example:**
  ```xmlui
  <App var.count="{0}">
    <Button onClick="count++" label="Increment" />
    <Text>Count: {count}</Text>
  </App>
  ```

In Pages:

```xmlui
<App layout="vertical">
  <NavPanel>
    <NavLink to="/">Home</NavLink>
    <NavLink to="/account/Cameron">Cameron</NavLink>
    <NavLink to="/account/Joe">Joe</NavLink>
    <NavLink to="/account/Kathy">Kathy</NavLink>
  </NavPanel>
  <Pages>
    <Page url="/">
      Home
    </Page>
    <Page url="/account/:id">
      Account: {$routeParams.id}
    </Page>
  </Pages>
</App>
```

## `myComponentId`

- **Scope:** Any component with an `id` attribute.
- **What it is:** Reference to the component instance, allowing access to its properties and methods.
- **Example:**
  ```xmlui
  <TextBox id="myTextBox" />
  <Button onClick="myTextBox.setValue('Hello!')" label="Set Value" />
  <Text value="{myTextBox.value}" />
  ```
