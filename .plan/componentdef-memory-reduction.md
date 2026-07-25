# ComponentDef Memory Reduction Plan

## Context

Users reported high memory use on the XMLUI docs website. The earlier search-focused investigation found and fixed the largest confirmed dev-server issue: the docs app was runtime-indexing hidden pages even though it already had static search data.

After that, we investigated the production-shaped route `/docs/guides/layout`, which is important because it contains markdown-rendered `xmlui-pg` examples. Those examples can embed several small XMLUI apps inside the documentation page, so the page may retain multiple independent ComponentDef/rendering graphs.

The production-equivalent local workflow is:

```sh
npx turbo run build-ssg --filter="xmlui-website"
npm run preview-ssg -w website
```

The deployed workflow builds `website/dist-ssg` with `build-ssg` and uploads that static output.

Baseline from local SSG preview at `http://localhost:3000/docs/guides/layout`:

- JS heap after forced GC: about 195.0 MB
- React fibers found: 15,272
- ComponentDef-like objects found through React fiber props: 3,562
- ComponentDef-like objects with `debug`: 819
- `debug.source`: 819
- `debug.attributes`: 739
- `debug.reactiveNodes`: 10
- Estimated retained `debug` JSON: about 546 KB
- DOM elements: 8,134
- `data-component-type` elements: 173

The same shape was observed on the public production site, which confirms that the local SSG preview is a good no-deployment validation target.

## Execution Rules

Each hypothesis below must be treated as an independent experiment.

For every hypothesis:

1. Start from the same baseline route: `/docs/guides/layout`.
2. Build locally with the workflow-equivalent SSG command.
3. Serve locally with `preview-ssg`.
4. Measure before and after with the same Playwright/CDP script.
5. Check the page still renders and search still works at a smoke-test level.
6. Stop after the measurement and wait for approval before moving to the next hypothesis.

The full E2E suite will be run by the user. Do not rely on full E2E as the immediate success gate for these experiments.

Recommended per-step measurement:

- `Runtime.getHeapUsage` after `HeapProfiler.collectGarbage`
- ComponentDef-like object counts from React fiber props
- Counts for `debug`, `debug.source`, `debug.attributes`, `debug.reactiveNodes`
- Counts for embedded playground/runtime roots if identifiable
- DOM element count
- `data-component-type` count
- Search open/query/clear smoke measurement for `layout`, `stack`, and `grid`

## Ranked Hypotheses

The first investigation target is the production/SSG `ComponentDef.debug` strip. Lazy-mounting embedded `xmlui-pg` apps may have a larger theoretical memory impact, but it has a layout-stability risk: without mounting a live preview, the rendered playground height may not be known accurately, which can affect scroll position, anchors, and in-page navigation. Keep that hypothesis for a later phase with explicit height-reservation and scroll-stability checks.

### 1. Strip ComponentDef `debug` Metadata From Production/SSG Builds

Expected impact: Medium.

Production SSG preview retains `debug.source`, `debug.attributes`, and `debug.reactiveNodes` on ComponentDef-like objects. This data is useful for development, inspector, source mapping, and diagnostics, but likely unnecessary for normal production rendering.

Hypothesis:

Removing `ComponentDef.debug` from production/SSG app definitions will reduce retained memory and slightly reduce bundle/static data size without affecting production behavior.

Experiment:

- Add an explicit production strip path for ComponentDef debug metadata.
- Prefer a build-time transform in the XMLUI Vite/SSG pipeline so dev server and inspector behavior stay unchanged.
- Start narrowly with `debug` only; do not remove semantic fields such as `computedUses`, `computedGlobalUses`, `scriptCollected`, or `_savedVarDefs`.

No-deployment validation:

- Build SSG and preview locally.
- Confirm `/docs/guides/layout` has `debug.source = 0`, `debug.attributes = 0`, and `debug.reactiveNodes = 0`.
- Measure heap and static JS/chunk size.
- Smoke-test docs navigation, search, and playground rendering.

Success signal:

- `debug` counts drop to zero in production preview.
- Heap decreases measurably, likely smaller than the playground hypotheses but still useful.
- No visible docs behavior changes.

Falsification signal:

- Runtime production behavior depends on `debug`.
- Heap reduction is negligible and risk outweighs benefit.

Stop gate:

- Stop after measurement and smoke tests. Wait for approval.

Measurement result:

- Status: completed as first experiment.
- Local SSG preview route: `http://localhost:3000/docs/guides/layout`
- `debug`, `debug.source`, `debug.attributes`, and `debug.reactiveNodes` dropped from the runtime ComponentDef-like graph to `0`.
- Estimated ComponentDef JSON dropped from about `132.74 MB` to about `120.62 MB` in the traversal measurement.
- SSG SSR bundle dropped from about `12.32 MB` to `10.28 MB` uncompressed, and from about `2.04 MB` to `1.88 MB` gzip.
- Browser JS heap after forced GC did not materially improve: baseline about `195.0 MB`, after strip about `195.1 MB`.
- DOM element count and React fiber count were unchanged.
- Search smoke test passed for the `layout` query.

Conclusion:

This is a valid production payload cleanup and removes the suspected production-only debug metadata, but it is not a significant browser JS heap reduction for `/docs/guides/layout`. Do not proceed to the next hypothesis without approval.

### 2. Share Runtime Infrastructure Across `xmlui-pg` Apps

Expected impact: High.

If eagerly mounted playgrounds stay mounted, each embedded app may still duplicate app-level infrastructure: providers, registries, theme processing, global context data, icon/component metadata, and parser/runtime helper structures.

Hypothesis:

The embedded apps retain duplicated XMLUI runtime infrastructure that could be shared at the page level without changing the semantics of each playground.

Experiment:

- Instrument playground app mounts to count:
  - number of XMLUI app roots,
  - component registry instances,
  - theme/provider stacks,
  - parsed root ComponentDef graphs.
- If duplication is confirmed, prototype sharing immutable runtime assets across playground instances while keeping app state isolated.

No-deployment validation:

- Build and preview locally.
- Measure `/docs/guides/layout` idle.
- Compare retained object counts before/after with all playgrounds mounted.
- Interact with at least two independent playgrounds to confirm state isolation.

Success signal:

- Heap drops materially with no change to mounted playground count.
- Duplicate registry/theme/provider-related retained objects shrink.
- Independent playground state remains isolated.

Falsification signal:

- The runtime already shares most immutable infrastructure.
- Memory remains dominated by per-example ComponentDefs and DOM, not shared runtime assets.

Stop gate:

- Stop after instrumentation and one prototype measurement. Wait for approval.

Measurement result:

- Status: completed as second experiment.
- Local SSG preview route: `http://localhost:3000/docs/guides/layout`
- Baseline after the debug-strip experiment:
  - Nested app shadow roots: `35`
  - `adoptedStyleSheets` slots across nested app shadow roots: `175`
  - Unique constructed `CSSStyleSheet` objects across those roots: `175`
  - CSS rules repeated across adopted stylesheet slots: `603,785`
  - Estimated CSS text repeated across adopted stylesheet slots: about `157.33 MB`
  - The duplicated source was the same 5 document-level stylesheets per nested app, including two copies of the large `internal/index.*.css` stylesheet.
  - CDP heap sample: `usedSize` about `160.86 MB`, `embedderHeapUsedSize` about `419.30 MB`
