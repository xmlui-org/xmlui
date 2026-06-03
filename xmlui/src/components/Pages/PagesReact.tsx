import { type CSSProperties, type ReactNode, memo, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import classnames from "classnames";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { LayoutContext, RenderChildFn, ValueExtractor } from "../../abstractions/RendererDefs";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "../../components-core/constants";
import type { PageMd } from "./Pages";
import styles from "./Pages.module.scss";
import { useAppLayoutContext } from "../App/AppLayoutContext";
import { useAppContext } from "../../components-core/AppContext";
import { CoercedQueryParamsContext, CoercedRouteParamsContext } from "../../components-core/state/routing-state";
import {
  canonicalise,
  compileRoute,
  guardAllows,
  guardRedirect,
  runGuard,
  validateQueryParams,
  validateRouteParams,
  type CanonicalPolicy,
  type CompiledRoute,
  type GuardFn,
} from "../../components-core/routing";
import { pushXsLog } from "../../components-core/inspector/inspectorUtils";

import { defaultProps, pageDefaultProps } from "./Pages.defaults";

// --- We need this component to make sure all the child routes are wrapped in a
// --- container and  this way they can access the routeParams
type RouteWrapperProps = {
  childRoute?: ComponentDef | Array<ComponentDef>;
  renderChild: RenderChildFn;
  layoutContext?: LayoutContext;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  uid?: string;
  compiledRoute?: CompiledRoute;
  pageUrl?: string;
  fallbackPath?: string;
  guard?: GuardFn;
};

export const RouteWrapper = memo(function RouteWrapper({
  childRoute = EMPTY_ARRAY,
  renderChild,
  layoutContext,
  style,
  className,
  classes,
  uid,
  compiledRoute,
  pageUrl,
  fallbackPath,
  guard,
}: RouteWrapperProps) {
  const params = useParams();
  const location = useLocation();
  const appContext = useAppContext();
  const strictRouting = appContext.appGlobals?.strictRouting !== false;
  const [guardState, setGuardState] = useState<"pending" | "allowed">(() => guard ? "pending" : "allowed");

  const validated = useMemo(() => {
    if (!compiledRoute) return { ok: true as const, params };
    return validateRouteParams(compiledRoute, params, pageUrl ?? "", strictRouting);
  }, [compiledRoute, pageUrl, params, strictRouting]);

  const validatedQuery = useMemo(() => {
    if (!compiledRoute) return { ok: true as const, params: Object.fromEntries(new URLSearchParams(location.search)) };
    return validateQueryParams(compiledRoute, new URLSearchParams(location.search), pageUrl ?? "", strictRouting);
  }, [compiledRoute, location.search, pageUrl, strictRouting]);

  useEffect(() => {
    let alive = true;
    if (!guard || validated.ok === false || validatedQuery.ok === false) {
      setGuardState("allowed");
      return;
    }
    setGuardState("pending");
    void runGuard(
      guard,
      {
        pathname: location.pathname,
        routeParams: validated.params,
        search: location.search,
        trigger: "navigate",
      },
      null,
    ).then((result) => {
      if (!alive) return;
      if (guardAllows(result)) {
        setGuardState("allowed");
        return;
      }
      const redirect = guardRedirect(result) ?? fallbackPath ?? "/";
      pushXsLog({
        kind: "navigate",
        ts: Date.now(),
        from: location.pathname + location.search + location.hash,
        to: redirect,
        routingDiagnostic: {
          code: "guard-bypass-attempt",
          severity: strictRouting ? "error" : "warn",
          pageUrl,
          message: `Page guard rejected navigation to "${pageUrl ?? location.pathname}".`,
        },
      });
      appContext.navigate(redirect, { replace: true });
    });
    return () => {
      alive = false;
    };
  }, [
    appContext,
    fallbackPath,
    guard,
    location.hash,
    location.pathname,
    location.search,
    pageUrl,
    strictRouting,
    validated,
    validatedQuery,
  ]);

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

  if (validated.ok === false) {
    const diagnostic = validated.diagnostic;
    pushXsLog({
      kind: "navigate",
      ts: Date.now(),
      to: fallbackPath ?? "/",
      routingDiagnostic: diagnostic,
    });
    return <Navigate to={fallbackPath ?? "/"} replace />;
  }

  if (validatedQuery.ok === false) {
    const diagnostic = validatedQuery.diagnostic;
    pushXsLog({
      kind: "navigate",
      ts: Date.now(),
      to: fallbackPath ?? "/",
      routingDiagnostic: diagnostic,
    });
    return <Navigate to={fallbackPath ?? "/"} replace />;
  }

  if (guardState !== "allowed") {
    return null;
  }

  return (
    <div
      key={JSON.stringify(params)}
      className={classnames(classes?.[COMPONENT_PART_KEY], className, styles.pageWrapper, "xmlui-page-root")}
      style={style}
    >
      <CoercedRouteParamsContext.Provider value={validated.params}>
        <CoercedQueryParamsContext.Provider value={validatedQuery.params}>
          {renderChild(wrappedWithContainer, layoutContext)}
        </CoercedQueryParamsContext.Provider>
      </CoercedRouteParamsContext.Provider>
    </div>
  );
});

type PageComponentDef = ComponentDef<typeof PageMd>;

type PagesProps = {
  fallbackPath?: string;
  defaultScrollRestoration?: boolean;
  node?: ComponentDef;
  renderChild: RenderChildFn;
  extractValue: ValueExtractor;
  children?: ReactNode;
  className?: string;
};

export const Pages = memo(function Pages({
  node,
  renderChild,
  extractValue,
  fallbackPath = defaultProps.fallbackPath,
  defaultScrollRestoration,
}: PagesProps) {
  const context = useAppLayoutContext();
  const appContext = useAppContext();
  const strictRouting = appContext.appGlobals?.strictRouting !== false;
  const canonicalPolicy: CanonicalPolicy = useMemo(
    () => ({
      case: appContext.appGlobals?.urlCase === "lower" ? "lower" : "preserve",
      trailingSlash: ["always", "never", "preserve"].includes(appContext.appGlobals?.urlTrailingSlash)
        ? appContext.appGlobals?.urlTrailingSlash
        : "preserve",
      queryParamOrder: appContext.appGlobals?.urlQueryParamOrder === "alphabetical" ? "alphabetical" : "preserve",
      onMismatch: ["redirect", "rewrite", "warn"].includes(appContext.appGlobals?.nonCanonicalUrl)
        ? appContext.appGlobals?.nonCanonicalUrl
        : strictRouting
          ? "redirect"
          : "warn",
    }),
    [
      appContext.appGlobals?.nonCanonicalUrl,
      appContext.appGlobals?.urlCase,
      appContext.appGlobals?.urlQueryParamOrder,
      appContext.appGlobals?.urlTrailingSlash,
      strictRouting,
    ],
  );
  const location = useLocation();

  useEffect(() => {
    context?.setScrollRestorationEnabled?.(!!defaultScrollRestoration);
  }, [defaultScrollRestoration, context]);

  const routes: Array<PageComponentDef> = [];
  const restChildren: Array<ComponentDef> = [];
  node.children?.forEach((child) => {
    if (child.type === "Page") {
      routes.push(child as PageComponentDef);
    } else {
      restChildren.push(child);
    }
  });
  useEffect(() => {
    const incoming = location.pathname + location.search + location.hash;
    const { canonical, changed } = canonicalise(incoming, canonicalPolicy);
    if (!changed) return;
    const diagnostic = {
      code: "non-canonical-url",
      severity: strictRouting ? "error" : "warn",
      message: `URL is not canonical. Expected "${canonical}".`,
      data: { incoming, canonical },
    };
    pushXsLog({ kind: "navigate", ts: Date.now(), to: canonical, routingDiagnostic: diagnostic });
    if (canonicalPolicy.onMismatch === "redirect" || canonicalPolicy.onMismatch === "rewrite") {
      window.history.replaceState(window.history.state, "", canonical);
    }
  }, [canonicalPolicy, location.hash, location.pathname, location.search, strictRouting]);

  const compiledRoutes = useMemo(() => {
    return routes.map((child) =>
      compileRoute(
        String(extractValue(child.props.url) ?? ""),
        strictRouting,
        extractValue.asOptionalString(child.props.queryParams),
      ),
    );
  }, [extractValue, routes, strictRouting]);

  useEffect(() => {
    for (const compiledRoute of compiledRoutes) {
      for (const diagnostic of compiledRoute.diagnostics) {
        pushXsLog({
          kind: "navigate",
          ts: Date.now(),
          routingDiagnostic: diagnostic,
        });
        if (diagnostic.severity === "error") {
          console.error(`[xmlui routing] ${diagnostic.message}`);
        } else {
          console.warn(`[xmlui routing] ${diagnostic.message}`);
        }
      }
    }
  }, [compiledRoutes]);

  return (
    <>
      <Routes>
        {routes.map((child, i) => {
          const routeUrl = String(extractValue(child.props.url) ?? "");
          const compiledRoute = compiledRoutes[i];
          return (
            <Route
              path={compiledRoute.rrPath}
              key={i}
              element={renderChild({
                ...child,
                props: {
                  ...child.props,
                  __compiledRoute: compiledRoute,
                  __fallbackPath: fallbackPath,
                  __pageUrl: routeUrl,
                  __guard: extractValue(child.props.guard),
                },
              })}
            />
          );
        })}
        {fallbackPath && <Route path="*" element={<Navigate to={fallbackPath} replace />} />}
      </Routes>
      {renderChild(restChildren)}
    </>
  );
});
