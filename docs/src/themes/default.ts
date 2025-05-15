import type { ThemeDefinition } from "xmlui";

export const DefaultDocsTheme: ThemeDefinition = {
  name: "XMLUI Documentation Theme",
  id: "default",
  extends: "xmlui",
  themeVars: {
    // NOTE: All of these theme vars should be assessed whether to have them in the default theme
    
    "fontFamily": "Inter, -apple-system, 'system-ui', 'San Francisco', 'Segoe UI', sans-serif",
    "font-feature-settings": "'cv03', 'cv04', 'cv11'",
    "maxWidth-App": "1430px",
    "maxWidth-content": "1200px",
    "boxShadow-navPanel-App": "none",
    "boxShadow-header-App": "none",
    "backgroundColor-content-App": "$color-surface-0",
    "backgroundColor": "$color-surface-0",
    
    // --- AppHeader
    "height-AppHeader": "64px",
    "paddingInline-AppHeader": "$space-4",

    // --- NavPanel
    "backgroundColor-NavPanel": "$color-surface-50",
    "paddingVertical-NavPanel": "$space-5",
    "borderRightWidth-NavPanel": "1px",
    "backgroundColor-scrollbar-NavPanel": "$color-surface-50",
    "color-scrollbar-NavPanel": "$color-secondary-200",

    // --- NavLink
    "textColor-NavLink": "$color-secondary-600",
    "color-indicator-NavLink--active": "transparent",
    "color-indicator-NavLink--hover": "transparent",
    "color-indicator-NavLink--pressed": "transparent",
    "backgroundColor-NavLink--hover": "$color-surface-100",
    "backgroundColor-NavLink--pressed": "$color-surface-100",
    "fontWeight-NavLink--active": "bold",
    "textColor-NavLink--hover": "$color-surface-900",
    "textColor-NavLink--active": "$color-primary-500", //"#3366cc",
    "textColor-NavLink--hover--active": "$color-primary-500", //"#3366cc",
  
    // --- TOC
    "paddingTop-TableOfContents": "0",
    "borderLeftWidth-TableOfContentsItem": "1px",
    "borderLeftWidth-TableOfContentsItem--active": "1px",
    "borderColor-TableOfContentsItem": "transparent",
    "borderColor-TableOfContentsItem--active": "transparent",

    "wordWrap-TableOfContentsItem": "break-word",
    "fontSize-TableOfContentsItem": "$fontSize-small",
    "fontWeight-TableOfContentsItem--active": "bold",
    "fontWeight-TableOfContentsItem--pressed--active": "bold",
    "fontWeight-TableOfContentsItem": "600",
    "textColor-TableOfContentsItem": "$color-secondary-500",
    "textColor-TableOfContentsItem--hover": "$color-surface-900",

    "paddingLeft-TableOfContentsItem": "0.75rem",
    "paddingTop-TableOfContentsItem": "0.35rem",
    "paddingBottom-TableOfContentsItem": "0.35rem",
    
    "paddingLeft-TableOfContentsItem-level-3": "2rem",
    "fontWeight-TableOfContentsItem-level-3": "400",
    "paddingLeft-TableOfContentsItem-level-4": "3rem",
    "paddingLeft-TableOfContentsItem-level-5": "3rem",
    "paddingLeft-TableOfContentsItem-level-6": "3rem",

    // --- Markdown
    "fontSize-Text-markdown": "$fontSize-normal",
    "fontSize-Text-codefence": "$fontSize-small",
    "lineHeight-Text-codefence": "$fontHeight-normal",

    dark: {
      "textColor-NavLink--active": "#3E8CDE",
      "textColor-NavLink--hover--active": "#3E8CDE",
      "color-scrollbar-NavPanel": "$color-secondary-300",
    }
  },
  resources: {},
};

export default DefaultDocsTheme;
