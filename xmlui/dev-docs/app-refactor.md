# App Component Refactoring Plan

## Objective
Simplify the App component architecture by creating a cleaner, more maintainable implementation.

## Approach

### Phase 1: Clone and Setup ✅ COMPLETE
- ✅ Clone entire App component to App2 (experimental version)
- ✅ Clone all associated files (tsx, scss, contexts, etc.)
- ✅ Rename files to use App2 prefix (App2.tsx, App2Native.tsx, App2.module.scss, etc.)
- ✅ Update component registration for App2 in ComponentProvider
- ✅ Update component metadata (App2Md, app2Renderer, COMP="App2")
- ✅ Update all imports to reference renamed files

### Phase 2: Test Infrastructure ✅ COMPLETE
- ✅ Create e2e tests for App2 component (tests-e2e/app2-component.spec.ts)
- ✅ Ensure test coverage for core functionality (16 tests covering layouts, navigation, themes)
- ✅ Tests validate App2 works independently
- ✅ All tests passing

### Phase 3: Remove Responsive Layout
- Remove responsive layout functionality from App2
- Remove corresponding test cases
- Simplify layout switching logic

### Phase 4: Incremental CSS Rebuild
- Delete App2.module.scss file
- Rebuild styles incrementally following layout plans in app-next.md
- Implement one layout variant at a time
- Test each layout before proceeding to next

## Layout Implementation Order
Follow the layout definitions from app-next.md:
1. Desktop layout (simplest - full viewport)
2. Vertical layout (basic column arrangement)
3. Vertical-sticky layout
4. Horizontal layout
5. Horizontal-sticky layout
6. Condensed layout
7. Condensed-sticky layout
8. Vertical-full-header layout

## Success Criteria
- App2 compiles without errors
- Core layouts work as specified in app-next.md
- No responsive layout complexity
- Cleaner, more maintainable code structure
- All e2e tests pass

## Future Work
- Once App2 is stable and validated, consider migration path from App to App2
- Evaluate if App2 should replace App or coexist as alternative
