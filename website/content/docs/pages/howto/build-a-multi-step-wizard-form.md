# Build a multi-step wizard form

Split a long form across multiple steps using a step variable and conditional rendering; collect data across all steps and submit once.

A new-employee onboarding form has three sections — Personal Info, Work Details, and Account Setup — each too long to show at once. Render one step at a time using a `var.step` counter and show/hide each section with `when` expressions. A single `Form` wraps all steps so data accumulates in one place, and the final step's Save button submits everything.

```xmlui-pg copy display name="Multi-step wizard form"
---app display
<App>
  <Form
    var.step="{1}"
    data="{{ firstName: '', lastName: '', department: '', jobTitle: '', email: '', username: '' }}"
    onSubmit="(data) => toast('Submitted: ' + JSON.stringify(data))"
    hideButtonRow="{true}"
  >
    <!-- Step indicator -->
    <HStack>
      <Badge value="1" themeColor="{step >= 1 ? 'primary' : 'secondary'}" />
      <Text>Personal</Text>
      <Badge value="2" themeColor="{step >= 2 ? 'primary' : 'secondary'}" />
      <Text>Work</Text>
      <Badge value="3" themeColor="{step >= 3 ? 'primary' : 'secondary'}" />
      <Text>Account</Text>
    </HStack>

    <!-- Step 1: Personal Info -->
    <VStack when="{step === 1}">
      <H4>Personal Information</H4>
      <TextBox label="First Name" bindTo="firstName" required="true" />
      <TextBox label="Last Name" bindTo="lastName" required="true" />
      <HStack>
        <SpaceFiller />
        <Button label="Next" onClick="step = 2" />
      </HStack>
    </VStack>

    <!-- Step 2: Work Details -->
    <VStack when="{step === 2}">
      <H4>Work Details</H4>
      <TextBox label="Department" bindTo="department" required="true" />
      <TextBox label="Job Title" bindTo="jobTitle" />
      <HStack>
        <Button label="Back" variant="outlined" onClick="step = 1" />
        <SpaceFiller />
        <Button label="Next" onClick="step = 3" />
      </HStack>
    </VStack>

    <!-- Step 3: Account Setup -->
    <VStack when="{step === 3}">
      <H4>Account Setup</H4>
      <TextBox label="Business Email" bindTo="email" pattern="email" required="true" />
      <TextBox label="Username" bindTo="username" required="true" />
      <HStack>
        <Button label="Back" variant="outlined" onClick="step = 2" />
        <SpaceFiller />
        <Button label="Create Account" type="submit" variant="solid" themeColor="primary" />
      </HStack>
    </VStack>
  </Form>
</App>
```

## Key points

**One `Form`, many steps**: All input fields are children of a single `<Form>` regardless of which step they belong to. Data typed in step 1 is preserved in the form state when the user moves to step 2 — no manual data-passing between steps is required.

**`hideButtonRow="true"`**: The default Save/Cancel button row is hidden so custom Back/Next/Submit buttons can be placed at the bottom of each step container:

```xmlui
<Form hideButtonRow="true" onSubmit="(data) => submit(data)">
  <!-- custom navigation buttons inside the form -->
</Form>
```

**`type="submit"` on a custom button**: A `<Button type="submit">` inside a `Form` triggers the normal form submission flow — built-in validation runs, `onWillSubmit` fires, and on success `onSubmit` is called. No manual `.submit()` call is needed:

```xmlui
<Button label="Create Account" type="submit" variant="solid" themeColor="primary" />
```

**`when="{step === N}"` to show/hide steps**: Conditional rendering via `when` keeps each step's fields mounted in the DOM even when hidden, so their values are preserved. Use an equality expression against a step counter variable:

```xmlui
<VStack when="{step === 2}">
  <TextBox label="Department" bindTo="department" />
  …
</VStack>
```

**Validate before advancing**: Instead of a plain `onClick` on the Next button, call `Form.validate()` to run built-in validation for the current step's fields and only advance if all pass:

```xmlui
<Button label="Next" onClick="async () => {
  const { isValid } = await $data.validate();
  if (isValid) step = step + 1;
}" />
```

---

**See also**
- [Form component](/docs/reference/components/Form) — `hideButtonRow`, `onWillSubmit`, `onSubmit`
- [Validate dependent fields together](/docs/howto/validate-dependent-fields-together) — `onWillSubmit` cross-field checks
