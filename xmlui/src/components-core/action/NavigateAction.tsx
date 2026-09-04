import type { To } from "react-router-dom";
import type { ActionExecutionContext } from "../../abstractions/ActionDefs";
import { createUrlWithQueryParams } from "../../components/component-utils";
import { createAction } from "./actions";
import { getCurrentTrace, pushXsLog } from "../inspector/inspectorUtils";

/**
 * Resolves a potentially relative navigation pathname to an absolute path, using
 * the current location as base. This is needed because appContext.navigate calls
 * navigateRouter from AppContent's React context, which resolves relative paths
 * against the router root rather than the currently active page.
 */
export function resolveRelativePathname(
  pathname: string | number,
  currentPathname: string,
): string | number {
  if (typeof pathname !== "string") return pathname;
  if (pathname.startsWith("/")) return pathname; // already absolute
  if (pathname === ".") return currentPathname; // stay on current page
  if (pathname.startsWith("?")) return currentPathname + pathname; // query-only, preserve on current page
  if (pathname === "..") {
    const parts = currentPathname.split("/").filter(Boolean);
    parts.pop();
    return "/" + parts.join("/") || "/";
  }
  // Other relative paths (e.g. './child', '../sibling') — resolve via URL API
  const base = currentPathname.endsWith("/") ? currentPathname : currentPathname + "/";
  try {
    return new URL(pathname, "http://x" + base).pathname;
  } catch {
    return pathname;
  }
}

function navigate(
  { navigate, location, appContext }: ActionExecutionContext,
  pathname: string | number,
  options?: Record<string, any>,
) {
  // https://stackoverflow.com/questions/37385570/how-to-know-if-react-router-can-go-back-to-display-back-button-in-react-app
  if (pathname === -1 && location.key === "default") {
    navigate(".");
    return;
  }

  // The second argument is an options object `{ queryParams?, replace? }`. For
  // back-compat with the earlier `navigate(pathname, queryParams)` form, a bare
  // object that carries neither `queryParams` nor `replace` is treated as the
  // query-params Record itself.
  const isOptionsObject =
    !!options &&
    typeof options === "object" &&
    ("queryParams" in options || "replace" in options);
  const queryParams: Record<string, any> | undefined = isOptionsObject
    ? options!.queryParams
    : options;
  const replace = isOptionsObject ? !!options!.replace : false;

  // When routing through appContext.navigate, relative paths must be resolved to absolute
  // paths because appContext.navigate calls navigateRouter from AppContent's context, which
  // has no nested route matches and resolves relative paths against the router root (e.g.
  // '.' → '/') instead of the current page. We use the location from ActionExecutionContext
  // which always reflects the real current URL.
  const resolvedPathname = resolveRelativePathname(pathname, location.pathname);

  // createUrlWithQueryParams returns a plain "pathname?search" string for the query-params
  // case (a To object's `search` is dropped by the imperative router under hash routing —
  // see #3694), so `to` is already router-safe here.
  const to = queryParams
    ? createUrlWithQueryParams({ pathname: resolvedPathname, queryParams })
    : resolvedPathname;

  // Trace navigation event — pushXsLog is a noop when xsVerbose is off
  pushXsLog({
    ts: Date.now(),
    perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
    traceId: getCurrentTrace(),
    kind: "navigate",
    from: location.pathname,
    to: String(to),
    queryParams,
    replace,
  });

  // Use appContext.navigate if available (which includes willNavigate/didNavigate handlers)
  // Otherwise fall back to the direct navigate function.
  // Guard: appContext.navigate accepts React Router's `To` (string | Partial<Path>) which
  // excludes numbers. Numeric history deltas (-1 etc.) are already handled above, but we
  // narrow on resolvedPathname to satisfy the type checker. When resolvedPathname is a
  // string the constructed `to` is a valid To value at runtime, cast is safe.
  if (appContext?.navigate && typeof resolvedPathname !== "number") {
    // Pass queryParams (for URL assembly) and replace (forwarded to the router,
    // which honors it via AppContent's navigate options spread) to the wrapped navigate.
    appContext.navigate(to as To, { queryParams, replace });
  } else {
    navigate(to, replace ? { replace: true } : undefined);
  }
}

export const navigateAction = createAction("navigate", navigate);
