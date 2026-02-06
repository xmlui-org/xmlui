# Component Behaviors

This document explains XMLUI's component behavior system - a cross-cutting concern mechanism that enables attaching reusable functionality to components declaratively. It covers the behavior architecture, the seven framework behaviors (label, animation, tooltip, variant, bookmark, form binding, and validation), the attachment mechanism, and implementation details for framework developers working on the XMLUI core.

## What Are Component Behaviors?

**Component behaviors** are decorator-like objects that wrap rendered React components with additional functionality based on component properties. They implement cross-cutting concerns that apply to multiple components without requiring changes to component implementations.

A behavior examines a component's definition and metadata to determine eligibility, then wraps the rendered React node with enhanced functionality. This approach enables features like tooltips, animations, and form labels to work consistently across all visual components without coupling the feature implementation to specific component renderers.

**Key Characteristics:**

- **Declarative Attachment** - Behaviors attach automatically when specific properties are present
- **Zero Component Coupling** - Components need no knowledge of behaviors; they simply render
- **Composable** - Multiple behaviors can wrap the same component in sequence
- **Renderer Context Access** - Behaviors access the full renderer context for value extraction and state management
- **Metadata-Aware** - Behaviors inspect component metadata to determine applicability

## Architectural Overview

### The Behavior Interface

All behaviors implement a simple contract with three members:

```typescript
export interface Behavior {
  name: string;
  canAttach: (context: RendererContext<any>, node: ComponentDef, metadata: ComponentMetadata) => boolean;
  attach: (
    context: RendererContext<any>,
    node: ReactNode,
    metadata?: ComponentMetadata
  ) => ReactNode;
}
```

- **name** - Unique identifier for the behavior (e.g., "tooltip", "animation", "label")
- **canAttach** - Predicate determining if the behavior applies to a specific component instance based on the renderer context, component definition, and metadata
- **attach** - Transformation function that wraps the rendered React node with enhanced functionality

**Important Note on Transformation Flexibility:**

The `attach` function can transform the rendered component in any valid way - wrapping it in other React components is just one approach. Behaviors can also clone the rendered node using `React.cloneElement()` to add or modify properties (such as CSS classes, event handlers, or attributes), compose multiple transformations, or apply any other valid React node manipulation. The only requirement is that `attach` must return a valid React node.

### Application in ComponentAdapter

Behaviors apply in `ComponentAdapter` immediately after the component renderer produces the initial React node:

```typescript
// 1. Component renderer executes
renderedNode = renderer(rendererContext);

// 2. Retrieve registered behaviors from component registry
const behaviors = componentRegistry.getBehaviors();

// 3. Apply behaviors sequentially (skip compound components)
if (!isCompoundComponent) {
    for (const behavior of behaviors) {
      if (behavior.canAttach(rendererContext, rendererContext.node, descriptor)) {
        renderedNode = behavior.attach(rendererContext, renderedNode, descriptor);
      }
    }
}

// 4. Continue with decoration, API binding, layout wrapping...
```

**Application Logic:**

1. **Renderer Execution** - Component's renderer function produces the initial React node from the component definition
2. **Behavior Retrieval** - `componentRegistry.getBehaviors()` returns all registered behaviors from the central registry (framework behaviors plus any contributed by external packages)
3. **Compound Check** - If the component is a compound (XMLUI-defined) component, skip all behaviors to avoid wrapping internal structure
4. **Sequential Evaluation** - For each behavior in order:
  - Call `canAttach(context, node, metadata)` with the renderer context, component definition, and metadata descriptor
  - If true, call `attach(context, renderedNode, metadata)` to wrap the node
  - The wrapped node becomes the input for the next behavior
5. **Result** - Multiple behaviors create nested wrappers in application order (label innermost, validation outermost)

This placement ensures behaviors wrap the core component but remain inside decorations (test IDs), API bindings, and layout wrappers.

### Behavior Registration Architecture

Behaviors are registered centrally in the `ComponentRegistry` class within `ComponentProvider`, following the same pattern used for components, actions, and loaders. This centralized registry enables both framework behaviors and external package behaviors to coexist.

**Registration in ComponentRegistry:**

```typescript
class ComponentRegistry {
  private behaviors: Behavior[] = [];

  constructor(contributes: ContributesDefinition = {}, ...) {
    // ... component and action registration ...

    // Register framework-implemented behaviors
    this.registerBehavior(labelBehavior);
    this.registerBehavior(animationBehavior);
    this.registerBehavior(tooltipBehavior);
    this.registerBehavior(variantBehavior);
    this.registerBehavior(bookmarkBehavior);
    this.registerBehavior(formBindingBehavior);
    this.registerBehavior(validationBehavior);

    // Register external behaviors from contributes
    contributes.behaviors?.forEach((behavior) => {
      this.registerBehavior(behavior);
    });
  }

  private registerBehavior(
    behavior: Behavior,
    location: "before" | "after" = "after",
    position?: string
  ) {
    if (position) {
      const targetIndex = this.behaviors.findIndex(b => b.name === position);
      if (targetIndex !== -1) {
        const insertIndex = location === "before" ? targetIndex : targetIndex + 1;
        this.behaviors.splice(insertIndex, 0, behavior);
        return;
      }
    }
    this.behaviors.push(behavior);
  }

  getBehaviors(): Behavior[] {
    return this.behaviors;
  }
}
```

