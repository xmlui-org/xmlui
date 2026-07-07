import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import type { XmluiElement } from "../../compiler/ir";
import { createRuntimeScope } from "../../runtime/state";
import { compileRoutePattern, matchRoutePattern, type RouteSnapshot } from "../../runtime/routing";
import { useStringProp } from "../../runtime/rendering/props";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { useThemeVariables } from "../../runtime/rendering/theme";
import { resolveThemeReferences } from "../../styling";
import styles from "./Pages.module.scss";

export const pagesRenderer: XmluiBuiltInRenderer = ({ context, node, scope }) => {
  const fallbackPath = useStringProp(node, scope, "fallbackPath", "");
  const pageStyle = usePagesThemeStyle();
  const snapshot = useRouteSnapshot(scope);
  const pages = node.children.filter(
    (child): child is XmluiElement => child.kind === "element" && child.type === "Page",
  );
  const restChildren = node.children.filter(
    (child) => !(child.kind === "element" && child.type === "Page"),
  );
  const routeDescriptors = useMemo(
    () => pages
      .map((page) => ({
        page,
        url: String(page.props.url ?? ""),
        pattern: compileRoutePattern(String(page.props.url ?? "")),
      }))
      .sort((left, right) => right.pattern.score - left.pattern.score),
    [pages],
  );
  const matched = routeDescriptors
    .map((descriptor) => ({
      ...descriptor,
      params: matchRoutePattern(descriptor.pattern, snapshot.pathname),
    }))
    .find((descriptor) => descriptor.params !== undefined);

  useEffect(() => {
    if (!matched && fallbackPath && snapshot.pathname !== fallbackPath) {
      scope.routing?.navigate(fallbackPath);
    }
  }, [fallbackPath, matched, scope.routing, snapshot.pathname]);

  const pageContent = matched ? (
    <div
      className={`${styles.pageWrapper} xmlui-page-root`}
      style={pageStyle}
      data-xmlui-component="Page"
      data-xmlui-part="root"
      data-xmlui-page-url={matched.url}
    >
      {context.renderChildren(
        matched.page.children,
        createRuntimeScope({
          store: scope.store,
          parent: scope,
          props: scope.props,
          references: scope.references,
          slots: scope.slots,
          routing: scope.routing,
          contextValues: {
            $routeParams: matched.params ?? {},
            $queryParams: snapshot.queryParams,
            $queryString: snapshot.search,
            $pathname: snapshot.pathname,
          },
          emitEvent: scope.emitEvent,
        }),
      )}
    </div>
  ) : null;

  return (
    <>
      {pageContent}
      {context.renderChildren(restChildren, scope)}
    </>
  );
};

export const pageRenderer: XmluiBuiltInRenderer = ({ context, node, scope }) => (
  <PageRoot>
    {context.renderChildren(node.children, scope)}
  </PageRoot>
);

function PageRoot({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${styles.pageWrapper} xmlui-page-root`}
      style={usePagesThemeStyle()}
      data-xmlui-component="Page"
      data-xmlui-part="root"
    >
      {children}
    </div>
  );
}

function usePagesThemeStyle(): CSSProperties {
  const themeVariables = useThemeVariables();
  const paddingHorizontal =
    themeVariables["paddingHorizontal-Pages"] ??
    themeVariables["paddingHorizontal-layout"];
  return {
    "--xmlui-paddingHorizontal-Pages":
      paddingHorizontal == null ? undefined : String(resolveThemeReferences(paddingHorizontal)),
  } as CSSProperties;
}

function useRouteSnapshot(scope: Parameters<XmluiBuiltInRenderer>[0]["scope"]): RouteSnapshot {
  const fallback = {
    pathname: "/",
    search: "",
    hash: "",
    queryParams: {},
    revision: 0,
  };
  return useSyncExternalStore(
    (listener) => scope.routing?.subscribe(listener) ?? (() => undefined),
    () => scope.routing?.getSnapshot() ?? fallback,
    () => scope.routing?.getSnapshot() ?? fallback,
  );
}
