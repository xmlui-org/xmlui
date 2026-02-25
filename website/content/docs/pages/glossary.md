# Glossary

## Code-behind file

A user-defined component, e.g. `Dashboard.xmlui`, may define scripting logic in `Dashboard.xmlui.xs`. The code in that file operates within the component's variable scoping. Generic scripting logic that does not interact with component variables can alternatively be defined in a `<script>` tag in the app's `index.html`.

## Component

The XMLUI engine provides a suite of [built-in components](/docs/reference/components/_overview). You will typically augment these with [user-defined components](/docs/reference/components-intro). Both are represented in markup using XML tags for component names and attributes for properties.

## Component ID

A component may optionally define an `id` attribute used by other components to access its properties (e.g. `data`) and method (e.g. `setValue`).

## Context variables

Special variables automatically provided by XMLUI within specific scopes, prefixed with `$`. Key examples include `$item` (current item in iterations), `$data` (a form's data object), `$props` (properties passed to user-defined components), and `$value` (current field value in a [FormItem](/docs/reference/components/FormItem)).

## Data Binding

This mechanism **fetches data from backend API endpoints** and makes it available to components. In most cases, you only need to provide a URL, and the framework handles the rest, ensuring the data is readily accessible.

## Expression

An expression is snippet of code in an attribute value, wrapped in curly braces (`{` and `}`), that's evaluated by the XMLUI engine in order to check a condition, access and transform data, set a variable, or trigger an action.

## Event handler

An **event handler** in XMLUI responds to user or system events. You can change the component's default behavior by declaring an event handler.

## Global functions

These include functions for notification (`toast()`), navigation (`navigate()`), API operations (`Actions.callApi()`), theme management (`setTheme()`).

## Helper tags

XML tags that provide alternative syntax for declaring variables, properties, and event handlers. The `<variable>` tag declares variables as markup, `<property>` sets component properties using nested markup, and `<event>` declares event handlers as markup.

## Markup

XMLUI uses an XML-inspired syntax to define the layout, structure, and behavior of applications. Minor differences from XML include dotted attribute names (like `var.count`) and multiline attribute (when code spans multiple lines).

## Method

A built-in component may provide methods for query its state and taking actions.

## Property

A built-in component may have properties that govern its appearance and/or behavior, or functionality. A user-defined component can receive arbitrary properties in its `$props` context variable.

### Template property

A component property, declared with the `<property>` helper tag, whose value is a component definition.

## Reactive data binding

XMLUI enables automatic, reactive connections between data sources and UI components. A [DataSource](/docs/reference/components/DataSource) component, you can fetch data from REST endpoints and make it available to other components. When components reference each other through variables, changing data flows through the system just as spreadsheet cells update when their dependencies change.

## Resources

External assets, such as an icon, image, or fonts, typically referenced via an URL.

## Star sizing

A flexible width allocation system used in components like [Table](/docs/reference/components/Table). Values like `*`, `2*`, and `3*` define proportional column widths. For example, a column with `width="3*"` will take three times as much space as a column with `width="*"`, while fixed-width columns (like `100px`) take their exact specified space first.

## Theme

A coherent set of application-wide and component-specific style settings that define the appearance of an app.

## Theme variable

A single setting within a theme definition. Changing the value of a theme variable causes all components that use it to automatically refresh their UI.

## Variable

Like variables in conventional programming languages, XMLUI variables store application state. They are reactive, and automatically update when their dependencies change. Variable names follow the rules for JavaScript identifier: start with a letter or underscore, then letters, numbers, or underscores.
