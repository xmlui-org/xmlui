# XML Markup

When you write XML markup to create an XMLUI app, you use XML tags to name components. And you use XML attributes to set properties that govern their behavior.

## Properties

An attribute may be a literal string that sets the value of a property.

```xmlui-pg name="A literal property" copy display
<Text value="This is rendered as text." />
```

## Expressions

An attribute may also be a JavaScript expression — enclosed in curly braces `{ }` — that dynamically sets the value of a property.

```xmlui-pg copy name="A dynamic property" display
<Text value="Life, the universe, and everything: { 6 * 7 }" />
```

An expression can hold a JSON list.

```xmlui-pg copy name="A JSON list" display /['Bakerloo', 'Central', 'Circle']/
<Items data="{ ['Bakerloo', 'Central', 'Circle'] }" >
  <Text>{ $item }</Text>
</Items>
```

Or a complex JSON object, in which case you'll write an outer set of curly braces to introduce the expression and an inner set to define an object like this form's `data` property.

```xmlui-pg copy name="A complex JSON object" display /{ station: "Brixton", wifi: true, toilets: false }/
<App>
  <Form id="searchForm" padding="0.5rem"
    data='{ { station: "Brixton", wifi: true, toilets: false } }'
    onSubmit="() => { preview.setValue(JSON.stringify($data)) }"
  >
    <Text>Search for station amenities</Text>
    <HStack verticalAlignment="center" >
      <FormItem bindTo="station" />
      <FormItem
        type="checkbox"
        label="wifi"
        bindTo="wifi"
        labelPosition="start"
      />
      <FormItem
        type="checkbox"
        label="toilets"
        bindTo="toilets"
        labelPosition="start"
      />
    </HStack>
    <property name="buttonRowTemplate">
        <Button type="submit" icon="search" label="Search"/>
    </property>
  </Form>

  <TextArea id="preview" />
</App>
```

> [!INFO]
> In addition to a literal string or an expression, you will sometimes use the special tag `<property>` to set a value using markup, like the `ButtonRowTemplate` that defines this form's button.

## Variables

A component may declare a *variable* that's visible to itself and its children. Variable names start with a letter or an underscore (`_`) and continue with these characters or digits.

You can declare a variable using the `var` prefix.

```xmlui-pg copy name="Declaring a variable with var" display /var/ /stations/
<App var.stations="{ [ 'Bakerloo', 'Central', 'Circle'] }">
  <Items data="{stations}">
    <Text> {$item} </Text>
  </Items>
</App>
```

Or using the `<variable>` helper tag.

```xmlui-pg copy name="Declaring a variable with <variable>" display /<variable/ /stations/
<App>
  <variable
    name="stations"
    value="{ [ 'Bakerloo', 'Central', 'Circle'] }" />
  <Items data="{stations}">
    <Text>{$item}</Text>
  </Items>
</App>
```

### When does a variable stop following its initial value?

A variable declared with `var.name="{expr}"` starts as a **reactive binding**. XMLUI re-evaluates `expr` when its dependencies change.

As soon as you **assign to that same variable** in an event handler, the variable switches to the assigned runtime value. In practice: it no longer follows the original expression.

Click `Increment source` first: `mirror` follows `source`.
Then click `Override mirror`: from that point, `mirror` no longer tracks `source`.

This is intentional: explicit assignment means "from now on, use this runtime value for this variable."

```xmlui-pg copy name="A variable follows until reassigned" display
<App var.source="{0}" var.mirror="{source}">
  <Text>source = {source}</Text>
  <Text>mirror = {mirror}</Text>

  <Button label="Increment source" onClick="source++" />
  <Button label="Override mirror" onClick="mirror = 999" />
</App>
```

A common place this surprises developers is when a variable mirrors a `DataSource` result.
In this example, `items` starts reactive (`apiResult.value ?? []`) and then gets reassigned to a filtered snapshot. After that reassignment, `items` does not follow refetches:

