# Docs Search Memory Plan

## Context

Users reported that the XMLUI docs site consumes a lot of memory, especially around search. A read-only investigation was run against the website dev server at `http://localhost:5173/`.

Observed signals:

- The website renders two `Search` components that both receive `appGlobals.staticSearchData`.
- Each `Search` instance currently creates its own `Fuse` instance and calls `fuse.setCollection(...)` for the merged data.
- In dev mode, when no external SSG search index is loaded, `SearchIndexCollector` renders indexable pages hidden offscreen, clones their DOM, extracts text, and stores each page into search context one at a time.
- The search context updates content with object spreading per indexed page, causing repeated full-object copies as the index grows.
- The docs site is large enough for this to matter: roughly 431 markdown files, about 2.84 MB raw markdown, and roughly 282 docs routes in `website/src/Main.xmlui`.
- CDP reload-cycle measurements showed heavy but mostly stable heap for large docs reference pages after forced GC: approximately 219 MB for the `Table` page and 195-196 MB for the `Select` page.
- The website dev server Node process was observed around 1.34 GB RSS during profiling.
- Dev-server logs were noisy with repeated `ResizeObserver loop completed with undelivered notifications` messages and HMR/hydration warnings, which may amplify the perceived memory and CPU cost.

## Working Hypothesis

The primary issue is likely high steady-state memory plus expensive indexing churn rather than a simple leak on every route reload.

The most suspicious path is:

1. `staticSearchData` is already built from markdown content.
2. Runtime search indexing may still run in dev mode and render many pages hidden offscreen.
3. Each indexed page updates `SearchContext.content` separately.
4. Each `Search` instance recomputes merged data and rebuilds its own Fuse collection.
5. Two Search instances duplicate the same large index.

This creates large memory pressure and repeated CPU/GC work, especially during docs startup and search interactions.

## Hypothesis Validation

The hypothesis must be checked with explicit A/B measurements before and after each change. Do not treat a successful code change as proof by itself.

### Baseline Before Any Code Change

Measure the current behavior first, using the unmodified docs site.

Baseline scenarios:

1. Start `website` in dev mode.
2. Open `/docs`.
3. Record memory at idle checkpoints: immediately after load, then after 1s, 3s, 8s, and 15s.
4. Open the search UI.
5. Run representative queries: `component`, `table`, `select`, `theme`, `form`.
6. Rapidly alternate `component` and `table` 20-50 times.
7. Close search and measure idle memory again.

Record at each checkpoint:

- Browser JS heap after forced GC
- Browser DOM node count
- Browser event listener count
- Search result DOM count
- Dev server RSS
- Console error volume, especially ResizeObserver/HMR/hydration noise

This baseline is the comparison point for all later steps.

### Validation Gate 1: Runtime Indexing Guard

When to check:

- Immediately after implementing the guard that skips hidden runtime page indexing when static search data is present.

How to check:

- Run the same baseline scenarios.
- Confirm that `SearchIndexCollector` does not hidden-render docs pages for the website when static search data is used.
- Compare `/docs` idle memory and startup CPU/settling time against baseline.

Hypothesis is supported if:

- `/docs` startup memory drops materially.
- DOM/node/listener churn during the first 15s drops materially.
- Dev server/browser console noise tied to hidden docs rendering drops.
- Search results still work for docs and blog content.

Hypothesis is weakened or falsified if:

- Memory and churn are almost unchanged after runtime indexing is disabled.
- Search memory only grows after typing, not during docs idle/startup.

Decision after gate:

- If supported, keep the guard and continue to Fuse sharing.
- If weakened, shift focus to per-query Search/Fuse allocations and result rendering.

### Validation Gate 2: Shared Fuse Index

When to check:

- After moving expensive Fuse collection/index construction out of individual `Search` instances.

How to check:

- Run the same search scenarios on `/docs`.
- Compare memory with one visible Search instance and with both website Search instances mounted.
- If feasible, instrument or inspect that only one prepared index exists for a given data version.

Hypothesis is supported if:

- Mounting the second Search instance no longer adds a large extra heap cost.
- Search open/type heap after forced GC drops compared with Gate 1.
- Query latency or allocation pressure improves.

Hypothesis is weakened or falsified if:

- Two Search instances consume roughly the same memory as before.
- Most memory remains in per-result match/snippet allocation instead of index storage.

Decision after gate:

- If supported, keep shared indexing.
- If weakened, prioritize reducing `includeMatches`, snippet generation, and result allocation.

### Validation Gate 3: Batched Runtime Index Updates

When to check:

- After adding batch updates for apps that still need runtime indexing.

How to check:

- Run a scenario with runtime indexing intentionally enabled.
- Compare number of search-context state commits and heap churn against the original baseline.

