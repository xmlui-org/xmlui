
# The App Component

You can use any component as your app's root. For example, you can display a simple text with this markup:

```xmlui copy
<Text>Hello from XMLUI!</Text>
```

```xmlui-pg name="Example: Text as the root component"
<Text>Hello from XMLUI!</Text>
```


Nonetheless, we suggest you create an app using XMLUI's [App](/components/App) component as the root. With `App`, your application immediately has a boilerplate for its essential UI parts, including headers, navigation, content, and others.

Instead of building the app layout from scratch, you can choose from a set of predefined ones. Moreover, you can change the app layout at run time or in the configuration. `App` provides several ways to scroll the content (according to the selected layout) and a responsiveness according to the available viewport width.

## Layout Placeholders

<Callout type="info" emoji="💡">
The `App` component creates its layout by combining several components into an integrated UI. You can provide these constituent parts (each of them is optional) to let `App` organize them:

- Application header
- Navigation panel
- Navigation-aware main content panel
- Footer
</Callout>

In the markup, `App` has placeholders to define the particular parts of the UI:

```xmlui copy
<App>
  <AppHeader>
    <!-- Here comes the header -->
  </AppHeader>
  <NavPanel>
    <!-- Define the app's navigation menu here -->
  </NavPanel>
  <Pages>
    <!-- Define the navigation-aware content here -->
  </Pages>
  <Footer>
    <!-- This is a placeholder for the footer -->
  </Footer>
  <!-- Any other content to render -->
</App>
```

You can use these placeholder components:

- `AppHeader`: The content of this placeholder describes the app's header template. If the application has a logo, it automatically inserts that into the header.
- `NavPanel`: This section describes a hierarchical structure representing the app's main menu.
- `Pages`: lists the individual UI parts (pages) the application navigates to (according to the selected menu item or programmatically).
- `Footer`: `App` uses the section's contents as the footer.

When all placeholders are empty (like in the previous sample markup), `App` renders an empty header and an empty main content section below the empty header:

<Playground
    name="Example: App with empty layout elements"
    height={150}
    app={`
    <App>
      <AppHeader>
        <!-- Here comes the header -->
      </AppHeader>
      <NavPanel>
        <!-- Define the app's navigation menu here -->
      </NavPanel>
      <Pages>
        <!-- Define the navigation-aware content here -->
      </Pages>
      <Footer>
        <!-- This is a placeholder for the footer -->
      </Footer>
      <!-- Any other content to render -->
    </App>
  `}
/>

You can set the application logo using the `logo` property of `App`:

```xmlui copy
<App logo="resources/logo.svg">
  <!-- ... -->
</App>
```

When the engine finds a logo in the app's manifest, it displays it in its header. So, the previous markup displays this UI after setting the logo resource:

<Playground
    name="Example: App with empty layout elements and logo"
    resources={{ logo: xmluiLogo }}
    height={150}
    app={`
    <App>
      <AppHeader>
        <!-- Here comes the header -->
      </AppHeader>
      <NavPanel>
        <!-- Define the app's navigation menu here -->
      </NavPanel>
      <Pages>
        <!-- Define the navigation-aware content here -->
      </Pages>
      <Footer>
        <!-- This is a placeholder for the footer -->
      </Footer>
      <!-- Any other content to render -->
    </App>
  `}
/>

Each layout placeholder is optional. If you leave any of these placeholders, the app component does not render the particular app section. You can change the order of the placeholder; for example, declare an app footer before the header and change the definition order of these sections.

Also, XMLUI considers any content added within the `App` tag but outside the layout placeholders as part of the main contents.

Look at this example:

```xmlui copy
<App>
  <H1>Welcome to my humble app!</H1>
  <Footer>
    This is my footer
  </Footer>
  <H3>This is a content outside the placeholders</H3>
</App>
```

This markup declares only a footer placeholder. The `<H1>` and `<H3>` components represent the main content. XMLUI renders this app, putting the main content and the footer in their expected place:

