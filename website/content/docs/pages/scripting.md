# XMLUI Scripting

With XMLUI you can go a long way without coding anything more than small JavaScript snippets like those we've seen in the [Markup](/docs/guides/markup) chapter.

An expression:

```xmlui !/{ 6 * 7 }/
<Text value="Life, the universe, and everything: { 6 * 7 }" />
```

A statement:

```xmlui !/{ count++ }/
<Button label="Click to increment the count">
  <event name="click">
    { count++ }
  </event>
</Button>
```

An object literal:

```xmlui !/{ station: "Brixton", wifi: true, toilets: false }/
<Form
  data='{{ station: "Brixton", wifi: true, toilets: false }}'
  onSubmit="() => { preview.setValue(JSON.stringify($data)) }"
>
```

A function call:

```xmlui !/() => { preview.setValue(JSON.stringify($data)) }/
<Form
  data='{{ station: "Brixton", wifi: true, toilets: false }}'
  onSubmit="() => { preview.setValue(JSON.stringify($data)) }"
>
```

A function call with an argument:

```xmlui !/(newTheme) => setTheme(newTheme)/
<Select
  id="pickTheme"
  initialValue="xmlui"
  onDidChange="(newTheme) => setTheme(newTheme)">
</Select>
```

> [!INFO]
> The JavaScript [arrow function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions), `=>`, is a concise way to define and use a function in an XMLUI attribute.

## Writing longer functions

The most elaborate function we've seen so far was this one, used in [Components](/docs/components-intro) chapter to extract data from a complex API response.

```js copy
window.transformStops = function(stops) {
  return stops.map(function(stop) {
  // Helper to extract a value from additionalProperties by key
    function getProp(key) {
      if (!stop.additionalProperties) return '';
      var propObj = stop.additionalProperties.find(function(p) {
        return p.key === key;
      });
      return propObj ? propObj.value : '';
    }
    return {
      name: stop.commonName,
      zone: getProp('Zone'),
      wifi: getProp('WiFi'),
      toilets: getProp('Toilets'),
      // A comma-separated list of line names that serve this stop
      lines: stop.lines
        ? stop.lines.map(function(line) { return line.name; }).join(', ')
        : ''
    };
  });
}
```

Here's how it works.

- `transformStops` receives a `stops` argument which is an array of JavaScript objects created by a `DataSource`. Each is a complex object representing a London tube stop.
- `map` is a method on an array object like `stops`. It takes an anonymous function as an argument, runs it for each item in the array, and returns a new array with each item transformed by a call to the function.
- `function(stop) { ... }` is the anonymous function passed to `map`. It defines a nested helper function, `getProp`, to extract property values.
- `getProp` calls `find`, another method on an array object. In this case the array is `stop.additionalProperties`. Like `map` it receives an anonymous function (`function(p)`) that receives an `additionalProperties` object. It  returns true if the name passed to `getProp` matches the value of `p.key`.

It helps to see the structure of a single object in the `stops` array.

```json
{
  "commonName": "Baker Street Underground Station",
  "placeType": "StopPoint",
  "additionalProperties": [
    {
      "$type": "Tfl.Api.Presentation.Entities.AdditionalProperties, Tfl.Api.Presentation.Entities",
      "category": "ServiceInfo",
      "key": "WiFi",
      "sourceSystemKey": "StaticObjects",
      "value": "yes"
    },
    {
      "$type": "Tfl.Api.Presentation.Entities.AdditionalProperties, Tfl.Api.Presentation.Entities",
      "category": "Facility",
      "key": "Car park",
      "sourceSystemKey": "StaticObjects",
      "value": "no"
    },
  ]
}
```

Here's an example of the transformed output.

```json
{
  "value": [
    {
      "name": "Bank Underground Station",
      "zone": "1",
      "wifi": "yes",
      "toilets": "yes",
      "lines": "Central, Northern, Waterloo & City"
    },
    {
      "name": "Waterloo Underground Station",
      "zone": "1",
      "wifi": "yes",
      "toilets": "no",
      "lines": "Bakerloo, Jubilee, Northern, Waterloo & City"
    }
  ]
}
```

## Deploying the transform function

We defined the function in XMLUI's `index.html` like so:

```html
<script>
  window.transformStops = function(stops) {
    ...
  }
</script>
```

When you define functions in `index.html` you can keep everything in one place for easy reference, and debug your functions in the browser's devtools environment.


## Code-Behind files

You can alternatively put functions into XMLUI *code-behind* files. In this case, for the `TubeStops` component which lives in the file `TubeStops.xmlui`, you would create a parallel file called `TubeStops.xmlui.xs`. In that context, arrow functions are required, so the function would look like this.

