import type { ThemeDefinition } from "xmlui";

export const EarthtoneTheme: ThemeDefinition = {
  name: "XMLUI Documentation Theme",
  id: "earthtone",
  extends: "docs-theme",
  themeVars: {
    "color-primary": "hsl(30, 50%, 30%)",
    "color-secondary": "hsl(120, 40%, 25%)",
    "color-surface": "hsl(39, 43%, 97%)",
  },
  resources: {},
};

export default EarthtoneTheme;
