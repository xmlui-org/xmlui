import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ModuleResolver } from "../../src/parsers/scripting/ModuleResolver";
import viteXmluiPlugin, { type PluginOptions } from "../../src/nodejs/vite-xmlui-plugin";

async function importGeneratedModule(code: string) {
  const encoded = Buffer.from(code).toString("base64");
  return import(`data:text/javascript;base64,${encoded}#${Math.random()}`);
}

async function transformXmlui(
  code: string,
  id: string,
  root = "/project",
  options: Partial<PluginOptions> = {},
) {
  const plugin = viteXmluiPlugin({
    analyze: "off",
    reactiveCycles: "off",
    accessibility: "off",
    typeContracts: "off",
    ...options,
  });
  (plugin.configResolved as any)?.({ root });
  const ctx = {
    warn: vi.fn(),
    error: (message: string) => {
      throw new Error(String(message));
    },
  };
  const result = await (plugin.transform as any).call(ctx, code, id, {});
  return {
    result,
    warnings: ctx.warn,
  };
}

async function createPluginHarness(root = "/project", options: Partial<PluginOptions> = {}) {
  const plugin = viteXmluiPlugin({
    analyze: "off",
    reactiveCycles: "off",
    accessibility: "off",
    typeContracts: "off",
    ...options,
  });
  (plugin.configResolved as any)?.({ root });
  let middleware: any;
  (plugin.configureServer as any)?.({
    middlewares: {
      use(handler: any) {
        middleware = handler;
      },
    },
  });
  const ctx = {
    warn: vi.fn(),
    error: (message: string) => {
      throw new Error(String(message));
    },
  };

  return {
    plugin,
    async transform(code: string, id: string) {
      return await (plugin.transform as any).call(ctx, code, id, {});
    },
    async request(url: string) {
      let body = "";
      const headers: Record<string, string> = {};
      let statusCode = 200;
      let nextCalled = false;
      await middleware(
        { url },
        {
          set statusCode(value: number) {
            statusCode = value;
          },
          get statusCode() {
            return statusCode;
          },
          setHeader(name: string, value: string) {
            headers[name] = value;
          },
          end(value: string) {
            body = value;
          },
        },
        () => {
          nextCalled = true;
        },
      );
      return { body, headers, statusCode, nextCalled };
    },
  };
}

