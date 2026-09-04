import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { dataToEsm } from "@rollup/pluginutils";
import {
  collectCodeBehindFromSource,
  collectCodeBehindFromSourceWithImports,
  PARSED_MARK_PROP,
  removeCodeBehindTokensFromTree,
} from "../../../src/parsers/scripting/code-behind-collect";
import {
  T_ARROW_EXPRESSION,
  type ArrowExpression,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import type {
  CompiledScriptArtifact,
  CompiledScriptSourceRange,
} from "../../../src/components-core/script-compiler";
import type { ModuleFetcher } from "../../../src/parsers/scripting/ModuleResolver";
import { ModuleResolver } from "../../../src/parsers/scripting/ModuleResolver";

async function importGeneratedModule(code: string) {
  const encoded = Buffer.from(code).toString("base64");
  return import(`data:text/javascript;base64,${encoded}#${Math.random()}`);
}

function fakeCompiledArtifact(sourceId = "/main.xs#function-add"): CompiledScriptArtifact {
  return {
    version: 1,
    target: "event-async",
    sourceId,
    displayName: "/main.xs",
    sourceText: "function add(a, b) { return a + b; }",
    sources: [
      {
        id: sourceId,
        displayName: "/main.xs",
        sourceText: "function add(a, b) { return a + b; }",
      },
    ],
    sourceRange: { start: 0, end: 38 },
    astNodeId: 1,
    dependencies: [],
    js: "return (async () => 3)();",
    mappings: [],
    diagnostics: [],
  };
}

describe("Code-Behind Collection with Imports", () => {
  beforeEach(() => {
    ModuleResolver.clearCache();
    ModuleResolver.resetImportStack();
    ModuleResolver.setCustomFetcher(null);
  });

  afterEach(() => {
    ModuleResolver.clearCache();
    ModuleResolver.resetImportStack();
    ModuleResolver.setCustomFetcher(null);
  });

  describe("Backward Compatibility (Sync Without Imports)", () => {
    it("should collect functions without imports (backward compat)", () => {
      const source = `
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}`;

      const result = collectCodeBehindFromSource("/main.xs", source);

      expect(result.functions).toHaveProperty("add");
      expect(result.functions).toHaveProperty("multiply");
      expect(Object.keys(result.functions).length).toBe(2);
      expect(result.functions.add.compiled).toBeUndefined();
      expect(result.functions.add.compiledUnsupported).toBeUndefined();
      expect(result.functions.add.sourceId).toBeUndefined();
      expect(result.functions.add.sourceRange).toBeUndefined();
      expect(result.moduleErrors).toEqual({});
    });

    it("preserves declaration compilation metadata through ESM serialization", async () => {
      const result = collectCodeBehindFromSource(
        "/main.xs",
        "function add(a, b) { return a + b; }",
      );
      const sourceRange: CompiledScriptSourceRange = { start: 9, end: 36 };
      result.functions.add.compiled = fakeCompiledArtifact();
      result.functions.add.compiledUnsupported = false;
      result.functions.add.source = "function add(a, b) { return a + b; }";
      result.functions.add.sourceId = "/main.xs#function-add";
      result.functions.add.sourceRange = sourceRange;

      const mod = await importGeneratedModule(dataToEsm(result));
      const add = mod.default.functions.add;

      expect(add.compiled).toMatchObject({
        target: "event-async",
        sourceId: "/main.xs#function-add",
      });
      expect(add.compiledUnsupported).toBe(false);
      expect(add.source).toBe("function add(a, b) { return a + b; }");
      expect(add.sourceId).toBe("/main.xs#function-add");
      expect(add.sourceRange).toEqual(sourceRange);
    });

    it("keeps declaration compilation metadata when parser tokens are removed", () => {
      const result = collectCodeBehindFromSource(
        "/main.xs",
        "function add(a, b) { return a + b; }",
      );
      const sourceRange: CompiledScriptSourceRange = { start: 9, end: 36 };
      result.functions.add.compiled = fakeCompiledArtifact();
      result.functions.add.compiledUnsupported = false;
      result.functions.add.sourceId = "/main.xs#function-add";
      result.functions.add.sourceRange = sourceRange;

      removeCodeBehindTokensFromTree(result);

      expect(result.functions.add.compiled).toMatchObject({
        target: "event-async",
        sourceId: "/main.xs#function-add",
      });
      expect(result.functions.add.compiledUnsupported).toBe(false);
      expect(result.functions.add.sourceId).toBe("/main.xs#function-add");
      expect(result.functions.add.sourceRange).toEqual(sourceRange);
    });

    it("should collect vars without imports", () => {
      const source = `
var maxValue = 100;
var minValue = 0;

function getValue() {
  return maxValue;
}`;

      const result = collectCodeBehindFromSource("/main.xs", source);

      expect(result.vars).toHaveProperty("maxValue");
      expect(result.vars).toHaveProperty("minValue");
      expect(result.functions).toHaveProperty("getValue");
    });

    it("compiles code-behind functions when requested", () => {
      const source = "function add(a, b) { return a + b; }";

      const result = collectCodeBehindFromSource("/main.xs", source, {
        compileScripts: true,
        sourceIdPrefix: "/src/Main.xmlui.xs",
        sourceUrl: "/@xmlui-source/src/Main.xmlui.xs",
        displayName: "/src/Main.xmlui.xs",
      });

      expect(result.functions.add.compiled).toMatchObject({
        target: "event-async",
        sourceId: "/src/Main.xmlui.xs#function-add",
        sourceUrl: "/@xmlui-source/src/Main.xmlui.xs",
        displayName: "/src/Main.xmlui.xs",
        sourceText: source,
      });
      expect(result.functions.add.compiledUnsupported).toBe(false);
      expect(result.functions.add.source).toBe(source);
      expect(result.functions.add.sourceId).toBe("/src/Main.xmlui.xs#function-add");
      expect(result.functions.add.compiled?.js).toContain("return (async () =>");
      expect(result.functions.add.compiled?.mappings.length).toBeGreaterThan(0);
      expect(result.warnings ?? []).toEqual([]);
    });

    it("compiles a declaration that constructs an object", () => {
      const source = "function today() { return new Date(0); }";

      const result = collectCodeBehindFromSource("/main.xs", source, {
        compileScripts: true,
      });

      expect(result.functions.today.compiledUnsupported).toBe(false);
      expect(result.functions.today.compiled?.js).toContain("runtime.construct(");
      expect(result.warnings ?? []).toEqual([]);
    });

    it("marks unsupported function compilation and keeps the declaration", () => {
      // --- `await` is not part of XMLScript, so no compiler target accepts it.
      const source = "function today() { return await now(); }";

      const result = collectCodeBehindFromSource("/main.xs", source, {
        compileScripts: true,
      });

      expect(result.functions.today).toMatchObject({
        type: T_ARROW_EXPRESSION,
        compiledUnsupported: true,
        sourceId: "/main.xs#function-today",
      });
      expect(result.functions.today.compiled).toBeUndefined();
      expect(result.functions.today.source).toBe(source);
      // --- The reason travels with the declaration whether or not anyone asked for
      // --- reporting, so a fallback is never a bare boolean.
      expect(result.functions.today.compiledUnsupportedReason).toContain(
        "compile-unsupported-node",
      );
      expect(result.warnings ?? []).toEqual([]);
    });

    it("reports the fallback when asked to", () => {
      const source = "function today() { return await now(); }";

      const result = collectCodeBehindFromSource("/main.xs", source, {
        compileScripts: true,
        reportCompileFallbacks: true,
      });

      expect(result.warnings?.[0]).toContain("compile-unsupported-node");
      expect(result.warnings?.[0]).toContain("/main.xs#function-today");
      expect(result.warnings?.[0]).toContain("await expression");
    });

    it("should handle duplicates and collect errors", () => {
      const source = `
function test() { return 1; }
function test() { return 2; }`;

      const result = collectCodeBehindFromSource("/main.xs", source);

      // Instead of throwing, duplicates are returned in moduleErrors
      expect(Object.keys(result.moduleErrors).length).toBeGreaterThan(0);
    });
  });

  describe("With Imports (Async)", () => {
    it("should collect code-behind with single import", async () => {
      const modules: { [key: string]: string } = {
        "/helpers.xs": "function add(a, b) { return a + b; }",
        "/main.xs": `import { add } from './helpers.xs';
function calculate() { return add(1, 2); }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/main.xs",
        modules["/main.xs"],
        fetcher,
      );

      expect(result.functions).toHaveProperty("calculate");
      expect(result.functions).toHaveProperty("add");
      expect(Object.keys(result.functions).length).toBe(2);
      expect(result.moduleErrors).toEqual({});
    });

    it("compiles imported functions with their defining module source", async () => {
      const modules: { [key: string]: string } = {
        "/math.xs": "function inc(value) { return value + 1; }",
        "/main.xs": `import { inc as addOne } from './math.xs';
function use(value) { return addOne(value); }`,
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/main.xs",
        modules["/main.xs"],
        async (path) => modules[path],
        { compileScripts: true },
      );

      expect(result.functions.use.compiled).toMatchObject({
        target: "event-async",
        sourceId: "/main.xs#function-use",
        sourceText: "function use(value) { return addOne(value); }",
      });
      expect(result.functions.addOne.compiled).toMatchObject({
        target: "event-async",
        sourceId: "/math.xs#function-inc",
        sourceText: "function inc(value) { return value + 1; }",
      });
      expect(result.functions.addOne.compiled?.sources[0]).toMatchObject({
        url: "/@xmlui-source/math.xs",
        displayName: "/math.xs",
        sourceText: modules["/math.xs"],
      });
      expect(result.functions.addOne.sourceId).toBe("/math.xs#function-inc");
      expect(result.warnings ?? []).toEqual([]);
    });

    it("should collect code-behind with multiple imports", async () => {
      const modules: { [key: string]: string } = {
        "/math.xs": "function add(a, b) { return a + b; } function multiply(a, b) { return a * b; }",
        "/string.xs": "function concat(a, b) { return a + b; }",
        "/app.xs": `import { add, multiply } from './math.xs';
import { concat } from './string.xs';
function process() { return 1; }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/app.xs",
        modules["/app.xs"],
        fetcher,
      );

      expect(result.functions).toHaveProperty("process");
      expect(result.functions).toHaveProperty("add");
      expect(result.functions).toHaveProperty("multiply");
      expect(result.functions).toHaveProperty("concat");
      expect(Object.keys(result.functions).length).toBe(4);
      expect(result.moduleErrors).toEqual({});
    });

    it("should handle missing fetcher and fallback to sync", async () => {
      const source = `
function add(a, b) {
  return a + b;
}`;

      const result = await collectCodeBehindFromSourceWithImports("/main.xs", source);

      expect(result.functions).toHaveProperty("add");
      expect(result.moduleErrors).toEqual({});
    });

    it("should collect vars and functions together", async () => {
      const modules: { [key: string]: string } = {
        "/config.xs": "export function getDefaultTimeout() { return 1000; }",
        "/app.xs": `import { getDefaultTimeout } from './config.xs';
var appState = {};
function initialize() { return appState; }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/app.xs",
        modules["/app.xs"],
        fetcher,
      );

      expect(result.vars).toHaveProperty("appState");
      expect(result.functions).toHaveProperty("initialize");
      expect(result.moduleErrors).toEqual({});
    });

    it("should preserve function signature from imports", async () => {
      const modules: { [key: string]: string } = {
        "/utils.xs": "export function sum(a, b, c) { return a + b + c; }",
        "/main.xs": `import { sum } from './utils.xs';
function total() { return sum(1, 2, 3); }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/main.xs",
        modules["/main.xs"],
        fetcher,
      );

      expect(result.functions).toHaveProperty("total");
      // Verify the collected function is properly formed
      const totalFunc = result.functions["total"];
      expect(totalFunc).toBeDefined();
      expect((totalFunc as any).type).toBe(T_ARROW_EXPRESSION);
    });
  });

  describe("Error Handling", () => {
    it("should handle import errors and collect moduleErrors", async () => {
      const modules: { [key: string]: string } = {
        "/main.xs": "import { missing } from './nonexistent.xs';\nfunction main() {}",
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/main.xs",
        modules["/main.xs"],
        fetcher,
      );

      expect(Object.keys(result.moduleErrors).length).toBeGreaterThan(0);
    });

    it("should handle syntax errors", async () => {
      const modules: { [key: string]: string } = {
        "/main.xs": "function broken( { return 1; }",
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/main.xs",
        modules["/main.xs"],
        fetcher,
      );

      expect(Object.keys(result.moduleErrors).length).toBeGreaterThan(0);
    });

    it("should detect duplicate functions", async () => {
      const modules: { [key: string]: string } = {
        "/main.xs": `function fn() { return 1; }
function fn() { return 2; }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/main.xs",
        modules["/main.xs"],
        fetcher,
      );

      expect(Object.keys(result.moduleErrors).length).toBeGreaterThan(0);
    });

    it("should detect duplicate vars", async () => {
      const modules: { [key: string]: string } = {
        "/main.xs": `var x = 1;
var x = 2;`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      await expect(
        collectCodeBehindFromSourceWithImports("/main.xs", modules["/main.xs"], fetcher),
      ).rejects.toMatchObject({ message: expect.stringContaining("Duplicated var declaration") });
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle complex variable expressions", async () => {
      const source = `
var config = {
  timeout: 1000,
  retries: 3
};

var cache = new Map();

function getConfig() {
  return config;
}`;

      const result = await collectCodeBehindFromSourceWithImports("/app.xs", source);

      expect(result.vars).toHaveProperty("config");
      expect(result.vars).toHaveProperty("cache");
      expect(result.functions).toHaveProperty("getConfig");
    });

    it("should handle functions with complex bodies", async () => {
      const source = `
function process(items) {
  return items;
}`;

      const result = await collectCodeBehindFromSourceWithImports("/app.xs", source);

      expect(result.functions).toHaveProperty("process");
      const func = result.functions["process"];
      expect(func).toBeDefined();
      expect((func as any).type).toBe(T_ARROW_EXPRESSION);
    });

    it("should handle nested imports with shared dependencies", async () => {
      const modules: { [key: string]: string } = {
        "/common.xs": "export function log(msg) { console.log(msg); }",
        "/utils.xs": `import { log } from './common.xs';
export function helper() { log('helper'); }`,
        "/app.xs": `import { helper } from './utils.xs';
function main() { helper(); }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/app.xs",
        modules["/app.xs"],
        fetcher,
      );

      expect(result.functions).toHaveProperty("main");
      expect(result.moduleErrors).toEqual({});
    });

    it("should handle multiple function declarations", async () => {
      const source = `
function init() { return 1; }
function update() { return 2; }
function render() { return 3; }
function destroy() { return 4; }`;

      const result = await collectCodeBehindFromSourceWithImports("/lifecycle.xs", source);

      expect(result.functions).toHaveProperty("init");
      expect(result.functions).toHaveProperty("update");
      expect(result.functions).toHaveProperty("render");
      expect(result.functions).toHaveProperty("destroy");
      expect(Object.keys(result.functions).length).toBe(4);
    });

    it("should handle module with both vars and functions", async () => {
      const modules: { [key: string]: string } = {
        "/helpers.xs": "function format(s) { return s.trim(); }",
        "/app.xs": `import { format } from './helpers.xs';
var settings = { debug: true };
var cache = {};
function process(input) { return format(input); }
function validate(data) { return data != null; }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/app.xs",
        modules["/app.xs"],
        fetcher,
      );

      expect(result.vars).toHaveProperty("settings");
      expect(result.vars).toHaveProperty("cache");
      expect(result.functions).toHaveProperty("process");
      expect(result.functions).toHaveProperty("validate");
      expect(result.functions).toHaveProperty("format");
      expect(Object.keys(result.vars).length).toBe(2);
      expect(Object.keys(result.functions).length).toBe(3);
    });
  });

  describe("Function Conversion", () => {
    it("should convert FunctionDeclaration to ArrowExpression", async () => {
      const source = `
function add(a, b) {
  return a + b;
}`;

      const result = await collectCodeBehindFromSourceWithImports("/math.xs", source);

      const func = result.functions["add"];
      expect(func).toBeDefined();
      expect((func as any).type).toBe(T_ARROW_EXPRESSION);
    });

    it("should preserve function arguments", async () => {
      const source = `
function calculate(x, y, z) {
  return x + y + z;
}`;

      const result = await collectCodeBehindFromSourceWithImports("/app.xs", source);

      const func = result.functions["calculate"];
      expect(func).toBeDefined();
      const arrowExpr = func as any as ArrowExpression;
      expect(arrowExpr.args).toBeDefined();
      expect(arrowExpr.args.length).toBe(3);
    });

    it("should preserve function body", async () => {
      const source = `
function process() {
  var x = 1;
  return x * 2;
}`;

      const result = await collectCodeBehindFromSourceWithImports("/app.xs", source);

      const func = result.functions["process"];
      expect(func).toBeDefined();
      const arrowExpr = func as any as ArrowExpression;
      expect(arrowExpr.statement).toBeDefined();
    });
  });

  describe("Marked Properties", () => {
    it("should mark collected vars as parsed", async () => {
      const source = `var test = 42;`;

      const result = await collectCodeBehindFromSourceWithImports("/app.xs", source);

      const variable = result.vars["test"];
      expect(variable).toBeDefined();
      // Check for PARSED_MARK_PROP
      expect((variable as any)[PARSED_MARK_PROP]).toBe(true);
    });

    it("should mark collected functions as parsed", async () => {
      const source = `function test() { return 1; }`;

      const result = await collectCodeBehindFromSourceWithImports("/app.xs", source);

      const func = result.functions["test"];
      expect(func).toBeDefined();
      // Functions are now arrow expressions with _ARROW_EXPR_ marker
      expect((func as any)._ARROW_EXPR_).toBe(true);
    });
  });
});
