# Themevars Namespace

Theme variables (the `--xmlui-*` CSS custom properties that drive component
styling) follow a fixed naming convention. Extension packages each carry a
short namespace prefix on the component segment of every theme variable
they introduce, so a theme that targets a built-in `Button` and a theme
that targets an extension package's `Button` cannot collide.

## What problems this prevents

- A theme entry such as `backgroundColor-Button` no longer accidentally
  retargets buttons from every installed extension package — it only
  applies to the core component.
- Two extension packages that both ship a component called `Viewer` can
  now be themed independently, because each ships its own prefix
  (`Pdf_Viewer`, `Tiptap_Viewer`, …).
- A user theme that misspells or omits the prefix for an extension
  component is no longer a silent no-op — it is a build-time finding
  once `strictBuildValidation` is on.
- Extension authors have a canonical place to declare their prefix
  (`Extension.themeNamespacePrefix`), so the prefix used in CSS, in the
  metadata, and in the analyzer all line up automatically.

## How it works

Every theme variable has the form
`property[-part]-[PackagePrefix_]ComponentName[-variant][--state]`. Core
components leave the prefix off; extension components carry their
package's PascalCase prefix joined to the component name with `_`.
First-party prefixes (`Animations`, `Pdf`, `Tiptap`, `Echart`, …) are
registered canonically by the framework; third-party packages declare
their own prefix in their `Extension.themeNamespacePrefix` field.

## Targeting a component in a theme

A theme JSON that wants to restyle a built-in `Button` writes:

```json
{
  "themeVars": {
    "backgroundColor-Button": "$color-primary-500",
    "textColor-Button": "white"
  }
}
```

A theme that wants to restyle the `Viewer` component from `xmlui-pdf`
writes:

```json
{
  "themeVars": {
    "backgroundColor-Pdf_Viewer": "$color-surface-100",
    "borderColor-Pdf_Viewer": "$color-surface-300"
  }
}
```

The two entries do not interfere with each other, and either one can be
present without the other.

## First-party package prefixes

| npm package          | Prefix       |
|----------------------|--------------|
| `xmlui-animations`   | `Animations` |
| `xmlui-calendar`     | `Calendar`   |
| `xmlui-crm-blocks`   | `Crm`        |
| `xmlui-devtools`     | `Devtools`   |
| `xmlui-docs-blocks`  | `Docs`       |
| `xmlui-echart`       | `Echart`     |
| `xmlui-gauge`        | `Gauge`      |
| `xmlui-grid-layout`  | `GridLayout` |
| `xmlui-masonry`      | `Masonry`    |
| `xmlui-pdf`          | `Pdf`        |
| `xmlui-react-flow`   | `ReactFlow`  |
| `xmlui-recharts`     | `Recharts`   |
| `xmlui-search`       | `Search`     |
| `xmlui-spreadsheet`  | `Spreadsheet`|
| `xmlui-tiptap-editor`| `Tiptap`     |
| `xmlui-website-blocks`| `Websites`  |

## Building a custom extension

If you are building your own extension package, declare its prefix in
the extension contract:

```ts
import { type Extension } from "xmlui";

export const extension: Extension = {
  namespace: "MyWidget",
  themeNamespacePrefix: "MyWidget",
  components: [/* … */],
};
```

The prefix should be a short, stable PascalCase token that is unlikely
to collide with first-party packages or with other extensions installed
alongside yours.

## Enabling strict mode

The analyzer rule `theming-missing-prefix` reports extension theme
variables that omit the required prefix. Severity follows the standard
build-validation knob — `info` by default, escalated to `warn`/`error`
when strict mode is on:

```json
{
  "appGlobals": {
    "strictBuildValidation": true
  }
}
```

In `xmlui.config.json` you can also override the rule individually,
which is what the create-app templates do out of the box:

```json
{
  "analyzer": {
    "rules": {
      "theming-missing-prefix": "warn"
    }
  }
}
```

## Related

- [Theming](/docs/theming)
- [Centralized HTTP](/docs/managed-react/http-centralization)
- [Verified Type Contracts](/docs/managed-react/verified-type-contracts)
- [Managed React Overview](/docs/managed-react/overview)