- Prototype:
  - Added a module-level cache in `NestedAppReact.tsx` for the constructed stylesheets derived from document stylesheets.
  - Kept each nested app's shadow root, React root, state, dynamic style registry, and provider tree isolated.
  - Reused the same constructed `CSSStyleSheet[]` for all nested app shadow roots when the document stylesheet signature matches.
- After prototype:
  - Nested app shadow roots remained `35`.
  - `adoptedStyleSheets` slots remained `175`.
  - Unique constructed `CSSStyleSheet` objects dropped from `175` to `5`.
  - First and second nested app roots referenced the same sheet IDs: `[1, 2, 3, 4, 5]`.
  - DOM elements remained `8,134`.
  - `data-component-type` elements remained `173`.
  - Search smoke test passed for the `layout` query.
  - CDP repeat samples after forced GC:
    - `usedSize`: about `247.58 MB` to `276.68 MB`
    - `embedderHeapUsedSize`: about `50.31 MB` to `51.10 MB`
    - combined `usedSize + embedderHeapUsedSize`: about `297.89 MB` to `327.77 MB`
- Targeted tests:
  - `npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts xmlui/src/components/App/App.spec.ts`: `119 passed`
  - `npx vitest run xmlui/tests/bin/vite-plugin-import.test.ts`: `42 passed`
- SSG build:
  - `npx turbo run build-ssg --filter="xmlui-website"` completed successfully.
  - The known existing `RangeError: Invalid time value` appeared for a blog route and did not fail the build.

Conclusion:

The hypothesis is strongly supported. The high memory retention on docs pages with many `xmlui-pg` blocks is substantially affected by per-playground duplication of constructed CSSOM stylesheets, not only by ComponentDef data. Sharing the immutable constructed stylesheet objects across nested app shadow roots preserves mounted playground count and state isolation while removing the repeated CSSOM allocation. This appears to be a much higher-impact optimization than stripping `ComponentDef.debug`.

### 3. Lazy-Mount Or Preview-Defer `xmlui-pg` Embedded Apps

Expected impact: Very high.

The `/docs/guides/layout` page contains markdown `xmlui-pg` examples. Each displayed playground can behave like a small XMLUI application, with its own parsed ComponentDefs, React fibers, state containers, providers, syntax-highlight/source structures, and possibly preview/code split state.

Risk:

The live preview may be needed to calculate the rendered `xmlui-pg` block height. Deferring mount without a reliable reserved height can cause scroll position changes, broken anchor positioning, or visible layout jumps. Do not attempt this before the lower-risk ComponentDef/debug and shared-runtime hypotheses have been measured.

Hypothesis:

Most of the remaining high steady-state memory on documentation pages is caused by mounting every visible `xmlui-pg` app eagerly during page load, even when the user has not interacted with most examples.

Experiment:

- Add an experimental flag, local only, for markdown playground rendering.
- In this mode, render the code/source and a lightweight placeholder shell initially.
- Mount the live XMLUI preview only when:
  - the playground enters the viewport, or
  - the user explicitly opens/runs the preview, depending on the safest existing UX pattern.
- Keep the source display and copy behavior available without mounting the inner app.

No-deployment validation:

- Build `build-ssg`, serve `preview-ssg`.
- Measure `/docs/guides/layout` before interaction.
- Scroll through the page and measure after each playground becomes active.
- Open and interact with one playground, then measure again.
- Confirm code fences still render and copy controls still work.

Success signal:

- Initial heap drops materially, target at least 20-40 MB on `/docs/guides/layout`.
- React fiber count and ComponentDef-like object count drop before playground activation.
- Activating one example grows memory only by that example's cost, not by all examples at once.

Falsification signal:

- Initial ComponentDef-like object count and heap barely change.
- Most retained memory is not associated with playground previews.

Stop gate:

- Stop after measuring this hypothesis. Present the before/after table and wait for approval.

Measurement result:

- Status: completed as third experiment, with a conservative implementation.
- Scope:
  - The earlier conceptual risk was valid: most `xmlui-pg` blocks on `/docs/guides/layout` do not declare an explicit playground `height`, even though their inner XMLUI markup often contains height-like component props.
  - To avoid scroll-height and anchor-position regressions, the prototype only defers playground previews when the outer `xmlui-pg` fence declares `height`.
  - Existing direct `<NestedApp>` behavior was preserved by treating missing `immediate` as immediate; only explicit `immediate={false}` uses viewport lazy mounting.
- Prototype:
  - `AppWithCodeViewReact` now passes `immediate={false}` only when the playground has an explicit `height`, unless the author explicitly sets `immediate`.
  - `LazyNestedApp` uses `IntersectionObserver` with `rootMargin: "800px 0px"` and mounts once when the placeholder approaches the viewport.
  - Deferred apps are not unmounted after activation, so user state is preserved after first mount.
- Local SSG preview route: `http://localhost:3000/docs/guides/layout`
- Initial measurement after the prototype:
  - Nested app roots: `34`
  - Deferred placeholders: `1`
  - DOM elements: `8,133`
  - `data-component-type` elements: `173`
  - CDP heap sample: `usedSize` about `232.06 MB`, `embedderHeapUsedSize` about `43.54 MB`
- After scrolling the real XMLUI app scroll container to the bottom:
  - Nested app roots: `35`
  - Deferred placeholders: `0`
  - DOM elements: `8,138`
  - `data-component-type` elements: `173`
  - Main scroll container `scrollHeight`: stayed `19,739` before and after activation
  - CDP heap sample: `usedSize` about `296.37 MB`, `embedderHeapUsedSize` about `53.82 MB`
- Search smoke test passed for the `layout` query.
- Targeted tests:
  - `npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts xmlui/src/components/App/App.spec.ts`: `119 passed` before the final default-semantics adjustment.
  - `npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts -g "xmlui-pg"`: `13 passed` after the final default-semantics adjustment.
  - `npx vitest run xmlui/tests/bin/vite-plugin-import.test.ts`: `42 passed`
- SSG build:
  - `npx turbo run build-ssg --filter="xmlui-website"` completed successfully.
  - The known existing `RangeError: Invalid time value` appeared for a blog route and did not fail the build.
- TypeScript:
  - `npx tsc --noEmit -p xmlui/tsconfig.json` still fails only with the previously observed unrelated `wrapComponent.tsx` errors.

Conclusion:

The lazy-mount hypothesis is directionally supported, but the safe, explicit-height-only rule has very small impact on `/docs/guides/layout` because that page has only one outer `xmlui-pg height="..."` block. It did reduce initial mounted nested app count from `35` to `34`, and the deferred app mounted correctly after scrolling without changing the main scroll container height. This confirms the mechanism, but a significant memory reduction from lazy mounting would require a broader height reservation strategy for examples without explicit outer playground height. Do not broaden the rule without a separate scroll-stability design and measurement.

