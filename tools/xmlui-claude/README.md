# xmlui (Claude Code Plugin)

A Claude Code plugin that sets up a complete XMLUI development environment with minimal user effort.

## What it does

Invoking `/xmlui:setup` walks Claude through:

1. Preflight check (required tools, platform detection)
2. Installing the XMLUI CLI
3. Creating a new XMLUI project (asks for tracing preference and project name)
4. Configuring the XMLUI MCP server for Claude Code

Claude drives the entire flow. Scripts handle execution. The user is only asked two questions.

## Usage

Load the plugin and invoke the setup skill:

```bash
claude --plugin-dir ./xmlui-claude
```

Then in Claude Code:

```
/xmlui:setup
```

Or with a project name argument:

```
/xmlui:setup my-app
```

## Development

Test locally with the `--plugin-dir` flag. Use `/reload-plugins` after editing `SKILL.md` to pick up changes without restarting.

## Structure

```
xmlui-claude/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── xmlui-setup/
│       ├── SKILL.md         ← Claude instructions
│       └── scripts/         ← Non-interactive shell executors
│           ├── common.sh
│           ├── preflight.sh
│           ├── install-cli.sh
│           ├── configure-mcp.sh
│           └── dev-setup.sh
└── README.md
```
