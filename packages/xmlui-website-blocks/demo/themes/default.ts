import type { ThemeDefinition } from "xmlui";

export const Default: ThemeDefinition = {
  id: "default",
  name: "Default demo theme",
  extends: "xmlui",
  resources: {
  },
  themeVars: {
    "paddingTop-H1": "$space-6",
    "paddingBottom-H1": "$space-8",
    "textColor-H1": "$color-primary-600",
  },
  tones: {
    light: {},
    dark: {},
  },
};

export default Default;
