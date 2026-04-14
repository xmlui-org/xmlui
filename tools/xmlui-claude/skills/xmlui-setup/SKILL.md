---
name: xmlui-setup
description: Set up a complete XMLUI development environment. Use when the user wants to start XMLUI development, install the XMLUI CLI, configure the MCP server, or create a new XMLUI project.
disable-model-invocation: true
allowed-tools: Bash
---

# XMLUI Development Environment Setup

Your goal is to set up a complete XMLUI development environment for the user. Work through the steps below in order. At each step, run the relevant script yourself — do not ask the user to copy-paste commands unless a step explicitly requires their input.

Steps 1 and 2 use scripts at `${CLAUDE_SKILL_DIR}/scripts/`.

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

Detect the platform first to know which binary name to check:

- macOS / Linux: `xmlui`
- Windows: `xmlui.exe`

Check if already installed:

```bash
command -v xmlui       # macOS / Linux
command -v xmlui.exe   # Windows
```

If found, skip to Step 3.

If not found, run:

```bash
"${CLAUDE_SKILL_DIR}/scripts/install-cli.sh"
```

If the script fails, install manually based on the user's platform:

| Platform    | Command                                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Linux x64   | `curl -fsSL https://github.com/xmlui-org/xmlui-cli/releases/download/latest/xmlui-linux-x64.tar.gz \| tar -xz -C ~/.local/bin`   |
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

Verify with `xmlui --help` before continuing.

---

## Step 3: Configure the MCP server

First, check what MCP servers are already registered:

```bash
claude mcp list
```

If the output already includes a line for `xmlui`, this step is done — skip to Step 4.

If `xmlui` is not listed, add it. The binary name differs by platform:

**macOS / Linux:**
```bash
claude mcp add xmlui -- xmlui mcp
```

**Windows (PowerShell or Git Bash):**
```bash
claude mcp add xmlui -- xmlui.exe mcp
```

After adding, verify with `claude mcp list` again — the output should now include a line for `xmlui`.

If `claude` is not found, the Claude Code CLI is not on PATH. Ask the user to verify `claude` is accessible and try again.

---

## Step 4: Create a project

Ask the user if they want to create a new XMLUI project. If not, skip to the Final message.

First, list the available templates:

```bash
xmlui list-demos
```

Show the output to the user. Recommend **`xmlui-hello-world-trace`** — it comes with the Inspector and XS tracing already wired up, which makes debugging and AI-assisted development much easier. The other templates are available if they prefer a different starting point.

Ask the user which template they'd like to use (default: `xmlui-hello-world-trace`).

Ask the user what they'd like to name their project directory (default: `xmlui-hello-world-trace`).

Once you have both answers, run:

```bash
xmlui new <template> --output <project-name>
```

For example:

```bash
xmlui new xmlui-hello-world-trace --output my-project
```

If `xmlui new` is not recognized, there's a problem with the CLI installation. Tell the user to re-run Step 2 to get the latest version.

---

## Final message

Once all steps have completed successfully, tell the user the final message, which has 3 parts — the last 2 are optional.

> Setup is complete.

If the MCP server was added during the setup process, tell the user:

> Please restart Claude Code so the **XMLUI MCP** server becomes active to help you with XMLUI development.

If a project was created, tell the user (substituting the actual project name):

> You may want to restart Claude Code in the `project-name` directory.
