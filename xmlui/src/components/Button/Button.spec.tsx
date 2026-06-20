import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { parseXmlui } from "../../compiler/parseXmlui";
import { Button as ButtonReact } from "./ButtonReact";
import { buttonContract, buttonRenderer } from "./Button";
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

    expect(buttonModule?.status).toBe("transferred-folder");
    expect(buttonModule?.contract).toBe(buttonContract);
    expect(buttonModule?.renderer).toBe(buttonRenderer);
    expect(buttonModule?.sources.implementation).toContain("xmlui/src/components/Button/ButtonReact.tsx");
    expect(buttonModule?.sources.metadata).toContain("xmlui/src/components/Button/Button.tsx");
    expect(buttonModule?.sources.defaults).toContain("xmlui/src/components/Button/Button.defaults.ts");
    expect(buttonModule?.sources.styles).toContain("xmlui/src/components/Button/Button.module.scss");
    expect(buttonModule?.sources.docs).toContain("xmlui/src/components/Button/Button.md");
  });

  it("renders default old-compatible fit-content primary solid styling", () => {
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
    expect(html).toContain("width:fit-content");
    expect(html).toContain("background:var(--xmlui-color-primary-500)");
    expect(html).toContain("color:var(--xmlui-const-color-surface-50)");
    expect(html).toContain("padding:var(--xmlui-space-2) var(--xmlui-space-4)");
    expect(html).toContain("Click me");
  });
});

describe("Button old theme-variable compatibility", () => {
  const themeColors = ["primary", "secondary", "attention"];
  const variants = ["solid", "outlined", "ghost"];

  for (const themeColor of themeColors) {
    it(`uses old solid background theme variable for ${themeColor}`, () => {
      const html = renderButton({
        variant: "solid",
        themeColor,
        themeVariables: {
          [`backgroundColor-Button-${themeColor}-solid`]: "rgb(255, 0, 0)",
        },
      });

      expect(html).toContain("background:rgb(255, 0, 0)");
    });
  }

  for (const variant of variants) {
    for (const themeColor of themeColors) {
      it(`uses old content color theme variable for ${themeColor} ${variant}`, () => {
        const html = renderButton({
          variant,
          themeColor,
          themeVariables: {
            [`textColor-Button-${themeColor}-${variant}`]: "rgb(255, 255, 255)",
          },
        });

        expect(html).toContain("color:rgb(255, 255, 255)");
      });

      it(`uses old font theme variables for ${themeColor} ${variant}`, () => {
        const html = renderButton({
          variant,
          themeColor,
          themeVariables: {
            [`fontFamily-Button-${themeColor}-${variant}`]: "Arial, sans-serif",
            [`fontSize-Button-${themeColor}-${variant}`]: "20px",
            [`fontWeight-Button-${themeColor}-${variant}`]: "200",
          },
        });

        expect(html).toContain("font-family:Arial, sans-serif");
        expect(html).toContain("font-size:20px");
        expect(html).toContain("font-weight:200");
      });
    }
  }

  for (const variant of ["solid", "outlined"]) {
    for (const themeColor of themeColors) {
      it(`uses old border longhand theme variables for ${themeColor} ${variant}`, () => {
        const html = renderButton({
          variant,
          themeColor,
          themeVariables: {
            [`borderColor-Button-${themeColor}-${variant}`]: "rgb(255, 0, 0)",
            [`borderWidth-Button-${themeColor}-${variant}`]: "5px",
            [`borderRadius-Button-${themeColor}-${variant}`]: "10px",
            [`borderStyle-Button-${themeColor}-${variant}`]: "dotted",
          },
        });

        expect(html).toContain("border-width:5px");
        expect(html).toContain("border-style:dotted");
        expect(html).toContain("border-color:rgb(255, 0, 0)");
        expect(html).toContain("border-radius:10px");
      });

      it(`keeps old border shorthand override shape for ${themeColor} ${variant}`, () => {
        const html = renderButton({
          variant,
          themeColor,
          themeVariables: {
            [`border-Button-${themeColor}-${variant}`]: "dotted rgb(255, 0, 0) 5px",
            [`borderColor-Button-${themeColor}-${variant}`]: "rgb(0, 128, 0)",
            [`borderStyle-Button-${themeColor}-${variant}`]: "double",
          },
        });

        expect(html).toContain("border-width:5px");
        expect(html).toContain("border-style:double");
        expect(html).toContain("border-color:rgb(0, 128, 0)");
      });
    }
  }

  for (const themeColor of themeColors) {
    it(`uses old ghost border size theme variables for ${themeColor}`, () => {
      const html = renderButton({
        variant: "ghost",
        themeColor,
        themeVariables: {
          [`borderWidth-Button-${themeColor}-ghost`]: "5px",
          [`borderRadius-Button-${themeColor}-ghost`]: "10px",
        },
      });

      expect(html).toContain("border-width:5px");
      expect(html).toContain("border-radius:10px");
    });
  }
});

function renderButton({
  variant,
  themeColor,
  themeVariables,
}: {
  variant: string;
  themeColor: string;
  themeVariables: Record<string, unknown>;
}) {
  return renderToStaticMarkup(
    <ButtonReact
      variant={variant}
      themeColor={themeColor}
      themeVariables={themeVariables}
      themeOverrides={themeVariables}
    >
      Button
    </ButtonReact>,
  );
}
