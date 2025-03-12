import type { ThemeDefinition } from "../abstractions";

export const SolidThemeDefinition: ThemeDefinition = {
  id: "solid",
  themeVars: {
    "color-primary": "#2a69bb",
    "color-secondary": "#98a9bc",
    "color-surface": "hsl(0,0%,49%)",
    "color-success": "#45a249",
    "maxWidth-content": "100%",

    borderRadius: "0",
    "fontSize": "$fontSize-normal",
    "size-Icon": "1rem",
  }
};
