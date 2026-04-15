# Implement an authentication gate

Gate the entire app behind a login screen so unauthenticated users see only a sign-in prompt.

Use a reactive boolean variable (`var.authenticated`) to toggle between a login view and the real application. When the variable is `false`, render a sign-in prompt; when `true`, render the `App` with its `NavPanel` and `Pages`. Because the condition is reactive, flipping the variable immediately swaps the view — no page reload needed.

```xmlui-pg copy display name="Auth gate with conditional App rendering" height="200px"
---app display
<!-- In Main.xmlui -->
<Fragment var.authenticated="{false}">

  <AuthenticatedApp when="{authenticated}" />

  <CVStack when="{!authenticated}" height="160px">
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

## Key points

**`when` controls whether a component is mounted at all**: `when="{authenticated}"` does not just hide the component visually — it removes it from the component tree entirely. This means the authenticated app does not load its `DataSource` calls, `NavPanel`, or any child components until the user has signed in.

**Wrap the whole `App` in a `Fragment`**: A `Fragment` is an invisible container that holds the `when`-conditional views side by side without adding any visual output. It also hosts the shared `var.authenticated` variable that both views can read and write.

**Flip the variable to switch views instantly**: Setting `authenticated = true` inside a button click or API callback removes the login prompt and mounts the `AuthenticatedApp` in the same render cycle — fully reactive with no navigation call.

**Put the real auth call in `onClick` or a `willSubmit` handler**: The demo uses a simple button, but in a real app you would call an `APICall` with the user's credentials and set `authenticated = true` only in `onSuccess`. This keeps the gate closed until the server confirms the identity.

**Use `Redirect` for page-level guards instead of an app-wide gate**: If only certain pages need protection while others remain public, place `<Redirect to="/login" when="{!authenticated}" />` at the top of each protected `Page` to bounce the user to the sign-in route.

---

## See also

- [Navigate programmatically](/docs/howto/navigate-programmatically) — redirect to the original page after successful login
- [Build nested page routes](/docs/howto/build-nested-page-routes) — protect specific nested routes while leaving others public
- [Redirect users after login](/docs/howto/redirect-users-after-login) — send users back to their originally requested page post-auth
