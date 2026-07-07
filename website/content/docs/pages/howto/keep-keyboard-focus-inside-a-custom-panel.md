# Keep keyboard focus inside a custom panel

Wrap custom temporary surfaces in `FocusScope` when keyboard focus should stay inside them until they close.

Built-in overlays such as `ModalDialog` and `Drawer` already manage focus. `FocusScope` is for custom panels, inline editors, popovers, and other surfaces that you assemble yourself from lower-level components.

To try this example, open it in the playground, switch the preview to full screen, focus the page, and click **Edit profile**. The embedded documentation preview is too constrained for this keyboard-focus example.

```xmlui-pg copy display height="360px" name="Restore focus after editing" id="restore-focus-after-editing"
---app display
<App>
  <Fragment var.editorOpen="{false}">
    <VStack gap="$space-4">
      <HStack>
        <Button label="Edit profile" onClick="editorOpen = true" />
        <Button label="Archive" />
      </HStack>

      <FocusScope when="{editorOpen}" autoFocus="true" restore="true">
        <VStack padding="$space-4" gap="$space-3" border="1px solid $borderColor">
          <H3>Edit profile</H3>
          <TextBox label="Name" initialValue="Ada Lovelace" />
          <HStack>
            <Button label="Cancel" onClick="editorOpen = false" />
            <Button label="Save" onClick="editorOpen = false" />
          </HStack>
        </VStack>
      </FocusScope>
    </VStack>
  </Fragment>
</App>
```

Then press `Tab` and `Shift+Tab`. Focus cycles inside the editor while it is open. Click **Cancel** or **Save** and focus returns to **Edit profile**.

## Key points

**Use `FocusScope` for custom temporary UI**: It prevents keyboard focus from drifting into the page behind the active panel.

**Use `autoFocus="true"` when the panel should receive focus on open**: XMLUI moves focus to the first focusable child inside the scope.

**Keep `restore="true"` for close flows**: Restoring focus to the opener helps keyboard users continue exactly where they started.

**Prefer built-in overlays when possible**: `ModalDialog` and `Drawer` include focus handling already, so only add `FocusScope` when you are building a custom surface.

---

## See also

- [FocusScope component](/docs/reference/components/FocusScope) — focus trapping, auto focus, and focus restoration
- [Build a fullscreen modal dialog](/docs/howto/build-a-fullscreen-modal-dialog) — use the built-in dialog when you need a modal surface
- [Show a slide-in settings drawer](/docs/howto/show-a-slide-in-settings-drawer) — use the built-in drawer when the pattern fits
