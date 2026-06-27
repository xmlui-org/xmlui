# xmlui-website-blocks Migration Findings

Date: 2026-06-27  
Plan step: `.plans/website-migration-plan.md` Step 4

## Summary

Copied the old `xmlui-website-blocks` package into the rewrite workspace and
made it buildable with the local `xmlui build-lib` command. This unblocks the
first visible website milestone for home-page visual blocks.

## Source Baseline

Old package source:

- `/Users/dotneteer/source/xmlui/packages/xmlui-website-blocks`

Old package components:

- `HeroSection`
- `ScrollToTop`
- `FancyButton`
- `Carousel`
- `CarouselItem`
- `Backdrop`
- `Breakout`

Old package E2E specs copied but not yet activated:

- `src/Backdrop/Backdrop.spec.ts`
- `src/Breakout/Breakout.spec.ts`
- `src/Carousel/Carousel.spec.ts`
- `src/HeroSection/HeroSection.spec.ts`

## Rewrite Changes

- Added `packages/xmlui-website-blocks` source, metadata, demo files, and
  public resources copied from the old package.
- Added package scripts for `build` and `build:metadata` using
  `xmlui build-lib`.
- Added package TypeScript configuration and local public XMLUI declarations so
  library typechecking targets the old public authoring contract.
- Made package dependencies explicit:
  `@radix-ui/react-compose-refs`, `@react-spring/web`, `classnames`,
  `embla-carousel-autoplay`, `embla-carousel-react`, and `immer`.
- Added XMLUI compatibility exports needed by the package:
  `Button`, `Part`, `Theme`, `dClick`, `dGotFocus`, `dLostFocus`,
  `dComponent`, `PropertyValueDescription`, `CompoundComponentRendererInfo`,
  and `RegisterComponentApiFn`.

## Temporary Compatibility Notes

- `Part` is currently a simple React fragment fallback. Full XMLUI part marker
  behavior is still provided by the internal renderer, but the public React
  export needs a richer adapter if website rendering depends on part metadata.
- `Theme` is currently a simple React fragment fallback. Tone-aware behavior is
  not yet applied through this public React export.
- The copied old Sass theme helper emits deprecation warnings under the newer
  Sass version, but build output is produced.
- Package specs are copied but excluded from library typechecking. They still
  need activation through the rewrite's E2E test setup.

## Verification

Passed:

```text
npm --workspace xmlui-website-blocks run build
npm --workspace xmlui-website-blocks run build:metadata
```

Observed outputs:

- `packages/xmlui-website-blocks/dist/xmlui-website-blocks.mjs`
- `packages/xmlui-website-blocks/dist/xmlui-website-blocks.js`
- `packages/xmlui-website-blocks/dist/xmlui-website-blocks.css`
- `packages/xmlui-website-blocks/dist-metadata/xmlui-website-blocks-metadata.json`

Remaining verification:

- Activate and run old package specs.
- Add or confirm a Carousel visible state update test.
- Render the migrated website home route using `xmlui-website-blocks`.
