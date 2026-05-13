# Forms

XMLUI enables to create forms without the hassle of managing, editing, validating, and saving the information you provide in the UI.

This example demonstrates the core pattern: a [Form](/docs/reference/components/Form) with input components placed directly inside it.

```xmlui-pg display id="forms-b6ec"
<App>
  <Form data="{{ name: 'Joe', age: 43 }}">
    <FlowLayout>
      <H3>Customer information</H3>
      <TextBox bindTo="name" label="Customer name" />
      <NumberBox 
        bindTo="age" 
        label="Age" 
        integersOnly="true" 
        zeroOrPositive="true" 
      />
    </FlowLayout>
  </Form>
</App>
```

- `Form` encapsulates the management of form UI elements and data handling
- The `data` property holds the form's data
- Input components such as `TextBox`, `NumberBox`, `Checkbox`, `Select`, etc. bind directly to form data using `bindTo`
  - `bindTo` specifies the property name within the `data` to bind to
  - validation and other properties are set directly on the input component

> [!INFO]
>  When a component is instantiated inside a <tt>Form</tt>, the form creates a runtime context ($data) that is automatically available to all nested components — including components declared in separate files — so any input component's <tt>bindTo</tt> can target form fields without passing the form data via props.

## Form Layouts

You can use any of XMLUI's layout mechanisms with a `Form`. Here is a single-column format using `FlowLayout`.

```xmlui-pg display id="form-layouts-ea4e"
<App>
  <Form data="{{
      firstname: 'Jake',
      lastname: 'Hard',
      jobTitle: 'janitor',
      experience: 'broom'
    }}">
    <FlowLayout>
      <TextBox label="Firstname" bindTo="firstname" />
      <TextBox label="Lastname" bindTo="lastname" />
      <TextBox label="Job Title" bindTo="jobTitle" />
      <TextBox label="Experience" bindTo="experience" />
    </FlowLayout>
  </Form>
</App>
```

Set each item's width to `50%` to create a two-column layout.

```xmlui-pg display id="form-layouts-eab2"
<App>
  <Form
    data="{{
      firstname: 'Jake',
      lastname: 'Hard',
      jobTitle: 'janitor',
      experience: 'broom'
    }}">
    <FlowLayout>
      <TextBox label="Firstname" bindTo="firstname" width="50%" />
      <TextBox label="Lastname" bindTo="lastname" width="50%" />
      <TextBox label="Job Title" bindTo="jobTitle" width="50%" />
      <TextBox label="Experience" bindTo="experience" width="50%" />
    </FlowLayout>
  </Form>
</App>
```

Use star sizing to allocate widths flexibly. Here `Firstname` and `Lastname` equally share the space remaining after the 100-px-wide `Title`.

```xmlui-pg display id="form-layouts-eab0"
<App>
  <Form
    data="{{
      title: 'Mr.',
      firstname: 'Jake',
      lastname: 'Hard',
      jobTitle: 'janitor',
      experience: 'broom'
    }}"
    onSubmit="(toSave) => toast.success(JSON.stringify(toSave))">
    <FlowLayout>
      <HStack>
        <TextBox label="Title" bindTo="title" width="100px" />
        <TextBox label="Firstname" bindTo="firstname" width="*" />
        <TextBox label="Lastname" bindTo="lastname" width="*" />
      </HStack>
      <TextBox label="Job Title" bindTo="jobTitle" width="50%" />
      <TextBox label="Experience" bindTo="experience" width="50%" />
    </FlowLayout>
  </Form>
</App>
```

## Input Components

Use XMLUI input components directly inside a `Form`. Each component has a `bindTo` property that connects it to a field in the form's `data`.

### Checkbox

```xmlui-pg display id="checkbox-163e"
<App>
  <Form data="{{ option1: true, option2: false, option3: true }}"
    onSubmit="(toSave) => toast.success(JSON.stringify(toSave))">
    <Checkbox bindTo="option1" label="Option #1" labelPosition="end" />
    <Checkbox bindTo="option2" label="Option #2" labelPosition="end" />
    <Checkbox bindTo="option3" label="Option #3" labelPosition="end" />
  </Form>
</App>
```

