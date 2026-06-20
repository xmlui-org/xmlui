import { describe, expect, it } from "vitest";

import {
  builtInComponentRenderers,
  componentTransferModules,
  getComponentTransferModule,
  runtimeComponentModules,
} from "../../src/component-core";

describe("component transfer registry", () => {
  it("exposes runtime renderers through component modules", () => {
    const button = getComponentTransferModule("Button");

    expect(button?.name).toBe("Button");
    expect(button?.status).toBe("transferred-folder");
    expect(button?.sources.oldFolder).toBe("/Users/dotneteer/source/xmlui/xmlui/src/components/Button");
    expect(button?.sources.rewriteFolder).toBe("xmlui/src/components/Button");
    expect(button?.sources.implementation).toContain("xmlui/src/components/Button/ButtonReact.tsx");
    expect(button?.sources.metadata).toContain("xmlui/src/components/Button/Button.tsx");
    expect(button?.sources.styles).toContain("xmlui/src/components/Button/Button.module.scss");
    expect(button?.transferredTests?.runnablePaths).toContain("xmlui/src/components/Button/Button.spec.tsx");
    expect(button?.transferredTests?.runnablePaths).toContain("xmlui/src/components/Button/Button-style.spec.ts");
    expect(runtimeComponentModules.map((component) => component.name)).toContain("Button");
    expect(builtInComponentRenderers.Button).toBe(button?.renderer);
  });

  it("keeps compiler contracts and component transfer modules aligned", () => {
    const moduleNames = componentTransferModules.map((component) => component.name);

    expect(moduleNames).toContain("App");
    expect(moduleNames).toContain("Button");
    expect(moduleNames).toContain("DataSource");
    expect(new Set(moduleNames).size).toBe(moduleNames.length);

    for (const component of componentTransferModules) {
      expect(component.contract.name).toBe(component.name);
      expect(component.sources.metadata).toContain("xmlui/src/compiler/contracts/builtins.ts");
      expect(component.docs?.path).toMatch(/^xmlui\/src\/components\/.+\/.+\.md$/);
    }
  });

  it("maps shortcut component tags to their original component folder", () => {
    const heading = getComponentTransferModule("H1");

    expect(heading?.sources.oldFolder).toBe("/Users/dotneteer/source/xmlui/xmlui/src/components/Heading");
    expect(heading?.sources.rewriteFolder).toBe("xmlui/src/components/Heading");
    expect(heading?.docs?.path).toBe("xmlui/src/components/Heading/H1.md");
  });
});
