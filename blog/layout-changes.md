# Layout changes in the Blog site

Layout structure adjustments:
- Changed the `App` layout from "vertical" to "vertical-full-header". In this mode the logo is displayed.
- Added `noScrollbarGutters` to `App` to allow removing the gutters from around the page. With this property, the left and right edges of the header and the content are aligned.
- Added an `showNavPanelIf` property to `AppHeader` to allow disabling the navigation panel according to a particular condition.
- Removed the `showNavPanelThreshold` toggle mechanism, no it's a simple variable in `App`. Also removed the `Main.xmlui.xs` file.

Theme adjustments:
- Renamed "docs-theme" to "blog-theme"
- "maxWidth-App": "820px" (This single theme variable solves all the issues of margins and alignments)
- "maxWidth-Drawer": "300px" (Whenever the `NavPanel` would be displayed in mobile view, this would be the maximum width)

Other adjustments:
- Added theme variables for Pages to allow setting paddings and gaps (it was a technical debt, no direct relation with the blog layout)
