import {
  groupedNavPanelContent,
  content,
  plainTextContent,
} from "../utils";
import componentsSection from "../navSections/components.json";
import extensionsSection from "../navSections/extensions.json";
import { shikiHighlighter, highlight } from "xmlui-docs-blocks";
import type { StandaloneAppDescription } from "xmlui";


const App: StandaloneAppDescription = {
  name: "XMLUI Docs",
  defaultTheme: "xmlui-docs",
  resources: {
    logo: "/resources/logo.svg",
    "logo-dark": "/resources/logo-dark.svg",
    favicon: "/resources/favicon.ico",
    "icon.github": "/resources/icons/github.svg",
    "icon.rss": "/resources/icons/rss.svg",

    "icon.school": "/resources/icons/school.svg",
    "icon.arrow-shuffle": "/resources/icons/arrow-shuffle.svg",
    "icon.component": "/resources/icons/component.svg",
    "icon.theme": "/resources/icons/theme.svg",
    "icon.palette": "/resources/icons/palette.svg",
    "icon.hierarchy": "/resources/icons/hierarchy.svg",
    "icon.markup": "/resources/icons/markup.svg",
    "icon.boundary": "/resources/icons/boundary.svg",
    "icon.bolt": "/resources/icons/bolt.svg",
    "icon.playground": "/resources/icons/playground.svg",
    "icon.layout": "/resources/icons/layout.svg",
    "icon.typography": "/resources/icons/typography.svg",
    "icon.markdown": "/resources/icons/markdown.svg",
    "icon.link": "/resources/icons/link.svg",
    "icon.form": "/resources/icons/form.svg",
    "icon.dialog": "/resources/icons/dialog.svg",
    "icon.refactor": "/resources/icons/refactor.svg",
    "icon.build": "/resources/icons/build.svg",
    "icon.deploy": "/resources/icons/deploy.svg",
    "icon.invoice": "/resources/icons/invoice.svg",
    "icon.file-code": "/resources/icons/file-code.svg",
    "icon.menu": "/resources/icons/menu.svg",
    "icon.cards": "/resources/icons/cards.svg",
    "icon.charts": "/resources/icons/charts.svg",
    "icon.slider": "/resources/icons/slider.svg",
    "icon.file-invoice": "/resources/icons/file-invoice.svg",
    "icon.create": "/resources/icons/create.svg",
    "icon.details": "/resources/icons/details.svg",
    "icon.search": "/resources/icons/search.svg",
    "icon.import": "/resources/icons/import.svg",
    "icon.settings": "/resources/icons/settings.svg",
    "icon.mcp": "/resources/icons/mcp.svg",
    "icon.logs": "/resources/icons/logs.svg",
    "icon.vscode-extension": "/resources/icons/vscode-extension.svg",
    "icon.puzzle": "/resources/icons/puzzle.svg",
    "icon.context": "/resources/icons/context.svg",
    "icon.globals": "/resources/icons/globals.svg",
    "icon.helper-tags": "/resources/icons/helper-tags.svg",
    "icon.universal-props": "/resources/icons/universal-props.svg",
    "icon.template-props": "/resources/icons/template-props.svg",
    "icon.icons": "/resources/icons/icons.svg",
    "icon.glossary": "/resources/icons/glossary.svg",
    "icon.article": "/resources/icons/article.svg",
    "icon.star": "/resources/icons/star.svg",
    "icon.definition": "/resources/icons/definition.svg",
    "icon.behavior": "/resources/icons/behavior.svg",
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
    content,
    plainTextContent,
    codeHighlighter: {
      availableLangs: shikiHighlighter.getLoadedLanguages(),
      highlight,
    },
    lintSeverity: "skip", // Turn off xmlui linting
    popOutUrl: "https://playground.xmlui.org/#/playground",
  },
};

export default App;
