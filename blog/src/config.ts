import type { StandaloneAppDescription } from "xmlui";
import {
  groupedNavPanelContent,
  content,
  plainTextContent,
  prefetchedContent,
  shikiHighlighter,
  highlight,
} from "../utils";
import GhIcon from "../icons/github.svg";
import RssIcon from "../icons/rss.svg";

import { BlogAuraThemeDefinition } from "./themes/blog-aura";

const App: StandaloneAppDescription = {
  name: "XMLUI Blog",
  themes: [BlogAuraThemeDefinition],
  defaultTheme: "xmlui-blog",
  icons: {
    github: GhIcon,
    rss: RssIcon,
  },
  resources: {
    logo: "/resources/logo.svg",
    "logo-dark": "/resources/logo-dark.svg",
    favicon: "/resources/favicon.ico",
  },
  appGlobals: {
    useHashBasedRouting: false,
    showHeadingAnchors: true,
    searchIndexEnabled: true,
    navPanelContent: groupedNavPanelContent,
    content,
    plainTextContent,
    codeHighlighter: {
      availableLangs: shikiHighlighter.getLoadedLanguages(),
      highlight,
    },
    prefetchedContent,
    lintSeverity: "skip", // Turn off xmlui linting
    popOutUrl: "https://playground.xmlui.org/#/playground",
  },
};

export default App;
