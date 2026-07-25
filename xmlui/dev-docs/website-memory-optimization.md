# Website Memory Optimization Notes

This document summarizes the memory investigation and optimization work done for
the XMLUI documentation website, with special attention to pages that contain
many `xmlui-pg` embedded playgrounds.

The main investigated route was:

```text
/docs/guides/layout
```

That page is a useful stress case because it contains 35 `xmlui-pg` examples.
Each example can behave as a small independent XMLUI application with its own
React root, shadow root, providers, parsed ComponentDefs, state containers, code
view, and styling infrastructure.

## Problem Summary

Users reported that the docs website consumed too much memory, especially around
search and pages with many embedded examples.

The investigation found three separate classes of issues:

1. The earlier search issue was caused by runtime indexing of hidden docs pages
   even though static search data was already available. That was fixed before
   the `xmlui-pg` memory work described here.
2. The production docs route `/docs/guides/layout` retained a large amount of
   memory because it mounted many embedded XMLUI playgrounds and duplicated
   runtime/style infrastructure for each one.
3. A later reload-specific investigation showed that scrolling a playground-heavy
   page and then refreshing could leave Chromium renderer RSS much higher than
   the forced-GC JS object graph suggested. The effective mitigation was to keep
   never-interacted offscreen playgrounds hibernated and to remove repeated
   nested root theme CSS for playgrounds that simply inherit the host theme.

The important conclusion is that the largest wins did not come from one leak.
They came from removing repeated per-playground costs and avoiding unnecessary
initial mounting.

## How We Measured

The production-like local workflow is:

```sh
npm run build-ssg -w website
npm run preview-ssg -w website
```

The preview server serves `website/dist-ssg`, which matches the deployment
workflow closely enough for local no-deployment validation.

A reusable local measurement script was added:

```sh
npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout
```

For scroll checkpoint measurements:

```sh
npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --checkpoints 12
```

The script uses Playwright and Chrome DevTools Protocol to:

- force garbage collection,
- read `Runtime.getHeapUsage`,
- count React fibers reachable from DOM roots,
- count ComponentDef-like objects,
- count production-only debug/token metadata,
- count nested playground containers and active shadow roots,
- count lazy playground wrapper states,
- collect Chromium process RSS for reload experiments,
- count DOM/code block structures,
- count nested app style text and XMLUI CSS variable references,
- smoke-test docs search with `layout`, `stack`, and `grid`.

The heap numbers should be treated as comparative measurements, not absolute
budgets. They vary across machines and Chrome versions. The useful signal is
before/after movement under the same script and route.

## Baseline

The first production-shaped SSG preview baseline for
`/docs/guides/layout` showed:

| Metric | Baseline |
| --- | ---: |
| JS heap after forced GC | about `195 MB` |
| React fibers | `15,272` |
| ComponentDef-like objects in React props | `3,562` |
| ComponentDefs with `debug` | `819` |
| `debug.source` | `819` |
| `debug.attributes` | `739` |
| DOM elements | `8,134` |
| `data-component-type` elements | `173` |

The same shape was observed on the public production site, so local SSG preview
was accepted as the validation target.

## Change 1: Strip ComponentDef Debug Metadata In Production

Affected file:

- `xmlui/src/nodejs/vite-xmlui-plugin.ts`

Production/SSG builds were retaining `ComponentDef.debug` metadata. This is
useful in development for diagnostics and source mapping, but it is unnecessary
for normal production rendering.

The Vite XMLUI plugin now strips `debug` from emitted ComponentDef graphs by
default outside dev-server mode. Dev builds keep the metadata.

Result:

| Metric | Before | After |
| --- | ---: | ---: |
| `debug` / `debug.source` / `debug.attributes` / `debug.reactiveNodes` | non-zero | `0` |
| SSR bundle | about `12.32 MB` / gzip `2.04 MB` | about `10.28 MB` / gzip `1.88 MB` |
| Browser JS heap | about `195 MB` | about `195 MB` |

This was a good production payload cleanup, but it was not a major browser heap
win. The main heap problem was elsewhere.

## Change 2: Share Constructed Stylesheets Across Nested Apps

Affected file:

- `xmlui/src/components/NestedApp/NestedAppReact.tsx`

This was the largest confirmed memory win.

Each embedded playground renders into its own shadow root. Before the change,
each shadow root received fresh constructed `CSSStyleSheet` objects copied from
the same document-level stylesheets.

