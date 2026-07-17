import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { parseXmlui } from "../../compiler/parseXmlui";
import { componentTransferModules } from "../../component-core";
import { builtInComponentContracts } from "../../compiler/contracts";
import { createRenderContext } from "../../runtime/rendering/renderer";
import { StyleProvider } from "../../components-core/theming/StyleContext";
import { XmluiThemeProvider } from "../../components-core/theming/ThemeContext";
import {
  createRuntimeScope,
  createRuntimeStateStore,
} from "../../runtime/state";
import { headingRenderer, h1Renderer } from "./Heading";
import { Heading as HeadingReact } from "./HeadingReact";

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
    expect(renderHeadingWithLevel("H2")).toContain("<h2");
    expect(renderHeadingWithLevel("3")).toContain("<h3");
    expect(renderHeadingWithLevel("bad")).toContain("<h1");
  });

  it("renders semantic heading elements", () => {
    const html = renderToStaticMarkup(
      <HeadingReact level="h2">
        My Heading
      </HeadingReact>,
    );

    expect(html).toContain("<h2");
    expect(html).toContain("My Heading");
  });
});

function renderHeadingWithLevel(level: string) {
  const document = parseXmlui(`<App><Heading level="${level}">My Heading</Heading></App>`);
  const heading = document.root.children[0];
  if (heading.kind !== "element") {
    throw new Error("Expected Heading element.");
  }
  const store = createRuntimeStateStore();
  const scope = createRuntimeScope({ store });
  const context = createRenderContext({}, {});
  const HeadingRenderer = headingRenderer;

  return renderToStaticMarkup(
    <StyleProvider>
      <XmluiThemeProvider>
        <HeadingRenderer context={context} node={heading} scope={scope} />
      </XmluiThemeProvider>
    </StyleProvider>,
  );
}
