# Build a multi-step wizard form

Split a long form across multiple steps using a step variable and conditional rendering; collect data across all steps and submit once.

A new-employee onboarding form has three sections — Personal Info, Work Details, and Account Setup — each too long to show at once. Render one step at a time using a `var.step` counter and show/hide each section with `when` expressions. A single `Form` wraps all steps so data accumulates in one place, and the final step's Save button submits everything.

```xmlui-pg name="Multi-step wizard form"
---app display copy
<App>
  <Form
    var.step="{1}"
    data="{{ 
      firstName: '', lastName: '', department: '', 
      jobTitle: '', email: '', username: '' 
    }}"
    onSubmit="(data) => toast('Submitted: ' + JSON.stringify(data))"
    hideButtonRow="{true}"
  >
    <!-- Step indicator -->
    <HStack>
      <Badge variant="pill" value="1" width="$space-8" backgroundColor="{
        step >= 1 ? (step1Segment.isValid ? '$color-primary' : '$color-danger') : ''
      }" />
      <Text>Personal</Text>
      <Badge variant="pill" value="2" width="$space-8" backgroundColor="{
        step >= 2 ? (step2Segment.isValid ? '$color-primary' : '$color-danger') : ''
      }" />
      <Text>Work</Text>
      <Badge variant="pill" value="3" width="$space-8" backgroundColor="{
        step >= 3 ? (step3Segment.isValid ? '$color-primary' : '$color-danger') : ''
      }" />
      <Text>Account</Text>
    </HStack>

    <!-- Step 1: Personal Info -->
    <FormSegment id="step1Segment" when="{step === 1}">
        <H4>
          Personal Information
        </H4>
        <TextBox label="First Name" bindTo="firstName" required="true" />
        <TextBox label="Last Name" bindTo="lastName" required="true" />
        <HStack>
          <SpaceFiller />
          <Button label="Next" onClick="step = 2" />
        </HStack>
    </FormSegment>

    <!-- Step 2: Work Details -->
    <FormSegment id="step2Segment" when="{step === 2}">
      <H4>
        Work Details
      </H4>
      <TextBox label="Department" bindTo="department" required="true" />
      <TextBox label="Job Title" bindTo="jobTitle" />
      <HStack>
        <Button label="Back" variant="outlined" onClick="step = 1" />
        <SpaceFiller />
        <Button label="Next" onClick="step = 3" />
      </HStack>
    </FormSegment>

    <!-- Step 3: Account Setup -->
    <FormSegment id="step3Segment" when="{step === 3}">
      <H4>
        Account Setup
      </H4>
      <TextBox
        label="Business Email"
        bindTo="email"
        pattern="email"
        required="true"
      />
      <TextBox label="Username" bindTo="username" required="true" />
      <HStack>
        <Button label="Back" variant="outlined" onClick="step = 2" />
        <SpaceFiller />
        <Button
          label="Create Account"
          type="submit"
          variant="solid"
          themeColor="primary"
        />
      </HStack>
    </FormSegment>
  </Form>
</App>
```

## Key points

**One `Form`, many `FormSegment` containers**: Each step is wrapped in a `<FormSegment>` with a unique `id`. All input fields are children of a single `<Form>`, so data typed in step 1 is preserved in the form state when moving to step 2. FormSegment provides step-level validation state via its `.isValid` API property.

**`FormSegment.isValid` for step validation**: Access the validation state of each step via the FormSegment's API — `step1Segment.isValid`, `step2Segment.isValid`, etc. Use this to style step indicators and control visibility:

```xmlui
<Badge variant="pill" value="1" backgroundColor="{
  step >= 1 ? (step1Segment.isValid ? '$color-primary' : '$color-danger') : ''
}" />
```

**Step indicator badges with visual feedback**: Color the step badges based on progress and validation:
  - Empty/gray when the step hasn't been reached
  - Red if the step is invalid  
  - Primary color if the step is valid  
Show an additional "issues" badge using `when="{$hasValidationIssue()}"` to alert users when validation errors exist anywhere in the form.

**`when="{step === N}"` for step visibility**: Each step is shown conditionally on the form variable. When a step is hidden its fields are unmounted, but values already entered are preserved in the Form's state:

```xmlui
<FormSegment id="step2Segment" when="{step === 2}">
  <TextBox label="Department" bindTo="department" required="true" />
</FormSegment>
```

**`hideButtonRow="true"` and custom navigation buttons**: Hide the default Save/Cancel button row and place custom Back/Next/Submit buttons inside each step. Use `type="submit"` on the final button to trigger form submission:

```xmlui
<Form hideButtonRow="true" onSubmit="(data) => toast('Submitted')">
  <FormSegment when="{step === 3}">
    <Button label="Back" onClick="step = 2" />
    <Button label="Create Account" type="submit" variant="solid" />
  </FormSegment>
</Form>
```

---

**See also**
- [Form component](/docs/reference/components/Form) — `hideButtonRow`, `onWillSubmit`, `onSubmit`
- [Validate dependent fields together](/docs/howto/validate-dependent-fields-together) — `onWillSubmit` cross-field checks
