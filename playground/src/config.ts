import type { StandaloneAppDescription } from "xmlui";
import { XmluiPlaygroundTheme } from "./themes/xmlui-playground";

const App: StandaloneAppDescription = {
  name: "XMLUI Playground",
  defaultTheme: "xmlui-playground-theme",
  themes: [XmluiPlaygroundTheme],
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
