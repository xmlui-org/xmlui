import type { StandaloneAppDescription } from "xmlui";
import {
  groupedNavPanelContent,
  content,
  plainTextContent,
  prefetchedContent,
  shikiHighlighter,
  highlight
} from "../utils";
import { BlogAuraThemeDefinition } from "./themes/blog-aura";

const blogPosts = [
    {
      title: "Introducing XMLUI",
      slug: "introducing-xmlui",
      description:
        "Let's make building user interfaces as easy as it was 30 years ago.",
      author: "Jon Udell",
      date: "2025-07-18",
      image: "xmlui-demo.png",
      tags: ["xmlui"],
    },
    {
      title: "Reproducible XMLUI",
      slug: "xmlui-playground",
      description:
        "Use playgrounds to infuse docs with live examples, iterate on prototypes, and reproduce bugs.",
      author: "Jon Udell",
      date: "2025-10-27",
      image: "playground.png",
      tags: ["playground"],
    },
    {
      title: "An XMLUI-powered blog",
      slug: "xmlui-powered-blog",
      description: "How we made this blog with a few dozen lines of XMLUI.",
      author: "Jon Udell",
      date: "2025-10-28",
      image: "blog-scrabble.png",
      tags: ["blog"],
    },
    {
      title: "Introducing the XMLUI CLI",
      slug: "introducing-the-xmlui-cli",
      description: "Your all-in-one tool for working with XMLUI.",
      author: "Jon Udell",
      date: "2025-12-19",
      image: "cli-blog-header.svg",
      tags: ["cli"],
    },
    {
      title: "Supabase + XMLUI",
      slug: "supabase-and-xmlui",
      description: "Build an XMLUI interface to a Supabase backend.",
      author: "Jon Udell",
      date: "2026-01-27",
      image: "supabase-and-xmlui.png",
      draft: true,
      tags: ["supabase"],
    },
  ];


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
