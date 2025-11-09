# App [#app]

The `App` component is the root container that defines your application's overall structure and layout. It provides a complete UI framework with built-in navigation, header, footer, and content areas that work together seamlessly.

**Essential features:**

- **Layout templates**: Choose from 7 predefined layouts (horizontal, vertical, condensed, etc.) with sticky navigation options
- **Routing**: Built-in page routing via the [Pages](/components/Pages) component

## Properties [#properties]

### `autoDetectTone` (default: false) [#autodetecttone-default-false]

This boolean property enables automatic detection of the system theme preference. When set to true and no defaultTone is specified, the app will automatically use "light" or "dark" tone based on the user's system theme setting. The app will also respond to changes in the system theme preference.

### `defaultTheme` [#defaulttheme]

This property sets the app's default theme.

### `defaultTone` [#defaulttone]

This property sets the app's default tone ("light" or "dark").

Available values: `light`, `dark`

### `layout` [#layout]

This property sets the layout template of the app. This setting determines the position and size of the app parts (such as header, navigation bar, footer, etc.) and the app's scroll behavior.

Available values:

| Value | Description |
| --- | --- |
| `vertical` | This layout puts the navigation bar on the left side and displays its items vertically. The main content is aligned to the right (including the header and the footer), and its content is a single scroll container; every part of it moves as you scroll the page. This layout does not display the logo in the app header. |
| `vertical-sticky` | Similar to `vertical`, the header and the navigation bar dock to the top of the main content's viewport, while the footer sticks to the bottom. This layout does not display the logo in the app header. |
| `vertical-full-header` | Similar to `vertical-sticky`. However, the header and the navigation bar dock to the top of the app's window, while the footer sticks to the bottom. |
| `condensed` | Similar to `horizontal`. However, the header and the navigation bar are in a single header block. (default) |
| `condensed-sticky` | However, the header and the navigation bar are in a single header block. |
| `horizontal` | This layout stacks the layout sections in a single column in this order: header, navigation bar, main content, and footer. The application is a single scroll container; every part moves as you scroll the page. |
| `horizontal-sticky` | Similar to `horizontal`, the header and the navigation bar dock to the top of the viewport, while the footer sticks to the bottom. |
| `desktop` | This layout stretches the app to fill the entire browser viewport with zero padding and margins. The header (if present) docks to the top, the footer (if present) docks to the bottom, and the main content stretches to fill the remaining vertical and horizontal space. |

Here are a few samples demonstrating the usage of the `layout` property. All samples use this markup, except the value of `App`'s layout and a few marked code snippets:

```xmlui
<App layout="(specific layout value)">
  <!-- AppHeader omitted for "vertical" and "vertical-sticky" -->
  <AppHeader>
    <property name="logoTemplate">
      <Heading level="h3" value="Example App"/>
    </property>
  </AppHeader>
  <NavPanel>
    <NavLink label="Home" to="/" icon="home"/>
    <NavLink label="Page 1" to="/page1"/>
    <NavLink label="Page 2" to="/page2"/>
  </NavPanel>
  <Pages fallbackPath="/">
    <Page url="/">
      <List data="https://api.spacexdata.com/v3/history">
        <property name="itemTemplate">
          <Card title="{$item.title}" subtitle="{$item.details}"/>
        </property>
      </List>
    </Page>
    <Page url="/page1">
      <Text value="Page 1" />
    </Page>
    <Page url="/page2">
      <Text value="Page 2" />
    </Page>
  </Pages>
  <Footer>Powered by XMLUI</Footer>
</App>
```

#### `horizontal` [#horizontal]

