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
    "fontSize": "14px",
    "backgroundColor-Text-code": "rgb(from $color-surface-200 r g b / 0.4)",
    "padding-Text-code": "$space-0_5",
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
