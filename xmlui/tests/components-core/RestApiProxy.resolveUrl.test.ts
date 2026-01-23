import { describe, expect, it } from "vitest";

import RestApiProxy from "../../src/components-core/RestApiProxy";

describe("RestApiProxy.resolveUrl", () => {
  it("encodes inline query params and prefixes apiUrl for relative paths", () => {
    const proxy = new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

    const url = proxy.resolveUrl({
      operation: { url: "/ListFolder?path=:sh:Documents:/" } as any,
    });

    expect(url).toBe("https://api.example/ListFolder?path=%3Ash%3ADocuments%3A%2F");
  });

  it("encodes explicit queryParams the same as inline params", () => {
    const proxy = new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

    const url = proxy.resolveUrl({
      operation: { url: "/ListFolder", queryParams: { path: ":sh:Documents:/" } } as any,
    });

    expect(url).toBe("https://api.example/ListFolder?path=%3Ash%3ADocuments%3A%2F");
  });

  it("explicit queryParams override embedded ones", () => {
    const proxy = new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

    const url = proxy.resolveUrl({
      operation: {
        url: "/ListFolder?path=:sh:Other:/&page=1",
        queryParams: { path: ":sh:Documents:/", page: 2 },
      } as any,
    });

    expect(url).toBe("https://api.example/ListFolder?path=%3Ash%3ADocuments%3A%2F&page=2");
  });

  it("preserves absolute base urls without prefixing apiUrl", () => {
    const proxy = new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

    const url = proxy.resolveUrl({
      operation: { url: "https://other.example/ListFolder?path=:sh:Documents:/" } as any,
    });

    expect(url).toBe("https://other.example/ListFolder?path=%3Ash%3ADocuments%3A%2F");
  });

  it("handles empty queryParams object", () => {
    const proxy = new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

    const url = proxy.resolveUrl({
      operation: { url: "/ListFolder", queryParams: {} } as any,
    });

    expect(url).toBe("https://api.example/ListFolder");
  });

  it("handles undefined queryParams", () => {
    const proxy = new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

    const url = proxy.resolveUrl({
      operation: { url: "/ListFolder", queryParams: undefined } as any,
    });

    expect(url).toBe("https://api.example/ListFolder");
  });

  it("filters out query parameters with undefined values", () => {
    const proxy = new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

    const url = proxy.resolveUrl({
      operation: {
        url: "/ListFolder",
        queryParams: { path: ":sh:Documents:/", filter: undefined, page: 1 },
      } as any,
    });

    expect(url).toBe("https://api.example/ListFolder?path=%3Ash%3ADocuments%3A%2F&page=1");
  });

  it("encodes query parameters with special characters (spaces, ampersands, equals)", () => {
    const proxy = new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

    const url = proxy.resolveUrl({
      operation: {
        url: "/Search",
        queryParams: {
          query: "hello world",
          filter: "name=John&age=30",
          tags: "a=b&c=d",
        },
      } as any,
    });

    expect(url).toBe(
      "https://api.example/Search?query=hello+world&filter=name%3DJohn%26age%3D30&tags=a%3Db%26c%3Dd"
    );
  });

  it("preserves URL fragments when present", () => {
    const proxy = new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

    const url = proxy.resolveUrl({
      operation: { url: "/Page?section=intro#details" } as any,
    });

    expect(url).toBe("https://api.example/Page?section=intro#details");
  });

  it("preserves URL fragments with explicit query params", () => {
    const proxy = new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

    const url = proxy.resolveUrl({
      operation: {
        url: "/Page#details",
        queryParams: { section: "intro", page: 1 },
      } as any,
    });

    expect(url).toBe("https://api.example/Page?section=intro&page=1#details");
  });
});
