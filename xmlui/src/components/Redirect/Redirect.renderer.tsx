import { useEffect } from "react";

import { createUrlWithQueryParams, type UrlWithQueryParams } from "../component-utils";
import { useBooleanProp, useEvaluatedProp } from "../../runtime/rendering/props";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { defaultProps } from "./Redirect.defaults";

export const redirectRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
  const to = normalizeRedirectTarget(useEvaluatedProp(node, scope, "to", defaultProps.to));
  const replace = useBooleanProp(node, scope, "replace", defaultProps.replace);

  useEffect(() => {
    if (!to) {
      return;
    }
    if (replace) {
      void scope.routing?.replace(to);
      return;
    }
    void scope.routing?.navigate(to);
  }, [replace, scope.routing, to]);

  return null;
};

function normalizeRedirectTarget(to: unknown): string | number | undefined {
  const normalized = createUrlWithQueryParams(to as string | number | UrlWithQueryParams);
  if (!normalized) {
    return undefined;
  }
  if (typeof normalized === "string" || typeof normalized === "number") {
    return normalized;
  }
  const pathname = normalized.pathname == null ? "" : String(normalized.pathname);
  const search =
    typeof normalized.search === "string" && normalized.search
      ? normalized.search.startsWith("?")
        ? normalized.search
        : `?${normalized.search}`
      : "";
  const hash =
    typeof normalized.hash === "string" && normalized.hash
      ? normalized.hash.startsWith("#")
        ? normalized.hash
        : `#${normalized.hash}`
      : "";
  return `${pathname}${search}${hash}`;
}
