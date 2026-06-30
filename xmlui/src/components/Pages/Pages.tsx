import { createMetadata, dInternal } from "../../component-core/metadata/helpers";

export const defaultProps = {
  fallbackPath: "/",
  defaultScrollRestoration: false,
};

export const pageDefaultProps = {
  searchIndexable: true,
};

export const PageMd = createMetadata({
  status: "stable",
  docFolder: "Pages",
  description:
    "`Page` defines route endpoints within an application, mapping URL patterns to content.",
  props: {
    url: {
      description: "The URL of the route associated with the content.",
      valueType: "url",
    },
    searchIndexable: {
      description: "Whether the content of this page should be indexed for search.",
      valueType: "boolean",
      defaultValue: pageDefaultProps.searchIndexable,
      isInternal: true,
    },
    navLabel: dInternal("The label displayed in the navigation panel."),
    queryParams: {
      description: "Optional query-string constraint declaration.",
      valueType: "string",
      isInternal: true,
    },
    guard: {
      description: "Optional page-level navigation guard.",
      valueType: "any",
      isInternal: true,
    },
  },
  contextVars: {
    $pathname: { description: "The current route pathname.", valueType: "string" },
    $routeParams: { description: "The current route parameters.", valueType: "any" },
    $queryParams: { description: "The current query parameters.", valueType: "any" },
    $queryString: { description: "The current query string.", valueType: "string" },
  },
});

export const PagesMd = createMetadata({
  status: "stable",
  description:
    "`Pages` serves as the routing coordinator within an App, managing which Page displays based on the current URL.",
  props: {
    fallbackPath: {
      description: "The fallback path when the current URL does not match any page.",
      valueType: "url",
      defaultValue: defaultProps.fallbackPath,
    },
    defaultScrollRestoration: {
      description: "Restores page scroll position when navigating back via browser history.",
      valueType: "boolean",
      defaultValue: defaultProps.defaultScrollRestoration,
    },
  },
  themeVars: {
    "paddingVertical-Pages": "The vertical padding of the page content.",
    "paddingHorizontal-Pages": "The horizontal padding of the page content.",
    "gap-Pages": "The gap between page children.",
  },
  defaultThemeVars: {
    "paddingVertical-Pages": "$space-5",
    "paddingHorizontal-Pages": "$paddingHorizontal-layout",
    "gap-Pages": "$space-5",
  },
});
