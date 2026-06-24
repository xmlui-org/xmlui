import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { componentTransferModules } from "../../component-core";
import { builtInComponentContracts } from "../../compiler/contracts";
import { h1Renderer } from "./Heading";
import { Heading as HeadingReact, normalizeHeadingLevel } from "./HeadingReact";

describe("Heading migration", () => {
  it("uses source-adjacent metadata, renderer, defaults, styles, docs, and tests for H1", () => {
    const h1Module = componentTransferModules.find((component) => component.name === "H1");
    const h1Contract = builtInComponentContracts.find((contract) => contract.name === "H1");

    expect(h1Module?.status).toBe("transferred-folder");
    expect(h1Module?.contract).toBe(h1Contract);
    expect(h1Module?.renderer).toBe(h1Renderer);
    expect(h1Module?.sources.implementation).toContain("xmlui/src/components/Heading/HeadingReact.tsx");
    expect(h1Module?.sources.metadata).toContain("xmlui/src/components/Heading/Heading.tsx");
    expect(h1Module?.sources.defaults).toContain("xmlui/src/components/Heading/Heading.defaults.ts");
    expect(h1Module?.sources.styles).toContain("xmlui/src/components/Heading/Heading.module.scss");
    expect(h1Module?.sources.docs).toContain("xmlui/src/components/Heading/H1.md");
  });

  it("normalizes old accepted heading level forms", () => {
    expect(normalizeHeadingLevel(1)).toBe("h1");
    expect(normalizeHeadingLevel("H2")).toBe("h2");
    expect(normalizeHeadingLevel("3")).toBe("h3");
    expect(normalizeHeadingLevel("bad")).toBe("h1");
  });

  it("renders semantic heading elements and anchors", () => {
    const html = renderToStaticMarkup(
      <HeadingReact level="h2" showAnchor>
        My Heading
      </HeadingReact>,
    );

    expect(html).toContain("<h2");
    expect(html).toContain('data-xmlui-heading-level="h2"');
    expect(html).toContain('id="my-heading"');
    expect(html).toContain('href="#my-heading"');
  });
});
