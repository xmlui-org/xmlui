import type { MutableRefObject, Ref } from "react";

export type UrlWithQueryParams = {
  pathname: string | number;
  queryParams?: Record<string, unknown>;
  search?: string;
  hash?: string;
};

export function createUrlWithQueryParams(
  to: string | number | UrlWithQueryParams | null | undefined,
) {
  if (!to || typeof to === "string" || typeof to === "number") {
    return to;
  }
  if (to.queryParams !== undefined) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(to.queryParams)) {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    }
    return {
      ...to,
      search: params.toString(),
    };
  }
  return to;
}

export function getComposedRef<T>(...refs: Array<Ref<T> | null | undefined>) {
  const nonEmptyRefs = refs.filter((ref): ref is Ref<T> => ref != null);
  if (nonEmptyRefs.length === 0) {
    return undefined;
  }
  if (nonEmptyRefs.length === 1) {
    return nonEmptyRefs[0];
  }
  return (value: T | null) => {
    for (const ref of nonEmptyRefs) {
      if (typeof ref === "function") {
        ref(value);
      } else {
        (ref as MutableRefObject<T | null>).current = value;
      }
    }
  };
}
