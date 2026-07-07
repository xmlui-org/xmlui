# Canonicalize application URLs

Set URL canonicalization policy so alternate spellings collapse to one visible address.

Canonical URLs prevent duplicate cache keys, inconsistent share links, and route state that differs only by case, slash, or query parameter order. In strict routing, non-canonical URLs are diagnostics; `rewrite` and `redirect` also update the address bar.

```xmlui-pg copy display name="Rewrite a report URL to its canonical form" id="rewrite-a-report-url-to-its-canonical-form" height="330px"
---app display /\$pathname/ /\$queryString/
<App scrollWholePage="false">
  <Pages>
    <Page url="/">
      <VStack gap="$space-3">
        <Text variant="strong">Reports home</Text>
        <Button
          label="Open messy report URL"
          onClick="navigate('/Reports/?z=last&a=first')"
        />
      </VStack>
    </Page>

    <Page url="/reports">
      <VStack gap="$space-2">
        <Text variant="strong">Report route</Text>
        <Text>Path: {$pathname}</Text>
        <Text>Query string: {$queryString}</Text>
        <Button label="Back home" onClick="navigate('/')" />
      </VStack>
    </Page>
  </Pages>
</App>
---config
{
  "xmluiConfig": {
    "urlCase": "lower",
    "urlTrailingSlash": "never",
    "urlQueryParamOrder": "alphabetical",
    "nonCanonicalUrl": "rewrite"
  }
}
```

## Key points

**Choose the canonical shape once**: `urlCase`, `urlTrailingSlash`, and `urlQueryParamOrder` describe the URL your app wants to expose.

**Use `rewrite` for invisible cleanup**: `nonCanonicalUrl: "rewrite"` updates the visible URL without adding a new history entry. Use `redirect` when you want redirect semantics.

**Expect diagnostics on mismatches**: A non-canonical incoming URL emits a `non-canonical-url` navigation diagnostic before XMLUI rewrites or redirects it.

**Keep page routes canonical too**: Define routes in the canonical form, such as `/reports`, even if users may arrive with `/Reports/`.

---

## See also

- [Validate query parameters in a page route](/docs/howto/validate-query-parameters-in-a-page-route) — defend query values after canonical ordering
- [Navigate programmatically](/docs/howto/navigate-programmatically) — generate cleaner URLs from handlers
- [Defended Routing](/docs/managed-react/defended-routing) — canonicalization policy reference
