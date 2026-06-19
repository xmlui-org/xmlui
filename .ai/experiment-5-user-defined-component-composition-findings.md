# Experiment 5: User-Defined Component Composition Findings

Experiment 5 showed that user-defined component composition can be modeled with a small set of explicit runtime contracts instead of rebuilding the original container stack.

Key findings:

- Projected children and template properties work well as render fragments bound to the caller scope.
- Component internals need an isolated runtime scope; otherwise parent locals leak into user-defined components too easily.
- Slots are the boundary crossing point: a `<Slot>` renders caller-authored markup while evaluating its own slot attributes in the component scope.
- Slot context values can be exposed as `$`-prefixed context reads without turning them into mutable state slots.
- Custom events are naturally represented as caller-scope event handlers stored on the component instance node and invoked by `emitEvent`.
- Component methods fit the same compiled handler machinery as events, with one addition: handlers now return the final expression value.
- Component `id` references are not ordinary variables. Treating them as a separate reference lookup keeps state declarations and imperative component APIs distinct.
- `$self` can be implemented as a component-local reference that points at the exported method table.
- A tiny `Items` built-in was enough to validate list-style slot context without committing to the full built-in catalog yet.

Current limitations worth revisiting:

- JavaScript `return` statements are not parsed yet; method returns currently use final-expression semantics.
- Template-property diagnostics should become source-aware compile diagnostics.
- `id` is still parsed as a normal prop before the runtime treats it as a component reference. The original framework reserves `id`, so this should be tightened later.
- The reference lookup path is intentionally narrow. Future component APIs should define clearer metadata for exposed methods and diagnostics.

