import { isEqual } from "lodash-es";
import type { Query, QueryKey } from "@tanstack/react-query";
import { normalizeUrlAndParams } from "./urlNormalization";

// base on this: https://tkdodo.eu/blog/effective-react-query-keys

type UrlKeyPart = string;
type UrlQueryParamsPart = Record<string, any>;

type DataLoaderQueryKey = [UrlKeyPart, UrlQueryParamsPart?];

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
