# Verified Type Contracts

Verified type contracts use XMLUI component metadata to check your markup before
small mistakes turn into confusing runtime behavior. The same metadata that
powers component docs and editor completions also lets XMLUI warn about unknown
props, missing required props, invalid enum values, wrong literal value types,
unknown events, unknown exposed methods, and deprecated props.

## Why it helps

Type-contract diagnostics catch mistakes that otherwise look like "XMLUI ignored
my markup":

```xmlui
<App>
  <Button labe="Save" />
</App>
```

The `Button` component has a `label` prop, not `labe`, so XMLUI reports:

```txt
<Button> has unknown prop "labe". Did you mean "label"?
```

The same applies to invalid documented options:

```xmlui
<Button label="Save" variant="vibrant" />
```

If `vibrant` is not one of the supported `Button.variant` values, XMLUI reports
the invalid value instead of letting the component silently fall back or render
unexpectedly.

## What is checked

XMLUI checks component usage against the contract declared by each component's
metadata:

- Unknown props, such as `labe` instead of `label`.
- Missing required props, such as an image without a required `src`.
- Literal values with the wrong type.
- Invalid enum values, such as unsupported variants, sizes, or modes.
- Unknown events, such as a misspelled event handler name.
- Unknown exposed methods.
- Deprecated props, which remain warnings so migration guidance stays visible.

For example:

```xmlui
<App>
  <Text varian="strong">
    Contains an invalid property name
  </Text>
  <Text variant="dummy">
    Contains an invalid property value
  </Text>
</App>
```

The first `Text` reports an unknown prop and suggests `variant`. The second
reports that `dummy` is not a valid `variant` value.

## Where diagnostics appear

Type-contract diagnostics are shown in the places where you normally work:

- The VS Code language server shows them in the editor and Problems panel.
- The Vite plugin reports them during development and production builds.
- Standalone apps report them during browser startup validation.
- Runtime warning mode can report expression-bound values after they resolve.

The source for these diagnostics is `xmlui-type-contract`, which helps separate
contract messages from parser, analyzer, accessibility, and versioning messages.

## Static and runtime checks

XMLUI performs type-contract checks in two moments.

Static checks run after XMLUI parses your markup. They catch everything visible
from the markup alone:

```xmlui
<NumberBox initialValue="abc" />
<Button variant="vibrant" />
```

Runtime checks handle values that only become known after XMLUI evaluates a
reactive expression:

```xmlui
<NumberBox initialValue="{state.quantity}" />
```

The static checker does not guess what `state.quantity` will become. Once the
app runs and the expression resolves, XMLUI can check the resolved value against
the component contract and report a runtime diagnostic if it does not match.

## Strictness

Type-contract strict mode is on by default. In strict mode, error-capable
contract violations escalate from warnings to errors:

- Unknown props
- Missing required props
- Wrong literal types
- Invalid enum values
- Unknown events
- Unknown exposed methods

Deprecated props stay as warnings.

When migrating an older app, set `strictTypeContracts` to `false` to keep
contract violations as warnings while you clean up the markup:

```json
{
  "appGlobals": {
    "strictTypeContracts": false
  }
}
```

## Vite builds

The Vite plugin can run type-contract validation during builds:

```ts
viteXmluiPlugin({
  typeContracts: "warn",
});
```

Available modes:

- `"off"` disables the type-contract build pass.
- `"warn"` reports contract issues as Vite warnings.
- `"strict"` fails the build for error-severity contract violations.

At the end of the build, XMLUI prints a summary grouped by diagnostic code so
contract problems are easier to spot in larger logs.

## Standalone apps

Standalone apps run startup validation in the browser after XMLUI fetches and
parses the app files. Startup validation uses the same verifier as the language
server and Vite build path.

Standalone display is controlled by `appGlobals.lintSeverity`:

- `"warning"` prints validation issues to the browser console.
- `"error"` replaces the app with an error screen.
- `"strict"` prints console warnings and shows toast notifications.
- `"skip"` disables standalone startup validation.

`strictTypeContracts` controls diagnostic severity. `lintSeverity` controls how
standalone mode displays the issues it finds.

## Suppressing diagnostics

Type-contract diagnostics honor XMLUI suppression comments. The shared
identifier-oriented checks use the same codes as the build-validation analyzer,
so a single directive works consistently across the language server, Vite, and
standalone startup validation.

```xmlui
<App>
  <!-- xmlui-disable id-unknown-prop -->
  <Text varian="strong">
    This unknown property diagnostic is suppressed.
  </Text>

  <!-- xmlui-disable-next-line value-not-in-enum -->
  <Text variant="dummy">
    This invalid enum diagnostic is suppressed.
  </Text>
</App>
```

Common codes:

| Code | Meaning |
| --- | --- |
| `id-unknown-component` | Component tag not in the registry. |
| `id-unknown-prop` | Prop name not declared by the component. |
| `id-unknown-event` | Event handler name not declared by the component. |
| `id-unknown-method` | Exposed method name not declared by the component. |
| `value-not-in-enum` | Literal value not in a declared strict enum. |
| `wrong-type` | Literal value does not match the declared value type. |
| `missing-required` | Required prop is missing. |
| `deprecated-prop` | Deprecated prop is still in use. |

Prefer narrow suppressions near the markup they affect.

## Boundaries

Static type-contract validation does not run your app, execute expressions,
fetch data, inspect the DOM, or call React component renderers. It only uses the
parsed XMLUI tree and component metadata.

That means it is fast and safe to run in the editor and build tools, but it also
means expression-bound values are intentionally left to runtime validation.

## Related

- [Build Validation Analyzers](/docs/managed-react/build-validation-analyzers)
- [Managed React Overview](/docs/managed-react/overview)
- [Components](/docs/components-intro)
- [Validation](/docs/forms)
