# Reload Memory Optimization Plan

## Context

Users reported that the XMLUI docs page at `/docs/guides/layout` can reach about
`482 MB` after first load and scroll, then slowly climb to about `1.1 GB` after
refreshing the page without further interaction.

The current investigation reproduced the important shape of the issue in local
SSG preview:

- Forced-GC JS heap and ComponentDef counts stayed mostly stable across reloads.
- Chromium process RSS, especially renderer RSS, grew after reloads.
- The growth correlated strongly with many simultaneously live `xmlui-pg`
  embedded apps and shadow roots.
- The no-scroll control showed much smaller RSS growth.

This suggests the remaining issue is mostly renderer/native memory pressure from
live embedded apps, not retained XMLUI `ComponentDef` debug/source metadata.

## Current Measurements

Measured on local SSG preview for `http://localhost:3000/docs/guides/layout`.

| Scenario | JS + embedder heap | Chromium process RSS | Active shadow roots | Notes |
| --- | ---: | ---: | ---: | --- |
| Before offscreen hibernation, after full scroll | ~306 MB | ~980 MB | 35 | All playgrounds mounted. |
| Before offscreen hibernation, after 5 reloads | ~305 MB | ~1.12 GB | 35 | Reproduces user-reported direction. |
| No-scroll control, after 5 reloads | ~115 MB | ~758 MB | 1 | Confirms scroll/mount correlation. |
| With offscreen hibernation prototype, after full scroll | ~135-146 MB | ~802-807 MB | 3-4 | Significant reduction. |
| With offscreen hibernation prototype, after 5 reloads | ~142 MB | ~937 MB | 3-4 | Improved but RSS not eliminated. |
| With offscreen hibernation prototype, 1 reload + 60s wait | ~137 MB | ~903 MB | 3 | No return to ~1.1 GB in this run. |

The hibernation prototype also kept scroll height stable at `25365` during a
12-checkpoint sweep.

## Execution Log

### 2026-07-25: Alternative 1 Formalization Pass

Scope:

- Continued with Alternative 1, "Formalize Offscreen Hibernation For
  Never-Interacted Lazy Playgrounds".
- No broader alternatives were started.

Code changes:

- Named the lazy nested-app hibernation constants in
  `xmlui/src/components/NestedApp/NestedAppReact.tsx`:
  - `LAZY_NESTED_APP_ROOT_MARGIN = "800px 0px"`,
  - `MIN_LAZY_NESTED_APP_PLACEHOLDER_HEIGHT = 1`.
- Avoided recreating the `IntersectionObserver` on every lazy mount/unmount
  transition by reading the current mount state from a ref.
- Kept the existing interaction policy:
  - lazy apps may hibernate before user interaction,
  - any focus, key, or pointer interaction marks the app as interacted,
  - interacted apps remain mounted when they move offscreen.
- Added `data-nested-app-lazy-state="mounted|hibernated"` to make the lazy
  wrapper observable in targeted tests and diagnostics.
- Added a targeted `xmlui-pg` regression test:
  - render two lazy playgrounds,
  - interact with the first,
  - scroll to the second,
  - verify the first stays attached and both lazy apps are mounted.

Validation commands:

```sh
npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts -g "xmlui-pg"
npm run build-ssg -w website
npm run preview-ssg -w website
npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --search= --checkpoints=12
npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --search= --reloads=5 --reload-wait-ms=8000 --json
npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --search= --reloads=1 --reload-wait-ms=60000 --json
```

Validation results:

| Check | Result | Notes |
| --- | --- | --- |
| Targeted `xmlui-pg` Playwright tests | Passed, `14/14` | Includes the new interacted-playground retention test. |
| Local SSG build | Passed | Existing warnings remained: lightningcss `:export`, theme value warnings, direct `eval` warning from smart gauge. No `RangeError: Invalid time value`. |
| 12-checkpoint scroll sweep | Passed | Scroll height stayed `25365`; active shadow roots stayed viewport-bounded at `0-3`, ending at `2`. |
| 5 reload measurement | Passed acceptance direction | After 5 reloads: combined heap ~`131 MB`, Chromium process RSS ~`856 MB`, active shadow roots `2`. |
| 1 reload + 60s wait measurement | Passed acceptance direction | After 60s wait: combined heap ~`131 MB`, Chromium process RSS ~`813 MB`, active shadow roots `2`. |

Measurement details:

| Scenario | Combined heap | Chromium process RSS | Active shadow roots | Scroll height | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| Formalized hibernation, checkpoint run initial | ~`113.5 MB` | ~`670 MB` | `1` | `25365` | Production-like SSG preview. |
| Formalized hibernation, checkpoint run after full scroll | ~`137.2 MB` | ~`756 MB` | `2` | `25365` | Full sweep kept active roots under `4`. |
| Formalized hibernation, 5-reload run initial | ~`113.3 MB` | ~`667 MB` | `1` | `25365` | Separate browser run. |
| Formalized hibernation, 5-reload run after scroll | ~`130.2 MB` | ~`756 MB` | `2` | `25365` | Before reload loop. |
| Formalized hibernation, after reload 1 | ~`131.7 MB` | ~`846 MB` | `2` | `25365` | Reload plus full scroll plus 8s wait. |
| Formalized hibernation, after reload 2 | ~`131.3 MB` | ~`823 MB` | `2` | `25365` | RSS varied down. |
| Formalized hibernation, after reload 3 | ~`131.4 MB` | ~`874 MB` | `2` | `25365` | Highest RSS in this reload run. |
| Formalized hibernation, after reload 4 | ~`131.0 MB` | ~`850 MB` | `2` | `25365` | No monotonic climb. |
| Formalized hibernation, after reload 5 | ~`131.2 MB` | ~`856 MB` | `2` | `25365` | Did not return to the earlier ~`1.1 GB` range. |
| Formalized hibernation, 1 reload + 60s wait | ~`131.0 MB` | ~`813 MB` | `2` | `25365` | No slow climb toward ~`1.1 GB` in this run. |

