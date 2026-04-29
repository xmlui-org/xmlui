# Persist form drafts across sessions

Use persist on Form to auto-save in-progress input to localStorage so unsaved drafts survive a page reload.

A blog post editor can take a long time to fill in. If the user accidentally refreshes the page or their browser crashes, all their unsaved text is gone. Setting `persist="true"` on the form silently snapshots the current field values to localStorage on every change and restores them on the next visit.

```xmlui-pg copy display name="Blog post editor with draft persistence"
---app display /persist="true"/
<App>
  <Button 
    variant="outlined" 
    label="Reset the temporary form data" 
    onClick="clearLocalStorage()"
  />
  <Form
    id="postEditor"
    persist="true"
    storageKey="blog-post-draft"
    data="{{ title: '', category: 'general', body: '' }}"
    dataAfterSubmit="clear"
    completedNotificationMessage="Post published — draft cleared!"
    onSubmit="(data) => delay(300)"
    saveLabel="Publish"
  >
    <TextBox label="Title" bindTo="title" required="true" />
    <Select label="Category" bindTo="category">
      <Items data="{['general', 'tech', 'design']}">
        <Option value="{$item}" label="{$item}" />
      </Items>
    </Select>
    <TextArea label="Body" bindTo="body" required="true" />
  </Form>
</App>
---desc
Try these steps:

1. Type in some data into the form.
2. Click the “Reset the App” button in the top-right corner of the example header. This action refreshes the example page while keeping the previously typed data.
3. Submit the form. The successful submission clears the temporary data.
4. Type some data again.
5. Click the “Reset the temporary form data” button. It will clear the persisted temporary data.
6. Click the “Reset the App” button again. This action refreshes the example page — this time, the data will be empty.
```

## Key points

**`persist="true"` saves on every keystroke**: As soon as the user types in any field, the form's current state is written to localStorage under the `storageKey`. On the next page load, the form restores those values automatically — the user continues exactly where they left off:

```xmlui
<Form persist="true" storageKey="invoice-draft" data="{{ ...empty initial values... }}">
  …
</Form>
```

**`storageKey` gives the localStorage entry a stable name**: If omitted, the form uses its `id` attribute. If neither is set, it defaults to `"form-data"` — which risks collisions when multiple forms use persistence on the same origin. Always set an explicit `storageKey` or `id`:

```xmlui
<Form id="postEditor" persist="true" storageKey="blog-post-draft">
  <!-- storageKey wins over id when both are set -->
</Form>
```

**The draft is cleared on successful submit**: After `onSubmit` completes without error, the framework clears the localStorage entry automatically. No manual cleanup is needed. Combine with `dataAfterSubmit="clear"` to also empty the visible fields:

```xmlui
<Form persist="true" storageKey="blog-post-draft" dataAfterSubmit="clear">
  <!-- submitted → field values cleared AND localStorage entry erased -->
</Form>
```

**`doNotPersistFields` excludes sensitive fields**: Pass an array of `bindTo` names to keep those fields out of localStorage while still including them in the submission:

```xmlui
<Form persist="true" doNotPersistFields="{['cardNumber', 'cvv']}">
  <TextBox bindTo="cardNumber" label="Card number" />
  <TextBox bindTo="cvv" label="CVV" />
  <!-- cardNumber and cvv are submitted normally but never written to localStorage -->
</Form>
```

**`keepOnCancel` controls draft retention after cancel**: By default, pressing Cancel clears the persisted draft. Set `keepOnCancel="true"` to preserve the draft even when the user cancels — useful for editors where Cancel closes a modal but the user might re-open it later:

```xmlui
<Form persist="true" storageKey="post-draft" keepOnCancel="true">
```

---

**See also**
- [Form component](/docs/reference/components/Form) — `persist`, `storageKey`, `doNotPersistFields`, `keepOnCancel`
- [Reset a form after submission](/docs/howto/reset-a-form-after-submission) — `dataAfterSubmit` options
