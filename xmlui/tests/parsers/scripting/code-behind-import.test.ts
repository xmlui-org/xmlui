import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  collectCodeBehindFromSource,
  collectCodeBehindFromSourceWithImports,
  PARSED_MARK_PROP,
} from "../../../src/parsers/scripting/code-behind-collect";
import {
  T_ARROW_EXPRESSION,
  type ArrowExpression,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import type { ModuleFetcher } from "../../../src/parsers/scripting/ModuleResolver";
import { ModuleResolver } from "../../../src/parsers/scripting/ModuleResolver";

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
      expect(result.moduleErrors).toEqual({});
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
        "/helpers.xs": "export function add(a, b) { return a + b; }",
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
      expect(Object.keys(result.functions).length).toBe(1);
      expect(result.moduleErrors).toEqual({});
    });

    it("should collect code-behind with multiple imports", async () => {
      const modules: { [key: string]: string } = {
        "/math.xs": "export function add(a, b) { return a + b; } export function multiply(a, b) { return a * b; }",
        "/string.xs": "export function concat(a, b) { return a + b; }",
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
      expect(Object.keys(result.functions).length).toBe(1);
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
        "/config.xs": "export const DEFAULT_TIMEOUT = 1000;",
        "/app.xs": `import { DEFAULT_TIMEOUT } from './config.xs';
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
      expect(totalFunc.tree).toBeDefined();
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
      ).rejects.toThrow("Duplicated var declaration");
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
      expect(func.tree).toBeDefined();
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
        "/helpers.xs": "export function format(s) { return s.trim(); }",
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
      expect(Object.keys(result.vars).length).toBe(2);
      expect(Object.keys(result.functions).length).toBe(2);
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
      expect(func.tree).toBeDefined();
      expect(func.tree.type).toBe(T_ARROW_EXPRESSION);
    });

    it("should preserve function arguments", async () => {
      const source = `
function calculate(x, y, z) {
  return x + y + z;
}`;

      const result = await collectCodeBehindFromSourceWithImports("/app.xs", source);

      const func = result.functions["calculate"];
      expect(func).toBeDefined();
      const arrowExpr = func.tree as ArrowExpression;
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
      const arrowExpr = func.tree as ArrowExpression;
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
      expect((func as any)[PARSED_MARK_PROP]).toBe(true);
    });
  });
});
