import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { parseXmlui } from "../../compiler/parseXmlui";
import { builtInComponentContracts } from "../../compiler/contracts";
import { buttonRenderer } from "./Button";
import { componentTransferModules } from "../../component-core";
import { createRenderContext } from "../../runtime/rendering/renderer";
import { XmluiThemeRoot } from "../../runtime/rendering/theme";
import {
  createRuntimeScope,
  createRuntimeStateStore,
} from "../../runtime/state";

describe("Button migration", () => {
  it("uses source-adjacent metadata, renderer, defaults, styles, docs, and runnable tests", () => {
    const buttonModule = componentTransferModules.find((component) => component.name === "Button");
    const buttonContract = builtInComponentContracts.find((contract) => contract.name === "Button");

    expect(buttonModule?.status).toBe("transferred-folder");
    expect(buttonModule?.contract).toBe(buttonContract);
    expect(buttonModule?.renderer).toBe(buttonRenderer);
    expect(buttonModule?.sources.implementation).toContain("xmlui/src/components/Button/ButtonReact.tsx");
    expect(buttonModule?.sources.metadata).toContain("xmlui/src/components/Button/Button.tsx");
    expect(buttonModule?.sources.defaults).toContain("xmlui/src/components/Button/Button.defaults.ts");
    expect(buttonModule?.sources.styles).toContain("xmlui/src/components/Button/Button.module.scss");
    expect(buttonModule?.sources.docs).toContain("xmlui/src/components/Button/Button.md");
  });

  it("renders old-compatible class composition and theme-variable plumbing", () => {
    const document = parseXmlui(`<App><Button>Click me</Button></App>`);
    const button = document.root.children[0];
    if (button.kind !== "element") {
      throw new Error("Expected Button element.");
    }
    const store = createRuntimeStateStore();
    const scope = createRuntimeScope({ store });
    const context = createRenderContext({}, {});
    const ButtonRenderer = buttonRenderer;

    const html = renderToStaticMarkup(
      <XmluiThemeRoot>
        <ButtonRenderer context={context} node={button} scope={scope} />
      </XmluiThemeRoot>,
    );

    expect(html).toContain('data-xmlui-component="Button"');
    expect(html).toContain('class="button buttonHorizontal sm solidPrimary xmlui-Button"');
    expect(html).toContain("--xmlui-width-Button:fit-content");
    expect(html).toContain("--xmlui-backgroundColor-Button-primary:var(--xmlui-color-primary-500)");
    expect(html).toContain("--xmlui-textColor-Button-solid:var(--xmlui-const-color-surface-50)");
    expect(html).toContain("--xmlui-paddingHorizontal-Button-sm:var(--xmlui-space-4)");
    expect(html).toContain("--xmlui-paddingVertical-Button-sm:var(--xmlui-space-2)");
    expect(html).toContain("Click me");
  });
});
