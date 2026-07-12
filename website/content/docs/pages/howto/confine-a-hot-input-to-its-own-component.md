# Confine a hot input's reactivity to its own component

When typing in one input feels noticeably laggier than typing in another, the
slow input is almost always bound to a variable declared in an *outer* scope.
Every keystroke reassigns that variable, and XMLUI re-evaluates **every binding
reachable in that scope** — every `ChangeListener` `listenTo`, every `when` /
`enabled` / `value` expression, every sibling `DataSource` signature under the
same container. The fix is structural, not a binding tweak: extract the input
(and the siblings that read its value) into a user-defined component, and
declare the bound variable **inside** that component. A keystroke then only
re-evaluates bindings inside the component's subtree.

```xmlui-pg copy display name="A message composer that keeps its own input state" height="360px"
---app display /onSend/ /composer.setValue/
<App var.log="{[]}">
  <MessageComposer
    id="composer"
    onSend="(text) => { log = [...log, text]; }"
  />
  <Button label="Prefill greeting" onClick="composer.setValue('Hello there')" />
  <Text variant="strong">Sent</Text>
  <List data="{log}">
    <Text>• {$item}</Text>
  </List>
</App>
---comp display /var.draft/ /emitEvent/ /method name/ MessageComposer
<Component name="MessageComposer" var.draft="{''}">
  <TextArea
    id="box"
    autoSize="true"
    placeholder="Type a message, then Send"
    onDidChange="(v) => draft = v"
  />
  <Text variant="caption">{draft.length} characters</Text>
  <Button
    label="Send"
    onClick="() => { emitEvent('send', box.value); box.setValue(''); }"
  />

  <method name="setValue">
    (v) => box.setValue(v)
  </method>
</Component>
```

The `draft` variable — reassigned on every keystroke by the TextArea's
`onDidChange` — lives inside `MessageComposer`, and the `{draft.length} characters`
counter is the only binding that re-evaluates as you type. Both stay in the
component's subtree, so a keystroke never re-runs anything in App scope. The
parent still drives the pipeline: it receives finished messages through the
`send` event and prefills the field through the exposed `setValue` method,
without ever putting the input's state in App scope.

## Key points

**The bound variable belongs inside the component**: Declare
`var.draft="{''}"` on the `<Component>`, not on the `<App>` or an outer
container. The `{draft.length}` binding — and any other per-keystroke binding you
add — then re-evaluates only within the component. Subtree variables don't cross
a user-defined-component boundary ([Scoping](/docs/guides/scoping)) — that
isolation is exactly what bounds the keystroke re-evaluation. The nesting guide
states the guarantee directly: "Variables and IDs declared in `TaskBoard` are
invisible inside `TaskColumn` or `TaskCard`"
([Compose components with nesting](/docs/howto/compose-components-with-nesting)).

**Finished values flow up through an event**: The parent needs the *committed*
message, not every intermediate keystroke. `emitEvent('send', box.value)` hands
the parent the final value when the user clicks Send, and the parent listens with
`onSend`. This keeps the parent's dispatch logic at App scope where it belongs —
props flow down, events flow up ([Emit a custom event from a component](/docs/howto/emit-a-custom-event-from-a-component)).

**Let an emitting handler also complete its local state change**: Notice the Send
handler ends with `box.setValue('')` *after* `emitEvent('send', …)`. Clearing the
field is the obvious reason, but it also keeps event delivery prompt: a handler
whose only effect is `emitEvent(...)`, with no trailing write to observable state,
can have its emission flushed on a later reactive tick rather than immediately.
Give an emit-only handler something local to do (clear the field, flip a flag), or
fold the emit into a handler that already mutates state.

**Imperative writes come in through a method**: When the parent must *write* the
field — clear it after a turn, prefill a template, append a voice transcript —
expose a `<method name="setValue">` and call `composer.setValue(...)` by the
component's `id` ([Expose a method from a component](/docs/howto/expose-a-method-from-a-component)).
Drive the input's *own* `setValue` (`(v) => box.setValue(v)`) so the change shows
in the field — see [Control a TextArea from code](/docs/howto/control-a-textarea-from-code).
Write the method body as an arrow function so it receives the argument: a
statement body like `box.setValue($params[0])` does *not* work, because
`$param` / `$params` are not bound inside a user-defined component's method body
(they belong to built-in component methods such as `APICall.execute` and
`ModalDialog.open`). The parent reaches in without holding the variable.

**What stays outside**: Pure pipeline state that the *parent* owns — an
`awaiting` flag, a `submittedKind` marker, the dispatch that routes the message —
belongs in the parent's `onSend` handler at App scope. Moving that state into the
component defeats the purpose; the goal is to move only the high-frequency input
state inward, not the whole feature.

## Diagnose it first

Before extracting, confirm the input's scope is the cause:

- **Compare against an input that already lives in a small scope.** A `TextBox`
  or `TextArea` rendered inside an `Items` row (so its `bindTo` target is
  row-local) will feel snappy. If your standalone input is visibly laggier than
  that per-row input, outer-scope re-evaluation is the likely difference.
- **Count what's reachable in the input's scope.** Every `ChangeListener`,
  derived `var`, `DataSource`, and conditional binding under the same container
  as the bound variable re-runs on each keystroke. A handful is fine; a chat
  surface sitting under an App scope with many listeners and an `Items` loop is
  the classic trap.
- **Measure with the Inspector** if you want numbers. Extracting a
  message-composer surface (a `Form` + `TextArea` + paste strip + send/skip
  buttons, previously bound to an App-level `var`) into its own component moved
  the median inter-keydown gap from ~225 ms to ~170 ms — matching the app's
  already-fast per-row feedback boxes. The reactive model's elegance is what
  makes the trap easy to fall into: every reachable binding is "free" to
  express, so one inadvertently expensive `ChangeListener` under the same scope
  as a hot input silently makes typing feel sluggish.

---

## See also

- [Compose components with nesting](/docs/howto/compose-components-with-nesting) — the scope-isolation guarantee this pattern relies on
- [Emit a custom event from a component](/docs/howto/emit-a-custom-event-from-a-component) — sending the committed value up to the parent
- [Expose a method from a component](/docs/howto/expose-a-method-from-a-component) — letting the parent write the field imperatively
- [Control a TextArea from code](/docs/howto/control-a-textarea-from-code) — the `setValue` / `value` / `focus` methods on the input itself
- [Keep per-item state in an Items or List loop](/docs/howto/keep-per-item-state-in-a-loop) — why inputs rendered inside a loop already have a small reactive scope
- [Scoping](/docs/guides/scoping) — the full rules for what variables cross a component boundary