**ComponentAdapter Retrieval:**

The `ComponentAdapter` retrieves registered behaviors from the component registry:

```typescript
// In ComponentAdapter.tsx
const componentRegistry = useComponentRegistry();
const behaviors = componentRegistry.getBehaviors();

// Apply behaviors to rendered node
for (const behavior of behaviors) {
  if (behavior.canAttach(rendererContext.node, descriptor)) {
    renderedNode = behavior.attach(rendererContext, renderedNode);
  }
}
```

**External Package Registration:**

External component packages can contribute custom behaviors through the `ContributesDefinition`:

```typescript
// In an external package (e.g., packages/my-package/src/index.tsx)
import { myCustomBehavior } from "./behaviors/MyCustomBehavior";

export default {
  namespace: "MyPackage",
  components: [myComponentRenderer],
  behaviors: [myCustomBehavior],  // Custom behaviors register here
};
```

**Positioned Registration:**

The `registerBehavior` method supports precise control over behavior execution order through optional `location` and `position` parameters:

- **location**: `"before" | "after"` - Specifies placement relative to the target behavior
- **position**: `string` - The name of the target behavior for positioning

This allows external packages to insert behaviors at specific points in the execution sequence:

```typescript
// Insert a custom behavior before the animation behavior
registerBehavior(myBehavior, "before", "animation");

// Insert a custom behavior after the tooltip behavior
registerBehavior(myBehavior, "after", "tooltip");
```

**Benefits of Registry Architecture:**

- **Extensibility** - Third-party packages can register custom behaviors without modifying framework code
- **Consistency** - Follows the same pattern as components, actions, and loaders
- **Order Control** - Positioned registration enables fine-grained control over behavior application sequence
- **Centralized Management** - All behaviors accessible through single `getBehaviors()` method
- **Type Safety** - Full TypeScript type checking for behavior implementations

## Framework-Implemented Behaviors

XMLUI currently implements seven behaviors that handle common cross-cutting concerns. These serve as examples of the behavior pattern and provide essential functionality across all visual components:

1. **Label Behavior** - Wraps form input components with labels and visual indicators
2. **Animation Behavior** - Applies entry/exit animations using CSS animations or transitions
3. **Tooltip Behavior** - Displays informational text or markdown on hover
4. **Variant Behavior** - Applies custom theme variant styling to components
5. **Bookmark Behavior** - Adds bookmark functionality for scroll-to navigation
6. **Form Binding Behavior** - Binds input components directly to forms
7. **Validation Behavior** - Adds validation logic to form-bindable components

### Label Behavior

Wraps form input components with labels, positioning, and visual indicators (required asterisk, validation states). The label behavior activates when a component has the `label` property and does not explicitly handle its own labeling.

**Attachment Criteria:**
```typescript
canAttach: (context, node, metadata) => {
  // Don't attach if component declares its own label prop handling
  if (metadata?.props?.label) {
    return false;
  }
  // Only attach if component has a label prop
  if (!node.props?.label) {
    return false;
  }
  // Don't attach if formBindingBehavior will handle this component
  const bindTo = extractValue(node.props?.bindTo, true);
  const hasValueApiPair = !!metadata?.apis?.value && !!metadata?.apis?.setValue;
  if (bindTo && hasValueApiPair || node.type === "FormItem") {
    return false;
  }
  return true;
}
```

**Usage Example:**
```xmlui
<TextBox 
  label="Email Address" 
  labelPosition="top"
  required={true}
  placeholder="your@email.com" />
```

**Wrapping Process:**
1. Extracts label-related properties: `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `style`, `readOnly`, `shrinkToLabel`
2. Uses the renderer context's `className` to maintain styling consistency
3. Wraps the component in `<ItemWithLabel>` which handles label rendering, positioning, and required indicators
4. Special handling for `inputTemplate` - the `isInputTemplateUsed` flag adjusts label layout when custom input templates are present

**Metadata Check Explanation:**

The label behavior checks `metadata?.props?.label` to determine if a component has explicit label property metadata defined. Components like Checkbox or Radio that include label rendering as part of their core functionality define `label` in their metadata. For these components, the label behavior does not attach - they handle their own labels.

Components like TextBox or Select do not define `label` in their metadata because they expect the label behavior to handle labeling. The presence of a `label` prop in the component instance (but absence in metadata) signals that the behavior should attach.

### Animation Behavior

Applies entry/exit animations to components using CSS animations or transitions. The animation behavior activates when a component has the `animation` property defined.

**Attachment Criteria:**
```typescript
canAttach: (context, node) => {
  const animation = extractValue(node.props?.animation, true);
  return !!animation;
}
```

**Usage Example:**
```xmlui
<Card 
  title="Welcome" 
  animation="fadeIn"
  animationOptions="duration: 500; delay: 200" />
