import type { ThemeDefinition } from "xmlui";

export const DefaultDocsTheme: ThemeDefinition = {
  name: "XMLUI Documentation Theme",
  id: "docs-theme",
  extends: ["xmlui"],
  themeVars: {

    // --- Fundamental colors & typography
    backgroundColor: "$color-surface-0",
    "color-primary": "#3367CC",
    "color-surface": "#1e2734",
    "backgroundColor-content-App": "$color-surface-0",

    // --- App layout
    "maxWidth-App": "1280px",
    "maxWidth-docBody-App": "800px",
    "boxShadow-navPanel-App": "none",

    // --- We intentionally use different theming to amplify the "documentation" feel
    // --- We use different navigation panel theming
    "backgroundColor-NavPanel": "$color-surface-50",
    "backgroundColor-navPanel-App": "$color-surface-50",
    "paddingVertical-NavPanel": "$space-5",
    "borderRightWidth-NavPanel": "1px",
    "maxWidth-Drawer": "100%",
    "textColor-NavLink": "$color-secondary-600",
    "color-indicator-NavLink--active": "transparent",
    "color-indicator-NavLink--hover": "transparent",
    "color-indicator-NavLink--pressed": "transparent",
    "backgroundColor-NavLink--hover": "$color-surface-100",
    "backgroundColor-NavLink--pressed": "$color-surface-100",
    "fontWeight-NavLink--active": "bold",
    "textColor-NavLink--hover": "$color-surface-900",
    "textColor-NavLink--active": "$color-primary-500",
    "textColor-NavLink--hover--active": "$color-primary-500",

    // --- Adjust a little bit of Markdown
    "fontSize-H1": "1.65rem",
    "fontWeight-H1": "700",
    "borderRadius-HtmlTable": "30px",

    light: {
      // --- Use these colors for light-tone document links
      "textColor-DocumentLinks": "#5B6475",
      "textColor-DocumentLinks--hover": "#1B232A",
      "backgroundColor-separator-DocumentLinks": "#e2e5ea",
    },
    dark: {
      // --- These colors match better with the dark tone 
      "backgroundColor-content-App": "$color-surface-100",
      backgroundColor: "$color-surface-100",
      "backgroundColor-NavPanel": "$color-surface-50",
      "backgroundColor-navPanel-App": "$color-surface-50",

      "border-NestedApp": "1px solid $color-surface-200",
      "backgroundColor-HtmlThead": "$color-surface-50",

      // --- Use these colors for dark-tone document links
      "textColor-DocumentLinks": "#8E97A8",
      "textColor-DocumentLinks--hover": "#F9FAFB",
      "backgroundColor-separator-DocumentLinks": "#38475E",
    },
  },
  resources: {},
};

export default DefaultDocsTheme;
