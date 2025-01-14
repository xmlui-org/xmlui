# XMLUI Rendering fundamentals

The rendering engine in xmlui has a simple job. It receives a representation of the app (markup + code) and renders a hierarchy of React components that implement the app's appearance and behavior.

The engine has a simple rendering loop with these steps:

1. The engine renders the UI according to the application's initial state.
2. The app waits for user events (e.g., mouse, keyboard, and other actions) and system events (e.g., data received from the backend, app focus changed, etc.).
3. Whenever an event is triggered, the app runs a related event handler that may change the app's state.
4. The app refreshes the UI according to the state changes and continues the loop from step 2.

## The XMLUI "Magic"

The engine, leveraging the React infrastructure, simplifies the UI rendering and event response. It introduces a few 'Magic' elements that streamline the markup and require only a minimal amount of code for app logic implementation.

- **M1: Automatic change detection**. Upon any change in the app's state, the engine automatically identifies the UI sections that need refreshing and updates only those, ensuring an efficient and responsive UI.
- **M2: Reactive variables**. The engine uses reactive variables, essentially state variables that keep track of other variables on which they depend. The variable value is updated whenever a dependency changes, potentially causing a UI refresh.
- **M3: Smart event handler execution**. Event handlers and related machinery use async execution without explicit user code to deal with the async aspects. This execution happens without the user knowing anything about it, resulting in a responsive UI.
- **M4: Automatic data fetching**. Data is a first-class citizen. The user declares the data it uses, and the framework takes care of the nitty-gritty details of fetching it, including handling the mandatory dances of web API invocations, such as making the request, handling the response, and updating the UI with the fetched data.
- **M5: Data Caching**. The engine understands the role of a particular piece of data. In addition to caching the data, the framework knows which part of the UI should be invalidated (and refreshed) when the data changes. For example, when the app displays a list and the user changes the data behind a particular row in a dialog, the UI automatically refreshes the list.
- **M6: Themes**. All components set their visual style (CSS style) through themes (composed from theme variables). The UI is automatically refreshed whenever a theme changes (and so do the theme variables).
- **M7: Static File Serving**. The rendering engine supports static file serving without any previous build process. An app's source files can be directly used in a production environment. The engine pre-compiles the app (in the browser) before executing it. 

## The Fundamental Design Aspects of the Rendering Engine

The following principles ensure the engine works by leveraging the features mentioned above:

### The concept of components

The application itself is a single component built from other components that may be:
- Core components shipped with xmlui
- Third-party xmlui components coming from other packages and libraries
- App-specific components declared by the app's developer using xmlui markup and code elements (no HTML or JavaScript)

These components can be nested into an arbitrary deep component hierarchy.

Example:

```xml
<App xmlns:AcmeComp="component-ns:AcmeCompany.Xmlui.Components" >
  <!-- ... -->
  <VStack>
    <AcmeComp:DataGrid url="/api/services" />
    <ContactPanel title="Contact us!" />
  </VStack>
<App>
```

Here, `App` and `VStack` are core xmlui components. `DataGrid` is a third-party component shipped by **Acme Company** and accessed via the `AcmeComp` namespace. `ContactUs` represents an app-specific component declared within this app in a separate component markup file (and optional code-behind file).

### How the engine runs app logic code

The framework's scripting language, a subset of JavaScript that you are already familiar with, shares the same semantics. However, the code never turns into native JavaScript as the browser runs a loaded JavaScript file.

The engine, equipped with its parser (and pre-compiler), transforms the scripting code into an intermediate representation. The execution of this representation, while slower than native JavaScript, is efficient enough for apps and ensures a smooth user interface without any lag.

The rendering engine leverages the interpreted nature of code execution when implementing **M2 (Reactive Variables)** and **M3 (Smart event handler execution)**.

Example #1:

```xml
<App
  var.count="{0}" 
  var.countTimes3="{3 * count}" >
  <Button label="Click to increment!" onClick="count++" />
  <Text>Click count = {count}</Text>
  <Text>Click count * 3 = {countTimes3}</Text>
</App>
```

In this example, due to the **M2 (Reactive variables)**, each time the button is clicked, `count` increments, causing `countTimes3` to recalculate automatically and the UI to update accordingly.

Example #2:

```xml
<App var.count="{0}" var.loopRuns="{false}">
  <HStack>
    <Button enabled="{!loopRuns}"
      label="Start infinite loop"
      themeColor="attention"
      onClick="loopRuns = true; while (loopRuns) count++;"
    />
    <Button
      enabled="{loopRuns}"
      label="Exit infinite loop"
      onClick="loopRuns = false;"/>
  </HStack>
  Counter value: {count}
</App>
```

In this example, clicking the first button starts an infinite loop. Due to **M3 (Smart event handler execution)**, the infinite loop is executed asynchronously so the UI can respond to other events, such as clicking the second button that breaks the infinite loop.

### Data and Component Binding

Component cooperation is declarative in xmlui. A particular component can refer to the state of another component through expressions; we call this concept "binding". Whenever that state changes, the binding (the expression defining it) is re-evaluated, and the component (referring to the state of the other) is refreshed accordingly.

Example #1:

```xml
<App>
  <TextBox id="myTextBox" placeholder="Type something" />
  <Text variant="title">You typed: {myTextBox.value}</Text>
</App>
```

Whatever the user types into the textbox is displayed in the text below.

Example #2:

```xml
<App>
  <List data="https://api.spacexdata.com/v4/history">
    <Card title="{$item.title}" subtitle="{$item.details}"/>
  </List>
</App>
```

When the list's data is fetched from the specified URL, a particular list item displays the `title` and `detail	s` fields in the rendered data item.

### State Management with Containers

The engine's state management mechanism is the core of its operation; it is crucial for every aspect of the framework's operation:
- The state lives in hierarchical containers that follow the hierarchy of the app's markup. The engine wraps particular markup elements into its unique `Container` object, which contains the state for the wrapped app fragment.
- State containers form a hierarchical tree following the markup hierarchy, so similarly, there is a parent-child relationship chain among containers. The state of parent containers flows down automatically to all child containers.
- When the state of the container changes, the wrapped app fragment is re-rendered.

> Note: When mentioning state management, we think of the rendering engine's state, not the app's. The latter is the state of the app's UI logic and belongs to the app's functionality. The rendering engine's state is more complex and detailed; the app's logic is just a projection of that.

State management is the most complex part of the rendering engine, as everything is connected to the current state. Here is a list of things the engine manages through state containers:
- The explicit variables the app declares in the markup and code. The engine detects changes within compound objects, including hash objects, arrays, and their composition, in any depth.
- The state of internal objects that manage data fetching and web API invocations.
- The state of event handlers (remember, event handler code runs asynchronously).
- The state of a particular object's internal logic. For example, forms implement a UI logic behind the scenes that helps fill in forms, validate form elements, manage form submissions, etc.

### Data Caching 

_TBD_

### Style Management with Smart Theme Variables

The rendering engine uses CSS variables (through the `var()` function) as the cornerstone of component style management. Each native component establishes (most of) its CSS style settings using this indirection:
- The CSS styles that affect a component's fundamental behavior (such as using a flex container, setting rendering orientations, positioning, etc.) are hard-coded in the component's style declaration.
- CSS variables define the CSS styles that can be influenced through component properties or are intended to support theming.

The xmlui theming system entirely hides CSS (including style names and CSS variable resolution) with hierarchical theme variables.