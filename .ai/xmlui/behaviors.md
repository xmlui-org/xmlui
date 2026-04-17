# Behaviors System

Behaviors are decorator-like objects that automatically wrap rendered components with cross-cutting functionality. They activate based on props — components need no knowledge of them.

> **Component patterns** (user-facing): See `.ai/xmlui/components/behaviors.md`.
> **Architecture reference**: See `xmlui/dev-docs/component-behaviors.md`.

## The `Behavior` Interface

```typescript
interface Behavior {
  metadata: BehaviorMetadata;
  canAttach: (context: RendererContext<any>, node: ComponentDef, metadata: ComponentMetadata) => boolean;
  attach:    (context: RendererContext<any>, node: ReactNode,     metadata?: ComponentMetadata) => ReactNode;
}
```

| Member | Purpose |
|--------|---------|
| `metadata.name` | Identifies the behavior (used for positioned registration) |
| `metadata.triggerProps` | Props that trigger consideration for attachment |
| `metadata.props` | Documented props used by the behavior |
| `metadata.condition` | Optional condition tree for eligibility beyond trigger props |
| `canAttach()` | Returns `true` if the behavior should wrap this component instance |
| `attach()` | Returns a new `ReactNode` (typically wraps the input node) |

`attach()` can also use `React.cloneElement()` to inject props/classes without adding a wrapper node.

## Skip Conditions (Apply to All Behaviors)

- **Compound components** — user-defined XMLUI components (`.xmlui` files); behaviors never attach.
- **`nonVisual: true`** — non-visual framework components; behaviors never attach.

## Application Order (Registration = Application)

Behaviors execute in registration order. Each output becomes the next behavior's input. Registration order = innermost → outermost wrapping:

```
label → animation → tooltip → variant → bookmark → formBinding → validation → displayWhen
                                                                               (outermost)
```

External behaviors (from `ContributesDefinition`) are appended after `displayWhen`.

The outer-to-inner nesting in the DOM is the reverse of registration order.

## The 8 Framework Behaviors

| # | Name | Trigger prop(s) | Skips / special logic |
|---|------|----------------|-----------------------|
| 1 | `label` | `label` (on instance) | Skips if metadata defines `label`; skips if formBinding will attach |
| 2 | `animation` | `animation` | ModalDialog: injects `externalAnimation={true}` instead of wrapping |
| 3 | `tooltip` | `tooltip`, `tooltipMarkdown` | — |
| 4 | `variant` | `variant` | Button: skips built-in variants (`solid`, `outlined`, `ghost`); Badge: skips built-in badge variants |
| 5 | `bookmark` | `bookmark` | — |
| 6 | `formBinding` | `bindTo` + value/setValue APIs | Also handles label rendering; skips `FormItem` type |
| 7 | `validation` | `bindTo` + value/setValue APIs, or `FormItem` type | — |
| 8 | `displayWhen` | `displayWhen` | Outermost wrapper; uses CSS `display:none` — never unmounts |

> **`PubSubBehavior.tsx` exists** in `components-core/behaviors/` but is **not registered** in the current framework. It is not active.

## Label Behavior — The Metadata Rule

```typescript
canAttach: (context, node, metadata) => {
  if (metadata?.props?.label) return false;   // Component handles its own label
  if (!node.props?.label) return false;        // No label prop on instance
  const bindTo = extractValue(node.props?.bindTo, true);
  const hasValueApiPair = !!metadata?.apis?.value && !!metadata?.apis?.setValue;
  if (bindTo && hasValueApiPair || node.type === "FormItem") return false; // formBinding will handle
  return true;
}
```

- Components that define `label` in their metadata (Checkbox, Radio) render their own label — behavior skips.
- Components that do NOT define `label` in metadata (TextBox, Select) delegate to this behavior.
- `compactInlineLabel: true` in metadata opts a component into fit-content width for `"before"` / `"after"` label positions.

## FormBinding vs. Label Interaction

When `formBindingBehavior` attaches (component has `bindTo` + value/setValue APIs), it takes over label rendering. `labelBehavior` explicitly checks for this and skips to prevent double-wrapping.

## displayWhen — Mount vs. Visibility

| Prop | React tree | DOM | Form fields |
|------|-----------|-----|-------------|
| `when="{false}"` | Unmounted | Absent | Not registered |
| `displayWhen="{false}"` | **Mounted** | Hidden (`display:none`) | **Still registered** |

`displayWhen` is registered last (outermost) so the entire composed node — label, tooltip, form binding — is hidden or revealed as a unit. Essential for multi-step wizard forms where hidden steps must keep their fields registered.

