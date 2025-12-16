%-DESC-START

**Key features:**
- **Data binding**: Automatically syncs control values with form data using the `bindTo` property
- **Validation**: Displays validation states and error messages for the associated input
- **Flexible labeling**: Supports labels, helper text, and various label positioning options
- **Layout management**: Handles consistent spacing and alignment of form elements

See [this guide](/forms) for details.

%-DESC-END

%-PROP-START bindTo

Try to enter some kind of text in the input field labelled `Lastname` and submit the form. Note how the submitted data looks like compared to the one set in `data`.

```xmlui-pg copy display name="Example: bindTo"
<App>
  <Form
    data="{{ firstname: 'James', lastname: 'Clewell' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem label="Firstname" bindTo="firstname" />
    <FormItem label="Lastname" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START enabled

```xmlui-pg copy display name="Example: enabled"
<App>
  <Form>
    <FormItem label="Firstname" enabled="true" />
    <FormItem label="Lastname" enabled="false" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START initialValue

```xmlui-pg copy display name="Example: initialValue"
<App>
  <Form data="{{ firstname: 'Michael', lastname: undefined }}">
    <FormItem label="Firstname" bindTo="firstname" initialValue="James" />
    <FormItem label="Lastname" bindTo="lastname" initialValue="Jordan" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START label

```xmlui-pg copy display name="Example: label"
<App>
  <Form>
    <FormItem label="Firstname" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START labelPosition

Different input components have different layout methods
(i.e. `TextBox` labels are positioned at the top, `Checkbox` labels are on the right side).

```xmlui-pg copy display name="Example: labelPosition"
<App>
  <Form>
    <FormItem label="Start Label" labelPosition="start" />
    <FormItem label="Top Label" labelPosition="top" />
    <FormItem label="End Label" labelPosition="end" />
    <FormItem label="Bottom Label" labelPosition="bottom" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START lengthInvalidMessage

In the app, type a name longer than four characters in both fields, then leave the edited field. The two fields will display different error messages; the second uses the customized one.

```xmlui-pg copy display name="Example: lengthInvalidMessage"
<App>
  <Form
    data="{{ firstname: 'James', lastname: 'Clewell' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem maxLength="4" bindTo="firstname" />
    <FormItem lengthInvalidMessage="Name is too long!" maxLength="4" bindTo="lastname" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START lengthInvalidSeverity

In the app, type a name longer than four characters in both fields, then leave the edited field. The two fields will display different error messages; the second uses a warning instead of an error.

```xmlui-pg copy display name="Example: lengthInvalidSeverity"
<App>
  <Form
    data="{{ firstname: 'James', lastname: 'Clewell' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem maxLength="4" bindTo="firstname" />
    <FormItem lengthInvalidSeverity="warning" maxLength="4" bindTo="lastname" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START maxLength

Note that it is not possible for the user to enter a string larger than the value of the `maxLength`,
but setting such a value programmatically still results in a validation check.

In the demo below, try to enter an input longer than 4 characters or submit the form as is.

```xmlui-pg copy display name="Example: maxLength"
<App>
  <Form
    data="{{ firstname: 'James' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem maxLength="4" bindTo="firstname" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START minLength

In the demo below, enter an input shorter than 4 characters or just submit the form as is.

```xmlui-pg copy display name="Example: minLength"
<App>
  <Form
    data="{{ firstname: '' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem minLength="4" bindTo="firstname" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START maxValue

Note that it is not possible for the user to enter a number larger than the value of the `maxValue`,
but setting such a value programmatically still results in a validation check.

In the demo below, enter an input greater than 99 or just submit the form as is.

```xmlui-pg copy display name="Example: maxValue"
<App>
  <Form
    data="{{ age: 100 }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem maxValue="99" bindTo="age" type="integer" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START minValue

Note that it is not possible for the user to enter a number smaller than the value of the `minValue`,
but setting such a value programmatically still results in a validation check.

In the demo below, enter an input smaller than 18 or just submit the form as is.

```xmlui-pg copy display name="Example: minValue"
<App>
  <Form
    data="{{ age: 0 }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem minValue="18" bindTo="age" type="integer" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START pattern

| Value   | Description                                                                                                                                                |
| :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `email` | Accepts the `[username]@[second level domain].[top level domain]` format                                                                                     |
| `phone` | Requires at least one digit and accepts: numbers, upper- and lowercase letters and the following symbols: `#`, `*`, `)`, `(`, `+`, `.`, `\`, `-`, `_`, `&`, `'` |
| `url`   | Accepts URLs and URIs starting with either `http` or `https`                                                                                               |

