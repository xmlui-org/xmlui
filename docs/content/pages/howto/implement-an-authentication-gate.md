# Implement an authentication gate

```xmlui-pg
---app display
<!-- In Main.xmlui -->
<Fragment var.authenticated="{false}">

  <AuthenticatedApp when="{authenticated}" />

  <CVStack when="{!authenticated}">
      <H1>Authentication Required</H1>
      <Button
        label="Authenticate"
        onClick="authenticated = true"
      />
  </CVStack>

</Fragment>

---comp display
<Component name="AuthenticatedApp">
    <App name="Authenticated App">
        <NavPanel>
            <NavLink icon="home" label="Home" to="/" />
        </NavPanel>
        <Pages>
            <Page url="/">
                <Text>This is only visible when authenticated.</Text>
            </Page>
        </Pages>
    </App>
</Component>
```