[Checkbox component doc](/docs/reference/components/Checkbox)

### DatePicker

```xmlui-pg display id="datepicker-1662"
<App>
  <Form
    data="{{ birthDate: '2021-04-08' }}"
    onSubmit="(toSave) => toast.success(JSON.stringify(toSave))">
    <DatePicker bindTo="birthDate" label="Birthdate" />
  </Form>
</App>
```

[DatePicker component doc](/docs/reference/components/DatePicker)

### FileInput

Use `FileInput` to select one or multiple files.

```xmlui-pg display id="fileinput-16a0"
<App>
  <Form
    data="{{ articles: null }}"
    onSubmit="(toSave) => toast.success(JSON.stringify(toSave))">
    <FileInput bindTo="articles" label="Articles file" />
  </Form>
</App>
```

[FileInput component doc](/docs/reference/components/FileInput)

### NumberBox (integers)

Use `integersOnly` to restrict input to whole numbers.

```xmlui-pg display id="numberbox-integers-16e2"
<App>
  <Form
    data="{{ age: 30 }}"
    onSubmit="(toSave) => toast.success(JSON.stringify(toSave))">
    <NumberBox bindTo="age" label="Age" integersOnly="true" />
  </Form>
</App>
```

[NumberBox component doc](/docs/reference/components/NumberBox)

### NumberBox (floating-point)

```xmlui-pg display id="numberbox-floating-point-1716"
<App>
  <Form
    data="{{ distance: 192.5 }}"
    onSubmit="(toSave) => toast.success(JSON.stringify(toSave))">
    <NumberBox bindTo="distance" label="Distance in miles" />
  </Form>
</App>
```

[NumberBox component doc](/docs/reference/components/NumberBox)

### RadioGroup

```xmlui-pg display id="radiogroup-1744"
<App>
  <Form
    data="{{ title: 'Mr.' }}"
    onSubmit="(toSave) => toast.success(JSON.stringify(toSave))">
    <RadioGroup bindTo="title" label="Title">
      <Option label="Mr." value="Mr." />
      <Option label="Mrs." value="Mrs." />
      <Option label="Ms." value="Ms." />
      <Option label="Dr." value="Dr." />
    </RadioGroup>
  </Form>
</App>
```

[RadioGroup component doc](/docs/reference/components/RadioGroup)

### Select

```xmlui-pg display id="select-1792"
<App>
  <Form
    data="{{ size: 'xs' }}"
    onSubmit="(toSave) => toast.success(JSON.stringify(toSave))">
    <Select bindTo="size" label="Box size">
      <Option label="Extra small" value="xs" />
      <Option label="Small" value="sm" />
      <Option label="Medium" value="md" />
      <Option label="Large" value="lg" />
    </Select>
  </Form>
</App>
```

[Select component doc](/docs/reference/components/Select)

### Switch

```xmlui-pg display id="switch-17d0"
<App>
  <Form
    data="{{ showBorder: true, showText: false, hideShadow: true }}"
    onSubmit="(toSave) => toast.success(JSON.stringify(toSave))">
    <Switch bindTo="showBorder" label="Show border" labelPosition="right" />
    <Switch bindTo="showText" label="Show text" labelPosition="right" />
    <Switch bindTo="hideShadow" label="Hide shadow" labelPosition="right" />
  </Form>
</App>
```

[Switch component doc](/docs/reference/components/Switch)

### TextBox

```xmlui-pg display id="textbox-17fe"
<App>
  <Form
    data="{{ name: 'Joe' }}"
    onSubmit="(toSave) => toast.success(JSON.stringify(toSave))">
    <TextBox bindTo="name" label="Name" />
  </Form>
</App>
```

[TextBox component doc](/docs/reference/components/TextBox)

### TextArea

```xmlui-pg display id="textarea-182c"
<App>
  <Form
    data="{{ description: 'This is a description' }}"
    onSubmit="(toSave) => toast.success(JSON.stringify(toSave))">
    <TextArea bindTo="description" label="Description" />
  </Form>
</App>
```

[TextArea component doc](/docs/reference/components/TextArea)

## Provide data

You can define a `Form`s data structure and initial values directly.