On `/docs/guides/layout` this meant:

| Metric | Before |
| --- | ---: |
| Nested app shadow roots | `35` |
| Adopted stylesheet slots | `175` |
| Unique constructed `CSSStyleSheet` objects | `175` |
| Repeated CSS rules across slots | `603,785` |
| Estimated repeated CSS text | about `157 MB` |
| CDP embedder heap sample | about `419 MB` |

The fix introduced a module-level cache for constructed stylesheets derived from
document stylesheets. The cache is keyed by a stylesheet signature. Shadow roots
still get the same set of adopted stylesheets, but the immutable constructed
stylesheet objects are reused.

After the change:

| Metric | After |
| --- | ---: |
| Nested app shadow roots | `35` |
| Adopted stylesheet slots | `175` |
| Unique constructed `CSSStyleSheet` objects | `5` |
| CDP embedder heap sample | about `50-51 MB` |

The important design point: this shares immutable style infrastructure only. It
does not share React roots, app state, dynamic style registries, provider trees,
or playground state.

## Change 3: Lazy-Mount Embedded Playground Apps

Affected files:

- `xmlui/src/components/NestedApp/NestedAppReact.tsx`
- `xmlui/src/components/NestedApp/AppWithCodeViewReact.tsx`

The page originally mounted every embedded playground during initial render.
That is expensive because each playground is a real XMLUI application.

`LazyNestedApp` now supports deferred mounting using `IntersectionObserver`.
It mounts when the placeholder approaches the viewport, with:

```text
rootMargin: 800px 0px
```

In the first version of this change, once mounted, the app remained mounted.
That preserved playground state after the first activation, but later reload
profiling showed that it still left too many embedded apps alive after a full
scroll. Change 7 refined this behavior with offscreen hibernation for
never-interacted lazy playgrounds.

The first conservative prototype deferred only examples with explicit `height`.
That was safe but had almost no effect on `/docs/guides/layout`, because only
one playground on that page had an explicit outer height.

The broader solution required stable height reservation.

## Change 4: Default Implicit Playground Height

Affected files:

- `xmlui/src/components/NestedApp/AppWithCodeViewReact.tsx`
- `xmlui/src/components/Markdown/MarkdownReact.tsx`
- `xmlui/src/components/NestedApp/AppWithCodeView.tsx`
- `website/content/docs/pages/playground-and-codefence.md`

Lazy mounting is only safe if the placeholder and the eventual mounted
playground occupy the same height. Otherwise, the page changes height as
playgrounds activate, which can break scroll position, anchors, and table of
contents navigation.

We tested a broad lazy-mount prototype with a guessed `160px` placeholder. It
confirmed the memory benefit but also confirmed the scroll risk:

| Metric | Result |
| --- | ---: |
| Initial combined heap | about `118 MB` |
| After-scroll combined heap | about `302 MB` |
| Scroll height | `21315 -> 19739` |
| Scroll drift | `-1576 px` |

The final accepted approach defines a documented default implicit playground
height:

```ts
export const DEFAULT_IMPLICIT_PLAYGROUND_HEIGHT = "320px";
```

When an `xmlui-pg` fence does not specify `height`, the docs renderer uses
`320px` both for the initial placeholder and for the mounted playground frame.
Explicit `height` still wins.

Measured sweep:

| Default height | Initial combined heap | After-scroll combined heap | Scroll drift | Page length impact |
| --- | ---: | ---: | ---: | ---: |
| `400px` | about `118 MB` | about `305 MB` | `0 px` | Too much page growth |
| `320px` | about `119 MB` | about `302 MB` | `0 px` | Best compromise |
| `240px` | about `119 MB` | about `303 MB` | `0 px` | More clipping risk |

Final accepted implementation on `/docs/guides/layout`:

| Metric | Initial | After scroll |
| --- | ---: | ---: |
| Nested containers | `35` | `35` |
| Mounted apps | `1` | `35` |
| Deferred apps | `34` | `0` |
| Combined heap | about `113 MB` | about `289-293 MB` |
| Scroll height | `25365` | `25365` |
| Scroll drift | `0 px` | `0 px` |

The tradeoff is that implicit examples can become taller than their previous
auto-height rendering. The best long-term authoring pattern is to give important
docs examples explicit, example-specific heights. The `320px` default remains a
safe fallback.

## Change 5: Normalize Empty Optional ComponentDef Collections

