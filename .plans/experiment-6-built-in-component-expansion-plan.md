# Experiment 6: Built-In Component Expansion Plan

Status: implemented

Parent plan: `.plans/master-plan.md`, "Experiment 6: Built-In Component Expansion"

## Implementation Closure

Experiment 6 implemented the first broader built-in surface on top of the existing compiler/runtime boundary:

- added a small renderer prop helper layer for evaluated props, text/value rendering, boolean/string coercion, dependency subscription, and simple flex styles;
- implemented `Stack`, `HStack`, and `VStack` as native flex/block wrappers;
- hardened `Text` and `Button` with XMLUI-compatible value/label and `enabled` behavior;
- expanded `Items` to support `data`, `items`, `reverse`, default children, `itemTemplate`, `$item`, `$itemIndex`, `$isFirst`, and `$isLast`;
- implemented `TextBox`, `Checkbox`, `Select`, and `Option` wrappers using XMLUI-compatible names such as `initialValue`, `enabled`, `readOnly`, `onDidChange`, and `Option enabled`;
- expanded compiler contracts and LSP-shaped metadata with optional props, events, templates, context variables, and APIs;
- updated IR lowering to classify the expanded uppercase built-ins as built-ins instead of user-defined component references;
- added routed samples for layout, list templates, input mutation, and a combined task filter app;
- added unit and E2E coverage for the new metadata, renderer registry, interactions, and data updates.

Deferred compatibility remains deliberate: visuals are native/minimal, full theme parity is not attempted, input components do not yet expose imperative runtime APIs such as `focus()`, forms/validation remain out of scope, and the realistic sample avoids object spread because the current expression parser does not support it yet.

Post-implementation compatibility correction:

- Replaced the experimental input names `value`/`checked` + `onChange` with the original XMLUI public names `initialValue` + `onDidChange`.
- Replaced `Items` `$index` with `$itemIndex` and added `$isFirst`/`$isLast` to match original metadata.
- Removed `Items emptyTemplate` from the implemented contract because the original `Items` component only advertises `itemTemplate`.
- Replaced `Option disabled` with `Option enabled`.
- Removed `Button disabled`; the original `Button` contract uses `enabled`.

Verification completed:

- `npm --workspace xmlui run test`
- `npm --workspace xmlui run build`
- `npm run test:e2e`

## Purpose

Experiments 1 through 5 proved the compiler/runtime path for expressions, async handlers, reactivity, user-defined components, slots, events, and methods. Experiment 6 expands the built-in component surface enough to run a small realistic XMLUI app with layout, lists, display text, and form-free input state.

The central question is:

Can built-in components be implemented as thin runtime wrappers over compiled props, events, state, slots, and metadata, without recreating the old container stack?

## Compatibility Baseline

Before implementation, audit the original XMLUI docs and source for the target components:

- `/Users/dotneteer/source/xmlui/website/content/docs/pages/components-intro.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/markup.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/template-properties.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Text`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Stack`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/HStack`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/VStack`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Items`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/TextBox`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Checkbox`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Select`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Option`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/ud-metadata.ts`

The compatibility target is the documented user-facing surface for the selected subset. The old component implementation details are reference material, not something to copy.

## Current Starting Point

The experimental runtime currently has:

- `App`, `H1`, `Text`, `Button`;
- minimal `Items` for array iteration with `$item` and `$itemIndex`;
- `Slot`, `property`, and `method` helper support from Experiment 5;
- compiled props, text bindings, events, methods, references, slot context, and reactive state;
- a basic built-in contract registry for props/events/declarations.

Experiment 6 should harden and broaden this surface, especially the minimal `Items` implementation.

## Scope

Implement enough built-ins to support a small realistic app:

- `Text`
- `Stack`
- `HStack`
- `VStack`
- `Items`
- `TextBox`
- `Checkbox`
- `Select`
- `Option`
- `Button` improvements where required by the app

Introduce minimal metadata for:

- accepted props;
- events;
- exposed component APIs;
- context variables supplied by components such as `Items`;
- template properties for components that use them.

Every new sample must include data modification, not display-only rendering.

## Non-Goals

This experiment does not cover:

- full visual parity with XMLUI themes;
- form submission and form validation;
- loaders, APIs, `DataSource`, `APICall`, or `Actions.callApi`;
- routing;
- accessibility parity beyond sensible native HTML defaults;
- complete layout semantics such as all XMLUI sizing tokens;
- full `Select` feature parity such as async option loading, advanced option templates, filtering, or search;
- production metadata generation for docs;
- SSG/hydration behavior.

## Design Direction

Built-ins should follow a common shape:

- evaluate reactive props with `evaluateExpressionOrText`;
- subscribe to prop dependencies through `useBindingRevision`;
- render children with the existing scoped renderer;
- run events with `runEvent`;
- expose methods through the runtime reference table only when needed;
- avoid owning local state unless the XMLUI component surface requires it;
- express component contracts in compiler metadata first, then let runtime wrappers stay small.

Input components need one additional pattern:

- initial value comes from the XMLUI-compatible `initialValue` prop where the original component exposes it;
- otherwise the component owns a small internal value;
- user interaction fires XMLUI-compatible events with useful payloads;
- examples update parent XMLUI state through compiled event handlers.

## Planned Realistic App

Create a sample such as `builtins-task-filter`:

```xml
<App
  var.query="{''}"
  var.onlyOpen="{false}"
  var.status="{'open'}"
  var.tasks="{[
    { id: 1, title: 'Write notes', done: false, status: 'open' },
    { id: 2, title: 'Review plan', done: false, status: 'open' },
    { id: 3, title: 'Archive draft', done: true, status: 'closed' }
  ]}"
