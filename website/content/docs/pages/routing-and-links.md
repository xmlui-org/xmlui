# Routing and Links

XMLUI implements client-side routing with URLs bound to UI views. You can use two different  routing mechanisms: **hash** and **standard**. Both store the current location in the browser's address bar and work with the browser's history stack. However, they differ in the URLs they send to the backend server.

## Hash routing (default)

If you don't have complete control over the server, you may not be able to configure it to retrieve the `index.html` file as a single-page app requires. Hash routing solves this issue. If your app is hosted at the `myComp.com/accountapp` URL (this URL serves the default `index.html` file from the server), navigation URLs will look like `myComp.com/accountapp/#/leads/12` or `myComp.com/accountapp/#/list?zip=98005`. Even multiple hash marks may show up (for example, if you navigate to a bookmark: `myComp.com/accountapp/#/leads/12#callhistory`.

The server receives only the part of the URL (`myComp.com/accountapp`) that precedes the hash mark. The client-side routing mechanism uses the remainder to navigate within the app.

You can turn off hash routing and switch to standard routing using the app's `config.json` file.

```json
{
  "name": "MyHashRoutedApp",
  "appGlobals": {
    "useHashBasedRouting": false
  }
};
```

## Standard routing (optional)

When you navigate to an URL (e.g., refresh the current page), the browser sends the entire path to the web server. XMLUI apps are single-page web apps, and your web server should be configured accordingly.

For example, if your app is hosted at the `myComp.com/accountapp` URL (this URL serves the default `index.html` file from the server), it should be configured to retrieve the same `index.html` file even if the browser-sent URL contains path or query segments, such as `myComp.com/accountapp/leads/12` or `myComp.com/accountapp/list?zip=98005`

If your web server is not configured this way, you'll receive 404 errors for the latest two (and similar) requests when refreshing the current page. Here's a sample `nginx` configuration.

``` copy {10}
events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    sendfile      on;

    server {
        root /path/to/your/project;

        index index.html index.htm;

        location ~ \.(js|css|png|jpg|jpeg|gif|ico|json|woff|woff2|ttf|eot|svg|xs|xmlui)$ {
            add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
            expires off;
            try_files $uri =404;
        }

        location / {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        expires off;
            try_files $uri $uri/ /index.html;
        }
    }
}
```


## Serving from a subdirectory with proxy

If you need to serve your XMLUI app from a subdirectory path (e.g., `/myapp/`) while proxying to a running XMLUI server, you can use this nginx configuration. This approach works with both hash-based and standard routing.

### Nginx configuration

```nginx
server {
    listen 80;
    server_name example.com;

    location /myapp/ {
        rewrite ^/myapp(/.*)$ $1 break;
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_intercept_errors on;
        error_page 404 = /myapp/;
    }
}
```

### Base path configuration

You'll need to configure the base path in your `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script>
        window.__PUBLIC_PATH = '/myapp'
    </script>
    <script src="xmlui/0.9.23.js"></script>
</head>
<body>
</body>
</html>
```

### How it works

This configuration:
- Rewrites incoming `/myapp/...` requests to remove the prefix before proxying
- Proxies requests to your XMLUI server running on port 8080
- Redirects 404 errors back to `/myapp/` to enable SPA fallback behavior
- Works with both routing modes: Hash-based routing rarely triggers 404s, while standard routing uses the 404 redirect for client-side navigation

### Routing mode compatibility

This subdirectory deployment works with both routing configurations:

**Hash-based routing** (`useHashBasedRouting: true` - default):
- URLs: `example.com/myapp/#/contacts`
- Server sees: `example.com/myapp/`
- Behavior: Serves app normally from base path

**Standard routing** (`useHashBasedRouting: false` in config.json):
- URLs: `example.com/myapp/contacts`
- Server sees: `example.com/myapp/contacts`
- Behavior: 404s redirect to `/myapp/` which loads the app, then client-side routing takes over

## Links

XMLUI uses the specified links as absolute links (starting with a slash) or relative links, as the following example shows:

