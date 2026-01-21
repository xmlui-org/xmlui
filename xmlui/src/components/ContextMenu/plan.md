# Shared Infrastructure Plan: DropdownMenu & ContextMenu

## Current State

Both components share significant infrastructure but have separate implementations:

### Shared Elements
- Radix UI `@radix-ui/react-dropdown-menu` primitives
- `MenuItem`, `SubMenuItem`, `MenuSeparator` components
- `DropdownMenuContext` for menu closure coordination
- Similar SCSS styling (backgrounds, borders, shadows, menu items)
- Common props: `alignment`, `compact`, `className`, `style`
- Menu positioning and closing behavior (click outside, escape key)

### Key Differences
- **DropdownMenu**: Has trigger surface (button/template), `willOpen` event
- **ContextMenu**: No trigger, programmatic `openAt()` API, `$context` variable, mouse position tracking

## Refactoring Plan

### 1. Extract Shared Menu Content Component
**File**: `MenuContent/MenuContentNative.tsx`

```typescript
type MenuContentProps = {
  children: ReactNode;
  alignment: AlignmentOptions;
  compact: boolean;
  className?: string;
  style?: CSSProperties;
  contentRef?: React.RefObject<HTMLDivElement>;
  position?: { x: number; y: number } | null;
  onClose: () => void;
};
```

Handles:
- Portal rendering
- Content positioning
- Keyboard navigation (escape, arrow keys)
- Outside click detection
- Common styling

### 2. Consolidate SCSS Modules
**Action**: Merge duplicate styles into shared module

**Files**:
- `Menu/Menu.module.scss` - Base menu content styles
- `DropdownMenu/DropdownMenu.module.scss` - Keep trigger-specific styles
- `ContextMenu/ContextMenu.module.scss` - Remove duplicate styles, import from base

**Shared variables**:
- `backgroundColor-Menu`
- `borderRadius-Menu`
- `boxShadow-Menu`
- `minWidth-Menu`
- MenuItem, MenuSeparator styles (already shared via DropdownMenu.module.scss)

### 3. Export Shared Components
**File**: `DropdownMenu/DropdownMenuNative.tsx`

Make public exports:
- `export { MenuItem, SubMenuItem, MenuSeparator }`
- `export { DropdownMenuContext, useDropdownMenuContext }`
- `export type { MenuItemProps, SubMenuItemProps }`

Update ContextMenu to import from DropdownMenu instead of re-exporting.

### 4. Create Shared Menu Hook
**File**: `Menu/useMenu.ts`

```typescript
type UseMenuOptions = {
  onWillOpen?: () => Promise<boolean | undefined>;
  onClose?: () => void;
  updateState?: (state: any) => void;
};

export function useMenu(options: UseMenuOptions) {
  const [open, setOpen] = useState(false);
  const closeMenu = useCallback(/* ... */);
  const openMenu = useCallback(/* ... */);
  
  return { open, closeMenu, openMenu, /* ... */ };
}
```

Encapsulates:
- Open/close state management
- Pre-open validation (`willOpen` callback)
- State cleanup on close
- Timeout management

### 5. Refactor Component Renderers

**DropdownMenu/DropdownMenu.tsx**:
- Use `MenuContent` component
- Keep trigger-specific logic
- Use `useMenu` hook

**ContextMenu/ContextMenu.tsx**:
- Use `MenuContent` component
- Keep `openAt()` positioning logic
- Use `useMenu` hook
- Wrap children with `ContainerWrapperDef` for `$context`

### 6. Update Component Metadata
**Action**: Reference shared components in metadata

Both should document that they use `MenuItem`, `SubMenuItem`, `MenuSeparator` from the shared menu infrastructure.

## Implementation Order

1. ✅ **Phase 0**: Current state (both working independently)
2. **Phase 1**: Export shared components from DropdownMenu
   - Export MenuItem, SubMenuItem, MenuSeparator, Context
   - Update ContextMenu imports
   - **Risk**: Low, no behavioral changes
3. **Phase 2**: Create shared SCSS module
   - Extract common styles to `Menu.module.scss`
   - Import in both components
   - **Risk**: Medium, requires careful theme variable mapping
4. **Phase 3**: Create MenuContent component
   - Extract content rendering logic
   - Both components use it
   - **Risk**: Medium, requires careful props interface design
5. **Phase 4**: Create useMenu hook
   - Extract state management logic
   - Both components use it
   - **Risk**: Low, encapsulates existing behavior
6. **Phase 5**: Update documentation
   - Update component metadata
   - Add cross-references
   - **Risk**: None

## Benefits

- **Reduced duplication**: ~200 lines of shared code extracted
- **Consistency**: Menu behavior identical across both components
- **Maintainability**: Bug fixes apply to both components
- **Extensibility**: Future menu-based components (e.g., Select dropdown) can reuse infrastructure
- **Bundle size**: Shared code loaded once instead of duplicated

## Migration Impact

- **Breaking changes**: None (all changes internal)
- **API compatibility**: 100% preserved
- **Testing required**: Both components, MenuItem interactions, theming
- **Documentation**: Update component pages to reference shared infrastructure

## Future Enhancements

After refactoring, easier to add:
- Keyboard navigation improvements
- Menu animations (open/close transitions)
- Nested submenu positioning optimization
- Accessibility enhancements (ARIA attributes)
- Touch/mobile gesture support