<Playground
  name="Example: App with content outside of placeholders"
  height={240}
  app={`
    <App>
      <H1>Welcome to my humble app!</H1>
      <Footer>
        This is my footer
      </Footer>
      <H3>This is a content outside the placeholders</H3>
    </App>
  `}
/>

## Layout Variants [#layout-variants]

<Callout type="info" emoji="💡">
The `App` component can render several layouts determining the location and behavior of app sections.
</Callout>

You can set the layout in several ways:

- You can use the `layout` prop of the `App` component to set it to one of the predefined values.
- You can use the `layout` theme variable to define the layout for a particular theme. This way, you can define layout-aware application themes.

To get acquainted with these layouts, the samples below show different layout settings with this markup (using the `layout` property with the demonstrated variant):

```xmlui copy
<App layout="...">
  <AppHeader title="Example App"/>
  <NavPanel>
    <NavLink label="Home" to="/" icon="home"/>
    <NavLink label="About" to="/about"/>
  </NavPanel>
  <Pages defaultRoute="/">
    <Page url="/">
      <List data="https://api.spacexdata.com/v3/history">
        <Card title="{$item.title}" subtitle="{$item.details}"/>
      </List>
    </Page>
    <Page url="/About">
      <Text value="About this app" />
    </Page>
  </Pages>
  <Footer>Powered by XMLUI</Footer>
</App>
```

Also, the samples set an application logo.


### Horizontal Layout

XMLUI supports several layouts that organize the app's navigation sections (header, menu structure) horizontally in a row. These variants are the following:

- `horizontal`: This layout stacks the layout sections in a single column in this order: header, navigation bar, main content, and footer. The application is a single scroll container; every part moves as you scroll the page.
- `horizontal-sticky`: Similar to `horizontal`, the header and the navigation bar dock to the top of the viewport, while the footer sticks to the bottom. When you scroll vertically, only the main content scrolls; the header and footer stay docked.
- `condensed`: Similar to `horizontal`. However, the header and the navigation bar are in a single header block. If you do not define the layout explicitly, XMLUI defaults this variant.
- `condensed-sticky`: Similar to `horizontal-sticky`. However, the header and the navigation bar are in a single header block.


#### `horizontal`

The navigation panel displays the items horizontally. When you scroll the content, all layout sections scroll with the app.

<Playground
  name="Example: 'horizontal' layout"
  height={350}
  resources={{ logo: xmluiLogo }}
  app={horizontal}
/>

#### `horizontal-sticky`

The navigation panel displays the items horizontally. When you scroll the content, the heading and the navigation panel dock to the top, while the footer sticks to the bottom.

<Playground
  name="Example: 'horizontal-sticky' layout"
  height={350}
  resources={{ logo: xmluiLogo }}
  app={horizontalSticky}
/>

#### `condensed`

The app header is merged with the navigation panel, which displays the items horizontally. When you scroll the content, all layout sections scroll with the app.

<Playground
  name="Example: 'condensed' layout"
  height={350}
  resources={{ logo: xmluiLogo }}
  app={condensed}
/>

#### `condensed-sticky`

The app header is merged with the navigation panel, which displays the items horizontally. When you scroll the content, the heading and the navigation panel dock to the top, while the footer sticks to the bottom.

<Playground
  name="Example: 'condensed-sticky' layout"
  height={350}
  resources={{ logo: xmluiLogo }}
  app={condensedSticky}
/>

### Vertical Layout

XMLUI supports several layouts that display the app's navigation sections (header, menu structure) vertically in a column to the left of the main content area. These variants are the following:

- `vertical`: The main content is aligned to the right (including the header and the footer), and its content is a single scroll container; every part of it moves as you scroll the page. This layout does not display the logo in the app header.
- `vertical-sticky`: Similar to `vertical`, the header and the navigation bar dock to the top of the main content's viewport, while the footer sticks to the bottom. This layout does not display the logo in the app header.
- `vertical-full-header`: Similar to `vertical-sticky`. However, the header and the navigation bar dock to the top of the app's window, while the footer sticks to the bottom.