```xmlui-pg copy name="Example: 'horizontal' layout" height="350px"
<App layout="horizontal">
  <AppHeader>
    <property name="logoTemplate">
      <Heading level="h3" value="Example App"/>
    </property>
  </AppHeader>
  <NavPanel>
      <NavLink label="Home" to="/" icon="home"/>
      <NavLink label="Page 1" to="/page1"/>
      <NavLink label="Page 2" to="/page2"/>
  </NavPanel>
  <Pages fallbackPath="/">
      <Page url="/">
        <List data="https://api.spacexdata.com/v3/history">
          <property name="itemTemplate">
            <Card title="{$item.title}" subtitle="{$item.details}"/>
          </property>
        </List>
      </Page>
      <Page url="/page1">
        <Text value="Page 1" />
      </Page>
      <Page url="/page2">
        <Text value="Page 2" />
      </Page>
  </Pages>
  <Footer>Powered by XMLUI</Footer>
</App>
```

#### `horizontal-sticky` [#horizontal-sticky]

```xmlui-pg copy name="Example: 'horizontal-sticky' layout" height="350px"
<App layout="horizontal-sticky">
  <AppHeader>
    <property name="logoTemplate">
      <Heading level="h3" value="Example App"/>
    </property>
  </AppHeader>
  <NavPanel>
      <NavLink label="Home" to="/" icon="home"/>
      <NavLink label="Page 1" to="/page1"/>
      <NavLink label="Page 2" to="/page2"/>
  </NavPanel>
  <Pages fallbackPath="/">
      <Page url="/">
        <List data="https://api.spacexdata.com/v3/history">
          <property name="itemTemplate">
            <Card title="{$item.title}" subtitle="{$item.details}"/>
          </property>
        </List>
      </Page>
      <Page url="/page1">
        <Text value="Page 1" />
      </Page>
      <Page url="/page2">
        <Text value="Page 2" />
      </Page>
  </Pages>
  <Footer>Powered by XMLUI</Footer>
</App>
```

#### `condensed` [#condensed]

```xmlui-pg copy name="Example: 'condensed' layout" height="350px"
<App layout="condensed">
  <property name="logoTemplate">
    <Heading level="h3" value="Example App"/>
  </property>
  <NavPanel>
      <NavLink label="Home" to="/" icon="home"/>
      <NavLink label="Page 1" to="/page1"/>
      <NavLink label="Page 2" to="/page2"/>
  </NavPanel>
  <Pages fallbackPath="/">
      <Page url="/">
        <List data="https://api.spacexdata.com/v3/history">
          <property name="itemTemplate">
            <Card title="{$item.title}" subtitle="{$item.details}"/>
          </property>
        </List>
      </Page>
      <Page url="/page1">
        <Text value="Page 1" />
      </Page>
      <Page url="/page2">
        <Text value="Page 2" />
      </Page>
  </Pages>
  <Footer>Powered by XMLUI</Footer>
</App>
```

#### `condensed-sticky` [#condensed-sticky]

```xmlui-pg copy name="Example: 'condensed-sticky' layout" height="350px"
<App layout="condensed-sticky">
  <property name="logoTemplate">
      <Heading level="h3" value="Example App"/>
  </property>
  <NavPanel>
      <NavLink label="Home" to="/" icon="home"/>
      <NavLink label="Page 1" to="/page1"/>
      <NavLink label="Page 2" to="/page2"/>
  </NavPanel>
  <Pages fallbackPath="/">
      <Page url="/">
        <List data="https://api.spacexdata.com/v3/history">
          <property name="itemTemplate">
            <Card title="{$item.title}" subtitle="{$item.details}"/>
          </property>
        </List>
      </Page>
      <Page url="/page1">
        <Text value="Page 1" />
      </Page>
      <Page url="/page2">
        <Text value="Page 2" />
      </Page>
  </Pages>
  <Footer>Powered by XMLUI</Footer>
</App>
```

#### `vertical` [#vertical]

