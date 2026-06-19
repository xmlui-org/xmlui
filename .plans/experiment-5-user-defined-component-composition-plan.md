# Experiment 5: User-Defined Component Composition Plan

Status: implemented

Parent plan: `.plans/master-plan.md`, "Experiment 5: User-Defined Component Composition"

## Implementation Closure

Implemented in the experimental framework with:

- Explicit runtime render fragments for default children and named `<property name="...Template">` blocks.
- A minimal `<Slot>` built-in that renders caller-provided fragments and passes slot attributes as `$`-prefixed context values.
- A minimal `<Items>` built-in to exercise list-style template composition and `$item`/`$index` context.
- `emitEvent(name, ...args)` support for user-defined component internals, invoking parent `on<EventName>` listeners in the caller scope.
- Component method buckets compiled from `<method name="...">` and `method.*`, exposed through component `id` references.
- `$self` support through the component reference table.
- Component body scope isolation from parent locals while projected slot content keeps the caller scope.
- New routed examples for default children, slot context, event emission, methods, and a combined sample.
- Unit and E2E tests covering rendering and data modification.

Compatibility notes:

- Method bodies currently return the value of their final expression. This supports the experiment's method-return scenarios without adding JavaScript `return` statement parsing yet.
- Template-property diagnostics such as `...Template` naming warnings are not yet surfaced as user-facing compile diagnostics.
- The old XMLUI documented surface is followed for the implemented subset, but this experiment intentionally keeps the internal architecture smaller than the original container/compound stack.

## Purpose

Experiments 1 through 4 made user-defined components usable as isolated component bodies with props, local variables, compiled expressions, compiled async handlers, and reactive derived state. Experiment 5 turns that minimal component support into composition support: a parent should be able to project markup into a component, receive events from it, and call explicitly exported methods without piercing the component's private scope.

The central question is:

Can XMLUI user-defined component composition be represented with small compiler and runtime contracts, instead of recreating the old compound component/container stack?

## Compatibility Baseline

Before implementation, audit these original XMLUI sources and docs:

- `/Users/dotneteer/source/xmlui/website/content/docs/pages/user-defined-components.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/template-properties.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/scoping.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/markup.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/compose-components-with-nesting.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/pass-a-template-slot-to-a-component.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/emit-a-custom-event-from-a-component.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/expose-a-method-from-a-component.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/container`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/ComponentWrapper.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/ComponentViewer.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/ud-metadata.ts`

The compatibility target for this experiment is the documented surface, not the old internal architecture.

## Scope

This experiment covers:

- Default child projection into user-defined components.
- Named template properties with `<property name="...Template">`.
- `<Slot>` rendering with fallback content.
- Slot context values passed from the component into projected parent markup.
- Custom event emission through `emitEvent(name, ...args)`.
- Parent listeners through `on<EventName>` attributes on user-defined component instances.
- Component methods through `<method name="...">` and `method.*` attributes.
- Parent calls to exported methods through component `id` references.
- `$self` calls from inside a component to its own exported methods.
- Strict component scope isolation: parent variables are not visible in component internals unless passed as props, event arguments, slot/template context, or method return values.
- Unit and E2E coverage for both rendering and data modification.

## Non-Goals

This experiment does not cover:

- The full built-in component catalog.
- Full forms, loaders, APIs, routing, theming, or layout semantics.
- Full compound component support.
- Server-side rendering or static generation.
- Reintroducing proxy-based state tracking.
- Rendering-related code generation. The compiler still compiles expressions and handlers only.
- A complete component metadata/type-contract system.

## Design Direction

User-defined component composition should be modeled with explicit render fragments:

- A component instance receives normal props, event listener props, projected children, named template properties, and an optional `id`.
- Projected children and template properties are stored as render fragments with their caller scope.
- Component internals render in the component's private scope.
- A `<Slot>` inside a component invokes one of the caller-provided render fragments.
- Slot attributes become slot context values visible to the projected markup as `$`-prefixed values.
- Event listeners are compiled handlers bound to the caller's scope and invoked by the component through `emitEvent`.
- Exported methods are compiled handlers bound to the component's private scope and exposed through a narrow component reference object.

This keeps the two important scoping rules separate:

- Component body expressions use the component scope.
- Projected parent markup uses the parent scope plus explicit slot context values.

## Planned Examples

Each example must include at least one data-modifying interaction.

### Default Children

`Main.xmlui`

```xml
<App var.count="{0}">
  <Panel title="Projected Counter">
    <Button onClick="count++">Projected count: {count}</Button>
  </Panel>
</App>
```

`Panel.xmlui`

```xml
<Component name="Panel">
  <H1>{$props.title}</H1>
  <Slot>
    <Text>No content</Text>
  </Slot>
