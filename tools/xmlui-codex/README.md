# xmlui-codex Plugin

Codex plugin for XMLUI onboarding with cross-platform setup scripts and MCP registration helpers.

## What this provides
- XMLUI CLI installation flow for Windows and Bash environments
- Codex MCP server registration for XMLUI
- Optional XMLUI project scaffolding
- Skill instructions for automated setup via `xmlui-setup`

## Folder structure

```text
xmlui-codex/
  .codex-plugin/
    plugin.json
  .mcp.json
  MIGRATION_PLAN.md
  xmlui-setup.cmd
  xmlui-setup.sh
  skills/
    xmlui-setup/
      SKILL.md
      agents/
        openai.yaml
      scripts/
        common.sh
        preflight.sh
        install-cli.sh
        configure-mcp.sh
        dev-setup.sh
        xmlui-setup.sh
        common.ps1
        preflight.ps1
        install-cli.ps1
        configure-mcp.ps1
        dev-setup.ps1
        xmlui-setup.ps1
        preflight.cmd
        install-cli.cmd
        configure-mcp.cmd
        dev-setup.cmd
        xmlui-setup.cmd
```

## Quick start

### Windows (recommended path)

Run from plugin root:

```bat
xmlui-setup.cmd
```

If you need direct step-by-step execution:

```bat
skills\xmlui-setup\scripts\preflight.cmd
skills\xmlui-setup\scripts\install-cli.cmd
skills\xmlui-setup\scripts\configure-mcp.cmd
```

### macOS/Linux (Bash)

Run from plugin root:

```bash
./xmlui-setup.sh
```

Or run individual steps:

```bash
./skills/xmlui-setup/scripts/preflight.sh
./skills/xmlui-setup/scripts/install-cli.sh
./skills/xmlui-setup/scripts/configure-mcp.sh
```

## Windows execution policy notes

Some environments block `*.ps1` command shims (`xmlui.ps1`, `codex.ps1`) with:
`running scripts is disabled on this system`.

Use these forms instead:

- `xmlui.cmd` or `xmlui.exe`
- `codex.cmd`
- `*.cmd` wrappers in this plugin (they call PowerShell with `-ExecutionPolicy Bypass`)

Examples:

```bat
xmlui.cmd --help
codex.cmd mcp list
codex.cmd mcp add xmlui -- xmlui.exe mcp
```

## MCP configuration

Default command:

```bash
codex mcp add xmlui -- xmlui mcp
```

Windows-safe alternatives:

```bat
codex.cmd mcp add xmlui -- xmlui.exe mcp
codex.cmd mcp add xmlui -- "C:\path\to\xmlui.exe" mcp
```

Verify:

```bash
codex mcp get xmlui
```

## Optional project scaffolding

List templates:

```bash
xmlui list-demos
```

Create project:

```bash
xmlui new xmlui-hello-world-trace --output xmlui-hello-world-trace
```

Windows helper:

```bat
skills\xmlui-setup\scripts\dev-setup.cmd -Template xmlui-hello-world-trace -ProjectName xmlui-hello-world-trace
```

## Local plugin files
- Plugin metadata: `.codex-plugin/plugin.json`
- Bundled MCP config: `.mcp.json`
- Setup skill: `skills/xmlui-setup/SKILL.md`

## References
- Codex MCP docs: https://developers.openai.com/codex/mcp
- Codex Skills docs: https://developers.openai.com/codex/skills
- Codex Plugin docs: https://developers.openai.com/codex/plugins/build