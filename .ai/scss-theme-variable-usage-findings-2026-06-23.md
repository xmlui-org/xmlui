# SCSS Theme Variable Usage Findings - 2026-06-23

## Finding

Component SCSS files that use the local XMLUI pattern:

```scss
@function createThemeVar($componentVariable) {
  @return var(--xmlui-#{$componentVariable});
}
```

must use the resulting Sass variables directly in declarations:

```scss
gap: $gap-Form;
color: $textColor-ConciseValidationFeedback-error;
```

Do not wrap those variables with CSS `var(...)`:

```scss
gap: var($gap-Form);
```

That compiles to invalid production CSS such as `var(var(--xmlui-gap-Form))`,
which Lightning CSS rejects during minification and prevents Playwright's E2E
web server from starting.

## Verification

After fixing the Form and validation-display component styles:

- `rg -n 'var\(\$' xmlui/src/components xmlui/src/examples` found no matches.
- `rg -n 'var\(var\(' xmlui/src/components xmlui/src/examples` found no matches.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passed.
- `npm --workspace xmlui test` passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit` passed.
- `npm --workspace xmlui run build:standalone` passed.

The full `npm --workspace xmlui run test:e2e` command started successfully after
the fix, proving the original CSS minification startup failure was removed. The
run was interrupted after it reached unrelated migrated component assertion and
server-lifecycle failures.