</Component>
```

Expected learning: projected children see the parent's `count`, while `Panel` does not.

### Named Template Property With Slot Context

`Main.xmlui`

```xml
<App var.selected="{''}">
  <StatusList items="{[
    { id: 'build', label: 'Build' },
    { id: 'test', label: 'Test' }
  ]}">
    <property name="rowTemplate">
      <Button onClick="selected = $item.id">
        {$item.label}: {selected === $item.id ? 'selected' : 'idle'}
      </Button>
    </property>
  </StatusList>
  <Text>Selected: {selected || 'none'}</Text>
</App>
```

`StatusList.xmlui`

```xml
<Component name="StatusList">
  <Items data="{$props.items}">
    <Slot name="rowTemplate" item="{$item}">
      <Text>{$item.label}</Text>
    </Slot>
  </Items>
</Component>
```

Expected learning: named slots carry component-provided context into parent-authored template content.

### Custom Event Emission

`Main.xmlui`

```xml
<App var.doneCount="{0}">
  <TaskButton label="Ship it" onDone="doneCount++" />
  <Text>Done: {doneCount}</Text>
</App>
```

`TaskButton.xmlui`

```xml
<Component name="TaskButton">
  <Button onClick="emitEvent('done')">{$props.label}</Button>
</Component>
```

Expected learning: events flow up without giving the child access to parent state.

### Component Method

`Main.xmlui`

```xml
<App var.openCount="{0}">
  <CounterBox id="counter" />
  <Button onClick="{
    counter.increment();
    openCount = counter.getCount();
  }">
    Read component count
  </Button>
  <Text>Component count: {openCount}</Text>
</App>
```

`CounterBox.xmlui`

```xml
<Component name="CounterBox" var.count="{0}">
  <Text>Internal count: {count}</Text>
  <method name="increment">
    count++;
  </method>
  <method name="getCount">
    return count;
  </method>
