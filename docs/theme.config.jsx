import { Logo } from "./src/components/Logo";
import { Playground } from "./src/components/Playground";
import { StandalonePlayground } from "./src/components/StandalonePlayground";
import { DocsImage } from "./src/components/DocsImage";
import { useRouter } from "next/router";
import { useConfig } from 'nextra-theme-docs'

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
  head: () => {
    const { frontMatter } = useConfig()
    return (
        <>
          <meta property="og:title" content={frontMatter.title} />
          <meta
              property="og:description"
              content={frontMatter.description}
          />
          <link rel="icon" href="/resources/favicon.ico" type="image/svg+xml"/>
        </>
    )
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
