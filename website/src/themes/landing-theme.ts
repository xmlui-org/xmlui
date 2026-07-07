import type { ThemeDefinition } from "xmlui";

export const XmluiLandingTheme: ThemeDefinition = {
  id: "xmlui-landing-theme",
  name: "XMLUI Landing Theme",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: {
    "marginBottom-CodeBlock": "0",
    "marginTop-CodeBlock": "0",
  },
  resources: {},
};

export default XmluiLandingTheme;
