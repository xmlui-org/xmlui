# XMLUI Markup Patterns

Reference for writing XMLUI markup — used in `initTestBed` strings, user-defined components, and inline event handlers.

## Expressions

Values in attributes are either literal strings or JavaScript expressions in `{ }`:

```xml
<Text value="Hello" />                            <!-- literal -->
<Text value="{ 6 * 7 }" />                        <!-- expression -->
<Text value="Count: {count}" />                   <!-- interpolated -->
```

JSON lists and object literals need an outer `{ }` for the expression and an inner `{ }` for the object:

```xml
<Items data="{ ['Bakerloo', 'Central'] }" />
<Form data='{ { station: "Brixton", wifi: true } }' />
```

## Variables

Declare with `var.` prefix or `<variable>` tag — both are equivalent:

```xml
<App var.count="{0}">...</App>

<App>
  <variable name="count" value="{0}" />
  ...
</App>
```

**Reactive variables**: an expression that references another variable re-evaluates automatically when the dependency changes:

```xml
<App var.count="{0}" var.triple="{3 * count}">
  <Button onClick="count++">Increment</Button>
  <Text>{triple}</Text>   <!-- updates whenever count changes -->
</App>
```

## Variable Scoping

- A variable declared on a built-in component (e.g. `App`, `Card`) is visible to all built-in descendants at any depth.
- A variable is **not** automatically visible inside a user-defined component (`<MyCard />`). Pass it explicitly:

```xml
<!-- pass as prop -->
<MyCard message="{message}" />
<!-- inside MyCard: {$props.message} -->
```

- Alternatively, use a `<Slot />` — slot content evaluates in the *parent* scope but renders inside the child's layout:

```xml
<!-- Main.xmlui -->
<MyCard>
  <Text>{message}</Text>   <!-- sees parent's message -->
</MyCard>

<!-- MyCard.xmlui -->
<Component name="MyCard">
  <Card><Slot /></Card>
</Component>
```

- Child components can re-declare a variable to shadow the parent's value.

## Global Variables

Declared only in the **root element** of `Main.xmlui` (or in `Globals.xs`). Visible everywhere in all files:

```xml
<App global.stations="{ ['Bakerloo', 'Central'] }">
  ...
</App>

<!-- or with tag -->
<App>
  <global name="stations" value="{ ['Bakerloo', 'Central'] }" />
</App>
```

Cannot be declared in component files or nested elements.

## Event Handlers

Use the `on` prefix with the event name as an attribute. Arrow functions for parameters:

```xml
<Button onClick="count++" />
<Select onDidChange="(val) => setTheme(val)" />
```

Alternatively use the `<event>` tag (required when the handler is a component like `<APICall>`):

```xml
<Button>
  <event name="click">
    { count++; toast('clicked') }
  </event>
</Button>
```

Fire events from a user-defined component:

```xml
<Button onClick="count++; emitEvent('incremented', count)" />
```

## Template Properties

Use `<property name="...">` when a prop value is XMLUI markup rather than a scalar:

```xml
<Form>
  <property name="buttonRowTemplate">
    <Button type="submit" label="Search" />
  </property>
</Form>
```

## Component IDs

An `id` on a built-in component is visible to built-in descendants at any depth. It is **not** automatically visible inside user-defined components — pass it as a prop or use `<Slot />` (same rules as variables).

```xml
<TextBox id="textBox" />
<Card>
  <Text>{textBox.value}</Text>   <!-- ✅ built-in child sees it -->
</Card>
<MyCard textBox="{textBox}" />   <!-- pass explicitly to user-defined -->
```

## User-defined Components

- Filenames match component names; placed in `components/`
- Names start with an uppercase letter
- Access props via `$props.name`; use `??` for defaults

```xml
<Component name="NameValue">
  <Text>Name: { $props.name ?? '[no name]' }</Text>
  <Text>Value: { $props.value ?? '[no value]' }</Text>
</Component>
```

Declare local state with `<variable>`:

```xml
<Component name="Counter">
  <variable name="count" value="{0}" />
  <Button onClick="count++">Count: {count}</Button>
</Component>
```

Export imperative methods with `<method>`:

```xml
<Component name="UsingDialog">
  <ModalDialog id="dialog" title="Example">
    <Button onClick="dialog.close()">Close</Button>
  </ModalDialog>
  <method name="openDialog">
    dialog.open();
  </method>
</Component>
```

## Scripting

**Inline expressions** — single-line JavaScript in attributes or `{ }` blocks:

