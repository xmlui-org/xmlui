---
"xmlui": patch
---

RTL + logical CSS audit (plan #11 W5-8): exposes `App.direction` as a reactive `"ltr"|"rtl"` accessor derived from the active locale; converts all component SCSS modules from physical CSS properties (`margin-left/right`, `padding-left/right`, `text-align: left/right`, positional `left`/`right`) to CSS logical properties (`margin-inline-start/end`, `padding-inline-start/end`, `text-align: start/end`, `inset-inline-start/end`); adds `scripts/lint-physical-css.ts` to detect remaining violations. No behaviour change for LTR apps; RTL apps now mirror correctly without override styles.
