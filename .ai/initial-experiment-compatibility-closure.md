# Initial Experiment Compatibility Closure

Date: 2026-06-18

The initial Vite counter experiment is considered successful.

## Proven Surface

- Vite dev-server mode can import `.xmlui` files directly through the rewrite's
  compiler plugin.
- The compiler parses XMLUI markup, parses embedded expressions/events, builds
  semantic IR, validates the minimal Managed React contracts, emits JavaScript
  modules, and attaches compiled expression/event functions to runtime
  descriptors.
- Rendering remains runtime-owned. The compiler emits only expression and event
  functions, not React components or render functions.
- The available samples prove:
  - local `var.count` initialization, reads, writes, and invalidation;
  - repeated user component instances with isolated local state;
  - app-level `global.count` shared by child components;
  - local `var.count` shadowing a global with the same name;
  - `$props.label || fallback` expression compilation.
- Temporary browser console diagnostics were useful for proving generated
  functions were running, then removed from runtime code before declaring the
  experiment successful.

## Useful Artifacts

- Human-facing result summary:
  `.experiment/result-1.md`
- Current sample sources:
  `xmlui/src/examples/counter-local/Main.xmlui`
  `xmlui/src/examples/counter-components/Main.xmlui`
  `xmlui/src/examples/counter-components/IncrementButton.xmlui`
  `xmlui/src/examples/counter-globals/Main.xmlui`
  `xmlui/src/examples/counter-globals/IncrementButton.xmlui`

## Verification

The final runtime after diagnostic removal passed:

```text
npm --workspace xmlui run test
npm --workspace xmlui run build
```

## Next Work

Experiment 2 should broaden expression compilation while preserving the
compiler/runtime boundary proven here. The important next question is whether
XMLUI's broader expression semantics can be compiled to explicit JavaScript
functions without reintroducing an interpreter or losing dependency metadata.
