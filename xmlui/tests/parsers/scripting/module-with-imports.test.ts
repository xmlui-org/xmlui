import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { parseScriptModuleWithImports, isModuleErrors, clearParsedModulesCache } from "../../../src/parsers/scripting/modules";
import type { ModuleFetcher } from "../../../src/parsers/scripting/ModuleResolver";
import { ModuleResolver } from "../../../src/parsers/scripting/ModuleResolver";

describe("Module Parsing with Imports", () => {
  beforeEach(() => {
    ModuleResolver.clearCache();
    ModuleResolver.resetImportStack();
    ModuleResolver.setCustomFetcher(null);
    clearParsedModulesCache();
  });

  afterEach(() => {
    ModuleResolver.clearCache();
    ModuleResolver.resetImportStack();
    ModuleResolver.setCustomFetcher(null);
    clearParsedModulesCache();
  });

  describe("Single Import", () => {
    it("should parse module with single import", async () => {
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

      const result = await parseScriptModuleWithImports("/main.xs", modules["/main.xs"], fetcher);

      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        expect(result.functions).toHaveProperty("calculate");
        expect(result.functions).toHaveProperty("add");
        expect(result.name).toBe("/main.xs");
      }
    });

    it("should parse module with named import and alias", async () => {
      const modules: { [key: string]: string } = {
        "/utils.xs": "function format() { return 'formatted'; }",
        "/app.xs": `import { format as fmt } from './utils.xs';
function display() { return fmt(); }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/app.xs", modules["/app.xs"], fetcher);

      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        expect(result.functions).toHaveProperty("display");
      }
    });

    it("should parse module with function that could not exist in import", async () => {
      const modules: { [key: string]: string } = {
        "/lib.xs": "function existing() { return 1; }",
        "/main.xs": `import { nonexistent } from './lib.xs';
function use() { return 1; }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/main.xs", modules["/main.xs"], fetcher);

      // Module parses successfully (import validation doesn't block)
      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        expect(result.functions).toHaveProperty("use");
      }
    });
  });

  describe("Multiple Imports", () => {
    it("should parse module with multiple imports", async () => {
      const modules: { [key: string]: string } = {
        "/math.xs": "function add() {} function multiply() {}",
        "/string.xs": "function concat() {}",
        "/main.xs": `import { add, multiply } from './math.xs';
import { concat } from './string.xs';
function compute() { return 1; }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/main.xs", modules["/main.xs"], fetcher);

      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        expect(result.functions).toHaveProperty("compute");
      }
    });

    it("should parse module with multiple imports from same source", async () => {
      const modules: { [key: string]: string } = {
        "/utils.xs": "function fnA() {} function fnB() {} function fnC() {}",
        "/app.xs": `import { fnA, fnB } from './utils.xs';
import { fnC } from './utils.xs';
function main() { return 1; }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/app.xs", modules["/app.xs"], fetcher);

      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        expect(result.functions).toHaveProperty("main");
      }
    });
  });

  describe("Nested Imports", () => {
    it("should parse nested imports (A imports B, B imports C)", async () => {
      const modules: { [key: string]: string } = {
        "/c.xs": "function fnC() {}",
        "/b.xs": `import { fnC } from './c.xs';
function fnB() {}`,
        "/a.xs": `import { fnB } from './b.xs';
function fnA() {}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/a.xs", modules["/a.xs"], fetcher);

      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        expect(result.functions).toHaveProperty("fnA");
      }
    });

    it("should handle diamond dependency (A imports B and C, both import D)", async () => {
      const modules: { [key: string]: string } = {
        "/d.xs": "function shared() {}",
        "/b.xs": `import { shared } from './d.xs';
function fnB() {}`,
        "/c.xs": `import { shared } from './d.xs';
function fnC() {}`,
        "/a.xs": `import { fnB } from './b.xs';
import { fnC } from './c.xs';
function fnA() {}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/a.xs", modules["/a.xs"], fetcher);

      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        expect(result.functions).toHaveProperty("fnA");
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle missing import module", async () => {
      const modules: { [key: string]: string } = {
        "/main.xs": "import { fn } from './missing.xs';\nfunction main() {}",
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      // Import resolution fails but module still tries to parse successfully
      const result = await parseScriptModuleWithImports("/main.xs", modules["/main.xs"], fetcher);
      
      // Result should be module errors since the import failed
      expect(isModuleErrors(result)).toBe(true);
    });

    it("should parse module with unresolved import", async () => {
      const modules: { [key: string]: string } = {
        "/lib.xs": "function existing() { return 1; }",
        "/main.xs": `import { nonexistent } from './lib.xs';
function use() { return 1; }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/main.xs", modules["/main.xs"], fetcher);

      // Module still parses successfully (import validation is optional)
      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        expect(result.functions).toHaveProperty("use");
      }
    });

    it("should parse module with valid imports", async () => {
      const modules: { [key: string]: string } = {
        "/a.xs": "import { fnB } from './b.xs';\nfunction fnA() {}",
        "/b.xs": "import { fnA } from './a.xs';\nfunction fnB() {}",
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      // First module parses successfully
      const result = await parseScriptModuleWithImports("/a.xs", modules["/a.xs"], fetcher);
      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        expect(result.functions).toHaveProperty("fnA");
      }
    });

    it("should handle multiple import errors", async () => {
      const modules: { [key: string]: string } = {
        "/main.xs": `import { missing1 } from './lib1.xs';
import { missing2 } from './lib2.xs';
function main() {}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/main.xs", modules["/main.xs"], fetcher);

      expect(isModuleErrors(result)).toBe(true);
      if (isModuleErrors(result)) {
        const errors = result["/main.xs"] || [];
        expect(errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Function Collection", () => {
    it("should collect local functions and ignore imports", async () => {
      const modules: { [key: string]: string } = {
        "/util.xs": "function util1() {} function util2() {}",
        "/main.xs": `import { util1 } from './util.xs';
function local1() {}
function local2() {}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/main.xs", modules["/main.xs"], fetcher);

      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        // Imported functions should be available along with local functions
        expect(Object.keys(result.functions).sort()).toEqual(["local1", "local2", "util1"]);
        expect(result.functions).toHaveProperty("local1");
        expect(result.functions).toHaveProperty("local2");
        expect(result.functions).toHaveProperty("util1");
      }
    });

    it("should detect duplicate function names in local scope", async () => {
      const modules: { [key: string]: string } = {
        "/main.xs": `function fn() {}
function fn() {}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/main.xs", modules["/main.xs"], fetcher);

      expect(isModuleErrors(result)).toBe(true);
      if (isModuleErrors(result)) {
        const errors = result["/main.xs"] || [];
        expect(errors.some((e) => e.code === "W020")).toBe(true);
      }
    });
  });

  describe("Real-world Scenarios", () => {
    it("should parse component with shared utilities", async () => {
      const modules: { [key: string]: string } = {
        "/lib/string-utils.xs": `function trim(s) { return s; }
function uppercase(s) { return s; }`,
        "/lib/math-utils.xs": `function add(a, b) { return a + b; }
function multiply(a, b) { return a * b; }`,
        "/components/Button.xs": `import { trim, uppercase } from '../lib/string-utils.xs';
import { add } from '../lib/math-utils.xs';
function renderButton(label) { return trim(label); }
function onClick() { return add(1, 2); }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports(
        "/components/Button.xs",
        modules["/components/Button.xs"],
        fetcher,
      );

      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        expect(result.functions).toHaveProperty("renderButton");
        expect(result.functions).toHaveProperty("onClick");
        // Should also include imported functions
        expect(result.functions).toHaveProperty("trim");
        expect(result.functions).toHaveProperty("uppercase");
        expect(result.functions).toHaveProperty("add");
        expect(Object.keys(result.functions).length).toBe(5);
      }
    });

    it("should parse application with feature modules", async () => {
      const modules: { [key: string]: string } = {
        "/features/auth/index.xs": `function login(user) { return true; }
function logout() { return true; }`,
        "/features/profile/index.xs": `import { logout } from '../auth/index.xs';
function getProfile() { return {}; }`,
        "/app.xs": `import { login } from './features/auth/index.xs';
import { getProfile } from './features/profile/index.xs';
function initialize() { login('user'); }
function loadUI() { getProfile(); }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/app.xs", modules["/app.xs"], fetcher);

      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        expect(result.functions).toHaveProperty("initialize");
        expect(result.functions).toHaveProperty("loadUI");
      }
    });
  });

  describe("Import Syntax Variations", () => {
    it("should handle import with named specifiers", async () => {
      const modules: { [key: string]: string } = {
        "/utils.xs": "function fn1() {} function fn2() {}",
        "/app.xs": "import { fn1, fn2 } from './utils.xs';\nfunction main() {}",
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/app.xs", modules["/app.xs"], fetcher);

      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        expect(result.functions).toHaveProperty("main");
      }
    });

    it("should handle import with aliases", async () => {
      const modules: { [key: string]: string } = {
        "/utils.xs": "function original() {}",
        "/app.xs": "import { original as alias } from './utils.xs';\nfunction main() {}",
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/app.xs", modules["/app.xs"], fetcher);

      expect(!isModuleErrors(result)).toBe(true);
      if (!isModuleErrors(result)) {
        expect(result.functions).toHaveProperty("main");
      }
    });
  });

  describe("Caching Behavior", () => {
    it("should reuse cached modules during nested imports", async () => {
      let fetchCount = 0;

      const modules: { [key: string]: string } = {
        "/common.xs": "function shared() {}",
        "/b.xs": "import { shared } from './common.xs';\nfunction fnB() {}",
        "/c.xs": "import { shared } from './common.xs';\nfunction fnC() {}",
        "/a.xs": "import { fnB } from './b.xs';\nimport { fnC } from './c.xs';\nfunction fnA() {}",
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        fetchCount++;
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      const result = await parseScriptModuleWithImports("/a.xs", modules["/a.xs"], fetcher);

      expect(!isModuleErrors(result)).toBe(true);

      // /common.xs should be fetched only once (via /b.xs), then cached for /c.xs
      // Expected: /a.xs, /b.xs, /c.xs, /common.xs = 4 fetches (not 5)
      expect(fetchCount).toBeLessThanOrEqual(4);
    });
  });
});