```xmlui-pg copy name="Snapshot decouples from DataSource after assignment" display
---app
<App>
  <DataSource id="apiResult" url="/api/names-with-activity-decoupled" />
  <APICall
    id="addItem"
    method="post"
    url="/api/names-with-activity-decoupled"
    invalidates="/api/names-with-activity-decoupled"
  />

  <variable name="items" value="{apiResult.value ?? []}" />

  <Text>DataSource count: {(apiResult.value ?? []).length}</Text>
  <Text>items count: {items.length}</Text>

  <Button
    label="Take snapshot of active items"
    onClick="items = (apiResult.value ?? []).filter(i => i.active)"
  />
  <Button
    label="Add active item"
    onClick="addItem.execute()"
  />

  <Items data="{items}">
    <Text>{$item.name}</Text>
  </Items>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.items = [
    { id: 1, name: 'Anna', active: true },
    { id: 2, name: 'Helga', active: false },
    { id: 3, name: 'Bob', active: true },
    { id: 4, name: 'John', active: false }
  ]",
  "operations": {
    "get-names-with-activity-decoupled": {
      "url": "/names-with-activity-decoupled",
      "method": "get",
      "handler": "return $state.items"
    },
    "add-names-with-activity-decoupled": {
      "url": "/names-with-activity-decoupled",
      "method": "post",
      "handler": "$state.items = [...$state.items, { id: $state.items.length + 1, name: 'Frank', active: true }]"
    }
  }
}
```

If you need the variable to stay reactive while also supporting local overrides, keep the override in a separate variable and combine them in the binding expression:

```xmlui-pg copy name="Keeping reactivity with a separate override variable" display
---app
<App>
  <DataSource id="apiResult" url="/api/names-with-activity-live" />
  <APICall
    id="addItem"
    method="post"
    url="/api/names-with-activity-live"
    invalidates="/api/names-with-activity-live"
  />
  <variable name="activeOnly" value="{false}" />

  <Text>
    Visible count: {
      (apiResult.value ?? []).filter(i => !activeOnly || i.active).length
    }
  </Text>

  <Button
    label="Toggle active filter"
    onClick="activeOnly = !activeOnly"
  />
  <Button
    label="Add active item"
    onClick="addItem.execute()"
  />

  <Items
    data="{(apiResult.value ?? []).filter(i => !activeOnly || i.active)}"
  >
    <Text>{$item.name}</Text>
  </Items>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.items = [
    { id: 1, name: 'Anna', active: true },
    { id: 2, name: 'Helga', active: false },
    { id: 3, name: 'Bob', active: true },
    { id: 4, name: 'John', active: false }
  ]",
  "operations": {
    "get-names-with-activity-live": {
      "url": "/names-with-activity-live",
      "method": "get",
      "handler": "return $state.items"
    },
    "add-names-with-activity-live": {
      "url": "/names-with-activity-live",
      "method": "post",
      "handler": "$state.items.push({ id: $state.items.length + 1, name: 'Frank', active: true })"
    }
  }
}
```

> [!INFO]
> Special case: assigning a variable directly to a component API object (for example `myData = ds`) is tracked as a live API reference so it can stay reactive to API updates.

### Nested variables

The same variable name can be declared in nested scopes. The engine resolves the name to the variable in the closest (innermost) scope.

```xmlui-pg copy name="Defining and using nested variables" display
<App var.title="var.title is 'Hello, from App!'">
  <H1>{title}</H1>
  <VStack var.title="var.title is 'Hello, from VStack'!">
    <Text>{title}</Text>
  </VStack>
</App>
```

### Multiple instances

<Text>Each counter is a separate instance of `CounterTest` with its own local component variables.</Text>

