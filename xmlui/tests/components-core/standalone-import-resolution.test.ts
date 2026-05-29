import { describe, expect, it } from "vitest";
import { collectImportsFromStandaloneSources } from "../../src/components-core/StandaloneApp";
import type { ComponentDef, StandaloneAppDescription } from "../../src/abstractions/ComponentDefs";
import type { ProjectCompilation } from "../../src/abstractions/ComponentDefs";
import { transformSource } from "../parsers/xmlui/xmlui";
import { computeUsesForTree } from "../../src/components-core/optimization/computedUses";

describe("collectImportsFromStandaloneSources", () => {
  it("resolves nested imports and enables narrowing", async () => {
    // 1. Create a fake app definition with sources
    const sources = {
      "/app/components/MyComp.xmlui": `
        <Component name="MyComp">
          <Container>
            <script>
              import { myFunc } from "./utils.xs";
              var a = 1;
            </script>
            <Text value="{myFunc(a) + parentVar}"/>
          </Container>
        </Component>
      `,
      "/app/components/utils.xs": `
        function myFunc(x) { return x * 2; }
      `
    };

    // Parse the component (simulating what the parser does)
    const compDef = transformSource(sources["/app/components/MyComp.xmlui"]) as ComponentDef;
    
    // Check initial state: has unresolvable imports
    expect(compDef.component!.scriptCollected!.hasUnresolvableImports).toBe(true);

    const appDef: StandaloneAppDescription = {
      sources,
      components: [compDef as any],
    };

    const projectCompilation: ProjectCompilation = {
      entrypoint: {
        filename: "/app/Main.xmlui",
        definition: null,
        dependencies: new Set(),
      },
      components: [
        {
          filename: "/app/components/MyComp.xmlui",
          markupSource: sources["/app/components/MyComp.xmlui"],
          definition: compDef as any,
          dependencies: new Set(),
        }
      ],
      themes: {},
    };

    const dummyHandler = {
      componentRegistered: () => true,
      getComponentProps: () => ({}),
      getComponentEvents: () => ({}),
      acceptArbitraryProps: () => true,
      getComponentValidator: () => {},
    };

    // 2. Run the resolution pass
    const resolvedAny = await collectImportsFromStandaloneSources(appDef, projectCompilation, dummyHandler);

    // 3. Assertions
    expect(resolvedAny).toBe(true);
    
    const resolvedScript = compDef.component!.scriptCollected!;
    expect(resolvedScript.hasUnresolvableImports).toBe(false);
    expect(resolvedScript.functions.myFunc).toBeDefined();

    // 4. Test narrowing
    const dummyMetadataLookup = () => ({});
    computeUsesForTree(compDef.component!, dummyMetadataLookup);
    
    // Narrowing should not be blocked by ownHasScript since hasUnresolvableImports is false
    const container = compDef.component!;
    expect(container.computedUses).toBeDefined();
    expect(container.computedUses).toContain("parentVar");
  });
});