import type { StandaloneAppDescription } from "xmlui";
import { docsContent, staticSearchData } from "./content";

function getLocalIcons() {
  const icons: Record<string, string> = import.meta.glob(`/icons/**/*.svg`, {
    import: "default",
    eager: true,
    query: "?raw",
  });
  const processedIcons: Record<string, string> = {};
  Object.entries(icons).forEach(([key, value]) => {
    const iconName = key.split("/").pop()?.replace(/\.svg$/, "") || "";
    processedIcons[iconName] = value;
  });
  return processedIcons;
}

const App: StandaloneAppDescription = {
  name: "My Docs",
  version: "0.1.0",
  defaultTheme: "xmlui-docs",
  icons: getLocalIcons(),
  resources: {
    logo: "/resources/xmlui-logo.svg",
    "logo-dark": "/resources/xmlui-logo-dark.svg",
    favicon: "/resources/favicon.ico",
  },
  appGlobals: {
    docsContent,
    staticSearchData,
  },
};

export default App;
