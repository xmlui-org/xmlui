# xmlui-claude Plugin

A Claude Code plugin that automates XMLUI development environment setup and provides integration with Claude Code via an MCP server.

## Overview

This plugin streamlines the process of getting started with XMLUI development by:

- **Automating setup** — Handles preflight checks, CLI installation, MCP configuration, and project scaffolding in one command
- **Minimal friction** — Users answer only 2 optional questions; Claude handles the rest
- **Cross-platform** — Supports Linux, macOS (Intel and ARM), and Windows
- **MCP integration** — Registers an XMLUI MCP server for Claude to access XMLUI capabilities directly within Claude Code

## Quick Start

### Load the plugin

```bash
claude --plugin-dir ./tools/xmlui-claude
```

### Run setup

In Claude Code, invoke:

```
/xmlui-setup
```

The skill will guide you through the entire setup process.

## What the `/xmlui-setup` skill does

The skill runs automatically when you invoke it and performs these steps:

1. **Preflight checks** — Verifies required tools are installed (`curl`, `claude`, `tar`/`unzip`)
2. **XMLUI CLI installation** — Installs the XMLUI CLI binary if not already present
3. **MCP server registration** — Registers the XMLUI MCP server with Claude Code
4. **Project creation** (optional) — Offers to scaffold a new XMLUI project from a template

You can stop at any point; setup is resumable. If you already have the CLI installed or MCP configured, the skill skips those steps.

## Supported Platforms

| Platform               | Status      |
| ---------------------- | ----------- |
| **Linux x64**          | ✓ Supported |
| **macOS Intel**        | ✓ Supported |
| **macOS ARM64**        | ✓ Supported |
| **Windows (Git Bash)** | ✓ Supported |

## Development

### File conventions

- **`SKILL.md`** — Contains skill metadata (YAML frontmatter) and detailed step-by-step instructions for Claude to follow. The `disable-model-invocation: true` flag ensures Claude runs scripts directly rather than generating shell commands.
- **Scripts** — Written in bash for cross-platform compatibility. Use `common.sh` utilities (`log`, `warn`, `fail`, `detect_platform`) for consistent output and error handling.

### Testing locally

Test the plugin during development with:

```bash
claude --plugin-dir ./tools/xmlui-claude
```

After editing `SKILL.md`, use `/reload-plugins` in Claude Code to pick up changes without restarting.

### Adding new steps to setup

1. Add new script in `skills/xmlui-setup/scripts/` (e.g., `my-step.sh`)
2. Source `common.sh` at the top: `source "${SCRIPT_DIR}/common.sh"`
3. Use provided functions: `log`, `warn`, `fail`, `detect_platform`, `require_cmd`, `ensure_path_export`
4. Add a step section in `SKILL.md` with clear instructions for Claude

### MCP server details

The plugin registers the XMLUI MCP server, which allows Claude to:

- Query XMLUI project information
- Access build and development tools
- Integrate XMLUI workflows within Claude Code sessions

The server is invoked with:

- **Linux/macOS:** `xmlui mcp`
- **Windows:** `xmlui.exe mcp`

## Troubleshooting

## Related Documentation

- **Claude Code Skills** — See `dev-docs/about-skills.md` for general skill architecture and authoring patterns
- **XMLUI CLI** — https://github.com/xmlui-org/xmlui-cli
- **Claude Code Documentation** — https://code.claude.com/docs
