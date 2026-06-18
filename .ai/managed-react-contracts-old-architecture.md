# Managed React Contracts Old Architecture Notes

Old XMLUI references:

- `/Users/dotneteer/source/xmlui/xmlui/src/abstractions/ComponentDefs.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/type-contracts/verifier.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/language-server/services/common/metadata-utils.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/language-server/services/completion.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/language-server/services/type-contract-diagnostic.ts`

Compatibility lessons to keep:

- Component metadata is shared by tooling and validation. The language server
  uses metadata for completion and hover, while type-contract diagnostics use
  the same registry for unknown components, props, and events.
- Contract diagnostics are pure and source-located. The verifier returns
  diagnostic objects; callers decide whether to show warnings, fail builds, or
  adapt them to LSP diagnostics.
- Unknown component, unknown prop, and unknown event diagnostics are separate
  concepts with stable codes.
- Expression-valued props are generally skipped for static value checks because
  the runtime value is not known during compilation.

Simplifications for the experiment:

- No full metadata schema, behavior props, layout props, accessibility rules,
  deprecation checks, strict modes, or runtime type coercion.
- Built-in metadata is limited to `App`, `H1`, and `Button`.
- User-defined components are registered by name and accept props
  permissively until explicit component prop declarations are designed.