```xmlui-pg copy name="Example: 'vertical' layout" height="300px"
<App layout="vertical">
  <property name="logoTemplate">
    <Heading level="h3" value="Example App"/>
  </property>
  <NavPanel>
    <NavLink label="Home" to="/" icon="home"/>
    <NavLink label="Page 1" to="/page1"/>
    <NavLink label="Page 2" to="/page2"/>
  </NavPanel>
  <Pages fallbackPath="/">
      <Page url="/">
        <List data="https://api.spacexdata.com/v3/history">
          <property name="itemTemplate">
            <Card title="{$item.title}" subtitle="{$item.details}"/>
          </property>
        </List>
      </Page>
      <Page url="/page1">
        <Text value="Page 1" />
      </Page>
      <Page url="/page2">
        <Text value="Page 2" />
      </Page>
  </Pages>
  <Footer>Powered by XMLUI</Footer>
</App>
```

#### `vertical-sticky` [#vertical-sticky]

```xmlui-pg copy name="Example: 'vertical-sticky' layout" height="300px"
<App layout="vertical-sticky">
  <property name="logoTemplate">
    <Heading level="h3" value="Example App"/>
  </property>
  <NavPanel>
      <NavLink label="Home" to="/" icon="home"/>
      <NavLink label="Page 1" to="/page1"/>
      <NavLink label="Page 2" to="/page2"/>
  </NavPanel>
  <Pages fallbackPath="/">
      <Page url="/">
        <List data="https://api.spacexdata.com/v3/history">
          <property name="itemTemplate">
            <Card title="{$item.title}" subtitle="{$item.details}"/>
          </property>
        </List>
      </Page>
      <Page url="/page1">
        <Text value="Page 1" />
      </Page>
      <Page url="/page2">
        <Text value="Page 2" />
      </Page>
  </Pages>
  <Footer>Powered by XMLUI</Footer>
</App>
```

#### `vertical-full-header` [#vertical-full-header]

```xmlui-pg copy name="Example: 'vertical-full-header' layout" height="300px"
<App layout="vertical-full-header">
  <AppHeader>
    <property name="logoTemplate">
        <Heading level="h3" value="Example App"/>
    </property>
  </AppHeader>
  <NavPanel>
      <NavLink label="Home" to="/" icon="home"/>
      <NavLink label="Page 1" to="/page1"/>
      <NavLink label="Page 2" to="/page2"/>
  </NavPanel>
  <Pages fallbackPath="/">
      <Page url="/">
        <List data="https://api.spacexdata.com/v3/history">
          <property name="itemTemplate">
            <Card title="{$item.title}" subtitle="{$item.details}"/>
          </property>
        </List>
      </Page>
      <Page url="/page1">
        <Text value="Page 1" />
      </Page>
      <Page url="/page2">
        <Text value="Page 2" />
      </Page>
  </Pages>
  <Footer>Powered by XMLUI</Footer>
</App>
```

#### `desktop` [#desktop]

```xmlui-pg copy name="Example: 'desktop' layout" height="300px"
<App layout="desktop">
  <AppHeader>
    <property name="logoTemplate">
        <Heading level="h3" value="Example App"/>
    </property>
  </AppHeader>
  <Pages fallbackPath="/">
      <Page url="/">
        <List data="https://api.spacexdata.com/v3/history">
          <property name="itemTemplate">
            <Card title="{$item.title}" subtitle="{$item.details}"/>
          </property>
        </List>
      </Page>
      <Page url="/page1">
        <Text value="Page 1" />
      </Page>
      <Page url="/page2">
        <Text value="Page 2" />
      </Page>
  </Pages>
  <Footer>Powered by XMLUI</Footer>
</App>
```

The `desktop` layout is designed for full-screen desktop applications. It stretches the app to fill the entire browser viewport with zero padding and margins. The header (if present) docks to the top, the footer (if present) docks to the bottom, and the main content area stretches to fill all remaining vertical and horizontal space. This layout ignores all max-width constraints and scrollbar gutter settings to ensure edge-to-edge display.

### `loggedInUser` [#loggedinuser]

Stores information about the currently logged-in user. By not defining this property, you can indicate that no user is logged in.

Stores information about the currently logged in user.
Currently, there is no restriction on what the user data must look like.

