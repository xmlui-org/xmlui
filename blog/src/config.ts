import type { StandaloneAppDescription } from "xmlui";
import {
  groupedNavPanelContent,
  content,
  plainTextContent,
  prefetchedContent,
  shikiHighlighter,
  highlight,
  blogPosts,
} from "../utils";
import { BlogAuraThemeDefinition } from "./themes/blog-aura";


const App: StandaloneAppDescription = {
  name: "XMLUI Blog",
  themes: [BlogAuraThemeDefinition],
  defaultTheme: "xmlui-blog",
  resources: {
    logo: "/resources/logo.svg",
    "logo-dark": "/resources/logo-dark.svg",
    favicon: "/resources/favicon.ico",
    "icon.github": "/resources/icons/github.svg",
    "icon.rss": "/resources/icons/rss.svg",
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
    blog: {
      posts: blogPosts,
    },
  },
};

export default App;
