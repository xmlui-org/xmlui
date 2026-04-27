import {
  componentsSection,
  extensionsSection,
  docsContent,
  staticSearchData,
  prefetchedContent,
  posts,
  allPosts,
  shikiHighlighter,
  highlight,
  getLocalIcons,
} from "../utils";
import type { StandaloneAppDescription } from "xmlui";
import XmluiLandingTheme from "./themes/landing-theme";
import XmluiWebSiteTheme from "./themes/website-theme";
import XmluiHeroTheme from "./themes/hero-theme";
import EarthtoneTheme from "./themes/earthtone";
import XmluiGreenTheme from "./themes/xmlui-green-on-default";
import XmluiOrangeTheme from "./themes/xmlui-orange-on-default";
import XmluiGrayTheme from "./themes/xmlui-gray-on-default";

const App: StandaloneAppDescription = {
  name: "XMLUI",
  defaultTheme: "xmlui-website-theme",
  themes: [
    XmluiLandingTheme,
    XmluiWebSiteTheme,
    XmluiHeroTheme,
    EarthtoneTheme,
    XmluiGreenTheme,
    XmluiOrangeTheme,
    XmluiGrayTheme,
  ],
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
    docsContent,
    staticSearchData,
    prefetchedContent,
    posts,
    allPosts,
    codeHighlighter: {
      availableLangs: shikiHighlighter.getLoadedLanguages(),
      highlight,
    },
    lintSeverity: "skip", // Turn off xmlui linting
    popOutUrl: "https://playground.xmlui.org/#/playground",
  },
};

export default App;
