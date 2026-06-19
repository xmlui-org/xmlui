# Experiment 6: Built-In Component Expansion Findings

Initial compatibility audit:

- `Text`, `Button`, `Stack`, `HStack`, `VStack`, `Items`, `TextBox`, `Checkbox`, `Select`, and `Option` are enough to move from counter-style samples to a small realistic app.
- The old XMLUI components are metadata-rich and theme-aware. This experiment should keep visual behavior intentionally native/minimal and focus on runtime contracts.
- `Items` is the first built-in that strongly exercises context variables. The compatible subset should support `$item`, `$itemIndex`, `$isFirst`, and `$isLast`, plus default children and `itemTemplate`.
- Input components should prove parent-state mutation through compiled event handlers. `TextBox`, `Checkbox`, and `Select` should use XMLUI's public `didChange` event, authored as `onDidChange`, with one payload argument.
- Current expression syntax supports arrow expressions and array methods, but not object spread or statement-bodied arrows. The combined sample should avoid object-spread task mutation for now.
- Built-in metadata needs to grow beyond props/events soon, but a minimal optional schema for APIs, template properties, and context variables is enough for this experiment.
- Uppercase built-ins must be explicitly known to IR lowering. Otherwise new built-ins such as `VStack` are mistaken for user-defined component references.
- Native input wrappers are enough to prove compiled `didChange` handlers and parent-state mutation for the first realistic built-in sample.
- `TextBox` and `Checkbox` should not advertise public `value`/`checked` props just because the native HTML elements use those names. The original XMLUI public contract uses `initialValue`; `Select.value` exists in old metadata but is marked internal.
- `Option` uses `enabled`, not `disabled`.

Deferred compatibility:

- Full theming, spacing tokens, validation, form integration, accessibility parity, and advanced Select/Option templating remain outside Experiment 6.
- Imperative APIs such as `focus()` should not be advertised in metadata until the runtime reference table exposes them.