```xmlui copy
<Form data="{{ name: 'Joe', age: 43 }}" />
```

Or via an API endpoint.

```xmlui
<Form data="/path/to/resource" />
```

Use the `bindTo` property to access fields in the structure.

```xmlui
<Form data="{{ name: 'Joe' }}">
  <TextBox bindTo="name" />
</Form>
```

## Refer to data

The `$data` variable holds all the form's data. You can use values in `$data` to control input component properties. Here the `Switch`s value sets the `enabled` property of a `TextBox`.

```xmlui-pg display id="refer-to-data-1944"
<App>
  <Form data="{{ isEnabled: true, name: 'Joe' }}">
    <Switch label="Enable name" bindTo="isEnabled" />
    <TextBox enabled="{$data.isEnabled}" label="Name" bindTo="name" />
  </Form>
</App>
```

Other components in the form can reference the form's data too. Here the `Text` updates reactively when input values change.

```xmlui-pg display id="refer-to-data-1972"
<App>
  <Form data="{{ firstname: 'John', lastname: 'Doe' }}">
    <TextBox label="Firstname" bindTo="firstname" />
    <TextBox label="Lastname" bindTo="lastname" />
    <Text>Full name: {$data.firstname} {$data.lastname}</Text>
  </Form>
</App>
```

You can drill into `$data` to reference nested fields.

```xmlui-pg display {9} id="refer-to-data-19a0"
<App>
  <Form
    data="{{
      name: 'John smith',
      address: { street: '96th Ave N', city: 'Seattle', zip: '98005' }
    }}"
    onSubmit="(toSave) => toast.success(JSON.stringify(toSave))">
    <TextBox bindTo="name" label="Name" />
    <TextBox bindTo="address.street" label="Street" />
  </Form>
</App>
```

## Validate data

The `Form` handles client-side validation, reporting issues interactively. Server-side validation happens when the form data is sent to the server. The `Form` handles the server's response and displays it in a summary or below input fields.

Validation properties are set directly on the input component.

### `minLength`

```xmlui-pg display id="validate-data-19ee"
<App>
  <Form data="{{ name: 'Billy Bob' }}">
    <TextBox bindTo="name" minLength="10" label="minLength" />
  </Form>
</App>
```

Try submitting with fewer than 10 characters.

### `maxLength`

```xmlui-pg display id="validate-data-1a1c"
<App>
  <Form data="{{ name: 'Billy Bob' }}">
    <TextBox bindTo="name" maxLength="11" label="maxLength" />
  </Form>
</App>
```

Try entering more than 11 characters.

### `minValue`

```xmlui-pg display id="validate-data-1a4a"
<App>
  <Form data="{{ age: 30 }}">
    <NumberBox bindTo="age" minValue="32" label="minValue" />
  </Form>
</App>
```

Try entering a number smaller than 32.

### `maxValue`

```xmlui-pg display id="validate-data-1a78"
<App>
  <Form data="{{ age: 30 }}" >
    <NumberBox bindTo="age" maxValue="29" label="maxValue" />
  </Form>
</App>
```

Try entering a number larger than 29.

### `pattern`

Evaluate predefined regex patterns: "email", "url", or "phone".

```xmlui-pg id="compound-validation-1aa6"
<App>
  <Form data="{{
      mobile: '+13456123456',
      website: 'http://www.blogsite.com',
      email: 'myemail@mail.com'
    }}">
    <TextBox bindTo="mobile" pattern="phone" label="mobilePattern" />
    <TextBox bindTo="website" pattern="url" label="websitePattern" />
    <TextBox bindTo="email" pattern="email" label="emailPattern" />
  </Form>
</App>
```