```xml
<Button onClick="count++" />
<Button onClick="() => { count++; toast('done') }" />
```

**Multiline event handlers** — allowed in `onClick` and `<event>` tags:

```xml
<Button onClick="{
  console.log('clicked');
  count++;
  toast('count now ' + count)
}" />
```

**Global functions in `index.html`** — use `window.fn`:

```html
<script>
  window.transform = function(data) { ... }
</script>
```

```xml
<DataSource transformResult="{window.transform}" />
```

**Code-behind files** — `ComponentName.xmlui.xs` alongside `ComponentName.xmlui`. Arrow functions are required in `.xs` files:

```js
// MyComponent.xmlui.xs
function transform(data) {
  return data.map(item => ({ name: item.commonName }));
}
```

**`Globals.xs`** is special — every variable and function declared there becomes a global visible everywhere in the app. `Main.xmlui.xs` declarations are local to the Main component, just like any other code-behind file.

## Context Variables

Context variables are framework-injected `$`-prefixed names available automatically in certain scopes. They cannot be declared via attributes.

### Iteration (List, Table, Column, …)

| Variable | Description |
|---|---|
| `$item` | Current item in the iteration |
| `$itemIndex` | Zero-based index of the current item |

```xml
<List data="{users}">
  <Text>{$itemIndex + 1}. {$item.name}</Text>
</List>
```

### Routing (Page, Link, …)

| Variable | Description |
|---|---|
| `$routeParams` | Object with URL path parameters (e.g. `/users/:id` → `$routeParams.id`) |
| `$queryParams` | Object with URL query string parameters |
| `$pathname` | Current URL path string |
| `$linkInfo` | Active-link metadata |

### Forms (Form, FormItem)

| Variable | Description |
|---|---|
| `$data` | All current form field values as an object |
| `$validationResult` | Validation result for the form |
| `$value` | Current value of the enclosing FormItem field |
| `$setValue` | Function to programmatically set the field value |

```xml
<Form>
  <event name="submit">
    <APICall url="/api/save" method="POST" body="{$data}" />
  </event>
</Form>
```

### APICall event handlers

| Variable | Description |
|---|---|
| `$param` | First argument passed to `execute()` |
| `$params` | Array of all arguments passed to `execute()` |
| `$result` | Response data (in `success` and notification contexts) |
| `$error` | Error details (in `error` context) |

See [data.md](./data.md) for full APICall patterns.

## Container Creation

A **container** wraps components that need reactive state. Containers are created automatically whenever a component has any of:

- `var.*` attribute or `<variable>` tag
- `<script>` block
- A data-loading prop (e.g. `data="/api/…"`)
- A `uses` attribute
- Context variables injected by the framework

An `id` attribute alone does **not** create a container.

### `uses` Property

Controls which parent state the container inherits. By default containers inherit all parent state:

```xml
<Stack uses="[]">          <!-- inherit nothing from parent -->
  ...
</Stack>

<Stack uses="['userInfo']">  <!-- inherit only 'userInfo' -->
  ...
</Stack>
```

## Scripting Language Semantics

XMLUI's scripting language is a **subset of JavaScript** with these important differences:

### Member access operators are implicitly optional

The `.` member access, `[]` computed member, and `()` function invocation operators all behave like their optional counterparts (`?.`, `?.[]`, `?.()`). Accessing a property on `null` or `undefined` silently returns `undefined` rather than throwing.

### Execution model

**Binding expressions** (values in `{ }` in attributes) are evaluated **synchronously**. Any async operation inside a binding expression raises an error. Statements that take longer than 1 second also raise a timeout error.

**Event handlers** (e.g. `onClick`, `onSubmit`) are always executed **asynchronously**. XMLUI automatically awaits async operations in sequence — you do not need `async`/`await` syntax. Write async calls sequentially and the engine handles the ordering:

```xml
<!-- XMLUI awaits each call automatically -->
<Button onClick="let r = api.execute(); delay(100); testState = r;" />
```

### `async` / `await` keywords

The parser accepts `async` and `await` for syntax compatibility, but the runtime raises an error if it encounters them. Never use them — write sequential async code instead.

### `new` operator

Restricted to a small set of built-in types. Do not use `new` for custom classes, `Error`, `Set`, `Map`, `Date`, or `RegExp`. Use alternatives:

```
throw "error message"     // ✅  instead of: throw new Error("...")
```

### No `Promise` chains, no `setTimeout`

Use `delay(ms)` instead of `setTimeout`. Compose async work by writing statements in order.

See `testing/e2e.md` for applied examples in the test context.
