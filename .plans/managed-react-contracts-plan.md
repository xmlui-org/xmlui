# XMLUI Minimal Managed React Contracts Plan

Status: implemented  
Parent plan: `.plans/master-plan.md`, section `9. Minimal Managed React Contracts`

## Scope

This plan covers the next compiler/runtime slice: adding the smallest useful
Managed React contract layer for the current experiment. The contract layer
should let the compiler know which components, props, events, and declaration
forms are valid for the initial XMLUI subset, while keeping rendering,
state, and generated expression/event execution in their existing runtime
boundaries.

The first implementation still targets Vite dev-server mode and the three
counter examples:

- `App` with `var.*` and `global.*`;
- `H1` with children;
- `Button` with optional `label`, children, and `onClick`;
- user-defined components declared with `<Component name="...">` and used by
  PascalCase component references.

Required now:

- a tiny component contract registry for `App`, `H1`, `Button`, and
  user-defined components;
- allowed prop/event validation for the initial built-ins;
- user-defined component names registered from sibling component modules;
- clear diagnostics for unknown components and unknown events;
- enough variable/global declaration validation to prevent silent unresolved
  writes;
- source locations carried with all diagnostics;
- VS Code/LSP-friendly contract metadata that can later power completion,
  hover, and diagnostics without duplicating rules.

Out of scope for this slice:

- generated docs metadata;
- full prop type coercion;
- strict modes;
- accessibility diagnostics;
- lifecycle and concurrency contracts;
- i18n, DOM sandbox, audit logging, theme sandboxing, and versioning
  diagnostics;
- full old metadata schema compatibility;
- runtime behavior changes beyond clearer developer errors.

## Compatibility Baseline

Old XMLUI sources to learn from:

- component metadata in `ComponentMetadata`;
- type-contract diagnostics from `verifyComponentDef`;
- language-server metadata provider shape;
- completion and hover services that consume component metadata;
- parser/transform diagnostics for invalid globals, props, and events.

Compatibility lessons to keep:

- Component metadata is a shared contract for compiler diagnostics, language
  services, and runtime checks.
- Unknown components, unknown props, and unknown events should be reported with
  source ranges and stable diagnostic codes.
- Expression-valued props are usually not type-checked until runtime because
  their values are not statically known.
- User-defined components need a public contract shape even when the initial
  contract only exposes the component name and accepts passed props.

Do not copy the old full metadata registry, behavior metadata, layout props,
accessibility rules, type coercion rules, deprecation handling, or strict
contract modes for this experiment.

## Current Starting Point

The current compiler/runtime already has:

- parser source ranges for elements, attributes, text, expressions, and events;
- semantic expression/event diagnostics for unresolved reads and invalid writes;
- Compiler IR with structural nodes, bindings, events, scopes, dependencies,
  writes, invalidations, and source references;
- generated expression/event functions attached to runtime descriptors;
- runtime rendering for `App`, `H1`, `Button`, and user-defined components;
- runtime render errors for unknown components.

The missing piece is a compiler-facing contract registry and validation pass.
Today, a typo in a component or event may be discovered too late, and the VS
Code extension has no small shared metadata model to reuse for contract-aware
syntax support later.

## Design Principles

- Contracts are compiler/runtime metadata, not rendering code.
- Keep the first registry tiny and explicit.
- Diagnostics should be stable, source-located, and useful in both Vite and
  future LSP flows.
- User-defined components should participate in the same registry interface as
  built-ins, even if their first contract is permissive about props.
- Prop/event validation should be conservative: report only what is certainly
  unsupported in the initial subset.
- Do not add full prop type coercion. Expression values remain opaque for this
  slice.
- Runtime render errors can remain as a backstop, but compiler diagnostics
  should catch known contract failures earlier.

## Proposed Contract Units

Build contract support as small compiler/runtime modules:

- `compiler/contracts/types.ts`
  - component contract, prop contract, event contract, declaration contract,
    diagnostic code, and registry types.

