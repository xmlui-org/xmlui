# Prop forwarding

`wrapCompound` and `wrapComponent` forward props by default. That sounds small, but it changes the maintenance profile of a wrapper completely: new native props can start working immediately, before you have written bespoke wrapper code for them.

This page uses `Slider` to show the pattern in isolation. The point is not that sliders are special; it is that a wrapper should pass through native component capabilities unless it has a reason to intercept or transform them.

## `inverted`

Radix Slider supports an `inverted` prop that reverses the direction of the track. `Slider` does not need custom wrapper code for this; the prop is simply forwarded to the render component.

```xmlui-pg id="inverted-b6c8"
---app display
<App>
  <Card var.sw6Val="">
    <VStack>
      <Text fontWeight="bold">
        Slider -- inverted direction
      </Text>
      <Slider
        inverted="{true}"
        minValue="0"
        maxValue="100"
        step="10"
        initialValue="70"
        onDidChange="{(v) => sw6Val = v}" />
      <Text>
        Value: {sw6Val}
      </Text>
    </VStack>
  </Card>
</App>
```

## `title`

The render component spreads native props onto its outer element, so standard HTML attributes like `title` pass through as well. Hover the slider to see the browser tooltip.

```xmlui-pg id="title-b784"
---app display
<App>
  <Card var.sw7Val="">
    <VStack>
      <Text fontWeight="bold">
        Slider -- hover me
      </Text>
      <Slider
        title="Pick a temperature"
        minValue="0"
        maxValue="100"
        initialValue="50"
        onDidChange="{(v) => sw7Val = v}" />
      <Text>
        Value: {sw7Val}
      </Text>
    </VStack>
  </Card>
</App>
```

## `aria-label`

Accessible props are part of prop forwarding too. Here the wrapper passes `aria-label` through to the rendered slider, which makes the control discoverable to assistive technology and gives testing tools a stable semantic selector such as `getByRole('slider', { name: 'Volume' })`.

```xmlui-pg id="aria-label-b7f2"
---app display
<App>
  <Card>
    <VStack>
      <Text fontWeight="bold">
        Slider -- labeled for assistive tech and tests
      </Text>
      <Slider
        aria-label="Volume"
        minValue="0"
        maxValue="100"
        initialValue="50" />
    </VStack>
  </Card>
</App>
```

## Why this matters

Prop forwarding keeps wrappers from becoming bottlenecks. A library can add new props, accessibility attributes, or native HTML affordances without forcing you to immediately revise the wrapper API. The wrapper only needs custom code when:

- a prop name must be renamed
- a value needs parsing or normalization
- a callback needs special treatment
- a resource URL needs resolution

Everything else should flow through untouched. That keeps wrappers small and lets the metadata evolve independently from the render component.
