# xmlui-pdf migration findings

Date: 2026-07-11

Original source: `/Users/dotneteer/source/xmlui/packages/xmlui-pdf`
Rewrite target: `/Users/dotneteer/source/xmlui-rs/packages/xmlui-pdf`

## Scope

- Copied the original package protected source into `packages/xmlui-pdf`, including:
  - `src/` PDF component implementation, annotation helpers, hooks, types, utils, SCSS, defaults, and copied E2E spec;
  - `meta/componentsMetadata.ts`;
  - package docs: `CHANGELOG.md`, `WASM_SETUP.md`, `api.md`, `in-memory-loading.md`;
  - `tests/` unit tests;
  - `public/resources/` PDFs and package assets;
  - `scripts/setup-wasm.js`, `vite.config-overrides.ts`, `vitest.config.ts`, and `vitest.setup.ts`.
- Kept copied protected files unchanged except for rewrite-owned `src/xmlui-public.d.ts` type shim additions.
- Restored package runtime dependencies for `pdf-lib`, `pdfjs-dist`, and `react-pdf`.
- Added explicit unit-test infrastructure dependencies that were implicit or workspace-level in the original setup: `jsdom`, `@testing-library/react`, and `@testing-library/jest-dom`.
- Added `xmlui-pdf` to the testbed extension loader in `xmlui/src/main.tsx`.
- Added `packages/xmlui-pdf/src/Pdf.spec.ts` to `playwright.extensions.config.ts` so `scripts/run-extension-e2e.mjs xmlui-pdf` can discover the copied package spec.

## Protected-copy audit

Manual package-level drift checks:

```bash
diff -qr /Users/dotneteer/source/xmlui/packages/xmlui-pdf/src packages/xmlui-pdf/src
diff -qr /Users/dotneteer/source/xmlui/packages/xmlui-pdf/tests packages/xmlui-pdf/tests
diff -qr /Users/dotneteer/source/xmlui/packages/xmlui-pdf/meta packages/xmlui-pdf/meta
diff -qr /Users/dotneteer/source/xmlui/packages/xmlui-pdf/public packages/xmlui-pdf/public
diff -q /Users/dotneteer/source/xmlui/packages/xmlui-pdf/CHANGELOG.md packages/xmlui-pdf/CHANGELOG.md
diff -q /Users/dotneteer/source/xmlui/packages/xmlui-pdf/api.md packages/xmlui-pdf/api.md
```

Result: clean for copied source/tests/meta/public/docs. The only `src` drift reported is rewrite-only shim files `src/vite-env.d.ts` and `src/xmlui-public.d.ts`.

## Verification

Passed:

```bash
npm --workspace xmlui-pdf run build:extension
npm --workspace xmlui-pdf run build:metadata
npm --workspace xmlui-pdf run test:e2e
```

E2E result: 2 passed.

Unit-test status:

```bash
npm --workspace xmlui-pdf run test:unit
```

The copied unit suite now runs, with 147 passing and 4 failing assertions in `tests/SignatureAnnotation.test.tsx`. The failing tests expect exact text `Click to sign`, while the copied original component renders `✍ Click to sign`. Because both the component and copied tests are protected, this was recorded but not edited during the E2E migration pass.
