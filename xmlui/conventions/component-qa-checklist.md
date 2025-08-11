# XMLUI Component QA Checklist

This document provides a comprehensive checklist for ensuring XMLUI components follow established conventions and best practices. Use this with GitHub Copilot to verify component compliance.

## 📋 Quick Reference

**Component Location**: XMLUI components are located in the `xmlui/src/components` folder.

**Component Status**: Use this checklist to verify component compliance before release.

**Usage with Copilot**: Reference this document when asking Copilot to review or create XMLUI components.

## ⚠️ Component Review Scope

**Skip HTML Tag Components**: HTML tag wrapper components in `HtmlTags.tsx` are marked as deprecated and scheduled for removal. **Skip these components during routine reviews** unless explicitly requested. Focus reviews on:
- Core XMLUI components (Avatar, Button, Card, etc.)
- Form components (TextBox, Checkbox, Select, etc.)  
- Layout components (Stack, App, Pages, etc.)
- Advanced components (Charts, DatePicker, etc.)

**Rationale**: HTML tag components are temporary solutions being phased out in favor of semantic HTML and dedicated XMLUI components.

---

## 🏗️ Component Structure

### ✅ File Organization Patterns

#### Dual-File Pattern (Recommended)
- [ ] **Native Component** (`ComponentNative.tsx`)
  - [ ] Uses `forwardRef` pattern
  - [ ] Contains pure React implementation
  - [ ] Defines `Props` type interface
  - [ ] Exports `defaultProps` object
  - [ ] Implements actual rendering logic
  - [ ] No XMLUI-specific dependencies

- [ ] **Renderer Component** (`Component.tsx`)
  - [ ] Imports from `ComponentNative.tsx`
  - [ ] Creates metadata with `createMetadata`
  - [ ] Registers with `createComponentRenderer`
  - [ ] Defines theme variables
  - [ ] Maps XMLUI props to native props

#### Single-File Pattern (Alternative)
- [ ] **Combined Component** (`Component.tsx`)
  - [ ] Contains both React implementation and XMLUI renderer
  - [ ] Uses `createMetadata` for documentation
  - [ ] Registers with `createComponentRenderer`
  - [ ] Suitable for simple components or compositions

### ✅ File Naming Conventions
- [ ] Component folder matches component name (PascalCase)
- [ ] Native file: `ComponentName.tsx` or `ComponentNameNative.tsx`
- [ ] Renderer file: `ComponentName.tsx`
- [ ] Styles file: `ComponentName.module.scss`
- [ ] Test file: `ComponentName.spec.ts`

---

## 🎯 Component Implementation

### ✅ Native Component Requirements

#### forwardRef Pattern
- [ ] Uses `forwardRef` with proper typing
- [ ] Ref type is `Ref<any>` or specific HTML element type
- [ ] Component function has descriptive name matching component

```typescript
// ✅ Good
export const ComponentName = forwardRef(function ComponentName(
  { prop1, prop2, ...rest }: Props,
  ref: Ref<HTMLDivElement>
) {
  // Implementation
});

// ❌ Bad - anonymous function
export const ComponentName = forwardRef((props, ref) => {
  // Implementation
});
```

#### Props and Default Values
- [ ] `Props` type interface is defined
- [ ] `defaultProps` object is exported
- [ ] All props have proper TypeScript types
- [ ] Optional props use `?` syntax
- [ ] Default values are referenced in metadata

```typescript
// ✅ Good
type Props = {
  size?: string;
  name?: string;
  onClick?: (event: React.MouseEvent) => void;
  style?: CSSProperties;
};

export const defaultProps: Pick<Props, 'size'> = {
  size: "sm",
};
```

#### Memoization
- [ ] Component wrapped with `memo` for performance
- [ ] Expensive calculations use `useMemo`
- [ ] Event handlers use `useCallback` when appropriate

```typescript
// ✅ Good
export const ComponentName = memo(forwardRef(function ComponentName(props, ref) {
  const expensiveValue = useMemo(() => calculateValue(props.data), [props.data]);
  // Implementation
}));
```

### ✅ React Hooks Rules and Patterns

#### Hook Usage Rules (CRITICAL)
- [ ] **Only call hooks at the top level** - Never inside loops, conditions, or nested functions
- [ ] **Only call hooks from React functions** - Components or custom hooks only
- [ ] **Custom hooks start with "use"** - Follow naming convention for custom hooks
- [ ] **Hook calls are consistent** - Same hooks called in same order on every render

