# Free tracing

When you wrap a component with `wrapComponent` or `wrapCompound`, tracing comes for free. Every `didChange`, `gotFocus`, and `lostFocus` event can emit a semantic trace with component identity, accessible naming, and value information. No per-component tracing code is required for those common cases.

## What the wrapper adds

The semantic layer gives you a few things at once:

- A readable event kind such as `value:change` or `focus:change`
- The component type and label
- The accessible name when one exists
- A display value that humans and tools can both understand
- Enough structure for downstream tools like `trace-tools`

That means a single interaction can serve several audiences at once: a developer debugging behavior, a test generator looking for selectors, or an AI reasoning about what the app just did.

## Slider -- interact, then inspect

Drag the thumb, tab into the slider, and shift focus away. Then open the Inspector to see the semantic trace entries.

```xmlui-pg id="slider-interact-then-inspect-b6d7"
---app display
<App>
  <Card var.swVal="">
    <VStack>
      <Slider
        aria-label="Volume"
        minValue="0"
        maxValue="100"
        initialValue="50"
        onDidChange="{(v) => swVal = v}" />
      <Text>
        Value: {swVal}
      </Text>
    </VStack>
  </Card>
</App>
```

## What to look for in the Inspector

After interacting with the slider, the Inspector should show entries such as:

```text
value:change didChange Slider [Volume] "53"
focus:change gotFocus Slider [Volume]
focus:change lostFocus Slider [Volume]
```

Those entries are useful because they describe the interaction at the same semantic level a person would use: "the Volume slider changed to 53." You do not need to reconstruct that meaning from low-level DOM events or generic state updates.

## Traces are catnip for AIs

Semantic traces are legible enough to serve as a machine-readable activity log. An AI or test tool does not need to parse the component tree to understand that the user changed the Volume slider or moved focus into it. The wrapper already emitted that meaning.

This matters for debugging too. A trace can become a shared artifact in a conversation: "the Volume slider jumped from 30 to 100" is visible directly in the exported log.

## Semantic regression testing

[trace-tools](https://github.com/xmlui-org/trace-tools) reads these traces and generates Playwright test scripts. The workflow:

1. A person who doesn't know Playwright performs a user journey in the app
2. The trace system captures every interaction semantically
3. `trace-tools` converts the trace into a Playwright script that replays the journey
4. That script becomes a regression test

The person performing the journey does not need to know anything about Playwright. They just use the app. The traces do the rest -- because wrapped components emit enough semantic detail for tools to generate selectors like `getByRole('slider', { name: 'Volume' })` instead of brittle CSS selectors.
