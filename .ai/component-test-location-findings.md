# Component Test Location Findings

Date: 2026-06-20

Component folders in the rewrite should follow the original XMLUI project test
placement pattern: component-specific tests live directly beside the component
implementation files.

Use this shape:

- `xmlui/src/components/Button/Button.spec.tsx`
- `xmlui/src/components/Button/Button-style.spec.ts`
- `xmlui/src/components/App/App.spec.tsx`
- `xmlui/src/components/App/App-layout.spec.ts`

Do not create `__tests__` folders under `xmlui/src/components/<ComponentName>/`.
The old placeholder `__tests__` folders were removed from component folders on
2026-06-20. Future component migration waves should either port old component
tests into colocated `ComponentName*.spec.*` files or record unported old tests
as compatibility debt.