```xmlui-pg display
<App layout="vertical">
  <NavPanel>
    <NavLink to="/">Home</NavLink>
    <NavLink to="/contacts">Contacts</NavLink>
    <NavLink to="about">About</NavLink>
  </NavPanel>
  <Pages>
    <Page url="/">
      Home
    </Page>
    <Page url="contacts">
      Contacts
    </Page>
    <Page url="about">
      About
    </Page>
  </Pages>
</App>
```

Here, `/` and `/contacts` are absolute links within the app, `about` is a relative link. As the `NavPanel` hierarchy is at the root level within the app, `/contacts` and `contacts` is the same URL.

## Dynamic route segments

You can use parameter placeholders in the URLs as part of the route. These placeholders start with a colon and are followed by a [valid identifier](/docs/glossary#variable). In the target, you can query the value of these placeholders through the `$routeParams` context variable.

```xmlui-pg display copy
<App layout="vertical">
  <NavPanel>
    <NavLink to="/">Home</NavLink>
    <NavLink to="/account/Cameron">Cameron</NavLink>
    <NavLink to="/account/Joe">Joe</NavLink>
    <NavLink to="/account/Kathy">Kathy</NavLink>
  </NavPanel>
  <Pages>
    <Page url="/">
      Home
    </Page>
    <Page url="/account/:id">
      Account: {$routeParams.id}
    </Page>
  </Pages>
</App>
```


## Using query parameters

 You can also use query parameters in routes. The third link uses two query parameters, "from" and "to". The target page uses the `$queryParams` context variable to access them.

```xmlui-pg display copy /from=December&to=February/ /{$queryParams.from}-{$queryParams.to}/ name="try clicking Winter Report"
<App layout="vertical">
  <NavPanel>
    <NavLink to="/">Home</NavLink>
    <NavLink to="/contacts">Contacts</NavLink>
    <NavLink to="/report?from=December&to=February">Winter Report</NavLink>
  </NavPanel>
  <Pages>
    <Page url="/">
      Home
    </Page>
    <Page url="contacts">
      Contacts
    </Page>
    <Page url="/report">
      Reported period: {$queryParams.from}-{$queryParams.to}
    </Page>
  </Pages>
</App>
```


## Active links

When the app visits a particular target in its available routes, the `NavLink` component matching with the visited route is marked as active, and it gets a visual indication (a blueish left border), like in this example:

```xmlui-pg copy display name="Active links"
<App layout="vertical">
  <NavPanel>
    <NavLink to="/">Home</NavLink>
    <NavLink to="/about">About</NavLink>
  </NavPanel>
  <Pages>
    <Page url="/">
      Home
    </Page>
    <Page url="/about">
      About this app
    </Page>
  </Pages>
</App>
```

When you start the app, the route is "/" (by default) and matches the Home page's route specification. Thus, Home is marked as the active link. When you click About, the route changes to "/about," so the active link becomes About (its route specification matches the current route):


As a `NavLink` activity is based on matching, multiple active links may exist simultaneously. The following example demonstrates such a situation:

```xmlui-pg copy display {4-5}
<App display layout="vertical">
  <NavPanel>
    <NavLink to="/">Home</NavLink>
    <NavLink to="/report?from=December&to=February">Winter Report</NavLink>
    <NavLink to="/report?from=June&to=August">Summer Report</NavLink>
  </NavPanel>
  <Pages>
    <Page url="/">
      Home
    </Page>
    <Page url="/report">
      Reported period: {$queryParams.from}-{$queryParams.to}
    </Page>
  </Pages>
</App>
```

Query parameters are not considered to be part of the route. So, in this sample, the Winter report and Summer report match the same route, "/report." If you select any of them, both links are marked active:

The semantic meaning of routes is analogous to routes used at the backend. When you send two requests with the same routes but different query parameters, they will reach the same backend endpoint. Of course, that endpoint may consider the query parameters, process them, and respond differently. However, this differentiation is not in the routing but in the processing mechanism.

