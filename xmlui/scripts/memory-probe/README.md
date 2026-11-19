# memory-probe

Measures how much renderer memory an XMLUI app costs as it grows, with no host-app code, to separate XMLUI's cost per component and binding from an app's own.

It was written for Bram's pane ([judell/bram#482](https://github.com/judell/bram/issues/482)). A layer-by-layer bisect of the pane found +294 MB for its always-visible markup, but only about 360 DOM elements and about 60 MB of live JS objects. The bisect splits cost by app layer, while XMLUI does the work in every layer: parsing, compiling bindings, creating containers and styles. This probe asks what XMLUI alone costs at that scale.

## What it measures

`gen-app.mjs` generates a standalone app with **N rows**. Each row is an `HStack` with its own `var.` and a `when`, three `Text`s with bindings, a `Button` with a handler, and a `RowCard` user-defined component (a `Card` with a var, a `Text`, a `Button` and a conditional `Text`). Every 10th row adds a `DataSource` that reads a local JSON file. One row is about 11 elements and 8 bindings, so 400 rows are about 4,400 elements, against roughly 2,150 tags and 2,170 bindings across all of Bram's markup.

A variant is `ROWS:COMPILE[:unmounted]`:

- `COMPILE` is `on` or `off`, setting `xmluiConfig.compileScripts`;
- `unmounted` wraps the rows in `<VStack when="{false}">`, so they are named in the markup but never mount.

`measure.cjs` loads the app in **Playwright's WebKit**, the engine of Safari and of Bram's WKWebView, without touching your own Safari. It finds the page's new web-content process and samples its macOS `footprint` every 30 s for 180 s. It reports:

- the median of the last three samples;
- the reclaimable total, meaning memory freed but not yet returned to macOS;
- the largest dirty categories (JavaScriptCore heap, JIT, WebKit malloc, graphics layers…);
- the DOM size, and whether the page rendered.

Read `footprint`, not RSS: RSS also counts reclaimable memory. `memory_pressure -S` does nothing measurable without root, per Bram's 2026-11-18 test, so reclaimable is read from `footprint` instead.

## Running it

```sh
npx playwright install webkit     # once
cd xmlui
BUNDLE=dist/standalone/xmlui-standalone.umd.js scripts/memory-probe/probe.sh            # 0:on 0:off 400:on 400:off
RUNS=3 scripts/memory-probe/probe.sh 0:on 150:on 400:on 400:on:unmounted
SETTLE=60 RUNS=1 scripts/memory-probe/probe.sh 50:on                                     # quick smoke test
```

Each run opens and closes a WebKit window. Use `HEADLESS=1` to run without one, but headless renders without the compositing a real window has, so its numbers aren't comparable with a window's. The run's results are in `$OUT/results.jsonl`, one line per run. A summary table is printed at the end.

## Results (2026-11-18 baseline)

Bundle `b29fe585…` (main plus the #3941 read sets and read-scoped rendering with the switch off, #3960 and #3969). Playwright WebKit build 2227 and Chromium, macOS 26.6, Apple M5. Medians of 3 runs, 180 s settle in WebKit, 120 s in Chromium. Discussion: [#3969](https://github.com/xmlui-org/xmlui/issues/3969).

**Memory grows about linearly with mounted elements, about 7× faster in WebKit than in Chromium:**

| app | DOM elements | WebKit, `compileScripts` on | WebKit, off | Chromium (on) | Chromium JS heap after GC |
|---|---|---|---|---|---|
| 0 rows | 27 | 140 MB | 139 MB | 72 MB | 30 MB |
| 50 rows | 435 | 369 MB | 423 MB | 104 MB | 53 MB |
| 400 rows | 3,270 | 1,348 MB | 1,214 MB | not run | not run |

In WebKit 97–98% of it is "WebKit malloc" and JIT code is under 10 MB. `compileScripts` isn't consistent either way (it uses less at 50 rows and more at 400).

**Ruled out:**

- **CSS custom properties.** Plain HTML with 2,100 variables on `:root`, with and without each class redeclaring 22 of them, costs 17 MB at 393 elements and 29 MB at 2,913 elements in WebKit, the same both ways (31 / 39–40 MB in Chromium).
- **Unopened tabs.** 17 tab components named in `<Page>`s but never opened: 74–75 MB against 70–73 MB not named (Chromium). XMLUI does fetch all 17 component files at startup.

**What it is: startup churn.** Chromium's sampling heap profiler, with collected objects included, from load to settled: 0 rows allocate 188–190 MB to keep 30 MB; 50 rows allocate 592 MB to keep 53 MB. So 50 rows churn about 400 MB to keep 23 MB, roughly 8 MB per row. WebKit appears to hold far more of it. The per-instance allocators at 50 rows:

| allocator | MB |
|---|---|
| layout-property resolution (`resolveLayoutProps`: 96 properties × 7 breakpoint keys per component per render) | 71 |
| `useCombinedState` (its memo never hits: it depends on the rest-parameter array) | 32 |
| `useComponentThemeClass` (theme-variable object rebuilt per instance) | 14 |
| style-registry keys (sorted-key stringify per style object) | 14 |
| symbol-keyed props memo | 14 |
| `shallowCompare` (`Reflect.ownKeys` arrays) | 13 |
| per-instance binding setup | 10 |
| built-ins called by the above (`join`, `entries`, iterators, `Set.add`) | about 60 |

Theme color scales (33 MB) are a fixed cost, the same at 0 and 50 rows.

These numbers are the "before" for the churn fixes (`xmlui-churn-layout-resolver`, `xmlui-churn-combined-state`, `xmlui-churn-theme-style`). Rerun the same variants after each fix.

Still running when this was written: WebKit with a 10-minute settle at 0 and 50 rows, to see whether the held memory falls on its own.