```js
function transformStops(stops) {
  return stops.map(stop => {
    // Helper to extract a value from additionalProperties by key
    const getProp = (key) => {
      const prop = stop.additionalProperties &&
        stop.additionalProperties.find(p => p.key === key);
      return prop ? prop.value : '';
    };
    return {
      name: stop.commonName,
      zone: getProp('Zone'),
      wifi: getProp('WiFi'),
      toilets: getProp('Toilets'),
      // A comma-separated list of line names that serve this stop
      lines: stop.lines ? stop.lines.map(line => line.name).join(', ') : ''
    };
  });
}
```

> [!INFO] The `Globals.xs` file is special. All variables and functions declared there are [global variables](/docs/guides/markup#global-variables) visible to all components. `Main.xmlui.xs` declarations are local to the Main component, just like any other code-behind file.

### Globals.xs vs other code-behind files

The two kinds of `.xs` file look identical syntactically — top-level `var` and `function` declarations — but their reach is different:

| File | Reach of declarations | Reactivity |
|---|---|---|
| `Globals.xs` | Global. Visible from every component, including user-defined ones. Equivalent to `global.` declarations on the App root. | `var` is reactive — assignments re-render every consumer |
| `Main.xmlui.xs` | Local to the Main (App) component. Not visible inside user-defined components unless passed as a prop. | `var` is reactive within Main's scope |
| `<ComponentName>.xmlui.xs` | Local to that component. | `var` is reactive within that component's scope |

`Globals.xs` is the practical place to use top-level `var` for app-wide reactive state. A current-user store, a feature-flag map, or a derived utility constant goes here:

```js
// Globals.xs
var currentUser = { id: null, name: 'Guest' };
var featureFlags = { betaSearch: false, darkMode: true };

function isAdmin(user) {
  return user.role === 'admin';
}
```

Any component can read `currentUser`, write to it (`currentUser = newValue` in a handler triggers re-renders everywhere it's read), or call `isAdmin(...)` — no prop-threading.

By contrast, declaring `var` in `Main.xmlui.xs` is equivalent to writing `var.foo` on the App root in markup: the variable is real and reactive, but it's a *Main-local* variable, invisible to user-defined components unless passed as a prop. See [Scoping › Variables](/docs/guides/scoping#variables) for how local-vs-global visibility works in detail.

## index.html vs code-behind

You can use either or both of these strategies in an XMLUI app. Use `index.html` if:

- Your function will be reused across components
- You like keeping all your functions in one place for convenient review
- You need to debug your function
- Your function interacts with JavaScript libraries you load via `index.html`
- You are unfamiliar with "modern" JavaScript features like arrow functions

Use code-behind if:

- You prefer to organize functions by component
- Your function works with variables scoped to a component
- Your function works with XMLUI [globals](/docs/globals)

## Inline code

When you write JavaScript expressions in XMLUI attributes you typically write single expressions, not multiline code blocks. But you can write multiline code blocks in some event handlers, for example click handlers.

```xmlui copy
<Button label="onClick" onClick="{
  console.log('clicked');
  count++;
  toast('count now' + count)
}" />
```

```xmlui copy
<Button label="event tag">
  <event name="click">
  {
    console.log('clicked');
    count++;
    toast('count now' + count)
  }
  </event>
</Button>
```

## Differences from standard JavaScript

If you already know JavaScript, XMLUI scripting will feel immediately familiar — most everyday syntax works as-is. However, the scripting engine is a **sandboxed interpreter**, not the browser's native JavaScript engine. A few behaviors differ in ways that are invisible from reading the code and only surface at runtime. This section lists every meaningful difference so you can write XMLUI scripts confidently from day one.

### Null-safe property access (default, not opt-in)

In standard JavaScript, reading a property on `null` or `undefined` throws a `TypeError`. In XMLUI, the same access silently returns `undefined`:

```xmlui
<!-- Standard JS: throws TypeError if user or user.address is null -->
<!-- XMLUI: returns undefined — no error, no crash -->
<Text value="{user.address.city ?? 'Unknown'}" />
```

This makes bindings resilient while data is loading, but it also means null-reference mistakes won't produce the instant red error you'd see in a browser console. Use `??` or explicit `when` guards to handle genuinely missing data intentionally.

### Where to use `var`, `let`, and `const`

Each keyword has a single legitimate scope. Mixing them up is one of the most common XMLUI scripting mistakes.

| Where you're writing | Use | Don't use |
|---|---|---|
| Markup attribute on a component | `var.x="..."`, `global.x="..."`, `<variable>`, `<global>` | `let.x` and `const.x` don't exist |
| Top level of `Globals.xs`, `Main.xmlui.xs`, or `<Component>.xmlui.xs` | `var x = ...`, `function f() {…}` | `let`, `const`, `class`, control flow, plain expressions — all compile errors |
| Top level of a `<script>` block in markup | `var x = ...`, `function f() {…}` | same as `.xmlui.xs` |
| Inside a function body (event handler, code-behind function, `<script>` function) | `let x = ...`, `const x = ...` | `var x = ...` works syntactically but isn't the documented pattern — prefer `let`/`const` |

The mental model is:

- **`var` lives at component level** — markup attributes, `.xmlui.xs` top-level, `<script>` block top-level. It declares **reactive state** that the rest of the app can observe.
- **`let` and `const` live at function level** — handler bodies, function bodies. They declare **ordinary non-reactive locals** that vanish when the function returns.

```xmlui
<App var.count="{0}">                            <!-- ✓ component-level var, reactive -->
  <Text value="Count: {count}" />

  <Button onClick="
    let doubled = count * 2;                     // ✓ handler-level let, non-reactive
    const message = `Doubled to ${doubled}`;     // ✓ handler-level const, non-reactive
    count = doubled;                             // ✓ writing to the reactive var
    toast(message);
  " label="Double" />
</App>
```

```js
// Globals.xs
var currentUser = { name: 'Guest' };             // ✓ top-level var, becomes a global

function login(name) {
  let timestamp = Date.now();                    // ✓ inside fn body, let is fine
  currentUser = { name, loggedInAt: timestamp };
}

const MAX_RETRIES = 3;                           // ✗ top-level const — compile error
```

**Common mistakes:**

- **Writing `let` or `const` at the top level of a `.xmlui.xs` file** is a compile error. Use `var` for reactive top-level state, or move the constant inside a function body.
- **Writing `var x = ...` inside a handler body** is unusual — the documented pattern uses `let` and `const` there because handler-local declarations are non-reactive by nature.
- **Writing `var.x` inside a handler body** is wrong — that's markup-attribute syntax, not script syntax. Inside a handler, just write `let x` or `const x`.

A subtlety: `var.x="{expr}"` is reactive only until you **explicitly assign** to `x` in a handler. After the first write, `x` holds the assigned value and the initializer expression stops re-evaluating. See [When does a variable stop following its initial value?](/docs/guides/markup#when-does-a-variable-stop-following-its-initial-value) for details.

### Unsupported syntax

The following JavaScript features are **not available** in the XMLUI scripting engine:

| Feature | Status | Alternative |
|---------|--------|-------------|
| `async` / `await` | Not supported | Event handlers are already async; the engine is smart enough and awaits the async calls |
| `class` declarations | Not supported | Use plain objects and functions |
| Destructuring assignment (`const { a, b } = obj`) | Not supported | Access properties directly: `obj.a`, `obj.b` |
| Generator functions (`function*`) | Not supported | — |
| `import` / `export` | Not available in inline code | Use code-behind files with top-level `function` declarations |

### Unavailable globals

The browser globals you use in ordinary JavaScript are not accessible inside XMLUI scripts. Use the XMLUI equivalents instead:

| Unavailable | Use instead |
|-------------|-------------|
| `fetch()` | `<DataSource>` for queries, `<APICall>` for mutations |
| `setTimeout()` / `setInterval()` | [`delay(ms)`](/docs/markup#delay) helper function; [`pollIntervalInSeconds`](/docs/reference/components/DataSource#pollintervalinseconds) on `DataSource` |
| `window`, `document` | Not accessible; use XMLUI layout and [navigation APIs](/docs/globals#navigate) |
| `console.log()` | Available for debugging, but only in development mode |

### Code-behind file restrictions

`.xmlui.xs` code-behind files support only **top-level `var` and `function` declarations**. Unlike a standard JavaScript module, you cannot use `let`, `const`, `class`, control-flow statements, or plain expressions at the module's top level — those are compile errors:

```js
// ✓ Valid in a .xmlui.xs file
var selectedId = null;

function handleSelect(id) {
  selectedId = id;
}

// ✗ Not valid at the top level of a .xmlui.xs file
const MAX = 100;            // use var instead
if (condition) { ... }      // not allowed at top level
someFunction();             // expression statements not allowed
```

Code-behind functions have full access to component variables and the XMLUI globals, just as inline handlers do.

### Execution time limit

Synchronous expressions (bindings in markup attributes) are subject to a **1000 ms timeout**. An expression that takes longer than one second to evaluate throws an error to prevent the UI from freezing. If you hit this limit, move the work into an event handler (which runs asynchronously) or pre-process data in a `transformResult` function on a `DataSource`.

The timeout threshold can be raised by setting [`appGlobals.syncExecutionTimeout`](/docs/app-globals#syncExecutionTimeout) (in milliseconds) in your app configuration, but increasing it is rarely the right solution — it usually indicates that computation belongs in an async handler instead.
