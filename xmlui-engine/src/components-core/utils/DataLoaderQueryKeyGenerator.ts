import { isEqual } from "lodash-es";
import { Query, QueryKey } from '@tanstack/react-query';

// base on this: https://tkdodo.eu/blog/effective-react-query-keys

type UrlKeyPart = string;
type UrlQueryParamsPart = Record<string, any>;

type DataLoaderQueryKey = [UrlKeyPart, UrlQueryParamsPart?];

export class DataLoaderQueryKeyGenerator {
  private readonly url: UrlKeyPart;
  private readonly queryParams?: UrlQueryParamsPart;
  private key?: DataLoaderQueryKey;

  constructor (url: UrlKeyPart, queryParams?: UrlQueryParamsPart) {
    this.url = url;
    this.queryParams = queryParams;
    if(queryParams){
      this.key = [url, queryParams];
    } else {
      this.key = [url];
    }
    
  }

  asKey () {
    if (!this.key) {
      throw new Error("no key defined");
    }
    return this.key;
  }

  asPredicate (): {
    predicate: (query: Query<unknown, unknown, unknown, QueryKey>) => boolean;
  } {
    if (!this.key) {
      throw new Error("no key defined");
    }
    return {
      predicate: (query: Query<unknown, unknown, unknown, QueryKey>) => {
        const queryKey = query.queryKey as DataLoaderQueryKey;
        return queryKey[0] === this.url && (!this.queryParams || isEqual(queryKey[1], this.queryParams));
      }
    };
  }
}
