# Switch between hash and history routing

Choose between `/#/path` hash-based URLs and clean `/path` URLs by setting a single config flag.

XMLUI defaults to hash-based routing in standalone mode, which works on any static file server because the hash portion of the URL is never sent to the server. For production apps that want clean URLs (no `#`), set `useHashBasedRouting` to `false` in `config.json` — but the web server must be configured to return `index.html` for all paths so the client-side router can handle them.

```xmlui-pg copy display name="Hash vs history routing" height="350px"
---app display
<!--
  config.json:
  {
    "appGlobals": {
      "useHashBasedRouting": false
    }
  }
-->
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
        <Text variant="secondary">
          With hash routing the URL would be /#/ — 
          with history routing it is just /
        </Text>
      </VStack>
    </Page>
    <Page url="/team">
      <VStack>
        <H3>Team</H3>
        <Text>Current path: {$pathname}</Text>
      </VStack>
    </Page>
    <Page url="/settings">
      <VStack>
        <H3>Settings</H3>
        <Text>Current path: {$pathname}</Text>
      </VStack>
    </Page>
  </Pages>
</App>
```

## Key points

**`useHashBasedRouting: true` (the default in standalone mode) uses `HashRouter`**: All XMLUI routes are placed after the `#` in the URL (e.g. `https://example.com/#/team`). The hash portion is never sent to the server, so any static file host (S3, GitHub Pages, Netlify drop) works without configuration.

**`useHashBasedRouting: false` switches to `BrowserRouter` with clean URLs**: Routes use the real pathname (e.g. `https://example.com/team`). This produces nicer URLs but requires the web server to serve `index.html` for all routes — otherwise a browser refresh on `/team` returns a 404.

**Set the flag in `config.json` under `appGlobals`**: Add `"useHashBasedRouting": false` inside the `appGlobals` object. The setting applies globally — individual pages cannot mix routing modes.

**Server-side fallback is required for history mode**: Configure your web server to return `index.html` for every path that is not a static asset. For Apache, add a `.htaccess` rewrite rule; for Nginx, use `try_files $uri /index.html`; for Azure Static Web Apps, add a `navigationFallback` in `staticwebapp.config.json`.

**Vite-mode apps use history routing by default**: In a Vite-built XMLUI project the dev server already handles SPA fallback, so `useHashBasedRouting: false` works immediately during development. Only the production deployment needs the server-side rewrite.

---

## See also

- [Build nested page routes](/docs/howto/build-nested-page-routes) — structure multi-level URLs that work with either routing mode
- [Navigate programmatically](/docs/howto/navigate-programmatically) — use `navigate()` to move between routes in code
- [Add breadcrumb navigation](/docs/howto/add-breadcrumb-navigation) — build a breadcrumb bar from `$pathname` segments