Conclusion:

- The hypothesis for Alternative 1 remains supported.
- The remaining reload issue appears to be materially reduced by keeping lazy
  docs playgrounds viewport-bounded instead of allowing all 35 embedded apps to
  remain mounted after a full scroll.
- The formalization slightly improved the measured result versus the earlier
  prototype run in this environment: the final 5-reload RSS was ~`856 MB`
  instead of the earlier prototype's ~`937 MB`, and active shadow roots ended at
  `2` instead of `3-4`.
- This still does not prove native RSS can always return to the no-scroll
  baseline; Chromium keeps some renderer allocations after reload/scroll.
  However, the measured behavior no longer reproduces the reported ~`1.1 GB`
  climb on the local production-like preview.

Stop decision:

- Stop after Alternative 1 formalization and measurements.
- Recommended next action is team/user review plus full E2E run before deciding
  whether Alternative 2, a mounted-app cap, is worth prototyping.

### 2026-07-25: Alternative 2 Mounted-App Cap Experiment

Trigger:

- Review of Alternative 1 showed that the improvement from ~`1.1 GB` to
  ~`850-900 MB` was meaningful but not sufficient.
- The no-scroll control remained around ~`758 MB`, so the next hypothesis was
  that forcing a stricter cap on mounted lazy playgrounds might close part of
  the remaining gap.

Scope:

- Prototyped Alternative 2 with an aggressive cap:
  `MAX_MOUNTED_NON_INTERACTED_LAZY_NESTED_APPS = 1`.
- The cap applied only to non-interacted lazy nested apps.
- Interacted lazy apps remained exempt to preserve the UX guarantee from
  Alternative 1.

Additional measurement support:

- Extended `website/scripts/measure-memory.mjs` to count lazy wrapper states:
  - `lazyMountedWrappers`,
  - `lazyHibernatedWrappers`.
- This diagnostic instrumentation was kept because it helps future memory
  measurements distinguish wrapper state from shadow-root count.

Validation commands:

```sh
npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts -g "xmlui-pg"
npm run build-ssg -w website
npm run preview-ssg -w website
npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --search= --checkpoints=12
npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --search= --checkpoints=4 --json
npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --search= --reloads=5 --reload-wait-ms=8000 --json
npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --search= --reloads=1 --reload-wait-ms=60000 --json
```

Validation results:

| Check | Result | Notes |
| --- | --- | --- |
| Targeted `xmlui-pg` Playwright tests with cap | Passed, `14/14` | The interacted-playground retention test still passed. |
| Local SSG build with cap | Passed | Same known warnings as before; no build-blocking error. |
| 4-checkpoint diagnostic sweep | Cap behavior confirmed | After scroll: `lazyMountedWrappers=1`, `lazyHibernatedWrappers=34`, `visibleShadowHosts=1`, scroll height `25365`. |
| 5 reload measurement | Failed to improve RSS | After reload 5: combined heap ~`128 MB`, Chromium process RSS ~`870 MB`, active shadow roots `1`. This was worse than the viewport-only hibernation run's ~`856 MB`. |
| 1 reload + 60s wait measurement | Failed to improve RSS | After 60s wait: combined heap ~`127 MB`, Chromium process RSS ~`830 MB`, active shadow roots `1`. This was worse than the viewport-only hibernation run's ~`813 MB`. |

Measurement details:

| Scenario | Combined heap | Chromium process RSS | Lazy mounted wrappers | Lazy hibernated wrappers | Active shadow roots | Scroll height | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Mounted cap, diagnostic run initial | ~`113 MB` | ~`664 MB` | `1` | `34` | `1` | `25365` | Similar to viewport-only initial. |
| Mounted cap, diagnostic run after full scroll | ~`127 MB` | ~`754 MB` | `1` | `34` | `1` | `25365` | Cap successfully reduced mounted wrappers/shadow roots. |
| Mounted cap, 5-reload run after scroll | ~`125 MB` | ~`750 MB` | `1` | `34` | `1` | `25365` | Before reload loop. |
| Mounted cap, after reload 1 | ~`127 MB` | ~`849 MB` | `1` | `34` | `1` | `25365` | Reload plus full scroll plus 8s wait. |
| Mounted cap, after reload 2 | ~`127 MB` | ~`861 MB` | `1` | `34` | `1` | `25365` | RSS rose despite cap. |
| Mounted cap, after reload 3 | ~`127 MB` | ~`854 MB` | `1` | `34` | `1` | `25365` | No improvement over viewport-only. |
| Mounted cap, after reload 4 | ~`127 MB` | ~`865 MB` | `1` | `34` | `1` | `25365` | Slightly worse than viewport-only run. |
| Mounted cap, after reload 5 | ~`128 MB` | ~`870 MB` | `1` | `34` | `1` | `25365` | Worse than viewport-only ~`856 MB`. |
| Mounted cap, 1 reload + 60s wait | ~`127 MB` | ~`830 MB` | `1` | `34` | `1` | `25365` | Worse than viewport-only ~`813 MB`. |

Conclusion:

