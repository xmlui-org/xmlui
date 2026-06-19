# Experiment 4 Reactive Graph Findings

Date: 2026-06-19

## Old XMLUI Compatibility Notes

Sources inspected:

- `/Users/dotneteer/source/xmlui/website/content/docs/pages/markup.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/scripting.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/scoping.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/xmlui-config.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/container/event-handlers.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/xmlui-parser.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/optimization/computedUses`
- `/Users/dotneteer/source/xmlui/xmlui/src/language-server/services/reactive-cycle-diagnostic.ts`

Key behavior:

- `var.name="{expr}"` starts as a reactive binding. XMLUI re-evaluates the
  initializer expression when dependencies change.
- Assigning to that same variable in an event handler switches the variable to
  an assigned runtime value. After that, the variable no longer follows the
  initializer expression.
- Docs call this intentional: explicit assignment means "from now on, use this
  runtime value for this variable."
- Globals declared through `global.*` or `Globals.xs` are reactive and visible
  app-wide. Current experiment will implement markup `global.*` first.
- Locals flow downward through nested markup in the same XMLUI file, but stop
  at user-defined component boundaries unless passed as props.
- The old framework has `computedUses` and reactive-cycle diagnostics. Those
  features support narrowed rerendering and editor/build feedback, but this
  experiment should implement the smaller runtime graph needed for derived
  vars/globals first.
- Existing configuration includes `strictReactiveGraph`, confirming reactive
  cycles are a first-class diagnostic concern in old XMLUI.

## Current Rewrite Implications

- Derived values should be compiled expression functions. No AST interpreter or
  string evaluation should be added.
- Runtime graph keys must include owner identity for locals, but globals can be
  keyed by name.
- Initial implementation can eagerly recompute affected derived values on
  source writes. This keeps event handlers and rendered bindings observing
  updated values immediately.
- A derived local that depends on `$props` must be recomputed when component
  props change. The current component instance already reevaluates props through
  dependency subscriptions; Experiment 4 needs to connect those changes to the
  child component's local derived graph.
- Cycle diagnostics should be source-aware and reusable by future VS Code/LSP
  work, but this experiment can focus on cycles among local/global derived
  variables in the current descriptor model.
