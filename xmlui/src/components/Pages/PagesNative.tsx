import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import { Navigate, Route, Routes, useParams } from "@remix-run/react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { EMPTY_ARRAY } from "@components-core/constants";
import type { LayoutContext, RenderChildFn, ValueExtractor } from "@abstractions/RendererDefs";
import type { PageMd } from "./Pages";
import styles from "./Pages.module.scss";
import classnames from "classnames";

// --- We need this component to make sure all the child routes are wrapped in a
// --- container and  this way they can access the routeParams
export function RouteWrapper({
  childRoute = EMPTY_ARRAY,
  renderChild,
  layoutContext,
  style,
}: {
  childRoute?: ComponentDef | Array<ComponentDef>;
  renderChild: RenderChildFn;
  layoutContext?: LayoutContext;
  style?: CSSProperties;
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
    <div
      key={JSON.stringify(params)}
      className={classnames(styles.wrapper, "xmlui-page-root")}
      style={style}
    >
      {renderChild(wrappedWithContainer, layoutContext)}
    </div>
  );
}

type PageComponentDef = ComponentDef<typeof PageMd>;

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
