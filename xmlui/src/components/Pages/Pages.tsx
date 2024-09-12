import type { ReactNode } from "react";
import { Fragment, useMemo } from "react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { Navigate, Route, Routes, useParams } from "@remix-run/react";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { EMPTY_ARRAY } from "@components-core/constants";
import type { LayoutContext, RenderChildFn, ValueExtractor } from "@abstractions/RendererDefs";
import { TableOfContentsProvider } from "@components-core/TableOfContentsContext";

//we need this component to make sure all the child routes are wrapped in a container.
//  this way they can access the routeParams
export function RouteWrapper({
  childRoute = EMPTY_ARRAY,
  renderChild,
  layoutContext,
}: {
  childRoute?: ComponentDef | Array<ComponentDef>;
  renderChild: RenderChildFn;
  layoutContext?: LayoutContext;
}) {
  const params = useParams();
  const wrappedWithContainer = useMemo(() => {
    if (Array.isArray(childRoute)) {
      return {
        type: "Container",
        children: childRoute,
      };
    }
    return {
      type: "Container",
      children: [childRoute],
    };
  }, [childRoute]);

  return (
    <Fragment key={JSON.stringify(params)}>
      {renderChild(wrappedWithContainer, layoutContext)}
    </Fragment>
  );
}

// =====================================================================================================================
// XMLUI Page component definition

/**
 * The \`Page\` component defines what content is displayed
 * when the user navigates to a particular URL that is associated with the Page.
 *
 * Examples for the \`Page\` component can be found in the [\`Pages\`](./Pages.mdx) component documentation.
 * @descriptionRef none
 */
export interface PageComponentDef extends ComponentDef<"Page"> {
  props: {
    /** The URL of the route associated with the content. */
    url: string;
  };
}

const PageMetadata: ComponentDescriptor<PageComponentDef> = {
  displayName: "Page",
  description: "A placeholder for the content to display with a particular route",
  props: {
    url: desc("The URL of the route associated with the content"),
  },
};

export const pageRenderer = createComponentRenderer<PageComponentDef>(
  "Page",
  ({ node, extractValue, renderChild }) => {
    return (
      <TableOfContentsProvider>
        <RouteWrapper
          childRoute={node.children}
          renderChild={renderChild}
          key={extractValue(node.props.url)}
        />
      </TableOfContentsProvider>
    );
  },
  PageMetadata,
);

type PagesProps = {
  defaultRoute?: string;
  node?: ComponentDef;
  renderChild: RenderChildFn;
  extractValue: ValueExtractor;
  children?: ReactNode;
};

export function Pages({ node, renderChild, extractValue, defaultRoute }: PagesProps) {
  const routes: Array<PageComponentDef> = [];
  const restChildren: Array<ComponentDef> = [];
  node.children.map((child) => {
    if (child.type === "Page") {
      routes.push(child as PageComponentDef);
    } else {
      restChildren.push(child);
    }
  });
  return (
    <>
      <Routes>
        {routes.map((child, i) => {
          return (
            <Route
              path={extractValue(child.props.url)}
              key={i}
              element={renderChild(child)}
            />
          );
        })}
        {!!defaultRoute && <Route path="*" element={<Navigate to={defaultRoute} replace />} />}
      </Routes>
      {renderChild(restChildren)}
    </>
  );
}

// =====================================================================================================================
// XMLUI Pages component definition

/**
 * The \`Pages\` component is used as a container for [\`Page\`](./Page.mdx) components within an [\`App\`](./App.mdx).
 * See the [\`Page\` docs](./Page.mdx) for a short description.
 *
 * Examples for both components can be found here.
 * @descriptionRef
 */
export interface PagesComponentDef extends ComponentDef<"Pages"> {
  props: {
    /**
     * The default route to display when the app starts.
     * @descriptionRef
     */
    defaultRoute?: string;
  };
}

export const PagesMd: ComponentDescriptor<PagesComponentDef> = {
  displayName: "Pages",
  description: "A node grouping routes with their contents",
  props: {
    defaultRoute: desc("The default route when displaying the app"),
  },
};

export const pagesRenderer = createComponentRenderer<PagesComponentDef>(
  "Pages",
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
  PagesMd,
);