- The mounted-app cap hypothesis is not supported by the measurements.
- The cap successfully reduced active lazy apps from `2-3` to `1`, and reduced
  combined heap modestly, but Chromium process RSS did not improve.
- This suggests the remaining reload RSS is not dominated by the difference
  between one versus two or three live lazy playgrounds. It is more likely tied
  to Chromium renderer allocation behavior after repeated mount/reload cycles,
  shared bundle/CSS/native allocations, or other page-level costs.
- Because the cap adds coordination complexity and did not improve the main
  metric, it should not be kept as an optimization.

Stop decision:

- Reverted the mounted-app cap runtime prototype.
- Kept only the diagnostic measurement additions for lazy wrapper state counts.
- Stop after Alternative 2 measurement and review before moving to a higher-risk
  or UX-changing alternative.

## Goal

Reduce or eliminate the reload-driven memory climb for docs pages with many
embedded XMLUI playgrounds, while preserving:

- stable scroll geometry,
- predictable remount behavior,
- working docs examples,
- no data/state loss after explicit user interaction unless designed and
  documented,
- production/SSG behavior that can be verified locally before deployment.

## Alternatives

### 1. Formalize Offscreen Hibernation For Never-Interacted Lazy Playgrounds

Hypothesis:

Keeping only viewport-near lazy playgrounds mounted, while preserving the
reserved frame height, removes most live shadow-root/native renderer pressure
without changing the authoring model.

Expected impact:

- High.
- Already measured as reducing active shadow roots from `35` to `3-4`.
- Reduced JS + embedder heap by roughly `160 MB` after full scroll.
- Reduced reload RSS peak by roughly `180 MB` in the 5-reload local run.

Risks:

- Remount latency when scrolling back.
- Loss of internal playground state for never-interacted examples.
- False "interaction" detection could either preserve too much memory or discard
  state unexpectedly.
- IntersectionObserver behavior may differ slightly across browsers.

Validation without deployment:

1. Build local SSG preview:
   ```sh
   npm run build-ssg -w website
   npm run preview-ssg -w website
   ```
2. Run checkpoint measurement:
   ```sh
   npm run measure:memory -w website -- \
     --url http://localhost:3000/docs/guides/layout \
     --search= \
     --checkpoints=12
   ```
3. Run reload measurement:
   ```sh
   npm run measure:memory -w website -- \
     --url http://localhost:3000/docs/guides/layout \
     --search= \
     --reloads=5 \
     --reload-wait-ms=8000 \
     --json
   ```
4. Run slow-climb measurement:
   ```sh
   npm run measure:memory -w website -- \
     --url http://localhost:3000/docs/guides/layout \
     --search= \
     --reloads=1 \
     --reload-wait-ms=60000 \
     --json
   ```
5. Run targeted regression tests:
   ```sh
   npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts -g "xmlui-pg"
   ```

Acceptance criteria:

- Scroll height remains stable during checkpoint sweep.
- Active shadow roots stay viewport-bounded after full scroll, ideally under `5`.
- 5-reload Chromium process RSS does not climb back toward `1.1 GB`.
- User-interacted playgrounds remain mounted after interaction.
- Targeted `xmlui-pg` tests pass.

Stop condition:

- Stop after this measurement set and review with the team before broadening or
  tightening hibernation rules.

### 2. Add A Concurrent Mounted Playground Cap With LRU Hibernation

Hypothesis:

The current viewport-based hibernation still allows memory to depend on viewport
geometry and root margin. A global cap, for example `maxMountedLazyNestedApps`,
would make memory behavior more deterministic.

Expected impact:

- High and more predictable than viewport-only hibernation.
- Could guarantee an upper bound such as `3-5` mounted lazy playgrounds per page.

Risks:

- More coordination logic.
- Must not unmount interacted playgrounds unless a state persistence design
  exists.
- A page with many interacted playgrounds can still exceed the cap unless the
  UX explicitly allows hibernating interacted apps.

Validation without deployment:

- Reuse the same SSG preview and reload measurements as Alternative 1.
- Add an interaction-specific Playwright test:
  - scroll to a playground,
  - interact with it,
  - scroll far away,
  - confirm it remains mounted or preserves user-visible state according to the
    chosen policy.
- Add a "many examples" measurement that records max active shadow roots through
  a full sweep.

Acceptance criteria:

- Active shadow roots never exceed the configured cap plus interacted exceptions.
- Scroll height remains stable.
- Interacted examples behave according to the documented policy.
- Reload RSS improves beyond Alternative 1 or becomes materially less variable.

Stop condition:

- Stop after comparing capped hibernation against viewport-only hibernation.

### 3. Make Docs Playground Rendering Explicitly On-Demand

Hypothesis:

The only way to eliminate renderer/native memory pressure from unused examples is
to avoid mounting embedded apps until the reader asks for the live preview.

Possible UX shapes:

- Static code block plus "Run preview" affordance.
- Lightweight rendered placeholder with fixed height.
- Auto-run only the first or currently visible example.

Expected impact:

- Very high for initial and reload memory.
- Can reduce active shadow roots to `0-1` until user action.

Risks:

- Significant documentation UX change.
- Examples are no longer immediately live.
- Requires careful wording and maybe screenshots/placeholders.
- Could reduce the perceived value of interactive docs.

Validation without deployment:

- Prototype behind a local feature flag, e.g. query param or build-time flag.
- Measure:
  ```sh
  npm run measure:memory -w website -- \
    --url http://localhost:3000/docs/guides/layout?playgrounds=manual \
    --search= \
    --reloads=5 \
    --reload-wait-ms=8000 \
    --json
  ```