### 4. Height Reservation For Broader `xmlui-pg` Deferral

Expected impact: High, if scroll stability can be preserved.

The conservative lazy-mount experiment confirmed that deferring a mounted playground can delay meaningful heap growth, but it only applied to one example on `/docs/guides/layout` because only one `xmlui-pg` fence declares an explicit outer `height`. Most examples rely on their rendered XMLUI preview content to determine height. Deferring those examples safely requires reserving an accurate preview height before the nested app is mounted.

Hypothesis:

Broader `xmlui-pg` lazy mounting can significantly reduce initial memory if each deferred playground reserves a stable height that matches its eventual rendered preview closely enough to avoid scroll jumps, broken anchor positioning, and TOC navigation drift.

Experiment:

- Do not change production behavior first.
- Add a measurement-only pass on local SSG preview for `/docs/guides/layout`:
  - collect every playground's rendered preview height,
  - collect its top offset inside the real XMLUI app scroll container,
  - identify whether it has explicit outer `xmlui-pg height`,
  - identify whether it is initially within viewport plus the planned `rootMargin`.
- Build a local prototype that defers more than explicit-height examples by reserving measured or estimated heights.
- Start with a route-local/generated measurement artifact rather than hard-coding assumptions into markdown content.
- Keep source/code display and copy controls available without mounting the nested app.
- Mount once when the reserved block approaches the viewport; do not unmount after activation.

No-deployment validation:

- Build SSG and preview locally.
- Measure `/docs/guides/layout` initial state:
  - mounted nested app count,
  - deferred placeholder count,
  - JS heap and embedder heap after forced GC,
  - React fiber count,
  - ComponentDef-like object count,
  - main scroll container `scrollHeight`.
- Scroll through the page in controlled increments and measure after each activation batch.
- Verify scroll stability:
  - main scroll container `scrollHeight` before/after each activation,
  - current `scrollTop` delta around activation,
  - anchor navigation to headings before and after deferred playground activation,
  - TOC link navigation to sections below deferred playgrounds.
- Smoke-test search and at least one activated playground interaction.

Success signal:

- Initial mounted nested app count drops by more than the explicit-height-only prototype.
- Initial heap drops materially, target at least `20-40 MB` on `/docs/guides/layout`.
- Main scroll container height remains stable or changes within a documented small tolerance.
- Anchor and TOC navigation remain stable before and after activation.
- Activating a playground grows memory roughly by the activated playground's cost, not by all examples.

Falsification signal:

- Accurate height reservation requires mounting the app first, eliminating the benefit.
- Height estimates produce visible layout jumps or anchor drift.
- The memory reduction is too small after preserving scroll stability.

Stop gate:

- Stop after the measurement-only pass and one prototype measurement. Present the height-reservation accuracy table, memory table, and scroll-stability results before continuing.

Measurement result, local SSG preview, `/docs/guides/layout`, fixed `160px` reserved height prototype:

- Implementation tested:
  - `AppWithCodeViewReact` passed `immediate={false}` by default for playgrounds rendered from docs markdown.
  - Non-explicit-height playground placeholders reserved `160px`; explicit `height` still used its provided height.
  - The actual mounted nested app kept its previous sizing (`height="100%"` inside framed examples).
- Initial state after forced GC:
  - nested playground containers: `35`
  - mounted nested roots: `1`
  - deferred placeholders: `33`
  - `Runtime.getHeapUsage.usedSize`: `78.05 MB`
  - `embedderHeapUsedSize`: `40.13 MB`
  - combined `usedSize + embedderHeapUsedSize`: `118.17 MB`
  - main XMLUI scroll container `scrollHeight`: `21315`
- After controlled scrolling through the XMLUI scroll container and forced GC:
  - mounted nested roots: `35`
  - deferred placeholders: `0`
  - `Runtime.getHeapUsage.usedSize`: `247.30 MB`
  - `embedderHeapUsedSize`: `55.07 MB`
  - combined `usedSize + embedderHeapUsedSize`: `302.37 MB`
  - main XMLUI scroll container `scrollHeight`: `19739`
- Deltas:
  - additional mounted roots: `+34`
  - `usedSize`: `+169.25 MB`
  - `embedderHeapUsedSize`: `+14.95 MB`
  - combined heap: `+184.20 MB`
  - scroll height: `-1576 px`
- Comparison with previous explicit-height-only deferral on the same route:
  - previous initial mounted roots: `34`; prototype initial mounted roots: `1`
  - previous initial combined heap: about `275.60 MB`; prototype initial combined heap: about `118.17 MB`
  - previous activated combined heap: about `350.19 MB`; prototype activated combined heap: about `302.37 MB`
  - previous scroll height stayed stable at `19739`; prototype starts at `21315` and shrinks to `19739`
- Targeted regression check:
  - `npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts -g "xmlui-pg"`: `13 passed`

Conclusion:

- The hypothesis is true for memory: broad deferral can cut the initial layout-page browser footprint very substantially, roughly `157 MB` lower than the explicit-height-only prototype in this measurement.
- The simple fixed-height reservation is not acceptable as a final approach: the page shrinks by `1576 px` as playgrounds mount. That validates the user's concern that height must be reserved accurately enough to avoid scroll/anchor drift.
- The next design discussion should focus on how to produce accurate reserved heights without mounting all nested apps at runtime. Promising options are build-time/SSG measurement metadata per `xmlui-pg`, route-local height manifests, or author-provided/markdown-derived explicit heights for examples whose rendered size cannot be inferred cheaply.

### 5. Default Fixed Height For Implicit `xmlui-pg` Apps

Expected impact: High, if the docs UX accepts the default height.

Historical note:

This step was added after the earlier broad-deferral experiment. That experiment showed a large memory win from deferring most playgrounds, but it also showed that a guessed placeholder height is not stable enough: the local `/docs/guides/layout` scroll container shrank by `1576 px` after all playgrounds mounted. The default-height idea is a response to that result: instead of estimating a placeholder that later changes, make implicit-height playgrounds have a documented fixed height that is used both before and after mount.

Hypothesis:

If an `xmlui-pg` code fence does not specify `height`, the docs renderer can assign a documented default preview height, initially `400px`. Because the eventual mounted playground and the deferred placeholder use the same height, broad lazy mounting can reduce initial memory without causing scroll-height drift.

Experiment:

- Treat missing `height` in `AppWithCodeViewReact` as `400px`.
- Use this effective height for:
  - the outer playground frame,
  - the nested app placeholder before lazy mount,
  - the mounted nested app's layout.
- Keep explicit `height` unchanged and higher priority.
- Keep explicit `immediate` unchanged and higher priority.
- Defer implicit-height playgrounds by default because they now have a stable default height.

No-deployment validation:

- Build SSG and preview locally.
- Measure `/docs/guides/layout` initial state:
  - mounted nested app count,
  - deferred placeholder count,
  - JS heap and embedder heap after forced GC,
  - main XMLUI scroll container `scrollHeight`.
