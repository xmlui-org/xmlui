import type { ThemeDefinition } from "xmlui";

export const XmluiPlaygroundTheme: ThemeDefinition = {
  name: "XMLUI Playground Theme",
  id: "xmlui-playground-theme",
  extends: ["xmlui"],
  themeVars: {
    backgroundColor: "$color-surface-0",
    "color-primary": "#3367CC",
    "color-surface": "#1e2734",
    "paddingLeft-Button": "$space-1_5",
    "paddingRight-Button": "$space-1_5",
    "paddingTop-Button": "$space-1_5",
    "paddingBottom-Button": "$space-1_5",
    "fontFamily-MenuItem": "Monospace",
    "fontSize-MenuItem": "14px",
    "color-MenuItem": "$color-surface-700",
    "border-DropdownMenu": "1px solid $color-surface-200",
    light: {
    },
    dark: {
      backgroundColor: "$color-surface-100",
      "border-NestedApp": "1px solid $color-surface-200",
    },
  },
  resources: {},
};

export default XmluiPlaygroundTheme;
