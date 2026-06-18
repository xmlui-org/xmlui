# Experiment Result 1: Minimal XMLUI Compiler Runtime

This experiment proves that a small XMLUI application can run in Vite dev server
mode while using compiled JavaScript functions for XMLUI expressions and event
handlers. The currently supported samples cover local variables, user-defined
components, global variables, props, mixed text, and local shadowing.

## Available Samples

The Vite entry point is `xmlui/src/main.tsx`. It imports the XMLUI sample files
directly, so Vite routes each `.xmlui` module through the XMLUI compiler plugin.

- `?example=local`: `xmlui/src/examples/counter-local/Main.xmlui`
- `?example=components`: `xmlui/src/examples/counter-components/Main.xmlui`
- `?example=globals`: `xmlui/src/examples/counter-globals/Main.xmlui`

`?example=globals` is the default.

## How Compilation Works

The Vite plugin in `xmlui/src/vite-plugin/xmluiPlugin.ts` intercepts `.xmlui`
imports and calls `compileXmluiModule`. The compiler then:

1. Parses XMLUI markup into an AST with source locations.
2. Parses expression and event-handler source, such as `{count}` and `count++`.
3. Binds identifiers to local variables, global variables, or `$props`.
4. Builds Compiler IR with nodes, bindings, events, dependencies, writes, and
   invalidation metadata.
5. Emits a JavaScript ES module exporting a runtime document through
   `createXmluiModule`.
6. Embeds compiled JavaScript functions into that runtime document. Expressions
   receive a `ctx` object and return a value. Event handlers receive the same
   context plus write methods and update state.

The compiler does not compile rendering. Rendering remains the runtime's job.
Only XMLUI expressions and event handlers are compiled into JavaScript
functions.

## Generated Module Shape

Each `.xmlui` file becomes an ES module shaped like this:

```js
import { createXmluiModule } from "/src/runtime/index.tsx";
import component0 from "./IncrementButton.xmlui";

const document = {
  kind: "app",
  sourceId: "xmlui/src/examples/counter-globals/Main.xmlui",
  filename: "xmlui/src/examples/counter-globals/Main.xmlui",
  root: {
    kind: "element",
    type: "App",
    globals: {
      count: "{0}",
    },
    parsed: {
      globals: {
        count: {
          source: "0",
          compiledSource: "return 0;",
          evaluate: (ctx) => {
            return 0;
          },
        },
      },
    },
    children: [
      // Runtime node descriptors with parsed bindings and compiled functions.
    ],
  },
};

const module = createXmluiModule(document, [component0]);

export default module;
```

The real generated module also contains source ranges, syntax ASTs, Compiler IR,
dependency lists, write targets, invalidation lists, and stable generated names.

## Generated JavaScript

### Local Counter

Source: `xmlui/src/examples/counter-local/Main.xmlui`

```xml
<App var.count="{0}">
  <H1>Counter example</H1>
  <Button onClick="count++">
    Click to increment: {count}
  </Button>
</App>
```

Initial local state:

```js
// XMLUI: var.count="{0}"
(ctx) => {
  return 0;
}
```

Text expression:

```js
// XMLUI: {count}
// Dependency: local count
(ctx) => {
  return ctx.readLocal("count");
}
```

Event handler:

```js
// XMLUI: count++
// Reads, writes, and invalidates: local count
(ctx) => {
  ctx.writeLocal("count", Number(ctx.readLocal("count")) + 1);
}
```

### Counter With User-Defined Components

Source: `xmlui/src/examples/counter-components/Main.xmlui`

```xml
<App>
  <H1>Counter with components</H1>
  <IncrementButton />
  <IncrementButton label="Counter #2" />
  <IncrementButton label="Counter #3" />
</App>
```

The main module imports the sibling component module:

```js
import component0 from "./IncrementButton.xmlui";

const module = createXmluiModule(document, [component0]);
```

Source: `xmlui/src/examples/counter-components/IncrementButton.xmlui`

