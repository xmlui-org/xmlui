import type { ThemeDefinition } from "../abstractions";
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
  themeVars: {
    "boxShadow-header-App": "none",
    "font-size": "15px",
    "boxShadow-Input": "$shadow-sm",
  },
  tones: {
    light: {
      themeVars: {
        "color-bg-ModalDialog": "white",
        "color-bg-checked-RadioGroupOption": "$color-primary-400",
      }
    },
    dark: {
      themeVars: {
        "color-error": "$color-danger-400",
      }
    }
  }
};

export const XmlUiGreenThemeDefinition: ThemeDefinition = {
  id: "xmlui-green",
  extends: "xmlui",
  themeVars: { ...greenThemeColors },
};

export const XmlUiGrayThemeDefinition: ThemeDefinition = {
  id: "xmlui-gray",
  extends: "xmlui",
  themeVars: { ...grayThemeColors },
};

export const XmlUiOrangeThemeDefinition: ThemeDefinition = {
  id: "xmlui-orange",
  extends: "xmlui",
  themeVars: { ...orangeThemeColors },
};

export const XmlUiPurpleThemeDefinition: ThemeDefinition = {
  id: "xmlui-purple",
  extends: "xmlui",
  themeVars: { ...purpleThemeColors },
};

export const XmlUiCyanThemeDefinition: ThemeDefinition = {
  id: "xmlui-cyan",
  extends: "xmlui",
  themeVars: { ...cyanThemeColors },
};

export const XmlUiRedThemeDefinition: ThemeDefinition = {
  id: "xmlui-red",
  extends: "xmlui",
  themeVars: { ...redThemeColors },
};