```

**Wrapping Process:**
1. Extracts `animation` and `animationOptions` properties from the component definition
2. Parses animation configuration via `parseAnimation()` and `parseAnimationOptions()`
3. Wraps the component in an `<Animation>` component that manages the animation lifecycle
4. Special handling for ModalDialog components - passes `externalAnimation={true}` to prevent animation conflicts

**ModalDialog Special Case:**
```typescript
return (
  <Animation animation={parseAnimation(animation)} {...parsedOptions}>
    {context.node.type === "ModalDialog"
      ? cloneElement(node as ReactElement, {
          externalAnimation: true,
        })
      : node}
  </Animation>
);
```

ModalDialog components have internal animation support. When wrapped by the animation behavior, the `externalAnimation` prop signals the dialog to defer to external animation control.

### Tooltip Behavior

Displays informational text or markdown content when hovering over visual components. The tooltip behavior activates when a component has either the `tooltip` or `tooltipMarkdown` property defined.

**Attachment Criteria:**
```typescript
canAttach: (context, node) => {
  const tooltipText = extractValue(node.props?.tooltip, true);
  const tooltipMarkdown = extractValue(node.props?.tooltipMarkdown, true);
  return !!tooltipText || !!tooltipMarkdown;
}
```

**Usage Example:**
```xmlui
<Button 
  label="Click me" 
  tooltip="This button saves your changes"
  tooltipOptions="right; delayDuration: 800" />
```

**Wrapping Process:**
1. Extracts `tooltip`, `tooltipMarkdown`, and `tooltipOptions` properties using the renderer context's value extractor
2. Parses tooltip options (side, alignment, delay, etc.) via `parseTooltipOptions()`
3. Wraps the rendered component in a `<Tooltip>` component with extracted configuration
4. The wrapped component becomes the tooltip trigger; the Tooltip component handles display logic

### Animation Behavior

Applies entry/exit animations to components using CSS animations or transitions. The animation behavior activates when a component has the `animation` property defined.

**Attachment Criteria:**
```typescript
canAttach: (context, node) => {
  const animation = extractValue(node.props?.animation, true);
  return !!animation;
}
```

**Usage Example:**
```xmlui
<Card 
  title="Welcome" 
  animation="fadeIn"
  animationOptions="duration: 500; delay: 200" />
```

**Wrapping Process:**
1. Extracts `animation` and `animationOptions` properties from the component definition
2. Parses animation configuration via `parseAnimation()` and `parseAnimationOptions()`
3. Wraps the component in an `<Animation>` component that manages the animation lifecycle
4. Special handling for ModalDialog components - passes `externalAnimation={true}` to prevent animation conflicts

**ModalDialog Special Case:**
```typescript
return (
  <Animation animation={parseAnimation(animation)} {...parsedOptions}>
    {context.node.type === "ModalDialog"
      ? cloneElement(node as ReactElement, {
          externalAnimation: true,
        })
      : node}
  </Animation>
);
```

ModalDialog components have internal animation support. When wrapped by the animation behavior, the `externalAnimation` prop signals the dialog to defer to external animation control.

### Variant Behavior

Applies custom theme variant styling to components with non-predefined variant values. This behavior enables theme-level variants that extend beyond a component's built-in variant options. For Button components, this only applies if the variant is not "solid", "outlined", or "ghost". For Badge components, it skips predefined badge variants. For other components, it applies to any component with a variant prop.

**Attachment Criteria:**
```typescript
canAttach: (context, node) => {
  const variant = extractValue(node.props?.variant, true);
  
  // Must have a variant prop
  if (!variant) {
    return false;
  }
  
  // Special handling for Button component
  if (node.type === "Button") {
    const variantStr = typeof variant === "string" ? variant : String(variant);
    return (
      variantStr != undefined &&
      variantStr !== "" &&
      !buttonVariantValues.includes(variantStr as any)
    );
  }
  
  // Special handling for Badge component
  if (node.type === "Badge") {
    const variantStr = typeof variant === "string" ? variant : String(variant);
    return !badgeVariantValues.includes(variantStr as any);
  }
  
  return true;
}
```

**Usage Example:**
```xmlui
<Button 
  label="Premium Action" 
  variant="premium" />