```typescript
// ✅ Good
function ComponentName() {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  // Component logic
}

// ❌ Bad - conditional hook call
function ComponentName({ showFeature }) {
  if (showFeature) {
    const [value, setValue] = useState(initialValue); // ❌ Conditional hook
  }
  // Component logic
}
```

#### useState Patterns
- [ ] State initialized with proper default values
- [ ] State updates use functional updates for dependent changes
- [ ] Multiple related state values are grouped when appropriate
- [ ] State is not mutated directly

```typescript
// ✅ Good
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: '', email: '' });

// Functional update
setCount(prevCount => prevCount + 1);

// Object update (new object)
setUser(prevUser => ({ ...prevUser, name: 'New Name' }));

// ❌ Bad - mutating state directly
user.name = 'New Name'; // ❌ Direct mutation
setUser(user); // ❌ Same reference
```

#### useEffect Patterns
- [ ] Effect cleanup functions provided when needed
- [ ] Dependencies array is complete and accurate
- [ ] Effects are split by concern (separate effects for different purposes)
- [ ] Avoid infinite loops with proper dependency management

```typescript
// ✅ Good
useEffect(() => {
  const subscription = subscribe(something);
  return () => subscription.unsubscribe(); // Cleanup
}, []);

useEffect(() => {
  updateDocument(value);
}, [value]); // Correct dependency

// ❌ Bad - missing cleanup
useEffect(() => {
  const interval = setInterval(() => {
    // Some logic
  }, 1000);
  // ❌ Missing cleanup
}, []);

// ❌ Bad - missing dependency
useEffect(() => {
  updateDocument(value);
}, []); // ❌ Missing 'value' dependency
```

#### useCallback and useMemo Patterns
- [ ] `useCallback` used for event handlers passed to child components
- [ ] `useMemo` used for expensive computations
- [ ] Dependencies are properly specified
- [ ] Not overused (only when needed for performance)

```typescript
// ✅ Good
const handleClick = useCallback((event) => {
  onClick(event, value);
}, [onClick, value]);

const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]);

// ❌ Bad - unnecessary useCallback
const handleClick = useCallback(() => {
  console.log('clicked');
}, []); // ❌ No dependencies needed for static function
```

#### Custom Hook Patterns
- [ ] Custom hooks start with "use" prefix
- [ ] Custom hooks encapsulate related logic
- [ ] Custom hooks return consistent interface
- [ ] Custom hooks follow same rules as built-in hooks

```typescript
// ✅ Good
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);
  
  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);
  
  return { count, increment, decrement };
}

// ❌ Bad - doesn't start with "use"
function counter(initialValue = 0) { // ❌ Wrong naming
  // Hook logic
}
```

#### Context and useContext Patterns
- [ ] Context providers are placed at appropriate levels
- [ ] Context values are memoized to prevent unnecessary re-renders
- [ ] Custom hooks provide context access
- [ ] Context is split by concern when appropriate

```typescript
// ✅ Good
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  const value = useMemo(() => ({
    theme,
    setTheme
  }), [theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for context access
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### ✅ Accessibility Requirements

#### ARIA Attributes
- [ ] Proper `aria-label` for screen readers
- [ ] `role` attribute when semantic HTML isn't sufficient
- [ ] `aria-disabled` for disabled states
- [ ] `aria-expanded` for expandable components

#### Keyboard Navigation
- [ ] Interactive elements are focusable (`tabIndex={0}`)
- [ ] Non-interactive elements are not focusable
- [ ] Enter and Space keys trigger actions
- [ ] Escape key closes modals/dropdowns
- [ ] Arrow keys for navigation where appropriate

```typescript
// ✅ Good
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (onClick && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    onClick(event as any);
  }
};

return (
  <div
    role="button"
    aria-label={altText}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={handleKeyDown}
  >
    {content}
  </div>
);
```

#### Focus Management
- [ ] Focus states are visible
- [ ] Focus is properly managed in modal dialogs
- [ ] Focus returns to trigger element when closing
- [ ] Skip links provided for complex navigation

### ✅ Event Handling

#### Event Declaration
- [ ] Events declared in component metadata
- [ ] Event handlers properly typed
- [ ] Event names follow convention (camelCase)

#### Event Implementation
- [ ] Events connected via `lookupEventHandler`
- [ ] Event handlers are optional
- [ ] Proper event object passed to handlers

```typescript
// ✅ Good - In renderer
onClick={lookupEventHandler("click")}