When the navigation panel is collapsed, the app title is displayed to the right of the navigation menu icon. The following image shows the collapsed navigation panel:

<br/>
<Image alt="Test API" src="/resources/images/create-apps/collapsed-vertical.png" />

The following vertical layout examples use the same markup as the horizontal ones.

#### `vertical`

Here, the app logo and the menu are docked to the left. On the right, the header, the main content, and the footer scroll with the app. Observe the empty app header! Now, the logo is moved to above the navigation panel.

<Playground
  name="Example: 'vertical' layout"
  height={350}
  resources={{ logo: xmluiLogo }}
  app={vertical}
/>

#### `vertical-sticky`

This layout is similar to the previous (`horizontal`) one. However, the app header sticks to the top of the main content (to the right), while the footer docks to the bottom.

<Playground
  name="Example: 'vertical-sticky' layout"
  height={350}
  resources={{ logo: xmluiLogo }}
  app={verticalSticky}
/>

#### `vertical-full-header`

This layout docks the app header to the top and the footer to the bottom. The navigation panel and the main content share the remaining area. When you scroll, only the main content moves; the other sections stick to the app's window.

<Playground
  name="Example: 'vertical-full-header' layout"
  height={350}
  resources={{ logo: xmluiLogo }}
  app={verticalFullHeader}
/>

## AppHeader

The `AppHeader` placeholder declares the UI patch to display in the app's header. If the app defines a logo, the `App` component displays that logo in the header (to the left) and the content within the `AppHeader`. Be aware that the header's appearance depends on the app's layout.

### No AppHeader

When the `App` does not contain an `AppHeader` placeholder, the app does not display a header in any layout mode:

```xmlui copy
<App layout="horizontal">
  <H1>Main Content</H1>
  <Footer>
    This is my app footer.
  </Footer>
</App>
```

<Playground
  name="Example: No AppHeader"
  height={200}
  app={`
    <App layout="horizontal">
      <H1>Main Content</H1>
      <Footer>
        This is my app footer.
      </Footer>
    </App>
  `}
/>

### Empty AppHeader

If the `App` contains an `AppHeader` empty placeholder, it displays an empty header unless you define a logo. The following example does not define a logo, so the header remains empty:

```xmlui copy {2}
<App layout="condensed">
  <AppHeader/>
  <H1>Main Content</H1>
  <Footer>
    This is my app footer.
  </Footer>
</App>
```

<Playground
  name="Example: Empty AppHeader"
  height={200}
  app={`
    <App layout="condensed">
      <AppHeader/>
      <H1>Main Content</H1>
      <Footer>
        This is my app footer.
      </Footer>
    </App>
  `}
/>

### Empty AppHeader with Logo

If the `App` contains an empty `AppHeader` placeholder but defines a logo, the header displays the logo. The following example uses the same app markup as the previous one; however, it defines a logo in the `App` component's `logo` property:

```xmlui copy
<App layout="condensed" logo="resources/logo.svg">
  <AppHeader/>
  <H1>Main Content</H1>
  <Footer>
    This is my app footer.
  </Footer>
</App>
```

<Playground
  name="Example: Empty AppHeader"
  height={200}
  resources={{ logo: xmluiLogo }}
  app={`
    <App layout="condensed">
      <AppHeader/>
      <H1>Main Content</H1>
      <Footer>
        This is my app footer.
      </Footer>
    </App>
  `}
/>

### Explicit AppHeader

When the `AppHeader` section contains a definition, the `App` component displays that in the header:

```xmlui copy
<App layout="condensed">
  <AppHeader>
    <H1>AcmeApp</H1>
    <SpaceFiller />
    <Icon name="palette" />
  </AppHeader>
  <H1>Main Content</H1>
  <Footer>
    This is my app footer.
  </Footer>
</App>
```

