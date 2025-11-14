import type { ThemeDefinition } from "xmlui";

export const BlogTheme: ThemeDefinition = {
  name: "XMLUI Blog Theme",
  id: "blog-theme",
  extends: ["xmlui"],
  themeVars: {
    // --- App layout
    "maxWidth-content-App": "800px",
    // --- Fundamental colors & typography
    backgroundColor: "$color-surface-0",
    "color-primary": "#3367CC",
    "color-surface": "#1e2734",
    "fontWeight-Text": "400",
    "fontWeight-bold": "700",
    "textColor-primary": "$color-surface-800",
    "textColor-NavLink--active": "$color-primary",
  },
  resources: {},
};

export default BlogTheme;