// ✅ Good - In native component
onClick?: (event: React.MouseEvent) => void;
```

#### Renderer Function Patterns
- [ ] **No React hooks in renderer functions** (CRITICAL)
- [ ] Renderer functions only contain JSX mapping logic
- [ ] React hooks are used only in React components
- [ ] Complex logic wrapped in React components when hooks needed

```typescript
// ✅ Good - No hooks in renderer
export const componentRenderer = createComponentRenderer(
  COMP,
  ComponentMd,
  ({ node, extractValue, lookupEventHandler, layoutCss }) => {
    return (
      <ComponentNative
        prop1={extractValue(node.props.prop1)}
        prop2={extractValue(node.props.prop2)}
        onClick={lookupEventHandler("click")}
        style={layoutCss}
      />
    );
  },
);

// ✅ Good - Use React component wrapper when hooks needed
const ComponentWithState = ({ initialValue, ...props }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Effect logic here
  }, []);
  
  return <ComponentNative {...props} state={state} />;
};

export const componentRenderer = createComponentRenderer(
  COMP,
  ComponentMd,
  ({ node, extractValue, lookupEventHandler, layoutCss }) => {
    return (
      <ComponentWithState
        initialValue={extractValue(node.props.initialValue)}
        onClick={lookupEventHandler("click")}
        style={layoutCss}
      />
    );
  },
);

