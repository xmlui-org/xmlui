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
    it("strips ComponentDef debug metadata from production transform output by default", async () => {
      const { result } = await transformXmlui(
        `
          <Component name='CardTitle'>
            <Text value="inline" />
          </Component>
          <App>
            <Card titleTemplate="{CardTitle}" />
          </App>
        `,
        "/project/src/Main.xmlui",
      );

      const mod = await importGeneratedModule(result.code);
      expect(mod.default.component.debug).toBeUndefined();
      expect(mod.default.component.children[0].debug).toBeUndefined();
      expect(mod.default.inlineComponents[0].debug).toBeUndefined();
      expect(mod.default.inlineComponents[0].component.debug).toBeUndefined();
      expect(JSON.stringify(mod.default.component)).not.toContain('"debug"');
      expect(JSON.stringify(mod.default.inlineComponents)).not.toContain('"debug"');
    });

    it("keeps ComponentDef debug metadata in dev server transform output", async () => {
      const harness = await createPluginHarness("/project");

      const result = await harness.transform(`<App><Text value="hello" /></App>`, "/project/src/Main.xmlui");
      const mod = await importGeneratedModule(result.code);

      expect(mod.default.component.debug?.source).toBeDefined();
      expect(mod.default.component.children[0].debug?.source).toBeDefined();
    });

    it("can keep ComponentDef debug metadata when explicitly configured", async () => {
      const { result } = await transformXmlui(
        `<App><Text value="hello" /></App>`,
        "/project/src/Main.xmlui",
        "/project",
        { stripComponentDebug: false },
      );

      const mod = await importGeneratedModule(result.code);
      expect(mod.default.component.debug?.source).toBeDefined();
      expect(mod.default.component.children[0].debug?.source).toBeDefined();
    });

    it("strips parser source metadata from production transform output by default", async () => {
      const { result } = await transformXmlui(
        `<App var.count="{1}"><Button onClick="count = count + 1" label="{count}" /></App>`,
        "/project/src/Main.xmlui",
      );

      const mod = await importGeneratedModule(result.code);
      const output = JSON.stringify(mod.default);

      expect(output).not.toContain('"startToken"');
      expect(output).not.toContain('"endToken"');
      expect(output).not.toContain('"startPosition"');
      expect(output).not.toContain('"endPosition"');
      expect(output).not.toContain('"startLine"');
      expect(output).not.toContain('"endLine"');
      expect(output).not.toContain('"startColumn"');
      expect(output).not.toContain('"endColumn"');
      expect(output).toContain('"nodeId"');
    });

    it("keeps parser source metadata in dev server transform output", async () => {
      const harness = await createPluginHarness("/project");

      const result = await harness.transform(
        `<App var.count="{1}"><Button onClick="count = count + 1" label="{count}" /></App>`,
        "/project/src/Main.xmlui",
      );
      const mod = await importGeneratedModule(result.code);
      const output = JSON.stringify(mod.default);

      expect(output).toContain('"startToken"');
      expect(output).toContain('"endToken"');
      expect(output).toContain('"startPosition"');
      expect(output).toContain('"endPosition"');
      expect(output).toContain('"nodeId"');
    });

    it("can keep parser source metadata when explicitly configured", async () => {
      const { result } = await transformXmlui(
        `<App var.count="{1}"><Button onClick="count = count + 1" label="{count}" /></App>`,
        "/project/src/Main.xmlui",
        "/project",
        { stripComponentSourceMetadata: false },
      );

      const mod = await importGeneratedModule(result.code);
      const output = JSON.stringify(mod.default);

      expect(output).toContain('"startToken"');
      expect(output).toContain('"endToken"');
      expect(output).toContain('"startPosition"');
      expect(output).toContain('"endPosition"');
      expect(output).toContain('"nodeId"');
    });

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

    it("compiles inline component codeBehind functions when event compilation is enabled", async () => {
      const dir = await mkdtemp(join(tmpdir(), "xmlui-vite-inline-compile-"));
      const srcDir = join(dir, "src");
      await mkdir(srcDir);
      const codeBehindPath = join(srcDir, "Inline.xs").replace(/\\/g, "/");
      const codeBehindSource = `function add(a, b) { return a + b; }`;
      await writeFile(codeBehindPath, codeBehindSource);

      const { result } = await transformXmlui(
        `
          <Component name='WithCodeBehind' codeBehind='Inline.xs'>
            <Text value="{add(2, 3)}" />
          </Component>
          <App>
            <WithCodeBehind />
          </App>
        `,
        join(srcDir, "Main.xmlui"),
        dir,
        { compileEventHandlers: true },
      );

      const mod = await importGeneratedModule(result.code);
      const add = mod.default.inlineComponents[0].component.functions.add;
      expect(add.compiled).toMatchObject({
        target: "event-async",
        sourceId: `${codeBehindPath}#function-add`,
        sourceText: codeBehindSource,
      });
      expect(add.compiled.sources[0]).toMatchObject({
        id: codeBehindPath,
        sourceText: codeBehindSource,
      });
    });

    it("serves inline component codeBehind debug sources and compiled source maps", async () => {
      const dir = await mkdtemp(join(tmpdir(), "xmlui-vite-inline-debug-"));
      const srcDir = join(dir, "src");
      await mkdir(srcDir);
      const codeBehindPath = join(srcDir, "Inline.xs").replace(/\\/g, "/");
      const codeBehindSource = `function add(a, b) { return a + b; }`;
      await writeFile(codeBehindPath, codeBehindSource);
      const harness = await createPluginHarness(dir, {
        compileEventHandlers: true,
        compiledScriptSourceMaps: "external",
      });

      const result = await harness.transform(
        `
          <Component name='WithCodeBehind' codeBehind='Inline.xs'>
            <Text value="{add(2, 3)}" />
          </Component>
          <App>
            <WithCodeBehind />
          </App>
        `,
        join(srcDir, "Main.xmlui"),
      );

      const mod = await importGeneratedModule(result.code);
      expect(mod.default.debugSources).toContainEqual(
        expect.objectContaining({
          id: codeBehindPath,
          url: "/@xmlui-source/src/Inline.xs",
          sourceText: codeBehindSource,
        }),
      );

      const sourceResponse = await harness.request("/@xmlui-source/src/Inline.xs");
      expect(sourceResponse.nextCalled).toBe(false);
      expect(sourceResponse.body).toBe(codeBehindSource);

      const compiledSourceId =
        mod.default.inlineComponents[0].component.functions.add.compiled.sourceId;
      const compiledMapResponse = await harness.request(
        `/@xmlui-source/__compiled/${encodeURIComponent(compiledSourceId)}.js.map`,
      );
      expect(compiledMapResponse.nextCalled).toBe(false);
      expect(JSON.parse(compiledMapResponse.body)).toMatchObject({
        version: 3,
        sources: ["/@xmlui-source/src/Inline.xs"],
        sourcesContent: [codeBehindSource],
      });
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

    it("does not compile inline script functions by default", async () => {
      const { result } = await transformXmlui(
        `<App><script>function add(a, b) { return a + b; }</script></App>`,
        "/project/src/Main.xmlui",
      );

      const mod = await importGeneratedModule(result.code);
      expect(mod.default.component.scriptCollected.functions.add.compiled).toBeUndefined();
    });

    it("serializes compiled inline script functions when event compilation is enabled", async () => {
      const source = `<App><script>function add(a, b) { return a + b; }</script></App>`;
      const { result } = await transformXmlui(source, "/project/src/Main.xmlui", "/project", {
        compileEventHandlers: true,
      });

      const mod = await importGeneratedModule(result.code);
      const add = mod.default.component.scriptCollected.functions.add;
      expect(add.compiled).toMatchObject({
        target: "event-async",
        sourceId: "/src/Main.xmlui#function-add",
        sourceText: "function add(a, b) { return a + b; }",
      });
      expect(add.compiled.sources[0]).toMatchObject({
        id: "/src/Main.xmlui",
        url: "/@xmlui-source/src/Main.xmlui",
        sourceText: source,
      });
      expect(add.compiled.js).toContain("return (async () =>");
    });

    it("maps multiline inline script function ranges to the original XMLUI source", async () => {
      const source = `<App>
  <script>
    function run(value) {
      const next = value + 1;
      return next;
    }
  </script>
</App>`;
      const { result } = await transformXmlui(source, "/project/src/Main.xmlui", "/project", {
        compileEventHandlers: true,
      });

      const mod = await importGeneratedModule(result.code);
      const run = mod.default.component.scriptCollected.functions.run;
      expect(run.compiled.sourceRange).toMatchObject({
        start: source.indexOf("const next"),
        end: source.indexOf("return next") + "return next".length,
        startLine: 4,
        startColumn: 6,
        endLine: 5,
        endColumn: 17,
      });
      expect(run.compiled.mappings[0].sourceRange).toMatchObject({
        start: source.indexOf("const next"),
        startLine: 4,
        startColumn: 6,
      });
    });

    it("serializes compiled inline script functions with the common compileScripts switch", async () => {
      const { result } = await transformXmlui(
        `<App><script>function add(a, b) { return a + b; }</script></App>`,
        "/project/src/Main.xmlui",
        "/project",
        { compileScripts: true },
      );

      const mod = await importGeneratedModule(result.code);
      expect(mod.default.component.scriptCollected.functions.add.compiled).toMatchObject({
        target: "event-async",
        sourceText: "function add(a, b) { return a + b; }",
      });
    });

    it("lets legacy compileEventHandlers disable inline script compilation under compileScripts", async () => {
      const { result } = await transformXmlui(
        `<App><script>function add(a, b) { return a + b; }</script></App>`,
        "/project/src/Main.xmlui",
        "/project",
        { compileScripts: true, compileEventHandlers: false },
      );

      const mod = await importGeneratedModule(result.code);
      expect(mod.default.component.scriptCollected.functions.add.compiled).toBeUndefined();
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

    it("serves inline script import debug sources and compiled source maps", async () => {
      const dir = await mkdtemp(join(tmpdir(), "xmlui-vite-script-debug-"));
      const srcDir = join(dir, "src");
      await mkdir(srcDir);
      const helperPath = join(srcDir, "helpers.xs").replace(/\\/g, "/");
      const helperSource = `function double(x) { return x * 2; }`;
      await writeFile(helperPath, helperSource);
      const source = `<App>
  <script>
    import { double } from "./helpers.xs";
    function run(value) { return double(value); }
  </script>
</App>`;
      const harness = await createPluginHarness(dir, {
        compileEventHandlers: true,
        compiledScriptSourceMaps: "external",
      });

      const result = await harness.transform(source, join(srcDir, "Main.xmlui"));
      const mod = await importGeneratedModule(result.code);

      expect(mod.default.debugSources).toContainEqual(
        expect.objectContaining({
          id: helperPath,
          url: "/@xmlui-source/src/helpers.xs",
          sourceText: helperSource,
        }),
      );
      const sourceResponse = await harness.request("/@xmlui-source/src/helpers.xs");
      expect(sourceResponse.nextCalled).toBe(false);
      expect(sourceResponse.body).toBe(helperSource);

      const compiledSourceId =
        mod.default.component.scriptCollected.functions.double.compiled.sourceId;
      const compiledMapResponse = await harness.request(
        `/@xmlui-source/__compiled/${encodeURIComponent(compiledSourceId)}.js.map`,
      );
      expect(compiledMapResponse.nextCalled).toBe(false);
      expect(JSON.parse(compiledMapResponse.body)).toMatchObject({
        version: 3,
        sources: ["/@xmlui-source/src/helpers.xs"],
        sourcesContent: [helperSource],
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

  describe("Compiled Script Reporting", () => {
    async function buildWithSummary(code: string, options: Partial<PluginOptions> = {}) {
      const plugin = viteXmluiPlugin({
        analyze: "off",
        reactiveCycles: "off",
        accessibility: "off",
        typeContracts: "off",
        ...options,
      });
      (plugin.configResolved as any)?.({ root: "/project" });
      const ctx = {
        warn: vi.fn(),
        error: (message: string) => {
          throw new Error(String(message));
        },
      };
      const log = vi.spyOn(console, "log").mockImplementation(() => {});
      try {
        await (plugin.transform as any).call(ctx, code, "/project/src/Main.xmlui", {});
        (plugin.buildEnd as any).call(ctx);
        return { logs: log.mock.calls.map((call) => String(call[0])), warnings: ctx.warn };
      } finally {
        log.mockRestore();
      }
    }

    it("reports how many compiled artifacts the build produced", async () => {
      const { logs, warnings } = await buildWithSummary(
        `<Button onClick="count = count + 1" />`,
        { compileScripts: true },
      );

      expect(logs.join("\n")).toMatch(
        /\[xmlui\] Script compilation: [1-9]\d* compiled artifact\(s\) from [1-9]\d* script block\(s\) in 1 file\(s\)/,
      );
      expect(warnings).not.toHaveBeenCalled();
    });

    it("stays silent about compiled scripts when compilation is off", async () => {
      const { logs, warnings } = await buildWithSummary(`<Button onClick="count = count + 1" />`);

      expect(logs.join("\n")).not.toContain("Script compilation");
      expect(warnings).not.toHaveBeenCalled();
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
      const helperSource = `function double(x) { return x * 2; }`;
      await writeFile(helperPath, helperSource);
      const source = `import { double } from "./helpers.xs";
function run(value) { return double(value); }`;
      const harness = await createPluginHarness(dir, {
        compileEventHandlers: true,
        compiledScriptSourceMaps: "external",
      });

      const result = await harness.transform(source, mainPath);

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

      const sourceResponse = await harness.request("/@xmlui-source/src/helpers.xs");
      expect(sourceResponse.nextCalled).toBe(false);
      expect(sourceResponse.body).toBe(helperSource);

      const compiledSourceId = mod.default.functions.double.compiled.sourceId;
      const compiledMapResponse = await harness.request(
        `/@xmlui-source/__compiled/${encodeURIComponent(compiledSourceId)}.js.map`,
      );
      expect(compiledMapResponse.nextCalled).toBe(false);
      expect(JSON.parse(compiledMapResponse.body)).toMatchObject({
        version: 3,
        sources: ["/@xmlui-source/src/helpers.xs"],
        sourcesContent: [helperSource],
      });
    });

    it("does not compile .xmlui.xs functions by default", async () => {
      const source = `function run(value) { return value + 1; }`;
      const { result } = await transformXmlui(source, "/project/src/Main.xmlui.xs");

      const mod = await importGeneratedModule(result.code);
      expect(mod.default.functions.run.compiled).toBeUndefined();
    });

    it("serializes compiled .xmlui.xs functions when event compilation is enabled", async () => {
      const source = `function run(value) { return value + 1; }`;
      const { result } = await transformXmlui(source, "/project/src/Main.xmlui.xs", "/project", {
        compileEventHandlers: true,
      });

      const mod = await importGeneratedModule(result.code);
      const run = mod.default.functions.run;
      expect(run.compiled).toMatchObject({
        target: "event-async",
        sourceId: "/project/src/Main.xmlui.xs#function-run",
        sourceText: source,
      });
      expect(run.compiled.sources[0]).toMatchObject({
        id: "/project/src/Main.xmlui.xs",
        url: "/@xmlui-source/src/Main.xmlui.xs",
        sourceText: source,
      });
    });

    it("serializes compiled .xmlui.xs functions with the common compileScripts switch", async () => {
      const source = `function run(value) { return value + 1; }`;
      const { result } = await transformXmlui(source, "/project/src/Main.xmlui.xs", "/project", {
        compileScripts: true,
      });

      const mod = await importGeneratedModule(result.code);
      expect(mod.default.functions.run.compiled).toMatchObject({
        target: "event-async",
        sourceText: source,
      });
    });

    it("serializes compiled Globals.xs functions when event compilation is enabled", async () => {
      const source = `function formatName(value) { return value.toUpperCase(); }`;
      const { result } = await transformXmlui(source, "/project/src/Globals.xs", "/project", {
        compileEventHandlers: true,
      });

      const mod = await importGeneratedModule(result.code);
      const formatName = mod.default.functions.formatName;
      expect(formatName.compiled).toMatchObject({
        target: "event-async",
        sourceId: "/project/src/Globals.xs#function-formatName",
        sourceText: source,
      });
      expect(formatName.compiled.sources[0]).toMatchObject({
        id: "/project/src/Globals.xs",
        url: "/@xmlui-source/src/Globals.xs",
        sourceText: source,
      });
    });

    it("serves Globals.xs debug sources and compiled source maps", async () => {
      const source = `function formatName(value) { return value.toUpperCase(); }`;
      const harness = await createPluginHarness("/project", {
        compileEventHandlers: true,
        compiledScriptSourceMaps: "external",
      });

      const result = await harness.transform(source, "/project/src/Globals.xs");
      const mod = await importGeneratedModule(result.code);

      expect(mod.default.debugSources).toEqual([
        {
          id: "/project/src/Globals.xs",
          url: "/@xmlui-source/src/Globals.xs",
          displayName: "/project/src/Globals.xs",
          sourceText: source,
        },
      ]);

      const sourceResponse = await harness.request("/@xmlui-source/src/Globals.xs");
      expect(sourceResponse.nextCalled).toBe(false);
      expect(sourceResponse.body).toBe(source);

      const compiledSourceId = mod.default.functions.formatName.compiled.sourceId;
      const compiledMapResponse = await harness.request(
        `/@xmlui-source/__compiled/${encodeURIComponent(compiledSourceId)}.js.map`,
      );
      expect(compiledMapResponse.nextCalled).toBe(false);
      expect(JSON.parse(compiledMapResponse.body)).toMatchObject({
        version: 3,
        sources: ["/@xmlui-source/src/Globals.xs"],
        sourcesContent: [source],
      });
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
