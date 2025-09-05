# Structure of an XMLUI app

The [XMLUI Invoice demo app](https://github.com/xmlui-org/xmlui-invoice/releases) exhibits the typical structure of an XMLUI app.

```xmlui-tree
<root>
  index.html
  Main.xmlui
  config.json
  components
    ClientDetails.xmlui
    Clients.xmlui
    ...
    MonthlyRevenue.xmlui
    WeeklyRevenue.xmlui
  resources
    favicon.ico
    xmlui-logo-inverted.svg
    xmlui-logo.svg
  themes
    invoice.json
  xmlui
    0.9.23.js
    charts-0.1.21.js
  start.bat
  start.sh
  api.json
  data.db
  xmlui-test-server
```

> [!INFO] The `xmlui` folder contains the xmlui engine with a version number, specifically `0.9.23.js`. We recommend this practice in order to know when/whether to upgrade.


| file| description |
|---|---|
| **`index.html`** | The default webpage to display |
| **`Main.xmlui`** | The XMLUI app's entry point |
| **`config.json`** | The XMLUI app's configuration file |
| **`components`** | The folder with your custom components |
| **`resources`** | The folder with static app resources |
| **`themes`** | The folder with your custom themes |
| **`xmlui`** | The folder with the XMLUI core framework and extensions  |
| **`start.bat`** | The batch file to start the test server on Windows |
| **`start.sh`** | The bash script file to start the test server on Mac, Linux, or WSL |
| **`api.json`** | *Optional*: API description file for use with xmlui-test-server |
| **`data.db`** | *Optional*: SQLite database for use with xmlui-test-server|
| **`xmlui-test-server`** | *Optional*: server, you can use any static web server|


You can deploy this tree structure (minus the optional `api.json`, `data.db`, and `xmlui-test-server`) to any static webserver that's configured to serve `index.html`. Consider this minimal app.

```xmlui-tree
xmlui-minimal
  index.html
  Main.xmlui
  components
    Home.xmlui
  resources
    favicon.ico
    xmlui-logo-inverted.svg
    xmlui-logo.svg
  xmlui
    0.9.23.js
```

## index.html

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="xmlui/0.9.23.js"></script>
</head>

<body>
</body>

</html>
```

## Main.xmlui

```xmlui
<App name="XMLUI Minimal">

  <NavPanel>
    <NavLink label="Home" to="/Home" />
  </NavPanel>

  <Pages>
    <Page url="/Home">
      <Home />
    </Page>
  </Pages>

</App>
```

## Home.xmlui

```xmlui
<Component name="Home" >

A minimal XMLUI app

</Component>
```

## Local deployment

If you are working locally, in a folder at the root of this tree, here are some ways you can serve the app.

If you have node.js and npm:

```
npx -y http-server

$ npx -y http-server
Starting up http-server, serving ./

Available on:
  http://127.0.0.1:8080
```

If you have python:

```
$ python -m http.server 8080
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

In either case, visit http://localhost:8080 to view the app.

See also [Hosted deployment](/hosted-deployment).

