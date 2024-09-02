import { Logo } from "./src/components/Logo";
import { Playground } from "./src/components/Playground";
import { StandalonePlayground } from "./src/components/StandalonePlayground";
import { DocsImage } from "./src/components/DocsImage";
import { useRouter } from "next/router";

export default {
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== "/") {
      return {
        titleTemplate: 'XMLUI Docs - %s'
      };
    }
    return {
      titleTemplate: 'XMLUI Docs'
    };
  },
  logo: Logo,
  components: {
    Playground,
    StandalonePlayground,
    Image: DocsImage,
  },
  sidebar: {
    autoCollapse: true,
    defaultMenuCollapseLevel: 1,
  },
  footer: {
    component: null,
  },
  feedback: {
    content: null,
  },
  project: {
    icon: null,
  },
  editLink: {
    text: null,
  },
  darkMode: true,
  nextThemes: {
    defaultTheme: "light",
  },
  // ... other theme options
};
