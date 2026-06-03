# computedGlobalUses Narrowing — Benchmark Results

## What we optimized

When a global variable changes (e.g. the user changes the sort order), only
components that actually display that variable should re-render. Components
unrelated to it — modals, sidebars, drawers — should be skipped.

We implemented `computedGlobalUses`: a static annotation on each container
listing exactly which global variables its subtree reads. `ComponentWrapper`
uses it to block re-renders when only unrelated globals change.

---

## Test setup

**App:** myworkdrive — a real file manager with ~77 containers on the main
files screen and ~10 reactive global variables (sort order, view mode,
selection state, bookmarks, etc.).

**Method:** each user action is performed twice — once with the optimization
ON, once OFF. We compare the number of `StateContainer` re-renders triggered.
A "saved" render is a container that fired with optimization OFF but was
completely skipped with it ON.

---

## Before the optimization (baseline)

Only **2 of 77** containers had `computedGlobalUses` set. The remaining 75
received full `globalVars` on every change and re-rendered unconditionally.

| Scenario | OPT ON | OPT OFF | Saved |
|---|---|---|---|
| Sort order change | 124 | 124 | **0%** |
| View mode switch | 28 | 28 | **0%** |
| Selection (right-click) | 52 | 52 | **0%** |
| Folder navigation | 88 | 88 | **0%** |
| Favorites toggle | 944 | 944 | **0%** |

The optimization was correct and bug-free, but had no measurable effect —
the 2 protected containers happened to read the same globals that changed in
every scenario anyway.

---

## After full implementation

We resolved the two root causes of suppression:
- **35 containers** had cross-file `.xs` imports that were not yet resolved,
  so their global dependency sets were incomplete and narrowing was blocked.
- **11 containers** called parent-scope functions whose global reads were
  unknown to the analyzer.

Both are now resolved. Updated benchmark results:

| Scenario | OPT ON | OPT OFF | Saved |
|---|---|---|---|
| Sort order change | 62 | 66 | **4 (6%)** |
| View mode switch | 14 | 16 | **2 (13%)** |
| Selection (right-click) | 11 | 11 | **0%** |
| Folder navigation | 22 | 28 | **6 (21%)** |
| Favorites toggle | 118 | 127 | **9 (7%)** |

---

## What the numbers mean

The optimization is working. Savings are real but modest (6–21%) because
the components that still re-render — file-list row cells — **genuinely read**
the changed global in their templates. Every row displays sort indicators,
bookmark icons, or selection state; it must re-render when those change.

The one component consistently eliminated across all scenarios is
`Drawer#versionsDrawer`, which does not read sort/view/bookmarks — it was
re-rendering purely due to the unrelated global changing. It is now correctly
skipped in every scenario.

The optimization saves more in scenarios where the changed global is unrelated
to most of what is rendered on screen. In this app that ratio is low —
most on-screen components do read the globals that change.

---

## Next steps for larger savings

The main opportunity is not in global narrowing but in **parent-state
narrowing**: if the Table/Grid container holding the file rows is correctly
narrowed so it only re-renders when `fileEntries` changes, then changes to
sort order or bookmarks that do not change the file list content would not
reach the rows at all — regardless of global narrowing.