```

**Wrapping Process:**
1. Extracts the `variant` property from the component definition
2. Retrieves theme variables from component metadata (`metadata?.themeVars`)
3. Generates variant-specific CSS variable references for each theme variable
4. Uses the `useStyles` hook to create a CSS class with variant-specific styling
5. Wraps the component in a `VariantWrapper` component that clones the rendered node and adds the variant class

**How Variant Styling Works:**

For a Button with `variant="premium"`, the behavior looks for theme variables like `color-Button`, `backgroundColor-Button`, etc. It then generates CSS that references variant-specific versions:

```css
.variant-class {
  color: var(--xmlui-color-Button-premium, var(--xmlui-color-Button));
  background-color: var(--xmlui-backgroundColor-Button-premium, var(--xmlui-backgroundColor-Button));
}
```

This allows themes to define variant-specific values like `--xmlui-backgroundColor-Button-premium: purple` while falling back to the standard `--xmlui-backgroundColor-Button` if the variant isn't defined in the theme.

**Component Type Filtering:**

The behavior only processes theme variables that match the current component type. For example, when rendering an H1 component, it won't apply theme variables from Heading-related variables that might have `component: "Heading"` in their parsed metadata. This prevents cross-contamination of styles between related components.

### Form Binding Behavior

Binds input components directly to a Form without requiring a FormItem wrapper. When a component has a `bindTo` prop, is inside a Form context, and exposes value/setValue APIs, this behavior wraps it with form binding logic (validation, state management, label rendering, etc.).

**Attachment Criteria:**
```typescript
canAttach: (context, node, metadata) => {
  const bindTo = extractValue(node.props?.bindTo, true);
  const hasValueApiPair = !!metadata?.apis?.value && !!metadata?.apis?.setValue;
  
  // Only attach if component has bindTo, has value/setValue APIs, and is not FormItem
  if (!bindTo || !hasValueApiPair || node.type === "FormItem") {
    return false;
  }
  return true;
}
```

**Usage Example:**
```xmlui
<Form>
  <TextBox 
    bindTo="email"
    label="Email Address"
    required={true}
    minLength={5}
    pattern="email" />
</Form>
```

**Wrapping Process:**
1. Extracts binding-related properties: `bindTo`, `initialValue`, `noSubmit`
2. Extracts all validation properties: `required`, `minLength`, `maxLength`, `minValue`, `maxValue`, `pattern`, `regex`, and their associated invalid messages and severity levels
3. Extracts label properties if present: `label`, `labelPosition`, `labelWidth`, `labelBreak`
4. Extracts other properties: `enabled`, `requireLabelMode`
5. Wraps the component in `<FormBindingWrapper>` which:
   - Manages the connection between the component and Form context
   - Provides the value from form state to the component
   - Updates form state when component value changes
   - Handles label rendering (if label props are provided)
   - Passes validation configuration to child components

**Form-Bindable Components:**

The behavior only attaches to components that support form binding. These include:
- TextBox, PasswordInput, TextArea
- NumberBox, Slider
- Toggle, Checkbox, Switch
- Select, AutoComplete
- DatePicker, DateInput, TimeInput
- ColorPicker, FileInput, RadioGroup

**Relationship with Label Behavior:**

When formBindingBehavior attaches, it takes over label rendering responsibility from labelBehavior. The labelBehavior's `canAttach` explicitly checks for this and skips attachment when a component has both `bindTo` and value/setValue APIs. This prevents double-wrapping and ensures consistent label rendering within form contexts.

### Validation Behavior

Adds validation logic and feedback to form-bindable components and FormItem components. This behavior validates input values against validation rules (required, min/max length, min/max value, pattern, regex) and displays validation feedback to users.

**Attachment Criteria:**
```typescript
canAttach: (context, node, metadata) => {
  const bindTo = extractValue(node.props?.bindTo, true);
  const isFormItem = node.type === "FormItem";
  
  // Attach if it's a FormItem, or if it has bindTo and value/setValue APIs
  if (!isFormItem && (bindTo === undefined || bindTo === null)) {
    return false;
  }
  
  if (!isFormItem) {
    const hasValueApiPair = !!metadata?.apis?.value && !!metadata?.apis?.setValue;
    if (!hasValueApiPair) {
      return false;
    }
  }
  
  return true;
}
```

**Usage Example:**
```xmlui
<Form>
  <TextBox 
    bindTo="username"
    label="Username"
    required={true}
    minLength={3}
    maxLength={20}
    requiredInvalidMessage="Username is required"
    lengthInvalidMessage="Username must be between 3 and 20 characters"
    pattern="alphanumeric" />
</Form>
```

**Wrapping Process:**
1. Extracts component-specific properties: `bindTo`, `itemIndex`, `type` (for FormItem), `inline`, `verboseValidationFeedback`
2. Extracts all validation properties and messages:
   - `required`, `requiredInvalidMessage`
   - `minLength`, `maxLength`, `lengthInvalidMessage`, `lengthInvalidSeverity`
   - `minValue`, `maxValue`, `rangeInvalidMessage`, `rangeInvalidSeverity`
   - `pattern`, `patternInvalidMessage`, `patternInvalidSeverity`
   - `regex`, `regexInvalidMessage`, `regexInvalidSeverity`
3. Extracts validation configuration: `customValidationsDebounce`, `validationMode`, `requireLabelMode`
4. Looks up the `onValidate` event handler (if provided)
5. Wraps the component in `<ValidationWrapper>` which:
   - Monitors the component's value from form context
   - Executes validation rules whenever the value changes
   - Displays validation feedback (error/warning messages)
   - Integrates with Form's validation state
   - Supports custom validation via `onValidate` callback

**Validation Types:**

The validation behavior supports several built-in validation types:
- **Required validation** - Ensures field is not empty
- **Length validation** - Validates string length (min/max)
- **Range validation** - Validates numeric values (min/max)
- **Pattern validation** - Validates against predefined patterns (email, phone, alphanumeric, etc.)
- **Regex validation** - Validates against custom regular expressions
- **Custom validation** - Executes user-defined validation via `onValidate` callback

**Validation Modes:**

The behavior supports different validation modes that control when validation runs:
- **onChange** - Validates on every value change
- **onBlur** - Validates when the field loses focus
- **onSubmit** - Validates only when the form is submitted

**Severity Levels:**

Validation messages can have different severity levels:
- **error** - Prevents form submission (default)
- **warning** - Shows warning but allows form submission

**Relationship with Form Binding Behavior:**

The validationBehavior works in tandem with formBindingBehavior. The binding behavior establishes the connection to form state, while the validation behavior adds validation logic on top. Both behaviors check for the same criteria (bindTo + value/setValue APIs) and wrap the component in their respective wrappers, creating a nested structure:

```jsx
<ValidationWrapper>
  <FormBindingWrapper>
    <TextBox />
  </FormBindingWrapper>
