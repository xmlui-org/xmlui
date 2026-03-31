# Set default property values

Declare defaults in the component definition so callers only override what they need.

A `PriorityBadge` component is used in many places across a task tracker: inside `TaskCard`, in a legend panel, and in a filter bar. All call sites need to pass a `level`, but the shape (`variant`) and whether a text label appears alongside the badge (`showLabel`) should have sensible defaults so that most callers can write just `<PriorityBadge level="high" />` without repeating the same options every time.

```xmlui-pg copy display name="PriorityBadge with default property values"
---app display
<App>
  <VStack>
    <H4>Defaults in effect</H4>
    <PriorityBadge level="high" />
    <PriorityBadge level="normal" />
    <PriorityBadge level="low" />

    <H4>Override variant to pill</H4>
    <PriorityBadge level="high" variant="pill" />

    <H4>Suppress the label (showLabel={false})</H4>
    <PriorityBadge level="normal" showLabel="{false}" />

    <H4>No props at all — all defaults apply</H4>
    <PriorityBadge />
  </VStack>
</App>
---comp display /\?\?/ /showLabel/ PriorityBadge
<Component name="PriorityBadge">
  <HStack>
    <Badge
      value="{ $props.level ?? 'normal' }"
      variant="{ $props.variant ?? 'badge' }"
      colorMap="{{
        high: '$color-warn',
        normal: '$color-info',
        low: '$color-success'
      }}"
    />
    <Text when="{ $props.showLabel ?? true }" variant="secondary">
      { $props.level ?? 'normal' } priority
    </Text>
  </HStack>
</Component>
```

## Key points

**`??` (nullish coalescing) is the only mechanism**: XMLUI user-defined components have no `defaultProps` declaration. The only way to provide a default is `$props.x ?? fallbackValue` directly in the template:

```xmlui
{ $props.level   ?? 'normal' }   <!-- string default  -->
{ $props.variant ?? 'badge'  }   <!-- string default  -->
{ $props.showLabel ?? true   }   <!-- boolean default -->
```

**Always use `??`, not `||`**: The `||` operator treats `false` and `0` as falsy and replaces them with the default — breaking callers that legitimately pass those values. `??` only fires for `null` and `undefined`:

```xmlui
<!-- ❌ wrong: showLabel="{false}" would be overridden →  true -->
{ $props.showLabel || true }

<!-- ✅ correct: showLabel="{false}" is respected -->
{ $props.showLabel ?? true }
```

**Repeat the default when the prop is used in multiple places**: Notice the component uses `$props.level ?? 'normal'` twice — once for the `Badge value` and once for the label text. Each use site needs its own `??` guard:

```xmlui
<Badge value="{ $props.level ?? 'normal' }" />
<Text>{ $props.level ?? 'normal' } priority</Text>
```

Alternatively, declare a local variable at the component level to avoid the repetition:

```xmlui
<Component name="PriorityBadge" var.level="{ $props.level ?? 'normal' }">
  <Badge value="{ level }" />
  <Text>{ level } priority</Text>
</Component>
```

**Required props**: If a prop has no sensible default and the component is meaningless without it, omit the `??`. The expression will evaluate to `undefined` and produce a visible blank rather than silently hiding the problem. You can also add an explicit guard with `when`:

```xmlui
<!-- renders nothing at all if taskId was forgotten -->
<Component name="TaskLink">
  <Link when="{ $props.taskId }" to="/tasks/{ $props.taskId }">
    View task
  </Link>
</Component>
```
