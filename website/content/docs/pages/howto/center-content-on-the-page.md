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
        <TextBox label="Password" inputType="password" />
        <Button label="Sign in" variant="solid" themeColor="primary" />
      </VStack>
    </Card>
  </CVStack>
</App>
```

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

**Parent height determines vertical centring**: `verticalAlignment="center"` only takes effect when the parent has a defined height. Use `height="100vh"` to fill the viewport, or `height="100%"` with `scrollWholePage="false"` to fill the remaining content area between header and footer.

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
- [Stack component](/docs/reference/components/Stack) — `horizontalAlignment`, `verticalAlignment`, and dock layout
- [CVStack component](/docs/reference/components/CVStack) — centred vertical stack shorthand
- [CHStack component](/docs/reference/components/CHStack) — centred horizontal stack shorthand
- [Layout Properties](/docs/styles-and-themes/layout-props) — `maxWidth`, `marginHorizontal`, and sizing
