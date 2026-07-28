# Center content on the page

Use CVStack or CHStack, or horizontalAlignment and verticalAlignment on Stack.

A login page should display a single card perfectly centred horizontally and vertically in the viewport regardless of screen size. `CVStack` centres its children in both axes and is the shortest path to this pattern.

```xmlui-pg copy display name="Centred login card" height="350px"
---app display
<App scrollWholePage="false">
  <CVStack height="100%">
    <Card width="320px">
      <VStack>
        <H4>Sign in</H4>
        <TextBox label="Email" placeholder="you@example.com" />
        <TextBox label="Password" type="password" />
        <Button label="Sign in" variant="solid" themeColor="primary" />
      </VStack>
    </Card>
  </CVStack>
</App>
```

## Center only vertically

Vertical centering has one precondition that trips people up: it does nothing
until the container **has a height to center within**. The block below is
centered vertically only (left-aligned) inside a region that fills the height:

```xmlui-pg copy display name="Centered vertically in a filled region" height="340px"
---app display
<App scrollWholePage="false">
  <VStack height="100%" verticalAlignment="center" padding="$space-4" backgroundColor="$color-surface-100">
    <H4>Vertically centered</H4>
    <Text>This sits in the vertical middle because the VStack fills the height (height="100%" with scrollWholePage="false") and sets verticalAlignment="center".</Text>
    <Text variant="secondary">Drop the height and it snaps to the top — vertical centering has nothing to center within.</Text>
  </VStack>
</App>
```

If content you expected to be vertically centered is stuck at the top, the
container collapsed to content height. Give it `height="100vh"`, `height="100%"`
with `scrollWholePage="false"`, or make it a `height="*"` child of a bounded
parent — see [Make a child fill the remaining vertical space](/docs/howto/fill-remaining-vertical-space).

## Key points

**`CVStack`**: Shorthand for a vertical `Stack` with `horizontalAlignment="center"` and `verticalAlignment="center"`. The most concise way to centre children in both axes:

```xmlui
<CVStack height="100vh">
  <Card width="360px">…</Card>
</CVStack>
```

**`CHStack`**: Centres children horizontally only — use it for a centred button row or form footer where collapsing height is acceptable:

```xmlui
<CHStack>
  <Button label="Cancel" />
  <Button label="Save" variant="solid" />
</CHStack>
```

**Vertical centering needs a filled container — this is the usual bug**: `verticalAlignment="center"` (and `CVStack`) do nothing until the parent has a real height to center within. If content sticks to the top, the container collapsed to content height. Give it `height="100vh"`, `height="100%"` with `scrollWholePage="false"`, or make it a `height="*"` child of a bounded parent — see [Make a child fill the remaining vertical space](/docs/howto/fill-remaining-vertical-space).

**Fixed width on the card**: A fixed width works well for login forms and other centred dialogs:

```xmlui
<Card width="360px">
  <!-- fixed width looks good when centred -->
</Card>
```

**`marginHorizontal="auto"` as an alternative**: On a block with an explicit `width`, `marginHorizontal="auto"` centres it horizontally without needing a flex parent — useful when horizontal centring only is needed inside a normal document flow:

```xmlui-pg copy display name="Centred with marginHorizontal" height="200px"
---app display
<App>
  <VStack width="420px" marginHorizontal="auto" paddingVertical="$space-4">
    <H3>Centered Column</H3>
    <Text>This article column is centred using marginHorizontal="auto".</Text>
  </VStack>
</App>
```

---

**See also**
- [Make a child fill the remaining vertical space](/docs/howto/fill-remaining-vertical-space) — the `height="*"` precondition that vertical centering depends on
- [Stack component](/docs/reference/components/Stack) — `horizontalAlignment`, `verticalAlignment`, and dock layout
- [CVStack component](/docs/reference/components/CVStack) — centred vertical stack shorthand
- [CHStack component](/docs/reference/components/CHStack) — centred horizontal stack shorthand
- [Layout Properties](/docs/styles-and-themes/layout-props) — `maxWidth`, `marginHorizontal`, and sizing
