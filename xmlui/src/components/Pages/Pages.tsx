import styles from "./Pages.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { TableOfContentsProvider } from "../../components-core/TableOfContentsContext";
import { createMetadata, dInternal } from "../metadata-helpers";
import { defaultProps, pageDefaultProps } from "./Pages.defaults";
import { Pages, RouteWrapper } from "./PagesReact";
import { extractPaddings } from "../../components-core/utils/css-utils";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

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
    url: {
      description: `The URL of the route associated with the content. If not set, the page is not available.`,
      valueType: "url",
    },
    // NOTE: This is experimental
    searchIndexable: {
      description:
        "Whether the content of this page should be indexed for search. Defaults to true.",
      valueType: "boolean",
      defaultValue: pageDefaultProps.searchIndexable,
      isInternal: true,
    },
    navLabel: dInternal(
      "The label of the page that is displayed in the navigation panel. If provided, the " +
        "a new entry will be added to the navigation panel.",
    ),
    queryParams: {
      description:
        "Optional query-string constraint declaration, for example `page:int(min=1)?,sort:enum(asc,desc)?`.",
      valueType: "string",
      isInternal: true,
    },
    guard: {
      description:
        "Optional page-level navigation guard. Wave 4 reserves this prop for defended routing.",
      valueType: "any",
      isInternal: true,
    },
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
          compiledRoute={(node.props as any).__compiledRoute}
          pageUrl={(node.props as any).__pageUrl}
          fallbackPath={(node.props as any).__fallbackPath}
          guard={(node.props as any).__guard}
          renderChild={renderChild}
          key={extractValue(node.props.url)}
          classes={{
            ...(classes ?? {}),
            [COMPONENT_PART_KEY]: classnames(
              classes?.[COMPONENT_PART_KEY],
              (node.props as any).__pagesClassName,
            ),
          }}
          style={(node.props as any).__pagesStyle as CSSProperties | undefined}
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
      valueType: "url",
      defaultValue: defaultProps.fallbackPath,
    },
    defaultScrollRestoration: {
      description:
        "When set to true, the page scroll position is restored when navigating back via browser history.",
      valueType: "boolean",
      defaultValue: defaultProps.defaultScrollRestoration,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`paddingVertical-${COMP}`]: "$space-5",
    [`paddingHorizontal-${COMP}`]: "var(--xmlui-paddingHorizontal-layout)",
    [`gap-${COMP}`]: "$space-5",
  },
});

export const pagesRenderer = wrapComponent(COMP, Pages, PagesMd, {
  customRender: (_props, { node, extractValue, renderChild, classes }) => (
    <Pages
      fallbackPath={extractValue(node.props.fallbackPath)}
      defaultScrollRestoration={extractValue.asOptionalBoolean(node.props.defaultScrollRestoration)}
      node={node}
      renderChild={renderChild}
      extractValue={extractValue}
      pagesClassName={classnames(classes?.[COMPONENT_PART_KEY], (_props as any).className)}
      pagesStyle={(_props as any).style}
    />
  ),
});

import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import classnames from "classnames";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiElement } from "../../compiler/ir";
import { compileRoutePattern, matchRoutePattern, type RouteSnapshot } from "../../runtime/routing";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { createRuntimeScope } from "../../runtime/state";
import { useAppLayoutContext } from "../App/AppLayoutContext";

export const pagesRuntimeRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: PagesMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const fallbackPath = adapter.stringProp("fallbackPath", defaultProps.fallbackPath);
    const defaultScrollRestoration = adapter.booleanProp(
      "defaultScrollRestoration",
      defaultProps.defaultScrollRestoration,
    );
    const context = useAppLayoutContext();
    const snapshot = useRuntimeRouteSnapshot(adapter.scope);
    const pages = adapter.node.children.filter(
      (child): child is XmluiElement => child.kind === "element" && child.type === "Page",
    );
    const restChildren = adapter.node.children.filter(
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
      context?.setScrollRestorationEnabled?.(defaultScrollRestoration);
    }, [context, defaultScrollRestoration]);

    useEffect(() => {
      if (!matched && fallbackPath && snapshot.pathname !== fallbackPath) {
        adapter.scope.routing?.navigate(fallbackPath);
      }
    }, [adapter.scope.routing, fallbackPath, matched, snapshot.pathname]);

    const pageContent = matched ? (
      <div
        {...adapter.rootAttrs()}
        className={classnames(adapter.className, styles.pageWrapper, "xmlui-page-root")}
        data-xmlui-component="Page"
        data-xmlui-page-url={matched.url}
      >
        {adapter.context.renderChildren(
          matched.page.children,
          createRuntimeScope({
            store: adapter.scope.store,
            parent: adapter.scope,
            props: adapter.scope.props,
            references: adapter.scope.references,
            slots: adapter.scope.slots,
            routing: adapter.scope.routing,
            contextValues: {
              $routeParams: matched.params ?? {},
              $queryParams: snapshot.queryParams,
              $queryString: snapshot.search,
              $pathname: snapshot.pathname,
            },
            emitEvent: adapter.scope.emitEvent,
          }),
        )}
      </div>
    ) : null;

    const rootAttrs = adapter.rootAttrs();
    return (
      <div
        className={classnames(adapter.className, rootAttrs.className)}
        style={{ ...(rootAttrs.style as React.CSSProperties | undefined), display: "contents" }}
      >
        {pageContent}
        {adapter.context.renderChildren(restChildren, adapter.scope)}
      </div>
    );
  },
});

export const pageRuntimeRenderer = wrapRuntimeComponent({
  name: PAGE,
  metadata: PageMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <div
      {...adapter.rootAttrs()}
      className={classnames(adapter.className, styles.pageWrapper, "xmlui-page-root")}
    >
      {adapter.renderChildren()}
    </div>
  ),
});

function useRuntimeRouteSnapshot(scope: Parameters<typeof createRuntimeScope>[0]["parent"]): RouteSnapshot {
  const fallback = {
    pathname: "/",
    search: "",
    hash: "",
    queryParams: {},
    revision: 0,
  };
  return useSyncExternalStore(
    (listener) => scope?.routing?.subscribe(listener) ?? (() => undefined),
    () => scope?.routing?.getSnapshot() ?? fallback,
    () => scope?.routing?.getSnapshot() ?? fallback,
  );
}
