# Pass arguments to a component method

[Expose a method from a component](/docs/howto/expose-a-method-from-a-component)
shows how to *declare* a method. The moment a method needs to take an argument,
one detail trips people up: **arguments bind to a named arrow parameter, not to
`$param` / `$params`.** Write the body as an arrow function and name the
parameter you want:

```xmlui-pg copy display name="Passing arguments to a component's methods" height="360px"
---app display /counter\./
<App var.readout="(nothing read yet)">
  <Counter id="counter" />
  <FlowLayout>
    <Button label="add 5 (attribute form)" onClick="counter.addAttr(5)" />
    <Button label="add 3 (element form)"   onClick="counter.addElem(3)" />
    <Button label="reset"                  onClick="counter.reset()" />
    <Button label="read"                   onClick="readout = 'count = ' + counter.getCount()" />
  </FlowLayout>
  <Text>{readout}</Text>
</App>
---comp display /method\./ /method name/ /\(n\) =>/ Counter
<Component name="Counter" var.count="{0}"
  method.addAttr="(n) => count = count + n">
  <Text variant="strong">Count: {count}</Text>

  <method name="addElem">(n) => count = count + n</method>
  <method name="reset">count = 0</method>
  <method name="getCount">return count</method>
</Component>
```

`addAttr` and `addElem` are the **same** method written two ways — an arrow
function whose parameter `n` receives the call argument. `reset` and `getCount`
take no argument, so a plain statement body is enough.

## Key points

**Arguments come in through a named arrow parameter**: To receive an argument,
the method body must be an arrow function. The parameters bind positionally to
the call arguments, so `counter.addAttr(5)` makes `n` equal `5`:

```xmlui
<!-- attribute form -->
method.setLabel="(text) => label = text"

<!-- element form — identical behavior -->
<method name="setLabel">(text) => label = text</method>

<!-- multiple arguments bind left to right -->
<method name="move">(dx, dy) => { x = x + dx; y = y + dy; }</method>
```

**`$param` / `$params` are NOT bound in a component method body**: This is the
usual surprise. `$param` and `$params` are context values for *built-in*
component methods — `APICall.execute(...)`, `ModalDialog.open(...)`, and the like
([context variables](/docs/context-variables2#`$param`)). Inside a user-defined
component's `<method>` body they are `undefined`, so `message = $params[0]`
silently assigns `undefined`. Name an arrow parameter instead.

**A statement body is fine when there is no argument**: `<method name="reset">count = 0</method>`
runs its body as statements and can call internal component APIs and `return` a
value (`<method name="getCount">return count</method>`). You only need the arrow
form to *receive* arguments. The element form and the `method.` attribute form
have the same semantics — pick the attribute form for one-liners, the element
form for multi-line bodies.

## What else the body can reach

A method body resolves identifiers through the component's own scope, the same
way the component's markup bindings do:

| Inside a `<method>` body | Resolves? | How / why |
| --- | --- | --- |
| Call arguments | **Yes** | Name them as arrow parameters: `(a, b) => …` |
| `$param` / `$params` | **No** | Reserved for built-in component methods (`APICall.execute`, `ModalDialog.open`) |
| The component's own `var.X` | **Yes** — read *and* write | Component state lives in this scope |
| `$props.X` | **Yes** — read-only | The caller-supplied attributes ([Create a reusable component](/docs/howto/create-a-reusable-component)) |
| An `id` declared **inside** this component | **Yes** | Call its API, e.g. `internalDialog.open()` ([Expose a method from a component](/docs/howto/expose-a-method-from-a-component)) |
| A parent / outer / App-level `var.X` | Treat as **No** | Variables stop at the user-defined-component boundary ([Scoping](/docs/guides/scoping)) — pass them in as a prop, or emit an event |
| An `id` in the caller's scope | **No** | Same boundary |

## To change parent state, emit an event

Because outer variables stop at the component boundary, a method **cannot** write
the parent's state directly — pass a value up with
[`emitEvent`](/docs/howto/emit-a-custom-event-from-a-component) and let the
parent's handler do the write:

```xmlui
<!-- inside the component: the method reports upward -->
<method name="commit">(text) => emitEvent('committed', text)</method>

<!-- the parent owns the write -->
<Editor onCommitted="(text) => savedValue = text" />
```

Props flow down, events flow up — the same data-flow rule the rest of the
user-defined-component story follows.

---

## See also

- [Expose a method from a component](/docs/howto/expose-a-method-from-a-component) — declaring `<method>` and the `method.` attribute form
- [Delegate a method](/docs/howto/delegate-a-method) — forwarding a method straight to an internal built-in component
- [Emit a custom event from a component](/docs/howto/emit-a-custom-event-from-a-component) — the way to change parent state from inside a component
- [Create a reusable component](/docs/howto/create-a-reusable-component) — `$props`, `id`, and the component boundary
- [Scoping](/docs/guides/scoping) — which variables cross a user-defined-component boundary