- Scroll through the XMLUI scroll container and measure after all playgrounds have activated.
- Compare:
  - memory against the explicit-height-only lazy prototype,
  - scroll stability against the `160px` placeholder prototype,
  - total page length against the current auto-height docs rendering.
- Run the targeted `xmlui-pg` Playwright tests.

Success signal:

- Initial mounted nested app count drops close to the broad-deferral prototype.
- Initial heap drops materially.
- Main scroll container `scrollHeight` stays stable before and after activation.
- The page is longer but not obviously broken or unusable.

Falsification signal:

- `400px` makes common short examples visually unacceptable.
- Scroll stability still changes materially, meaning the actual mounted structure is not respecting the same height.
- Memory improvement is much smaller than the broad-deferral prototype.

Stop gate:

- Stop after the `400px` prototype measurement. Decide whether to keep exploring fixed defaults, try a smaller default such as `240px` or `320px`, or move to build-time height metadata.

Measurement result, local SSG preview, `/docs/guides/layout`, default implicit height `400px` prototype:

- Implementation tested:
  - Missing `height` in `AppWithCodeViewReact` becomes an effective `400px`.
  - Explicit `height` keeps priority.
  - The outer playground frame uses the effective height.
  - The framed nested app continues to use `height="100%"` inside that fixed frame.
  - `immediate` still has priority; otherwise playgrounds lazy mount by default.
- SSG build:
  - `npx turbo run build-ssg --filter="xmlui-website"` completed successfully.
  - The known existing `RangeError: Invalid time value` appeared for the `supabase-and-xmlui` blog route and did not fail the build.
- Initial state after forced GC:
  - nested playground containers: `35`
  - mounted nested roots: `1`
  - deferred containers: `34`
  - `Runtime.getHeapUsage.usedSize`: `78.03 MB`
  - `embedderHeapUsedSize`: `40.13 MB`
  - combined `usedSize + embedderHeapUsedSize`: `118.16 MB`
  - main XMLUI scroll container `scrollHeight`: `28085`
  - measured playground heights: min `200px`, max `400px`
- After controlled scrolling through the XMLUI scroll container and forced GC:
  - mounted nested roots: `35`
  - deferred containers: `0`
  - `Runtime.getHeapUsage.usedSize`: `247.21 MB`
  - `embedderHeapUsedSize`: `57.69 MB`
  - combined `usedSize + embedderHeapUsedSize`: `304.90 MB`
  - main XMLUI scroll container `scrollHeight`: `28085`
- Deltas:
  - additional mounted roots: `+34`
  - `usedSize`: `+169.17 MB`
  - `embedderHeapUsedSize`: `+17.56 MB`
  - combined heap: `+186.73 MB`
  - scroll height: `0 px`
- Comparison with prior measurements on the same route:
  - explicit-height-only lazy prototype initial combined heap: about `275.60 MB`
  - fixed `160px` placeholder broad prototype initial combined heap: about `118.17 MB`, but scroll height changed by `-1576 px`
  - default `400px` prototype initial combined heap: about `118.16 MB`, with scroll height delta `0 px`
  - current/previous auto-height activated page scroll height: `19739`; default `400px` prototype scroll height: `28085`, so the page becomes `8346 px` longer on this route
- Targeted regression check:
  - `npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts -g "xmlui-pg"`: `13 passed`

Conclusion:

- The default fixed-height hypothesis is strongly supported mechanically: it preserves the broad-deferral memory win while eliminating scroll-height drift in the measured route.
- The main open question is UX, not correctness or memory. On `/docs/guides/layout`, many examples that used to render at `69-283px` become `400px`, making the page `8346 px` longer.
- The next decision should be whether `400px` is acceptable as the documented default, or whether to repeat the same experiment with a smaller fixed default such as `240px` or `320px`. The measurement suggests smaller defaults may still preserve scroll stability as long as they are used as the real mounted height, not only as a placeholder.

Follow-up measurements, local SSG preview, `/docs/guides/layout`, default implicit height sweep:

Historical note:

These extra measurements were added after the `400px` prototype result. The `400px` run proved the mechanical hypothesis, but it also showed a large page-length cost. The `320px` and `240px` runs test whether the same memory and scroll-stability benefit can be kept with a less intrusive documented default.

Measurement method:

- Change `DEFAULT_IMPLICIT_PLAYGROUND_HEIGHT` in `AppWithCodeViewReact` for each run.
- Rebuild local SSG with `npx turbo run build-ssg --filter="xmlui-website"`.
- Serve with `npm run preview-ssg -w website`.
- Run a temporary Playwright/Chrome measurement script against `http://localhost:3000/docs/guides/layout`.
- Measure after forced GC at initial load and again after controlled scrolling through the XMLUI scroll container.
- The known existing `RangeError: Invalid time value` appeared during SSG rendering of the `supabase-and-xmlui` blog route and did not fail the builds.

| Default implicit height | Initial mounted/deferred | Initial combined heap | After-scroll mounted/deferred | After-scroll combined heap | Combined heap delta | Scroll height before -> after | Scroll drift | Page length vs current auto-height `19739` | Measured container min/max | Interpretation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `400px` | `1 / 34` | `118.16 MB` | `35 / 0` | `304.90 MB` | `+186.73 MB` | `28085 -> 28085` | `0 px` | `+8346 px` | `200 / 400 px` | Stable and memory-efficient, but makes the page much longer. |
| `320px` | `1 / 34` | `118.58 MB` | `35 / 0` | `301.70 MB` | `+183.12 MB` | `25365 -> 25365` | `0 px` | `+5626 px` | `200 / 320 px` | Same initial memory class, stable scroll, much less page growth than `400px`. |
| `240px` | `1 / 34` | `118.64 MB` | `35 / 0` | `303.10 MB` | `+184.46 MB` | `22645 -> 22645` | `0 px` | `+2906 px` | `200 / 240 px` | Same memory and scroll stability, most compact fixed default, but higher clipping risk for examples that previously needed around `280px`. |

Recommendation after the sweep:

- Use `320px` as the documented default implicit `xmlui-pg` height.
- Reasoning:
  - All three fixed defaults preserve the main win: only `1` nested app is mounted initially and `34` are deferred, with initial combined heap around `118-119 MB`.
  - All three eliminate scroll-height drift because the placeholder and mounted playground use the same real height.
  - `240px` is attractive on page length, but it is below the previously observed auto-height maximum on this route, which was around `283px`. That creates a realistic risk that some existing examples become clipped or need explicit height annotations immediately.
  - `320px` is the smallest measured default with visible headroom above the current route's previously observed tallest implicit examples. It avoids the worst `400px` page-length cost while keeping a safer default for docs authors.
  - Examples that intentionally need a shorter or taller preview should still use explicit `height`; the default should be a safe baseline, not a perfect per-example layout optimizer.

Stop gate:

