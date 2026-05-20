import type { ThemeDefinition } from "xmlui";

export const theme: ThemeDefinition = {
  id: "custom-theme",
  name: "Custom Theme",
  extends: "xmlui",
  themeVars: {
    "backgroundColor-Button": "#0066cc",
    "textColor-Button": "#ffffff",
    "space-base": "0.25em",
    "textColor-Heading": "#0066cc",
  },
};

export default theme;
