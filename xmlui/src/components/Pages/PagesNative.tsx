import { Fragment, ReactNode, useMemo } from "react";
import { Navigate, Route, Routes } from "@remix-run/react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { useParams } from "@remix-run/react";
import { EMPTY_ARRAY } from "@components-core/constants";
import type { LayoutContext, RenderChildFn, ValueExtractor } from "@abstractions/RendererDefs";
import { PageMd } from "./Pages";

// --- We need this component to make sure all the child routes are wrapped in a 
// --- container and  this way they can access the routeParams
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

type PageComponentDef = ComponentDef<typeof PageMd>

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
            <Route path={extractValue(child.props.url)} key={i} element={renderChild(child)} />
          );
        })}
        {!!defaultRoute && <Route path="*" element={<Navigate to={defaultRoute} replace />} />}
      </Routes>
      {renderChild(restChildren)}
    </>
  );
}