- The `320px` recommendation was approved after the fixed-height sweep.
- Implementation decision:
  - `AppWithCodeViewReact` now treats missing `height` as `320px`.
  - The same effective height is used for the framed playground container, the no-frame Markdown wrapper, and the lazy nested app placeholder.
  - Missing `immediate` now defaults to deferred mounting for these playgrounds; explicit `immediate` still wins.
  - `AppWithCodeView` metadata and the playground/codefence guide document the `320px` default.
- Final validation on the accepted implementation, local SSG preview, `/docs/guides/layout`:
  - SSG build completed successfully.
  - The known existing `RangeError: Invalid time value` appeared again for the `supabase-and-xmlui` blog route and did not fail the build.
  - Initial state after forced GC: `35` nested containers, `1` mounted, `34` deferred, combined heap `112.63 MB`, scroll height `25365`, measured container min/max `200 / 320 px`.
  - After controlled scrolling and forced GC: `35` mounted, `0` deferred, combined heap `289.03 MB`, scroll height `25365`.
  - Scroll drift: `0 px`.
- Stop after the implementation and targeted validation so the next optimization hypothesis can be approved separately.

### 6. Normalize Empty Optional ComponentDef Collections

Expected impact: Medium to low.

The ComponentDef type has many optional object/array fields. Some are empty in the measured runtime:

- `events`: 59 present, 54 empty
- `vars`: 45 present, 31 empty
- `children`: 1,041 present, 35 empty
- `_savedVarDefs`: 5 present, 3 empty

Other optional fields are absent in this route, which is good. Empty object/array retention is smaller than full playground/runtime graphs, but it can matter across thousands of ComponentDefs.

Hypothesis:

Avoiding empty optional fields in ComponentDefs can reduce object count, JSON/static payload size, hidden-class fragmentation, and retained heap.

Experiment:

- Add a ComponentDef normalization step after parsing/transforming:
  - delete `props`, `events`, `vars`, `children`, `functions`, `uses`, `_savedVarDefs`, and similar optional collections when empty,
  - preserve fields whose absence has different semantics from emptiness.
- Apply first in production/SSG only, or behind an experiment flag.

No-deployment validation:

- Build SSG and preview locally.
- Compare key presence and empty counts on `/docs/guides/layout`.
- Smoke-test pages with empty slots/children patterns, especially empty reusable components.

Success signal:

- Empty optional field counts drop to zero or near zero.
- Heap or static chunk size decreases measurably.
- Empty reusable components still behave correctly.

Falsification signal:

- Code paths rely on empty object/array identity or presence.
- Memory improvement is too small for the compatibility risk.

Stop gate:

- Stop after measurement. Wait for approval.

Result after implementation:

- Added a production/SSG-only `normalizeComponentDefCollections` option to the Vite XMLUI plugin.
  - The transform walks emitted ComponentDef and CompoundComponentDef graphs.
  - It deletes empty optional collections such as `api`, `children`, `events`, `functions`, `loaders`, `props`, `slots`, `uses`, `vars`, `_savedFunctionDefs`, and `_savedVarDefs`.
  - Dev-server output keeps the fuller parser shape.
- Cleaned up several `StandaloneApp` code-behind merge paths so they no longer manufacture `vars: {}` or `functions: {}` when both sides are empty.
  - This was added because `ContainerUtils.ts` explicitly notes that `StandaloneApp` could create truthy empty records and accidentally make a component look container-like.
- A quick production transform sample with an empty reusable component did not show empty optional collections even before/after the new transform, so the build-time part of the hypothesis is weak for simple parsed output.

Measurements on local SSG preview, `/docs/guides/layout`, after the accepted `320px` implicit playground-height step:

| Metric | Before this step baseline | After this step | Delta / note |
| --- | ---: | ---: | --- |
| SSR render bundle | about `10,281.08 kB` / gzip `1,884.06 kB` | `10,281.98 kB` / gzip `1,884.25 kB` | No static-size win; slight code-size increase from normalization helpers. |
| Initial mounted/deferred playgrounds | `1 / 34` | `1 / 34` | Same lazy-mount behavior. |
| Initial scroll height | `25365` | `25365` | Stable. |
| After-scroll mounted/deferred playgrounds | `35 / 0` | `35 / 0` | Same full activation behavior. |
| After-scroll scroll height | `25365` | `25365` | Stable; `0 px` drift. |
| Initial CDP JS heap after forced GC | not directly recorded in this metric in the previous table | `74.39 MB` | Current measurement method is JS heap only, not the earlier combined figure. |
| After-scroll CDP JS heap after forced GC | not directly recorded in this metric in the previous table | `235.64 MB` | Current measurement method is JS heap only, not the earlier combined figure. |

Validation:

- `npx vitest run xmlui/tests/bin/vite-plugin-import.test.ts`: passed, `42` tests.
- `npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts -g "xmlui-pg"`: passed, `13` tests.
- SSG build completed successfully. The known existing `RangeError: Invalid time value` appeared again for the `supabase-and-xmlui` blog route and did not fail the build.

Conclusion:

- The hypothesis is only partially supported.
- The production transform is correct and low-risk, but it does not appear to reduce the website SSG bundle for this route; the parser/build output was already mostly sparse.
- The runtime `StandaloneApp` merge cleanup is still conceptually useful because it prevents empty `vars`/`functions` from being synthesized after parsing. However, the measured memory impact is not clearly separable from measurement-method differences without a before/after run using the exact same JS-heap script.
- Recommendation: keep this change only if we value the semantic cleanup and the small runtime-shape hygiene. It should not be treated as a major memory win. The next higher-value step is likely to measure compact ComponentDef serialization, because verbose property names and object shape remain after `debug` and empty-field stripping.

### 7. Compile Or Serialize ComponentDefs In A More Compact Production Shape

Expected impact: Medium.

Even after stripping debug and empty fields, production ComponentDefs are still general JavaScript objects with verbose property names and nested object structure.

Hypothesis:

The production build can use a compact serialized ComponentDef representation and hydrate it into the richer shape only when needed, or render directly from a compact shape.

Experiment:

- Do not start with a full implementation.
- First add a local measurement-only serializer that calculates:
  - current JSON size of page/app ComponentDef graphs,
  - compact-key JSON size,
  - array/tuple representation size,
  - gzip/brotli deltas.
- Only prototype runtime use if estimated savings are substantial.

No-deployment validation:

- Run serializer against the SSG-generated route/app payloads locally.
- Compare estimated payload size and heap implications.
- If prototyped, build and preview locally.

Success signal:

- Static serialized size drops substantially, target at least 15-25% for ComponentDef data.
- The approach shows a plausible heap reduction beyond `debug`/empty-field stripping.

Falsification signal:

- ComponentDefs are not a large enough fraction of retained memory after higher-ranked fixes.
- Runtime conversion adds back most of the memory.

Stop gate:

- Stop after measurement-only serializer results unless explicitly approved to prototype.

Result after measurement-only serializer:

- This step was intentionally measurement-only; no runtime serializer or renderer change was implemented.
- Inputs:
  - `30` website source `.xmlui` files.
  - `35` `xmlui-pg` playgrounds extracted from `website/content/docs/pages/layout.md`.
  - `0` parse errors.