// ❌ Bad - Hooks directly in renderer function
export const componentRenderer = createComponentRenderer(
  COMP,
  ComponentMd,
  ({ node, extractValue, lookupEventHandler, layoutCss }) => {
    const [state, setState] = useState(); // ❌ Hook in renderer function
    
    useEffect(() => { // ❌ Hook in renderer function
      // Effect logic
    }, []);
    
    return (
      <ComponentNative
        prop1={extractValue(node.props.prop1)}
        style={layoutCss}
      />
    );
  },
);
```

### ✅ Common Events
- [ ] `click` for clickable elements
- [ ] `didChange` for value changes
- [ ] `gotFocus` / `lostFocus` for focus events
- [ ] Component-specific events documented

---

## 🎨 Styling and Theming

### ✅ SCSS Module Pattern
- [ ] Component has dedicated SCSS module
- [ ] Styles imported as `styles` object
- [ ] Classes applied using `classnames` library
- [ ] CSS variables follow naming convention

### ✅ Theme Variables
- [ ] Theme variables defined in metadata
- [ ] Variables follow `propertyName-ComponentName` pattern
- [ ] Default theme variables provided
- [ ] Variables parsed with `parseScssVar`

```typescript
// ✅ Good
defaultThemeVars: {
  [`borderRadius-${COMP}`]: "4px",
  [`boxShadow-${COMP}`]: "inset 0 0 0 1px rgba(4,32,69,0.1)",
  [`textColor-${COMP}`]: "$textColor-secondary",
  [`backgroundColor-${COMP}`]: "$color-surface-100",
}
```

### ✅ Responsive Design
- [ ] Components adapt to different screen sizes
- [ ] Breakpoints use consistent values
- [ ] Text remains readable at all sizes
- [ ] Touch targets meet minimum size requirements

---

## 📚 Metadata and Documentation

### ✅ Component Metadata
- [ ] `createMetadata` used for documentation
- [ ] Component description is comprehensive
- [ ] All props documented with descriptions
- [ ] Available values listed for constrained props
- [ ] Default values specified
- [ ] Component status indicated (`stable`, `experimental`, etc.)

### ✅ Prop Documentation
- [ ] Each prop has clear description
- [ ] Type information provided
- [ ] Required props marked as `isRequired: true`
- [ ] Available values listed for enums
- [ ] Default values referenced from `defaultProps`

```typescript
// ✅ Good
export const ComponentMd = createMetadata({
  status: "stable",
  description: "Clear description of component purpose and usage",
  props: {
    size: {
      description: "Controls the display size of the component",
      type: "string",
      availableValues: ["xs", "sm", "md", "lg"],
      defaultValue: defaultProps.size,
    },
  },
});
```

### ✅ Event Documentation
- [ ] All events documented in metadata
- [ ] Event descriptions explain when triggered
- [ ] Event parameter types specified

---

## 🔄 State Management

### ✅ Internal State
- [ ] Component state is properly managed
- [ ] State updates are batched when possible
- [ ] State is synchronized with XMLUI when needed

### ✅ API Registration (Only for Interactive Components)

**Note**: Most UI components correctly have no APIs. Only apply this section to components that need programmatic control (form inputs, data tables, etc.).

- [ ] Component API methods registered with `registerComponentApi` (if component needs APIs)
- [ ] Common methods implemented where applicable: `setValue`, `focus`, `reset`
- [ ] API methods are properly typed
- [ ] API documentation explains when/why to use each method

```typescript
// ✅ Good - Only for components that need programmatic control
useEffect(() => {
  registerComponentApi?.({
    setValue: (value: string) => {
      setInternalValue(value);
      updateState?.({ value });
    },
    focus: () => inputRef.current?.focus(),
  });
}, [registerComponentApi, updateState]);
```

### ✅ State Synchronization
- [ ] Internal state synchronized with XMLUI
- [ ] `updateState` called when values change
- [ ] State updates are properly debounced if needed

---

## 🧪 Testing

### ✅ Component Driver
- [ ] Component has dedicated driver class
- [ ] Driver extends `ComponentDriver`
- [ ] Driver provides component-specific methods
- [ ] Driver used in all component tests

### ✅ Test Coverage
- [ ] Basic functionality tests
- [ ] Accessibility tests (REQUIRED)
- [ ] Visual state tests
- [ ] Edge case tests (null, undefined, special characters)
- [ ] Performance tests (memoization, rapid changes)
- [ ] Integration tests (layout contexts)

### ✅ Test Organization
- [ ] Tests grouped by category with section headers
- [ ] Descriptive test names
- [ ] Tests are independent and isolated
- [ ] Tests use proper assertions

---

## 📦 Component Registration

### ✅ Registration Pattern
- [ ] Component registered in `ComponentRegistry`
- [ ] Conditional registration based on environment
- [ ] Component name matches metadata

```typescript
// ✅ Good
if (process.env.VITE_USED_COMPONENTS_ComponentName !== "false") {
  this.registerCoreComponent(componentNameComponentRenderer);
}
```

---

## 🚀 Performance

### ✅ Optimization Patterns
- [ ] Component uses `memo` for re-render prevention
- [ ] Expensive calculations are memoized
- [ ] Event handlers are stable references
- [ ] Avoid unnecessary re-renders
- [ ] Hook dependencies are optimized
- [ ] Context values are memoized

### ✅ Hook Performance Best Practices
- [ ] `useCallback` dependencies are minimal and stable
- [ ] `useMemo` is used for expensive computations only
- [ ] Context providers memoize their values
- [ ] Effects are split to minimize re-runs
- [ ] State updates are batched when possible

```typescript
// ✅ Good Hook Performance
const ComponentName = memo(({ items, onItemClick }) => {
  // Memoize expensive computation
  const processedItems = useMemo(() => {
    return items.map(item => expensiveProcessing(item));
  }, [items]);
  
  // Stable event handler
  const handleItemClick = useCallback((item) => {
    onItemClick(item);
  }, [onItemClick]);
  
  // Split effects by concern
  useEffect(() => {
    trackPageView();
  }, []); // Only on mount
  
  useEffect(() => {
    updateItems(processedItems);
  }, [processedItems]); // Only when items change
  
  return (
    <div>
      {processedItems.map(item => (
        <Item key={item.id} data={item} onClick={handleItemClick} />
      ))}
    </div>
  );
});
```

### ✅ Memory Management
- [ ] Event listeners properly cleaned up
- [ ] Subscriptions disposed in cleanup
- [ ] No memory leaks in component lifecycle
- [ ] Effect cleanup functions implemented
- [ ] Timers and intervals cleared
- [ ] AbortController used for cancellable requests

```typescript
// ✅ Good Memory Management
function ComponentName() {
  useEffect(() => {
    // Event listener cleanup
    const handleResize = () => updateLayout();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    // Timer cleanup
    const timer = setTimeout(() => performAction(), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Subscription cleanup
    const subscription = dataService.subscribe(handleData);
    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    // Request cancellation
    const controller = new AbortController();
    
    fetchData({ signal: controller.signal })
      .then(handleData)
      .catch(error => {
        if (error.name !== 'AbortError') {
          handleError(error);
        }
      });
    
    return () => controller.abort();
  }, []);
}
```

---

## 📊 Component Status and Lifecycle

### ✅ Status Declaration
- [ ] Component has explicit status in metadata (`status: "experimental" | "stable" | "deprecated"`)
- [ ] Status is appropriate for component maturity level
- [ ] Breaking changes are documented in status transitions
- [ ] Experimental components have clear graduation criteria
- [ ] Deprecated components include migration guidance

### ✅ Documentation Requirements by Status
- [ ] **Experimental**: Clear warnings about API instability
- [ ] **Stable**: Comprehensive documentation and examples
- [ ] **Deprecated**: Deprecation timeline and alternatives

### ⚠️ Special Handling for Deprecated Components
- [ ] **HTML Tag Components**: All components in `HtmlTags.tsx` are deprecated
  - [ ] Skip during routine component reviews
  - [ ] Do not enhance or extend these components
  - [ ] Direct new development to semantic HTML or dedicated XMLUI components
  - [ ] Include migration guidance in documentation

**Example:**
```typescript
export const ComponentMd = createMetadata({
  status: "stable", // or "experimental" | "deprecated"
  description: "Component description with status context...",
  // ... rest of metadata
});
```

---

## 🎨 Template and Customization Standards

### ✅ Template Property Patterns
- [ ] Template properties follow `*Template` suffix naming convention
- [ ] **Template properties use `dComponent()` metadata helper** (CRITICAL)
- [ ] Template documentation includes expected data structure
- [ ] Context variables are documented (e.g., `$item`, `$index`, `$itemContext`)
- [ ] Template examples are provided in component documentation
- [ ] Template fallbacks are properly handled in implementation

### ✅ Template Import Requirements
- [ ] `dComponent` imported from `../metadata-helpers` when templates are used
- [ ] Import statement includes `dComponent` alongside other helpers

```typescript
// ✅ Good - Import dComponent when using templates
import { 
  createMetadata, 
  d, 
  dComponent,  // Required for template properties
  dEnabled,
  dLabel 
} from "../metadata-helpers";
```

### ✅ Template Property Documentation Standards
- [ ] **All template properties use `dComponent()` consistently** (avoid `d()` for templates)
- [ ] Properties requiring additional flags use spread operator pattern
- [ ] Context variables are explicitly documented in descriptions
- [ ] Internal templates are marked appropriately

**✅ Correct Template Property Patterns:**
```typescript
props: {
  // Standard template property
  optionTemplate: dComponent(
    `Template for rendering dropdown options. Context: $item (option data).`
  ),
  
  // Empty state template
  emptyListTemplate: dComponent(
    `Template shown when no options are available. No additional context.`
  ),
  
  // Template with additional properties
  tabTemplate: {
    ...dComponent(
      `Template for clickable tab area. Context: $tab (tab data).`
    ),
    isInternal: true,
  },
  
  // Template with complex context
  valueTemplate: dComponent(
    `Template for selected values in multi-select. Context: $item (selected item), $itemContext ({ removeItem }).`
  ),
}
```

**❌ Incorrect Template Property Patterns:**
```typescript
props: {
  // ❌ Wrong - using d() instead of dComponent()
  emptyListTemplate: d(
    "Template for empty state."
  ),
  
  // ❌ Wrong - plain object instead of dComponent()
  tabTemplate: {
    description: "Template for tabs.",
    valueType: "ComponentDef",
    isInternal: true,
  },
  
  // ❌ Wrong - missing context variable documentation
  optionTemplate: dComponent(
    `Template for options.`  // Missing $item context info
  ),
}
```

### ✅ Template Implementation
- [ ] Templates receive appropriate context data
- [ ] Template rendering uses `MemoizedItem` for performance
- [ ] Template components handle missing data gracefully
- [ ] Custom templates maintain accessibility standards
- [ ] Context variables are properly passed to templates

**Template Usage Pattern:**
```typescript
// ✅ Good - Template rendering with context
valueRenderer={
  node.props.valueTemplate
    ? (item, removeItem) => {
        return (
          <MemoizedItem
            contextVars={{
              $item: item,
              $itemContext: { removeItem },
            }}
            node={node.props.valueTemplate}
            item={item}
            renderChild={renderChild}
          />
        );
      }
    : undefined
}
```

### ✅ Template Property Compliance Checklist
- [ ] **No template properties use `d()` helper** (should be `dComponent()`)
- [ ] **No template properties use plain objects** (should use `dComponent()`)
- [ ] **All template imports include `dComponent`** from metadata-helpers
- [ ] **Context variables documented** in all template descriptions
- [ ] **Spread operator used** for templates with additional properties
- [ ] **Template names end with `Template`** suffix consistently

---

## 🔧 Wrapper Component Guidelines

### ✅ Wrapper Component Standards
- [ ] Simple re-exports are justified (avoid unnecessary wrappers)
- [ ] Wrapper components maintain proper TypeScript exports
- [ ] Wrapper components preserve original component metadata
- [ ] Complex wrappers use proper `createComponentRenderer` pattern
- [ ] Wrapper purpose is clearly documented

### ✅ When to Use Wrappers
- [ ] **Valid**: Legacy compatibility layers
- [ ] **Valid**: Component composition with added functionality
- [ ] **Invalid**: Simple re-exports without added value
- [ ] **Invalid**: Breaking TypeScript type chains

---

## 📊 Data Component Standards

### ✅ Data Fetching Components
- [ ] Loading states are implemented with proper UI feedback
- [ ] Error handling provides meaningful user feedback
- [ ] Data components support polling/refresh patterns when appropriate
- [ ] Result selectors are documented with usage examples
- [ ] Caching strategies are clearly defined and implemented
- [ ] Data transformation patterns are consistent across components

### ✅ Data Flow Patterns
- [ ] Components follow unidirectional data flow
- [ ] Data mutations are handled through proper callbacks
- [ ] Component state is minimized in favor of props
- [ ] Data validation occurs at appropriate boundaries

**Example:**
```typescript
props: {
  resultSelector: d(
    "Extract subset of response data. Example: 'data.items' for nested arrays."
  ),
  pollIntervalInSeconds: d(
    "Polling interval for real-time updates. Set to 0 to disable polling."
  ),
}
```

---

## 🌐 API and Data Manipulation Standards

### ✅ API Component Requirements
- [ ] **HTTP methods handled comprehensively** (GET, POST, PUT, DELETE, PATCH)
- [ ] **Request/response lifecycle documented** with clear event patterns
- [ ] **Confirmation dialogs supported** for destructive operations
- [ ] **Optimistic updates implemented** where appropriate
- [ ] **Error handling comprehensive** with user-friendly messages
- [ ] **Loading states managed** with proper UI feedback

### ✅ API Component Event Lifecycle
- [ ] **beforeRequest**: Validation and preparation phase
- [ ] **progress**: Loading state and intermediate updates
- [ ] **success**: Successful completion handling
- [ ] **error**: Error handling and user notification

**Example:**
```typescript
export const APICallMd = createMetadata({
  description: "API component for data manipulation operations",
  events: {
    beforeRequest: d("Fired before request execution for validation"),
    progress: d("Fired during request processing for progress indication"),
    success: d("Fired on successful completion with response data"),
    error: d("Fired on error with error details for user feedback"),
  },
  // ... rest of metadata
});
```

### ✅ Data Fetching and Caching
- [ ] **Polling patterns supported** with configurable intervals
- [ ] **Cache invalidation strategies** clearly defined
- [ ] **Result selectors documented** with usage examples
- [ ] **Query parameter handling** comprehensive
- [ ] **Data transformation patterns** consistent

---

## 📊 Chart and Visualization Standards

### ✅ Chart Component Requirements
- [ ] **Data visualization accessibility** for screen readers
- [ ] **Responsive chart layouts** for different screen sizes
- [ ] **Consistent data key patterns** across chart types
- [ ] **Comprehensive theming support** following XMLUI standards
- [ ] **Performance optimized** for large datasets
- [ ] **Interactive elements** properly accessible

### ✅ Chart Data Patterns
- [ ] **Data structure documented** with clear examples
- [ ] **Data validation implemented** with proper error handling
- [ ] **Data transformation utilities** available and documented
- [ ] **Color schemes accessible** with proper contrast ratios
- [ ] **Animation performance** optimized for smooth interactions

**Example:**
```typescript
export const BarChartMd = createMetadata({
  status: "experimental",
  description: "Bar chart component for data visualization",
  props: {
    data: d("Array of objects with consistent data structure"),
    dataKeys: d("Keys to extract values - e.g., 'value', 'category'"),
    accessibility: d("Screen reader descriptions for chart elements"),
  },
  // ... chart-specific metadata
});
```

---

## 📝 Rich Content Component Standards

### ✅ Content Processing Requirements
- [ ] **Content sanitization implemented** to prevent XSS attacks
- [ ] **Keyboard navigation support** for rich content areas
- [ ] **Undo/redo functionality** for editor components
- [ ] **Large document performance** optimized with virtualization
- [ ] **Content accessibility standards** followed (WCAG compliance)
- [ ] **Export/import capabilities** documented and tested

### ✅ Editor Component Patterns
- [ ] **Editor state management** follows controlled component patterns
- [ ] **Plugin architecture supported** for extensibility
- [ ] **Content validation** implemented with user feedback
- [ ] **Auto-save functionality** with conflict resolution
- [ ] **Collaborative editing** considerations documented

**Example:**
```typescript
export const MarkdownMd = createMetadata({
  description: "Rich markdown content processor with syntax highlighting",
  props: {
    content: d("Markdown content with security sanitization"),
    removeIndents: d("Auto-format content for display consistency"),
    showHeadingAnchors: d("Navigation aids for long documents"),
  },
  // ... content-specific metadata
});
```

---

## 🔌 External Library Integration Standards

### ✅ Integration Requirements
- [ ] **External dependencies documented** with version compatibility
- [ ] **Library integrations follow XMLUI patterns** consistently
- [ ] **Theme consistency maintained** across external components
- [ ] **Library updates versioned and tested** systematically
- [ ] **Integration error handling** graceful with fallbacks
- [ ] **Bundle size impact** documented and minimized

### ✅ Third-Party Component Wrapper Patterns
- [ ] **Wrapper components use createComponentRenderer** when possible
- [ ] **External component props mapped** to XMLUI conventions
- [ ] **Error boundaries implemented** for external component failures
- [ ] **Performance considerations** documented for heavy libraries
- [ ] **Alternative implementations** considered for critical features

**Example:**
```typescript
// TipTap editor integration
export const TableEditorMd = createMetadata({
  description: "Rich table editor using TipTap library",
  externalDependencies: ["@tiptap/react", "@tiptap/starter-kit"],
  props: {
    // Map external props to XMLUI patterns
  },
  // ... integration metadata
});
```

---

## ⚛️ React-Only Component Guidelines

### ✅ Non-XMLUI Component Standards
- [ ] **Pure React components justified** with clear reasoning
- [ ] **Theme integration maintained** despite bypassing XMLUI
- [ ] **Documentation explains** why XMLUI patterns are not used
- [ ] **React best practices followed** consistently
- [ ] **Components marked clearly** as non-XMLUI in documentation

### ✅ When React-Only is Acceptable
- [ ] **Complex state management** not suited to XMLUI patterns
- [ ] **Heavy external library integration** requiring direct React usage
- [ ] **Performance-critical components** needing direct React optimizations
- [ ] **Legacy integration** requiring specific React patterns

**Example:**
```typescript
// ProfileMenu - React-only component
export const ProfileMenu = ({ loggedInUser }: Props) => {
  // Direct React implementation for complex dropdown logic
  // Note: This bypasses XMLUI createComponentRenderer pattern
  // Justification: Complex user state management and theme switching
  return (
    <DropdownMenu triggerTemplate={<Avatar {...props} />}>
      {/* Complex menu logic */}
    </DropdownMenu>
  );
};
```

### ❌ React-Only Antipatterns
- [ ] **Avoid**: Creating React-only components when XMLUI patterns would work
- [ ] **Avoid**: Bypassing theme system without justification
- [ ] **Avoid**: Missing documentation for architecture decisions
- [ ] **Avoid**: Inconsistent patterns within the same feature area

---

## 📏 Component File Size and Modularization

### ✅ File Size Management
- [ ] **Individual component files under 500 lines** (excluding generated content)
- [ ] **Large component collections modularized** by logical groups
- [ ] **Utility files separated** from component definitions
- [ ] **Generated content uses build-time generation** when possible
- [ ] **Monolithic files identified** and refactoring planned

### ✅ Modularization Strategies
- [ ] **Related components grouped** in logical folders
- [ ] **Shared utilities extracted** to common modules
- [ ] **Registration files modular** to avoid massive imports
- [ ] **Component dependencies minimized** through proper separation

**Example - HtmlTags Modularization:**
```typescript
// Instead of 2,500-line HtmlTags.tsx, create:
// components/HtmlTags/TextTags.tsx
// components/HtmlTags/MediaTags.tsx  
// components/HtmlTags/FormTags.tsx
// components/HtmlTags/index.ts (barrel export)

export const textTagRenderers = {
  htmlATagRenderer,
  htmlPTagRenderer,
  htmlSpanTagRenderer,
  // ... text-related tags
};

export const mediaTagRenderers = {
  htmlImgTagRenderer,
  htmlVideoTagRenderer,
  htmlAudioTagRenderer,
  // ... media-related tags
};
```

### ❌ File Size Antipatterns
- [ ] **Avoid**: Single files exceeding 500 lines without justification
- [ ] **Avoid**: Mixing unrelated functionality in single files
- [ ] **Avoid**: Generated content committed without build process
- [ ] **Avoid**: Monolithic registration files

---

## 🧩 Child Component and Sub-Component Patterns

### ✅ Child Component Standards
- [ ] **Child components use dedicated files** when exceeding 50 lines
- [ ] **Consistent naming pattern** (ParentChild format)
- [ ] **Parent relationship documented** in component metadata
- [ ] **Independent metadata maintained** for each child component
- [ ] **Parent-child context passing documented** with examples

### ✅ Sub-Component Architecture
- [ ] **Child component registration** handled properly with parent
- [ ] **Shared styling and theming** consistent between parent and children
- [ ] **Child component lifecycle** managed by parent appropriately
- [ ] **Context boundaries clear** between parent and child responsibilities

**Example:**
```typescript
// TabItem - Child component for Tabs
export const TabItemMd = createMetadata({
  description: "Individual tab within Tabs component",
  docFolder: "Tabs", // Groups with parent documentation
  parentComponent: "Tabs",
  props: {
    label: dLabel("Tab header text displayed in tab bar"),
  },
});
```

### ❌ Child Component Antipatterns
- [ ] **Avoid**: Inconsistent approaches to parent-child relationships
- [ ] **Avoid**: Large child components inlined in parent files
- [ ] **Avoid**: Missing documentation of parent-child contracts
- [ ] **Avoid**: Tight coupling preventing child component reuse

---

## 📖 Context Variable Documentation

### ✅ Context Variable Standards
- [ ] **All template components document** available context variables
- [ ] **Context variables use `$variable` naming** convention consistently
- [ ] **Variable types and descriptions provided** for all context data
- [ ] **Usage examples included** in component documentation
- [ ] **Context variable scope clearly defined** for nested components

### ✅ Template Context Patterns
- [ ] **Standard context variables** used consistently (`$item`, `$index`, `$value`)
- [ ] **Component-specific context** documented with clear examples
- [ ] **Context data transformation** explained when applicable
- [ ] **Context performance implications** considered for large datasets

**Example:**
```typescript
export const ColumnMd = createMetadata({
  description: "Table column with rich context support",
  contextVars: {
    $item: {
      description: "The complete data row object being rendered",
      type: "object",
      example: "{ id: 1, name: 'John', email: 'john@example.com' }",
    },
    $cell: {
      description: "The specific cell value for this column",
      type: "any",
      example: "'John' (when bindTo='name')",
    },
    $itemIndex: {
      description: "Zero-based row index",
      type: "number",
      example: "0, 1, 2, ...",
    },
    $colIndex: {
      description: "Zero-based column index",
      type: "number",
      example: "0, 1, 2, ...",
    },
  },
  // ... rest of metadata
});
```

### ❌ Context Variable Antipatterns
- [ ] **Avoid**: Missing context variable documentation for template components
- [ ] **Avoid**: Inconsistent context variable naming across components
- [ ] **Avoid**: Undocumented context data transformation
- [ ] **Avoid**: Context variables without type information

---
