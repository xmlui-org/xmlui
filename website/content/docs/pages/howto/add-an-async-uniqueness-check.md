# Add an async uniqueness check

Use an async onValidate handler with customValidationsDebounce to call an API that verifies a value is not already in use.

A registration form must ensure the chosen username does not already exist in the database. Because the check requires a network call, the `onValidate` function on the field is marked `async`. Combined with `customValidationsDebounce`, the API is called only after the user has paused typing, keeping network traffic low.

```xmlui-pg copy display name="Username uniqueness check"
---api
POST /api/usernames/check
Content-Type: application/json
{ "username": "alice" }
---
{ "available": false }
---
POST /api/usernames/check
Content-Type: application/json
{ "username": "bob" }
---
{ "available": true }
---app display
<App>
  <Form
    data="{{ username: '', email: '' }}"
    onSubmit="(data) => toast('Account created for ' + data.username)"
    saveLabel="Create account"
  >
    <TextBox
      label="Username"
      bindTo="username"
      required="true"
      minLength="3"
      customValidationsDebounce="500"
      onValidate="async (value) => {
        if (!value || value.length < 3) return null;
        const res = await context.callApi({
          url: '/api/usernames/check',
          method: 'POST',
          body: { username: value }
        });
        return res.available ? null : '\u201c' + value + '\u201d is already taken. Please choose another.';
      }"
      placeholder="Choose a unique username (min. 3 characters)."
    />
    <TextBox label="Email" bindTo="email" pattern="email" required="true" />
  </Form>
</App>
```

## Key points

**`onValidate` may be `async`**: Return a `Promise<string | null>` to await any asynchronous work before reporting the result. XMLUI holds the validation state as pending until the promise settles:

```xmlui
<TextBox
  bindTo="username"
  customValidationsDebounce="500"
  onValidate="async (value) => {
    const { available } = await api.checkUsername(value);
    return available ? null : value + ' is already taken';
  }"
/>
```

**Guard against short or empty values**: Run the API only when the input is worth checking. When the value is too short, return `null` immediately to avoid spurious requests (built-in `minLength` will surface the length error anyway):

```xmlui
onValidate="async (v) => {
  if (!v || v.length < 3) return null;  // let minLength handle it
  const { available } = await checkUsername(v);
  return available ? null : v + ' is already taken';
}"
```

**`customValidationsDebounce="500"` prevents request-per-keystroke**: The `onValidate` function only runs after the user has stopped changing the field for 500 ms. Built-in validators (`required`, `minLength`, etc.) still fire immediately on blur — only the async handler is throttled.

**The form blocks submission while the check is in-flight**: If the user presses Save while the async validator is still pending, XMLUI waits for it to resolve before proceeding. This prevents submitting a username that is currently being verified.

**Show a loading indicator during the check**: Use a variable to flag in-progress state and show a spinner or status message under the field:

```xmlui
<Form var.checking="{false}">
  <TextBox
    bindTo="username"
    label="Username"
    customValidationsDebounce="500"
    onValidate="async (v) => {
      checking = true;
      try {
        const { available } = await checkUsername(v);
        return available ? null : v + ' is taken';
      } finally {
        checking = false;
      }
    }"
    placeholder="{checking ? 'Checking availability\u2026' : 'Min. 3 characters'}"
  />
</Form>
```

---

**See also**
- [TextBox component](/docs/reference/components/TextBox) — `onValidate`, `customValidationsDebounce`, and built-in validators
- [Show validation on blur, not on type](/docs/howto/show-validation-on-blur-not-on-type) — debouncing background
- [Validate dependent fields together](/docs/howto/validate-dependent-fields-together) — form-level `onWillSubmit` checks