- Production-shaped graph after the already accepted `debug` strip and empty-collection normalization:
  - `1,406` ComponentDef-like objects.
  - `29` CompoundComponentDef-like objects.
  - `3,336` total plain objects and `660` arrays in the measured graph.
  - `190` distinct property names.
- Top repeated keys still include production-retained parser/source-position fields:
  - `startPosition`, `endPosition`, `startLine`, `endLine`, `startColumn`, `endColumn`: each `384`.
  - `nodeId`, `startToken`, `endToken`: each `192`.
  - This was discovered during the compact-serializer measurement and is directly relevant to the original suspicion about parse/token metadata remaining in production-shaped ComponentDefs.

Size estimates for the measured ComponentDef graphs:

| Representation | Raw JSON | Gzip | Brotli | Raw delta | Gzip delta | Brotli delta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Current production shape | `391,527 B` | `48,581 B` | `34,271 B` | baseline | baseline | baseline |
| Compact object keys | `340,461 B` | `47,389 B` | `34,264 B` | `-13.0%` | `-2.5%` | `-0.0%` |
| Tuple-shaped ComponentDefs | `328,571 B` | `47,192 B` | `34,102 B` | `-16.1%` | `-2.9%` | `-0.5%` |
| Strip parser/source positions only | `337,302 B` | `43,231 B` | `31,050 B` | `-13.8%` | `-11.0%` | `-9.4%` |
| Strip parser/source positions + tuple shape | `301,122 B` | `42,783 B` | `31,168 B` | `-23.1%` | `-11.9%` | `-9.1%` |

Conclusion:

- The compact ComponentDef serialization hypothesis is weak as a standalone next implementation step.
  - Property names repeat heavily, but gzip/brotli already compress them very well.
  - A tuple representation would complicate runtime code while improving compressed size by less than `3%` in this measurement.
- The more important finding is that source/parser position metadata still exists outside the previously stripped `debug` field.
  - Removing these fields has a materially better compressed-size signal than compact keys or tuple encoding.
  - This is also more aligned with the original production-vs-dev concern: fields useful for diagnostics/source mapping should not necessarily ship in SSG/production runtime graphs.
- Recommendation:
  - Do not prototype compact tuple rendering yet.
  - Insert a new next step before broader markdown-retention work: identify the exact owner and runtime consumers of `startPosition`, `endPosition`, `startLine`, `endLine`, `startColumn`, `endColumn`, `nodeId`, `startToken`, and `endToken`; then prototype stripping them in production/SSG only and validate with the same SSG preview + targeted tests.
- Stop here and wait for approval before implementing that parser-position strip.

### 7a. Strip Production Script Token Metadata

This step was added after the compact serialization measurements above. The measurement showed that compact object keys or tuple-shaped ComponentDefs do not buy much once gzip/brotli are applied, but parser token/source metadata is still present in production-shaped graphs and has a stronger size signal.

Implementation:

- Added a production/SSG-default `stripComponentSourceMetadata` option to the Vite XMLUI plugin.
- The transform runs after build-time analyzers/type-contract checks and after script compilation decisions, but before `dataToEsm()` emits the browser/runtime module.
- The final implementation strips only script AST `startToken` and `endToken` fields.
- It intentionally preserves `nodeId`, because runtime script execution and compiled-event cache/source IDs use it.
- I did not globally delete arbitrary `startLine`, `endLine`, `startPosition`, or similarly named properties. That broader prototype was rejected during implementation because it could alter user data if a literal object happened to contain those keys.

Validation measurements:

| Metric | Before this step | After this step | Delta / note |
| --- | ---: | ---: | --- |
| SSR render bundle | `10,281.98 kB` / gzip `1,884.25 kB` | `10,186.60 kB` / gzip `1,875.40 kB` | `-95.38 kB` raw, `-8.85 kB` gzip. |
| Client main bundle | about `11,313.86 kB` / gzip `2,646.43 kB` in the broad prototype run | `11,314.16 kB` / gzip `2,646.45 kB` | No meaningful client bundle win; this route's retained payload is dominated elsewhere. |
| Initial mounted/deferred playgrounds | `1 / 34` | `1 / 34` | Same lazy-mount behavior. |
| After-scroll mounted/deferred playgrounds | `35 / 0` | `35 / 0` | Same full activation behavior. |
| Scroll height | `25365 -> 25365` | `25365 -> 25365` | `0 px` drift. |
| Initial CDP JS heap after forced GC | `74.39 MB` | `74.33 MB` | No material heap change. |
| After-scroll CDP JS heap after forced GC | `235.64 MB` | `235.85 MB` | No material heap change. |

Validation:

- `npx vitest run xmlui/tests/bin/vite-plugin-import.test.ts`: passed, `45` tests.
- `npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts -g "xmlui-pg"`: passed, `13` tests.
- `npm run build-ssg -w website`: completed successfully.
- The known existing `RangeError: Invalid time value` appeared again for the `supabase-and-xmlui` blog route and did not fail the build.

Conclusion:

- The original suspicion is supported in a narrower form: embedded apps and website XMLUI sources did carry script parser token objects into production-shaped emitted modules.
- Removing those tokens gives a clear SSR/static build-size improvement, but does not materially reduce browser heap on `/docs/guides/layout` with the current lazy-mount/default-height optimizations.
- The safe production strip should be kept. Broader deletion of `nodeId` or arbitrary position-like property names should not be done without a separate AST-specific design, because `nodeId` is runtime-significant and arbitrary property-name stripping can change user data.

### 8. Reduce Markdown/CodeFence Retention For `xmlui-pg`

Expected impact: Medium.

`xmlui-pg` examples may retain both rendered markdown structures and source/highlight metadata. The page needs visible code and copyable source, but it may not need full parser/intermediate structures after rendering.

Hypothesis:

The markdown rendering path retains intermediate AST/codefence/highlight structures longer than necessary, especially for pages with several live XMLUI examples.

Experiment:

- Instrument markdown and playground rendering to count retained source strings, highlight metadata, and parsed markdown/codefence objects.
- Prototype dropping intermediate structures after deriving:
  - visible highlighted output,
  - copy source,
  - playground app source.

No-deployment validation:

- Build SSG and preview locally.
- Measure `/docs/guides/layout` idle and after opening/copying code examples.
- Confirm highlighting, copied content, and playground source remain correct.

Success signal:

- Heap drops on markdown-heavy pages with `xmlui-pg`.
- Source/copy/highlight behavior remains correct.

Falsification signal:

- SSG already serializes only final render output plus needed source.
- Retained source/highlight data is small compared with playground runtime graphs.

Stop gate:

- Stop after instrumentation and measurement. Wait for approval.

Measurement result, local SSG preview, `/docs/guides/layout`:

- Status: completed as measurement-only investigation.
- No production/source optimization was implemented in this step.
- Measurement method:
  - Served the existing local SSG output with `npm run preview-ssg -w website`.
  - Ran a temporary Playwright/CDP script against `http://localhost:3000/docs/guides/layout`.
  - Forced GC before the initial and after-scroll samples.
  - Counted DOM/code block presence and relevant React fiber prop string surfaces:
    - `data-pg-content` and `data-pg-markdown`,
    - decoded playground `markdown` and `app` props,
    - `textToCopy`,
    - highlighted `dangerouslySetInnerHTML.__html`,
    - mounted shadow roots.

