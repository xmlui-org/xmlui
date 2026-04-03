# Set a Right-to-Left Layout Direction

Use the `direction` property on `App` or any layout container to render content from right to left for languages such as Arabic and Hebrew.

An application must support both English and Arabic. In English the nav panel, labels, and text flow left-to-right; in Arabic everything should mirror — the nav panel appears on the right, icons and text read from right to left. Setting `direction="rtl"` on the root `App` reverses the layout for the entire page without manually mirroring each component.

```xmlui-pg copy display name="RTL layout direction" /direction="rtl"/
---app display
<App direction="rtl">
  <Text>First item</Text>
  <HStack>
    <Text>Second item</Text>
    <Text>Third item</Text>
    <Text>Fourth item</Text>
  </HStack>
  <Text>Fifth item</Text>
</App>
```

Compare with the same markup using the default left-to-right direction:

```xmlui-pg copy display name="Default LTR layout direction"
---app display
<App>
  <Text>First item</Text>
  <HStack>
    <Text>Second item</Text>
    <Text>Third item</Text>
    <Text>Fourth item</Text>
  </HStack>
  <Text>Fifth item</Text>
</App>
```

## Key points

**`direction="rtl"` on `App` mirrors the whole page**: Every child — stacks, text, icons, navigation — reverses its horizontal ordering when `direction="rtl"` is set on `App`. This is the correct approach when localising to a right-to-left language:

```xmlui
<App direction="rtl">
  …
</App>
```

**`direction` can be set on any container**: You can scope the RTL direction to a subtree by placing `direction="rtl"` on any `Stack`, `HStack`, or `VStack` instead of the root `App`. Content inside the container is reversed; sibling content outside it is unaffected:

```xmlui-pg copy display name="RTL scoped to a single section"
---app display
<App>
  <Text>English — left to right</Text>
  <VStack>
    <HStack>
      <Badge value="First" />
      <Badge value="Second" />
      <Badge value="Third" />
    </HStack>
  </VStack>
  <VStack direction="rtl">
    <Text>Arabic section — right to left</Text>
    <HStack>
      <Badge value="أول" />
      <Badge value="ثاني" />
      <Badge value="ثالث" />
    </HStack>
  </VStack>
  <Text>Back to English</Text>
</App>
```

**Bind `direction` to a locale variable**: In a real multilingual app, drive `direction` from a reactive expression rather than a static string so the layout re-renders automatically when the user switches languages:

```xmlui
<App direction="{locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr'}">
  …
</App>
```

**Logical CSS properties update automatically**: XMLUI uses logical CSS properties internally (e.g. `padding-inline-start` instead of `padding-left`), so paddings, borders, and alignment resolve correctly in both directions without additional overrides.

---

**See also**
- [App component](/docs/reference/components/App) — `direction`, `layout`, and root-level properties
- [Stack component](/docs/reference/components/Stack) — `direction` on layout containers
- [Show different content per breakpoint](/docs/howto/show-different-content-per-breakpoint) — another technique for adapting UI to context
