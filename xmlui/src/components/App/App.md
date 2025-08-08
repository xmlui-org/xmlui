%-DESC-START

**Essential features:**

- **Layout templates**: Choose from 7 predefined layouts (horizontal, vertical, condensed, etc.) with sticky navigation options
- **Routing**: Built-in page routing via the [Pages](/components/Pages) component

%-DESC-END

%-PROP-START layout

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

#### `horizontal`

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

#### `horizontal-sticky`

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

#### `condensed`

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

#### `condensed-sticky`

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

#### `vertical`

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

#### `vertical-sticky`

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

#### `vertical-full-header`

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

%-PROP-END

%-PROP-START scrollWholePage

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

%-PROP-END

%-PROP-START loggedInUser

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

%-PROP-END

%-EVENT-START ready

This event fires when the `App` component finishes rendering on the page.
Use it as `onReady` when inlining it on the component.

```xmlui-pg copy display name="Example: ready"
<App onReady="isAppReady = true">
  <variable name="isAppReady" value="{false}"/>
  <Text value="{isAppReady ? 'App is ready' : 'Sadly, App is not ready'}" />
</App>
```

%-EVENT-END

%-EVENT-START messageReceived

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

%-EVENT-END