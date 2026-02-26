import type { To } from "react-router-dom";
import type { ActionExecutionContext } from "../../abstractions/ActionDefs";
import { createUrlWithQueryParams } from "../../components/component-utils";
import { createAction } from "./actions";
import { getCurrentTrace } from "../inspector/inspectorUtils";

/**
 * Resolves a potentially relative navigation pathname to an absolute path, using
 * the current location as base. This is needed because appContext.navigate calls
 * navigateRouter from AppContent's React context, which resolves relative paths
 * against the router root rather than the currently active page.
 */
function resolveRelativePathname(pathname: string | number, currentPathname: string): string | number {
  if (typeof pathname !== "string") return pathname;
  if (pathname.startsWith("/")) return pathname; // already absolute
  if (pathname === ".") return currentPathname; // stay on current page
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
  queryParams?: Record<string, any>,
) {
  // https://stackoverflow.com/questions/37385570/how-to-know-if-react-router-can-go-back-to-display-back-button-in-react-app
  if (pathname === -1 && location.key === "default") {
    navigate(".");
    return;
  }

  // When routing through appContext.navigate, relative paths must be resolved to absolute
  // paths because appContext.navigate calls navigateRouter from AppContent's context, which
  // has no nested route matches and resolves relative paths against the router root (e.g.
  // '.' → '/') instead of the current page. We use the location from ActionExecutionContext
  // which always reflects the real current URL.
  const resolvedPathname = resolveRelativePathname(pathname, location.pathname);

  const to = queryParams
    ? createUrlWithQueryParams({
        pathname: resolvedPathname,
        queryParams,
      })
    : resolvedPathname;

  // Trace navigation event (only when xsVerbose is enabled)
  if (appContext?.appGlobals?.xsVerbose === true && typeof window !== "undefined") {
    const w = window as any;
    if (Array.isArray(w._xsLogs)) {
      w._xsLogs.push({
        ts: Date.now(),
        perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
        traceId: getCurrentTrace(),
        kind: "navigate",
        from: location.pathname,
        to: String(to),
        queryParams,
      });
    }
  }

  // Use appContext.navigate if available (which includes willNavigate/didNavigate handlers)
  // Otherwise fall back to the direct navigate function.
  // Guard: appContext.navigate accepts React Router's `To` (string | Partial<Path>) which
  // excludes numbers. Numeric history deltas (-1 etc.) are already handled above, but we
  // narrow on resolvedPathname to satisfy the type checker. When resolvedPathname is a
  // string the constructed `to` is a valid To value at runtime, cast is safe.
  if (appContext?.navigate && typeof resolvedPathname !== "number") {
    // Pass queryParams in options for the wrapped navigate to access
    appContext.navigate(to as To, { queryParams });
  } else {
    navigate(to);
  }
}

export const navigateAction = createAction("navigate", navigate);
