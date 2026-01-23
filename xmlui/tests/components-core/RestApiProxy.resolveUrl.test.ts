import { describe, expect, it } from "vitest";

import RestApiProxy from "../../src/components-core/RestApiProxy";

const createProxy = () => new RestApiProxy({ appGlobals: { apiUrl: "https://api.example" } } as any);

describe("RestApiProxy.resolveUrl", () => {
  it("encodes inline query params and prefixes apiUrl for relative paths", () => {
    const proxy = createProxy();

    const url = proxy.resolveUrl({
      operation: { url: "/ListFolder?path=:sh:Documents:/" } as any,
    });

    expect(url).toBe("https://api.example/ListFolder?path=%3Ash%3ADocuments%3A%2F");
  });

  it("encodes explicit queryParams the same as inline params", () => {
    const proxy = createProxy();

    const url = proxy.resolveUrl({
      operation: { url: "/ListFolder", queryParams: { path: ":sh:Documents:/" } } as any,
    });

    expect(url).toBe("https://api.example/ListFolder?path=%3Ash%3ADocuments%3A%2F");
  });

  it("explicit queryParams override embedded ones", () => {
    const proxy = createProxy();

    const url = proxy.resolveUrl({
      operation: {
        url: "/ListFolder?path=:sh:Other:/&page=1",
        queryParams: { path: ":sh:Documents:/", page: 2 },
      } as any,
    });

    expect(url).toBe("https://api.example/ListFolder?path=%3Ash%3ADocuments%3A%2F&page=2");
  });

  it("preserves absolute base urls without prefixing apiUrl", () => {
    const proxy = createProxy();

    const url = proxy.resolveUrl({
      operation: { url: "https://other.example/ListFolder?path=:sh:Documents:/" } as any,
    });

    expect(url).toBe("https://other.example/ListFolder?path=%3Ash%3ADocuments%3A%2F");
  });

  it("handles empty queryParams object", () => {
    const proxy = createProxy();

    const url = proxy.resolveUrl({
      operation: { url: "/ListFolder", queryParams: {} } as any,
    });

    expect(url).toBe("https://api.example/ListFolder");
  });

  it("handles undefined queryParams", () => {
    const proxy = createProxy();

    const url = proxy.resolveUrl({
      operation: { url: "/ListFolder", queryParams: undefined } as any,
    });

    expect(url).toBe("https://api.example/ListFolder");
  });

  it("filters out query parameters with undefined or null values", () => {
    const proxy = createProxy();

    const url = proxy.resolveUrl({
      operation: {
        url: "/ListFolder",
        queryParams: { path: ":sh:Documents:/", filter: undefined, page: 1, empty: null },
      } as any,
    });

    expect(url).toBe("https://api.example/ListFolder?path=%3Ash%3ADocuments%3A%2F&page=1");
  });

  it("handles array values in queryParams", () => {
    const proxy = createProxy();

    const url = proxy.resolveUrl({
      operation: { url: "/ListFolder", queryParams: { tags: ["a", "b"] } } as any,
    });

    expect(url).toBe("https://api.example/ListFolder?tags=a&tags=b");
  });

  it("handles duplicate query parameter keys as arrays", () => {
    const proxy = createProxy();

    const url = proxy.resolveUrl({
      operation: { url: "/List?tag=a&tag=b" } as any,
    });

    expect(url).toBe("https://api.example/List?tag=a&tag=b");
  });

  it("explicit array queryParams override embedded array params", () => {
    const proxy = createProxy();

    const url = proxy.resolveUrl({
      operation: {
        url: "/List?tag=a&tag=b",
        queryParams: { tag: ["c", "d"] },
      } as any,
    });

    expect(url).toBe("https://api.example/List?tag=c&tag=d");
  });

  it("encodes query parameters with special characters", () => {
    const proxy = createProxy();

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

  it("serializes object queryParams as JSON", () => {
    const proxy = createProxy();

    const url = proxy.resolveUrl({
      operation: {
        url: "/Search",
        queryParams: { filter: { name: "John", age: 30 } },
      } as any,
    });

    expect(url).toBe(
      "https://api.example/Search?filter=%7B%22name%22%3A%22John%22%2C%22age%22%3A30%7D"
    );
  });

  it("preserves URL fragments when present", () => {
    const proxy = createProxy();

    const url = proxy.resolveUrl({
      operation: { url: "/Page?section=intro#details" } as any,
    });

    expect(url).toBe("https://api.example/Page?section=intro#details");
  });

  it("preserves URL fragments with explicit query params", () => {
    const proxy = createProxy();

    const url = proxy.resolveUrl({
      operation: {
        url: "/Page#details",
        queryParams: { section: "intro", page: 1 },
      } as any,
    });

    expect(url).toBe("https://api.example/Page?section=intro&page=1#details");
  });
});
