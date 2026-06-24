# ProfileMenu Foundation Findings - 2026-06-23

Phase 5 Wave D6G migrated the `ProfileMenu` foundation.

Original XMLUI references inspected:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/ProfileMenu/ProfileMenu.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ProfileMenu/ProfileMenu.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/_conventions.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppHeader/AppHeader.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppHeader/AppHeaderReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/App.tsx`

Important compatibility decision:

- `ProfileMenu` is native-only in the original project and is not exposed as a
  public XMLUI tag. Do not add a public `<ProfileMenu>` compiler contract unless
  a future compatibility source proves it is public.
- The original folder contains only `ProfileMenu.tsx` and
  `ProfileMenu.module.scss`; there are no component-local docs, defaults, or
  E2E tests to copy.

Implemented in the rewrite:

- added `ProfileMenuReact.tsx`, `ProfileMenu.module.scss`, and
  `ProfileMenuContext.tsx`;
- wired `App loggedInUser` into a small internal context;
- updated `AppHeader` so it renders the internal default profile menu when
  `loggedInUser` exists and no explicit `profileMenuTemplate` is provided;
- preserved `profileMenuTemplate` override behavior;
- added `ProfileMenu.foundation.spec.ts`;
- added `?example=profileMenuFoundation` for visual checks with `npm run dev`.

Important compatibility debt:

- The old ProfileMenu uses XMLUI's theme service to switch between light and
  dark themes. The foundation menu renders the theme menu item but does not yet
  mutate runtime theme state.
- The old ProfileMenu uses the old `Avatar` component. The foundation uses a
  local initials/avatar trigger until `Avatar` migration is scheduled.
- Future closure should come through App/AppHeader integration tests and theme
  runtime tests, not a public ProfileMenu XMLUI tag.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui test`
- `npx playwright test src/components/ProfileMenu/ProfileMenu.foundation.spec.ts src/components/AppHeader/AppHeader.foundation.spec.ts`
