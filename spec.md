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
