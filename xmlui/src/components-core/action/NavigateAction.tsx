import type { ActionExecutionContext } from "../../abstractions/ActionDefs";
import { createUrlWithQueryParams } from "../../components/component-utils";
import { createAction } from "./actions";
import { getCurrentTrace } from "../inspector/inspectorUtils";

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
  const to = queryParams
    ? createUrlWithQueryParams({
        pathname,
        queryParams,
      })
    : pathname;

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
  // Otherwise fall back to the direct navigate function
  if (appContext?.navigate) {
    // Pass queryParams in options for the wrapped navigate to access
    appContext.navigate(to, { queryParams });
  } else {
    navigate(to);
  }
}

export const navigateAction = createAction("navigate", navigate);
