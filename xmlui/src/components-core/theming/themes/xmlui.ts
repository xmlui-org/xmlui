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
    "maxWidth-content-App": "900px",

    // --- Colors & typography
    "color-surface": "rgb(111, 110, 119)",
    "backgroundColor": "color-surface-1",
    "fontSize": "15px",
    "fontFamily": "Inter Variable",
    "font-feature-settings": "'cv01', 'ss03'",
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

    // --- TOC
    "fontSize-TableOfContentsItem": "13px",
  },
};

export const XmlUiBlogThemeDefinition: ThemeDefinition = {
  id: "xmlui-blog",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: {
    // --- App layout
    "maxWidth-content-App": "800px",
    // --- Fundamental colors & typography
    backgroundColor: "$color-surface-0",
    "fontSize": "14px",
    "fontWeight-Text": "400",
    "fontWeight-bold": "700",
    "textColor-primary": "$color-surface-800",
    "textColor-NavLink--active": "$color-primary",
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
