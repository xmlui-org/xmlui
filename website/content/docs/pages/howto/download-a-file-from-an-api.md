# Download a file from an API

Use `Actions.download()` to fetch a file from a URL and trigger the browser's save dialog.

When users need to export a report, download an attachment, or save generated content, call `Actions.download()` from a button's click handler. For simple GET requests the browser handles the download natively with a progress bar. For POST requests or when custom headers are required, the framework fetches the file in the background and then prompts the save dialog.

```xmlui-pg copy display name="Download a report"
---app display {8-14}
<App>
  <VStack>
    <Text variant="h5">Monthly Reports</Text>

    <Card>
      <HStack>
        <VStack>
          <Text>Sales Report — June 2025</Text>
          <Text variant="caption">CSV · 2.4 KB</Text>
        </VStack>
        <SpaceFiller />
        <Button
          label="Download"
          icon="download"
          onClick="Actions.download({ 
              url: '/api/reports/june-2025', 
              fileName: 'sales-june-2025.csv' 
          })"
          themeColor="primary"
          variant="outlined"
        />
      </HStack>
    </Card>

    <Card padding="$space-3">
      <HStack>
        <VStack>
          <Text>Inventory Snapshot</Text>
          <Text variant="caption">JSON · 1.1 KB</Text>
        </VStack>
        <SpaceFiller />
        <Button
          label="Download"
          icon="download"
          onClick="Actions.download({ 
            url: '/api/reports/inventory', 
            method: 'post', 
            body: { format: 'json' }, 
            fileName: 'inventory.json' 
          })"
          variant="outlined"
        />
      </HStack>
    </Card>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "operations": {
    "get-report": {
      "url": "/reports/june-2025",
      "method": "get",
      "handler": "return 'Month,Revenue\\nJan,12000\\nFeb,15000\\nMar,13500\\nApr,16200\\nMay,14800\\nJun,17300'"
    },
    "post-report": {
      "url": "/reports/inventory",
      "method": "post",
      "handler": "return JSON.stringify({ items: [ { sku: 'A1', qty: 42 }, { sku: 'B2', qty: 17 } ] })"
    }
  }
}
```

## Key points

**`Actions.download()` is the primary download API**: Call it from any event handler with an object containing at least `url`. Use `fileName` to suggest a save name, `method` for non-GET requests, and `body` / `headers` as needed.

**GET requests use the browser's native download**: For simple GET downloads without custom headers, the framework uses a hidden iframe so the browser shows its own download progress bar.

**POST and authenticated requests are fetched first**: When the method is not GET or global headers are present, the file is downloaded via `fetch`, then offered to the user through a programmatic anchor click.

**You can also use the declarative `FileDownload` element**: Inside an event block, place a `<FileDownload url="..." fileName="..." />` element to configure the download declaratively.

---

## See also

- [Send custom headers per request](/docs/howto/send-custom-headers-per-request) — attach auth tokens to download requests
- [Track a long-running server task](/docs/howto/handle-background-operations) — process large exports in the background
- [Retry a failed API call](/docs/howto/retry-a-failed-api-call) — handle download failures gracefully
