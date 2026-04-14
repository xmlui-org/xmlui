# XMLUI Claude Plugin - Implementation Summary

## What was built

A Claude Code plugin at `tools/xmlui-claude` that guides Claude through setting up a complete XMLUI development environment. The plugin is Claude-first: the skill instructs Claude on what to do and what to ask, while non-interactive scripts handle execution.

## Structure

```
xmlui-claude/
├── .claude-plugin/
│   └── plugin.json              ← plugin manifest, name "xmlui"
├── skills/
│   └── xmlui-setup/
│       ├── SKILL.md             ← Claude instructions, invoked as /xmlui:setup
│       └── scripts/
│           ├── common.sh        ← shared helpers (logging, platform detection, PATH)
│           ├── preflight.sh     ← validates required tools and platform
│           ├── install-cli.sh   ← downloads and installs XMLUI CLI
│           ├── configure-mcp.sh ← registers XMLUI MCP server with Claude Code
│           └── dev-setup.sh     ← creates a new XMLUI project (flag-driven)
└── README.md
```

## Skill behavior

`/xmlui:setup` (or `/xmlui:setup <project-name>`) triggers Claude to work through four steps autonomously:

1. **Preflight** — runs `preflight.sh` to validate `curl`, `uname`, `claude`, and `tar`/`unzip`. Claude diagnoses any failures and tells the user what to install.

2. **CLI install** — checks if `xmlui` is already on PATH. If not, runs `install-cli.sh`. If the script fails, Claude falls back to documented manual install commands per platform.

3. **Project creation** — asks the user two questions (tracing preference, project name) unless a name was passed as an argument. Then runs `dev-setup.sh --tracing=<yes|no> --project-name=<name>`. After success, tells the user how to start the dev server (`cd <name> && xmlui run`).

4. **MCP configuration** — runs `configure-mcp.sh` which calls `claude mcp add xmlui -- xmlui mcp`. Claude verifies registration with `claude mcp list`.

After all steps succeed, Claude tells the user to restart Claude Code so the MCP server becomes active.

## Script behavior

- **`common.sh`** — sourced by other scripts. Provides `log`, `warn`, `fail`, `require_cmd`, `detect_platform`, and `ensure_path_export`.

- **`preflight.sh`** — validates required tools (`curl`, `uname`, `claude`, plus `tar` or `unzip` depending on platform). Detects and exports `PLATFORM_OS` and `PLATFORM_ARCH`.

- **`install-cli.sh`** — downloads XMLUI CLI from GitHub releases based on OS/arch:
  - Linux x64: `xmlui-linux-x64.tar.gz`
  - macOS arm64: `xmlui-macos-arm64.tar.gz`
  - macOS Intel: `xmlui-macos-intel.tar.gz`
  - Windows x64: `xmlui-win-x64.zip`
  - Installs to `~/.local/bin` (Unix) or `~/bin` (Windows Git Bash)
  - Adds install dir to shell rc file if not already on PATH
  - Handles macOS quarantine via `xattr -d com.apple.quarantine`

- **`configure-mcp.sh`** — verifies `xmlui` is on PATH, then runs `claude mcp add xmlui -- xmlui mcp`. Exits non-zero with a clear message on failure.

- **`dev-setup.sh`** — fully flag-driven, no interactive prompts:
  - `--tracing=yes|no` (default: no)
  - `--project-name=NAME` (default: `xmlui-hello-world` or `xmlui-hello-world-tracing`)
  - Runs `xmlui new <name>` to create the project from a remote template
  - Prints the command to start the dev server; does not start it

## Key design decisions

- **Claude-first, scripts-second** — `SKILL.md` is the authoritative guide. Scripts are non-interactive executors. Claude asks questions, decides what to run, and handles failures. Scripts never prompt the user.

- **`${CLAUDE_SKILL_DIR}` for script paths** — all script references in `SKILL.md` use `${CLAUDE_SKILL_DIR}/scripts/`, which resolves to an absolute path at runtime regardless of the user's working directory.

- **Proper plugin format** — uses `.claude-plugin/plugin.json` and `skills/<name>/SKILL.md` (not the legacy `commands/` format). Loaded with `claude --plugin-dir` during development; distributable via marketplace.

- **Frontmatter controls** — `disable-model-invocation: true` prevents Claude from triggering setup automatically during unrelated conversations. `allowed-tools: Bash` pre-approves shell execution so the user is not prompted on every script call.

- **Fallback instructions in the skill** — each step includes manual commands Claude can use if the script fails, so no step is a hard dependency on the script succeeding.

- **MCP restart at the end** — restarting Claude Code is required only once, at the very end, after all other setup is confirmed complete.