- Add Playwright tests for:
  - placeholder visible,
  - clicking "Run" mounts the app,
  - explicit height is preserved before and after mount.

Acceptance criteria:

- Initial active shadow roots are `0` or `1`.
- Reload RSS is close to no-scroll baseline.
- The first-run interaction is clear and fast enough for docs use.

Stop condition:

- Stop after UX review; do not adopt broadly without product/design agreement.

### 4. Replace Per-App Shadow Roots With A Shared Or Lighter Style Boundary

Hypothesis:

Even with shared constructed stylesheets, each shadow root and nested React app
has renderer/native cost. Reducing the number or weight of style boundaries may
reduce RSS without hibernating apps.

Possible implementations:

- Shared style root for docs playgrounds.
- Light DOM rendering mode for trusted docs examples.
- A cheaper style reset path for nested apps that do not need full isolation.

Expected impact:

- Medium to high, but uncertain.
- Could improve both fully mounted and hibernated cases.

Risks:

- Theming/style leakage between host docs and playgrounds.
- Harder to reason about component isolation.
- Larger regression surface than hibernation.

Validation without deployment:

- Prototype behind a local prop/flag.
- Use visual Playwright screenshots for representative docs examples.
- Measure full-scroll and reload RSS with all playgrounds mounted.
- Compare CSS/theme regression tests if available.

Acceptance criteria:

- No visible style leakage in representative examples.
- Full-scroll RSS improves materially even with many active playgrounds.
- Existing nested app/theming tests pass.

Stop condition:

- Stop after feasibility measurement. Only continue if memory gains are large
  enough to justify isolation risk.

### 5. Persist And Restore Playground State Across Hibernation

Hypothesis:

If user-interacted playgrounds can safely serialize minimal state, hibernation
can apply more aggressively without data loss.

Expected impact:

- Medium.
- Enables hibernating interacted examples, but does not reduce the first
  viewport-near active set.

Risks:

- XMLUI app state may not be generally serializable.
- DataSource/API/mock state can be difficult to snapshot correctly.
- Incorrect restoration is worse than losing state because it can mislead docs
  users.

Validation without deployment:

- Start with a narrow docs-only state set, not generic XMLUI runtime state.
- Test simple inputs, selection state, and counters.
- Explicitly test unsupported cases and fallback behavior.

Acceptance criteria:

- State restoration works for documented supported examples.
- Unsupported state is either preserved by avoiding hibernation or clearly reset.
- No hidden serialization errors in console.

Stop condition:

- Treat as optional follow-up unless users strongly need interacted examples to
  survive offscreen hibernation.

### 6. Reduce The Number Of Live Examples On The Layout Page

Hypothesis:

The `/docs/guides/layout` page is an outlier because it contains many small
embedded playgrounds. Authoring changes can reduce memory without runtime
complexity.

Possible changes:

- Merge closely related examples.
- Convert low-value live examples to static XML snippets.
- Add explicit heights everywhere.
- Move some examples to secondary pages.

Expected impact:

- Medium to high on the target page.
- Low framework risk.

Risks:

- Documentation structure changes.
- Does not solve the generic problem for future dense pages.

Validation without deployment:

- Use the same SSG memory harness on the edited page.
- Run website example tests if examples with stable IDs are changed.
- Manual docs review for readability.

Acceptance criteria:

- Fewer `xmlui-pg` instances on the page.
- Lower full-scroll/reload RSS.
- No loss of critical layout teaching examples.

Stop condition:

- Do this only after runtime strategy is chosen, unless the page itself is the
  urgent production hot spot.

## Recommended Sequence

1. Baseline And Harness Finalization
   - Keep `measure:memory` reload and process-RSS support.
   - Record the current hibernation-prototype measurements as baseline.
   - Verify no unrelated process memory is included.
   - Stop and review measurements.

2. Formalize Viewport-Based Hibernation
   - Harden the existing prototype:
     - name constants for mount/hibernate root margins,
     - avoid unnecessary observer churn,
     - preserve interacted playgrounds,
     - document the behavior.
   - Validate with checkpoint, reload, slow-climb, and targeted `xmlui-pg` tests.
   - Stop and ask for E2E run.

3. Compare Against A Mounted-App Cap
   - Prototype a cap only if viewport hibernation is not sufficient.
   - Measure memory determinism and interaction behavior.
   - Stop after comparison.

4. Evaluate On-Demand Preview UX
   - Only if the target is to get close to no-scroll baseline.
   - Prototype behind a local flag.
   - Review UX before implementation.

5. Investigate Shared/Lighter Style Boundary
   - Only if hibernation still leaves unacceptable RSS.
   - Treat as higher-risk framework work.

6. Apply Documentation Authoring Changes
   - Use for hot pages or examples that do not need to be live.
   - Keep this separate from runtime changes so measurements remain attributable.

## Measurement Table To Maintain

For every experiment, record:

| Experiment | Initial combined heap | After-scroll combined heap | 5-reload combined heap | Initial RSS | After-scroll RSS | 5-reload RSS | Active shadow roots after scroll | Scroll height stable | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Baseline before change | | | | | | | | | |
| Viewport hibernation | ~`113 MB` | ~`130-137 MB` | ~`131 MB` | ~`667-670 MB` | ~`756 MB` | ~`856 MB` | `2` | Yes, `25365` | Formalized Alternative 1; 5-reload run did not return to ~`1.1 GB`. |
| Mounted cap | ~`113 MB` | ~`125-127 MB` | ~`128 MB` | ~`664 MB` | ~`750-754 MB` | ~`870 MB` | `1` | Yes, `25365` | Rejected: cap lowered active roots but did not improve RSS versus viewport-only hibernation. |
| Manual preview | | | | | | | | | |
| Shared style boundary | | | | | | | | | |
| Docs authoring changes | | | | | | | | | |

