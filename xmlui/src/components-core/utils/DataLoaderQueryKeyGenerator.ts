import { isEqual } from "lodash-es";
import type { Query, QueryKey } from "@tanstack/react-query";

// base on this: https://tkdodo.eu/blog/effective-react-query-keys

type UrlKeyPart = string;
type UrlQueryParamsPart = Record<string, any>;

type DataLoaderQueryKey = [UrlKeyPart, UrlQueryParamsPart?];

/**
 * Normalizes a URL by extracting any embedded query parameters and returning
 * the base URL and merged query parameters separately.
 * This ensures consistent cache keys regardless of whether query params are
 * provided via the queryParams prop or embedded in the URL string.
 *
 * Fixes issue #2672: https://github.com/xmlui-org/xmlui/issues/2672
 */
export function normalizeUrlAndParams(
  url: string,
  queryParams: UrlQueryParamsPart | undefined
): { baseUrl: string; mergedParams: UrlQueryParamsPart | undefined; fragment?: string } {
  if (!url) {
    return { baseUrl: url, mergedParams: queryParams };
  }

  // Extract fragment first (if present)
  let fragment: string | undefined;
  let urlWithoutFragment = url;
  const fragmentIndex = url.indexOf('#');
  if (fragmentIndex !== -1) {
    fragment = url.substring(fragmentIndex);
    urlWithoutFragment = url.substring(0, fragmentIndex);
  }

  // Check if URL contains query parameters
  const queryIndex = urlWithoutFragment.indexOf('?');
  if (queryIndex === -1) {
    // No embedded query params, return as-is
    return { baseUrl: urlWithoutFragment, mergedParams: queryParams, fragment };
  }

  // Split URL into base and query string
  const baseUrl = urlWithoutFragment.substring(0, queryIndex);
  const queryString = urlWithoutFragment.substring(queryIndex + 1);

  // Parse embedded query parameters
  // Fix for duplicate query parameter keys (e.g., "tag=a&tag=b")
  // Previously, only the last value was kept; now we properly handle arrays
  const embeddedParams: Record<string, any> = {};
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    // Process each unique key only once to avoid redundant getAll() calls
    const processedKeys = new Set<string>();
    searchParams.forEach((_, key) => {
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        const values = searchParams.getAll(key);
        // Store as array if there are multiple values, otherwise store the single value
        embeddedParams[key] = values.length > 1 ? values : values[0];
      }
    });
  }

  // Merge embedded params with explicit queryParams
  // Explicit queryParams take precedence over embedded params
  const mergedParams = Object.keys(embeddedParams).length > 0
    ? { ...embeddedParams, ...queryParams }
    : queryParams;

  return { baseUrl, mergedParams, fragment };
}

export class DataLoaderQueryKeyGenerator {
  private readonly url: UrlKeyPart;
  private readonly queryParams?: UrlQueryParamsPart;
  private key?: DataLoaderQueryKey;

  constructor(
    url: UrlKeyPart,
    queryParams: UrlQueryParamsPart | undefined,
    apiUrl: string | undefined,
    body: any,
    rawBody: any,
  ) {
    // Normalize URL and query params to ensure consistent cache keys
    // This fixes issue #2672 where embedded query params in URL create different cache keys
    const { baseUrl, mergedParams } = normalizeUrlAndParams(url, queryParams);

    this.url = baseUrl;
    this.queryParams = mergedParams;
    this.key = [baseUrl];
    if (mergedParams) {
      this.key.push(mergedParams);
    }
    if (apiUrl) {
      this.key.push(apiUrl);
    }
    if (body) {
      this.key.push(body);
    }
    if (rawBody) {
      this.key.push(rawBody);
    }
  }

  asKey() {
    if (!this.key) {
      throw new Error("no key defined");
    }
    return this.key;
  }

  asPredicate(): {
    predicate: (query: Query<unknown, unknown, unknown, QueryKey>) => boolean;
  } {
    if (!this.key) {
      throw new Error("no key defined");
    }
    return {
      predicate: (query: Query<unknown, unknown, unknown, QueryKey>) => {
        const queryKey = query.queryKey as DataLoaderQueryKey;
        return (
          queryKey[0] === this.url && (!this.queryParams || isEqual(queryKey[1], this.queryParams))
        );
      },
    };
  }
}
