# Add an async uniqueness check

Use an `onValidate` handler that returns a Promise, combined with `customValidationsDebounce`, to call an API that verifies a value is not already in use.

A registration form must ensure the chosen username does not already exist in the database. Because the check requires a network call, the `onValidate` function returns a Promise. Combined with `customValidationsDebounce`, the API is called only after the user has paused typing, keeping network traffic low.

```xmlui-pg copy display name="Username uniqueness check"
---app display
<App>
  <Form
    data="{{ username: '', email: '' }}"
    onSubmit="(data) => toast('Account created for ' + data.username)"
    saveLabel="Create account"
  >
    <TextBox
      label="Username (John and Jane is taken)"
      bindTo="username"
      required="true"
      minLength="3"
      customValidationsDebounce="500"
      validationDisplayDelay="800"
      onValidate="(value) => {
        if (!value || value.length < 3) return null;
        const available = Actions.callApi({ url: '/api/users/check/' + value });
        return (available 
          ? '\u201c' + value + '\u201d is already taken. Please choose another.' 
          : null);
      }"
      placeholder="Choose a unique username (min. 3 characters)."
    />
    <TextBox label="Email" bindTo="email" pattern="email" required="true" />
  </Form>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.users = [
    { id: 1, name: 'John' },
    { id: 1, name: 'Jane' },
  ]",
  "operations": {
    "check_user": {
      "url": "/users/check/:name",
      "method": "get",
      "handler": "delay(2000); return $state.users.some(u => u.name === $pathParams.name)"
    }
  }
}
```

## Key points

**`onValidate` can call APIs and long-running operations**: When your `onValidate` handler makes an API call or other async operation, XMLUI automatically waits for it to complete. The field enters a pending state until the operation settles:

```xmlui
<TextBox
  bindTo="username"
  customValidationsDebounce="500"
  onValidate="(value) => {
    const available = Actions.callApi({ url: '/api/users/check/' + value });
    return (available 
      ? '\u201c' + value + '\u201d is already taken. Please choose another.' 
      : null);
  }"
/>
```

**Guard against short or empty values**: Run the API only when the input is worth checking. When the value is too short, return `null` immediately to avoid spurious requests (built-in `minLength` will surface the length error anyway):

```xmlui
onValidate="(value) => {
  if (!value || value.length < 3) return null;
  const available = Actions.callApi({ url: '/api/users/check/' + value });
  return (available 
    ? '\u201c' + value + '\u201d is already taken. Please choose another.' 
    : null);
}"
```

**`customValidationsDebounce="500"` prevents request-per-keystroke**: The `onValidate` function only runs after the user has stopped changing the field for 500 ms. Built-in validators (`required`, `minLength`, etc.) still fire immediately on blur — only the async handler is throttled.

**The form blocks submission while the check is in-flight**: If the user presses Save while the async validator is still pending, XMLUI waits for it to resolve before proceeding. This prevents submitting a username that is currently being verified.

**`validationDisplayDelay` reveals the result without requiring a blur**: Normally (`errorLate` mode) XMLUI hides validation feedback until the user leaves the field. For an instant check this is fine, but the API call in this example takes about 1 second. By the time it resolves, making the user blur the field before seeing the error feels unnecessary.

`validationDisplayDelay` (default: `400` ms) starts a timer when an async check begins on a dirty field. If the check is still running when the timer fires, XMLUI reveals the result immediately once it settles — even if the field is still focused. Because the mock API here always takes 1 s, the 400 ms default kicks in on every check and the error appears right away without a blur.

---

**See also**
- [TextBox component](/docs/reference/components/TextBox) — `onValidate`, `customValidationsDebounce`, and built-in validators
- [Show validation on blur, not on type](/docs/howto/show-validation-on-blur-not-on-type) — debouncing background
- [Validate dependent fields together](/docs/howto/validate-dependent-fields-together) — form-level `onWillSubmit` checks
