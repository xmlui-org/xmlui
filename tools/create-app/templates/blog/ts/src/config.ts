import type { StandaloneAppDescription } from "xmlui";
import { allPosts, prefetchedContent, staticSearchData } from "./content";

const App: StandaloneAppDescription = {
  name: "My Blog",
  version: "0.1.0",
  defaultTheme: "xmlui-web",
  resources: {
    logo: "/resources/xmlui-logo.svg",
    "logo-dark": "/resources/xmlui-logo-dark.svg",
    favicon: "/resources/favicon.ico",
  },
  appGlobals: {
    posts: allPosts,
    prefetchedContent,
    staticSearchData,
  },
};

export default App;
