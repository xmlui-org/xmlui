# Managed React Contracts Compatibility Closure

Implemented slice:

- Added a tiny Managed React contract layer under
  `xmlui/src/compiler/contracts/`.
- Added contract types, built-in contracts, registry creation, user component
  registration, event-name normalization, IR validation, and LSP-shaped
  metadata export.
- Integrated contract validation into `compileXmluiModule` after Compiler IR
  construction and before code generation.
- Added focused contract tests for built-ins, user components, unknown
  components, unsupported props/events, invalid declarations, diagnostics,
  metadata export, and compile-time propagation.

Compatibility preserved now:

- `App`, `H1`, and `Button` are known contracts.
- `Button label` and `Button onClick` remain valid.
- `App var.*` and `App global.*` remain valid.
- User-defined components are registered by name and may receive arbitrary
  props for `$props`.
- Component modules may declare local `var.*` state on their root.
- Global declarations inside component modules are rejected for the initial
  subset.
- Existing runtime render errors remain as a last-resort backstop.

Intentional omissions:

- No full old metadata schema.
- No generated documentation metadata.
- No prop type coercion, enum validation, required-prop validation, or
  deprecation diagnostics.
- No behavior/layout props, accessibility checks, lifecycle events, component
  APIs, strict modes, theming, localization, DOM sandbox, audit logging, or
  versioning contracts.
- Unknown component diagnostics may still surface from the earlier IR
  validation path in compile-time failures when IR already has a precise error.

Next natural experiment:

- Verification Harness: build reusable test helpers and compatibility mapping
  so old XMLUI unit/E2E cases can be ported with minimal changes.
