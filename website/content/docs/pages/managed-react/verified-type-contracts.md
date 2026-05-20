# Verified Type Contracts

Verified type contracts use XMLUI component metadata to check your markup before small mistakes turn into confusing runtime behavior. The framework now warns when a component receives a prop, event, value, or enum option that does not match the contract declared by the component.

## What problems this prevents

- Typos in prop names, such as `labe` instead of `label`, now produce a clear diagnostic instead of silently doing nothing.
- Invalid enum values, such as an unsupported button variant, are caught against the component's documented options.
- Literal values with the wrong type are reported before the component tries to coerce them.
- Missing required props are surfaced as component-level diagnostics.
- Expression-bound props are checked after their value resolves, so dynamic values can still produce runtime warnings.

## How it works

Each built-in component declares metadata for its props, events, accepted values, and refined value types. XMLUI uses that metadata in the language server, the Vite plugin, and runtime warning mode, so the same contract is enforced in the editor, during builds, and when expression values resolve in the browser.

## Using warn-only mode

Type-contract strict mode is on by default. Set `strictTypeContracts` to `false` when migrating an older app and you want contract violations to remain warnings while you clean up markup.

```json
{
  "appGlobals": {
    "strictTypeContracts": false
  }
}
```

In strict mode, unknown props, missing required props, wrong literal types, and invalid enum values escalate from warnings to errors. Deprecated props remain warnings so migration guidance stays visible without blocking the app.

## Related

- [Managed React Overview](/docs/managed-react/overview)
- [Components](/docs/components)
- [Validation](/docs/forms)
