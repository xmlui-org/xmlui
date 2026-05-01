# Get Started

Get a running XMLUI app, an AI assistant that knows the XMLUI docs, and a built-in Inspector for debugging — in under 5 minutes.

## Choose your platform

<details>
<summary>macOS / Linux</summary>

### Install the CLI

```bash
curl -fsSL https://github.com/xmlui-org/xmlui-cli/releases/latest/download/install.sh | sh
```

The script does exactly this:

1. Detects your OS and CPU architecture and chooses the matching release artifact.
2. Downloads that archive plus the published `SHA256SUMS` file.
3. Verifies the archive's SHA256 before installing anything.
4. Extracts the archive into a temporary directory.
5. Finds the bundled `xmlui` binary and runs `xmlui install`.
6. `xmlui install` copies the binary to `/usr/local/bin` if that directory is writable, otherwise to `~/.local/bin`.
7. On macOS, `xmlui install` also removes the quarantine attribute from the installed binary.
8. If the install directory is not already on `PATH`, `xmlui install` prints the shell line to add, or you can re-run with `xmlui install --add-to-path`.

Confirm the install:

```bash
xmlui --version
```

#### Audit-friendly alternative

If you'd rather not run a remote shell script:

```bash
curl -fsSLO https://github.com/xmlui-org/xmlui-cli/releases/latest/download/SHA256SUMS
curl -fsSLO https://github.com/xmlui-org/xmlui-cli/releases/latest/download/xmlui-macos-arm64.tar.gz   # or your platform
shasum -a 256 -c SHA256SUMS --ignore-missing
tar -xzf xmlui-*.tar.gz
./xmlui install
```

Other platforms: replace `xmlui-macos-arm64.tar.gz` with `xmlui-macos-intel.tar.gz`, `xmlui-linux-amd64.tar.gz`, or `xmlui-windows-amd64.zip`.

### Register the MCP server

For Claude Code:

```bash
claude mcp add --scope user xmlui xmlui mcp
```

This adds an `xmlui` server entry to `~/.claude.json` at user scope, so Claude Code can call the XMLUI MCP tools in any project. **Restart Claude Code** so it picks up the new server.

To confirm, ask Claude Code: *"What XMLUI MCP tools do you have?"* You should see a list of about a dozen `xmlui_*` tools.

## Troubleshooting

- **Claude doesn't see XMLUI tools.** Run `xmlui doctor`. It lists every place an `xmlui` MCP server is registered, validates the binary path, and runs `--version`. If it reports duplicates across scopes, remove all but one.
- **Update.** Re-run the install command.
- **Uninstall.** Remove the `xmlui` MCP server entry from Claude Code, then delete the binary from `/usr/local/bin/xmlui` or `~/.local/bin/xmlui`.

</details>

<details>
<summary>Windows</summary>