See the [pattern property](/docs/reference/components/TextBox#pattern) of `TextBox`.

### `regex`

Evaluate a custom regex pattern.

```xmlui-pg display id="validation-specific-severity-1af4"
<App>
  <Form data="{{ password: 'hello' }}">
    <!-- Only all uppercase letters are accepted -->
    <TextBox bindTo="password" regex="/^[A-Z]+$/" label="regex" />
  </Form>
</App>
```

### Compound validation

You can use multiple validations.

```xmlui-pg display id="validation-specific-messages-1b22"
<App>
  <Form data="{{ site: 'http://www.example.com' }}">
    <TextBox bindTo="site" minLength="10" maxLength="30"
      pattern="url" label="Multiple Validations" />
  </Form>
</App>
```

### Validation-specific severity

By default, all validations have a severity level of **"error"**. You can set whether a validation should have a level of **"warning"** or **"error"**.

```xmlui-pg display id="server-side-validation-1b50"
<App>
  <Form data="{{ mobile: '+13456123456', website: 'http://www.blogsite.com' }}" >
    <TextBox
      bindTo="mobile"
      pattern="phone"
      patternInvalidSeverity="warning"
      label="mobilePattern" />
    <TextBox
      bindTo="website"
      pattern="url"
      patternInvalidSeverity="error"
      label="websitePattern" />
  </Form>
</App>
```

### Validation-specific messages

Predefined validations have built-in messages that you can change.

```xmlui-pg display id="submit-data-1b9e"
<App>
  <Form data="{{ age: 20 }}" >
    <NumberBox
      bindTo="age"
      minValue="21"
      rangeInvalidMessage="The given age is too low!"
      label="Invalid Message" />
  </Form>
</App>
```

## Server-side validation

The `Form` component can receive and display a server-side validation response. Field related issues are shown just like client-side validation errors, removed when a field is edited. Non-field related issues are displayed in a validation summary view.

<br/>
<Image alt="Server-side Validation" src="/resources/images/create-apps/using-forms.png" />

## Submit data

By default the `Form` component provides a submit button to save the modified data.

```xmlui-pg display id="submit-data-1bec"
<App>
  <Form onSubmit="toast('Saved!')" />
</App>
```

The `onSubmit` accepts either a block of code or function. When you use a function it receives data in a parameter; in this example it's called `toSave` but you can use any name. The function can be defined inline, in a code-behind file, or in `index.html` attached to the global `window` variable. See the [Code](/code) chapter for details.

```xmlui-pg display id="submit-data-1c1a"
<App>
  <Form
    data="{{ name: 'Joe', age: 43 }}"
    onSubmit="(d) => toast(JSON.stringify(d))"
  >
    <TextBox label="name" bindTo="name" />
    <NumberBox label="age" bindTo="age" integersOnly="true" />
  </Form>
</App>
```

To submit via an `APICall`, use the `event` helper tag to bridge between the form and the API. The `Form`s `data` attribute maps to the `APICall`'s `$param` [context variable](/context-variables). A `Toast` popup reports success or error.

```xmlui id="submit-data-1cc6"
<App>
  <Form data="{{ name: 'Joe', age: 43 }}">
    <event name="submit">
      <APICall
        url="/api/contacts"
        method="POST"
        body="{$param}" />
    </event>
    <TextBox bindTo="name" label="name" />
    <NumberBox bindTo="age" label="age" integersOnly="true" />
  </Form>
</App>
```

## Form in ModalDialog

[ModalDialog](/docs/reference/components/ModalDialog) supports `Form` as a first-class citizen component. When a `Form` nests directly in a `ModalDialog`, the dialog's button row is replaced with the form's own button row. When form submission is successful, the dialog closes.

## Custom inputs with FormItem

For cases where no built-in input component fits your needs, use [FormItem](/docs/reference/components/FormItem) to wrap a custom input. `FormItem` exposes `$value` (the current value) and `$setValue` (a function to update it) to its children.

```xmlui-pg display id="custom-inputs-with-formitem-1d7a"
<App>
  <Form
    data="{{ userAvailable: false }}"
    onSubmit="(toSave) => toast.success(JSON.stringify(toSave))">
    <FormItem bindTo="userAvailable">
      <HStack>
        <Button
          label="Toggle"
          backgroundColor="{$value === false ? 'red' : 'green'}"
          onClick="$setValue(!$value)"
        />
      </HStack>
    </FormItem>
  </Form>
</App>
```

`$value` represents the current value of the component. `$setValue` changes the value.

> [!INFO]
> `FormItem` with a `type` property (e.g. `type="text"`, `type="select"`) is still supported for backward compatibility, but using the corresponding input component directly is the preferred approach.