```xml
<Component name="IncrementButton" var.count="{0}">
  <Button onClick="count++">
    {$props.label || 'Click to increment'}: {count}
  </Button>
</Component>
```

Initial component-local state:

```js
// XMLUI: var.count="{0}"
(ctx) => {
  return 0;
}
```

Prop fallback expression:

```js
// XMLUI: {$props.label || 'Click to increment'}
// Dependency: prop label
(ctx) => {
  return (ctx.props?.["label"] || "Click to increment");
}
```

Text expression:

```js
// XMLUI: {count}
// Dependency: local count
(ctx) => {
  return ctx.readLocal("count");
}
```

Event handler:

```js
// XMLUI: count++
// Reads, writes, and invalidates: local count
(ctx) => {
  ctx.writeLocal("count", Number(ctx.readLocal("count")) + 1);
}
```

Each `IncrementButton` instance gets its own local `count`, because the runtime
creates local state for each component scope.

### Global Counter With Local Shadowing

Source: `xmlui/src/examples/counter-globals/Main.xmlui`

```xml
<App global.count="{0}">
  <H1>Counter with components</H1>
  <IncrementButton />
  <IncrementButton label="Global Counter #2" />
  <IncrementButton label="Global Counter #3" />
  <Button var.count="{0}" onClick="count++">
    Local count: {count}
  </Button>
</App>
```

Initial global state:

```js
// XMLUI: global.count="{0}"
(ctx) => {
  return 0;
}
```

The local button declares a local `count`, which shadows the global `count`:

```js
// XMLUI: var.count="{0}"
(ctx) => {
  return 0;
}
```

The local button text reads the shadowing local value:

```js
// XMLUI: {count}
// Dependency: local count
(ctx) => {
  return ctx.readLocal("count");
}
```

The local button event writes the shadowing local value:

```js
// XMLUI: count++
// Reads, writes, and invalidates: local count
(ctx) => {
  ctx.writeLocal("count", Number(ctx.readLocal("count")) + 1);
}
```

Source: `xmlui/src/examples/counter-globals/IncrementButton.xmlui`

```xml
<Component name="IncrementButton">
  <Button onClick="count++">
    {$props.label || 'Click to increment (Global)'}: {count}
  </Button>
</Component>
```

Because this component does not declare `var.count`, the compiler binds `count`
to the nearest available global variable.

Prop fallback expression:

```js
// XMLUI: {$props.label || 'Click to increment (Global)'}
// Dependency: prop label
(ctx) => {
  return (ctx.props?.["label"] || "Click to increment (Global)");
}
```

Global text expression:

```js
// XMLUI: {count}
// Dependency: global count
(ctx) => {
  return ctx.readGlobal("count");
}
```

Global event handler:

```js
// XMLUI: count++
// Reads, writes, and invalidates: global count
(ctx) => {
  ctx.writeGlobal("count", Number(ctx.readGlobal("count")) + 1);
}
```

## Temporary Runtime Diagnostics

During the experiment, temporary browser console diagnostics were added to prove
that rendered expressions and event handlers were executing the generated
JavaScript functions. Those diagnostics were removed before declaring the
experiment successful, so the runtime now executes compiled functions without
extra console output.

For `{count}`, the temporary diagnostic showed this kind of payload:

```js
{
  mode: "generated",
  xmlui: "{count}",
  javascript: "return ctx.readGlobal(\"count\");",
  result: 0,
}
```

For `count++`, the temporary diagnostic showed read/write payloads like this:

```js
{
  xmlui: "count++",
  javascript: "ctx.writeGlobal(\"count\", Number(ctx.readGlobal(\"count\")) + 1);",
  name: "count",
  value: 1,
}
```

## Outcome

The first experiment successfully demonstrates the intended compiler direction:
XMLUI markup still describes the UI declaratively, while expressions and event
handlers are compiled to JavaScript functions that run through a small runtime
context. The samples prove local state, component-local state, global state,
props, mixed text, and local shadowing without compiling rendering logic.