<Playground
  name="Example: Explicit AppHeader"
  height={200}
  app={`
    <App layout="condensed">
      <AppHeader>
        <H1>AcmeApp</H1>
        <SpaceFiller />
        <Icon name="palette" />
      </AppHeader>
      <H1>Main Content</H1>
      <Footer>
        This is my app footer.
      </Footer>
    </App>
  `}
/>

## Logo

You can display a logo in the app's header. There are several ways to define the logo; you will learn about them here.

### Using the App Component Properties

The `App` Component has these properties to define a logo resource:
- `logo`: the URI of the logo relative to the app's root folder
- `logo-dark`: the URI of the logo to be used when the current theme uses a dark tone. This property overrides - `logo` when the dark tone is active.
- `logo-light`: the URI of the logo to be used with a light tone. This property overrides `logo` when the dark tone is active.

```xmlui copy {3-4}
<App
  layout="condensed"
  logo="resources/logo.svg"
  logo-dark="resources/logo-dark.svg">
  <AppHeader/>
  <H1>App with a logo</H1>
</App>
```

This app uses a light tone:

<Playground
  name="Example: Logo specified in the App component (light tone)"
  height={150}
  resources={{ logo: xmluiLogo }}
  app={`
    <App layout="condensed">
      <AppHeader/>
      <H1>App with a logo</H1>
    </App>
  `}
/>

The logo is different when a dark tone is used:

<Playground
  name="Example: Logo specified in the App component (dark tone)"
  height={150}
  resources={{ logo: xmluiLogoDark }}
  app={`
    <Theme tone="dark">
      <App layout="condensed">
        <AppHeader/>
        <H1>App with a logo</H1>
      </App>
    </Theme>
  `}
/>

### Configuring Logos

<Callout type="info" emoji="💡">
You can set app logos through the `config.json` file in the app's root folder too.
</Callout>

Instead of using the `App` components `logo`, `logo-dark`, and `logo-light` properties, you can set these resource URIs in the app's optional configuration file.

The following entries in `config.json` display the same logo as the examples in the previous section.

```json
{
  "resources": {
    "logo": "resources/logo.svg",
    "logo-dark": "resources/logo-dark.svg",
    "logo-light": "resources/logo-light.svg"
  }
}
```

### Hiding the Logo

<Callout type="info" emoji="💡">
Though your app contains a logo definition, you can prevent it from displaying it with the header by setting the `AppHeader` placeholder's `showLogo` property to `false`.
</Callout>

```xmlui copy /showLogo="false"/
<App
  layout="condensed"
  logo="resources/logo.svg"
  logo-dark="resources/logo-dark.svg">
  <AppHeader showLogo="false"/>
  <H1>App with a hidden logo</H1>
</App>
```

<Playground
  name="Example: Hiding the Logo"
  height={200}
  resources={{ logo: xmluiLogo }}
  app={`
    <App>
      <AppHeader showLogo="false"/>
      <H1>App with a hidden logo</H1>
    </App>
  `}
/>

### Using the Logo in Placeholders

<Callout type="info" emoji="💡">
You can show the app's logo not only in the header but in other parts of the app using the `Logo` component.
</Callout>

The following example turns off the logo in the header and displays it in the main content:

```xmlui {11} copy
<App
  layout="condensed"
  logo="resources/logo.svg"
  logo-dark="resources/logo-dark.svg">
  <AppHeader showLogo="false">
    <H1>AcmeApp</H1>
    <SpaceFiller />
    <Icon name="palette" />
  </AppHeader>
  <H1>Main Content</H1>
  <Logo height="60px" />
  <Footer>
    This is my app footer.
  </Footer>
</App>
```

<Playground
  name="Example: Using logo in placeholders"
  height={280}
  resources={{ logo: xmluiLogo }}
  app={`
    <App layout="condensed">
      <AppHeader showLogo="false">
        <H1>AcmeApp</H1>
        <SpaceFiller />
        <Icon name="palette" />
      </AppHeader>
      <H1>Main Content</H1>
      <Logo height="60px" />
      <Footer>
        This is my app footer.
      </Footer>
    </App>
  `}
