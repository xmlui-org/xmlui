# Center content vertically in a filled container

Set `verticalAlignment="center"` on the container that owns the vertical space.
The important part is not the alignment property; it is giving that container a
real height. If the container only hugs its content, there is no empty vertical
space to center within, so the content stays at the top.

```xmlui-pg copy display name="Vertical centering needs a filled region" height="440px"
---app display
<App scrollWholePage="false" var.filled="{true}">
  <VStack padding="$space-3" gap="$space-3">
    <HStack verticalAlignment="center" gap="$space-2">
      <Text variant="strong">Content region:</Text>
      <Button
        label="Filled"
        variant="{filled ? 'solid' : 'outlined'}"
        onClick="filled = true" />
      <Button
        label="Auto"
        variant="{!filled ? 'solid' : 'outlined'}"
        onClick="filled = false" />
    </HStack>

    <VStack 
      height="320px" 
      gap="0" 
      borderWidth="1px" 
      borderColor="$color-surface-300"
    >
      <HStack padding="$space-3" backgroundColor="$color-primary-100">
        <Text variant="strong">Header</Text>
      </HStack>

      <VStack
        height="{filled ? '*' : 'auto'}"
        verticalAlignment="center"
        horizontalAlignment="center"
        padding="$space-4"
        backgroundColor="$color-surface-100"
        borderVertical="2px dashed $color-primary-300">
        <Text variant="strong">Region height: {filled ? '*' : 'auto'}</Text>
        <Text>
          verticalAlignment="center" works when this region 
          fills the remaining height.
        </Text>
      </VStack>

      <HStack padding="$space-3" backgroundColor="$color-primary-100">
        <Text variant="strong">Footer</Text>
      </HStack>
    </VStack>
  </VStack>
</App>
```

With `Filled` selected, the middle `VStack` uses `height="*"` inside a bounded
parent and receives the height left over after the header and footer. Its
`verticalAlignment="center"` can then place the text in the middle of that
region.

Switch to `Auto` and the middle `VStack` shrinks to its content. The alignment
property is still present, but the container has no extra height to distribute,
so the text sits at the top of the remaining page area.

## Key points

**Center the child inside the container that has height.** Put
`verticalAlignment="center"` on the `VStack`, `CVStack`, or other stack that owns
the filled region.

**Fill the container first.** Use `height="100vh"`, `height="100%"` with
`App scrollWholePage="false"`, or `height="*"` inside a bounded parent.

**Use `CVStack` when both axes should be centered.** `CVStack` is a shortcut for
a vertical stack that centers horizontally and vertically. It still needs a
height, just like an explicit `verticalAlignment="center"`.

---

## See also

- [Make a child fill the remaining vertical space](/docs/howto/fill-remaining-vertical-space) - the `height="*"` pattern used by the filled region above
- [Center content on the page](/docs/howto/center-content-on-the-page) - centering both axes for a full-page panel or login card
- [Fill the viewport with one internal scroll region](/docs/howto/build-a-full-height-scroll-layout) - full-height app shells with an internal scroll area
- [Stack component](/docs/reference/components/Stack) - alignment and layout properties
