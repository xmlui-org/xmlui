# Theme and Inspection Runtime Foundation Findings - 2026-06-24

## Scope

Phase 5 Wave F6A migrated the first compatibility slice for theme and slot
runtime components:

- `Theme`
- `Slot`
- `ToneSwitch`
- `ToneChangerButton`

`Part`, `InspectButton`, `Inspector`, and `I18n` were inspected or inventoried
but deferred because they need broader component-part, inspector-service, and
localization runtime closure.

## Original Sources Inspected

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Theme/Theme.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Theme/ThemeReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Slot/Slot.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Slot/Slot.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Part/Part.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ToneSwitch/ToneSwitch.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ToneSwitch/ToneSwitchReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ToneChangerButton/ToneChangerButton.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/InspectButton/InspectButton.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Inspector/Inspector.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/I18n/I18n.tsx`

## Preserved Foundation Behavior

- `Theme` scopes arbitrary theme-variable props to children and records the
  scoped tone on the wrapper.
- The runtime theme context now carries `tone` and `setTone` while preserving
  the existing `useThemeVariables()` API for component styling.
- `Slot` was transferred from centralized built-ins into a source-adjacent
  component folder while preserving fallback rendering.
- `ToneSwitch` can switch the runtime tone and fires `onDidChange(tone)`.
- `ToneChangerButton` can toggle the runtime tone and fires `onClick(tone)`.

## Deferred Compatibility Debt

- Literal old E2E suites are not fully transferred yet.
- `Theme` named theme selection, root style injection, notification settings,
  `disableInlineStyle`, strict theming behavior, and exact generated CSS
  behavior remain deferred.
- `Slot` injected child and context-variable parity remains deferred to the
  user-defined component slot closure.
- `ToneSwitch` and `ToneChangerButton` visual parity with the old Toggle,
  Button, and Icon implementations remains deferred.
- `Part`, `InspectButton`, `Inspector`, and `I18n` remain unimplemented.

## Verification

- `npm --workspace xmlui exec -- playwright test src/components/Theme/Theme.spec.ts src/components/Slot/Slot.spec.ts src/components/ToneSwitch/ToneSwitch.spec.ts src/components/ToneChangerButton/ToneChangerButton.spec.ts`
  - 5 passed, 4 explicit fixme skips.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui test`
  - 37 files, 263 tests passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit`
