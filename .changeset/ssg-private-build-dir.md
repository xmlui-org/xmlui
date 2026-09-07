---
"xmlui": patch
---

`xmlui ssg` no longer builds through the project's `dist/`.

The SSG pipeline needs a client build before it can prerender routes, and it used to produce
that build in `dist/` and copy it to `dist-ssg/`. That made `ssg` a second writer of a directory
`xmlui build` already owns. Two build tasks running against the same project concurrently would
collide: Vite's `emptyDir` would try to clear `dist/` while the other build was writing into it,
failing with `ENOTEMPTY: directory not empty` — or, when the timing fell the other way, silently
copying a half-written `dist/` into `dist-ssg/` and reporting success.

The client build now goes to a private `.xmlui-ssg-dist/` next to the existing `.xmlui-ssg-ssr/`,
and is removed when the command finishes. `dist-ssg/` is unchanged; `dist/` is left alone.

`build()` gains an `outDir` option (default `"dist"`) for callers that need the build output as an
intermediate artifact rather than as the project's published output.