| Metric | Initial | After scrolling through page | Delta / interpretation |
| --- | ---: | ---: | --- |
| CDP JS heap `usedSize` | `77.95 MB` | `246.52 MB` | Nested app activation is still the large JS-heap growth. |
| CDP `embedderHeapUsedSize` | `40.22 MB` | `56.92 MB` | Shadow DOM/CSSOM-related embedder memory grows as apps mount. |
| Combined heap sample | `118.17 MB` | `303.45 MB` | Same broad shape as the accepted `320px` lazy-mount result. |
| React fibers traversed | `15,511` | `23,184` | Mounting deferred playgrounds adds about `7,673` fibers. |
| DOM elements, including shadow DOM | `8,118` | `8,850` | Deferred app activation adds DOM, but not the hidden code views. |
| Playground containers | `35` | `35` | Same route shape. |
| Visible shadow roots | `1` | `35` | Confirms `34` deferred apps activate during scroll. |
| Hidden split-code Markdown blocks | `41` | `41` | Hidden code/source panes are already present at initial load. |
| Code block DOM nodes | `218` | `218` | Code blocks are not created by nested app activation; they already exist initially. |
| `data-pg-content` DOM elements | `0` | `0` | Base64 playground carrier elements are consumed by React rendering, not retained in final DOM. |
| `data-pg-markdown` DOM elements | `0` | `0` | Same as above. |
| React prop `data-pg-content` strings | `35`, `13,332 chars` | `35`, `13,332 chars` | Base64 carrier props remain visible in React fiber props, but the size is small. |
| React prop `data-pg-markdown` strings | `35`, `12,616 chars` | `35`, `12,616 chars` | Small relative to heap. |
| Decoded `markdown` props | `35`, `9,434 chars` | `35`, `9,434 chars` | Small. |
| Decoded `app` props | `106`, `22,595 chars` | `140`, `29,984 chars` | Grows as deferred nested apps mount; still small as raw string surface. |
| `textToCopy` strings | `207`, `43,104 chars` | `207`, `43,104 chars` | Present from initial render. |
| Highlighted HTML strings | `459`, `294,909 chars` | `459`, `294,909 chars` | Present from initial render. |

Findings:

- The broad idea that markdown/codefence structures contribute to initial memory is supported, but not through large retained raw source strings.
- The base64 `xmlui-pg` carriers and decoded playground source strings are small on this page: together they are only tens of KB of string content.
- The bigger signal is structural:
  - every framed playground renders its split-view source `Markdown` immediately,
  - the source pane is hidden with CSS when the UI preview is selected,
  - as a result, all syntax-highlighted code block DOM/React structures already exist before the deferred apps are mounted.
- This explains why the initial page still contains `218` code block nodes and about `295 KB` of highlighted HTML even though only one nested app is mounted.
- After-scroll heap growth is dominated by nested app activation, not by source/code view creation, because source/code view creation has already happened.

Conclusion:

- This hypothesis is partially supported and now more specific.
- It is not worth optimizing the base64 carrier or raw `markdown`/`app` strings first; their measured size is too small.
- A possible follow-up would be to defer rendering the split-view source Markdown until the user switches a playground to the XML/code view, while keeping the raw source string available for pop-out/copy semantics.
- Follow-up decision:
  - This prototype was intentionally skipped after review.
  - Historical note: the skip decision was made after the measurement above showed a real but likely modest source-pane retention signal, and after the user clarified that the XML/code view is rarely used in current docs content, currently only in one place.
  - Because the user-facing feature is rare and the likely memory win is smaller than the already implemented lazy app mount/shared stylesheet work, the plan moves on to the reusable measurement harness instead of implementing this optimization now.

### 9. Add A Dedicated Memory Regression Harness

Expected impact: Indirect but high leverage.

This does not reduce memory by itself, but it makes each hypothesis measurable without deployment and prevents future regressions.

Hypothesis:

A repeatable local Playwright/CDP harness will make optimization decisions safer and faster than ad hoc profiling.

Experiment:

- Add a local script, not necessarily CI-enforced at first, that:
  - launches the already-built preview URL,
  - forces GC,
  - records heap, DOM counts, React fiber counts, ComponentDef-like key counts,
  - opens search and runs representative queries,
  - optionally scrolls and activates playgrounds.

No-deployment validation:

- Run it against local SSG preview.
- Compare output with the baseline numbers in this plan.

Success signal:

- The script reproduces measurements within reasonable variance.
- It can be reused for every hypothesis above.

Falsification signal:

- Measurements are too noisy to compare.
- The harness changes page behavior or memory materially.

Stop gate:

- Stop after the harness can reproduce baseline. Wait for approval before making it part of package scripts or CI.

Result after implementation:

- Added `website/scripts/measure-memory.mjs`.
- Added a local package script:

```sh
npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout
```

- The harness expects a production-like preview to already be running, for example:

```sh
npm run preview-ssg -w website
```

- The script:
  - launches Chromium with Playwright,
  - uses CDP `Runtime.getHeapUsage`,
  - forces GC before samples,
  - records initial and after-scroll memory,
  - records React fiber count,
  - records ComponentDef-like object counts using the stricter production shape `type + uid`,
  - records `debug`, `debug.source`, `startToken`, and `endToken` counts,
  - records playground/shadow-root activation counts,
  - records DOM/code-block counts,
  - smoke-tests docs search with `layout`, `stack`, and `grid`,
  - supports `--json`, `--no-scroll`, `--url`, and `--search`.

Validation run, local SSG preview, `/docs/guides/layout`:

| Metric | Initial | After scrolling through page | Interpretation |
| --- | ---: | ---: | --- |
| CDP JS heap `usedSize` | `74.33 MB` | `237.18 MB` | Reproduces the current lazy-mount memory shape. |
| CDP `embedderHeapUsedSize` | `38.35 MB` | `56.32 MB` | Embedder heap grows as shadow-root apps activate. |
| Combined heap sample | `112.68 MB` | `293.50 MB` | Close to the previous accepted `320px` lazy-mount measurements. |
| React fibers | `15,511` | `23,206` | Deferred apps add about `7.7k` fibers after activation. |
| ComponentDef-like objects | `5,493` | `7,463` | Uses the new stricter `type + uid` detector; not directly comparable to older broader counters. |
| `debug` / `debug.source` counts | `0 / 0` | `0 / 0` | Confirms production debug strip remains effective in preview. |
| `startToken` / `endToken` counts | `0 / 0` | `0 / 0` | Confirms production token strip remains effective in preview. |
| Playground containers | `35` | `35` | Same route shape. |
| Visible shadow roots | `1` | `35` | Confirms lazy app activation path. |
| Inactive playgrounds | `34` | `0` | Derived as containers minus visible shadow roots. |
| Main scroll height | `25365` | `25365` | Scroll height remains stable. |
| Search smoke | `layout`, `stack`, `grid`: all passed | n/a | Search still works in local preview. |