</ValidationWrapper>
```

### Bookmark Behavior

Adds bookmark functionality to any visual component, enabling scroll-to navigation and table of contents integration. When a component has a `bookmark` property, this behavior adds bookmark-related attributes and functionality.

**Attachment Criteria:**
```typescript
canAttach: (context, node, metadata) => {
  // Don't attach to non-visual components
  if (metadata?.nonVisual) {
    return false;
  }
  
  const bookmark = extractValue(node.props?.bookmark, true);
  return !!bookmark;
}
```

**Usage Example:**
```xmlui
<Stack bookmark="section1" bookmarkTitle="Introduction" height="1200px" 
  backgroundColor="blue">
  <!-- content -->
</Stack>
```

**Wrapping Process:**

Unlike other behaviors that wrap components, the bookmark behavior uses `React.cloneElement()` to add bookmark-related attributes directly to the component without introducing extra DOM wrappers:

1. Extracts bookmark-related properties: `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc`
2. Wraps the component in a `BookmarkWrapper` component that manages bookmark functionality
3. The wrapper uses `cloneElement()` to add `id`, `ref`, and `data-anchor` attributes to the original component
4. Registers the bookmark with TableOfContentsContext for TOC integration and intersection observation
5. Provides a `scrollIntoView` API method for programmatic scrolling

**Key Features:**
- No extra DOM wrapper - attributes added directly to the target component
- Integrates with TableOfContentsContext for TOC and active anchor tracking
- Supports scrollIntoView API for smooth or instant scrolling
- Works with `scrollBookmarkIntoView()` global function for navigation
- Handles both shadow DOM and light DOM scenarios

**Comparison with Bookmark Component:**

The bookmark behavior provides the same functionality as the standalone Bookmark component but applies to any visual component:

```xmlui
<!-- Using Bookmark component (adds wrapper element) -->
<Bookmark id="myBookmark">
  <Stack height="200px" backgroundColor="blue"/>
</Bookmark>

<!-- Using bookmark behavior (no wrapper element) -->
<Stack bookmark="myBookmark" height="200px" backgroundColor="blue"/>
```

Both approaches:
- Register with TableOfContentsContext
- Support scrollIntoView API
- Work with link navigation (`<Link to="#myBookmark"/>`)
- Integrate with the global `scrollBookmarkIntoView()` function

The behavior approach is cleaner when you want bookmark functionality on an existing component without an extra wrapper element.

### Behavior Execution Order

Behaviors are registered in the `ComponentRegistry` during construction. The framework registers its seven core behaviors first, followed by any behaviors contributed by external packages:

```typescript
// Framework behaviors registered in ComponentRegistry constructor
this.registerBehavior(labelBehavior);
this.registerBehavior(animationBehavior);
this.registerBehavior(tooltipBehavior);
this.registerBehavior(variantBehavior);
this.registerBehavior(bookmarkBehavior);
this.registerBehavior(formBindingBehavior);
this.registerBehavior(validationBehavior);

// External behaviors registered after
contributes.behaviors?.forEach((behavior) => {
  this.registerBehavior(behavior);
});
```

**Order Significance:**

The registration order matters because behaviors wrap sequentially. The current order (label, animation, tooltip, variant, bookmark, formBinding, validation) produces this nesting for a component with multiple behaviors:

```
<ValidationWrapper>      ← Validation behavior (outermost)
  <FormBindingWrapper>   ← Form binding behavior
    <BookmarkWrapper>    ← Bookmark behavior
      <VariantWrapper>   ← Variant behavior
        <Tooltip>        ← Tooltip behavior
          <Animation>    ← Animation behavior
            <ItemWithLabel> ← Label behavior
              <TextBox />   ← Original component
            </ItemWithLabel>
          </Animation>
        </Tooltip>
      </VariantWrapper>
    </BookmarkWrapper>
  </FormBindingWrapper>
