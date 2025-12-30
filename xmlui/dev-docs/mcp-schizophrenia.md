# MCP config schizophrenia

```
ls -l ~/Desktop/configs/
```

## Owned configuration (symlinks):

```
lrwxr-xr-x  1 jonudell  staff   34 Dec 29 21:57 copilot-codex.toml -> /Users/jonudell/.codex/config.toml
lrwxr-xr-x  1 jonudell  staff   32 May 11  2025 cursor-mcp.json -> /Users/jonudell/.cursor/mcp.json
```

## Supplied configuration (real files):

```
-rw-r--r--@ 1 jonudell  staff  956 May 11  2025 claude-mcp.json
-rw-r--r--@ 1 jonudell  staff  968 Aug 20 00:44 copilot-mcp.json
-rw-r--r--@ 1 jonudell  staff  884 Sep 16 13:34 kiro-mcp.json
```

| Dimension                | Owned configuration                              | Supplied configuration                          |
|--------------------------|--------------------------------------------------|-------------------------------------------------|
| System of record         | The tool                                         | You                                             |
| Who chooses location     | Tool                                             | You                                             |
| Who chooses filename     | Tool                                             | You                                             |
| Who chooses format       | Tool                                             | You                                             |
| Who may mutate the file  | Tool                                             | You                                             |
| Discovery mechanism      | Implicit (fixed path, auto-loaded)               | Explicit (passed in / selected by you)          |
| Canonical copy lives at  | Tool-defined path (e.g. `~/.codex/config.toml`)  | Wherever you place it                           |
| Desktop representation  | Symlink only                                     | Real file                                       |
| Risk if duplicated       | Breakage or silent drift                         | None (you control lifecycle)                    |
| Cost of indirection      | Necessary                                        | Unnecessary                                     |
| Example in your setup    | `copilot-codex.toml`, `cursor-mcp.json`          | `claude-mcp.json`, `copilot-mcp.json`, `kiro-mcp.json` |

