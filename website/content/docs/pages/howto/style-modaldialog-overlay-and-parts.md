# Style ModalDialog overlay and parts

Control content, title bar, close button, and backdrop overlay styles via theme vars.

ModalDialog exposes two background vars: `backgroundColor-ModalDialog` for the dialog panel and `backgroundColor-overlay-ModalDialog` for the backdrop dimmer behind it. Internal parts — title text, body padding, and border-radius — each have dedicated vars. The close button is a standard `Button` and can be styled via Button theme vars.

```xmlui-pg copy display name="ModalDialog overlay and parts theming" height="340px"
---app display
<App>
  <Theme
    backgroundColor-ModalDialog="white"
    borderRadius-ModalDialog="12px"
    backgroundColor-overlay-ModalDialog="rgba(15,23,42,0.6)"
    paddingHorizontal-ModalDialog="$space-6"
    paddingVertical-ModalDialog="$space-5"
    paddingHorizontal-overlay-ModalDialog="$space-4"
    fontSize-title-ModalDialog="1.125rem"
    fontWeight-title-ModalDialog="700"
    textColor-title-ModalDialog="$color-surface-900"
    marginBottom-title-ModalDialog="$space-3"
  >
    <VStack>
      <ModalDialog id="demo" title="Confirm deletion">
        <Text>
          This action cannot be undone. 
          Are you sure you want to delete this item?
        </Text>
        <HStack>
          <Button label="Cancel" variant="outlined" onClick="demo.close()" />
          <Button label="Delete" themeColor="attention" onClick="demo.close()" />
        </HStack>
      </ModalDialog>
      <Button label="Open dialog" onClick="demo.open()" />
    </VStack>
  </Theme>
</App>
```

## Key points

**`backgroundColor-overlay-ModalDialog` dims the backdrop**: Use an `rgba()` value to control both the overlay color and its opacity. A fully opaque solid color blocks all background content; `rgba(0,0,0,0.5)` is a common semi-transparent dimmer.

**Dialog and overlay padding are separate**: `paddingHorizontal-ModalDialog` and `paddingVertical-ModalDialog` control the internal whitespace of the dialog panel. `paddingHorizontal-overlay-ModalDialog` and `paddingVertical-overlay-ModalDialog` control the margin between the dialog and the viewport edge.

**Title text vars use the `-title-ModalDialog` infix**: `fontSize-title-ModalDialog`, `fontWeight-title-ModalDialog`, `textColor-title-ModalDialog`, and `fontFamily-title-ModalDialog` style the title bar text. `marginBottom-title-ModalDialog` sets the gap between the title and the dialog body.

**`borderRadius-ModalDialog` rounds the dialog panel corners**: Combined with a contrasting `backgroundColor-overlay-ModalDialog`, a generous value like `"12px"` gives the dialog a modern card-like appearance.

**`minWidth-ModalDialog`, `maxWidth-ModalDialog`, and `maxHeight-ModalDialog` control dialog dimensions**: Prevent the dialog from being too narrow on small screens or growing too wide. Use viewport-relative values like `"90vw"` for responsive designs.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Open a confirmation before delete](/docs/howto/open-a-confirmation-before-delete) — ModalDialog in a typical delete workflow
- [Theme Button variant×color combos](/docs/howto/theme-button-variant-color-combos) — style the dialog's action buttons
