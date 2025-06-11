import type { ThemeDefinition } from "xmlui";

export const DefaultDocsTheme: ThemeDefinition = {
  name: "XMLUI Documentation Theme",
  id: "default",
  extends: ["xmlui"],
  themeVars: {
    // NOTE: All of these theme vars should be assessed whether to have them in the default theme

    "color-primary": "#3367CC",
    "color-surface": "#1e2734",
    "borderColor": "$color-surface-100",

    fontFamily: "Inter, -apple-system, 'system-ui', 'San Francisco', 'Segoe UI', sans-serif",
    "font-feature-settings": "'cv03', 'cv04', 'cv11'",
    "maxWidth-App": "1320px",

    "maxWidth-content": "1200px",
    "boxShadow-navPanel-App": "none",
    "boxShadow-header-App": "none",
    "backgroundColor-content-App": "$color-surface-0",
    "backgroundColor": "$color-surface-0",

    "fontSize-Text-codefence": "9pt",
    "lineHeight-Text": "1.5",
    "marginBottom-Text-markdown": "0",

    "textColor-Text-marked": "$color-primary-500",

    // --- AppHeader
    "borderBottom-AppHeader": "1px solid $color-surface-200",
    "paddingInline-AppHeader": "$space-4",
    "paddingTop-logo-AppHeader": "$space-3",
    "paddingBottom-logo-AppHeader": "$space-3",

    // --- NavPanel
    "backgroundColor-NavPanel": "$color-surface-50",
    "backgroundColor-navPanel-App": "$color-surface-50",
    "paddingVertical-NavPanel": "$space-5",
    "borderRightWidth-NavPanel": "1px",

    // --- NavLink
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

    // --- TOC
    "fontWeight-TableOfContentsItem-level-3": "normal",
    "fontWeight-TableOfContentsItem-level-4": "normal",
    "fontWeight-TableOfContentsItem-level-5": "normal",
    "fontWeight-TableOfContentsItem-level-6": "normal",

    "paddingLeft-TableOfContentsItem-level-2": "$space-3",
    "paddingLeft-TableOfContentsItem-level-3": "$space-5",
    "paddingLeft-TableOfContentsItem-level-4": "$space-6",
    "paddingLeft-TableOfContentsItem-level-5": "$space-6",
    "paddingLeft-TableOfContentsItem-level-6": "$space-6",

    // --- Search
    "fontSize-placeholder-TextBox": "$fontSize-small",
    "borderColor-SearchPanel": "$color-surface-100",

    // --- Markdown
    "fontSize-H1": "1.65rem",
    "fontWeight-H1": "700",
    "lineHeight-Text-codefence": "$fontHeight-normal",
    "borderRadius-HtmlTable": "30px",

    // --- NestedApp
    "border-NestedApp": "1px solid $color-surface-100",

    // --- Footer
    "fontSize-Footer": "16px",

    light: {
      "textColor-DocumentLinks": "#5B6475",
      "textColor-DocumentLinks--hover": "#1B232A",
      "backgroundColor-separator-DocumentLinks": "#e2e5ea",
    },
    dark: {
      "color-primary": "#3367cc",

      "backgroundColor-content-App": "$color-surface-100",
      backgroundColor: "$color-surface-100",
      "backgroundColor-NavPanel": "$color-surface-50",
      "backgroundColor-navPanel-App": "$color-surface-50",

      "backgroundColor-frame-NestedApp": "$color-primary-50",
      "border-NestedApp": "1px solid $color-surface-200",

      "backgroundColor-HtmlThead": "$color-surface-50",

      "textColor-DocumentLinks": "#8E97A8",
      "textColor-DocumentLinks--hover": "#F9FAFB",
      "backgroundColor-separator-DocumentLinks": "#38475E",

      "borderColor-SearchPanel": "$color-surface-200",

      "textColor-Link--hover": "$color-primary-600",
      "textDecorationColor-Link--hover": "$color-primary-600",
      "textDecorationColor-Link--active": "$color-primary-600",
    },
  },
  resources: {},
};

export default DefaultDocsTheme;
