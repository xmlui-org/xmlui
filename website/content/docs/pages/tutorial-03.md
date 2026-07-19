# Navigation

Let's explore a subset of the app's navigation. The `App`'s `layout` property can be `vertical`.

```xmlui-pg display {3} name="vertical layout"
<App
  name="XMLUI Invoice"
  layout="vertical"
>
  <AppHeader>
    <H1>XMLUI Invoice</H1>
  </AppHeader>
  <NavPanel>
    <NavLink label="Dashboard" to="/" />
    <NavLink label="Invoices" to="/invoices" />
  </NavPanel>

  <Pages>
    <Page url="/">
      <Dashboard />
    </Page>
    <Page url="/invoices">
      <Invoices />
    </Page>
  </Pages>

  <Footer>Built with XMLUI <ToneSwitch /> </Footer>
</App>

<Component name="Dashboard">
  This is Dashboard.
</Component>

<Component name="Invoices">
  This is Invoices.
</Component>
```

## Horizontal

Or it can be `horizontal`.

```xmlui-pg display {3} name="horizontal layout"
<App
  name="XMLUI Invoice"
  layout="horizontal"
>
  <AppHeader>
    <H1>XMLUI Invoice</H1>
  </AppHeader>
  <NavPanel>
    <NavLink label="Dashboard" to="/" />
    <NavLink label="Invoices" to="/invoices" />
  </NavPanel>

  <Pages>
    <Page url="/">
      <Dashboard />
    </Page>
    <Page url="/invoices">
      <Invoices />
    </Page>
  </Pages>

  <Footer>Built with XMLUI <ToneSwitch /> </Footer>
</App>

<Component name="Dashboard">
  This is Dashboard.
</Component>

<Component name="Invoices">
  This is Invoices.
</Component>
```

## Other layouts

There are a number of other layouts, see [App](/docs/reference/components/App#layout) for details.
