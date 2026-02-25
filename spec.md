# XMLUI SSG Spec (Implemented Target)

## Goal

Implement a native TypeScript SSG command in XMLUI CLI:

`xmlui ssg`

This is SSG-only (build-time HTML generation), not SSR runtime hosting.

## Command Surface

- Command: `xmlui ssg`
- Options:
  - `--outDir <path>`
    - default: `xmlui-optimized-output`
- Logging: always verbose
- Output handling: always clean output directory before generation
- No other CLI flags for phase 1

## Functional Behavior

1. Build project client assets with XMLUI build pipeline.
2. Discover static routes from `src/Main.xmlui`:
   - include static `<Page url="...">`
   - expand dynamic URLs using `staticPaths`
   - skip unresolved dynamic routes (`:param`, `*`)
   - include markdown-derived routes from `content/**/*.md` except `content/pages/**`
3. Copy built artifacts to `--outDir`.
4. Render each discovered route to HTML using React Router 6 server primitives and `react-dom/server`.
5. Inject XMLUI SSR styles and generated markup into built HTML shell.
6. Write static route files:
   - `/` -> `<outDir>/index.html`
   - `/a/b` -> `<outDir>/a/b/index.html`

## Technical Design

- Implementation location: `xmlui/bin` (TypeScript)
- Core files:
  - `xmlui/bin/ssg.ts`
  - `xmlui/bin/ssg/discoverPaths.ts`
  - `xmlui/bin/index.ts` (command registration)
- Rendering strategy:
  - temporary Vite SSR entry module
  - `StaticRouter` for per-route location
  - `StandaloneApp` render with `renderToString`
  - XMLUI `StyleRegistry` collection and injection
- Inline scripts from source `index.html` are executed in Node VM context before prerender for compatibility with existing flow.

## Explicit Scope Constraints

- No unit tests in this phase.
- No integration tests in this phase.
- No HTML snapshot tests.
- No docs updates in this phase.
- No future-extension section in this spec.

## Acceptance Criteria

- `xmlui ssg` exists in CLI.
- Only `--outDir` is supported.
- Default output directory is `xmlui-optimized-output`.
- Output directory is always cleaned on each run.
- Logs are verbose without extra flags.
- Static HTML pages are generated directly (no Remix server, no HTTP download snapshot loop).

# concurrent rendering

## question

Very good! I want you to look into further optimizations. The @xmlui/src/components-core/rendering/AppWrapper.tsx contains code concerning the location. As you can see, I'm using a global variable on the globalThis object to tell the client what is the location, based on the rendered path. I want parralellise to process of rendering a path across the different paths. Is this communication preventing concurrency? If so, make a plan on how to avoid it and achieve concurrency. Right now the rendered strings are stored in memory until each file has been written to, which is not good, since memory usage scales with the size of the app. My previous request to achive concurrency would solve this.

## answer

Yes — that globalThis.location handoff is a real concurrency blocker for in-process parallel renders.
Right now in xmlui/bin/ssg.ts your SSR entry does:

- globalThis.location = new URL(pathname, ...) before each render
- AppWrapper reads globalThis.location to set MemoryRouter.initialEntries in SSR (xmlui/src/components-core/rendering/AppWrapper.tsx:205)
  If two routes render at the same time in one process, they race on that shared global.  
  There are also two more shared globals that make in-process concurrency unsafe:
- queryClient singleton in xmlui/src/components-core/rendering/AppRoot.tsx:24
- appErrors global array/reset in xmlui/src/components-core/reportEngineError.ts:9
  So: yes, current communication pattern prevents safe concurrent rendering in one process/thread.
  Plan to make it concurrent and memory-bounded:

1. Remove route context from global state

- Add an explicit SSR location prop (e.g. ssrLocation?: string) through:
  - StandaloneApp (xmlui/src/components-core/StandaloneApp.tsx)
  - AppRoot (xmlui/src/components-core/rendering/AppRoot.tsx)
  - AppWrapper (xmlui/src/components-core/rendering/AppWrapper.tsx)
- In AppWrapper, when SSR + MemoryRouter, prefer ssrLocation over globalThis.location.
- In SSG SSR entry (getSsgEntrySource in xmlui/bin/ssg.ts), pass ssrLocation={pathname} and delete the globalThis.location = ... mutation.

2. Eliminate shared query client for SSR isolation

- Stop importing module-level queryClient in AppWrapper.
- Create a per-app-instance client via useMemo(() => new QueryClient(...), []) in AppRoot or AppWrapper, and pass it to QueryClientProvider.
- This avoids cache bleed/races between parallel route renders.

3. Keep engine error collection isolated for SSG workers

- Short-term safe path: run each worker in its own process/thread (so global appErrors is isolated per worker instance).
- Optional follow-up: refactor reportEngineError to context-scoped collector for true in-process safety.

4. Add bounded parallelism with worker pool

- Implement route rendering in a fixed-size worker pool (default: min(cpuCount, 8); configurable via --concurrency).
- Each worker:
  - imports SSR bundle once
  - renders assigned routes
  - applies shell transforms
  - writes output file directly
- Parent only dispatches route tasks and receives completion/error metadata (not full HTML payload).

5. Fix memory scaling (no large in-memory backlog)

- Remove writePromises accumulation pattern from xmlui/bin/ssg.ts.
- Use pull-based scheduling:
  - at most concurrency routes in flight
  - render + write as one unit
  - no retention of all rendered strings in parent
- This makes memory roughly proportional to worker count, not page count.

6. Packaging / tsdown compatibility

- Add worker entry to tsdown build so CLI works outside repo.
- Resolve worker path relative to import.meta.url in built output.
- Keep SSR artifact as .mjs (already done) for compatibility with projects with/without "type": "module".

7. CLI surface

- Add optional flags:
  - --concurrency <n> (default auto)
  - --fail-fast (optional; otherwise keep rendering and report failures at end)
- Keep default behavior deterministic and backwards compatible at --concurrency=1.
  If you want, next I can implement this in two commits-sized chunks:

1. render isolation (ssrLocation + per-render query client),
2. worker pool + bounded scheduler in xmlui/bin/ssg.ts.
