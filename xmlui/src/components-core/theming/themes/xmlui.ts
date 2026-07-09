import type { ThemeDefinition } from "../../../abstractions/ThemingDefs";
import {
  cyanThemeColors,
  grayThemeColors,
  greenThemeColors,
  orangeThemeColors,
  purpleThemeColors,
  redThemeColors,
} from "./theme-colors";

export const XmlUiThemeDefinition: ThemeDefinition = {
  id: "xmlui",
  resources: {
    // "font.inter": "https://rsms.me/inter/inter.css",
  },
  color: "$color-primary-500",
  themeVars: {
    "font-size": "15px",
    "boxShadow-Input": "$boxShadow-sm",
  },
  tones: {
    light: {
      themeVars: {
        "backgroundColor-ModalDialog": "white",
        "backgroundColor-checked-RadioGroupOption": "$color-primary-400",
      },
    },
    dark: {
      themeVars: {
        "color-error": "$color-danger-400",
      },
    },
  },
};

export const XmlUiGreenThemeDefinition: ThemeDefinition = {
  id: "xmlui-green",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: { ...greenThemeColors },
};

export const XmlUiGrayThemeDefinition: ThemeDefinition = {
  id: "xmlui-gray",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: { ...grayThemeColors },
};

export const XmlUiOrangeThemeDefinition: ThemeDefinition = {
  id: "xmlui-orange",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: { ...orangeThemeColors },
};

export const XmlUiPurpleThemeDefinition: ThemeDefinition = {
  id: "xmlui-purple",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: { ...purpleThemeColors },
};

export const XmlUiCyanThemeDefinition: ThemeDefinition = {
  id: "xmlui-cyan",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: { ...cyanThemeColors },
};

export const XmlUiRedThemeDefinition: ThemeDefinition = {
  id: "xmlui-red",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: { ...redThemeColors },
};

export const XmlUiBlogThemeDefinition: ThemeDefinition = {
  id: "xmlui-blog",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: {
    // --- Blog layout config
    //layout: "featuredWithTabs",
    layout: "basic",
    tableOfContents: "false",
    tags: "false",

    // --- App layout (match docs content width)
    "maxWidth-content-App": "800px",
    "maxWidth-content-App--withToc": "1000px",
    // --- Fundamental colors & typography
    "color-surface": "rgb(111, 110, 119)",
    "backgroundColor": "color-surface-1",
    "fontSize": "14px",
    "fontWeight-Text": "400",
    "fontWeight-bold": "700",
    "textColor-primary": "$color-surface-800",
    "textColor-NavLink--active": "$color-primary",
    "fontSize-Text-info": "14px",
    "textColor-Text-info": "$color-primary-500",
    "textColor-Text-info--hover": "$color-primary-500",
    "textColor-Text-infoStrong": "$color-primary-500",
    "textColor-Text-description": "$color-surface-800",
    "textColor-Text-description--hover": "$color-surface-800",
    "fontSize-Text-description": "18px",
    "fontWeight-Text-description": "500",
    "textColor-Text-blurb": "$color-surface-800",
    "textColor-Text-blurb--hover": "$color-surface-800",
    "textColor-Text": "$color-surface-800",
    "textColor-H2": "$color-surface-800",
    "textColor-H1": "$color-surface-800",
    "fontWeight-Link--active": "normal",
    "textDecorationLine-Link": "none",
    "textColor-Link--active": "$color-primary-500",

    // --- Blog component customization tokens
    "fontSize-blog-overview-title": "42px",
    "fontSize-blog-overview-post-title": "24px",
    "fontSize-blog-overview-featured-title": "24px",
    "fontSize-blog-page-title": "32px",
    "minHeight-blog-featured-grid-card": "320px",
    "marginTop-blog-tabs-content": "$space-6",
    "border-blog-grid-top": "1px solid $color-surface-200",
    "border-blog-grid-left": "1px solid $color-surface-200",
    "border-blog-grid-right": "1px solid $color-surface-200",
    "border-blog-grid-bottom": "1px solid $color-surface-200",

    // --- Blog text variants
    "fontSize-Text-blogPostDescription": "24px",
    "textColor-Text-blogPostDescription": "$color-surface-800",
    "fontWeight-Text-blogPostDescription": "500",
    "backgroundColor-Text-tagPill": "$color-surface-100",
    "textColor-Text-tagPill": "$color-surface-500",
    "borderRadius-Text-tagPill": "$space-8",
    "paddingHorizontal-Text-tagPill": "$space-3",
    "paddingVertical-Text-tagPill": "$space-0_5",
  },
};

export const XmlUiWebThemeDefinition: ThemeDefinition = {
  id: "xmlui-web",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: {
    // --- Fundamental colors & typography
    "maxWidth-content-AppHeader": "1280px",
    backgroundColor: "$color-surface-0",
    "color-primary": "#3367CC",
    "color-surface": "#1e2734",
    "fontWeight-Text": "400",
    "fontWeight-bold": "700",
    "textColor-primary": "$color-surface-800",
    "textColor-NavLink--active": "$color-primary",

    // --- App layout
    "maxWidth-content-App": "800px",

    // --- Headings
    "fontSize-H2": "32px",
    "fontSize-H3": "$space-6",
  },
};
