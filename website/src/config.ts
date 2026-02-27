import {
  componentsSection,
  extensionsSection,
  groupedNavPanelContent,
  docsContent,
  plainTextDocsContent,
  plainTextBlogContent,
  prefetchedContent,
  shikiHighlighter,
  highlight,
  getLocalIcons,
} from "../utils";
import type { StandaloneAppDescription } from "xmlui";
import XmluiLandingTheme from "./themes/landing-theme";
import XmluiWebSiteTheme from "./themes/website-theme";
import EarthtoneTheme from "./themes/earthtone";

const App: StandaloneAppDescription = {
  name: "XMLUI Website",
  defaultTheme: "xmlui-website-theme",
  themes: [XmluiLandingTheme, XmluiWebSiteTheme, EarthtoneTheme],
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
    docsContent,
    plainTextDocsContent,
    plainTextBlogContent,
    prefetchedContent,
    codeHighlighter: {
      availableLangs: shikiHighlighter.getLoadedLanguages(),
      highlight,
    },
    lintSeverity: "skip", // Turn off xmlui linting
    popOutUrl: "https://playground.xmlui.org/#/playground",
  },
};

export default App;