## Current Recommendation

Alternative 1 should remain the current runtime optimization: viewport-based
hibernation gives the best measured result so far without changing the docs
authoring model or playground UX.

Alternative 2 should not be kept: the mounted-app cap lowered active roots from
`2-3` to `1`, but did not improve Chromium RSS and added coordination
complexity.

The remaining options with a realistic chance of further significant RSS
reduction are no longer small runtime tweaks:

1. Prototype Alternative 3, explicit/on-demand playground preview, behind a
   local-only flag. This is the most likely route toward the no-scroll baseline
   because unused examples would not mount at all.
2. If that UX is not acceptable, try Alternative 6 on the hot page: reduce or
   consolidate live examples in `website/content/docs/pages/layout.md`.
3. Keep Alternative 4, shared/lighter style boundary, as a later and higher-risk
   framework investigation. It may help, but the isolation regression surface is
   broader than the docs-specific alternatives.

Stop here before starting Alternative 3, because it changes the documentation
experience and should be explicitly approved before implementation.

## Process-Lifetime Diagnostics

Added after the first two runtime experiments, because Alternatives 3 and 6 are
harder to apply in practice and we need a more precise explanation for why RSS
still remains high after refresh.

Question:

- Does reload growth mean the previous XMLUI app/DOM/React tree is still live?
- Or does the browser keep native renderer memory after the page has been
  torn down?

Diagnostic method:

- Extend `website/scripts/measure-memory.mjs` with `--lifetime-diagnostics`.
- Run against the local SSG preview, not dev server:
  - `npm run build-ssg -w website`
  - `npm run preview-ssg -w website`
  - `npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --search= --reloads=1 --reload-wait-ms=8000 --lifetime-diagnostics --json`
- Sequence measured:
  1. initial load,
  2. scroll to page bottom,
  3. one reload and scroll,
  4. navigate same tab to `about:blank`,
  5. close the tab/page,
  6. open a new page in the same browser process,
  7. scroll the new page to the bottom.

Results from 2026-07-25:

| Step | Used JS heap | XMLUI/DOM evidence | Browser process tree RSS | Renderer RSS | Interpretation |
| --- | ---: | --- | ---: | ---: | --- |
| Initial | `77.98 MB` | `15,512` React fibers, `5,493` ComponentDefs, `1` mounted lazy wrapper | `704.5 MB` | `484.7 MB` | Normal first render with hibernation active. |
| After scroll | `95.11 MB` | `15,561` fibers, `5,466` ComponentDefs, `2` mounted wrappers | `789.6 MB` | `553.3 MB` | Hibernation keeps live app count low; RSS still rises while rendering/scrolling. |
| After reload 1 | `95.18 MB` | Same live shape as after scroll; `2` mounted wrappers | `893.7 MB` | `662.0 MB` | Reload increases renderer RSS without increasing live XMLUI/DOM counters. |
| After `about:blank` | `0.98 MB` | `0` React fibers, `0` ComponentDefs, `0` playgrounds, `3` DOM nodes | `655.2 MB` | `423.5 MB` | The previous XMLUI app is torn down; renderer/native RSS remains reserved. |
| After tab close | n/a | Page closed | `205.0 MB` | Renderer gone | Closing the page destroys the renderer and releases the retained RSS. |
| New page, same browser, initial | `78.00 MB` | Same as original initial; new renderer PID | `707.5 MB` | `481.7 MB` | A fresh renderer returns to the original baseline inside the same browser. |
| New page, same browser, after scroll | `95.12 MB` | Same as original after-scroll shape | `800.9 MB` | `550.8 MB` | Reproduces normal post-scroll cost, not the elevated post-reload cost. |

Conclusion:

- The reload symptom is not explained by stale XMLUI `ComponentDef` objects,
  React fibers, shadow hosts, or DOM nodes remaining reachable after navigation.
  The `about:blank` sample drops those counters to zero.
- The memory that remains after reload is mostly renderer-process RSS retained
  below the live JS/DOM object graph. This is consistent with Chromium/V8/native
  allocator, layout/style, raster, font, code, or embedder-side caches.
- Closing the tab/page releases the high RSS because the renderer process exits.
  Opening a new tab in the same browser creates a new renderer and returns to the
  first-load baseline.

Implication:

- More hibernation/capping inside the same page can reduce the live app cost, but
  it is unlikely to eliminate the reload-retained RSS while Chromium keeps
  reusing the same renderer process.
- Alternatives that merely reduce active mounted playgrounds have already shown
  diminishing returns.
- The remaining high-impact options are process-boundary or navigation-lifetime
  changes:
  1. isolate heavy playgrounds or the whole docs content route into a disposable
     browsing context, if the UX and architecture can tolerate it;
  2. avoid repeated same-renderer reloads for this heavy page in production
     workflows, where possible;
  3. reduce first-render/native renderer cost by changing the page content
     itself, but that is an authoring/product tradeoff.

Stop condition:

- Stop here and review with the team before implementing process-boundary
  changes, because the measurements suggest the remaining issue is not a simple
  live-object leak in XMLUI runtime code.

## Reload-Mode Deep Dive

