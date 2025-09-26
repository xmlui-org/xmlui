# Navigation

Let's explore a subset of the app's navigation.

```xmlui-pg name="vertical layout"
---app display {3}
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
---comp display
<Component name="Dashboard">
  This is Dashboard.
</Component>
---comp display
<Component name="Invoices">
  This is Invoices.
</Component>
```

## Horizontal

We've seen `vertical`, here's `horizontal`.

```xmlui-pg name="horizontal layout"
---app display {3}
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
---comp
<Component name="Dashboard">
  This is Dashboard.
</Component>
---comp
<Component name="Invoices">
  This is Invoices.
</Component>
```