Affected files:

- `xmlui/src/nodejs/vite-xmlui-plugin.ts`
- `xmlui/src/components-core/StandaloneApp.tsx`

The ComponentDef type has many optional collection fields, such as `props`,
`events`, `vars`, `children`, `functions`, `uses`, and internal saved
definitions. Empty arrays/objects add object overhead and can also alter runtime
shape checks.

The production/SSG plugin now has a `normalizeComponentDefCollections` path that
removes empty optional collections from emitted ComponentDef graphs. Dev-server
output keeps the fuller parser shape.

`StandaloneApp` was also adjusted so code-behind merge paths avoid synthesizing
empty `vars: {}` or `functions: {}` when both sides are empty.

Measured impact on the website route was small. This should be understood as
runtime-shape hygiene, not a headline memory win.

## Change 6: Strip Production Script Token Metadata

Affected file:

- `xmlui/src/nodejs/vite-xmlui-plugin.ts`

The compact ComponentDef serialization experiment showed that compact keys or
tuple-shaped ComponentDefs would not help much after gzip/brotli. The better
signal was parser/source metadata still retained in production-shaped graphs.

The safe final change strips only script AST token references:

```text
startToken
endToken
```

It intentionally preserves `nodeId`, because runtime script execution and
compiled-event cache/source IDs use it. It also does not blindly delete generic
position-like keys such as `startLine` or `startPosition`, because those keys can
exist in user data and should not be removed by a production serializer.

Measured impact:

| Metric | Before | After |
| --- | ---: | ---: |
| SSR render bundle | `10,281.98 kB` / gzip `1,884.25 kB` | `10,186.60 kB` / gzip `1,875.40 kB` |
| Initial JS heap | `74.39 MB` | `74.33 MB` |
| After-scroll JS heap | `235.64 MB` | `235.85 MB` |

This is a useful production payload cleanup. It is not a major browser heap win.

## Change 7: Hibernate Never-Interacted Offscreen Playgrounds

Affected file:

- `xmlui/src/components/NestedApp/NestedAppReact.tsx`

After the initial lazy-mounting work, playgrounds still stayed mounted forever
once they had entered the viewport. That preserved state, but it also meant a
full scroll through `/docs/guides/layout` eventually left all 35 embedded apps
alive.

The later reload investigation showed that this mattered even when forced-GC JS
heap looked stable. After scrolling to the bottom and refreshing repeatedly,
Chromium renderer RSS could grow toward the high browser task-manager footprint
reported by users.

The accepted mitigation is offscreen hibernation for lazy playgrounds that have
never received user interaction:

- lazy playgrounds mount as they approach the viewport,
- never-interacted lazy playgrounds may unmount again when they move far
  offscreen,
- focus, keyboard, or pointer interaction marks the playground as interacted,
- interacted playgrounds remain mounted to preserve user state,
- immediate playgrounds remain mounted,
- the reserved frame height remains stable while the app is hibernated.

The implementation also exposes the wrapper state for diagnostics:

```html
data-nested-app-lazy-state="mounted|hibernated"
```

Measured impact on the local production-like SSG preview:

| Scenario | JS + embedder heap | Chromium process RSS | Active shadow roots |
| --- | ---: | ---: | ---: |
| Before hibernation, after full scroll | about `306 MB` | about `980 MB` | `35` |
| Before hibernation, after 5 reloads | about `305 MB` | about `1.12 GB` | `35` |
| No-scroll control, after 5 reloads | about `115 MB` | about `758 MB` | `1` |
| With hibernation, after full scroll | about `130-140 MB` | about `756-807 MB` | `2-3` |
| With hibernation, after 5 reloads | about `131-142 MB` | about `856-937 MB` | `2-4` |

The RSS values are noisy across Chrome runs, but the structural signal was
stable: after a full scroll only viewport-near or interacted playgrounds stayed
mounted, while the other wrappers were hibernated and kept their reserved
height.

## Change 8: Suppress Redundant Nested Root Theme CSS

Affected files:

- `xmlui/src/components-core/rendering/AppRoot.tsx`
- `xmlui/src/components/Theme/Theme.tsx`
- `xmlui/src/components/Theme/ThemeReact.tsx`
- `xmlui/src/components/NestedApp/NestedAppReact.tsx`
- `xmlui/src/components/NestedApp/AppWithCodeViewReact.tsx`