Added after deciding that iframe/process-boundary work and immediate docs
authoring changes are not currently practical. The goal is narrower: understand
whether same-tab refresh growth can be stopped without changing the embedded app
UX.

Diagnostic additions:

- `website/scripts/measure-memory.mjs` now supports `--reload-mode`:
  - `direct`: normal `page.reload()`.
  - `about-blank`: navigate to `about:blank`, then back to the target URL.
  - `new-page`: close the current page and open a new page in the same browser.
- It also supports `--pagehide-cleanup`, a diagnostic-only injection that clears
  shadow roots and `adoptedStyleSheets` during `pagehide`.

Commands:

- `npm run preview-ssg -w website`
- `npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --search= --reloads=5 --reload-mode=direct --reload-wait-ms=5000 --json`
- `npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --search= --reloads=5 --reload-mode=about-blank --reload-wait-ms=5000 --json`
- `npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --search= --reloads=5 --reload-mode=new-page --reload-wait-ms=5000 --json`
- `npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --search= --reloads=5 --reload-mode=direct --reload-wait-ms=5000 --pagehide-cleanup --json`

Results from 2026-07-25:

| Experiment | Initial RSS | After-scroll RSS | Reload 1 RSS | Reload 5 RSS | Renderer behavior | Live XMLUI shape | Interpretation |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| `direct` reload | `706.0 MB` | `800.9 MB` | `893.5 MB` | `911.6 MB` | Same renderer PID across reloads | Stable: about `15.5k` fibers, `5.5k` ComponentDefs, `2` mounted lazy wrappers | Reproduces the refresh symptom. RSS grows while the live app shape does not. |
| `about-blank` between loads | `703.5 MB` | `790.0 MB` | `885.3 MB` | `907.9 MB` | Same renderer PID | Stable live shape | Navigating through `about:blank` tears down the document but does not force a new renderer; it does not solve RSS retention. |
| `new-page` per cycle | `701.8 MB` | `797.7 MB` | `804.1 MB` | `816.8 MB` | New renderer PID on each cycle | Stable live shape | Closing the page creates a fresh renderer and prevents the large same-renderer accumulation. |
| `direct` + diagnostic `pagehide` cleanup | `701.7 MB` | `790.7 MB` | `884.5 MB` | `916.3 MB` | Same renderer PID | Stable live shape | Clearing shadow DOM/adopted styles on `pagehide` does not reduce the retained RSS. |

Conclusions:

- The refresh growth follows renderer-process lifetime, not XMLUI object
  lifetime.
- `about:blank` is not enough because Chromium keeps the same renderer alive.
- Explicitly clearing nested app shadow DOM and adopted styles before navigation
  does not materially reduce the retained RSS.
- A true renderer replacement, simulated by closing the page and opening a new
  one, keeps repeated cycles close to the normal after-scroll baseline.

Current options if Alternatives 3 and 4 are not currently viable:

1. Keep the viewport hibernation runtime optimization and accept that same-tab
   browser refresh can retain renderer RSS. This is the lowest-risk option but
   does not remove the observed browser memory symptom.
2. Investigate browser-level mitigations only for controlled environments
   (kiosk/Electron/test harness), because ordinary websites cannot force Chrome
   to discard and recreate the current tab's renderer on user refresh.
3. Reduce first-render/native renderer cost later by reducing the number of live
   embedded apps on the page. This will lower both the baseline and the amount of
   memory that a reused renderer can retain, but it is content work.
4. Continue native-memory profiling with Chrome tracing/heap profiler categories
   to identify whether the retained RSS is style/layout, V8/code, raster/GPU, or
   another embedder bucket. This may improve understanding, but the current
   measurements already suggest limited room for a pure XMLUI cleanup fix.

Stop condition:

- Stop before implementing any browser-lifecycle workaround. The only measured
  mitigation that stops accumulation is renderer replacement, which a normal
  website cannot reliably force during a user-triggered refresh.

## Theme Variable / CSSOM Hypothesis

Added after reviewing the layout page structure and the suspicion that embedded
apps render implicit `Theme` roots with large CSS custom-property sets.

Question:

- Do the many embedded `xmlui-pg` apps multiply large theme-variable CSS blocks?
- Is this DOM memory, or more likely CSSOM/native style memory contributing to
  renderer RSS?

Static page structure:

- `website/content/docs/pages/layout.md` contains `35` `xmlui-pg` fences.
- None of those fences contains an explicit markup-level `<Theme>`.
- `12` of the `35` examples contain an explicit `<App>` root; the rest are
  still wrapped by `AppRoot` at runtime.

Runtime/source structure:

- `AppRoot` always wraps the application node in an implicit root `Theme`:
  `{ type: "Theme", props: { root: true }, children: [node] }`.
- `AppWithCodeViewReact` forwards the host site's theme list and active theme
  into the nested playground:
  - `effectiveConfig.themes = config.themes + allThemes`
  - `effectiveActiveTheme = activeTheme || config.defaultTheme || activeThemeId`
- `NestedApp` creates a fresh shadow root and `StyleProvider forceNew={true}` for
  every mounted playground.
- `NestedAppRoot` receives the parent app's `theme.themeStyles` and generates a
  reset class that sets every parent theme CSS variable to `initial`:
  `Object.keys(themeStylesToReset).forEach((key) => vars[key] = "initial")`.

Build-artifact evidence from `website/dist-ssg/docs/guides/layout/index.html`:

