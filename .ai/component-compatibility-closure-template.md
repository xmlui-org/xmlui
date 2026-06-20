# Component Compatibility Closure Template

Copy this template to `.ai/<component>-compatibility-closure.md` before closing
any non-experimental component surface.

## Component

- Name:
- Planned rebuild wave:
- Current status: `not-started` | `inventoried` | `tests-ported` |
  `implemented` | `parity-tested` | `closed` | `deferred`
- Compatibility debt IDs:

## Original Source Anchors

List every relevant old source file:

- Component implementation:
- React implementation:
- Defaults:
- SCSS/theme parts:
- Docs:
- Specs:
- Website/playground examples:
- Integration-test usage:
- Metadata or generated artifact:

## Source Organization

Record how the transferred component follows the original folder pattern:

- Old component folder:
- Rewrite component folder:
- Implementation files:
- Renderer/wrapper files:
- Metadata files:
- Defaults/style/theme files:
- Documentation files:
- Old tests ported beside component:
- Runnable unit tests:
- Runnable E2E tests:
- Simplified or intentionally removed old internals:
- Source-organization deviations and reason:

## Public Contract

Record the public behavior to preserve:

- Props:
- Events:
- Methods/APIs:
- Context variables:
- Slots/templates/accepted children:
- Default values and aliases:
- Styling and theme variables:
- Accessibility behavior:
- Keyboard/focus behavior:
- Error and disabled states:
- Runtime/service interactions:

## State Mutation Requirement

Describe at least one mutation path when the component can mutate or participate
in mutable data:

- Initial rendered state:
- User/runtime action:
- State write or side effect:
- Expected rendered result:
- Test file:

If the component is purely static, say why no mutation path applies.

## Compatibility Tests

Port or create tests before marking the component `parity-tested`:

- Unit tests:
- E2E tests:
- Visual/theme tests:
- Metadata/artifact tests:
- Docs/example smoke tests:
- Package/integration tests:

## Implementation Notes

- Rewrite files:
- Old abstractions intentionally preserved:
- Old abstractions intentionally removed:
- Compatibility shims:
- Open questions:

## Verification

Commands run:

```text
npm --workspace xmlui run test
npm --workspace xmlui run test:e2e
npm --workspace xmlui run compatibility:sweep
```

Additional commands:

```text
# Add surface-specific commands here.
```

## Closure Decision

- Final status:
- Remaining debt:
- Intentional deviations:
- Obsolete old tests:
- Reviewer notes:
