import type { ThemeDefinition } from "xmlui";

export const DefaultDocsTheme: ThemeDefinition = {
  name: "XMLUI Documentation Theme",
  id: "docs-theme",
  extends: ["xmlui"],
  themeVars: {
    "fontSize-Link": "10pt",
    "textDecorationLine-Link": "none",
    },
  }

export default DefaultDocsTheme;
