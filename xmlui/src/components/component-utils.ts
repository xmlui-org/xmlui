import { omitBy, isUndefined } from "lodash-es";
import { composeRefs } from "@radix-ui/react-compose-refs";

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
    // Return a plain "pathname?search" string, not a To object. React Router's imperative
    // navigate drops a To object's `search` under the hash router (only a string path
    // survives — see #3694); this affects both `navigate()` and Link/NavLink clicks, which
    // forward this value to the router. A string path routes correctly under every router.
    const search = new URLSearchParams(omitBy(to.queryParams, isUndefined)).toString();
    return search ? `${to.pathname}?${search}` : to.pathname;
  }
  return to;
}

export function getComposedRef(...refs){
  const nonUndefinedRefs = refs.filter(ref => ref !== undefined);
  if(nonUndefinedRefs.length === 0){
    return undefined;
  }
  if(nonUndefinedRefs.length === 1){
    return nonUndefinedRefs[0];
  }
  return composeRefs(...nonUndefinedRefs);
}