</Component>
```

Expected learning: exported methods can mutate private state and return values without exposing the state variable itself.

## Implementation Steps

### Step 1: Compatibility Audit and Findings

- Read the original docs and source paths listed in the compatibility baseline.
- Record behavior findings in `.ai/experiment-5-user-defined-component-composition-findings.md`.
- Decide the smallest syntax set for this experiment:
  - `<Slot>`
  - `<property name="...Template">`
  - `emitEvent(...)`
  - `on<EventName>`
  - `<method name="...">`
  - `method.*`
  - `$self`
  - component `id` references

Verification:

- Findings document names the old behavior, experiment subset, and postponed behavior.

### Step 2: Parser Support for Helper Tags

- Extend markup parsing for `<property>`, `<Slot>`, and `<method>` as ordinary XMLUI elements with special downstream meaning.
- Preserve source locations and token data for these elements and attributes.
- Keep syntax highlighting/LSP token output stable for new helper tags.
- Add parser tests for nested property blocks, method blocks with script text, and slots with context attributes.

Verification:

- Parser unit tests pass.
- VS Code extension grammar tests or snapshots cover the new helper tag names if the current extension test harness supports them.

### Step 3: Composition IR

- Extend the compiler IR with a render-fragment descriptor for projected children and template properties.
- Represent each fragment with:
  - stable fragment id;
  - source file and source range;
  - child node ids;
  - declaring/caller scope id;
  - optional template name;
  - expected slot context names.
- Extend component metadata with exported methods and emitted/listened event names where they can be statically discovered.
- Ensure IR serialization remains deterministic for snapshots.

Verification:

- IR unit tests for default children, named property templates, slots, events, and methods.

### Step 4: Runtime Render Fragment Contract

- Add a runtime `RenderFragment` contract that binds fragment children to the caller scope.
- Add a slot-context overlay scope that exposes values as `$item`, `$index`, and other slot-provided names while preserving normal parent variable lookup.
- Ensure slot context overlays cannot mutate component-local state accidentally.
- Reuse the existing state store and invalidation model; do not add proxy state.

Verification:

- Runtime unit tests prove projected markup reads and writes parent variables.
- Runtime unit tests prove component internals cannot read parent variables that were not passed explicitly.

### Step 5: Default Slot Rendering

- Implement a minimal `Slot` runtime primitive.
- If no `name` is specified, render the caller's default children.
- If no caller fragment exists, render the `<Slot>` element's fallback children in component scope.
- Add a sample for default children with a parent counter mutation.

Verification:

- Unit test: projected default children render.
- Unit test: fallback renders when no children are supplied.
- E2E test: clicking a projected button updates parent state.

### Step 6: Named Template Properties

- Capture `<property name="rowTemplate">...</property>` children on component instances as named render fragments.
- Enforce the XMLUI compatibility rule that named slot/template properties must end with `Template`, at least as a warning or diagnostic in this experiment.
- Implement named `<Slot name="rowTemplate">` lookup.
- Add a sample with `rowTemplate` and parent state updates from inside projected template content.

Verification:

- Unit test: named template renders instead of fallback.
- Unit test: invalid template naming emits a diagnostic.
- E2E test: clicking inside the named template mutates parent state.

### Step 7: Slot Context Values

- Evaluate `<Slot>` attributes other than `name` in the component scope.
- Pass evaluated values to the projected render fragment as `$`-prefixed context values.
- Support at least `$item` and `$index` because these are core to list-style composition.
- Add a minimal `Items` builtin if the current runtime does not already have enough list iteration support for the sample.

Verification:

- Unit test: parent template reads `$item`.
- Unit test: parent template can combine `$item` with parent variables.
- Unit test: slot context shadows only the same `$` context name and does not shadow ordinary parent variables.

### Step 8: Event Emission

- Add `emitEvent(name, ...args)` to the component event-handler execution context.
- Map `emitEvent('done', value)` to the caller's `onDone` handler.
- Invoke parent listeners with the caller scope and the emitted arguments.
- Keep handlers async by default and preserve the Experiment 4A concurrency policy for listener execution.
- Add diagnostics for missing listeners only if useful for development; missing listeners should not fail at runtime.

Verification:

- Unit test: emitted scalar argument reaches parent listener.
- Unit test: emitted object argument reaches parent listener.
- Unit test: child cannot mutate parent state directly, but parent listener can mutate it.
- E2E test: custom event increments or filters parent data.

### Step 9: Exported Component Methods

- Compile `<method name="...">` bodies and `method.name="..."` attributes as async handlers bound to the component scope.
- Expose methods through the component's `id` reference in the parent scope.
- Support return values from methods.
- Register `$self` inside the component scope so component internals can call exported methods.
- Keep component local state private except through method return values and emitted events.

Verification:

- Unit test: parent calls a method by component id.
- Unit test: method mutates component-local state.
- Unit test: method return value can be assigned to a parent variable.
- Unit test: `$self.methodName()` works from inside the component.
- E2E test: method call updates internal state and then parent display through a returned value.

### Step 10: Reactive Integration

- Ensure rendered slots resubscribe to parent state reads.
- Ensure component internals resubscribe to component-local and prop reads.
- Ensure slot context changes invalidate projected template content.
- Ensure event listener and method mutations trigger the same invalidation flow as normal handlers.

Verification:

- Unit tests for dependency tracking across component body, projected child content, and slot context.
- E2E test with parent state, component local state, and slot context all changing in one scenario.

### Step 11: Diagnostics and Developer Feedback

- Add source-aware diagnostics for:
  - `<Slot name="...">` with no matching template and no fallback when this is likely accidental;
  - `<property>` without `name`;
  - template property names that do not end with `Template`;
  - duplicate exported method names;
  - invalid component `id` references in handlers when statically knowable;
  - attempts to read parent variables from component internals.
- Surface diagnostics through the existing compile/dev-server path.

Verification:

- Unit tests for diagnostics.
- Dev server sample shows diagnostics without crashing the page.

### Step 12: Samples, Routes, and Documentation

- Add sample apps for:
  - `udc-default-children`
  - `udc-named-template`
  - `udc-slot-context`
  - `udc-event-emission`
  - `udc-methods`
  - one combined composition sample
- Add sample routing entries so they are selectable through the current query-parameter sample dispatch.
- Update `.experiment/result-1.md` or create `.experiment/result-2.md` only if the user asks for an experiment result write-up.
- Add short notes to the experiment findings document for lessons that should feed future blog/book material.

Verification:

- All sample routes render.
- Each sample has at least one data-modifying interaction.

### Step 13: Full Test Pass and Closure

- Run the relevant unit tests after each implementation step.
- Run the E2E suite after sample wiring and at the end.
- Run the full workspace test command before declaring the experiment complete.
- Record postponed behavior and discovered risks in the plan's closure section.

Verification:

- Unit tests pass.
- E2E tests pass.
- Full workspace test command passes or any failure is documented with cause and next action.

## Success Criteria

Experiment 5 is successful when:

- User-defined components can render default projected children.
- Named template properties render through `<Slot name="...">`.
- Slot context values are visible to projected parent markup.
- Custom events flow from component to parent listeners.
- Exported methods can be called through component `id` references.
- `$self` can call component methods internally.
- Component internals remain isolated from parent variables.
- Projected markup can still read and mutate parent state.
- The implementation uses small explicit compiler/runtime contracts rather than the old container stack.
- Unit and E2E tests cover all new behavior, including data modification.

## Risks and Open Questions

- The initial runtime has only a small built-in component set. Slot-context examples may need a minimal `Items` builtin earlier than the broader built-in-component experiment.
- Method calls require handler compilation to support component reference calls and return values robustly.
- Event listeners are parent-scope handlers passed into child instances; the implementation must avoid accidentally treating them as ordinary child-scope props.
- Diagnostics for parent-variable access from component internals may require richer name-resolution metadata than the current compiler has.
- Named template-property syntax should follow XMLUI exactly, but the experiment may initially support only the documented `...Template` pattern.
