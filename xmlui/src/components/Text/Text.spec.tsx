import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { parseXmlui } from "../../compiler/parseXmlui";
import { builtInComponentContracts } from "../../compiler/contracts";
import { componentTransferModules } from "../../component-core";
import { createRenderContext } from "../../runtime/rendering/renderer";
import { XmluiThemeRoot } from "../../runtime/rendering/theme";
import {
  createRuntimeScope,
  createRuntimeStateStore,
} from "../../runtime/state";
import { textRenderer } from "./Text";
import { Text as TextReact } from "./TextReact";

describe("Text migration", () => {
  it("uses source-adjacent metadata, renderer, defaults, styles, docs, and tests", () => {
    const textModule = componentTransferModules.find((component) => component.name === "Text");
    const textContract = builtInComponentContracts.find((contract) => contract.name === "Text");

    expect(textModule?.status).toBe("transferred-folder");
    expect(textModule?.contract).toBe(textContract);
    expect(textModule?.renderer).toBe(textRenderer);
    expect(textModule?.sources.implementation).toContain("xmlui/src/components/Text/TextReact.tsx");
    expect(textModule?.sources.metadata).toContain("xmlui/src/components/Text/Text.tsx");
    expect(textModule?.sources.defaults).toContain("xmlui/src/components/Text/Text.defaults.ts");
    expect(textModule?.sources.styles).toContain("xmlui/src/components/Text/Text.module.scss");
    expect(textModule?.sources.docs).toContain("xmlui/src/components/Text/Text.md");
  });

  it("renders value through the migrated renderer and lets value override children", () => {
    const document = parseXmlui(`<App><Text value="hello">world</Text></App>`);
    const text = document.root.children[0];
    if (text.kind !== "element") {
      throw new Error("Expected Text element.");
    }
    const store = createRuntimeStateStore();
    const scope = createRuntimeScope({ store });
    const context = createRenderContext({}, {});
    const TextRenderer = textRenderer;

    const html = renderToStaticMarkup(
      <XmluiThemeRoot>
        <TextRenderer context={context} node={text} scope={scope} />
      </XmluiThemeRoot>,
    );

    expect(html).toContain('data-xmlui-component="Text"');
    expect(html).toContain(">hello</div>");
    expect(html).not.toContain("world");
  });

  it("maps old text variants to semantic elements", () => {
    expect(renderTextVariant("strong")).toContain("<strong");
    expect(renderTextVariant("em")).toContain("<em");
    expect(renderTextVariant("code")).toContain("<code");
    expect(renderTextVariant("paragraph")).toContain("<p");
  });
});

function renderTextVariant(variant: string) {
  return renderToStaticMarkup(
    <TextReact variant={variant}>
      content
    </TextReact>,
  );
}
