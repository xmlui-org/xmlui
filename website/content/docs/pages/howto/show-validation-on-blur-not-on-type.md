# Show validation on blur, not on type

Use customValidationsDebounce on the input field to delay custom validation until the user pauses typing or leaves the field.

A username field runs a server call to check whether the chosen name is taken. Firing that check on every keystroke would flood the server with requests. `customValidationsDebounce` batches rapid changes so the `onValidate` handler only runs after the user has stopped typing for a set number of milliseconds.

```xmlui-pg copy display name="Debounced username availability check"
---api
{
  "apiUrl": "/api",
  "operations": {
    "check-username": {
      "url": "/check-username",
      "method": "post",
      "handler": "return { taken: true }"
    }
  }
}
---app display
<App>
  <Form
    data="{{ username: '' }}"
    onSubmit="(data) => toast('Registered as: ' + data.username)"
    saveLabel="Register"
  >
    <TextBox
      label="Username"
      bindTo="username"
      required="true"
      minLength="3"
      customValidationsDebounce="500"
      onValidate="async (value) => {
        if (!value || value.length < 3) return null;
        const res = await fetch('/api/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: value })
        });
        const data = await res.json();
        return data.taken ? '\u201c' + value + '\u201d is already taken' : null;
      }"
      placeholder="Letters and numbers only, at least 3 characters."
    />
    <TextBox label="Email" bindTo="email" pattern="email" required="true" />
  </Form>
</App>
```

## Key points

**`customValidationsDebounce` only delays `onValidate`**: Built-in validators (`required`, `pattern`, `minLength`, `maxLength`, `regex`) are not affected — they continue to run immediately when the field loses focus or when the form tries to submit. Only the `onValidate` handler is debounced:

```xmlui
<TextBox
  bindTo="username"
  required="true"               <!-- evaluated immediately -->
  minLength="3"                 <!-- evaluated immediately -->
  customValidationsDebounce="500"
  onValidate="async (v) => checkAvailability(v)"  <!-- delayed 500 ms -->
/>
```

**Recommended debounce values**: For API calls, 300–500 ms is a good starting point. Values below 200 ms may still generate excessive requests; values above 800 ms make the form feel sluggish. Purely local `onValidate` logic can use 0 (or omit the prop) to run synchronously.

**`onValidate` can be `async`**: The handler may return a `Promise<string | null>`. XMLUI waits for the promise to resolve before showing or clearing the error indicator:

```xmlui
<TextBox
  bindTo="email"
  customValidationsDebounce="400"
  onValidate="async (v) => {
    const exists = await api.emailExists(v);
    return exists ? 'Email already registered' : null;
  }"
/>
```

**The form blocks submission while validation is pending**: If `onValidate` is still running when the user presses Save, XMLUI waits for the promise to settle before deciding whether to proceed. The user cannot accidentally submit while the async check is in-flight.

**Return `null` to clear an existing error**: Once the user fixes the value, `onValidate` runs again and can return `null` to remove the previous error message:

```xmlui
onValidate="async (v) => {
  const taken = await checkUsername(v);
  return taken ? 'Already taken' : null;
}"
```

---

**See also**
- [TextBox component](/docs/reference/components/TextBox) — `customValidationsDebounce`, `onValidate`, built-in validators
- [Add an async uniqueness check](/docs/howto/add-an-async-uniqueness-check) — full async validation example with DataSource
