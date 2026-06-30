import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { parseXmlui } from "../../compiler/parseXmlui";
import { builtInComponentContracts } from "../../compiler/contracts";
import { appRenderer } from "./App";
import { componentTransferModules } from "../../component-core";
import { createRenderContext } from "../../runtime/rendering/renderer";
import { ThemeScope, XmluiThemeRoot } from "../../runtime/rendering/theme";
import {
  createRuntimeScope,
  createRuntimeStateStore,
} from "../../runtime/state";

describe("App main content layout migration", () => {
  it("uses source-adjacent metadata, renderer, defaults, styles, docs, and runnable tests", () => {
    const appModule = componentTransferModules.find((component) => component.name === "App");
    const appContract = builtInComponentContracts.find((contract) => contract.name === "App");

    expect(appModule?.status).toBe("transferred-folder");
    expect(appModule?.contract).toBe(appContract);
    expect(appModule?.renderer).toBe(appRenderer);
    expect(appModule?.sources.implementation).toContain("xmlui/src/components/App/AppReact.tsx");
    expect(appModule?.sources.defaults).toContain("xmlui/src/components/App/App.defaults.ts");
    expect(appModule?.sources.styles).toContain("xmlui/src/components/App/App.module.scss");
    expect(appModule?.sources.docs).toContain("xmlui/src/components/App/App.md");
    expect(appModule?.transferredTests?.runnablePaths).toContain("xmlui/src/components/App/App.spec.tsx");
  });

  it("renders direct content inside the migrated App content and page-content parts", () => {
    const document = parseXmlui(`
      <App testId="app">
        <Text>First item</Text>
        <Text>Second item</Text>
      </App>
    `);
    const store = createRuntimeStateStore();
    const scope = createRuntimeScope({ store });
    const context = createRenderContext({}, {});
    const AppRenderer = appRenderer;
    const html = renderToStaticMarkup(
      <XmluiThemeRoot>
        <ThemeScope
          variables={{
            "paddingHorizontal-content-App": "28px",
            "paddingVertical-content-App": "32px",
            "gap-content-App": "24px",
          }}
        >
          <AppRenderer context={context} node={document.root} scope={scope} />
        </ThemeScope>
      </XmluiThemeRoot>,
    );

    expect(html).toContain('data-xmlui-component="App"');
    expect(html).toContain('data-testid="app"');
    expect(html).toContain('data-xmlui-part="content"');
    expect(html).toContain('data-xmlui-part="pageContent"');
    expect(html).toContain("--xmlui-paddingHorizontal-content-App:28px");
    expect(html).toContain("--xmlui-maxWidth-content-App:var(--xmlui-maxWidth-content)");
    expect(html).toContain("max-width:var(--xmlui-maxWidth-content)");
    expect(html).toContain("First item");
    expect(html).toContain("Second item");
  });

  it("exposes content theme variables as App props", () => {
    const appContract = builtInComponentContracts.find((contract) => contract.name === "App");

    expect(appContract?.props["paddingHorizontal-content-App"]).toBeDefined();
    expect(appContract?.props["paddingVertical-content-App"]).toBeDefined();
    expect(appContract?.props["gap-content-App"]).toBeDefined();
  });
});
