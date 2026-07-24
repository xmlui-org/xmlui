import { describe, expect, it } from "vitest";
import {
  collectImportsFromStandaloneSources,
  collectMissingComponents,
  warnBuiltInComponentNameCollisions,
  warnShadowedLocalComponentFiles,
} from "../../src/components-core/StandaloneApp";
import type { CompoundComponentDef } from "../../src/abstractions/ComponentDefs";
import type { StandaloneAppDescription } from "../../src/components-core/abstractions/standalone";
import type { ProjectCompilation } from "../../src/abstractions/scripting/Compilation";
import { transformSource } from "../parsers/xmlui/xmlui";
import { computeUsesForTree } from "../../src/components-core/optimization/computedUses";
import { xmlUiMarkupToComponent } from "../../src/components-core/xmlui-parser";

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
    const compDef = transformSource(sources["/app/components/MyComp.xmlui"]) as CompoundComponentDef;
    const actualComponent = compDef.component;
    
    // Check initial state: has unresolvable imports
    expect(actualComponent.scriptCollected!.hasUnresolvableImports).toBe(true);

    const appDef: StandaloneAppDescription = {
      sources,
      components: [compDef as any],
    };

    const projectCompilation: ProjectCompilation = {
      entrypoint: {
        filename: "/app/Main.xmlui",
        definition: null as any,
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
      getComponentValidator: () => null,
    };

    // 2. Run the resolution pass
    const resolvedAny = await collectImportsFromStandaloneSources(appDef, projectCompilation, dummyHandler as any);

    // 3. Assertions
    expect(resolvedAny).toBe(true);
    
    const resolvedScript = actualComponent.scriptCollected!;
    expect(resolvedScript.hasUnresolvableImports).toBe(false);
    expect(resolvedScript.functions.myFunc).toBeDefined();

    // 4. Test narrowing
    const dummyMetadataLookup = () => ({}) as any;
    computeUsesForTree(actualComponent, dummyMetadataLookup);
    
    // Narrowing should not be blocked by ownHasScript since hasUnresolvableImports is false
    expect(actualComponent.computedUses).toBeDefined();
    expect(actualComponent.computedUses).toContain("parentVar");
  });

  it("§11: resolving imports enables computedGlobalUses for an imported global-reading helper", async () => {
    const sources = {
      "/app/components/MyComp.xmlui": `
      <Component name="MyComp">
        <Container>
          <script>
            import { publishEvent } from "./shared.xs";
            var a = 1;
          </script>
          <Text value="{publishEvent(a)}"/>
        </Container>
      </Component>
    `,
      "/app/components/shared.xs": `
      function publishEvent(x) { events = events.concat(x); return x; }
    `,
    };

    const compDef = transformSource(sources["/app/components/MyComp.xmlui"]) as CompoundComponentDef;
    const actualComponent = compDef.component;
    expect(actualComponent.scriptCollected!.hasUnresolvableImports).toBe(true);

    const appDef: StandaloneAppDescription = { sources, components: [compDef as any] };
    const projectCompilation: ProjectCompilation = {
      entrypoint: { filename: "/app/Main.xmlui", definition: null as any, dependencies: new Set() },
      components: [
        {
          filename: "/app/components/MyComp.xmlui",
          markupSource: sources["/app/components/MyComp.xmlui"],
          definition: compDef as any,
          dependencies: new Set(),
        },
      ],
      themes: {},
    };
    const dummyHandler = {
      componentRegistered: () => true,
      getComponentProps: () => ({}),
      getComponentEvents: () => ({}),
      acceptArbitraryProps: () => true,
      getComponentValidator: () => null,
    };

    const resolvedAny = await collectImportsFromStandaloneSources(appDef, projectCompilation, dummyHandler as any);
    expect(resolvedAny).toBe(true);
    expect(actualComponent.scriptCollected!.hasUnresolvableImports).toBe(false);
    expect(actualComponent.scriptCollected!.functions.publishEvent).toBeDefined();

    // The crux: optimizer must now credit `events` to computedGlobalUses.
    const dummyMetadataLookup = () => ({}) as any;
    computeUsesForTree(actualComponent, dummyMetadataLookup, new Set(["events", "unrelated"]));

    expect(actualComponent.computedGlobalUses).toBeDefined();
    expect(actualComponent.computedGlobalUses).toContain("events");
    expect(actualComponent.computedGlobalUses).not.toContain("unrelated");
  });

  it("§11: a missing/unresolvable imported module keeps narrowing blocked", async () => {
    const sources = {
      "/app/components/Bad.xmlui": `
      <Component name="Bad">
        <Container>
          <script>
            import { ghost } from "./does-not-exist.xs";
            var a = 1;
          </script>
          <Text value="{ghost(a)}"/>
        </Container>
      </Component>
    `,
      // note: ./does-not-exist.xs intentionally absent from sources
    };
    const compDef = transformSource(sources["/app/components/Bad.xmlui"]) as CompoundComponentDef;
    const actualComponent = compDef.component;
    expect(actualComponent.scriptCollected!.hasUnresolvableImports).toBe(true);

    const appDef: StandaloneAppDescription = { sources, components: [compDef as any] };
    const projectCompilation: ProjectCompilation = {
      entrypoint: { filename: "/app/Main.xmlui", definition: null as any, dependencies: new Set() },
      components: [
        {
          filename: "/app/components/Bad.xmlui",
          markupSource: sources["/app/components/Bad.xmlui"],
          definition: compDef as any,
          dependencies: new Set(),
        },
      ],
      themes: {},
    };
    const dummyHandler = {
      componentRegistered: () => true,
      getComponentProps: () => ({}),
      getComponentEvents: () => ({}),
      acceptArbitraryProps: () => true,
      getComponentValidator: () => null,
    };

    await collectImportsFromStandaloneSources(appDef, projectCompilation, dummyHandler as any);

    // Resolution failed (module not found) → flag stays set, narrowing blocked.
    expect(actualComponent.scriptCollected!.hasUnresolvableImports).toBe(true);
    computeUsesForTree(actualComponent, () => ({}) as any, new Set(["events"]));
    expect(actualComponent.computedGlobalUses).toBeUndefined();
  });
});

