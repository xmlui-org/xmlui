import { describe, expect, it } from "vitest";

import { buildContentFromRuntime } from "../../../../packages/xmlui-docs-blocks/src/contentUtils";

describe("buildContentFromRuntime", () => {
  it("adds markdown pages to plain text search data using public route paths", () => {
    const { content, plainTextContent, navPanelContent } = buildContentFromRuntime(
      {
        "/content/docs/pages/howto/center-content-on-the-page.md": {
          default: "# Center content on the page\n\nUse CVStack or CHStack.",
        },
      },
      { contentPrefix: "/content/docs/" },
      { urlPrefix: "/docs/" },
    );

    expect(content["pages/howto/center-content-on-the-page.md"]).toBe(
      "# Center content on the page\n\nUse CVStack or CHStack.",
    );
    expect(plainTextContent["/docs/howto/center-content-on-the-page"]).toContain(
      "Center content on the page",
    );
    expect(navPanelContent).toEqual([]);
  });

  it("maps the docs intro page to the docs root search path", () => {
    const { plainTextContent } = buildContentFromRuntime(
      {
        "/content/docs/pages/intro.md": {
          default: "# Documentation\n\nStart here.",
        },
      },
      { contentPrefix: "/content/docs/" },
      { urlPrefix: "/docs/" },
    );

    expect(plainTextContent["/docs"]).toContain("Documentation");
    expect(plainTextContent["/docs/intro"]).toBeUndefined();
  });

  it("keeps non-page documents in the nav panel and strips their extension", () => {
    const { content, plainTextContent, navPanelContent } = buildContentFromRuntime(
      {
        "/content/docs/reference/components/Stack.md": {
          default: "# Stack\n\nLayout component.",
        },
      },
      { contentPrefix: "/content/docs/" },
      { urlPrefix: "/docs/" },
    );

    expect(content["reference/components/Stack"]).toContain("Layout component.");
    expect(plainTextContent["/docs/reference/components/Stack"]).toContain("Stack");
    expect(navPanelContent).toEqual(["reference/components/Stack"]);
  });
});
