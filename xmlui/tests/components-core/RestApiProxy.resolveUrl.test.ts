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

  it("handles array parameters in embedded query strings", () => {
    const proxy = new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

    const url = proxy.resolveUrl({
      operation: { url: "/List?tag=a&tag=b" } as any,
    });

    expect(url).toBe("https://api.example/List?tag=a&tag=b");
  });

  it("merges array parameters from embedded query string with explicit queryParams", () => {
    const proxy = new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

    const url = proxy.resolveUrl({
      operation: {
        url: "/List?tag=a&tag=b",
        queryParams: { category: "books" },
      } as any,
    });

    expect(url).toBe("https://api.example/List?tag=a&tag=b&category=books");
  });

  it("explicit array queryParams override embedded array params", () => {
    const proxy = new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

    const url = proxy.resolveUrl({
      operation: {
        url: "/List?tag=a&tag=b",
        queryParams: { tag: ["c", "d"] },
      } as any,
    });

    expect(url).toBe("https://api.example/List?tag=c&tag=d");
  });
});