```xmlui-pg name="Isolated component instances"
---app display
<App>
    <HStack horizontalAlignment="center">
      <VStack>
        <Text variant="caption">Counter Instance 1</Text>
        <CounterTest instance="1" />
      </VStack>
      <Stack width="10rem"/>
      <VStack>
        <Text variant="caption">Counter Instance 2</Text>
        <CounterTest instance="2" />
      </VStack>
    </HStack>
</App>
---comp display
<Component name="CounterTest" var.count="{0}">
    <Text>Counter ID: {$props.instance}</Text>
    <Text>Count: {count}</Text>
    <Button onClick="count = count + 1">
      Increment {$props.id}
    </Button>
</Component>
```

### Reactive variables

In [Reactive data binding](/reactive-intro) we saw how a `Select` can cause a `Table` to refresh by setting the `url` property of the `DataSource` on which the `Table` depends. Here's a more basic example of how components interact with reactive variables.

```xmlui-pg copy name="Defining and using reactive variables" display
<App var.count="{0}" var.countTimes3="{3 * count}" >
  <Button
    label="Click to increment the count"
    onClick="count++" />
  <Text>Click count = {count} (changes directly)</Text>
  <Text>Click count * 3 = {countTimes3} (changes indirectly)</Text>
</App>
```

The `Button`'s click handler increments `count` directly. But because `countTimes3` is define using an expression that refers to `count`, the engine reevalautes that expression each time `count` changes and updates `countTimes3` indirectly.

We've seen two ways to declare variables: a `var` declaration in an XML attribute, or the `variable` tag. A similar pattern applies to event handlers. The `Button` to increment the count declares its handler in an attribute whose name combines the `on` prefix with the name [click](/docs/reference/components/Button#click). You may also use the `<event>` helper tag with no prefix for the event name.

```xmlui-pg copy name="Declare an event handler using the <event> tag" display
<App var.count="{0}" >
  <Button label="Click me! Click count = {count}">
    <event name="click">
      { count++ }
    </event>
  </Button>
</App>
```

> [!INFO]
> Why use the `<event>` tag? In this example there's no reason to prefer it. But as we saw above, you declare a `Form`'s `buttonRowTemplate` property in XMLUI markup using the `<property>` helper tag. The same pattern applies when a button's handler is an XMLUI component like `<APICall>`.
> ```xmlui copy
> <Button label="Click to increment the count on the server">
>   <event name="click">
>     <APICall url="/count/increment" />
>   </event>
>   <Text>Click count = {count}</Text>
> </Button>
> ```

## Global Variables

A component may declare a *global variable* that's visible everywhere in the application. Global variable names follow the variable naming shown earlier.
> [!IMPORTANT] Globals must be declared in one of two places: the root element of `Main.xmlui` (using `global.` or `<global>`) or as top-level declarations in a `Globals.xs` code-behind file. They **cannot** be declared in user-defined component files. See [Scoping › Declaring globals in Globals.xs](/docs/guides/scoping#declaring-globals-in-globalsxs) for the code-behind form.
You can declare a variable using the `global` prefix.

```xmlui-pg name="Declaring a global variable with global"
---app copy display /global/ /stations/
<App global.stations="{ [ 'Bakerloo', 'Central', 'Circle'] }">
  <H2>Station List</H2>
  <Stations />
</App>
---comp display copy /stations/
<Component name="Stations">
  <Items data="{stations}">
    <Text> {$item} </Text>
  </Items>
</Component>
```

Alternatively, you can use the `<global>` helper tag.

```xmlui-pg name="Declaring a global variable with <global>"
---app copy display /<global/ /stations/
<App>
  <global name="stations" value="{ [ 'Bakerloo', 'Central', 'Circle'] }" />
  <H2>Station List</H2>
  <Stations />
</App>
---comp display copy /stations/
<Component name="Stations">
  <Items data="{stations}">
    <Text> {$item} </Text>
  </Items>
</Component>
```

> [!INFO] In markup, you can declare globals only in the root element of `Main.xmlui` — declaring them on a nested element or inside a user-defined component file produces an error. The other supported location is the `Globals.xs` code-behind file.