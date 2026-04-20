---
name: xmlui-setup
description: Set up a complete XMLUI development environment. Use when the user wants to start XMLUI development, install the XMLUI CLI, configure the XMLUI MCP server for Codex, or create a new XMLUI project.
---

# XMLUI Development Environment Setup (Codex)

Your goal is to set up a complete XMLUI development environment for the user.

Before running any script in this skill, resolve the absolute path to this skill directory and run scripts from there.

Select script family by OS:

- Windows PowerShell/CMD: use `.ps1` or `.cmd` scripts from `scripts/`
- macOS/Linux (Bash): use `.sh` scripts from `scripts/`

Recommended single entrypoint:

- Windows: `scripts/xmlui-setup.cmd`
- macOS/Linux: `scripts/xmlui-setup.sh`

Work through the steps below in order.

## Step 1: Preflight

Run preflight for the current OS:

- Windows: `scripts/preflight.cmd` (or `scripts/preflight.ps1`)
- macOS/Linux: `scripts/preflight.sh`

If it fails, diagnose the missing dependency and tell the user what to install.

Do not proceed until preflight passes.

## Step 2: Install the XMLUI CLI

Check whether `xmlui` is already available on PATH.

- If installed, skip to Step 3.
- If missing, run install script for the current OS:
  - Windows: `scripts/install-cli.cmd` (or `scripts/install-cli.ps1`)
  - macOS/Linux: `scripts/install-cli.sh`

On Windows, if `xmlui` points to a blocked PowerShell shim, use `xmlui.exe` or `xmlui.cmd` for verification.

After installation, verify with:

```bash
xmlui --help
```

If the command is still missing, stop and report the install failure.

## Step 3: Configure XMLUI MCP for Codex

First check current MCP servers:

```bash
codex mcp list
```

If `xmlui` is already configured, skip to Step 4.

If not configured, add it:

```bash
codex mcp add xmlui -- xmlui mcp
```

If that fails on Windows, retry with:

```bash
codex mcp add xmlui -- xmlui.exe mcp
```

If `codex` is blocked by execution policy on Windows, use:

```bash
codex.cmd mcp list
codex.cmd mcp add xmlui -- xmlui.exe mcp
```

Verify:

```bash
codex mcp get xmlui
```

## Step 4: Create a project (optional)

Ask the user whether they want a new XMLUI project.

If yes:

1. List templates:

```bash
xmlui list-demos
```

2. Ask for template (default: `xmlui-hello-world-trace`).
3. Ask for output directory name (default: `xmlui-hello-world-trace`).
4. Create the project:

```bash
xmlui new <template> --output <project-name>
```

Windows helper script:

```bash
scripts/dev-setup.cmd -Template <template> -ProjectName <project-name>
```

## Final message

When complete, report:

- Setup completed.
- Whether MCP `xmlui` was added or already present.
- If a project was created, include its path and next command to run it.