/>


### Declaring a Custom Logo

<Callout type="info" emoji="💡">
The `AppHeader` component placeholder has a property, `logoTemplate`, which you can use to define your custom logo.
</Callout>

```xmlui {3-8} copy
<App>
  <AppHeader>
    <property name="logoTemplate">
      <HStack>
        <Stack width="24px" height="16px" backgroundColor="purple" />
        <Stack width="24px" height="16px" backgroundColor="green" />
      </HStack>
    </property>
    <H2>AcmeApp</H2>
  </AppHeader>
  <H1>Main Content</H1>
  <Footer>
    This is my app footer.
  </Footer>
</App>
```

<Playground
  name="Example: Custom Logo"
  height={200}
  resources={{ logo: xmluiLogo }}
  app={`
    <App>
      <AppHeader>
        <property name="logoTemplate">
          <HStack>
            <Stack width="24px" height="16px" backgroundColor="purple" />
            <Stack width="24px" height="16px" backgroundColor="green" />
          </HStack>
        </property>
        <H2>AcmeApp</H2>
      </AppHeader>
      <H1>Main Content</H1>
      <Footer>
        This is my app footer.
      </Footer>
    </App>
  `}
/>

## Navigation

<Callout type="info" emoji="💡">
The `App` component has two placeholders that help you create the app's navigation structure. The `NavPanel` lets you define the available navigation links (menu commands); `Pages` lists the UI elements that represent a particular navigation target.
</Callout>

The links and the targets are bound through URLs. When the user selects a navigation link (menu command), XMLUI ensures that the matching UI part is displayed as the main content.

```xmlui copy
<App layout="horizontal-sticky">
  <AppHeader><H1>MyTravel App</H1></AppHeader>
  <NavPanel>
    <NavLink label="Home" to="/" />
    <NavLink label="Flights" to="/flights" />
    <NavLink label="Hotels" to="/hotels" />
    <NavLink label="Car Rentals" to="/cars/123" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
    <Page url="/flights">Flights Page</Page>
    <Page url="/hotels">Hotels Page</Page>
    <Page url="/cars/:id">Car Rentals Page {$routeParams.id}</Page>
  </Pages>
</App>
```

<Playground
  name="Example: Navigation"
  height={250}
  app={`
    <App layout="horizontal-sticky">
      <AppHeader><H1>MyTravel App</H1></AppHeader>
      <NavPanel>
        <NavLink label="Home" to="/" />
        <NavLink label="Flights" to="/flights" />
        <NavLink label="Hotels" to="/hotels" />
        <NavLink label="Car Rentals" to="/cars/123" />
      </NavPanel>
      <Pages>
        <Page url="/">Home</Page>
        <Page url="/flights">Flights Page</Page>
        <Page url="/hotels">Hotels Page</Page>
        <Page url="/cars/:id">Car Rentals Page {$routeParams.id}</Page>
      </Pages>
    </App>
  `}
/>

<Callout type="info" emoji="📔">
You can learn more about navigation in the <SmartLink href={ROUTING}>Routing</SmartLink> article.
</Callout>

## Footer

<Callout type="info" emoji="💡">
With the `<Footer>` placeholder, you can define the markup part that should be displayed as an application footer.
</Callout>

Here is an example:

```xmlui {5-9} copy
<App>
  <AppHeader>
    <H3>AcmeDrive</H3>
  </AppHeader>
  <H1>Main Content</H1>
  <Footer>
    Powered by XMLUI
    <SpaceFiller />
    <Icon name="drive" />
  </Footer>
</App>
```

<Playground
  name="Example: Footer"
  height={200}
  app={`
    <App>
      <AppHeader>
        <H3>AcmeDrive</H3>
      </AppHeader>
      <H1>Main Content</H1>
      <Footer>
        Powered by XMLUI
        <SpaceFiller />
        <Icon name="drive" />
      </Footer>
    </App>
  `}
/>

