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

export const XmlUiDocsThemeDefinition: ThemeDefinition = {
  id: "xmlui-docs",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: {
    // --- App layout
    "width-navPanel-App": "280px",
    "maxWidth-content-App": "1000px",
    "maxWidth-content-NoToc": "700px",

    // --- Colors & typography
    "color-surface": "rgb(111, 110, 119)",
    "backgroundColor": "$color-surface-0",
    "fontSize": "15px",
    "fontFamily-monospace": "Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace",
    "font-feature-settings": "'cv03', 'ss03'",
    "fontSize-code": "13px",
    "textColor-Text": "$color-surface-600",

    // --- Navigation layout
    "iconAlignment-NavLink": "baseline",
    "fontSize-NavLink": "14px",
    "fontWeight-NavLink": "500",
    "textColor-NavLink": "$color-surface-500",
    "textColor-NavLink--active": "$color-surface-900",
    "textColor-NavLink--hover": "$color-surface-700",
    "textColor-NavLink--hover--active": "$color-surface-900",
    "textColor-NavLink--pressed": "$color-surface-900",
    "thickness-indicator-NavLink": "0",
    "backgroundColor-Text-code": "rgb(from $color-surface-200 r g b / 0.4)",
    "paddingHorizontal-Text-code": "$space-1",
    "marginTop-items-NavGroup": "$space-3",
    "marginBottom-items-NavGroup": "$space-3",
    "expandIconAlignment-NavGroup": "end",
    "paddingVertical-NavLink": "$space-1_5",
    "paddingLeft-level1-NavLink": "$space-0",
    "paddingLeft-level2-NavGroup": "$space-0",

    // --- TOC
    "fontSize-TableOfContentsItem": "13px",
    "borderLeft-TableOfContentsItem": "2px solid $color-surface-100",
    "fontWeight-TableOfContentsItem--active": "$fontWeight-normal",
    "textColor-TableOfContentsItem--active": "$color-surface-900",
    "borderLeft-TableOfContentsItem--active": "2px solid $color-surface-900",

    // --- Content layout
    "textColor-Heading": "$color-surface-900",
    "fontSize-H1-markdown": "$fontSize-5xl",
    "marginTop-H1-markdown": "$space-2",
    "marginBottom-H1-markdown": "$space-2",
    "fontSize-H2-markdown": "$fontSize-3xl",
    "marginTop-H2-markdown": "$space-6",
    "marginBottom-H2-markdown": "$space-1",
    "fontSize-H3-markdown": "$fontSize-xl",
    "marginTop-H3-markdown": "$space-6",
    "marginBottom-H3-markdown": "$space-1",
    "marginTop-H4-markdown": "$space-6",
    "marginBottom-H4-markdown": "$space-1",
    "fontWeight-PrevNextLink": "500",
    "textColor-PrevNextLink": "$color-surface-900",
    "padding-PrevNextLink": "4px",
    "fontSize-PrevNextText": "13px",
    "textColor-PrevNextText": "$color-surface-500",
    "backgroundColor-Card--hover": "$color-surface-50",
    "backgroundColor-CodeBlock": "$color-surface-100",
    "textColor-Link": "$color-surface-600",
    "textColor-Link--hover": "$color-surface-900",
  },
};

export const XmlUiBlogThemeDefinition: ThemeDefinition = {
  id: "xmlui-blog",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: {
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
