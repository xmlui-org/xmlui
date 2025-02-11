import { omitBy, isUndefined } from "lodash-es";

/**
 * Maps a record of query params to a usable local URL path with the params appended at the end
 * @param to Either a simple URL endpoint or a URL path with query params (corresponds to a href)
 */
export function createUrlWithQueryParams(
  to: string | number | { pathname: string | number; queryParams?: Record<string, any> }
) {
  if (!to || typeof to === "string" || typeof to === "number") {
    return to;
  }
  if (to.queryParams !== undefined) {
    return {
      ...to,
      search: new URLSearchParams(omitBy(to.queryParams, isUndefined)).toString(),
    };
  }
  return to;
}
