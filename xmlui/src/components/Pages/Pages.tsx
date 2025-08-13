import { createComponentRenderer } from "../../components-core/renderers";
import { TableOfContentsProvider } from "../../components-core/TableOfContentsContext";
import { createMetadata, d, dInternal } from "../metadata-helpers";
import { Pages, RouteWrapper, defaultProps } from "./PagesNative";
import { extractPaddings } from "../../components-core/utils/css-utils";

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
  ({ node, extractValue, renderChild, className }) => {
    const paddings = extractPaddings(extractValue, node.props);
    return (
      <TableOfContentsProvider>
        <RouteWrapper
          childRoute={node.children}
          uid={node.uid}
          renderChild={renderChild}
          key={extractValue(node.props.url)}
          className={className}
          {...paddings}
        />
      </TableOfContentsProvider>
    );
  },
);

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
  },
});

export const pagesRenderer = createComponentRenderer(
  COMP,
  PagesMd,
  ({ node, extractValue, renderChild }) => {
    return (
      <Pages
        fallbackPath={extractValue(node.props.fallbackPath)}
        node={node}
        renderChild={renderChild}
        extractValue={extractValue}
      />
    );
  },
);
