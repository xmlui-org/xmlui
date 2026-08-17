# Read data with a POST request

Set `method="post"` and `body` on a `DataSource` when a read needs a request body — a payload too large or too structured for query params.

Choose between `DataSource` and `APICall` by what the request *means*, not by its HTTP verb. `DataSource` is for data the view needs; `APICall` is for actions the user takes. A POST that returns something you render is still a read, and it belongs in a `DataSource`.

That distinction matters because the two components give you different things. A `DataSource` fetches on mount, refetches when its inputs change, and exposes `loaded`, `inProgress`, and `error`. An `APICall` does none of that — it waits to be executed. Reach for `APICall` because it is the component you have seen POST examples on, and you inherit the job of triggering the request yourself.

In the example below, the diff viewer sends a file's full text in the request body — far too big for a URL — and gets back annotated lines. Pick a file to watch the `DataSource` refetch as its `body` changes.

```xmlui-pg copy display name="Pick a file to annotate"
---app display /method="post"/ /body/
<App var.selectedFile="alpha.txt">
  <DataSource
    id="annotation"
    url="/api/annotate"
    method="post"
    body="{{ filename: selectedFile, contents: fileContents[selectedFile] }}"
  />
  <variable
    name="fileContents"
    value="{{
      'alpha.txt': 'the quick brown fox\njumps over the lazy dog',
      'beta.txt':  'pack my box with five\ndozen liquor jugs'
    }}"
  />
  <HStack verticalAlignment="center" gap="$space-3">
    <Select id="picker" initialValue="alpha.txt" onDidChange="(v) => selectedFile = v">
      <Option value="alpha.txt" label="alpha.txt" />
      <Option value="beta.txt" label="beta.txt" />
    </Select>
    <Text when="{annotation.inProgress}" value="Annotating..." />
  </HStack>
  <Card when="{annotation.loaded}">
    <Items data="{annotation.value.lines}">
      <HStack gap="$space-2">
        <Text width="2em" variant="mono" value="{$item.number}" />
        <Text variant="mono" value="{$item.text}" />
        <Text variant="secondary" value="{$item.words} words" />
      </HStack>
    </Items>
  </Card>
</App>
---api
{
  "apiUrl": "/api",
  "operations": {
    "annotate": {
      "url": "/annotate",
      "method": "post",
      "handler": "delay(400); const lines = ($requestBody.contents || '').split('\\n'); return { filename: $requestBody.filename, lines: lines.map((text, i) => ({ number: i + 1, text, words: text.split(/\\s+/).filter(Boolean).length })) };"
    }
  }
}
```

## Key points

**The read/write split is semantic, not about the verb**: `DataSource` fetches and caches data the view needs; `APICall` creates, updates, or deletes in response to something the user did. A POST-shaped read is still a read.

**`body` is serialized to JSON for you**: pass an object. If you already hold a serialized string, use `rawBody` instead and skip the second serialization.

**The request re-fires when `body` changes**: `body` is a binding like any other, so the fetch tracks its inputs. That is the whole reason to prefer `DataSource` here — no trigger to own, and no way to forget one.

**`body` is compared by value, so an inline object literal is fine**: write `body="{{ diff: $props.text }}"` directly. That expression builds a new object every time it is evaluated, but the body becomes part of the request's cache key, and cache keys are compared by their *contents* — a fresh object with the same values is the same key. There is no refetch loop to avoid, and no need to hoist the object into a `variable` to stabilize its identity. Property order does not matter either.

**Do not hand-roll the triggers with `APICall`**: the tempting alternative is an `APICall` executed from an `onInit` handler plus a `ChangeListener` on the input. Both halves fail in ways that are quiet rather than loud — [`ChangeListener` does not fire on initial mount](/docs/howto/debounce-with-changelistener), so the first render never requests anything, and a mount handler that calls `execute()` may issue nothing at all. This has been observed even where the value was already present at first render, so "my data is there, so this doesn't apply to me" is not a safe read.

**The tell is an absence, which is why it survives review**: you are looking for a request that was never made, not one that failed. Nothing turns red. There is no error, no rejected promise, and nothing to click in the network panel — the view renders, the data just looks empty, and a component with any fallback path renders something plausible. One app shipped this way for months. If a view looks under-populated and the network panel has nothing to show you, suspect a request that never fired before you go looking at rendering.

**Query params still belong in `queryParams`**: `method="post"` is for payloads that cannot fit in a URL. If the inputs are a handful of scalars, keep them in `queryParams` on a GET — it stays cacheable and readable in logs.

**There is no built-in size limit, and trimming is your job**: XMLUI does not cap the body. What will stop you is elsewhere — the server's own request-size limit, or a reverse proxy in front of it — and those failures surface as a rejected request rather than anything the component can warn about. Two local costs are worth knowing when the payload is genuinely large: the body is serialized on every request, and because it participates in the cache key it is also stringified for comparison and retained per cached entry. If you are sending something unbounded, such as a whole file, slice it at a size you choose deliberately and apply the same limit everywhere you send it.

---

## See also

- [Send custom headers per request](/docs/howto/send-custom-headers-per-request) — the other request-shaping prop shared by `DataSource` and `APICall`
- [Chain a DataSource refetch](/docs/howto/chain-a-refetch) — refreshing a read after a write completes
- [Delay a DataSource until another is ready](/docs/howto/delay-a-datasource-until-another-datasource-is-ready) — gating a fetch on another request's result
- [Debounce with ChangeListener](/docs/howto/debounce-with-changelistener) — including why it does not fire on mount
