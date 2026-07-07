# Protect navigation with willNavigate

Use `App willNavigate` when a programmatic navigation should be checked before the route changes.

Constraints validate the URL shape. Navigation guards validate the current app state: authentication, roles, feature flags, unsaved changes, or setup completion. Return `false` to cancel a navigation before the target page renders.

```xmlui-pg copy display name="Cancel protected admin navigation with willNavigate" id="cancel-protected-admin-navigation-with-willnavigate" height="360px"
---app display /\$pathname/ /isAdmin/ /lastDecision/
<App
  scrollWholePage="false"
  var.isAdmin="{false}"
  var.lastDecision="not checked"
  onWillNavigate="(to) => {
    if (to === '/admin' && !isAdmin) {
      lastDecision = 'blocked /admin';
      return false;
    }
    lastDecision = 'allowed ' + to;
  }">
  <Pages fallbackPath="/login">
    <Page url="/">
      <VStack gap="$space-3">
        <Text variant="strong">Workspace home</Text>
        <Text>Signed in as admin: {isAdmin ? 'yes' : 'no'}</Text>
        <Text>Guard decision: {lastDecision}</Text>
        <HStack>
          <Button label="Open admin" onClick="navigate('/admin')" />
          <Button
            label="Sign in as admin"
            onClick="isAdmin = true; navigate('/admin')"
          />
        </HStack>
      </VStack>
    </Page>

    <Page url="/admin">
      <VStack gap="$space-2">
        <Text variant="strong">Admin console</Text>
        <Text>The guard allowed this navigation.</Text>
        <Text>Guard decision: {lastDecision}</Text>
        <Button label="Sign out" onClick="isAdmin = false; navigate('/')" />
      </VStack>
    </Page>

    <Page url="/login">
      <VStack gap="$space-2">
        <Text variant="strong">Login required</Text>
        <Text>The admin guard redirected this navigation.</Text>
        <Button label="Back home" onClick="navigate('/')" />
      </VStack>
    </Page>
  </Pages>
</App>
```

## Key points

**Use guards for app state, not URL shape**: Put type and range checks in route or query constraints. Use `willNavigate` when the decision depends on state like the current user.

**Return `false` to cancel navigation**: When the handler returns `false`, XMLUI leaves the current route unchanged.

**Allow by returning nothing**: `undefined`, `null`, and `true` allow the navigation to continue.

**Rejected guards produce diagnostics**: A denied navigation emits a `guard-bypass-attempt` navigation diagnostic so you can audit blocked navigations in Inspector.

---

## See also

- [Constrain route parameters](/docs/howto/constrain-route-parameters) — reject bad URL values before guards run
- [Implement an authentication gate](/docs/howto/implement-an-authentication-gate) — build auth-specific routing flows
- [Defended Routing](/docs/managed-react/defended-routing) — guard return values and diagnostics