>
  <VStack>
    <HStack>
      <TextBox initialValue="{query}" onDidChange="(value) => query = value" />
      <Checkbox initialValue="{onlyOpen}" onDidChange="(value) => onlyOpen = value" />
      <Select initialValue="{status}" onDidChange="(value) => status = value">
        <Option value="open" label="Open" />
        <Option value="closed" label="Closed" />
        <Option value="all" label="All" />
      </Select>
    </HStack>
    <Items data="{tasks.filter(task =>
      (status === 'all' || task.status === status) &&
      (!onlyOpen || !task.done) &&
      task.title.toLowerCase().includes(query.toLowerCase())
    )}">
      <HStack>
        <Checkbox initialValue="{$item.done}" onDidChange="(value) => tasks = tasks.map(task => task.id === $item.id ? { ...task, done: value } : task)" />
        <Text>{$item.title}</Text>
      </HStack>
    </Items>
  </VStack>
</App>
```

The exact fixture can be simplified if current expression syntax cannot yet parse object spread or multiline arrow bodies. If so, adapt the data mutation while preserving the same learning goal.

## Implementation Steps

### Step 1: Old Behavior Audit

- Read the docs/source listed in the compatibility baseline.
- Record findings in `.ai/experiment-6-built-in-component-expansion-findings.md`.
- Split each target component into:
  - compatibility behavior needed now;
  - behavior that can be deferred;
  - metadata needed for contracts/LSP.

Verification:

- Findings document exists and names the subset for every target component.

### Step 2: Built-In Renderer Utility Layer

- Add shared helpers for:
  - evaluating a prop with dependency subscription;
  - reading string/boolean/number props with defaults;
  - rendering children or value content;
  - building simple style/class props only where required.
- Keep helpers runtime-only and small.

Verification:

- Unit tests for prop helper behavior.
- Existing built-in tests still pass.

### Step 3: Layout Components

- Implement `Stack`, `HStack`, and `VStack`.
- Support the minimal props needed by samples:
  - `gap`;
  - `width`;
  - `height`;
  - `horizontalAlignment`;
  - `verticalAlignment`;
  - maybe `padding` if useful.
- Use simple flexbox semantics:
  - `Stack` as a neutral block/flex container;
  - `HStack` as row flex;
  - `VStack` as column flex.

Verification:

- Unit tests verify renderer registration and child rendering.
- E2E sample verifies layout components do not break interactions.

### Step 4: Text and Button Hardening

- Extend `Text` only as needed for realistic samples:
  - child text and `value`;
  - `variant` as a metadata-recognized prop, even if style mapping is minimal.
- Extend `Button` only as needed:
  - `label`;
  - child content;
  - `enabled` behavior if required;
  - event payload remains no-argument for click.

Verification:

- Unit tests for value-vs-children precedence.
- E2E test for button-driven data mutation still passes.

### Step 5: Items Hardening

- Promote the Experiment 5 minimal `Items` into a more explicit built-in.
- Support:
  - `data`;
  - default child template;
  - `itemTemplate` named property;
  - `$item`;
  - `$itemIndex`;
  - `$isFirst`;
  - `$isLast`;
- Preserve caller-scope template behavior from Experiment 5.

Verification:

- Unit tests for default children, `itemTemplate`, `$item`, `$itemIndex`, `$isFirst`, `$isLast`, and reactive re-rendering after data mutation.
- E2E test with filtering or toggling list items.

### Step 6: TextBox

- Implement a minimal `TextBox` using native `<input type="text">`.
- Support:
  - `initialValue`;
  - `placeholder`;
  - `enabled`/`readOnly`;
  - `onDidChange` event with the new string value as first argument.
- Ensure event handlers can update parent XMLUI state.

Verification:

- Unit tests for event payload.
- E2E test typing into `TextBox` filters or updates displayed state.

### Step 7: Checkbox

- Implement a minimal `Checkbox` using native `<input type="checkbox">`.
- Support:
  - `initialValue`;
  - `label`;
  - `enabled`/`readOnly`;
  - `onDidChange` event with the new boolean value as first argument.
- Make label clickable where practical.

Verification:

- Unit tests for boolean coercion and event payload.
- E2E test toggling a checkbox changes parent state and list output.

### Step 8: Select and Option

- Implement minimal `Select` with native `<select>`.
- Implement `Option` as a child descriptor consumed by `Select`.
- Support:
  - `value`;
  - `label`;
  - `enabled`/`readOnly`;
  - `onDidChange` event with selected value as first argument.
- Keep advanced templates/options out of scope unless needed for the sample.

Verification:

- Unit tests for option extraction and selected value.
- E2E test changing selection updates parent state.

### Step 9: Component APIs and References

- Decide whether any target built-ins need exposed methods in this experiment.
- If yes, introduce minimal method metadata and runtime reference exposure.
- Candidate APIs:
  - `TextBox.focus()`;
  - `Select.focus()`;
  - no-op or defer if not required.
- Keep API calls going through the existing component reference mechanism.

Verification:

- Unit test for metadata shape.
- Optional E2E test only if an API is implemented.

### Step 10: Metadata Contracts

- Expand built-in contracts for all implemented components.
- Include:
  - props;
  - events;
  - template properties;
  - context variables where applicable;
  - exposed APIs if implemented.
- Ensure unknown props/events still produce useful diagnostics.
- Keep user-defined component arbitrary event behavior from Experiment 5.

Verification:

- Contract unit tests for every new built-in.
- LSP-shaped metadata snapshot/test updated.

### Step 11: Samples and Routes

- Add routed samples:
  - `builtins-layout`;
  - `builtins-items`;
  - `builtins-inputs`;
  - `builtins-task-filter` or equivalent combined realistic app.
- Each sample must include at least one data mutation.
- Wire samples into `xmlui/src/main.tsx`.

Verification:

- E2E tests cover every new route or one combined route plus focused unit tests for the rest.

### Step 12: Regression and Closure

- Run unit tests after each implementation step.
- Run build/typecheck before E2E.
- Run full E2E at the end.
- Update this plan with an implementation closure.
- Record learnings in `.ai/experiment-6-built-in-component-expansion-findings.md`.

Verification:

- `npm --workspace xmlui run test`
- `npm --workspace xmlui run build`
- `npm run test:e2e`

## Success Criteria

Experiment 6 is successful when:

- the target built-ins render through the same runtime renderer boundary;
- layout components can compose children without special container machinery;
- `Items` supports realistic list rendering with `$item`/`$itemIndex` and template behavior;
- `TextBox`, `Checkbox`, and `Select` can modify XMLUI state through compiled event handlers;
- a small realistic app can filter, select, toggle, and render list data;
- compiler contracts know the implemented props/events;
- unit and E2E tests cover all new behavior.

## Risks and Open Questions

- Current expression syntax may not yet support every expression shape wanted by realistic examples, such as object spread. The sample should adapt without expanding parser scope accidentally.
- Input components introduce controlled/uncontrolled questions. The first implementation should prefer controlled XMLUI state in samples and keep internal fallback state minimal.
- Native HTML widgets may differ visually from XMLUI's current themed components. Visual parity is not the goal yet.
- Metadata for component APIs may need a richer schema than the current contracts provide.
- `Items` may pressure the slot/template model if old XMLUI supports more context variables than `$item`, `$itemIndex`, `$isFirst`, and `$isLast`.