Hypothesis is supported if:

- State commits drop from one per page to a small bounded number.
- Memory churn during indexing drops.
- Search content remains complete after indexing finishes.

Hypothesis is weakened or falsified if:

- Batched updates do not reduce memory churn or rerender count.

### Validation Gate 4: Search Result Allocation

When to check:

- Only after the indexing and duplicated-index checks are complete, or earlier if Gate 1 and Gate 2 do not explain the memory growth.

How to check:

- Keep the index fixed and repeatedly type queries.
- Compare heap before search, after query, after clearing query, and after forced GC.
- Inspect whether result match/snippet data remains retained after the query is cleared.

Hypothesis is supported if:

- Heap grows during repeated queries and does not return close to pre-query levels after forced GC.
- Reducing match/snippet work materially lowers per-query heap.

Hypothesis is weakened or falsified if:

- Heap returns to baseline after clearing search and forced GC.

## Proposed Changes

### 1. Avoid Runtime Indexing When Static Search Data Is Present

Add a way for the app/search layer to signal that explicit search data has already been provided.

Possible implementation options:

- Add a config flag such as `searchIndexMode: "static" | "runtime" | "external" | "auto"`.
- Or add a narrower boolean such as `searchRuntimeIndexEnabled`.
- For the website, disable runtime hidden page indexing when `staticSearchData` is supplied.

Expected impact:

- Avoid hidden rendering of hundreds of docs pages during dev startup.
- Reduce transient DOM, React, and markdown rendering pressure.
- Reduce repeated search-context updates.

### 2. Share the Fuse Index Across Search Instances

Move Fuse index construction out of each `Search` component instance and into a shared memoized layer.

Possible implementation options:

- Extend `SearchContext` to expose a prepared index keyed by data identity/version.
- Add a small search-index provider used by Search components.
- Keep component-local UI state, but share the expensive data/index state.

Expected impact:

- The top header Search and docs-sidebar Search stop duplicating the same Fuse collection.
- Search memory use should drop on docs pages.

### 3. Batch Runtime Search Index Updates

If runtime indexing remains enabled for other apps, avoid one state update per indexed page.

Possible implementation options:

- Add `storeContents(entries: SearchItemData[])`.
- Accumulate indexed entries in a ref and commit periodically or at the end.
- Preserve a single final `content` object rather than repeatedly cloning the growing map.

Expected impact:

- Avoid O(n²)-like object-copy churn.
- Reduce rerenders of subscribed Search components while indexing is in progress.

### 4. Reduce Search Result Allocation

Review Fuse options and post-processing allocations.

Candidates:

- Avoid `includeMatches: true` unless snippets/highlights are actually displayed.
- Compute snippets only for visible results rather than all returned results.
- Avoid mutating Fuse-provided match index tuples during post-processing.
- Consider storing a shorter searchable summary per page, with full markdown retained separately.

Expected impact:

- Lower per-query allocation pressure.
- Faster repeated typing in the search box.

### 5. Add a Repeatable Memory Profiling Script

Add a diagnostic script or Playwright-based measurement that records:

- JS heap after forced GC
- DOM node count
- listener count
- search result DOM count
- docs startup idle memory over time
- repeated search input changes

Suggested scenarios:

- `/docs` idle at 0s, 1s, 3s, 8s, 15s
- Open search and query `component`, `table`, `select`, `theme`, `form`
- Rapidly alternate `component` and `table`
- Return to idle and measure after closing search

This should start as a diagnostic baseline, not necessarily a strict CI failure gate.

## Suggested Execution Order

1. Capture and save the baseline memory profile before code changes.
2. Implement the static-data/runtime-indexing guard for the website.
3. Run Validation Gate 1 and decide whether the original indexing hypothesis is supported.
4. Share the Fuse index between Search instances only if Gate 1 leaves duplicated Search indexes as a likely remaining cost.
5. Run Validation Gate 2 and decide whether duplicated Fuse indexes were a major contributor.
6. Batch runtime indexing updates for apps that still need runtime indexing.
7. Run Validation Gate 3 with runtime indexing intentionally enabled.
8. Investigate Search result allocation via Validation Gate 4 if memory growth remains search-query-driven.
9. Add or keep the profiling script for regression checks.

## Verification

After each approved implementation step:

- Run the focused Search tests in `packages/xmlui-search/src/Search.spec.ts` if applicable.
- Run a targeted docs/dev memory profile against `website`.
- Confirm search still returns docs and blog results.
- Confirm docs navigation and search category filters still behave correctly.
- Add a patch changeset if framework or package users are affected.

## Notes

No implementation changes should be made without explicit approval. This plan records the investigation findings and proposed direction only.
