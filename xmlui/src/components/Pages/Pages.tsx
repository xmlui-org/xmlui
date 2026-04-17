import styles from "./Pages.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { TableOfContentsProvider } from "../../components-core/TableOfContentsContext";
import { createMetadata, d, dInternal } from "../metadata-helpers";
import { Pages, RouteWrapper, defaultProps, pageDefaultProps } from "./PagesReact";
import { extractPaddings } from "../../components-core/utils/css-utils";
import { parseScssVar } from "../../components-core/theming/themeVars";

const PAGE = "Page";

export const PageMd = createMetadata({
  status: "stable",
  docFolder: "Pages",
  description:
    "`Page` defines route endpoints within an application, mapping specific URL " +
    "patterns to content that displays when users navigate to those routes. Each " +
    "Page represents a distinct view or screen in your single-page application's " +
    "routing system.",
  props: {
    //TODO illesg rename to path
    url: d(
      `The URL of the route associated with the content. If not set, the page is not available.`,
    ),
    // NOTE: This is experimental
    searchIndexable: {
      description: "Whether the content of this page should be indexed for search. Defaults to true.",
      valueType: "boolean",
      defaultValue: pageDefaultProps.searchIndexable,
      isInternal: true,
    },
    navLabel: dInternal(
      "The label of the page that is displayed in the navigation panel. If provided, the " +
        "a new entry will be added to the navigation panel.",
    ),
  },
});

export const pageRenderer = wrapComponent(PAGE, RouteWrapper, PageMd, {
  customRender: (_props, { node, extractValue, renderChild, classes }) => {
    const paddings = extractPaddings(extractValue, node.props);
    return (
      <TableOfContentsProvider>
        <RouteWrapper
          childRoute={node.children}
          uid={node.uid}
          renderChild={renderChild}
          key={extractValue(node.props.url)}
          classes={classes}
          {...paddings}
        />
      </TableOfContentsProvider>
    );
  },
});

const COMP = "Pages";

export const PagesMd = createMetadata({
  status: "stable",
  description:
    "`Pages` serves as the routing coordinator within an [App](/components/App), " +
    "managing which [Page](/components/Page)  displays based on the current URL.",
  props: {
    fallbackPath: {
      description: `The fallback path when the current URL does not match any of the paths of the pages.`,
      defaultValue: defaultProps.fallbackPath,
    },
    defaultScrollRestoration: {
      description: "When set to true, the page scroll position is restored when navigating back via browser history.",
      valueType: "boolean",
      defaultValue: defaultProps.defaultScrollRestoration,
    },
  },
    themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`paddingVertical-${COMP}`]: "$space-5",
    [`paddingHorizontal-${COMP}`]: "$space-4",
    [`gap-${COMP}`]: "$space-5",
  },
});

export const pagesRenderer = wrapComponent(COMP, Pages, PagesMd, {
  customRender: (_props, { node, extractValue, renderChild }) => (
    <Pages
      fallbackPath={extractValue(node.props.fallbackPath)}
      defaultScrollRestoration={extractValue.asOptionalBoolean(node.props.defaultScrollRestoration)}
      node={node}
      renderChild={renderChild}
      extractValue={extractValue}
    />
  ),
});
