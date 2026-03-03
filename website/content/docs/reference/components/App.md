# App [#app]

The `App` component is the root container that defines your application's overall structure and layout. It provides a complete UI framework with built-in navigation, header, footer, and content areas that work together seamlessly.

**Essential features:**

- **Layout templates**: Choose from 7 predefined layouts (horizontal, vertical, condensed, etc.) with sticky navigation options
- **Routing**: Built-in page routing via the [Pages](/docs/reference/components/Pages) component

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Publish/Subscribe | `subscribeToTopic` |
| Styling Variant | `variant` |

## Properties [#properties]

### `autoDetectTone` [#autodetecttone]

> [!DEF]  default: **false**

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
| `desktop` | This layout is designed for desktop applications with a fixed viewport structure. The app fills the entire browser viewport (100vw × 100vh) with zero padding and margins. The header remains fixed at the top, the footer remains fixed at the bottom, and the main content dynamically fills all remaining vertical space between them. When the content overflows, only the main content area scrolls while the header and footer remain visible. This creates a classic desktop application layout with persistent header and footer regions. |

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

### `noScrollbarGutters` [#noscrollbargutters]

> [!DEF]  default: **false**

This boolean property specifies whether the scrollbar gutters should be hidden.

### `scrollWholePage` [#scrollwholepage]

> [!DEF]  default: **true**

This boolean property specifies whether the whole page should scroll (`true`) or just the content area (`false`). The default value is `true`.

This boolean property specifies whether the whole page should scroll (true) or just the content area (false).
The default value is `true`.

```xmlui-pg copy display name="Example: scrollWholePage='false'" height="300px"
<App scrollWholePage="false">
  <NavPanel>
    <NavLink label="Home" to="/" icon="home"/>
  </NavPanel>
  <Pages fallbackPath="/">
    <Page url="/">
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed 
        do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        Ut enim ad minim veniam, quis nostrud exercitation ullamco 
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure 
        dolor in reprehenderit in voluptate velit esse cillum dolore eu 
        fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, 
        sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Text>
    </Page>
  </Pages>
</App>
```

When `scrollWholePage` is set to `false`, the main content panel's height is stretched to the remaining height of the viewport between the header and the footer.
When you use star sizing, it calculates the effective height from the main content's height:

```xmlui-pg copy display name="Example: scrollWholePage='false' (star-sizing)" height="300px"
<App layout="horizontal" scrollWholePage="false">
  <AppHeader>
    Horizontal Splitter Example
  </AppHeader>
  <CHStack height="*" backgroundColor="lightblue">1/4</CHStack>
  <CHStack height="3*" backgroundColor="lightcoral">3/4</CHStack>
  <Footer>
    Footer Content
  </Footer>
</App>
```

Here is a more complex example built on star-sizing:

```xmlui-pg copy display name="Example: scrollWholePage='false' (with Splitter)" height="300px"
<App layout="horizontal" scrollWholePage="false">
  <AppHeader>
    Horizontal Splitter Example
  </AppHeader>
  <HSplitter height="*" minPrimarySize="180px" maxPrimarySize="-180px">
    <List
      id="myList"
      data="{ Array.from({ length: 100 }).map((_, i) => i) }"
    >
      <Card title="Item #{$item}" />
    </List>
    <Card title="Details" />
  </HSplitter>
  <Footer>
    Footer Content
  </Footer>
</App>
```

## Events [#events]

### `didNavigate` [#didnavigate]

This event fires after the app has completed any navigation (including Link clicks, browser back/forward, and programmatic navigation).

**Signature**: `(to: string | number, queryParams?: Record<string, any>) => Promise<void>`

- `to`: The path that was navigated to.
- `queryParams`: Query parameters (only available for programmatic navigation).

### `keyDown` [#keydown]

This event fires when a key is pressed while the `App` has focus or when the event reaches the app level without being consumed by a child component.

**Signature**: `(event: KeyboardEvent) => void`

- `event`: The keyboard event object.

### `keyUp` [#keyup]

This event fires when a key is released while the `App` has focus or when the event reaches the app level without being consumed by a child component.

**Signature**: `(event: KeyboardEvent) => void`

- `event`: The keyboard event object.

### `messageReceived` [#messagereceived]

This event fires when the `App` component receives a message from another window or iframe via the window.postMessage API.

**Signature**: `(data: any) => void`

- `data`: The data sent from the other window via postMessage.

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

**Signature**: `() => void`

This event fires when the `App` component finishes rendering on the page.
Use it as `onReady` when inlining it on the component.

```xmlui-pg copy display name="Example: ready"
<App onReady="isAppReady = true">
  <variable name="isAppReady" value="{false}"/>
  <Text value="{isAppReady ? 'App is ready' : 'Sadly, App is not ready'}" />
</App>
```

### `willNavigate` [#willnavigate]

This event fires before the app is about to navigate programmatically via `navigate()` or `Actions.navigate()`. The event handler receives the target path and optional query parameters. Returning `false` cancels the navigation; returning `null`, `undefined`, or any other value proceeds with normal navigation. Note: This event does NOT fire for Link clicks or browser back/forward navigation due to React Router limitations (event handlers are async, but router blocking is synchronous).

**Signature**: `(to: string | number, queryParams?: Record<string, any>) => Promise<false | void | null | undefined>`

- `to`: The target path or history delta (e.g., -1 for back) to navigate to.
- `queryParams`: Optional query parameters to include in the navigation.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-content-App | $backgroundColor | $backgroundColor |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-navPanel-App | $backgroundColor | $backgroundColor |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-content-App | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-navPanelWrapper-App | 1px solid $borderColor | 1px solid $borderColor |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-header-App | none | none |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-navPanel-App | none | none |
| [maxWidth](/docs/styles-and-themes/common-units/#size-values)-App | $maxWidth-content | $maxWidth-content |
| [maxWidth-content](/docs/styles-and-themes/common-units/#size-values)-App | $maxWidth-content | $maxWidth-content |
| [maxWidth-content](/docs/styles-and-themes/common-units/#size-values)-App--withToc | *none* | *none* |
| [width](/docs/styles-and-themes/common-units/#size-values)-navPanel-App | $space-64 | $space-64 |
| [width](/docs/styles-and-themes/common-units/#size-values)-navPanel-collapsed-App | 48px | 48px |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`maxWidth-content-App`** | This theme variable defines the maximum width of the main content. If the main content is broader, the engine adds margins to keep the expected maximum size. |
| **`boxShadow‑header‑App`** | This theme variable sets the shadow of the app's header section. |
| **`boxShadow‑navPanel‑App`** | This theme variable sets the shadow of the app's navigation panel section (visible only in vertical layouts). |
| **`width‑navPanel‑App`** | This theme variable sets the width of the navigation panel when the app is displayed with one of the vertical layouts. |
