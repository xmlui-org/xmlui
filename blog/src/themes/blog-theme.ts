import type { ThemeDefinition } from "xmlui";

export const DefaultDocsTheme: ThemeDefinition = {
  name: "XMLUI Blog Theme",
  id: "blog-theme",
  extends: ["xmlui"],
  themeVars: {
    "paddingHorizontal-Pages": "0px",
  },
  resources: {},
};

export default DefaultDocsTheme;
