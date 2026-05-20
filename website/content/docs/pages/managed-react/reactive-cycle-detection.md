# Reactive Cycle Detection

Reactive cycle detection prevents XMLUI state from feeding itself forever.
The analyzer builds a graph from user variables, code-behind functions, and
DataSource/APICall loaders, then reports strongly connected components as
cycles.

## What problems this prevents

- Variables that depend on each other no longer create mysterious repeated
  updates.
- Data loaders that read reactive values involved in a loop are reported with a
  clear cycle message.
- Editor diagnostics point at the cycle members instead of leaving you to
  search the file by hand.
- Vite builds can fail on cycle warnings before the app reaches users.

## How it works

XMLUI inspects the dependency graph behind your markup. Each user variable,
code-behind function, and loader becomes a node; every expression read becomes
an edge. When the graph loops back on itself, XMLUI reports a
`reactive-cycle` diagnostic in the runtime trace, the editor, and the Vite
build.

```xmlui copy
<App>
  <Stack var.a="{b + 1}" var.b="{a + 1}">
    <Text value="{a}" />
  </Stack>
</App>
```

The example above reports a cycle because `a` depends on `b` and `b` depends
on `a`. Break the loop by turning one side into an event-driven update,
deriving both values from a third source, or moving asynchronous data flow into
a DataSource with an independent key.

## Strict mode

`strictReactiveGraph` is default-on. In strict mode, runtime cycle warnings are
escalated to errors and surfaced as error toasts. For existing apps with known
cycles, temporarily opt into warn-only migration mode:

```json
{
  "appGlobals": {
    "strictReactiveGraph": false
  }
}
```

The Vite plugin can also be configured with `reactiveCycles: "off" | "warn" |
"strict"` depending on how aggressively a build should enforce the check.

## Related

- [Managed React Overview](/docs/managed-react/overview)
- [Verified Type Contracts](/docs/managed-react/verified-type-contracts)