Each nested playground has its own root `Theme`. For playgrounds with their own
theme or tone, that is necessary. But many docs examples simply inherit the
website's current theme and never mutate it locally.

For those purely inherited playgrounds, emitting a full nested root Theme CSS
variable block duplicated a large set of CSS custom properties inside each
shadow root. The fix adds an internal `suppressRootThemeCssVars` path:

- `AppRoot` can pass the internal flag to the implicit root `Theme`.
- `Theme` treats the flag as a control prop, not as a user theme variable.
- `ThemeReact` skips the full compiled root CSS-var block only for root Themes
  when suppression is explicitly enabled.
- Nested apps enable suppression only when the playground has no explicit
  `activeTheme`, `defaultTheme`, `activeTone`, `defaultTone`, or local themes.
- Explicitly themed or toned playgrounds keep full Theme CSS isolation.

Local SSG preview measurement on `/docs/guides/layout`:

| Metric after scroll | Hibernation only | Theme CSS suppression | Change |
| --- | ---: | ---: | ---: |
| Style text | about `0.70 MB` | about `0.43 MB` | about `39%` lower |
| XMLUI CSS var references | `20,904` | `12,838` | about `39%` lower |
| 5-reload final RSS | about `816 MB` | about `770 MB` | about `46 MB` lower in that run |
| Scroll height | `25,365` | `25,365` | stable |
| Active shadow roots | `2` | `2` | unchanged |

This was a narrower and safer alternative than sharing mutable style registries
across nested app isolation boundaries. It removes redundant root variable
emission only when the nested app intentionally inherits the host theme.

## Change 9: Preserve Local Tone Mutation And Playground Height Semantics

Affected files:

- `xmlui/src/components/NestedApp/AppWithCodeViewReact.tsx`
- `xmlui/src/components/NestedApp/NestedAppReact.tsx`
- `xmlui/src/components/Markdown/Markdown.spec.ts`

The Theme CSS suppression surfaced two visual regressions on
`/docs/tutorial-02`, in the `Footer` section's `Try clicking the ToneSwitch`
example.

The first regression was theme-related: the example did not declare a custom
theme or tone, so it looked like a purely inherited playground. However, it
contained a local `ToneSwitch`. A local tone controller mutates the nested app's
own theme tone context at runtime, so the nested root Theme CSS must remain
available.

The eligibility check now treats playgrounds containing local tone controllers
as dynamic, not statically inherited:

```text
<ToneSwitch>
<ToneChangerButton>
```

Those playgrounds keep the full nested root Theme CSS, while passive inherited
playgrounds still get the memory optimization.

The second regression was layout-related. The lazy wrapper reserved space with
`minHeight`, but it did not set a definite `height` when the playground supplied
an explicit or implicit height. The mounted `NestedApp` uses `height: 100%`; with
only a min-height parent, that percentage could collapse to content height. In a
Footer example, this made the footer appear directly under the playground
header, with blank reserved space below it.

The lazy wrapper now uses both `height` and `minHeight` when a playground height
exists. Direct lazy nested apps without a supplied height keep the previous
min-height-only behavior.

Targeted validation:

| Check | Result |
| --- | --- |
| `npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts -g "xmlui-pg" --reporter=line` | Passed, `17/17` |
| `npm run build-ssg -w website` | Passed |
| Local SSG preview `/docs/tutorial-02` tone check | The `ToneSwitch` changes the embedded example to dark tone. |
| Local SSG preview `/docs/tutorial-02` footer geometry check | Shadow host height `277px`, app height `277px`, footer bottom gap `0px`. |
| Full E2E suite | Run by the user after the fix; no regression reported. |

## What We Did Not Implement

### Compact Tuple ComponentDefs

A measurement-only serializer estimated:

| Representation | Raw JSON delta | Gzip delta | Brotli delta |
| --- | ---: | ---: | ---: |
| Compact object keys | `-13.0%` | `-2.5%` | about `0%` |
| Tuple-shaped ComponentDefs | `-16.1%` | `-2.9%` | `-0.5%` |

Because compression already handles repeated property names well, tuple-shaped
runtime ComponentDefs would add complexity for little compressed-size benefit.
We did not implement it.

### Lazy Rendering Of The XML/Code Source Pane

Measurement showed that hidden source panes are rendered up front:

| Metric | Initial | After scroll |
| --- | ---: | ---: |
| Hidden split-code Markdown blocks | `41` | `41` |
| Code block nodes | `218` | `218` |
| Highlighted HTML strings | about `295 KB` | about `295 KB` |

