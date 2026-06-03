# Benchmark: `computedGlobalUses` Narrowing — Field Evidence

Measured render savings from the `computedGlobalUses` optimization on a real
XMLUI application across multiple development milestones.

---

## What this measures

The optimization goal: when a global variable changes (e.g. the user changes the
sort order), only components that **actually display** that variable should re-render.
Components unrelated to sort order should be skipped entirely.

The benchmark runs each user action twice — once with the optimization ON and once
with it OFF (via `window.__XMLUI_COMPUTED_USES_DISABLED`) — and compares the number
of `StateContainer` re-renders triggered. A "saved" render means a container fired
under OFF but was completely skipped under ON.

**Test app:** myworkdrive — a real-world file manager with ~77 containers on the
main files screen and a `Globals.xs` with ~10 reactive global variables (sort order,
view mode, selection state, bookmarks, etc.). Good stress-test: many components
(sidebar, drawers, modal dialogs) are unrelated to most globals and should benefit
from narrowing.

**Methodology:** snapshot-delta — snapshot `window.__renderCounts` before and after
the action, diff the two. This measures only renders *caused* by the action, not
total-since-mount. Spec: `myworkdrive/traces/specs/benchmark-render-counts.spec.ts`.

---

## E.1 — Pre-§10 coverage audit (2026-06-01)

Of **77** containers on the `/my-files` screen:

| Outcome | Count | Runtime effect |
|---|---|---|
| `computedGlobalUses` **set** | **2** | Protected — re-renders only on globals it reads |
| Reads globals but **suppressed** | **46** | `undefined` → full `globalVars` forwarded → re-renders on every global change |
| Reads no globals | **29** | Same (undefined → all globals forwarded, no change detection) |

Only 2 of 77 containers benefited from global narrowing. The 46 suppressed ones broke
down as:

| Suppression reason | Count |
|---|---|
| `hasUnresolvableImports` (cross-`.xs` imports not resolved) | **35** |
| `dependsOnParentFunction` (parent fn dep-set unknown) | **11** |
| `hasInvalidStatements` | 0 |

---

## E.2 — Pre-§10 benchmark: 0% savings (2026-06-01)

With 75 of 77 containers having `computedGlobalUses = undefined`, ON and OFF behaved
identically — the 2 protected containers happened to read the globals that changed in
every scenario, so they re-rendered anyway.

| Scenario | OPT ON | OPT OFF | Saved |
|---|---|---|---|
| Sort change | 124 | 124 | **0%** |
| View switch | 28 | 28 | **0%** |
| Right-click selection | 52 | 52 | **0%** |
| Folder navigation | 88 | 88 | **0%** |
| Favorites toggle | 944 | 944 | **0%** |

The optimization was correct and regression-free, but had no measurable effect until
§10 and §11 unblocked the 46 suppressed containers.

---

## E.3 — Post-§10 + §11 benchmark (2026-06-03)

After §10 (parent-function global propagation), §11 (cross-`.xs` import resolution),
and the two-pass compound-`globalDepsUsed` fix:

| Scenario | OPT ON | OPT OFF | Saved |
|---|---|---|---|
| S1 — sort (sortBy/sortDirection) | 62 | 66 | **4 (6%)** |
| S2 — view switch (view) | 14 | 16 | **2 (13%)** |
| S3 — right-click selection (catalogSelection) | 11 | 11 | **0 (0%)** |
| S4 — folder navigation (fileEntries + $queryParams) | 22 | 28 | **6 (21%)** |
| S5 — favorites toggle (bookmarks) | 118 | 127 | **9 (7%)** |

**Only component eliminated in all scenarios:** `Drawer#versionsDrawer` (4–9 renders
saved per action). All file-list row containers (DesktopNameCell, Link, Badge, etc.)
fire identically ON and OFF.

**Why savings are still small:** the file-list rows genuinely READ the changed global
in their templates (`sortBy`, `bookmarks`, `view` to render row content). The optimizer
correctly assigns `computedGlobalUses = ["sortBy"]` to them — they must re-render.
This is not a narrowing gap; it is an architectural characteristic of this app's
rendering. See item 12 in `TODO-computedGlobalUses-improvements.md` for the
investigation path via the parent-state `computedUses` channel.

---

## Key takeaway

`computedGlobalUses` narrowing is working correctly after §10 + §11. The current
savings ceiling in myworkdrive is low (~6–21% per action) because the heavy-hitter
components — file-list row cells — directly reference the globals that change. Further
gains require either (a) investigating parent-state `computedUses` narrowing for
`Table`/`TileGrid` containers, or (b) narrowing Globals.xs **functions** (item 3 in
the TODO).
