export interface CanonicalPolicy {
  case: "preserve" | "lower";
  trailingSlash: "preserve" | "always" | "never";
  queryParamOrder: "preserve" | "alphabetical";
  onMismatch: "redirect" | "rewrite" | "warn";
}

export const defaultCanonicalPolicy: CanonicalPolicy = {
  case: "preserve",
  trailingSlash: "preserve",
  queryParamOrder: "preserve",
  onMismatch: "warn",
};

export function canonicalise(url: string, policy: CanonicalPolicy = defaultCanonicalPolicy) {
  const base = typeof window !== "undefined" ? window.location.href : "http://localhost/";
  const parsed = new URL(url, base);
  let pathname = parsed.pathname || "/";

  if (policy.case === "lower") {
    pathname = pathname.toLowerCase();
  }

  if (policy.trailingSlash === "always" && pathname !== "/" && !pathname.endsWith("/")) {
    pathname += "/";
  } else if (policy.trailingSlash === "never" && pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.replace(/\/+$/, "");
  }

  // Rebuild the query string from the RAW "key=value" pairs rather than routing
  // them through `URLSearchParams.toString()`. That method always re-encodes
  // using application/x-www-form-urlencoded rules (e.g. "/" -> "%2F", " " -> "+"),
  // which is a different escaping scheme than the one the URL's own query
  // component already uses. Round-tripping through it therefore changes the
  // string even when nothing about the URL is actually non-canonical, causing
  // `changed` to be a false positive for any query value containing characters
  // like "/" — which, combined with the default `onMismatch: "redirect"`, made
  // `Pages` silently rewrite (and, under hash routing, corrupt) perfectly valid
  // URLs on every navigation. Splitting/joining the raw string preserves each
  // pair's original encoding; only the pair order changes when requested.
  const rawQuery = parsed.search.startsWith("?") ? parsed.search.slice(1) : parsed.search;
  const pairs = rawQuery === "" ? [] : rawQuery.split("&");
  const query =
    policy.queryParamOrder === "alphabetical"
      ? pairs.slice().sort((a, b) => a.localeCompare(b)).join("&")
      : rawQuery;
  const canonical = `${pathname}${query ? `?${query}` : ""}${parsed.hash}`;
  return { canonical, changed: canonical !== `${parsed.pathname}${parsed.search}${parsed.hash}` };
}
