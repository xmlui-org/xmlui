# PasswordInput source-preserving migration findings - 2026-07-01

## Compatibility source

- Original implementation: `/Users/dotneteer/source/xmlui/xmlui/src/components/TextBox/TextBox.tsx`.
- Original tests: `/Users/dotneteer/source/xmlui/xmlui/src/components/TextBox/TextBox.spec.ts`, `Password Input` block.
- PasswordInput is not an independent visual component in the old project. It is a TextBox-derived wrapper registered as `PasswordInput`, with `PasswordBox` rendering `ThemedTextBox` while forcing `type="password"`.

## Behavior preserved

- Runtime behavior stays on the TextBox implementation path, including styling, adornments, validation feedback, form integration, focus/lostFocus/didChange events, API exposure, `bindTo`, and password visibility toggle behavior.
- Authored `type` does not override PasswordInput. The original passes `{...props}` before `type="password"`, so the password type wins. The rewrite renderer mirrors that by hard-coding `type="password"` and not reading `adapter.prop("type")`.
- Metadata now preserves the original password description and the `initialValue` audit override:
  - `classification: "secret"`
  - `defaultRedaction: "mask"`

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts -g "Password Input" --workers=1` passes 9/9.
- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts --workers=1` passes 168/168.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passes.
- `npm --prefix xmlui run check:metadata` passes.

## Notes

- TextBox and PasswordInput share the same migrated source family, but the migration plan now tracks PasswordInput as a separate derived approval unit because the user explicitly requested it after approving TextBox.
