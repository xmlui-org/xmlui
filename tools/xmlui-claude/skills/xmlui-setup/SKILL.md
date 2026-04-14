---
name: xmlui-setup
description: Set up a complete XMLUI development environment. Use when the user wants to start XMLUI development, install the XMLUI CLI, configure the MCP server, or create a new XMLUI project.
disable-model-invocation: true
allowed-tools: Bash
argument-hint: [project-name]
---

# XMLUI Development Environment Setup

Your goal is to set up a complete XMLUI development environment for the user. Work through the steps below in order. At each step, run the relevant script yourself — do not ask the user to copy-paste commands unless a step explicitly requires their input.

All scripts are at `${CLAUDE_SKILL_DIR}/scripts/`.

---

## Step 1: Preflight

Run:
```bash
"${CLAUDE_SKILL_DIR}/scripts/preflight.sh"
```

If it fails, diagnose the missing dependency and tell the user what to install. Common issues:
- `curl` missing: install via system package manager
- `claude` missing: Claude Code CLI is not installed or not on PATH
- `tar`/`unzip` missing: install via system package manager

Do not proceed until preflight passes.

---

## Step 2: Install the XMLUI CLI

First check if already installed:
```bash
command -v xmlui
```

If found, skip to Step 3.

If not found, run:
```bash
"${CLAUDE_SKILL_DIR}/scripts/install-cli.sh"
```

If the script fails, install manually based on the user's platform:

| Platform | Command |
|---|---|
| Linux x64 | `curl -fsSL https://github.com/xmlui-org/xmlui-cli/releases/download/latest/xmlui-linux-x64.tar.gz \| tar -xz -C ~/.local/bin` |
| macOS arm64 | `curl -fsSL https://github.com/xmlui-org/xmlui-cli/releases/download/latest/xmlui-macos-arm64.tar.gz \| tar -xz -C ~/.local/bin` |
| macOS Intel | `curl -fsSL https://github.com/xmlui-org/xmlui-cli/releases/download/latest/xmlui-macos-intel.tar.gz \| tar -xz -C ~/.local/bin` |

After manual install:
```bash
chmod +x ~/.local/bin/xmlui
export PATH="$HOME/.local/bin:$PATH"
```

On macOS, if the binary is blocked by quarantine:
```bash
xattr -d com.apple.quarantine ~/.local/bin/xmlui
```

Verify with `xmlui --version` before continuing.

---

## Step 3: Create a project

If `$ARGUMENTS` was provided, use that as the project name and skip asking.

Otherwise, ask the user two questions before running anything:

1. "Would you like tracing enabled? It improves debugging and testing when working with AI agents."
2. "What would you like to name your project directory?" (suggest `xmlui-hello-world-tracing` if tracing, otherwise `xmlui-hello-world`)

Once you have both answers, run:
```bash
"${CLAUDE_SKILL_DIR}/scripts/dev-setup.sh" --tracing=<yes|no> --project-name=<name>
```

If the script fails because `xmlui new` is not recognized, the CLI version may be outdated. Tell the user to re-run Step 2 to get the latest version.

After the script succeeds, tell the user: to start the local dev server, run `cd <project-name> && xmlui run` in a terminal.

---

## Step 4: Configure the MCP server

Run:
```bash
"${CLAUDE_SKILL_DIR}/scripts/configure-mcp.sh"
```

If it fails with "command not found: claude", the Claude Code CLI is not on PATH. Ask the user to verify `claude` is accessible and try again.

If `claude mcp add` fails, run it directly:
```bash
claude mcp add xmlui -- xmlui mcp
```

Then verify:
```bash
claude mcp list
```

The output should include a line for `xmlui`.

---

## Final message

Once all four steps have completed successfully, tell the user:

> Setup is complete. Please restart Claude Code so the XMLUI MCP server becomes active. After restarting, the MCP tools will be available and you can start building.
