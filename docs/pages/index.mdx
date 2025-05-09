# Introduction

**XMLUI is a framework for building UIs declaratively with XML/XHTML markup, optional lightweight scripting, and flexible theming.**

## No Build Required

>[!INFO]
> XMLUI applications can be served directly as static files. Simply host them on a standard web server and load them in
  a browser—no bundling, compiling, or build pipeline needed.

## Declarative Markup

>[!INFO]
> With an XML-based approach, your UI’s structure and appearance are clearly defined in markup, making it easy to
  understand, modify, and maintain without digging through complex scripts.

```xmlui-pg copy display name="Example: Hello, World!"
<App>
  Hello, World from XMLUI!
</App>
```

You can **bind components to work together**.

```xmlui-pg copy display name="Example: Bind components"
<App>
  <TextBox id="myTextBox" placeholder="Type something" />
  <Text>You typed: {myTextBox.value}</Text>
</App>
```

## Reactive Data Handling

>[!INFO]
> The UI automatically updates whenever underlying data changes. This built-in reactivity means you don’t have to
  manually trigger refreshes or write additional logic, streamlining the development process.

```xmlui-pg
---app copy display name="Example: Reactive variables"
<App
  var.count="{0}"
  var.countTimes3="{3 * count}" >
  <Button label="Click to increment!" onClick="count++" />
  <Text>Click count = {count}</Text>
  <Text>Click count * 3 = {countTimes3}</Text>
</App>
---desc
Each time the button is clicked, `count` is incremented, causing `countTimes3` to automatically recalculate and the UI to update accordingly.
```

## Flexible Theming and Styling

>[!INFO]
>  XMLUI themes and theme variables let you adjust colors, fonts, spacing, and more from a central location. Change a single theme variable, and the updated look cascades throughout the entire interface automatically.

```xmlui-pg
---app copy {5, 9} display name="Example: Flexible themes"
<App>
  <HStack verticalAlignment="center">
    <Button label="First" />
    <ProgressBar width="80px" value="0.6" />
    <Theme color-primary="purple">
      <Button label="Second" />
      <ProgressBar width="80px" value="0.6" />
    </Theme>
    <Theme textColor-Button="orange">
      <Button label="Third" />
      <ProgressBar width="80px" value="0.6" />
    </Theme>
  </HStack>
</App>
---desc
The `color-primary` theme variable affects all components using the primary color; `textColor-Button` affects only the `Button` component's appearance.
```

## Reusable Components

>[!INFO]
> Define a component once and reuse it across different parts of your app or even share it as a third-party component. This modular approach saves development time, ensures consistency, and simplifies maintenance.

Reusable components are in a separate markup file:

```xmlui-pg 
---comp copy filename="components/MySquare.xmlui" /MySquare/
<Component name="MySquare">
  <Stack
    width="{$props.size}"
    height="{$props.size}"
    backgroundColor="{$props.color}"
    onClick="emitEvent('click')"/>
</Component>
---desc
The app can immediately leverage the reusable component:
---app copy filename="Main.xmlui" name="Example: Hello, World!"
<App var.lastClicked="none">
  <HStack>
    <MySquare size="24px" color="red" onClick="lastClicked = 'red'" />
    <MySquare size="36px" color="green" onClick="lastClicked = 'green'" />
    <MySquare size="48px" color="blue" onClick="lastClicked = 'blue'" />
  </HStack>
  <Text>Last clicked: {lastClicked}</Text>
</App>
```

## Seamless Data Integration

>[!INFO]
> Connecting your UI to backend APIs is as simple as providing a URL. The framework fetches and presents the data
  without extra tooling, ensuring that dynamic content is readily available and easy to incorporate.

```xmlui-pg copy display name="Example: Fetch and display data" height="300px"
<App>
  <List data="https://api.spacexdata.com/v4/history">
    <Card title="{$item.title}" subtitle="{$item.details}"/>
  </List>
</App>
```