This is a real source of initial DOM/React work, but the raw measured string
surface is small compared with the embedded app runtime costs. The prototype was
intentionally skipped after confirming that the XML/code view is rarely used in
current docs content.

### Mounted-App Cap

After offscreen hibernation, we also tested a stricter cap on the number of
mounted never-interacted lazy playgrounds. The aggressive prototype allowed only
one non-interacted lazy nested app to stay mounted at a time.

The cap worked structurally:

| Metric after scroll | Result |
| --- | ---: |
| Lazy mounted wrappers | `1` |
| Lazy hibernated wrappers | `34` |
| Active shadow roots | `1` |
| Scroll height | `25,365` |

But it did not improve the main RSS metric. In the measured run, the 5th reload
ended around `870 MB`, slightly worse than the viewport-only hibernation run.

Because the cap added coordination complexity and did not reduce Chromium
process RSS, it was removed. The diagnostic lazy wrapper state counts were kept
because they remain useful for future measurements.

## Current Mental Model

The current memory behavior of `xmlui-pg` docs pages is:

1. Initial page load keeps the host docs app, markdown structures, source/code
   panes, and only viewport-near playground apps mounted.
2. As the user scrolls, more playgrounds mount through `IntersectionObserver`.
3. Never-interacted lazy playgrounds may hibernate again when they move far
   offscreen.
4. Interacted and immediate playgrounds remain mounted to preserve state.
5. The shared constructed stylesheet cache prevents each playground shadow root
   from duplicating the same large CSSOM structures.
6. Purely inherited nested playgrounds do not re-emit the full root Theme CSS
   variable block.
7. Production builds strip debug and token metadata, but those are not the
   dominant heap cost.

In other words:

- initial memory was significantly reduced,
- production payload shape is cleaner,
- after-scroll memory is now bounded by viewport-near and user-interacted
  embedded applications, not by every playground the user has ever scrolled
  past.

## Recommended Follow-Up Work

### Prefer Explicit Heights In Docs Authoring

The best layout/memory authoring pattern is to give `xmlui-pg` examples explicit
heights when practical.

Explicit heights allow:

- stable lazy placeholders,
- lower initial memory,
- no scroll drift,
- better control than the generic `320px` fallback.

The `320px` default should remain a safety fallback, not the ideal for every
example.

### Keep The Memory Harness Manual For Now

Do not add hard CI thresholds yet. Heap measurements are noisy. The script is
best used as a local comparative profiler:

```sh
npm run preview-ssg -w website
npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout --checkpoints 12
```

Useful checks:

- `debug` and `debug.source` should stay at `0` in SSG preview.
- `startToken` and `endToken` should stay at `0` in SSG preview.
- initial active playground count should remain low on pages with many examples.
- after-scroll lazy wrapper state should show most never-interacted examples as
  hibernated on playground-heavy pages.
- scroll height should remain stable before and after activation.
- inherited examples should avoid nested root Theme CSS, while tone-mutating
  examples such as `ToneSwitch` should still keep it.

### Further Memory Reductions

The remaining large reductions are unlikely to come from simple object cleanup.
The cap experiment showed that reducing viewport-near mounted apps from two or
three down to one did not materially improve Chromium RSS.

Further improvements would probably require content or isolation changes with a
larger product surface:

- reduce the number of embedded apps on very dense docs pages,
- give important playgrounds explicit, tighter heights,
- revisit the rarely used XML/code pane only if source-view usage grows,
- consider broader style-registry or iframe/process isolation work only with
  dedicated visual and interaction regression coverage.

## Validation Performed During The Optimization

Targeted checks used during the work included:

```sh
npx vitest run xmlui/tests/bin/vite-plugin-import.test.ts
npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts -g "xmlui-pg"
npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts xmlui/src/components/App/App.spec.ts
node --check website/scripts/measure-memory.mjs
npm run measure:memory -w website -- --url http://localhost:3000/docs/guides/layout
```

The full E2E suite was run by the user between accepted implementation steps.

During the original memory work, SSG builds exposed a pre-existing
`RangeError: Invalid time value` on the `supabase-and-xmlui` draft blog route.
That issue was handled separately afterward: the blog page now avoids formatting
invalid post dates, and RSS generation skips draft posts and posts with invalid
or missing dates.