</ValidationWrapper>
```

This order ensures:
- **Labels** are closest to the core component, wrapping input elements with their labels
- **Animations** affect the labeled component and its contents together
- **Tooltips** appear on the fully animated and labeled component
- **Variant styling** applies to components with tooltips and animations
- **Bookmark functionality** works at the component level with all visual enhancements applied
- **Form binding** manages state and value synchronization for form-bound components
- **Validation** is the outermost layer, monitoring and validating the entire form-bound component

The behaviors are applied in a specific sequence where each layer builds on the previous:
1. Label behavior wraps the core component (TextBox) with label UI
2. Animation behavior adds animation capabilities to the labeled component
3. Tooltip behavior adds hover information to the animated component
4. Variant behavior applies custom theme styling
5. Bookmark behavior adds navigation and TOC integration
6. Form binding behavior connects the component to form state
7. Validation behavior adds validation logic and feedback

Note that not all behaviors will attach to every component - behaviors only attach when their specific conditions are met (e.g., variant behavior only attaches when a component has a non-standard variant prop, form binding only attaches when bindTo is present with value/setValue APIs).

Changing the order would alter this nesting and could break visual consistency, interaction behavior, or form functionality.

## Renderer Context in Behaviors

Behaviors receive the full `RendererContext` when attaching, providing access to all rendering capabilities:

```typescript
export interface RendererContext<TMd extends ComponentMetadata = ComponentMetadata>
  extends ComponentRendererContextBase<TMd> {
  node: ComponentDef<TMd>;
  state: any;
  updateState: (state: any) => void;
  appContext: AppContextType;
  extractValue: ValueExtractor;
  lookupEventHandler: LookupEventHandlerFn<TMd>;
  lookupAction: LookupAsyncFn;
  lookupSyncCallback: LookupSyncFn;
  extractResourceUrl: (url?: unknown) => string | undefined;
  renderChild: RenderChildFn;
  registerComponentApi: RegisterComponentApiFn;
  className: string | undefined;
  layoutContext: LayoutContext | undefined;
  uid: symbol;
}
```

**Key Context Properties Used by Behaviors:**

- **extractValue** - Extracts property values from expressions, handles data binding, evaluates context variables
- **node** - The component definition containing props, events, children, and type information
- **className** - Computed CSS classes from layout properties, passed to wrapped components for style consistency
- **renderChild** - Function to render child components, used when behaviors need to render templates (e.g., tooltip templates)
- **appContext** - Global application context with navigation, state buckets, media queries, and theme information

**Example - Tooltip Behavior Using Context:**

```typescript
attach: (context, node, metadata) => {
  const { extractValue } = context;
  const tooltipText = extractValue(context.node.props?.tooltip, true);
  const tooltipMarkdown = extractValue(context.node.props?.tooltipMarkdown, true);
  const tooltipOptions = extractValue(context.node.props?.tooltipOptions, true);
  const parsedOptions = parseTooltipOptions(tooltipOptions);

  // metadata may be used to alter behavior for components marked nonVisual
  // or opaque; it's passed in for richer decision-making.
  return (
    <Tooltip text={tooltipText} markdown={tooltipMarkdown} {...parsedOptions}>
      {node}
    </Tooltip>
  );
}
```

The `extractValue` function handles:
- Static string values: `tooltip="Click me"` → `"Click me"`
- Expression evaluation: `tooltip={message}` → evaluates `message` variable
- Context variable resolution: `tooltip={$user.name}` → retrieves from app context
- Data binding: `tooltip={item.description}` → extracts from current data context

## Implementation Details

### ComponentAdapter Integration Point

The behavior application occurs in `ComponentAdapter` after the renderer produces the initial node but before decoration and event handler attachment:

```typescript
// From ComponentAdapter.tsx (simplified flow)
let renderedNode: ReactNode = null;

