# Control a TextArea from code

A `TextArea` exposes four methods you drive by its `id`: `setValue()` to write
its contents, `value` to read them, `focus()` to move the cursor into it, and
`insert()` to add text at the current caret position. Clearing is just
`setValue('')`.

```xmlui-pg copy display name="Set, clear, read, and focus a TextArea" height="320px"
<App>
  <HStack>
    <Button label="Insert sample" onClick="note.setValue('The quick brown fox.')" />
    <Button label="Clear" onClick="note.setValue('')" />
    <Button label="Focus" onClick="note.focus()" />
  </HStack>
  <TextArea id="note" autoSize="true" placeholder="Edit me" />
  <Text>Length: {note.value ? note.value.length : 0}</Text>
</App>
```

## Key points

**`setValue(text)` writes, `setValue('')` clears**: The
[`setValue`](/docs/reference/components/TextArea#setvalue) method replaces the
whole contents. Passing an empty string is how you reset the field after an
action — there is no separate `clear()` method.

**`value` reads the current contents**: The
[`value`](/docs/reference/components/TextArea#value) getter returns the text, or
`undefined` when the field has never been set. Guard before calling string
methods on it — `note.value ? note.value.length : 0` — so an empty field
doesn't throw.

**`focus()` puts the cursor in the field**: Use
[`focus`](/docs/reference/components/TextArea#focus) to move focus
programmatically — e.g. after opening a dialog or clearing the field for the
next entry.

**Reset on Esc without code**: Set
[`escResets="true"`](/docs/reference/components/TextArea#escresets) to let the
user clear the field with the Escape key, and
[`autoFocus="true"`](/docs/reference/components/TextArea#autofocus) to focus it
on display — no handler needed.

## Insert at the caret, and keep the caret while typing

Use `insert(text)` to add text **at the current cursor position** — not at the
end — leaving the caret just after what you inserted. This is the method for
"insert snippet / emoji / mention at the cursor" actions:

```xmlui-pg copy display name="Insert text at the cursor" height="300px"
<App>
  <HStack>
    <Button label="Insert [TAB]" onClick="note.insert('[TAB]')" />
    <Button label="Focus" onClick="note.focus()" />
    <Button label="Clear" onClick="note.setValue('')" />
  </HStack>
  <TextArea id="note" autoSize="true"
    initialValue="Put the cursor anywhere, then Insert." />
</App>
```

**The caret is preserved while editing bound values**: When a `TextArea` is
bound to a form field (or any reactive value) that updates as the user types,
XMLUI keeps the caret where it is instead of jerking it to the end on each
re-render. `setValue`, `insert`, and this caret preservation all arrived
together in
[Preserve TextArea caret and selection while editing bound form values (#3582)](https://github.com/xmlui-org/xmlui/pull/3582).

**Turn off spellcheck / autocorrect when you don't want them**: `TextArea` (and
`TextBox`) expose `spellCheck`, `autoCorrect`, `autoComplete`, and
`autoCapitalize` as properties — set `spellCheck="false"` for code or
identifier input. See
[Expose autoComplete, autoCorrect, spellCheck, and autoCapitalize (#3579)](https://github.com/xmlui-org/xmlui/pull/3579).

---

## See also

- [Submit a form from a custom button or the Enter key](/docs/howto/submit-a-form-from-a-custom-button) — wire a `TextArea` into a form so Enter or a custom button submits it
- [Reset a form after submission](/docs/howto/reset-a-form-after-submission) — clear or restore whole-form data declaratively with `dataAfterSubmit`
- [TextArea reference](/docs/reference/components/TextArea) — the full property, event, and method list