- `compiler/contracts/builtins.ts`
  - built-in contracts for `App`, `H1`, and `Button`.
  - `App` allows `var.*`, `global.*`, and children.
  - `H1` allows children and no initial events.
  - `Button` allows `label`, children, and `click`/`onClick`.

- `compiler/contracts/registry.ts`
  - create a registry from built-ins plus user-defined component definitions.
  - provide lookup APIs for compiler validation and future LSP adapters.

- `compiler/contracts/validate.ts`
  - validate `XmluiModuleIr` or the lowered XMLUI structure against the
    registry.
  - produce source-located diagnostics for unknown components, props, events,
    duplicate declarations, and invalid declaration placement.

- `compiler/contracts/lsp.ts`
  - expose protocol-shaped metadata for future completion/hover/diagnostic
    integration without depending on VS Code APIs.

Names can change during implementation, but the rules should stay separate
from parsing, IR lowering, code generation, rendering, and runtime state.

## Initial Contract Surface

Built-in contracts:

- `App`
  - kind: built-in root component;
  - allowed props: none in the initial slice;
  - allowed events: none in the initial slice;
  - allowed declarations: `var.*`, `global.*`;
  - children allowed.

- `H1`
  - kind: built-in element;
  - allowed props: none in the initial slice;
  - allowed events: none in the initial slice;
  - children allowed.

- `Button`
  - kind: built-in element;
  - allowed props: `label`;
  - allowed events: `click`;
  - children allowed.

- User-defined components
  - kind: user component;
  - name comes from `<Component name="...">`;
  - props are accepted permissively for now and flow through `$props`;
  - events are not accepted until explicitly declared in a later experiment;
  - declarations on the component root may include `var.*` but not `global.*`
    for the initial compatibility rule unless master-plan examples require it.

Event naming:

- Author syntax uses attributes such as `onClick`.
- The parsed/runtime event name is `click`.
- Contract diagnostics should mention the author-facing attribute when possible
  and normalize to the runtime event name internally.

## Diagnostics

Introduce a small diagnostic family:

- `XC001` unknown component;
- `XC002` unknown prop;
- `XC003` unknown event;
- `XC004` invalid declaration placement;
- `XC005` duplicate state declaration;
- `XC006` unresolved event write target, if not already reported earlier;
- `XC007` invalid user-defined component name.

Diagnostic requirements:

- each diagnostic has `code`, `message`, `severity`, `sourceId`, and span;
- diagnostics should attach to the narrowest useful source range;
- diagnostics should be returned through existing compiler diagnostics and
  should fail Vite transform for errors;
- VS Code adapters should be able to translate them without recomputing
  contract rules.

## Integration Points

Compiler integration:

- create the contract registry while compiling a `.xmlui` module;
- include sibling user-defined component names in the registry;
- validate the compiler IR before code generation;
- surface the first error in `compileXmluiModule` consistently with existing
  parser/semantic/IR failures.

Runtime integration:

- keep current render errors as a last-resort guard;
- do not change runtime behavior for valid apps;
- optionally map runtime unknown-component errors to contract-style messages
  if a generated descriptor reaches runtime without compiler validation.

VS Code/LSP preparation:

- expose registry data in a simple JSON-compatible shape;
- add tests that show completion/diagnostic adapters can list component names,
  allowed props, and allowed events without importing runtime renderer modules.

## Implementation Steps

Each step should be independently implementable and tested. A step is complete
only when focused tests pass and existing compiler, runtime, VS Code, and E2E
checks still pass when relevant.

1. Old metadata and type-contract notes — completed
   - Inspect old component metadata, type-contract verifier, and language
     server metadata provider.
   - Record concise findings in `.ai/managed-react-contracts-old-architecture.md`.
   - Tests: none required.

2. Contract type surface — completed
   - Add types for component contracts, prop contracts, event contracts,
     declaration permissions, contract diagnostics, and registry lookup.
   - Keep the shape JSON-compatible for future LSP use.
   - Tests: contract construction and diagnostic shape fixtures.