### Install the CLI

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://github.com/xmlui-org/xmlui-cli/releases/latest/download/install.ps1 | iex"
```

The PowerShell installer downloads `xmlui-windows-amd64.zip`, verifies its SHA256 against the published `SHA256SUMS`, extracts `xmlui.exe`, installs it to `~/bin`, and adds that directory to your user `PATH`.

Confirm the install in a new PowerShell window:

```powershell
xmlui --version
```

#### Audit-friendly alternative

If you'd rather not run a remote PowerShell script:

```powershell
Invoke-WebRequest https://github.com/xmlui-org/xmlui-cli/releases/latest/download/SHA256SUMS -OutFile SHA256SUMS
Invoke-WebRequest https://github.com/xmlui-org/xmlui-cli/releases/latest/download/xmlui-windows-amd64.zip -OutFile xmlui-windows-amd64.zip
Get-FileHash .\xmlui-windows-amd64.zip -Algorithm SHA256
Expand-Archive .\xmlui-windows-amd64.zip -DestinationPath .\xmlui-expand -Force
.\xmlui-expand\xmlui.exe install --add-to-path
```

### Register the MCP server

For Claude Code:

```powershell
claude mcp add --scope user xmlui xmlui mcp
```

This writes the same `xmlui` MCP server entry into `~/.claude.json`. **Restart Claude Code** so it picks up the new server.

To confirm, ask Claude Code: *"What XMLUI MCP tools do you have?"* You should see a list of about a dozen `xmlui_*` tools.

## Troubleshooting

- **Claude doesn't see XMLUI tools.** Run `xmlui doctor`. It lists every place an `xmlui` MCP server is registered, validates the binary path, and runs `--version`. If it reports duplicates across scopes, remove all but one.
- **Update.** Re-run the install command.
- **Uninstall.** Remove the `xmlui` MCP server entry from Claude Code, then delete the binary from `~/bin/xmlui.exe`.

</details>

## Create and run the weather app

```bash
xmlui new xmlui-weather
cd xmlui-weather
xmlui run
```

The dev server opens the app in your default browser. The app includes the **Inspector** (magnifying-glass icon, top right), which records traces of everything your app does so you (and Claude or Codex) can see what's going on.

## Use Claude Code to fix and extend the xmlui-weather app

Before you start asking Claude for help with the app, make sure you are in the `xmlui-weather` directory and open Claude Code there.

### Verify Claude can see the MCP tools

In Claude Code:

> What XMLUI MCP tools are available to you?

Claude should enumerate `xmlui_search`, `xmlui_component_docs`, `xmlui_examples`, `xmlui_list_howto`, `xmlui_distill_trace`, and others. If it doesn't, run `xmlui doctor` to diagnose.

### Drive the app, capture a trace, distill and analyze

The app loads with weather for Santa Rosa, CA. Open the Inspector and expand the Startup phase to see the distilled view of what happened.

Now switch to a different city, then open the Inspector again, click **Export**, and tell Claude:

> Distill and analyze the trace.

Claude calls the `xmlui_distill_trace` tool, which returns a structured per-step summary of every interaction, API call, and value change. Claude narrates the result back to you.

### Fix the layout

The default layout isn't great. Ask Claude:

> Center the input box and button as a group, and center the radio group on a new row.

Expect Claude to use the MCP tools, especially `xmlui_search_howto`, with `xmlui_search` as a general fallback, to find a documented how-to that provably works, edit `Main.xmlui`, and tell you to refresh. Don't be afraid to challenge Claude to cite evidence. If the answer is wrong, screenshot the broken layout, paste it into Claude, and ask it to look harder.

### Add a feature

Ask Claude:

> Add three tables that report hourly temperatures for three user-specifiable cities.

Same pattern: Claude searches the docs via the MCP tools, edits the app, you refresh. If something breaks, export a trace and ask Claude to distill it.

## General troubleshooting

- **`xmlui` not found on PATH.** Re-run `xmlui install --add-to-path`, or follow the instructions printed by the original `install.sh`.

## More demo apps

- [xmlui-hello-world](https://github.com/xmlui-org/xmlui-hello-world/releases): A minimal XMLUI app. [Try it in the online playground](https://playground.xmlui.org/#/playground/#H4sIAAAAAAAAE2VTzU7cMBB%2BFXeExCVLFqm9RNmtKK2gB1SpIHqoOZh4SKx1ZizHyQZWeffKScgWuHnG359n5AM0QZFWlgkhO4ByDjLIL5zbSpKUX98GVey2koTI77AP2yuPGAR26J%2BZME%2FH5nh9jdaySLeS8nShLRKiQx9MoeyFNSXVSGEjoUAK6CV80G%2B4xnfy8fSNe2H0RoJD3zBJEHujQ7WRcL72WEsQhkwwyt4r2%2BJGwg%2FbmUZC%2Bn%2FCibuRcJhOZ10EDxPqbfR0mgMkUHDtmJBCA9lfyC9fS0Gqjkaj9PiQfI48mR3EifPsmrPZyyKVoRJf37ZFJk7%2FsLf6VAyfou%2BskaeLUYzxEHPQkynjpkKFNcY0BzAaMuhr2xpIwGPDrS%2Fi1WFIJti98rGEJ6awaswLQgbnX1wPCTxyf1spzfvVT3JtgAxOjq2mhijBNKqBNWUVFu9X0UdV7ErPLelLtuxXN6yV%2FW6U5RIy2FcmYPR5hyoqLHaoV7%2BVNnzluXW%2FXDBMMUAxIpw3tfLPq8%2FrNQxDAlr53QfzCYresz8ytaIS%2FUwchofI5lF9moLpUd9FFcielG0wgWavnEO91M5jZ3B%2Fw%2FqIYW%2BQgppDVuzNC1NQFhJQRTAdzpLLJubu%2BLPm2Y0LDEhxzvGrDcM%2FWRGtOYEDAAA%3D).
- [xmlui-invoice](https://github.com/xmlui-org/xmlui-invoice/releases): A complete database-backed app. Run it with `xmlui run https://github.com/xmlui-org/xmlui-invoice/releases/latest/download/xmlui-invoice.zip`.
