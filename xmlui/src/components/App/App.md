%-DESC-START

The `App` component is the root container that defines the application's
overall structure and layout.

%-DESC-END

## Styling

When an `App` renders direct content without a `Pages` component, XMLUI applies
default spacing to the content area. Use `paddingHorizontal-content-App`,
`paddingVertical-content-App`, and `gap-content-App` to customize that spacing
from the theme while preserving per-component layout props for local overrides.

%-STYLE-START

The initial migration preserves the direct-content layout slice only. App shell
features such as headers, navigation panels, page routing, drawers, and search
remain scheduled for the later App shell migration wave.

%-STYLE-END

