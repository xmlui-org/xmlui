import { afterEach, describe, expect, it } from "vitest";

import { normalizePath } from "../../../src/components-core/utils/misc";

const originalPublicPath = (window as any).__PUBLIC_PATH;

afterEach(() => {
  if (originalPublicPath === undefined) {
    delete (window as any).__PUBLIC_PATH;
  } else {
    (window as any).__PUBLIC_PATH = originalPublicPath;
  }
});

describe("normalizePath", () => {
  it("returns relative paths unchanged when no public path is configured", () => {
    delete (window as any).__PUBLIC_PATH;

    expect(normalizePath("mockServiceWorker.js")).toBe("mockServiceWorker.js");
  });

  it("prefixes relative paths with the configured public path", () => {
    (window as any).__PUBLIC_PATH = "/subfolder/";

    expect(normalizePath("mockServiceWorker.js")).toBe("/subfolder/mockServiceWorker.js");
  });

  it("prefixes root-relative paths with the configured public path", () => {
    (window as any).__PUBLIC_PATH = "/subfolder/";

    expect(normalizePath("/mockServiceWorker.js")).toBe("/subfolder/mockServiceWorker.js");
  });

  it("does not prefix absolute URLs", () => {
    (window as any).__PUBLIC_PATH = "/subfolder/";

    expect(normalizePath("https://example.com/mockServiceWorker.js")).toBe(
      "https://example.com/mockServiceWorker.js",
    );
  });
});