3. Built-in contract registry — completed
   - Add built-in contracts for `App`, `H1`, and `Button`.
   - Normalize event attribute names such as `onClick` to `click`.
   - Tests: built-in lookup, allowed props/events, and event-name
     normalization.

4. User-defined component registration — completed
   - Register component definitions from `<Component name="...">` and sibling
     component modules.
   - Validate component names with the parser/source span model.
   - Tests: `IncrementButton` registration, duplicate user component names,
     invalid names, and sibling registration.

5. Component and prop validation — completed
   - Validate built-in and user-defined component references.
   - Report unknown built-in/user component references and unsupported props on
     built-ins.
   - Treat `var.*` and `global.*` as declarations, not props.
   - Tests: valid examples, unknown `<Bogus />`, unknown `Button foo`, and
     permissive user-component props.

6. Event validation — completed
   - Validate `on*` attributes against component contracts.
   - Preserve `Button onClick`; reject unsupported events such as `H1 onClick`
     for the initial slice.
   - Tests: valid `Button onClick`, unknown event diagnostics, and event span
     ranges.

7. Declaration validation — completed
   - Validate local/global declaration placement and duplicate declarations
     enough to prevent silent unresolved writes.
   - Reuse existing semantic diagnostics where possible and avoid duplicate
     messages for the same issue.
   - Tests: duplicate `var.count`, invalid `global.*` on user component if
     disallowed, unresolved `count++`, and local/global shadowing remains valid.

8. Compiler integration — completed
   - Run contract validation after IR construction and before code generation.
   - Surface diagnostics through `compileXmluiModule`.
   - Tests: Vite module compile success for the three examples and compile
     failure for contract violations.

9. VS Code/LSP metadata adapter — completed
   - Expose contract metadata for component names, props, and events in a
     VS Code-neutral shape.
   - Extend extension tests only where current syntax support can consume the
     metadata without becoming a full language server.
   - Tests: metadata snapshot and simple adapter lookup tests.

10. Runtime backstop errors — completed
    - Keep runtime unknown-component errors clear and align wording with
      contract diagnostics where practical.
    - Tests: runtime render error message for an unknown component descriptor.

11. E2E validation — completed
    - Run all three counter scenarios in Vite dev-server mode.
    - Add one negative compile/diagnostic fixture if it can run outside
      Playwright; do not turn E2E into a diagnostics harness yet.
    - Tests: Playwright local, component, and global/shadowing counters.

12. Compatibility and omission closure — completed
    - Record preserved behavior, intentional omissions, and the Verification
      Harness handoff in `.ai/managed-react-contracts-compatibility-closure.md`.
    - Mark this plan complete when checks pass.
    - Tests: full compiler/unit/build/extension/E2E matrix.

## Test Requirements

Required coverage:

- built-in contract lookup;
- user component registration;
- event-name normalization;
- allowed and unsupported props;
- allowed and unsupported events;
- unknown component diagnostics;
- declaration validation for duplicate or invalid state declarations;
- source ranges on contract diagnostics;
- `compileXmluiModule` diagnostic propagation;
- LSP-shaped metadata snapshots;
- E2E behavior for all three counter examples remains unchanged.

## Risks

- Over-copying the old metadata system would add a large surface too early.
  Keep this registry tiny and focused on diagnostics needed now.
- Rejecting too many props/events can break future XMLUI compatibility. Be
  conservative and defer uncertain validation.
- User-defined component prop contracts are not known yet. Keep them
  permissive until component prop declarations are designed.
- Diagnostics from parser, semantic binding, IR validation, and contracts can
  overlap. Tests should assert one clear error for common failures.
- VS Code support should consume metadata, not invent a parallel registry.

## Deferred Features

- full metadata schema;
- generated docs metadata;
- prop type coercion and enum validation;
- required prop validation;
- deprecation diagnostics;
- layout and behavior props;
- accessibility checks;
- lifecycle events;
- component APIs and methods;
- strict modes;
- localization and theming contracts;
- DOM sandbox and audit diagnostics;
- release/versioning contract checks.
