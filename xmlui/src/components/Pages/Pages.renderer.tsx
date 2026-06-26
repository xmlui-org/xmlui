import { useEffect, useMemo, useSyncExternalStore } from "react";

import type { XmluiElement } from "../../compiler/ir";
import { createRuntimeScope } from "../../runtime/state";
import { compileRoutePattern, matchRoutePattern, type RouteSnapshot } from "../../runtime/routing";
import { useStringProp } from "../../runtime/rendering/props";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";

export const pagesRenderer: XmluiBuiltInRenderer = ({ context, node, scope }) => {
  const fallbackPath = useStringProp(node, scope, "fallbackPath", "");
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
      className="xmlui-page-root"
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

export const pageRenderer: XmluiBuiltInRenderer = () => null;

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
