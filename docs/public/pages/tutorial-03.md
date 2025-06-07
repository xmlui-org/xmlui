# Navigation

```xmlui-pg
---app copy display
<App
  name="XMLUI Invoice"
  layout="vertical-full-header"
>
  <AppHeader>
    <property name="titleTemplate">
      <H1>
        XMLUI Invoice
      </H1>
    </property>
  </AppHeader>
  <NavPanel>
    <NavLink label="Dashboard" to="/" />
    <NavLink label="Invoices" to="/invoices" />
  </NavPanel>

  <Pages>
    <Page url="/">
      <Dashboard01 />
    </Page>
  </Pages>

</App>
---comp
<Component name="Dashboard01">
  This is Dashboard01
</Component>
```