describe("standalone inline components", () => {
  it("treats entrypoint inline components as loaded during missing-component discovery", () => {
    const parsed = xmlUiMarkupToComponent(
      `
        <Component name="MyInline">
          <Text value="inline" />
        </Component>
        <App>
          <MyInline />
          <StillMissing />
        </App>
      `,
      "/app/Main.xmlui",
      undefined,
      undefined,
      { role: "entrypoint" },
    );

    const missing = collectMissingComponents(
      parsed.component!,
      parsed.inlineComponents,
      undefined,
      undefined,
    );

    expect(missing.has("MyInline")).toBe(false);
    expect(missing.has("StillMissing")).toBe(true);
  });

  it("keeps component files strict during missing-component discovery", () => {
    const parsed = xmlUiMarkupToComponent(
      `
        <Component name="FileBacked">
          <Text value="file" />
        </Component>
      `,
      "/app/components/FileBacked.xmlui",
    );

    const missing = collectMissingComponents(
      { type: "App", children: [{ type: "FileBacked" }, { type: "StillMissing" }] },
      [parsed.component],
      undefined,
      undefined,
    );

    expect(missing.has("FileBacked")).toBe(false);
    expect(missing.has("StillMissing")).toBe(true);
  });
});

describe("standalone component name collision diagnostics", () => {
  it("warns when a custom component has the same name as a built-in", () => {
    const parsed = xmlUiMarkupToComponent(
      `
        <Component name="Queue">
          <Text value="file-backed Queue" />
        </Component>
      `,
      "/app/components/Queue.xmlui",
    );
    const warnings: string[] = [];

    warnBuiltInComponentNameCollisions(
      [parsed.component as CompoundComponentDef],
      undefined,
      (message) => warnings.push(message),
    );

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('Custom component "Queue"');
    expect(warnings[0]).toContain("built-in component");
  });

  it("warns when a convention component file is shadowed by a built-in", async () => {
    const warnings: string[] = [];

    await warnShadowedLocalComponentFiles(
      { type: "App", children: [{ type: "Queue" }, { type: "Button" }] },
      [],
      async (componentName) => componentName === "Queue",
      undefined,
      (message) => warnings.push(message),
    );

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('components/Queue.xmlui');
    expect(warnings[0]).toContain("was not loaded");
  });
});
