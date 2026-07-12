# Submit a form from a custom button or the Enter key

A `TextArea` has no keydown or `onEnter` event of its own — its only events are
`didChange`, `gotFocus`, and `lostFocus`. To submit on Enter, put it inside a
`Form`: with [`enterSubmits`](/docs/reference/components/TextArea#entersubmits)
(the default), pressing Enter asks the parent `Form` to submit. To submit from
your own button instead of the default Save/Cancel row, replace the row with a
[`buttonRowTemplate`](/docs/reference/components/Form#buttonrowtemplate) that
contains a `<Button type="submit">`.

```xmlui-pg copy display name="Enter or a custom Send button submits" height="380px"
<App var.messages="{[]}">
  <List data="{messages}" height="200px">
    <Text>{$item}</Text>
  </List>
  <Form
    onSubmit="() => { if (note.value) { messages = [...messages, note.value]; note.setValue(''); } }">
    <TextArea
      id="note"
      enterSubmits="true"
      placeholder="Type a message, press Enter or click Send" />
    <property name="buttonRowTemplate">
      <HStack>
        <SpaceFiller />
        <Button type="submit" label="Send" icon="email" />
      </HStack>
    </property>
  </Form>
</App>
```

## Key points

**Enter-to-submit needs a `Form`**: `enterSubmits` is a `TextArea` property that
prompts the *parent* `Form` to submit on Enter — it does nothing outside a form,
because `TextArea` exposes no key events itself. It defaults to `true`, so simply
placing a `TextArea` in a `Form` already gives you Enter-to-submit.

**Multi-line entry still works with Enter-to-submit on**: With
`enterSubmits="true"`, plain **Enter** submits and **Shift+Enter** inserts a
newline — so users can still write multi-line messages. Set
`enterSubmits="false"` only when plain Enter should *always* insert a newline and
the `type="submit"` button is the sole submit path.

**`type="submit"` is what submits — there is no `form.submit()` method**: A
[`Button`](/docs/reference/components/Button) with `type="submit"` triggers the
form's submit flow (validation, then `onSubmit`). `Form` exposes `reset`,
`update`, `getData`, and `validate` methods, but no imperative `submit()` — so
drive submission with a submit-typed button, not a method call. Use
`type="button"` for any other action in the row that should *not* submit.

**`buttonRowTemplate` replaces the default row**: Supplying a
`buttonRowTemplate` lets you provide your own buttons (here a single Send
button pushed right with `SpaceFiller`). To keep the built-in buttons but hide
them in some states, see
[`hideButtonRow`](/docs/reference/components/Form#hidebuttonrow) and
[`hideButtonRowUntilDirty`](/docs/reference/components/Form#hidebuttonrowuntildirty).

**Read the input in `onSubmit`, then clear it**: Because the `TextArea` here
isn't bound with `bindTo`, `onSubmit` reads `note.value` directly and clears the
field with `note.setValue('')` — the same methods covered in
[Control a TextArea from code](/docs/howto/control-a-textarea-from-code). If you
bind the field with `bindTo` instead, use
[`dataAfterSubmit="clear"`](/docs/reference/components/Form#dataaftersubmit) to
empty it declaratively.

---

## See also

- [Control a TextArea from code](/docs/howto/control-a-textarea-from-code) — `setValue`, `value`, and `focus`
- [Reset a form after submission](/docs/howto/reset-a-form-after-submission) — `dataAfterSubmit` for clearing or restoring bound fields
- [Use built-in form validation](/docs/howto/use-built-in-form-validation) — validators that run before `onSubmit` fires
- [Form reference](/docs/reference/components/Form) · [TextArea reference](/docs/reference/components/TextArea)
