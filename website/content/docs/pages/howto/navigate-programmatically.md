# Navigate programmatically

Use the global `navigate()` function to change the route from an event handler or script instead of a `Link` click.

Sometimes a navigation must happen in response to logic — after a form submission, an API callback, or a timer — rather than a direct user click on a link. The `navigate()` function is available in every expression context and accepts a URL string plus optional settings like `replace` and `queryParams`.

```xmlui-pg copy display name="Navigate after a button click" height="350px"
---app display
<App scrollWholePage="false">
  <NavPanel>
    <NavLink icon="home" label="Home" to="/" />
    <NavLink icon="users" label="Team" to="/team" />
    <NavLink icon="settings" label="Settings" to="/settings" />
  </NavPanel>
  <Pages>
    <Page url="/">
      <VStack>
        <H3>Home</H3>
        <Text>Current path: {$pathname}</Text>
        <HStack>
          <Button label="Go to Team" onClick="navigate('/team')" />
          <Button
            label="Go to Settings (replace)"
            onClick="navigate('/settings', { replace: true })"
          />
        </HStack>
      </VStack>
    </Page>
    <Page url="/team">
      <VStack>
        <H3>Team</H3>
        <Text>Current path: {$pathname}</Text>
        <Button label="Back to Home" onClick="navigate('/')" />
      </VStack>
    </Page>
    <Page url="/settings">
      <VStack>
        <H3>Settings</H3>
        <Text>Current path: {$pathname}</Text>
        <Button
          label="Open profile tab"
          onClick="navigate('/settings?profile=admin')"
        />
        <Text variant="secondary">Query: {JSON.stringify($queryParams)}</Text>
      </VStack>
    </Page>
  </Pages>
</App>
```

## Key points

**`navigate(url)` is the simplest form**: Pass a string URL like `navigate('/team')` to move the app to that route. The function is globally available — usable in `onClick`, `onSuccess`, `<script>` blocks, and any other expression context.

**`{ replace: true }` replaces the current history entry**: By default, `navigate` pushes a new history entry so the user can press Back. Pass `{ replace: true }` when the navigation should not appear in the browser's back-button history — for example, after a login redirect.

**`{ queryParams: { key: value } }` appends query parameters**: This merges parameters into the URL as a query string (e.g. `/settings?tab=profile`). It is more convenient and reliable than manually concatenating `?key=value` onto the URL string.

**Use `navigate` inside API callbacks for post-action routing**: A common pattern is `onSuccess="navigate('/dashboard')"` on an `APICall` — the user lands on the dashboard only after the server confirms the operation succeeded. Avoid navigating before the response arrives.

**`Link` is still preferred for static navigation**: When the destination is known at render time and requires no conditional logic, use a `<Link to="/team">` or `<NavLink to="/team">` instead. Links are accessible by default (keyboard-focusable, right-click menu, middle-click to open in a new tab), while `navigate()` in a `Button`'s `onClick` loses those affordances.

---

## See also

- [Deep-link to a tab or section](/docs/howto/deep-link-to-a-tab-or-section) — use `navigate()` with `queryParams` to keep the address bar in sync with tab state
- [Implement an authentication gate](/docs/howto/implement-an-authentication-gate) — redirect to the app after a successful login
- [Routing and links](/docs/guides/routing-and-links) — choose the URL format that `navigate()` operates on, and configure server-side fallback for history mode