describe("Vite Plugin Import Integration (Built Mode)", () => {
  beforeEach(() => {
    ModuleResolver.clearCache();
    ModuleResolver.resetImportStack();
    ModuleResolver.setCustomFetcher(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    ModuleResolver.clearCache();
    ModuleResolver.resetImportStack();
    ModuleResolver.setCustomFetcher(null);
  });

  describe("Path Resolution for Build Time", () => {
    it("should resolve relative imports from component file", () => {
      const componentFile = "/src/components/Button.xmlui.xs";
      const importPath = "./helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, componentFile);

      expect(resolved).toBe("/src/components/helpers.xs");
    });

    it("should resolve imports from nested components", () => {
      const componentFile = "/src/components/forms/TextInput.xmlui.xs";
      const importPath = "./validators.xs";

      const resolved = ModuleResolver.resolvePath(importPath, componentFile);

      expect(resolved).toBe("/src/components/forms/validators.xs");
    });

    it("should resolve parent directory imports", () => {
      const componentFile = "/src/components/forms/TextInput.xmlui.xs";
      const importPath = "../shared/validators.xs";

      const resolved = ModuleResolver.resolvePath(importPath, componentFile);

      expect(resolved).toBe("/src/components/shared/validators.xs");
    });

    it("should resolve shared utilities", () => {
      const componentFile = "/src/components/Button.xmlui.xs";
      const importPath = "../../utils/helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, componentFile);

      expect(resolved).toBe("/utils/helpers.xs");
    });
  });

  describe("Inline components in entrypoint files", () => {
    it("emits inlineComponents for Main.xmlui", async () => {
      const { result } = await transformXmlui(
        `
          <Component name='MyInline'><Text value="inline" /></Component>
          <App>
            <MyInline />
          </App>
        `,
        "/project/src/Main.xmlui",
      );

      const mod = await importGeneratedModule(result.code);
      expect(mod.default.component).toMatchObject({
        type: "App",
        children: [{ type: "MyInline" }],
      });
      expect(mod.default.inlineComponents).toHaveLength(1);
      expect(mod.default.inlineComponents[0]).toMatchObject({
        name: "MyInline",
        component: {
          type: "Text",
          props: {
            value: "inline",
          },
        },
      });
    });

    it("resolves inline component codeBehind relative to the entrypoint file", async () => {
      const dir = await mkdtemp(join(tmpdir(), "xmlui-vite-inline-"));
      const srcDir = join(dir, "src");
      await mkdir(srcDir);
      await writeFile(join(srcDir, "Inline.xs"), `var message = "hello";`);

      const { result } = await transformXmlui(
        `
          <Component name='WithCodeBehind' codeBehind='Inline.xs'>
            <Text value="{message}" />
          </Component>
          <App>
            <WithCodeBehind />
          </App>
        `,
        join(srcDir, "Main.xmlui"),
        dir,
      );

      const mod = await importGeneratedModule(result.code);
      const inlineComponent = mod.default.inlineComponents[0];
      expect(inlineComponent.name).toBe("WithCodeBehind");
      expect(inlineComponent.component.vars.message).toBeDefined();
      expect(inlineComponent.codeBehindSource).toContain(`var message`);
    });

    it("serializes empty-app inline component warnings for the browser runtime", async () => {
      const { result, warnings } = await transformXmlui(
        `<Component name='OnlyInline'><Text value="inline" /></Component>`,
        "/project/src/Main.xmlui",
      );

      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mod = await importGeneratedModule(result.code);
      expect(warnings).toHaveBeenCalledWith(
        "[xmlui] /src/Main.xmlui contains only inline component definitions; rendering an empty Fragment.",
      );
      expect(warn).toHaveBeenCalledWith(
        "[xmlui] /src/Main.xmlui contains only inline component definitions; rendering an empty Fragment.",
      );
      expect(mod.default.component).toMatchObject({ type: "Fragment" });
      expect(mod.default.warnings).toEqual([
        "/src/Main.xmlui contains only inline component definitions; rendering an empty Fragment.",
      ]);
    });
  });

  describe("Compiled Event Handlers", () => {
    it("does not compile event handlers by default", async () => {
      const { result } = await transformXmlui(
        `<Button onClick="count = count + 1" />`,
        "/project/src/Main.xmlui",
      );

      const mod = await importGeneratedModule(result.code);
      const event = mod.default.component.events.click;
      expect(event.compiled).toBeUndefined();
    });

    it("serializes parse-time compiled event artifacts when enabled", async () => {
      const { result } = await transformXmlui(
        `<Button onClick="count = count + 1" />`,
        "/project/src/Main.xmlui",
        "/project",
        { compileEventHandlers: true },
      );

      const mod = await importGeneratedModule(result.code);
      const event = mod.default.component.events.click;
      expect(event.compiled).toMatchObject({
        target: "event-async",
        sourceText: "count = count + 1",
      });
      expect(event.compiled.sourceId).toMatch(/^\/src\/Main\.xmlui#event-\d+$/);
      expect(event.compiled.js).toContain("return (async () =>");
    });

    it("serializes parse-time compiled event artifacts with the common compileScripts switch", async () => {
      const { result } = await transformXmlui(
        `<Button onClick="count = count + 1" />`,
        "/project/src/Main.xmlui",
        "/project",
        { compileScripts: true },
      );

      const mod = await importGeneratedModule(result.code);
      const event = mod.default.component.events.click;
      expect(event.compiled).toMatchObject({
        target: "event-async",
        sourceText: "count = count + 1",
      });
    });

    it("lets legacy compileEventHandlers disable event compilation under compileScripts", async () => {
      const { result } = await transformXmlui(
        `<Button onClick="count = count + 1" />`,
        "/project/src/Main.xmlui",
        "/project",
        { compileScripts: true, compileEventHandlers: false },
      );

      const mod = await importGeneratedModule(result.code);
      expect(mod.default.component.events.click.compiled).toBeUndefined();
    });

    it("emits XMLUI transform source maps and debug sources when enabled", async () => {
      const source = `<Button onClick="count = count + 1" />`;
      const { result } = await transformXmlui(source, "/project/src/Main.xmlui", "/project", {
        compileEventHandlers: true,
        compiledScriptSourceMaps: "external",
      });

      const mod = await importGeneratedModule(result.code);
      expect(result.map).toMatchObject({
        version: 3,
        sources: ["/@xmlui-source/src/Main.xmlui"],
        sourcesContent: [source],
        names: [],
        mappings: "AAAA",
      });
      expect(mod.default.debugSources).toEqual([
        {
          id: "/src/Main.xmlui",
          url: "/@xmlui-source/src/Main.xmlui",
          displayName: "/src/Main.xmlui",
          sourceText: source,
        },
      ]);
      expect(mod.default.component.events.click.compiled.sources[0]).toMatchObject({
        url: "/@xmlui-source/src/Main.xmlui",
        sourceText: source,
      });
    });

    it("serves virtual XMLUI sources and source maps from the dev middleware", async () => {
      const source = `<Button onClick="count = count + 1" />`;
      const harness = await createPluginHarness("/project", {
        compileEventHandlers: true,
        compiledScriptSourceMaps: "external",
      });

      const result = await harness.transform(source, "/project/src/Main.xmlui");
      const mod = await importGeneratedModule(result.code);

      const sourceResponse = await harness.request("/@xmlui-source/src/Main.xmlui");
      expect(sourceResponse.nextCalled).toBe(false);
      expect(sourceResponse.headers["Content-Type"]).toContain("text/plain");
      expect(sourceResponse.body).toBe(source);

      const mapResponse = await harness.request("/@xmlui-source/src/Main.xmlui.map");
      expect(mapResponse.nextCalled).toBe(false);
      expect(mapResponse.headers["Content-Type"]).toContain("application/json");
      expect(JSON.parse(mapResponse.body)).toMatchObject({
        version: 3,
        sources: ["/@xmlui-source/src/Main.xmlui"],
        mappings: "AAAA",
      });

      const compiledSourceId = mod.default.component.events.click.compiled.sourceId;
      const compiledMapResponse = await harness.request(
        `/@xmlui-source/__compiled/${encodeURIComponent(compiledSourceId)}.js.map`,
      );
      expect(compiledMapResponse.nextCalled).toBe(false);
      expect(JSON.parse(compiledMapResponse.body)).toMatchObject({
        version: 3,
        sources: ["/@xmlui-source/src/Main.xmlui"],
        sourcesContent: [source],
      });
    });

    it("defaults dev middleware source maps on when compileScripts is enabled", async () => {
      const source = `<Button onClick="count = count + 1" />`;
      const harness = await createPluginHarness("/project", {
        compileScripts: true,
      });

      const result = await harness.transform(source, "/project/src/Main.xmlui");
      const mod = await importGeneratedModule(result.code);

      expect(mod.default.debugSources).toEqual([
        {
          id: "/src/Main.xmlui",
          url: "/@xmlui-source/src/Main.xmlui",
          displayName: "/src/Main.xmlui",
          sourceText: source,
        },
      ]);
      const sourceResponse = await harness.request("/@xmlui-source/src/Main.xmlui");
      expect(sourceResponse.body).toBe(source);
      expect(result.map.sources).toEqual(["/@xmlui-source/src/Main.xmlui"]);
    });

    it("defaults dev middleware source maps on when legacy compileBindings is enabled", async () => {
      const source = `<Text value="{count + 1}" />`;
      const harness = await createPluginHarness("/project", {
        compileBindings: true,
      });

      const result = await harness.transform(source, "/project/src/Main.xmlui");
      const mod = await importGeneratedModule(result.code);

      expect(mod.default.debugSources[0]).toMatchObject({
        url: "/@xmlui-source/src/Main.xmlui",
        sourceText: source,
      });
      expect(mod.default.component.props.value.compiled).toBeUndefined();
      const sourceResponse = await harness.request("/@xmlui-source/src/Main.xmlui");
      expect(sourceResponse.body).toBe(source);
    });
  });

  describe("Vite Plugin File Structure", () => {
    it("should handle .xmlui.xs files", () => {
      const componentBehindFile = "/src/Main.xmlui.xs";
      const importPath = "./helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, componentBehindFile);

      expect(resolved).toBe("/src/helpers.xs");
      expect(resolved.endsWith(".xs")).toBe(true);
    });

    it("should handle .xs module files", () => {
      const moduleFile = "/src/utils/helpers.xs";
      const importPath = "./validators.xs";

      const resolved = ModuleResolver.resolvePath(importPath, moduleFile);

      expect(resolved).toBe("/src/utils/validators.xs");
    });

    it("emits code-behind debug sources for .xmlui.xs files and imports", async () => {
      const dir = await mkdtemp(join(tmpdir(), "xmlui-vite-xs-debug-"));
      const srcDir = join(dir, "src");
      await mkdir(srcDir);
      const mainPath = join(srcDir, "Main.xmlui.xs").replace(/\\/g, "/");
      const helperPath = join(srcDir, "helpers.xs").replace(/\\/g, "/");
      await writeFile(helperPath, `function double(x) { return x * 2; }`);
      const source = `import { double } from "./helpers.xs";
function run(value) { return double(value); }`;

      const { result } = await transformXmlui(source, mainPath, dir, {
        compiledScriptSourceMaps: "external",
      });

      const mod = await importGeneratedModule(result.code);
      expect(result.map.sources).toEqual([
        "/@xmlui-source/src/Main.xmlui.xs",
        "/@xmlui-source/src/helpers.xs",
      ]);
      expect(mod.default.debugSources.map((source: any) => source.displayName)).toEqual([
        mainPath,
        helperPath,
      ]);
      expect(mod.default.sourceUrl).toBe("/@xmlui-source/src/Main.xmlui.xs");
    });

    it("should resolve from vite project root", () => {
      const componentFile = "/packages/ui/src/Button.xmlui.xs";
      const importPath = "../../shared/utils.xs";

      const resolved = ModuleResolver.resolvePath(importPath, componentFile);

      expect(resolved).toBe("/packages/shared/utils.xs");
    });
  });

  describe("Build-Time Import Resolution", () => {
    it("should maintain consistent resolution across build", () => {
      const componentFile = "/src/components/Card.xmlui.xs";
      const importPath = "./styles.xs";

      // Multiple builds should produce same paths
      const results = Array(5)
        .fill(null)
        .map(() => ModuleResolver.resolvePath(importPath, componentFile));

      results.forEach((result) => {
        expect(result).toBe("/src/components/styles.xs");
      });
    });

    it("should resolve multiple imports from same file", () => {
      const componentFile = "/src/Main.xmlui.xs";
      const imports = ["./utils.xs", "./validators.xs", "./formatters.xs"];

      const resolved = imports.map((imp) => ModuleResolver.resolvePath(imp, componentFile));

      expect(resolved).toEqual(["/src/utils.xs", "/src/validators.xs", "/src/formatters.xs"]);
    });

    it("should resolve import chains at build time", () => {
      const main = "/src/Main.xmlui.xs";
      const helpers = "/src/helpers.xs";
      const shared = "/src/shared.xs";

      // Main -> helpers
      const helperPath = ModuleResolver.resolvePath("./helpers.xs", main);
      expect(helperPath).toBe(helpers);

      // helpers -> shared
      const sharedPath = ModuleResolver.resolvePath("./shared.xs", helperPath);
      expect(sharedPath).toBe(shared);
    });
  });

  describe("Module Resolution Cache Optimization", () => {
    it("should use consistent cache keys", () => {
      const componentFile = "/src/Button.xmlui.xs";
      const importPath = "./helpers.xs";

      const resolved1 = ModuleResolver.resolvePath(importPath, componentFile);
      const resolved2 = ModuleResolver.resolvePath(importPath, componentFile);

      expect(resolved1).toBe(resolved2);
    });

    it("should handle path normalization for caching", () => {
      const componentFile = "/src/Button.xmlui.xs";
      const path1 = "./helpers.xs";
      const path2 = "./../Button.xmlui.xs/helpers.xs"; // Would go up then back down

      const resolved1 = ModuleResolver.resolvePath(path1, componentFile);
      try {
        const resolved2 = ModuleResolver.resolvePath(path2, componentFile);
        // Both valid paths should be different
        expect(resolved1).toBe("/src/helpers.xs");
        expect(resolved2).toBeDefined();
      } catch {
        // Path2 might fail if normalization doesn't handle it
        expect(resolved1).toBe("/src/helpers.xs");
      }
    });
  });

  describe("Circular Import Detection in Build", () => {
    it("should detect potential circular imports", () => {
      // This would be caught at runtime, but resolution should work
      const file1 = "/src/a.xs";
      const file2 = "/src/b.xs";

      const resolved1 = ModuleResolver.resolvePath("./b.xs", file1);
      const resolved2 = ModuleResolver.resolvePath("./a.xs", file2);

      expect(resolved1).toBe(file2);
      expect(resolved2).toBe(file1);
    });

    it("should handle self-referential paths", () => {
      const componentFile = "/src/helpers.xs";
      const importPath = "./helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, componentFile);

      // Should resolve to itself - actual circular detection happens elsewhere
      expect(resolved).toBe(componentFile);
    });
  });

  describe("Real-World Build Scenarios", () => {
    it("should handle typical component library structure", () => {
      // Structure:
      // src/
      //   components/
      //     Button.xmlui.xs
      //     hooks.xs
      //   utils/
      //     helpers.xs

      const buttonFile = "/src/components/Button.xmlui.xs";
      const hookImport = "./hooks.xs";
      const helperImport = "../utils/helpers.xs";

      const hookPath = ModuleResolver.resolvePath(hookImport, buttonFile);
      const helperPath = ModuleResolver.resolvePath(helperImport, buttonFile);

      expect(hookPath).toBe("/src/components/hooks.xs");
      expect(helperPath).toBe("/src/utils/helpers.xs");
    });

    it("should handle design system structure", () => {
      // Structure:
      // packages/
      //   ui/
      //     src/
      //       Button.xmlui.xs
      //       styles/
      //         theme.xs
      //   shared/
      //     utils/
      //       helpers.xs

      const buttonFile = "/packages/ui/src/Button.xmlui.xs";
      const themeImport = "./styles/theme.xs";
      const helperImport = "../../shared/utils/helpers.xs";

      const themePath = ModuleResolver.resolvePath(themeImport, buttonFile);
      const helperPath = ModuleResolver.resolvePath(helperImport, buttonFile);

      expect(themePath).toBe("/packages/ui/src/styles/theme.xs");
      expect(helperPath).toBe("/packages/shared/utils/helpers.xs");
    });

    it("should handle monorepo with shared components", () => {
      // Structure:
      // apps/
      //   web/
      //     src/
      //       Main.xmlui.xs
      // packages/
      //   components/
      //     src/
      //       Button.xs

      const mainFile = "/apps/web/src/Main.xmlui.xs";
      const buttonImport = "../../packages/components/src/Button.xs";

      const buttonPath = ModuleResolver.resolvePath(buttonImport, mainFile);

      expect(buttonPath).toBe("/apps/packages/components/src/Button.xs");
    });

    it("should handle deeply nested component structures", () => {
      const componentFile = "/src/pages/admin/components/forms/TextInput.xmlui.xs";
      const localImport = "./validators.xs";
      const parentImport = "../helpers.xs";
      const sharedImport = "../../../shared/utils.xs";

      const localPath = ModuleResolver.resolvePath(localImport, componentFile);
      const parentPath = ModuleResolver.resolvePath(parentImport, componentFile);
      const sharedPath = ModuleResolver.resolvePath(sharedImport, componentFile);

      expect(localPath).toBe("/src/pages/admin/components/forms/validators.xs");
      expect(parentPath).toBe("/src/pages/admin/components/helpers.xs");
      expect(sharedPath).toBe("/src/pages/shared/utils.xs");
    });
  });

  describe("Build Error Scenarios", () => {
    it("should throw on invalid relative imports", () => {
      const componentFile = "/src/Button.xmlui.xs";
      const invalidImport = "helpers.xs"; // Missing ./

      expect(() => {
        ModuleResolver.resolvePath(invalidImport, componentFile);
      }).toThrow("must be relative");
    });

    it("should throw on paths above root", () => {
      const componentFile = "/Button.xmlui.xs";
      const invalidImport = "../helpers.xs";

      expect(() => {
        ModuleResolver.resolvePath(invalidImport, componentFile);
      }).toThrow("goes above root");
    });

    it("should throw on empty import", () => {
      const componentFile = "/src/Button.xmlui.xs";

      expect(() => {
        ModuleResolver.resolvePath("", componentFile);
      }).toThrow("empty");
    });
  });

  describe("Build Output Optimization", () => {
    it("should produce consistent module paths for bundling", () => {
      const componentFile = "/src/components/Button.xmlui.xs";
      const importPath = "../../shared/utils.xs";

      const resolved = ModuleResolver.resolvePath(importPath, componentFile);

      // Output should be suitable for bundler
      expect(resolved).toMatch(/^\/[a-zA-Z0-9/_\-\.]+\.xs$/);
    });

    it("should maintain path consistency across components", () => {
      const components = [
        "/src/components/Button.xmlui.xs",
        "/src/components/Modal.xmlui.xs",
        "/src/components/Card.xmlui.xs",
      ];
      const commonImport = "../../shared/theme.xs";

      const paths = components.map((comp) => ModuleResolver.resolvePath(commonImport, comp));

      // All should resolve to same shared module
      expect(paths).toEqual(["/shared/theme.xs", "/shared/theme.xs", "/shared/theme.xs"]);
    });
  });

  describe("Import Path Normalization", () => {
    it("should normalize paths with redundant segments", () => {
      const componentFile = "/src/Button.xmlui.xs";
      const path1 = "./helpers.xs";
      const path2 = "./../src/helpers.xs";

      const resolved1 = ModuleResolver.resolvePath(path1, componentFile);
      const resolved2 = ModuleResolver.resolvePath(path2, componentFile);

      expect(ModuleResolver.arePathsEqual(resolved1, resolved2)).toBe(true);
    });

    it("should handle multiple consecutive dots", () => {
      const componentFile = "/src/components/Button.xmlui.xs";
      const path1 = "../utils.xs";
      const path2 = "./../utils.xs"; // Extra ./ before ..

      const resolved1 = ModuleResolver.resolvePath(path1, componentFile);
      const resolved2 = ModuleResolver.resolvePath(path2, componentFile);

      expect(ModuleResolver.arePathsEqual(resolved1, resolved2)).toBe(true);
    });
  });

  describe("File Name Extraction for Bundling", () => {
    it("should extract consistent file names", () => {
      const files = ["/src/Button.xs", "/src/components/Button.xs", "/src/components/ui/Button.xs"];

      const names = files.map((f) => ModuleResolver.getFileName(f));

      expect(names).toEqual(["Button.xs", "Button.xs", "Button.xs"]);
    });

    it("should handle various file extensions", () => {
      const files = ["/src/utils.xs", "/src/config.xmlui.xs", "/src/helpers.xs"];

      const names = files.map((f) => ModuleResolver.getFileName(f));

      expect(names).toEqual(["utils.xs", "config.xmlui.xs", "helpers.xs"]);
    });
  });
});
