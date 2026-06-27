# Theme ExpandableItem transitions

Control content and summary styles and expand/collapse animation with ExpandableItem theme vars.

ExpandableItem has two styleable regions: the `summary` (the always-visible clickable header) and the `content` (the collapsible body). The animation that slides the content open is driven by `animationDuration-content-ExpandableItem` and `animation-content-ExpandableItem` (the CSS timing function). Summary hover and active backgrounds are independently controllable.

The three examples below show the same summary styling with three different animation speeds — click any header to see the difference.

**Fast / snappy** (`0.25s` with an overshoot easing):

```xmlui-pg copy display name="ExpandableItem snappy animation"
---app display
<App>
  <Theme
    borderRadius-ExpandableItem="8px"
    backgroundColor-summary-ExpandableItem="$color-surface-50"
    backgroundColor-summary-ExpandableItem--hover="$color-primary-50"
    backgroundColor-summary-ExpandableItem--active="$color-primary-100"
    textColor-summary-ExpandableItem="$color-surface-700"
    fontWeight-summary-ExpandableItem="600"
    paddingVertical-summary-ExpandableItem="12px"
    paddingHorizontal-summary-ExpandableItem="16px"
    border-summary-ExpandableItem="1px solid $color-surface-200"
    animationDuration-content-ExpandableItem="0.25s"
    animation-content-ExpandableItem="cubic-bezier(0.16, 1, 0.3, 1)"
    paddingVertical-content-ExpandableItem="12px"
    paddingHorizontal-content-ExpandableItem="16px"
  >
    <VStack>
      <ExpandableItem summary="What is XMLUI?">
        <Text>
          XMLUI is a declarative, reactive frontend framework for building web 
          apps with XML markup.
        </Text>
      </ExpandableItem>
      <ExpandableItem summary="How does theming work?">
        <Text>
          Theming uses CSS custom properties scoped with a Theme wrapper component.
        </Text>
      </ExpandableItem>
    </VStack>
  </Theme>
</App>
```

**Relaxed / slow** (`0.5s` with a smooth ease-out):

```xmlui-pg copy display name="ExpandableItem relaxed animation"
---app display
<App>
  <Theme
    borderRadius-ExpandableItem="8px"
    backgroundColor-summary-ExpandableItem="$color-surface-50"
    backgroundColor-summary-ExpandableItem--hover="$color-primary-50"
    backgroundColor-summary-ExpandableItem--active="$color-primary-100"
    textColor-summary-ExpandableItem="$color-surface-700"
    fontWeight-summary-ExpandableItem="600"
    paddingVertical-summary-ExpandableItem="12px"
    paddingHorizontal-summary-ExpandableItem="16px"
    border-summary-ExpandableItem="1px solid $color-surface-200"
    animationDuration-content-ExpandableItem="0.5s"
    animation-content-ExpandableItem="cubic-bezier(0, 0, 0.2, 1)"
    paddingVertical-content-ExpandableItem="12px"
    paddingHorizontal-content-ExpandableItem="16px"
  >
    <VStack>
      <ExpandableItem summary="What is XMLUI?">
        <Text>
          XMLUI is a declarative, reactive frontend framework for building web 
          apps with XML markup.
        </Text>
      </ExpandableItem>
      <ExpandableItem summary="How does theming work?">
        <Text>
          Theming uses CSS custom properties scoped with a Theme wrapper component.
        </Text>
      </ExpandableItem>
    </VStack>
  </Theme>
</App>
```

**No animation** (`0s` — instant open/close):

```xmlui-pg copy display name="ExpandableItem no animation"
---app display
<App>
  <Theme
    borderRadius-ExpandableItem="8px"
    backgroundColor-summary-ExpandableItem="$color-surface-50"
    backgroundColor-summary-ExpandableItem--hover="$color-primary-50"
    backgroundColor-summary-ExpandableItem--active="$color-primary-100"
    textColor-summary-ExpandableItem="$color-surface-700"
    fontWeight-summary-ExpandableItem="600"
    paddingVertical-summary-ExpandableItem="12px"
    paddingHorizontal-summary-ExpandableItem="16px"
    border-summary-ExpandableItem="1px solid $color-surface-200"
    animationDuration-content-ExpandableItem="0s"
    paddingVertical-content-ExpandableItem="12px"
    paddingHorizontal-content-ExpandableItem="16px"
  >
    <VStack>
      <ExpandableItem summary="What is XMLUI?">
        <Text>
          XMLUI is a declarative, reactive frontend framework for building web 
          apps with XML markup.
        </Text>
      </ExpandableItem>
      <ExpandableItem summary="How does theming work?">
        <Text>
          Theming uses CSS custom properties scoped with a Theme wrapper component.
        </Text>
      </ExpandableItem>
    </VStack>
  </Theme>
</App>
```

## Key points

**`animationDuration-content-ExpandableItem` drives the open/close speed**: The content panel slides in when the item expands. Set this to `"0.2s"` for a snappy feel or `"0.4s"` for a relaxed ease. Pair with `animation-content-ExpandableItem` to set the cubic-bezier easing function.

**Summary and content use their own `-summary-` and `-content-` infixes**: Use `backgroundColor-summary-ExpandableItem` for the header row background, and `paddingVertical-content-ExpandableItem` for the inner padding of the expanded area. These two regions are styled independently.

**`--hover` and `--active` target interaction states on the summary**: `backgroundColor-summary-ExpandableItem--hover` and `backgroundColor-summary-ExpandableItem--active` apply when the cursor hovers and when the summary is being clicked. Use these to provide clear visual affordance for the clickable header.

**Container-level vars style the outer wrapper**: `borderRadius-ExpandableItem` and `backgroundColor-ExpandableItem` apply to the outermost wrapper that contains both summary and content. `border-summary-ExpandableItem` draws a border only around the header row.

**`gap-ExpandableItem` controls the chevron-to-label spacing**: The expand/collapse icon and label inside the summary are separated by `gap-ExpandableItem`. Increase it to give the icon more breathing room.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Customize Tooltip appearance](/docs/howto/customize-tooltip-appearance) — another animation-duration theming example
- [Style ModalDialog overlay and parts](/docs/howto/style-modaldialog-overlay-and-parts) — modal parts theming