## Variant Behavior — CSS Variable Fallback Chain

For `variant="premium"` on a Button, generates:
```css
color: var(--xmlui-color-Button-premium, var(--xmlui-color-Button));
background-color: var(--xmlui-backgroundColor-Button-premium, var(--xmlui-backgroundColor-Button));
```
Falls back to the base variable if no variant-specific value is defined in the theme.

## Behavior Registration (ComponentProvider.tsx)

```typescript
this.registerBehavior(labelBehavior);
this.registerBehavior(animationBehavior);
this.registerBehavior(tooltipBehavior);
this.registerBehavior(variantBehavior);
this.registerBehavior(bookmarkBehavior);
this.registerBehavior(formBindingBehavior);
this.registerBehavior(validationBehavior);
// displayWhen last → outermost wrapper
this.registerBehavior(displayWhenBehavior);

// External behaviors appended after all framework behaviors
contributes.behaviors?.forEach((behavior) => {
  this.registerBehavior(behavior);
});
```

### Positioned Registration

```typescript
registerBehavior(behavior, "before" | "after", targetName?: string)
```

External packages can insert behaviors at a specific point relative to a named framework behavior:
```typescript
registerBehavior(myBehavior, "before", "animation");
registerBehavior(myBehavior, "after",  "tooltip");
```

## Implementing a Custom Behavior

```typescript
import type { Behavior } from "xmlui/src/components-core/behaviors/Behavior";

export const myBehavior: Behavior = {
  metadata: {
    name: "myBehavior",
    friendlyName: "My Behavior",
    description: "What it does.",
    triggerProps: ["myProp"],
    props: {
      myProp: { valueType: "string", description: "Activates the behavior." },
    },
  },

  canAttach: (context, node) => {
    const val = context.extractValue(node.props?.myProp, true);
    return !!val;
  },

  attach: (context, node) => {
    const val = context.extractValue(context.node.props?.myProp, true);
    return <MyWrapper config={val}>{node}</MyWrapper>;
  },
};
```

Register via `ContributesDefinition`:
```typescript
export default {
  namespace: "MyPackage",
  behaviors: [myBehavior],
};
```

## Condition Tree Types

`BehaviorMetadata.condition` supports declarative attachment rules:

| Type | Meaning |
|------|--------|
| `hasProp` | Instance declares the named prop |
| `hasApi` | Metadata exposes the named API method |
| `hasEvent` | Metadata exposes the named event |
| `visual` | Component is visual (`nonVisual` is falsy) |
| `and` / `or` / `not` | Boolean combinators over child conditions |

Example — attach when `bindTo` is present AND component exposes `value` + `setValue`:
```typescript
condition: {
  type: "and",
  children: [
    { type: "hasProp", prop: "bindTo" },
    { type: "hasApi", api: "value" },
    { type: "hasApi", api: "setValue" },
  ],
}
```

## PubSub Behavior (Dormant)

File exists (`PubSubBehavior.tsx`) but is **not registered**. Trigger props: `subscribeToTopic`, `onTopicReceived`. Wraps in `PubSubWrapper` subscribing to topics via `PubSubService`. Publishing: `AppContext.publishTopic(topic, data?)`. Topics are app-instance scoped, fire-and-forget, no history.

## Key Files

| File | Role |
|------|------|
| `components-core/behaviors/Behavior.tsx` | `Behavior` interface and `BehaviorMetadata` type |
| `components-core/behaviors/LabelBehavior.tsx` | Label wrapping with `ItemWithLabel` |
| `components-core/behaviors/AnimationBehavior.tsx` | CSS animation wrapping |
| `components-core/behaviors/TooltipBehavior.tsx` | Tooltip overlay wrapping |
| `components-core/behaviors/VariantBehavior.tsx` | Theme variant CSS variable injection |
| `components-core/behaviors/BookmarkBehavior.tsx` | Scroll-to-anchor support |
| `components-core/behaviors/FormBindingBehavior.tsx` | Form field binding and label rendering |
| `components-core/behaviors/ValidationBehavior.tsx` | Validation rules and feedback |
| `components-core/behaviors/DisplayWhenBehavior.tsx` | CSS-based visibility (never unmounts) |
| `components-core/behaviors/PubSubBehavior.tsx` | Pub/sub subscription (file exists, not registered) |
| `components/ComponentProvider.tsx` | `ComponentRegistry.registerBehavior()`, registration site |
| `components-core/ComponentAdapter.tsx` | Application site: calls `canAttach`/`attach` per behavior |
| `components-core/behaviors/collectedBehaviorMetadata.ts` | Exports all behavior metadata for tooling |
