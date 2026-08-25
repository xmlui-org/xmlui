# Inline one-use action components

Move an action component into the `<event>` block when it is only triggered from one place.

`APICall` is often declared with an `id` so another component can call `execute()`. That is useful when several controls share the same operation, or when you need to inspect state such as `inProgress` and `lastError`. If the action exists only to serve a single button, the markup is usually easier to read when the action sits directly inside that button's event handler.

## Before: action declared elsewhere

This pattern is useful when the action is reused, but it adds distance between the button and the request it sends:

```xmlui
<APICall
  id="archiveTask"
  method="post"
  url="/api/tasks/{$param}/archive"
  onSuccess="() => tasks = tasks.filter(task => task.id !== $param)"
/>

<Items data="{tasks}">
  <Button
    label="Archive"
    onClick="archiveTask.execute($item.id)"
  />
</Items>
```

## After: action inside the event

When the action belongs to this button alone, move it into the button's `click` event and transpose the `execute()` argument into the action's own bindings:

```xmlui-pg copy display name="Inline a one-use APICall" id="inline-a-one-use-apicall" height="300px"
---app display /<event name="click">/
<App var.tasks="{[
  { id: 1, title: 'Write release notes' },
  { id: 2, title: 'Review pull request' }
]}" var.archivedTitle="''">
  <VStack gap="$space-3" padding="$space-4">
    <Text variant="strong">Open tasks</Text>

    <Items data="{tasks}">
      <HStack verticalAlignment="center">
        <Text>{$item.title}</Text>
        <SpaceFiller />
        <Button label="Archive" size="sm">
          <event name="click">
            <APICall
              method="post"
              url="/api/tasks/{$item.id}/archive"
              onSuccess="() => {
                archivedTitle = $item.title;
                tasks = tasks.filter(task => task.id !== $item.id);
              }"
            />
          </event>
        </Button>
      </HStack>
    </Items>

    <Text when="{archivedTitle}" themeColor="success">
      Archived: {archivedTitle}
    </Text>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "operations": {
    "archive-task": {
      "url": "/tasks/:id/archive",
      "method": "post",
      "pathParamTypes": {
        "id": "integer"
      },
      "handler": "return { id: $pathParams.id }"
    }
  }
}
```

The important detail is the argument movement:

```xmlui
<!-- Before -->
url="/api/tasks/{$param}/archive"
onClick="archiveTask.execute($item.id)"

<!-- After -->
url="/api/tasks/{$item.id}/archive"
```

## Transpose all `execute()` parameters

`execute()` can receive more than one value. In an id-based action, the first argument is available as `$param`, and all arguments are available through `$params`. When you inline the action, move each argument to the place where it is used.

```xmlui
<!-- Before -->
<APICall
  id="changeRole"
  method="put"
  url="/api/users/{$param}/role"
  body="{{ role: $params[1] }}"
/>

<Button
  label="Make admin"
  onClick="changeRole.execute($item.id, 'admin')"
/>
```

```xmlui
<!-- After -->
<Button label="Make admin">
  <event name="click">
    <APICall
      method="put"
      url="/api/users/{$item.id}/role"
      body="{{ role: 'admin' }}"
    />
  </event>
</Button>
```

Use the same rule for computed values:

```xmlui
<!-- Before -->
onClick="changeRole.execute($item.id, roleSelector.value)"

<!-- After -->
url="/api/users/{$item.id}/role"
body="{{ role: roleSelector.value }}"
```

## Downloads and uploads

The same inline-event shape works for declarative file actions.

For a one-use download button, put `FileDownload` inside the click event and bind directly to the current row:

```xmlui
<Button label="Download invoice" icon="download">
  <event name="click">
    <FileDownload
      url="/api/invoices/{$item.id}/pdf"
      fileName="invoice-{$item.id}.pdf"
    />
  </event>
</Button>
```

For a one-use drop-zone upload, the `upload` event receives the selected files. Move the file value into the `FileUpload` declaration:

```xmlui
<FileUploadDropZone text="Drop a receipt">
  <event name="upload">
    <FileUpload
      url="/api/receipts"
      file="{$param[0]}"
      fieldName="receipt"
      onSuccess="toast.success('Receipt uploaded')"
    />
  </event>
</FileUploadDropZone>
```

## When to keep the `id`

Keep the action outside the event when more than one component calls it, when you need its state in the UI, or when another handler needs to call methods such as `execute()` or `cancel()`.

```xmlui
<APICall id="saveDraft" method="post" url="/api/drafts" />

<Button label="Save" onClick="saveDraft.execute()" />
<Button label="Save and close" onClick="saveDraft.execute(); close()" />
<Spinner when="{saveDraft.inProgress}" />
```

## Key points

**Inline actions reduce lookup distance**: The request is next to the event that fires it, which is easier to scan when the operation is not shared.

**Move parameter values, not parameter names**: Replace `$param` and `$params[n]` with the original expressions passed to `execute()`.

**The `<event>` tag is required for component-based handlers**: Use it when the handler body contains `APICall`, `FileDownload`, or `FileUpload`.

**Keep ids for shared or stateful operations**: Reuse, cancellation, retry buttons, and visible progress usually need an addressable action.

---

## See also

- [Helper Tags](/docs/helper-tags) - use `<event>` for component-based handlers
- [Retry a failed API call](/docs/howto/retry-a-failed-api-call) - keep an `APICall` id when you need retry state
- [Download a file from an API](/docs/howto/download-a-file-from-an-api) - download files from event handlers
