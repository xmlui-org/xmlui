import type { ThemeDefinition } from "../../src/components-core/theming/ThemeDefinition";

// Test-safe copy of the website theme definitions. Directly importing
// website/src/themes/*.ts from Playwright currently trips Node's CJS loader
// before Playwright transforms the spec.
export const websiteThemes: ThemeDefinition[] = [
  {
    id: "xmlui-landing-theme",
    name: "XMLUI Landing Theme",
    extends: "xmlui",
    color: "$color-primary-500",
    themeVars: {
      "marginBottom-CodeBlock": "0",
      "marginTop-CodeBlock": "0",
    },
    resources: {},
  },
  {
    id: "xmlui-website-theme",
    name: "XMLUI Website Theme",
    extends: "xmlui",
    color: "$color-primary-500",
    themeVars: {
      "width-navPanel-App": "280px",
      "height-AppHeader": "44px",
      "color-surface": "rgb(111, 110, 119)",
      backgroundColor: "$color-surface-0",
      fontSize: "15px",
      "textColor-Text": "$color-surface-600",
      "textColor-NavLink": "$color-surface-500",
      "textColor-NavLink--active": "$color-surface-900",
      "backgroundColor-NavLink--active": "$color-surface-100",
    },
    resources: {},
  },
  {
    id: "xmlui-hero-theme",
    name: "XMLUI Hero Theme",
    extends: "xmlui",
    color: "$color-primary-500",
    themeVars: {
      "color-surface": "rgb(111, 110, 119)",
      "marginTop-CodeBlock": "0",
      "marginBottom-CodeBlock": "0",
      "backgroundColor-CodeBlock": "$color-surface-100",
      "borderRadius-CodeBlock": "0",
      "border-CodeBlock": "0",
    },
    resources: {},
  },
  {
    name: "XMLUI Documentation Theme",
    id: "earthtone",
    extends: "xmlui-docs",
    themeVars: {
      "color-primary": "hsl(30, 50%, 30%)",
      "color-secondary": "hsl(120, 40%, 25%)",
      "color-surface": "hsl(39, 43%, 97%)",
    },
    resources: {},
  },
  {
    name: "XMLUI Green Documentation Theme",
    id: "xmlui-green-on-default",
    extends: ["xmlui-green", "xmlui-website-theme"],
    themeVars: {},
    resources: {},
  },
  {
    name: "XMLUI Orange Documentation Theme",
    id: "xmlui-orange-on-default",
    extends: ["xmlui-orange", "xmlui-website-theme"],
    themeVars: {},
    resources: {},
  },
  {
    name: "XMLUI Gray Documentation Theme",
    id: "xmlui-gray-on-default",
    extends: ["xmlui-gray", "xmlui-website-theme"],
    themeVars: {},
    resources: {},
  },
];
