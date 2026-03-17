# XMLUI: Under the hood

XMLUI is a declarative-reactive framework. Declarative: it uses simple xml-compliant Markup with expressions and event handlers. Reactive, because it ensures that any changes coming from a user or system event are caught and any part of the UI is refreshed accoding to the changes. Take a look at this markup:

```xml
<App var.count="{0}">
  <Button onClick="count++">Count: {count}</Button>
</App>
```

When the user clicks the button, the `click` event handler increments the `count` variable (declared in the `App` node with `var.count="{0}"`). The framework observes that `count` has changes as a result of the event handler and ensures the label of the button changes accordingly. So, when you start the app, the button displays "Count: 0"; after three click is shows "Count: 3".

## Apps, Components, and Variables

It is rarely we can define an application in a single file. XMLUI allows splitting a large app into reusable (user-defined) component. The next app extract an `IncrementButton` component to implement to logic we used previously:

**IncrementButton.xmlui** file:

```xml
<Component name="IncrementButton" var.count="{0}">
  <Button onClick="count++">{$props.label || 'Count'}: {count}</Button>
</Component>
```

The app may use multiple instances on `IncrementButton`:

**Main.xmlui** file:

```xml
<App>
  <IncrementButton />
  <IncrementButton label="Clicks" />
  <IncrementButton label="Taps" />
</App>
```

Observe, each `IncrementButton` has its own `count` variable. So If you click the first button once, the second twice, the third three times, you will see these button labels:

```
Counts: 1
Clicks: 2
Taps: 3
```

### Globals

XMLUI allows you to create global variables (so far only in the main application file). These globals can be accessed from any other components. Take a look at the following app using these files:

**Main.xmlui** file:

```xml
<App global.count="{0}">
  <GlobalIncrementButton label="Global #1" />
  <GlobalIncrementButton label="Global #2" />
  <IncrementButton />
  <IncrementButton label="Clicks" />
</App>
```

**IncrementButton.xmlui** file (the same as earlier):

```xml
<Component name="IncrementButton" var.count="{0}">
  <Button onClick="count++">{$props.label || 'Count'}: {count}</Button>
</Component>
```

**GlobalIncrementButton.xmlui** file:

```xml
<Component name="GlobalIncrementButton">
  <Button onClick="count++">{$props.label || 'Count'}: {count}</Button>
</Component>
```

The first two buttons (**Global #1** and **Global #2**) update the global variable; the last two work as earlier, they use separate counters for each `IncrementButton`. So if you click the first button once, the second twice, the thrird and fourth three and four times, respectively, you will see these button labels:

```
Global #1: 3
Global #2: 3
Count: 3
Clicks: 4
```

### Variable Shadowing

_TBD_

### Components with Inherent State

XMLUI offer components with inherent state &mdash; state managed by the framework as a part of the component's built-in behavior. Such a component is `TextBox`. When you type text into it, the framework keeps the value of the textbox and other components can access it (through the textbox's identifier) without responding explicitly to any event handler:

```xml
<App>
  <TextBox id="myTextBox" label="Type some text" />
  <Text>You typed: {myTextBox.value}</Text>
</App>
```

When you type "Hello!" in the textbox, the text below it will display "You typed: Hello!"

## State Management

XMLUI has a complex state management under the hood that supports the declarative reactive behavior through *state containers*.

> Understanding how state containers work is essential to develop the XMLUI core and also to extend it with new components.



_TBD_