# XMLUI Component Conventions

This document outlines the conventions and patterns used in the XMLUI component system, based on analysis of components like Avatar, Button, and Card.

## Component Structure

### Dual-File Pattern

Components are structured using a dual-file pattern:

- **Native Component** (`*Native.tsx`)
  - Pure React implementation
  - Uses `forwardRef` pattern
  - Contains the actual rendering logic
  - Defines prop types and default props

- **Renderer Component** (`.tsx`)
  - Provides metadata using `createMetadata`
  - Registers component with `createComponentRenderer`
  - Defines theme variables
  - Maps XMLUI props to native component props

Example relationship:
```typescript
// Avatar.tsx (Renderer)
export const avatarComponentRenderer = createComponentRenderer(
  "Avatar",
  AvatarMd,
  ({ node, extractValue, lookupEventHandler, layoutCss, extractResourceUrl }) => {
    return (
      <Avatar
        size={node.props?.size}
        url={extractResourceUrl(node.props.url)}
        name={extractValue(node.props.name)}
        style={layoutCss}
        onClick={lookupEventHandler("click")}
      />
    );
  },
);

// AvatarNative.tsx (Implementation)
export const Avatar = forwardRef(function Avatar(
  { size = defaultProps.size, url, name, style, onClick, ...rest }: Props,
  ref: Ref<any>,
) {
  // Implementation details...
});
```

### Single-File Pattern Variation

Some XMLUI components are implemented using a single-file pattern:

- **Combined Component** (`.tsx`)
  - Contains both the React implementation and XMLUI renderer in a single file
  - Defines metadata using `createMetadata`
  - Registers component with `createComponentRenderer`
  - Does not separate the implementation into a `*Native.tsx` file
  - Often used for simpler components or those that primarily compose other native components

Example: `ToneChangerButton.tsx` combines the implementation and renderer in one file:

```typescript
export function ToneChangerButton({
  lightToDarkIcon = defaultProps.lightToDarkIcon,
  darkToLightIcon = defaultProps.darkToLightIcon,
}) {
  // Implementation...
}

export const toneChangerButtonComponentRenderer = createComponentRenderer(
  COMP,
  ToneChangerButtonMd,
  ({ node, extractValue }) => {
    return (
      <ToneChangerButton
        lightToDarkIcon={extractValue.asOptionalString(node.props.lightToDarkIcon)}
        darkToLightIcon={extractValue.asOptionalString(node.props.darkToLightIcon)}
      />
    );
  },
);
```

This variation is still a fully functional XMLUI component and is registered in the ComponentProvider, making it available in XMLUI markup.

## Component API and State

### API Registration

Components expose methods through a standardized API registration pattern:

```typescript
useEffect(() => {
  registerComponentApi?.({
    setValue,
    focus,
  });
}, [registerComponentApi, setValue, focus]);
```

### State Synchronization

Components keep their internal state synchronized with XMLUI:

```typescript
// Update component state and notify XMLUI
const setValue = useEvent((newValue) => {
  setInternalState(newValue);
  updateState?.({ value: newValue });
});

// Sync state on initial render or changes
useEffect(() => {
  updateState?.({ value: currentState });
}, [updateState, currentState]);
```

## Event Handling

Events are:
1. Declared in component metadata
2. Implemented in the native component
3. Connected via `lookupEventHandler` in the renderer

Common events:
- `click` / `onClick`
- `didChange` (value changes)
- `gotFocus` / `lostFocus`
- Component-specific events (e.g., `onReset`)

## Styling and Theming

### SCSS Module Pattern

- Each component has its own SCSS module (e.g., `Avatar.module.scss`)
- Theme variables follow naming convention: `propertyName-ComponentName`
- Variables are exported and parsed with `parseScssVar`
- CSS classes are composed with the `classnames` library

### Theme Variables

Theme variables are defined in the component metadata:

```typescript
defaultThemeVars: {
  [`borderRadius-${COMP}`]: "4px",
  [`boxShadow-${COMP}`]: "inset 0 0 0 1px rgba(4,32,69,0.1)",
  [`textColor-${COMP}`]: "$textColor-secondary",
  // ...other variables
}
```

Components can be styled using the theme system or through direct props.

## Component Registration

Components are registered with the `ComponentRegistry` during framework initialization:

```typescript
if (process.env.VITE_USED_COMPONENTS_Avatar !== "false") {
  this.registerCoreComponent(avatarComponentRenderer);
}
```

This allows conditional inclusion of components and provides centralized component management.

## Testing

Components use a driver pattern for testing:

```typescript
// Each component has a dedicated driver class
export class AvatarDriver extends ComponentDriver {
  // Driver-specific methods
}

// Used in tests
test("can render 2 initials", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name="Tim Smith"/>`);
  await expect((await createAvatarDriver()).component).toContainText("TS");
});
```

## Reusable Component System

XMLUI supports user-defined components using the `<Component>` tag:

```xml
<Component name="InfoCard">
  <Card width="{$props.width}" borderRadius="8px" boxShadow="$boxShadow-spread">
    <Text>{$props.title}</Text>
    <Text fontWeight="$fontWeight-extra-bold" fontSize="larger">
      { $props.currency === 'true' ? '$' + $props.value : $props.value }
    </Text>
  </Card>
</Component>
```

Components can access properties via `$props` context variable, and expose methods through the API registration mechanism.

## Layout Integration

Components behave differently depending on their parent layout containers:

- In `Stack` layouts, component layout properties might be ignored
- In `FlowLayout`, components get wrapped in container elements
- Explicit layout containers within components help control arrangement

## Native-Only React Components

The following components in the XMLUI codebase are implemented as native React components only. These components don't have corresponding XMLUI renderers registered in the ComponentProvider and are not directly available in XMLUI markup. Instead, they serve as internal implementation details, UI utilities, or components used by other XMLUI components.

- `InspectButton`: A button component used for turning inspection mode on/off in XMLUI development environment
- `ProfileMenu`: A profile menu component used within other components but not exposed directly to XMLUI
- `Toggle`: A toggle component that provides base functionality that may be used by other components
- `VisuallyHidden`: A utility component that wraps Radix UI's VisuallyHidden for accessibility
- `SlotItem`: An internal component for implementing the slot mechanism
- `IconProvider`: Provides icon context for the icon system
- `IconRegistryContext`: Manages icon registry context

### Component Structure Observations

1. **Pure Native Components** tend to:
   - Be located in a single file (no paired renderer)
   - Have a `.tsx` extension (sometimes with a `.module.scss` file)
   - Not include `createComponentRenderer` or `createMetadata` calls
   - Often be used internally by other XMLUI components

2. **Helper Components**:
   - Typically simple with a focused utility purpose
   - May be wrappers around third-party components
   - Often have minimal props and internal state

These native-only components demonstrate the architectural separation in XMLUI, where not every React component needs to be exposed to the XMLUI markup language. This separation enables internal implementation flexibility while maintaining a clean API surface for XMLUI users.

## Best Practices

1. Keep native component implementations pure and focused
2. Define clear metadata and documentation for components
3. Support proper theming through theme variables
4. Implement consistent API and event patterns
5. Ensure proper testing with component drivers
6. Support accessibility through ARIA attributes and keyboard navigation
7. Ensure proper reference forwarding through `forwardRef`
8. Provide sensible defaults for all props
