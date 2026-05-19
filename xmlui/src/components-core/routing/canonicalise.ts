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

  const searchParams =
    policy.queryParamOrder === "alphabetical"
      ? new URLSearchParams([...parsed.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)))
      : parsed.searchParams;
  const query = searchParams.toString();
  const canonical = `${pathname}${query ? `?${query}` : ""}${parsed.hash}`;
  return { canonical, changed: canonical !== `${parsed.pathname}${parsed.search}${parsed.hash}` };
}