try {
  if (safeNode.type === "Slot") {
    renderedNode = slotRenderer(rendererContext, parentRenderContext);
  Multiple Behaviors:**

```xmlui
<TextBox 
  label="Email"
  tooltip="Enter your email address"
  animation="slideIn" />
```

Produces:
```jsx
<ItemWithLabel label="Email">
  <Animation animation={slideInAnimation}>
    <Tooltip text="Enter your email address">
      <input type="text" className="xmlui-textbox" />
    </Tooltip>
  </Animation>
</ItemWithLabel>
```

**Bookmark Behavior (Using cloneElement):**

```xmlui
<Stack 
  bookmark="section1"
  bookmarkTitle="Introduction"
  height="200px"
  backgroundColor="blue" />
```

Produces:
```jsx
<BookmarkWrapper 
  bookmarkId="section1"
  title="Introduction"
  level={1}
  omitFromToc={false}
  registerComponentApi={...}>
  <div 
    className="xmlui-stack"
    id="section1"
    data-anchor={true}
    ref={elementRef}
    style={{ height: "200px", backgroundColor: "blue" }}
  />
</BookmarkWrapper>
```

Note: The BookmarkWrapper uses `React.cloneElement()` to add the `id`, `ref`, and `data-anchor` attributes directly to the Stack component without introducing an extra DOM wrapper between the wrapper and the Stack.
  // --- Components may have a `testId` property for E2E testing purposes
  if ((appContext?.decorateComponentsWithTestId && ...) || inspectId !== undefined) {
    renderedNode = (
      <ComponentDecorator attr={{ "data-testid": resolvedUid, ... }}>
        {cloneElement(renderedNode as ReactElement, { ... })}
      </ComponentDecorator>
    );
  }

  // --- API-bound components provide helpful behavior
  if (isApiBound) {
    return <ApiBoundComponent ... />;
  }

  // --- Layout context wrapping
  if (layoutContextRef.current?.wrapChild) {
    renderedNode = layoutContextRef.current.wrapChild(...);
  }
} catch (e) {
  renderingError = (e as Error)?.message || "Internal error";
}
```

**Pipeline Position:**

1. **Renderer Execution** - Component-specific rendering logic produces initial node
2. **Behavior Application** ← **Behaviors apply here**
3. **Test Decoration** - Test IDs and inspection attributes added via ComponentDecorator
4. **API Binding** - API-bound components wrapped in ApiBoundComponent
5. **Layout Wrapping** - Layout context applies layout-specific wrappers

This position ensures behaviors wrap the core component but remain inside decorations and API bindings. The layering ensures:
- Behaviors affect only the visual component, not decoration infrastructure
- Test IDs and inspection attributes apply to behavior-wrapped components
- API binding affects the entire behavior-enhanced component
- Layout wrapping encompasses all previous layers

### Behavior Transformation Examples

The following examples demonstrate how the framework-implemented behaviors transform components.

**Single Behavior (Tooltip):**

```xmlui
<Button label="Save" tooltip="Save your changes" />
```

Produces:
```jsx
<Tooltip text="Save your changes">
  <button className="xmlui-button">Save</button>
</Tooltip>
```

**Multiple Behaviors with Animation:**

```xmlui
<Card 
  title="Welcome"
  animation="fadeIn"
  tooltip="This is a welcome card" />
```

Produces:
```jsx
<Animation animation={fadeInAnimation}>
  <Tooltip text="This is a welcome card">
    <div className="xmlui-card">
      <div className="card-title">Welcome</div>
    </div>
  </Tooltip>
</Animation>
```

**Label, Animation, and Tooltip:**

```xmlui
<TextBox 
  label="Email"
  tooltip="Enter your email address"
  animation="slideIn" />
```

Produces:
```jsx
<ItemWithLabel label="Email">
  <Animation animation={slideInAnimation}>
    <Tooltip text="Enter your email address">
      <input type="text" className="xmlui-textbox" />
    </Tooltip>
  </Animation>
</ItemWithLabel>
```

**Form Binding with Validation:**

```xmlui
<Form>
  <TextBox 
    bindTo="username"
    label="Username"
    required={true}
    minLength={3}
    tooltip="Choose a unique username" />
</Form>
```

Produces:
```jsx
<ValidationWrapper bindTo="username" validations={{required: true, minLength: 3}}>
  <FormBindingWrapper bindTo="username" label="Username">
    <Tooltip text="Choose a unique username">
      <input type="text" className="xmlui-textbox" />
    </Tooltip>
  </FormBindingWrapper>
</ValidationWrapper>
```

**Variant Behavior:**

```xmlui
<Button label="Premium Action" variant="premium" />
```

Produces:
```jsx
<VariantWrapper variant="premium" componentType="Button">
  <button className="xmlui-button premium-variant-class">Premium Action</button>
</VariantWrapper>
```

**Bookmark Behavior:**

```xmlui
<Stack 
  bookmark="section1"
  bookmarkTitle="Introduction"
  height="200px"
  backgroundColor="blue" />
```

Produces:
```jsx
<BookmarkWrapper 
  bookmarkId="section1"
  title="Introduction"
  level={1}
  omitFromToc={false}>
  <div 
    className="xmlui-stack"
    id="section1"
    data-anchor={true}
    ref={elementRef}
    style={{ height: "200px", backgroundColor: "blue" }}
  />
</BookmarkWrapper>
```

Note: The BookmarkWrapper uses `React.cloneElement()` to add the `id`, `ref`, and `data-anchor` attributes directly to the Stack component without introducing an extra DOM wrapper between the wrapper and the Stack.

### Metadata-Driven Attachment

Behaviors inspect component metadata passed to `canAttach()` to make attachment decisions. The metadata contains component descriptor information from the component registry:

```typescript
export type ComponentMetadata<
  TProps extends Record<string, ComponentPropertyMetadata> = Record<string, any>,
  TEvents extends Record<string, ComponentPropertyMetadata> = Record<string, any>,
  TContextValues extends Record<string, ComponentPropertyMetadata> = Record<string, any>,
  TApis extends Record<string, ComponentApiMetadata> = Record<string, any>,
> = {
  status?: "stable" | "experimental" | "deprecated" | "in progress" | "internal";
  description?: string;
  props?: TProps;
  events?: TEvents;
  contextVars?: TContextValues;
  apis?: TApis;
  nonVisual?: boolean;
  childrenAsTemplate?: string;
  opaque?: boolean;
  // ... theme-related fields
};
```

**Label Behavior Metadata Check:**

```typescript
canAttach: (context, node, metadata) => {
  // Check if component defines its own label handling
  if (metadata?.props?.label) {
    return false;  // Component handles labels itself
  }
  // Check if instance has label prop
  const { extractValue } = context;
  const label = extractValue(node.props?.label, true);
  if (!label) {
    return false;  // No label to attach
  }
  // Don't attach if formBindingBehavior will handle this component
  const bindTo = extractValue(node.props?.bindTo, true);
  const hasValueApiPair = !!metadata?.apis?.value && !!metadata?.apis?.setValue;
  if (bindTo && hasValueApiPair || node.type === "FormItem") {
    return false;
  }
  return true;  // Attach label behavior
}
```

**Metadata Usage Patterns:**

- **nonVisual** - Behaviors can check this flag to avoid attaching to non-visual components like DataSource or Container
- **props** - Behaviors check for property metadata to determine if a component explicitly handles a feature
- **opaque** - Indicates internal component structure should not be affected by behaviors

## Behavior Execution Flow

### Complete Rendering Flow with Behaviors

```mermaid
graph TD
    A[ComponentWrapper receives component definition] --> B[ComponentWrapper routes to ComponentAdapter]
    B --> C[ComponentAdapter prepares renderer context]
    C --> D[ComponentAdapter calls component renderer]
    D --> E[Initial React node created]
    E --> F[ComponentAdapter retrieves behaviors from registry via componentRegistry.getBehaviors]
    F --> G[FOR EACH behavior: Evaluate canAttach]
    G --> H{canAttach returns true?}
    H -->|Yes| I[behavior.attach wraps node]
    H -->|No| J[Skip this behavior]
    I --> K[Node transformed with behavior functionality]
    J --> K
    K --> L{More behaviors?}
    L -->|Yes| G
    L -->|No| M[ComponentAdapter applies test decoration]
    M --> N[ComponentAdapter checks for API-bound properties]
    N --> O{Is API-bound?}
    O -->|Yes| P[Wrap in ApiBoundComponent]
    O -->|No| Q[ComponentAdapter applies layout context wrapping]
    P --> Q
    Q --> R[ComponentAdapter returns final transformed node]
```

### Behavior Attachment Decision Tree

```mermaid
flowchart TD
    A[Component rendered] --> B{Is compound component?}
    B -->|Yes| Z[Skip all behaviors]
    B -->|No| C[Label Behavior Check]
    C --> D{Metadata has label prop?}
    D -->|Yes| E[Skip - component handles own label]
    D -->|No| F{Instance has label prop?}
    F -->|Yes| G{Has bindTo + value/setValue APIs?}
    G -->|Yes| E
    G -->|No| H[Wrap in ItemWithLabel]
    F -->|No| I[Continue to Animation]
    E --> I
    H --> I
    
    I[Animation Behavior Check] --> J{Has animation prop?}
    J -->|Yes| K[Wrap in Animation]
    J -->|No| L[Continue to Tooltip]
    K --> L
    
    L[Tooltip Behavior Check] --> M{Has tooltip or tooltipMarkdown?}
    M -->|Yes| N[Wrap in Tooltip]
    M -->|No| O[Continue to Variant]
    N --> O
    
    O[Variant Behavior Check] --> P{Has non-standard variant?}
    P -->|Yes| Q[Wrap in VariantWrapper]
    P -->|No| R[Continue to Bookmark]
    Q --> R
    
    R[Bookmark Behavior Check] --> S{Has bookmark AND not nonVisual?}
    S -->|Yes| T[Wrap in BookmarkWrapper]
    S -->|No| U[Continue to Form Binding]
    T --> U
    
    U[Form Binding Behavior Check] --> V{Has bindTo AND value/setValue APIs?}
    V -->|Yes| W[Wrap in FormBindingWrapper]
    V -->|No| X[Continue to Validation]
    W --> X
    
    X[Validation Behavior Check] --> Y1{Is FormItem OR has bindTo+APIs?}
    Y1 -->|Yes| Y2[Wrap in ValidationWrapper]
    Y1 -->|No| Y3[Return transformed node]
    Y2 --> Y3
    
    Z --> Y3
```

## Summary

Component behaviors provide a powerful mechanism for applying cross-cutting concerns to XMLUI components declaratively. Behaviors integrate seamlessly into the rendering pipeline, transforming components after initial rendering but before decoration. They leverage the full renderer context for value extraction, event handling, and state management.

The behavior system reduces code duplication, ensures consistency, and enables framework-level enhancements without component-level changes. Behaviors are registered in the central `ComponentRegistry` and retrieved via `componentRegistry.getBehaviors()`, then applied sequentially in `ComponentAdapter`.

The registry-based architecture enables extensibility - both framework behaviors and external package behaviors coexist through the `ContributesDefinition` mechanism. External packages can register custom behaviors that execute alongside framework behaviors, with optional positioning control for precise execution order.

For framework developers working on XMLUI core, behaviors represent a critical architectural pattern for implementing features that span multiple components uniformly and maintainably.