Validation:

- `node --check website/scripts/measure-memory.mjs`: passed.
- `npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout`: passed.

Conclusion:

- The harness hypothesis is supported: the new local script reproduces the current baseline closely enough to be useful for subsequent experiments.
- Keep it as a local/manual measurement tool for now; do not add a CI threshold yet because heap numbers vary and the current value is most useful as a comparative profiler.
- Stop here and wait for approval before selecting another optimization hypothesis.

### 10. Measure Per-Playground Retained Cost After Activation

Expected impact: Diagnostic first; potentially medium to high if it identifies a safe after-scroll memory strategy.

Historical note:

This step was added after the accepted `320px` lazy-mount/default-height work. That work reduced initial memory substantially, but after-scroll memory still grows because every embedded playground eventually mounts and stays mounted.

Hypothesis:

The remaining after-scroll memory is mostly proportional to the number of activated `xmlui-pg` apps. Measuring growth per activation batch can tell us whether the next optimization should target:

- per-app runtime/provider overhead,
- unusually expensive specific examples,
- an optional “hibernate after leaving viewport” strategy,
- or documentation/example simplification.

Experiment:

- Extend the local memory harness with checkpointed scrolling.
- Record heap, React fibers, ComponentDef-like counts, DOM counts, and active shadow-root counts after each scroll checkpoint.
- Keep this measurement route-local and deployment-free.

Implementation:

- Added `--checkpoints <count>` to `website/scripts/measure-memory.mjs`.
- The option samples evenly spaced scroll positions before the final fine-grained full-page scroll.
- The script now prints checkpoint summaries in text mode and includes checkpoint sample objects in JSON mode.
- No app/runtime optimization was implemented in this step.
- Nothing was skipped in the implementation of this measurement step.

Validation:

- `node --check website/scripts/measure-memory.mjs`: passed.
- Local SSG preview was served with `npm run preview-ssg -w website`.
- Measurement command:

```sh
npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --checkpoints 12 --json
```

Checkpoint measurement, local SSG preview, `/docs/guides/layout`:

| Sample | Scroll top | Active playgrounds | Combined heap | React fibers | ComponentDefs | DOM elements | Note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Initial | `0` | `1` | `113.06 MB` | `15,511` | `5,493` | `8,118` | Initial lazy-mount baseline. |
| 1/12 | `2,030` | `2` | `120.96 MB` | `16,022` | `5,513` | `8,152` | First additional playground mounted. |
| 2/12 | `4,061` | `3` | `126.69 MB` | `16,237` | `5,573` | `8,171` | Small incremental growth. |
| 3/12 | `6,091` | `3` | `126.61 MB` | `16,237` | `5,573` | `8,171` | No new activation. |
| 4/12 | `8,122` | `6` | `141.18 MB` | `17,124` | `5,753` | `8,248` | Three more playgrounds activated. |
| 5/12 | `10,152` | `8` | `151.01 MB` | `17,614` | `5,873` | `8,296` | Growth remains roughly proportional. |
| 6/12 | `12,183` | `10` | `161.43 MB` | `17,944` | `5,993` | `8,324` | Two more playgrounds. |
| 7/12 | `14,213` | `12` | `172.24 MB` | `18,382` | `6,113` | `8,362` | Two more playgrounds. |
| 8/12 | `16,243` | `14` | `182.38 MB` | `18,784` | `6,233` | `8,398` | Two more playgrounds. |
| 9/12 | `18,274` | `16` | `192.75 MB` | `19,186` | `6,353` | `8,434` | Two more playgrounds. |
| 10/12 | `20,304` | `18` | `203.24 MB` | `19,624` | `6,473` | `8,474` | Two more playgrounds. |
| 11/12 | `22,335` | `20` | `214.12 MB` | `20,102` | `6,593` | `8,529` | Two more playgrounds. |
| 12/12 | `24,365` | `22` | `223.54 MB` | `20,461` | `6,683` | `8,578` | Jumping directly to the bottom did not activate every playground. |
| Final full scroll | `24,365` | `35` | `284.28 MB` | `23,704` | `7,463` | `8,855` | Fine-grained sweep activates all deferred playgrounds. |

Derived observations:

- The after-scroll increase is strongly activation-count driven.
- From initial to final full scroll:
  - active playgrounds: `1 -> 35`, so `+34`,
  - combined heap: `113.06 MB -> 284.28 MB`, so `+171.22 MB`,
  - rough average retained cost: about `5.0 MB` combined heap per additional activated playground.
- From initial to checkpoint `12/12`:
  - active playgrounds: `1 -> 22`, so `+21`,
  - combined heap: `113.06 MB -> 223.54 MB`, so `+110.48 MB`,
  - rough average retained cost: about `5.3 MB` per additional activated playground.
- From checkpoint `12/12` to final full scroll:
  - active playgrounds: `22 -> 35`, so `+13`,
  - combined heap: `223.54 MB -> 284.28 MB`, so `+60.74 MB`,
  - rough average retained cost: about `4.7 MB` per additional activated playground.
- The relationship is fairly linear for this route; no single checkpoint suggests one extreme outlier dominating the page.
- A direct jump to the bottom does not trigger all lazy mounts. A full sweep through intermediate positions is required to measure worst-case “user read the whole page” memory.
- `debug`, `debug.source`, `startToken`, and `endToken` remained zero throughout this measurement.
- Main scroll height stayed stable at `25365`.
- Search smoke still passed for `layout`, `stack`, and `grid`.

Conclusion:

- The hypothesis is supported: after-scroll memory is primarily the sum of mounted playground runtimes, not a single obvious leak or one extreme example.
- The next meaningful memory reduction would need to address retained activated playgrounds.
- The most promising candidate is an explicit, carefully designed “hibernate offscreen playgrounds” mode:
  - keep the fixed `320px` frame so scroll stability remains intact,
  - preserve “mounted once” behavior for playgrounds that receive user interaction,
  - only hibernate never-touched examples after they are far outside the viewport,
  - measure reverse-scroll behavior, remount cost, and whether state loss is acceptable or avoidable.
- This is a product/UX-sensitive change because current lazy mounting intentionally preserves state after first activation.
- Stop here and wait for approval before designing or prototyping hibernation.

## Recommended Order

1. Strip ComponentDef `debug` metadata in production/SSG builds.
2. Share runtime infrastructure across mounted `xmlui-pg` apps.
3. Lazy-mount or defer `xmlui-pg` embedded apps, only after layout-height and scroll-stability risks are addressed.
4. Normalize empty optional ComponentDef collections.
5. Estimate compact production ComponentDef serialization.
6. Reduce markdown/codefence intermediate retention.
7. Add or formalize the memory regression harness.

This order starts with the lowest-risk production-only memory reduction. The `xmlui-pg` hypotheses may still have high impact, but lazy/deferred mounting must not be attempted until the preview height and scroll behavior can be kept stable.
