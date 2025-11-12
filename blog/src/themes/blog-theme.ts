import type { ThemeDefinition } from "xmlui";

export const DefaultDocsTheme: ThemeDefinition = {
  name: "XMLUI Blog Theme",
  id: "blog-theme",
  extends: ["xmlui"],
  themeVars: {
    "paddingHorizontal-Pages": "0px",
    // --- App layout
    "maxWidth-content-App": "800px",
  },
  resources: {},
};

export default DefaultDocsTheme;
