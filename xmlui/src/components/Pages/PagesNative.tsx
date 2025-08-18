import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import { Navigate, Route, Routes, useParams } from "@remix-run/react";
import classnames from "classnames";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { LayoutContext, RenderChildFn, ValueExtractor } from "../../abstractions/RendererDefs";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "../../components-core/constants";
import type { PageMd } from "./Pages";
import styles from "./Pages.module.scss";

// Default props for Pages component
export const defaultProps = {
  fallbackPath: "/",
};

// --- We need this component to make sure all the child routes are wrapped in a
// --- container and  this way they can access the routeParams
type RouteWrapperProps = {
  childRoute?: ComponentDef | Array<ComponentDef>;
  renderChild: RenderChildFn;
  layoutContext?: LayoutContext;
  style?: CSSProperties;
  className?: string;
  uid?: string;
};

export function RouteWrapper({
  childRoute = EMPTY_ARRAY,
  renderChild,
  layoutContext,
  style,
  className,
  uid,
}: RouteWrapperProps) {
  const params = useParams();

  //we need to wrap the child route in a container to make sure the route params are available.
  // we do this wrapping by providing an empty object to vars.
  // this way it becomes an 'implicit' container (vars/state inside this container is propagated to the parent)
  const wrappedWithContainer = useMemo(() => {
    if (Array.isArray(childRoute)) {
      return {
        type: "Fragment",
        uid,
        vars: EMPTY_OBJECT,
        children: childRoute,
      };
    }
    return {
      type: "Fragment",
      uid,
      vars: EMPTY_OBJECT,
      children: [childRoute],
    };
  }, [childRoute, uid]);

  return (
    <div
      key={JSON.stringify(params)}
      className={classnames(className, styles.wrapper, "xmlui-page-root")}
      style={style}
    >
      {renderChild(wrappedWithContainer, layoutContext)}
    </div>
  );
}

type PageComponentDef = ComponentDef<typeof PageMd>;

type PagesProps = {
  fallbackPath?: string;
  node?: ComponentDef;
  renderChild: RenderChildFn;
  extractValue: ValueExtractor;
  children?: ReactNode;
  className?: ReactNode;
};

export function Pages({
  node,
  renderChild,
  extractValue,
  fallbackPath = defaultProps.fallbackPath,
}: PagesProps) {
  const routes: Array<PageComponentDef> = [];
  const restChildren: Array<ComponentDef> = [];
  node.children?.forEach((child) => {
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
        {fallbackPath && <Route path="*" element={<Navigate to={fallbackPath} replace  />} />}
      </Routes>
      {renderChild(restChildren)}
    </>
  );
}
