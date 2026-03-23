# Component Behaviors

Behaviors are decorators that automatically wrap rendered components with cross-cutting functionality based on their props. They activate transparently — components need no knowledge of them.

## Key Rules

- **Compound (user-defined) components** — behaviors never attach.
- **`nonVisual: true` components** — behaviors never attach.
- Behaviors attach in a fixed order; the wrapped node from one becomes the input to the next.

## The 8 Framework Behaviors

| Behavior | Trigger prop(s) | What it does |
|---|---|---|
| label | `label` (see rules below) | Wraps component in `<ItemWithLabel>` with positioning and required indicator |
| animation | `animation` | Wraps in `<Animation>` for entry/exit CSS animations |
| tooltip | `tooltip`, `tooltipMarkdown` | Wraps in tooltip overlay shown on hover |
| variant | `variant` | Applies custom theme variant styling |
| bookmark | `bookmark` | Adds scroll-to-anchor navigation support |
| pubsub | (pubsub props) | Enables publisher-subscriber messaging between components |
| formBinding | (form props) | Binds input to the enclosing `<Form>` |
| validation | (validation props) | Adds validation logic to form-bound inputs |

## Label Behavior — Critical Rule

The label behavior attaches only when **both** conditions hold:
1. The component instance has a `label` prop in the markup.
2. The component's metadata does **not** declare `label` in its `props`.

**Implication for component authors:** If your component renders its own label (e.g. Checkbox, Radio), declare `label` in your metadata to prevent double-labeling:

```typescript
// In metadata — signals "I handle my own label"
props: {
  label: {
    description: "The label shown next to the checkbox.",
    valueType: "string",
  },
  // ...
}
```

If `label` is absent from metadata, the label behavior wraps the component automatically — useful for TextBox, Select, etc. that delegate labeling to the behavior.

**Extra label-related props** the behavior reads:
- `labelPosition` — `"start"` | `"end"` | `"top"` | `"bottom"`
- `labelWidth` — pixel/percent width of the label column
- `labelBreak` — threshold at which label wraps to top
- `required` — shows asterisk indicator
- `shrinkToLabel` — makes container only as wide as the label

## Animation Behavior

Reads `animation` and `animationOptions` from the component instance. `animationOptions` is a semicolon-separated string:

```xml
<Card animation="fade-in" animationOptions="duration: 500; delay: 200" />
```

ModalDialog components receive `externalAnimation={true}` to hand off animation control.

## Tooltip Behavior

```xml
<Button tooltip="Saves all changes" tooltipOptions="right; delayDuration: 800" />
<Button tooltipMarkdown="**Bold** description with [link](https://example.com)" />
```

## Registering Custom Behaviors (Framework Dev)

External packages can contribute behaviors via the `ContributesDefinition`:

```typescript
export default {
  namespace: "MyPackage",
  behaviors: [myCustomBehavior],
};
```

Use `registerBehavior(behavior, "before" | "after", targetName)` to control insertion order relative to framework behaviors.
