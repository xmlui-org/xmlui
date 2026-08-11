# Show validation on blur, not on type

Set `validationMode` on a field to control *when* its error appears: as the user types, or only when they leave the field.

Firing a validation error on every keystroke — flagging "too short" before the user has finished typing — feels nagging. `validationMode` decides the timing:

- **`onChanged`** — show the error on every keystroke (validate as you type).
- **`onLostFocus`** — show or clear the error *only* when the field loses focus (validate on blur).
- **`errorLate`** (default) — show the error on blur, then keep it live on every keystroke until the input becomes valid.

The two fields below carry the same rules (`required`, `minLength="3"`) and differ only in `validationMode`. Type one or two characters in each: the first flags immediately; the second stays quiet until you click away.

```xmlui-pg copy display name="Validation timing: on type vs on blur"
<App>
  <Form
    data="{{ handle: '', display: '' }}"
    onSubmit="(data) => toast('Saved ' + data.handle)"
    saveLabel="Save"
  >
    <TextBox
      label="Handle — validated as you type (onChanged)"
      bindTo="handle"
      required="true"
      minLength="3"
      validationMode="onChanged"
      placeholder="Type one letter to see the error appear immediately" />
    <TextBox
      label="Display name — validated on blur (onLostFocus)"
      bindTo="display"
      required="true"
      minLength="3"
      validationMode="onLostFocus"
      placeholder="Type one letter, then click away to see the error" />
  </Form>
</App>
```

## Key points

**`validationMode` sets the timing, not the rules.** The same validators (`required`, `pattern`, `minLength`, `onValidate`, …) run either way; `validationMode` only decides *when their result is shown*. `onLostFocus` is the "don't nag me while I'm typing" choice.

```xmlui
<TextBox bindTo="handle" required="true" minLength="3" validationMode="onLostFocus" />
```

**`errorLate` (the default) is a middle ground.** It waits for the first blur to show an error, but once an error is visible it updates on every keystroke — so the user gets immediate feedback *while fixing* a known problem, without being flagged before they've had a chance.

**Set it per field.** `validationMode` is a field-level property — put it on each input whose timing you want to control (as on the two `TextBox`es above).

**For validation that calls an API, add a debounce.** When `onValidate` hits the server (e.g. a username-availability check), pair the timing with `customValidationsDebounce` so the call fires only after the user pauses — see [Check uniqueness with an API](/docs/howto/add-an-async-uniqueness-check).

---

**See also**
- [TextBox component](/docs/reference/components/TextBox) — `validationMode`, built-in validators, `onValidate`
- [Form component](/docs/reference/components/Form) — grouping fields and submission handling
- [Check uniqueness with an API](/docs/howto/add-an-async-uniqueness-check) — async `onValidate` with `customValidationsDebounce`