```xmlui-pg copy display name="Example: loggedInUser" height="180px"
<App loggedInUser="{{ name: 'Joe', token: '1234' }}">
  <NavPanel>
    <NavLink label="Home" to="/" icon="home"/>
  </NavPanel>
  <Pages fallbackPath="/">
    <Page url="/">
      <Text value="User name: {loggedInUser.name}" />
      <Text value="User token: {loggedInUser.token}" />
    </Page>
  </Pages>
</App>
```

### `logo` [#logo]

Optional logo path

### `logo-dark` [#logo-dark]

Optional logo path in dark tone

### `logo-light` [#logo-light]

Optional logo path in light tone

### `logoTemplate` [#logotemplate]

Optional template of the app logo

### `name` [#name]

Optional application name (visible in the browser tab). When you do not define this property, the tab name falls back to the one defined in the app's configuration. If the name is not configured, "XMLUI App" is displayed in the tab.

### `noScrollbarGutters` (default: false) [#noscrollbargutters-default-false]

This boolean property specifies whether the scrollbar gutters should be hidden.

### `scrollWholePage` (default: true) [#scrollwholepage-default-true]

This boolean property specifies whether the whole page should scroll (`true`) or just the content area (`false`). The default value is `true`.

This boolean property specifies whether the whole page should scroll (true) or just the content area (false).
The default value is `true`.

```xmlui-pg copy display name="Example: scrollWholePage" height="150px"
<App scrollWholePage="false">
  <NavPanel>
    <NavLink label="Home" to="/" icon="home"/>
  </NavPanel>
  <Pages fallbackPath="/">
    <Page url="/">
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Text>
    </Page>
  </Pages>
</App>
```

## Events [#events]

### `messageReceived` [#messagereceived]

This event fires when the `App` component receives a message from another window or iframe via the window.postMessage API.

The event handler method has two parameters. The first is the message sent; the second is the entire native event object.

```xmlui-pg copy display name="Example: messageReceived" /onMessageReceived/ /window.postMessage/
<App 
  var.message = "<none>" 
  onMessageReceived="(msg, ev) => {
    message = JSON.stringify(msg);
    console.log('Message event received:', ev);
  }">
  <Button label="Send a message"
    onClick="window.postMessage({type: 'message', messages:'Here you are!'})" />
  <Text>Message received: {message}</Text>
</App>
```

### `ready` [#ready]

This event fires when the `App` component finishes rendering on the page.

This event fires when the `App` component finishes rendering on the page.
Use it as `onReady` when inlining it on the component.

```xmlui-pg copy display name="Example: ready"
<App onReady="isAppReady = true">
  <variable name="isAppReady" value="{false}"/>
  <Text value="{isAppReady ? 'App is ready' : 'Sadly, App is not ready'}" />
</App>
```

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-content-App | $backgroundColor | $backgroundColor |
| [backgroundColor](../styles-and-themes/common-units/#color)-navPanel-App | $backgroundColor | $backgroundColor |
| [borderBottom](../styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-content-App | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-header-App | none | none |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-navPanel-App | $boxShadow-spread | $boxShadow-spread |
| [maxWidth](../styles-and-themes/common-units/#size)-App | *none* | *none* |
| [maxWidth-content](../styles-and-themes/common-units/#size)-App | $maxWidth-content | $maxWidth-content |
| [width](../styles-and-themes/common-units/#size)-navPanel-App | $space-64 | $space-64 |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`maxWidth-content-App`** | This theme variable defines the maximum width of the main content. If the main content is broader, the engine adds margins to keep the expected maximum size. |
| **`boxShadow‑header‑App`** | This theme variable sets the shadow of the app's header section. |
| **`boxShadow‑navPanel‑App`** | This theme variable sets the shadow of the app's navigation panel section (visible only in vertical layouts). |
| **`width‑navPanel‑App`** | This theme variable sets the width of the navigation panel when the app is displayed with one of the vertical layouts. |
