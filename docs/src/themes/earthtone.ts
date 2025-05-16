import type { ThemeDefinition } from "xmlui";

export const EarthtoneTheme: ThemeDefinition = {
  name: "XMLUI Documentation Theme",
  id: "earthtone",
  extends: "xmlui",
  themeVars: {
    "color-primary": "hsl(30, 50%, 30%)",
    "color-secondary": "hsl(120, 40%, 25%)",
    "color-surface": "hsl(39, 43%, 97%)",

    "marginTop-HtmlLi": "2rem",
    "marginTop-BottomLi": "2rem",
    "marginBottom-H1": "1rem",
    "marginTop-H2": "1rem",
    "marginBottom-H2": "1rem",
    "marginTop-Text-codefence": "1.5rem",
    "marginBottom-Text-codefence": "1.5rem",
    "marginTop-Admonition": "1rem",
    "marginTop-Blockquote": "1rem"
  },
  resources: {},
};

export default EarthtoneTheme;
