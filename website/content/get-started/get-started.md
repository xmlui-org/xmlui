# Get Started

Three steps: install the CLI, download a sample app, run it.

## Step 1: Install the XMLUI CLI

Download the [latest release](https://github.com/xmlui-org/xmlui-cli/releases) for your platform:

| Platform | Download |
|----------|----------|
| macOS (Apple Silicon) | [xmlui-macos-arm64.tar.gz](https://github.com/xmlui-org/xmlui-cli/releases/latest/download/xmlui-macos-arm64.tar.gz) |
| macOS (Intel) | [xmlui-macos-intel.tar.gz](https://github.com/xmlui-org/xmlui-cli/releases/latest/download/xmlui-macos-intel.tar.gz) |
| Linux (x64) | [xmlui-linux-x64.tar.gz](https://github.com/xmlui-org/xmlui-cli/releases/latest/download/xmlui-linux-x64.tar.gz) |
| Windows (x64) | [xmlui-win-x64.zip](https://github.com/xmlui-org/xmlui-cli/releases/latest/download/xmlui-win-x64.zip) |

Extract the archive and move the `xmlui` binary onto your PATH:

```bash
# macOS / Linux example
tar -xzf xmlui-macos-arm64.tar.gz
sudo mv xmlui /usr/local/bin/
```

On macOS, remove the quarantine attribute so the binary can run:

```bash
xattr -d com.apple.quarantine /usr/local/bin/xmlui
```

Verify the install:

```bash
xmlui --help
```

## Step 2: Create the weather app

```bash
xmlui new xmlui-weather
```

This downloads the [xmlui-weather](https://github.com/xmlui-org/xmlui-weather) sample project into an `xmlui-weather` directory.

## Step 3: Run it

```bash
cd xmlui-weather
xmlui run
```

The app opens in your browser. You now have a running XMLUI app with the built-in Inspector for debugging.

## Next steps

The CLI bundles an MCP server so AI coding assistants can help you understand and modify XMLUI apps. Here's a sample `claude_desktop_config.json` that works with Claude Desktop or (using `claude mcp add-from-claude-desktop`) Claude Code.

```
{
  "mcpServers": {
    "xmlui": {
      "command": "/usr/local/bin/xmlui",
      "args": [
        "mcp",
        "-e",
        "/Users/YOURNAME/xmlui-weather"
      ]
    }
  }
}
```

### Other AIs

Cursor and Kiro: same as above.

<details>
  <summary>Copilot</summary>
<pre>
{
  "servers": {
    "xmlui": {
      "type": "stdio",
      "command": "/usr/local/bin/xmlui",
      "args": [
        "mcp",
        "-e",
        "/Users/YOURNAME/xmlui-weather"
      ]
    }
  }
}
</pre>
</details>

<details>
  <summary>Codex</summary>
<pre>
[mcp_servers.xmlui]
command = "/usr/local/bin/xmlui"
args = [
  "mcp",
  "-e",
  "/Users/YOURNAME/xmlui-weather"
]
</pre>
</details>

### More demo apps

[xmlui-hello-world](https://github.com/xmlui-org/xmlui-hello-world/releases): A minimal XMLUI app. [Try it in the online playground](https://playground.xmlui.org/#/playground/#H4sIAAAAAAAAE2VTzU7cMBB%2BFXeExCVLFqm9RNmtKK2gB1SpIHqoOZh4SKx1ZizHyQZWeffKScgWuHnG359n5AM0QZFWlgkhO4ByDjLIL5zbSpKUX98GVey2koTI77AP2yuPGAR26J%2BZME%2FH5nh9jdaySLeS8nShLRKiQx9MoeyFNSXVSGEjoUAK6CV80G%2B4xnfy8fSNe2H0RoJD3zBJEHujQ7WRcL72WEsQhkwwyt4r2%2BJGwg%2FbmUZC%2Bn%2FCibuRcJhOZ10EDxPqbfR0mgMkUHDtmJBCA9lfyC9fS0Gqjkaj9PiQfI48mR3EifPsmrPZyyKVoRJf37ZFJk7%2FsLf6VAyfou%2BskaeLUYzxEHPQkynjpkKFNcY0BzAaMuhr2xpIwGPDrS%2Fi1WFIJti98rGEJ6awaswLQgbnX1wPCTxyf1spzfvVT3JtgAxOjq2mhijBNKqBNWUVFu9X0UdV7ErPLelLtuxXN6yV%2FW6U5RIy2FcmYPR5hyoqLHaoV7%2BVNnzluXW%2FXDBMMUAxIpw3tfLPq8%2FrNQxDAlr53QfzCYresz8ytaIS%2FUwchofI5lF9moLpUd9FFcielG0wgWavnEO91M5jZ3B%2Fw%2FqIYW%2BQgppDVuzNC1NQFhJQRTAdzpLLJubu%2BLPm2Y0LDEhxzvGrDcM%2FWRGtOYEDAAA%3D).

[xmlui-invoice](https://github.com/xmlui-org/xmlui-invoice/releases): A complete database-backed app. Run it with `xmlui run https://github.com/xmlui-org/xmlui-invoice/releases/latest/download/xmlui-invoice.zip`.
