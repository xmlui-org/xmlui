import type { StandaloneAppDescription } from "xmlui";

const App: StandaloneAppDescription = {
  name: "XMLUI Playground",
  defaultTheme: "docs-theme",
  resources: {
    logo: "/resources/logo.svg",
    "logo-dark": "/resources/logo-dark.svg",
    favicon: "/resources/favicon.ico",
  },
  appGlobals: {
    useHashBasedRouting: false,
  },
};

export default App;
