# App Globals

`appGlobals` is for values that belong to your application logic and that your markup or scripts read through the `appGlobals` global.

Use it for domain-specific data, labels, feature flags, or constants that your own components and expressions need. Do not use it for XMLUI framework settings or data that should be loaded from a backend.

```xmlui
<Text>{appGlobals.productName}</Text>
<Button enabled="{appGlobals.features.canExport}" label="Export" />
```

Framework and runtime settings belong under [`xmluiConfig`](/docs/xmlui-config). XMLUI still falls back to old `appGlobals` values for those settings during the compatibility period, but new apps should put all built-in configuration in `xmluiConfig`.

> [!WARNING] **Deprecation notice**: placing framework / runtime settings under `appGlobals` is still supported today via fallback, but this behaviour will be **deprecated in an upcoming minor release**. Move built-in settings such as `apiUrl`, `headers`, `notifications`, `prefetchedContent`, `showHeadingAnchors`, `disableInlineStyle`, `xsVerbose`, and the `strict*` family to [`xmluiConfig`](/docs/xmlui-config).

---

## Examples

### Product labels and contact details

```json
{
  "name": "Support Portal",
  "appGlobals": {
    "productName": "Acme Support",
    "supportEmail": "support@example.com",
    "legalLinks": {
      "terms": "https://example.com/terms",
      "privacy": "https://example.com/privacy"
    }
  }
}
```

```xmlui
<Text>{appGlobals.productName}</Text>
<Link to="{'mailto:' + appGlobals.supportEmail}">{appGlobals.supportEmail}</Link>
<Link to="{appGlobals.legalLinks.privacy}">Privacy policy</Link>
```

### Application feature flags

```json
{
  "appGlobals": {
    "features": {
      "canExport": true,
      "showBetaReports": false
    }
  }
}
```

```xmlui
<Button when="{appGlobals.features.canExport}" label="Export" />
<ReportsPanel when="{appGlobals.features.showBetaReports}" />
```

### Domain constants

```json
{
  "appGlobals": {
    "orderStatuses": [
      { "id": "new", "label": "New" },
      { "id": "packed", "label": "Packed" },
      { "id": "shipped", "label": "Shipped" }
    ]
  }
}
```

```xmlui
<Select data="{appGlobals.orderStatuses}" optionLabel="label" optionValue="id" />
```

---

## Component authors

Component authors can read raw application globals with `useAppGlobals()`. Use this only for app-specific values. Use `useXmluiConfig()` for framework/runtime settings because it returns the merged compatibility view where `xmluiConfig` overrides legacy `appGlobals` values.