| Item | Value |
| --- | ---: |
| HTML size | `904,240` bytes |
| `nestedApp` occurrences | `35` |
| `--xmlui-*` occurrences | `6,318` |
| `<style>` tags | `3` |
| `data-style-registry` CSS size | `221,991` bytes |
| `data-style-registry` `--xmlui-*` occurrences | `6,310` |
| Largest generated root theme class | `css-1gp7nda` on `<html>` |
| `css-1gp7nda` CSS size | `140,211` bytes |
| `css-1gp7nda` unique CSS custom properties | `2,410` |

Important finding:

- The hypothesis is directionally correct, but the expensive artifact is not
  many visible `<Theme>` DOM elements.
- The expensive artifact is large generated CSS custom-property rules and the
  resulting CSSOM/native style work.
- The root website theme class alone contains about `2,410` unique CSS custom
  properties. The nested app reset mechanism can duplicate/reset that scale of
  CSS inside each mounted playground shadow root.

Additional correctness finding:

- `xmlui/src/components/Theme/Theme.tsx` currently extracts `themeVars` from
  `restProps` after removing only `tone`:
  `const { tone, ...restProps } = node.props`.
- This means Theme control props such as `root`, `themeId`, `applyIf`, and
  `disableInlineStyle` can be treated as theme variable candidates.
- For implicit root Theme nodes, `root: true` can make the Theme look as if it
  has an explicit base theme variable, which triggers full compiled theme CSS
  emission. That explains why the SSG `<html>` root has a huge generated theme
  class.
- The root application still needs full theme variables somewhere, so this
  should not be fixed by simply dropping full root CSS emission. The correct
  cleanup is to separate control props from real theme vars, then make root CSS
  emission explicit instead of accidental.

Potential optimization experiment:

Prototype a nested-theme inheritance mode for playgrounds that inherit the host
theme unchanged:

1. In `Theme.tsx`, stop treating control props as `themeVars`.
2. Make root Theme full-var emission explicit for normal app roots.
3. For nested apps whose effective `activeTheme` and `activeTone` equal the
   parent app's current theme/tone:
   - skip the full parent `themeStylesToReset` class in `NestedAppRoot`;
   - skip full root theme var emission inside the nested app;
   - rely on CSS custom-property inheritance across the shadow host.
4. Keep the existing reset/full-emission behavior when a playground explicitly
   chooses a different theme or tone.

Expected impact:

- Potentially high for CSSOM/native renderer memory, especially on dense docs
  pages.
- This is more promising than mounted-app caps because it reduces the size of
  each mounted playground's style work rather than only the count of mounted
  playgrounds.

Risks:

- Theme isolation regression if a nested app uses a different theme/tone.
- Shadow DOM inheritance semantics must be checked carefully.
- Components relying on base vars must still resolve correctly inside inherited
  nested apps.

Validation without deployment:

- Add runtime counters to `measure-memory`:
  - style tag count,
  - total style text bytes,
  - `--xmlui-*` occurrences in document and shadow roots,
  - largest style tag/class by byte size.
- Compare current SSG preview against the prototype:
  - first load,
  - after-scroll,
  - 5 direct reloads.
- Add targeted tests:
  - inherited-theme nested app renders same visual theme as host;
  - explicit different nested theme still overrides host;
  - explicit different tone still overrides host;
  - no parent theme leakage into differently themed nested apps.

Stop condition:

- Stop before implementing the inheritance optimization. The static evidence is
  strong enough to justify a controlled prototype, but the behavior touches
  theming isolation and needs explicit approval.

### 2026-07-25: CSSOM Diagnostics Added

Added measurement support after the Theme/CSSOM investigation, so the next
prototype can be evaluated by CSS/style pressure as well as JS heap and RSS.

Code change:

- `website/scripts/measure-memory.mjs` now records, for the document and all
  traversable shadow roots:
  - `styleTagsIncludingShadow`,
  - `styleTextBytesIncludingShadow`,
  - `xmluiCssVarOccurrencesInStyles`,
  - `largestStyleBlocks` with root kind, byte size, `--xmlui-*` count, style
    registry attributes, and a short preview.

Validation:

```sh
npm run measure:memory -w website -- --help
node --check website/scripts/measure-memory.mjs
```

Both commands passed.

Runtime measurement note:

- The local SSG preview measurement with these new counters still needs to be
  run once the preview server can be started again. The earlier preview start
  attempts were blocked by approval-service errors, not by the measurement
  script itself.

## Concrete Action Plan For Approval

This plan was added after the previous hibernation, reload-lifetime, and
Theme/CSSOM findings. The purpose is to reduce same-renderer refresh RSS by
shrinking the CSS/style work associated with each mounted docs playground,
without changing the visible playground UX or requiring deployment.

### Phase A: Theme Control-Prop Hygiene

Hypothesis:

- `Theme` control props should not be included in `themeVars`.
- Today, `Theme.tsx` removes only `tone` before calling `extractValue(restProps)`.
  That allows `root`, `themeId`, `applyIf`, and `disableInlineStyle` to be
  interpreted as theme-var candidates.
- Fixing this is a correctness prerequisite. It should not be expected to
  reduce memory by itself because root applications still need full theme CSS.

Proposed implementation:

1. In `xmlui/src/components/Theme/Theme.tsx`, destructure all control props out
   before extracting theme vars:
   - `tone`,
   - `themeId`,
   - `root`,
   - `applyIf`,
   - `disableInlineStyle`.
2. Pass the extracted control values to `ThemeReact`.
3. In `ThemeReact.tsx`, make full compiled CSS-var emission explicit for root
   themes:
   - `needsCompiledVars = isRoot || tone !== undefined || id !== undefined ||
     hasBaseThemeVarOverride`.
