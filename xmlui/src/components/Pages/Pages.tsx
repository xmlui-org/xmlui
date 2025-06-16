import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { TableOfContentsProvider } from "../../components-core/TableOfContentsContext";
import { Pages, RouteWrapper, defaultProps } from "./PagesNative";

const PAGE = "Page";

export const PageMd = createMetadata({
  status: "stable",
  docFolder: PAGE,
  description:
    `The \`${PAGE}\` component defines what content is displayed when the user navigates ` +
    `to a particular URL that is associated with the page.`,
  props: {
    //TODO illesg rename to path
    url: d(`The URL of the route associated with the content.`),
    navLabel: d(
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
    `The \`${COMP}\` component is used as a container for [\`Page\`](/components/Page) components ` +
    `within an [\`App\`](/components/App).`,
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
