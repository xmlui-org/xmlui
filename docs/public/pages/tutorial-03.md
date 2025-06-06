# Navigation

```xmlui-pg display
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

  <Page url="/">
    <Dashboard01 />
  </Page>

  </App>
  ```
