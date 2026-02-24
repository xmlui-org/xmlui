import {
  componentsSection,
  extensionsSection,
  groupedNavPanelContent,
  content,
  plainTextContent,
  shikiHighlighter,
  highlight,
  getLocalIcons,
} from "../utils";
import type { StandaloneAppDescription } from "xmlui";

const App: StandaloneAppDescription = {
  name: "XMLUI Website",
  defaultTheme: "xmlui-website-theme",
  icons: getLocalIcons(),
  resources: {
    logo: "/resources/logo.svg",
    "logo-dark": "/resources/logo-dark.svg",
    favicon: "/resources/favicon.ico",
  },
  appGlobals: {
    useHashBasedRouting: false,
    showHeadingAnchors: true,
    searchIndexEnabled: true,
    navSections: {
      components: componentsSection,
      extensions: extensionsSection,
    },
    navPanelContent: groupedNavPanelContent,
    content,
    plainTextContent,
    codeHighlighter: {
      availableLangs: shikiHighlighter.getLoadedLanguages(),
      highlight,
    },
    lintSeverity: "skip", // Turn off xmlui linting
    popOutUrl: "https://playground.xmlui.org/#/playground",
  },
};

export default App;
