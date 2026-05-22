import type { ThemeDefinition } from "xmlui";

export const XmluiHeroTheme: ThemeDefinition = {
  id: "xmlui-hero-theme",
  name: "XMLUI Hero Theme",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: {
    // Color identity inherited from xmlui-website-theme — the gray surface
    // palette is what visually ties the Hero demo to the rest of the website.
    "color-surface": "rgb(111, 110, 119)",
    // Sizing is left at the xmlui defaults (matches the look the landing theme
    // produced); the only landing-theme tweak that mattered was zero margins
    // around CodeBlock so the playground sits flush.
    "marginTop-CodeBlock": "0",
    "marginBottom-CodeBlock": "0",
    "backgroundColor-CodeBlock": "$color-surface-100",
    "borderRadius-CodeBlock": "0",
    "border-CodeBlock": "0",
  },
  resources: {},
};

export default XmluiHeroTheme;
