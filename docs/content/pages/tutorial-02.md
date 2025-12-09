# Main.xmlui

At the root of every XMLUI app is `Main.xmlui` which declares the [App](/components/App) that defines layout and navigation.

## App

```xmlui
<App
  name="XMLUI Invoice"
  layout="vertical-full-header"
  defaultTheme="invoice"
  loggedInUser="{currentUser.value}"
>
```

`vertical-full-header` means the header and the navigation bar dock to the top of the app's window, while the footer sticks to the bottom. There are a half-dozen other flavors, see the [App](/components/App) page for the full story.

### Optional default theme

The `defaultTheme` points to a file called `invoice.json`.

```json
{
  "name": "Invoice",
  "id": "invoice",
  "themeVars": {

    "color-primary": "hsl(205, 76%, 58%)",
    "color-secondary": "hsl(210, 30%, 60%)",
    "color-surface": "hsl(0, 0%, 96%)",

    "gap-adornment-Input": "2px",
    "borderRadius-Avatar": "50%"
  }
}
```

It's concise but very powerful. The choices for `color-primary`, `color-secondary`,  and `color-surface` define a set of coordinated [palettes](/palettes) that form the core of a [Theme](/themes-intro).

Then there's a small handful of theme variables. `gap-adornment-Input` adjusts the space between a dollar sign and its value. `borderRadius-Avatar` does what it says on the tin.

These things are optional. XMLUI's mission is to ensure what you build looks good with little if any explicit styling.

## AppState

```xmlui
  <AppState
    id="settings"
    bucket="settingsState"
  />
```

[AppState](/components/AppState) is a blackboard where components can post and read data. In our demo it defines a data structure for the app settings.

## AppHeader

```xmlui
<AppHeader>
  <H1>XMLUI Invoice</H1>
  <property name="profileMenuTemplate">
    <HStack
      verticalAlignment="center"
      onClick="Actions.navigate('/settings')"
    >
      <Avatar url="{loggedInUser.avatar_url}" name="{loggedInUser.display_name}" />
      <Text>{loggedInUser.display_name}</Text>
    </HStack>
  </property>
</AppHeader>
```

Our demo uses `profileMenuTemplate`, one of the templates [AppHeader](/components/AppHeader) provides so you can compose what goes into common header slots.

## NavPanel

```xmlui

  <NavPanel>
    <NavLink label="Dashboard" to="/" />
    <NavLink label="Invoices" to="/invoices" />
    <NavLink label="Clients" to="/clients" />
    <NavLink label="Products" to="/products" />
    <NavLink label="Search" to="/search" />
    <NavLink label="Import" to="/importProducts" />
    <NavLink label="Settings" to="/settings" />
  </NavPanel>
```

The [NavPanel](/components/NavPanel) defines [NavLink](/components/NavLink)s which are routes, or local URLs, navigable within and from outside the app.

## Pages

```xmlui
  <Pages>
    <Page url="/">
      <Dashboard />
    </Page>

    <Page url="/invoices">
      <Invoices />
    </Page>

    <Page url="/invoices/new">
      <CreateInvoice />
    </Page>

    <Page url="/clients">
      <Clients />
    </Page>

    <Page url="/clients/new">
      <CreateClient />
    </Page>

    <Page url="/products">
      <Products />
    </Page>

    <Page url="/search">
      <Search />
    </Page>

    <Page url="/search/invoices-after">
      <SearchInvoicesAfter />
    </Page>

    <Page url="/search/everything">
      <SearchEverything />
    </Page>

    <Page url="/importProducts">
      <ImportProducts />
    </Page>

    <Page url="/settings">
      <Settings />
    </Page>

    <Page url="/users/new">
      <CreateUser />
    </Page>
  </Pages>
```

Each [Page](/components/Pages) is a container that binds to a route and holds XMLUI markup. Although you can put anything in there, our demo shows what we think is a best practice: use [Components](/components-intro) to encapsulate your business logic.

## Footer

```xmlui-pg display name="Try clicking the ToneSwitch"
<App>
  <Footer>
    Built with XMLUI
    <SpaceFiller />
    <ToneSwitch />
  </Footer>
</App>
```

Our `Main.xmlui` concludes with a [Footer](/components/Footer) that embeds a [ToneSwitch](/components/ToneSwitch).