> **Note:** To define custom patterns and regular expressions, see the [regex section](#regex).

In the demo below, enter an input that is not solely one lowercase string or just submit the form as is.

```xmlui-pg copy display name="Example: pattern"
<App>
  <Form
    data="{{ userEmail: 'mailto' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem pattern="email" bindTo="userEmail" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START patternInvalidMessage

In the demo below, enter anything that does not look like an email and click outside to see the regular and custom message.

```xmlui-pg copy display name="Example: patternInvalidMessage"
<App>
  <Form
    data="{{ oldEmail: 'mailto', newEmail: 'mailto' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem pattern="email" bindTo="oldEmail" />
    <FormItem
      patternInvalidMessage="This does not look like an email"
      pattern="email" bindTo="newEmail" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START patternInvalidSeverity

In the demo below, enter a string of characters that does not look like an email to see the difference in feedback.

```xmlui-pg copy display name="Example: patternInvalidSeverity"
<App>
  <Form
    data="{{ oldEmail: 'mailto', newEmail: 'mailto' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem pattern="email" bindTo="oldEmail" />
    <FormItem patternInvalidSeverity="warning" pattern="email" bindTo="newEmail" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START rangeInvalidMessage

In the demo below, enter any value that is out of range in the input fields and click outside to see the regular and custom message.
Just submitting the form as is also produces the same error.

```xmlui-pg copy display name="Example: rangeInvalidMessage"
<App>
  <Form
    data="{{ age: 100, customAge: 100 }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem minValue="0" maxValue="99" bindTo="age" type="integer" />
    <FormItem
      minValue="0"
      maxValue="99"
      rangeInvalidMessage="Out of range!"
      bindTo="customAge"
      type="integer" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START rangeInvalidSeverity

In the demo below, enter any value that is out of range in the input fields and click outside to see the regular and custom message.
Just submitting the form as is also produces the same error.

```xmlui-pg copy display name="Example: rangeInvalidSeverity"
<App>
  <Form
    data="{{ age: 100, customAge: 100 }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem minValue="0" maxValue="99" bindTo="age" type="integer" />
    <FormItem
      minValue="0" maxValue="99"
      rangeInvalidSeverity="warning"
      bindTo="customAge"
      type="integer" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START regex

In the demo below, enter an input that is not solely one lowercase string or just submit the form as is.

```xmlui-pg copy display name="Example: regex"
<App>
  <Form
    data="{{ password: 'PASSWORD123' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem regex="^[a-z]+$" bindTo="password" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START regexInvalidMessage

In the demo below, enter a password that is not a lowercase string and click outside to see the regular and custom message.

```xmlui-pg copy display name="Example: regexInvalidMessage"
<App>
  <Form
    data="{{ oldPassword: 'PASSWORD123', newPassword: 'PASSWORD123' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem regex="^[a-z]+$" bindTo="oldPassword" />
    <FormItem
      regexInvalidMessage="Password must be all lowercase"
      regex="^[a-z]+$" bindTo="newPassword" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START regexInvalidSeverity

In the demo below, enter a password that is not a lowercase string and click outside to see the regular and custom message.
Just submitting the form as is also produces the same error.

```xmlui-pg copy display name="Example: regexInvalidSeverity"
<App>
  <Form
    data="{{ oldPassword: 'PASSWORD123', newPassword: 'PASSWORD123' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem regex="^[a-z]+$" bindTo="oldPassword" />
    <FormItem regexInvalidSeverity="warning" regex="^[a-z]+$" bindTo="newPassword" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START required

```xmlui-pg copy display name="Example: required"
<App>
  <Form
    data="{{ name: undefined }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem required="true" label="Name" bindTo="name" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START requiredInvalidMessage

In the demo below, leave the field empty and click outside to see the regular and custom message.

```xmlui-pg copy display name="Example: requiredInvalidMessage"
<App>
  <Form
    data="{{ firstname: undefined, lastname: undefined }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem required="true" label="First Name" bindTo="firstname" />
    <FormItem
      requiredInvalidMessage="Last Name is required!"
      required="true"
      label="Last Name"
      bindTo="lastname" />
  </Form>
</App>
```

%-PROP-END

%-PROP-START type

>[!INFO]
> For custom controls, there is no need to explicitly set the `type` to `custom`.
> Omitting the type and providing child components implicitly sets it to custom.

%-PROP-END

%-PROP-START customValidationsDebounce

Note how changing the input in the demo below will result in a slight delay of input checks noted by the appearance of a new "I" character.

```xmlui-pg copy display name="Example: customValidationsDebounce"
<App>
  <Form
    var.validations="Validations: "
    data="{{ name: 'Joe' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem
      customValidationsDebounce="3000"
      onValidate="(value) => { 
        validations += '| '; 
        return value === value.toUpperCase(); 
      }"
      bindTo="name" />
    <Text value="{validations}" />
  </Form>
</App>
```

%-PROP-END

%-EVENT-START validate

In the demo below, leave the field as is and submit the form or enter an input that is not all capital letters.

```xmlui-pg copy {7} display name="Example: validate"
<App>
  <Form
    data="{{ name: 'James' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem
      bindTo="name"
      onValidate="(value) => value === value.toUpperCase()" />
  </Form>
</App>
```

%-EVENT-END
