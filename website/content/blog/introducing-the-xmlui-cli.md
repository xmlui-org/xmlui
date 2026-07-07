---
title: "Introducing the XMLUI CLI"
slug: "introducing-the-xmlui-cli"
description: "Your all-in-one tool for working with XMLUI."
author: "Jon Udell"
date: "2025-12-19"
image: "cli-blog-header.svg"
tags: ["cli"]
---

To try XMLUI frictionlessly you can run and modify demo apps online: [xmlui-hello-world](https://playground.xmlui.org/#/playground/#H4sIAAAAAAAAE2VTzU7cMBB%2BFXeExCVLFqm9RNmtKK2gB1SpIHqoOZh4SKx1ZizHyQZWeffKScgWuHnG359n5AM0QZFWlgkhO4ByDjLIL5zbSpKUX98GVey2koTI77AP2yuPGAR26J%2BZME%2FH5nh9jdaySLeS8nShLRKiQx9MoeyFNSXVSGEjoUAK6CV80G%2B4xnfy8fSNe2H0RoJD3zBJEHujQ7WRcL72WEsQhkwwyt4r2%2BJGwg%2FbmUZC%2Bn%2FCibuRcJhOZ10EDxPqbfR0mgMkUHDtmJBCA9lfyC9fS0Gqjkaj9PiQfI48mR3EifPsmrPZyyKVoRJf37ZFJk7%2FsLf6VAyfou%2BskaeLUYzxEHPQkynjpkKFNcY0BzAaMuhr2xpIwGPDrS%2Fi1WFIJti98rGEJ6awaswLQgbnX1wPCTxyf1spzfvVT3JtgAxOjq2mhijBNKqBNWUVFu9X0UdV7ErPLelLtuxXN6yV%2FW6U5RIy2FcmYPR5hyoqLHaoV7%2BVNnzluXW%2FXDBMMUAxIpw3tfLPq8%2FrNQxDAlr53QfzCYresz8ytaIS%2FUwchofI5lF9moLpUd9FFcielG0wgWavnEO91M5jZ3B%2Fw%2FqIYW%2BQgppDVuzNC1NQFhJQRTAdzpLLJubu%2BLPm2Y0LDEhxzvGrDcM%2FWRGtOYEDAAA%3D), [xmlui-weather](https://playground.xmlui.org/#/playground/#H4sIAAAAAAAAE61Y227bOBD9lSmRjVvUl6RogYVrpUidpl2g2S3qbvNQBwUjTixuJFIgKTupoX%2FqN%2FTLFqRulOLE8WLzFJFnbmeGnKHXRBsqGI2lQDJeE5qmZEwmx2k6FwBLqoYhN7fBnMyoMBQ%2BS037MD2ek2pbI1VhNH0YhEpJdYZa0wUGc9JsGEzSvwU3wZycNqtcn3DlFK6vaKwxb7ZCKRg3XAq7CSukJkJ1Qg0dLmmc4TDMlEJhvte4bwcX4MkLpAq1%2BU4V0ntU%2BJCONNVGSSGT23tEy5VvBxcNtFRxNBdWy8SiZzJTIdpPAM6COfE0FcYAMhUHcxIZk%2BrxaLQyRg25GK0buvM3V1Il1AT%2FHFYyjuY%2FpeFXPKQ2%2BC7lAFK8s6BgTp469DMIjmANfoIggN5UZjEDIQ1cccGqSIFRQ%2BFKKujBc2hcgefQG8KnGKlGCCMMr8FECLZyQNAEh73XUOYUAnApfW05gVHFyvTrzNDwuvwEmHw4PCr%2BAzgvjZ9QHV1KqlgJGTlMhXfysERleEjj45gvRILCFlaIwqByGSgUTr7gjXkrb6rvMgnW3T9EmpmKK%2FuXxjTESMYMLWfvrCYvruHQx3LBDafxV1sKtkAsLvcBK85MFMzJ4SuFib8hxQln04gKl6unSxqXeXGmAljS2GfQqMwjsAzqbWaMFI3OmF6iLaH3aCoKfZMo6GWMrPJzaBRPnj4bxigWJoIjOMjbDk5jHl5b50rPvOwHzs3Xd4rooayXTn%2BmjMv3Smbp%2FTRWd0T%2BKMYqdMVa7iW%2BrhNvBWDyV2rPSk3Yr5%2BncwLL0vxpy%2BHN%2BKmHn3bwk1HH5GTUBH1Ul3Kn%2FG2FwipCd835vObOlOLUlTZDbVQWGr5EL8yOQGnCqmwMFOetkqgs%2BTcaF5%2BUXCjU2iM%2Bkor%2FkMJsO2GzlAuByk%2B1C6lxXaO9oqm6beXno6SMi0XrwrGnrOaujKL46F4a0%2B1RxZIyZLC%2Ff%2Ff2totPWjVsF8oK9ji4pOH1QslMsKmM3VW6F9p%2FBs3GoB1d7X7h3xYWYUHTYE4OOoX7olWEfiNoFZsPexznAGu%2F5Q0VLmx57%2B%2FDhmXbze7dKXl88%2FD2c%2Bj1oQdj6PXytuVQZsKo2xraiszL%2FIbc79gCdoZXZF5JYWb8hz3pL90l7lbOkS8iK3kpY9aRA1g3d1Jge2sP3kA9n7gR6PsUxt2l0%2FzXz5b9NgMbXXpRuLQ9455T%2Ba5G9qr%2FBzdxN36NCd%2FMQRNddfBQh5syvcGJO3fog6W92dd40fHpFDHWEPNr3JIgB%2FzIr7GdpHrZJmoTm3dK9sM9JeuHVXbqmaHGd7bqNdNYZgymctlu5lC3H4%2Fn0GJDC81%2F6zalLWY%2BZAln3NxutRGVwJ0tnNuxcpYisq02VlwwbZFnPEadQ5JGOxr7ZLtYpnCrqbQE5pBctgeV%2FyN5s0woru%2Fzon4wDHWBy3eMcpYJjeYx2jWaXZWfSfk455MS%2BF8MPMb9pMDlD6dnMrrzorCHsTsZPNk8GjzZOgdtvHh2HJKKxwRtnhNgJGhEKN%2Bw9RBU16feMMu1I52MjlM7VZI%2BCWWSSoHCaDL%2BRibT6tOZsifQy0fhVDU%2FlQPInk5piIPDOYGEi%2FPy7fK7azFHHqm73MLayq73UiVTPXSpz9szXd1sNrWUSrBoGZ6gT8JkVIdqibiwTIgrvrC%2FbpgIE7R8rAlnZExukjjjpE8Uavck12S8zvsF7CtV9pNYZwaa%2F0AyJoev0hvSJ5fyZhZRJlcD914kY7LXLOmEWBVSOG0ktmHUtiulnRlycCYZjU84jeWCjMkq4gatnQ7KPa2RDZoHRPEUsQ4UI2iqeELV7eDlwQHJ8z5hVF3fMV5A3aTbSDL7lFKlYJ5fWGnptBcs8BtkX6wWMnZPuT7RK5qmyOrvVOGS4%2BpMsgYjFUdhaOlkczBIn1D3bClV1pkoV92vUSV3LoEGheXZ%2FjyV5%2F8CoVd8TbUSAAA%3D). But if you use one of these as a springboard for your own app you'll want to download and run locally. For that you'll need a minimal static web server. And if you are using an AI coding assistant you'll want it to use XMLUI's MCP server. To streamline the setup we provide the [XMLUI CLI](https://github.com/xmlui-org/xmlui-cli/releases) (command line interface). When you download and install the CLI you'll add a single binary, `xmlui` to your system. Here's how you'll use it.

## List demo apps

We maintain a growing catalog of demo apps you can explore and use as springboards for your own work. Use `xmlui list` to list them.

```
$ xmlui list-demos
xmlui-hello-world: The simplest XMLUI app to get you started.

xmlui-weather: A simple weather dashboard that displays current weather conditions for any city.

xmlui-invoice: A complete business application for invoice management with a local server and database.
```

## Acquire a demo app

Use `xmlui new` to acquire an app.

```
$ xmlui new xmlui-weather
Downloading xmlui-weather (XMLUI Weather Dashboard)...
Extracting to xmlui-weather...
To run the app, visit xmlui-weather and use `xmlui run`
```

In the app's directory `xmlui run` suffices, from elsewhere you can use the full path.

```
$ xmlui run /Users/elvis/xmlui-weather
Serving /Users/elvis/xmlui-weather
Available on: http://localhost:8080
```

`xmlui` uses its bundled static webserver to host the app. Your system will launch the default browser and open the app on port 8080 (or another if that's taken).

## Configure the MCP server

The `xmlui mcp` subcommand launches the MCP server in stdio mode. When a coding agent invokes it, the MCP server downloads portions of the [main XMLUI repository](https://github.com/xmlui-org/mcp), including the documentation and source code, so it can inform the agent about XMLUI syntax and idioms.

As with any MCP server you'll need to use a configuration file to make it available to agents, and the names and formats of those files are unfortunately not standard. Here's an example that works with Claude's `claude_desktop_config.json`. The first argument to `xmlui` names the `mcp` subcommand. You'll probably want to place the `xmlui` binary on your system path but it never hurts to be explicit about its location.

```
{
  "mcpServers": {
    "xmlui": {
      "command": "/usr/local/bin/xmlui",
      "args": [
        "mcp"
      ]
    }
  }
}
```

You can optionally add one or more apps to the pool of examples that an agent can use XMLUI's MCP server to search. To do that, use the `-e` argument and a path argument one or more times, and use the filesystem MCP server to grant access to those locations.

```
{
  "mcpServers": {
    "xmlui": {
      "command": "/usr/local/bin/xmlui",
      "args": [
        "mcp"
        "-e",
        "/Users/elvis/xmlui-weather",
        "-e",
        "/Users/elvis/xmlui-invoice"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/elvis/xmlui-weather",
        "/Users/elvis/xmlui-invoice",
      ]
    },
  }
}
```

## Build and share

The CLI will help you manage the tools needed for effective XMLUI development. If you build an app that you want to share, you can use this mode of `xmlui run`.

```
xmlui run https://github.com/xmlui-org/xmlui-weather/releases/latest/download/xmlui-weather.zip
```

This works not only for our demos but also for any XMLUI app bundled as a zip file. The CLI will download the zip file, unzip it, and launch it using its bundled webserver.

One of our demos, `xmlui-invoice`, includes [a webserver that embeds SQLite](https://github.com/xmlui-org/xmlui-test-server). The release bundle for `xmlui-invoice` includes prebuilt server binaries and a start script to run them. When `xmlui run` finds a start script it will run that script instead of launching its own test server. You can use this pattern to build shareable apps that need custom infrastructure.

When you've built something you want to share, please [let us know](mailto:team@xmlui.org)!