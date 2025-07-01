import { createComponentRenderer } from "../../components-core/renderers";
import { TableOfContentsProvider } from "../../components-core/TableOfContentsContext";
import { createMetadata, d, dInternal } from "../metadata-helpers";
import { Pages, RouteWrapper, defaultProps } from "./PagesNative";

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
    navLabel: dInternal(
      "The label of the page that is displayed in the navigation panel. If provided, the " +
        "a new entry will be added to the navigation panel.",
    ),
  },
});

export const pageRenderer = createComponentRenderer(
  PAGE,
  PageMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    return (
      <TableOfContentsProvider>
        <RouteWrapper
          childRoute={node.children}
          uid={node.uid}
          renderChild={renderChild}
          key={extractValue(node.props.url)}
          style={layoutCss}
        />
      </TableOfContentsProvider>
    );
  },
);

const COMP = "Pages";

export const PagesMd = createMetadata({
  description:
    "`Pages` serves as the routing coordinator within an [App](/components/App), " +
    "managing which [Page](/components/Page)  displays based on the current URL.",
  props: {
    defaultRoute: {
      description: `The default route when displaying the app`,
      defaultValue: defaultProps.defaultRoute,
    },
  },
});

export const pagesRenderer = createComponentRenderer(
  COMP,
  PagesMd,
  ({ node, extractValue, renderChild }) => {
    return (
      <Pages
        defaultRoute={extractValue(node.props.defaultRoute)}
        node={node}
        renderChild={renderChild}
        extractValue={extractValue}
      />
    );
  },
);
