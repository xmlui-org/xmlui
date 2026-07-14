import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { parseXmlui } from "../../compiler/parseXmlui";
import { builtInComponentContracts } from "../../compiler/contracts";
import { componentTransferModules } from "../../component-core";
import { createRenderContext } from "../../runtime/rendering/renderer";
import { StyleProvider } from "../../components-core/theming/StyleContext";
import { XmluiThemeProvider } from "../../components-core/theming/ThemeContext";
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
      <StyleProvider>
        <XmluiThemeProvider>
          <TextRenderer context={context} node={text} scope={scope} />
        </XmluiThemeProvider>
      </StyleProvider>,
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

  it("preserves source whitespace before nested inline Text children", () => {
    const document = parseXmlui(`
      <App>
        <Text fontWeight="400">
          This site is an
          <Text variant="strong">
            XMLUI™
          </Text>
          app.
        </Text>
      </App>
    `);
    const text = document.root.children[0];
    if (text.kind !== "element") {
      throw new Error("Expected Text element.");
    }
    const store = createRuntimeStateStore();
    const scope = createRuntimeScope({ store });
    const context = createRenderContext({ Text: textRenderer }, {});
    const TextRenderer = textRenderer;

    const html = renderToStaticMarkup(
      <StyleProvider>
        <XmluiThemeProvider>
          <TextRenderer context={context} node={text} scope={scope} />
        </XmluiThemeProvider>
      </StyleProvider>,
    );

    expect(html).toContain("This site is an <strong");
    expect(html).toContain("XMLUI™</strong> app.");
    expect(html).not.toContain("an<strong");
    expect(html).not.toContain("</strong>app.");
  });

  it("preserves source whitespace between nested inline elements with expression text", () => {
    const document = parseXmlui(`
      <App>
        <Text fontSize="$fontSize-lg">
          {$props.children}
          <Text variant="strong" fontSize="$fontSize-lg">
            {$props.title}
          </Text>
          <Slot>
            {$props.benefit}
          </Slot>
        </Text>
      </App>
    `);
    const text = document.root.children[0];
    if (text.kind !== "element") {
      throw new Error("Expected Text element.");
    }
    const store = createRuntimeStateStore();
    const scope = createRuntimeScope({
      store,
      props: {
        children: "Build faster with",
        title: "XMLUI",
        benefit: "today.",
      },
    });
    const context = createRenderContext({ Text: textRenderer }, {});
    const TextRenderer = textRenderer;

    const html = renderToStaticMarkup(
      <StyleProvider>
        <XmluiThemeProvider>
          <TextRenderer context={context} node={text} scope={scope} />
        </XmluiThemeProvider>
      </StyleProvider>,
    );

    expect(html).toContain("Build faster with <strong");
    expect(html).toContain("XMLUI</strong> today.");
    expect(html).not.toContain("with<strong");
    expect(html).not.toContain("</strong>today.");
  });
});

function renderTextVariant(variant: string) {
  return renderToStaticMarkup(
    <StyleProvider>
      <TextReact variant={variant}>content</TextReact>
    </StyleProvider>,
  );
}