4. Add targeted tests proving:
   - control props are not emitted as theme variables;
   - root Theme still emits enough vars for normal app styling;
   - non-root `Theme applyIf`, `themeId`, `tone`, and component-specific vars
     keep their current behavior.

Validation without deployment:

```sh
npx playwright test xmlui/src/components/Theme/Theme.spec.ts
npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts -g "xmlui-pg"
npm run build-ssg -w website
```

Measurement expectation:

- CSS style byte counts and RSS may be unchanged or only slightly changed.
- This phase is mainly to remove accidental behavior before attempting the real
  nested-app optimization.

Stop condition:

- Stop after Phase A tests and one SSG measurement if results are surprising.
- Otherwise continue to Phase B only after approval.

### Phase B: Skip Parent Theme Reset For Purely Inherited Docs Playgrounds

Hypothesis:

- The expensive nested-app reset class duplicates the parent theme's large CSS
  variable set by assigning every parent var to `initial`.
- For docs playgrounds that inherit exactly the host theme/tone and do not
  declare their own theme configuration, that reset is unnecessary: CSS custom
  properties can intentionally inherit from the host into the shadow tree.
- Removing this reset should reduce CSSOM/native style pressure per mounted
  playground while preserving the existing full nested root theme emission as a
  safety net.

Conservative eligibility rule:

- Enable this only when the playground has no explicit `activeTheme`,
  `config.defaultTheme`, `activeTone`, `config.defaultTone`, or local
  `config.themes`.
- Keep the current reset behavior for every explicitly themed/tone-switched
  nested app.

Proposed implementation:

1. Compute an `inheritsHostTheme` boolean in `AppWithCodeViewReact` or
   `NestedApp`, using the conservative rule above.
2. Pass the boolean to `NestedAppRoot`.
3. In `NestedAppRoot`, skip `themeStylesToReset` only when
   `inheritsHostTheme === true`.
4. Keep all other nested-app isolation behavior unchanged.

Validation without deployment:

```sh
npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts -g "xmlui-pg"
npm run build-ssg -w website
npm run preview-ssg -w website
npm run measure:memory -w website -- \
  --url http://localhost:3000/docs/guides/layout \
  --search= \
  --checkpoints=12 \
  --json
npm run measure:memory -w website -- \
  --url http://localhost:3000/docs/guides/layout \
  --search= \
  --reloads=5 \
  --reload-mode=direct \
  --reload-wait-ms=5000 \
  --json
```

Acceptance criteria:

- `styleTextBytesIncludingShadow` decreases after scroll.
- `xmluiCssVarOccurrencesInStyles` decreases after scroll.
- After-scroll and 5-reload RSS improve versus current hibernation baseline.
- Scroll height remains stable.
- Active shadow roots remain viewport-bounded.
- Existing `xmlui-pg` targeted tests pass.

Stop condition:

- Stop after Phase B measurements and decide whether the gain justifies keeping
  the change.

### Phase C: Skip Nested Root Full Theme CSS For Inherited Docs Playgrounds

Hypothesis:

- If Phase B helps but is not enough, the remaining large duplicate CSS block is
  likely the nested root `Theme` class itself.
- For the same conservative inherited-theme case, the nested app may rely on
  inherited host CSS variables and avoid emitting the full compiled root
  variable set inside the shadow root.

Proposed implementation:

1. Add an explicit internal prop/config flag to the implicit root Theme created
   by `AppRoot`, for example `suppressRootThemeCssVars`.
2. Use it only for nested inherited-theme playgrounds.
3. Still emit root-only operational vars such as `--screenSize` and
   `colorScheme`.
4. Keep normal full root Theme emission for:
   - top-level apps,
   - standalone apps,
   - nested apps with explicit theme/tone/config,
   - any case where inheritance eligibility is uncertain.

Validation without deployment:

- Reuse the Phase B measurement commands.
- Add tests for:
  - inherited nested app has the same effective theme as host;
  - explicit different nested theme remains isolated;
  - explicit different nested tone remains isolated;
  - component theme vars inside nested apps still resolve.

Acceptance criteria:

- Further reduction in `styleTextBytesIncludingShadow` and
  `xmluiCssVarOccurrencesInStyles`.
- RSS improves materially beyond Phase B.
- No visual/theming regressions in targeted tests.

Stop condition:

- Stop after Phase C measurement. Do not proceed to broader style-registry
  sharing unless this still leaves unacceptable RSS.

### Phase D: Shared Or Deduplicated Nested Style Registry

Hypothesis:

- If CSS variable emission is reduced but renderer RSS remains too high, the
  remaining cost may be duplicated component style classes and per-shadow-root
  CSSOM structures.

Status:

- This is a later, higher-risk investigation.
- It should be skipped for now unless Phases A-C fail to produce meaningful
  improvement.

Validation:

- Would require broader visual regression coverage because it changes style
  isolation mechanics.

## Approval Request Point

Recommended next approved experiment:

1. Implement Phase A and Phase B together as a measured prototype.
2. Run targeted Theme and Markdown playground tests.
3. Run local SSG build and memory measurements with the new CSSOM counters.
4. Stop and review before Phase C.

Reasoning:

- Phase A removes accidental Theme behavior and makes the later optimization
  explicit.
- Phase B is the least risky memory-oriented change: it removes the parent
  reset only for playgrounds that are demonstrably intended to inherit the host
  theme, while leaving nested root theme emission intact.
- Phase C is likely higher impact, but it should wait for Phase B measurements
  because it changes root Theme emission semantics inside nested apps.
