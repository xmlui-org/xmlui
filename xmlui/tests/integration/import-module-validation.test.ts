import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { collectCodeBehindFromSourceWithImports } from "../../src/parsers/scripting/code-behind-collect";
import { ModuleResolver } from "../../src/parsers/scripting/ModuleResolver";
import { clearParsedModulesCache } from "../../src/parsers/scripting/modules";
import type { ModuleFetcher } from "../../src/parsers/scripting/ModuleResolver";

describe("Import Module Validation Tests", () => {
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

  describe("Valid modules with only function declarations", () => {
    it("should accept a module with only function declarations", async () => {
      const modules: Record<string, string> = {
        "/utils.xs": `
function helper1() {
  return 42;
}

function helper2(x) {
  return x * 2;
}`,
        "/Main.xmlui.xs": `
import { helper1, helper2 } from './utils.xs';

function calculate() {
  return helper1() + helper2(10);
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      expect(result.functions).toHaveProperty("calculate");
      expect(result.functions).toHaveProperty("helper1");
      expect(result.functions).toHaveProperty("helper2");
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
    });

    it("should accept empty modules", async () => {
      const modules: Record<string, string> = {
        "/empty.xs": `
function nothing() {
  return 0;
}`,
        "/Main.xmlui.xs": `
import { nothing } from './empty.xs';

function test() {
  return 1;
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      expect(result.functions).toHaveProperty("test");
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
    });

    it("should accept modules with nested imports (all valid)", async () => {
      const modules: Record<string, string> = {
        "/base.xs": `
function base() {
  return 1;
}`,
        "/middle.xs": `
import { base } from './base.xs';

function middle() {
  return base() + 1;
}`,
        "/Main.xmlui.xs": `
import { middle } from './middle.xs';

function top() {
  return middle() + 1;
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      expect(result.functions).toHaveProperty("top");
      expect(result.functions).toHaveProperty("middle");
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
    });
  });

  describe("Error: Reactive variable declarations", () => {
    it("should raise error W043 for reactive var declaration", async () => {
      const modules: Record<string, string> = {
        "/invalid.xs": `
function getMagicalValue() {
  return 42;
}

var x = 3;`,
        "/Main.xmlui.xs": `
import { getMagicalValue } from './invalid.xs';

function test() {
  return getMagicalValue();
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      expect(Object.keys(result.moduleErrors)).toHaveLength(1);
      expect(result.moduleErrors["/invalid.xs"]).toBeDefined();
      expect(result.moduleErrors["/invalid.xs"]).toHaveLength(1);
      expect(result.moduleErrors["/invalid.xs"][0].code).toBe("W043");
      expect(result.moduleErrors["/invalid.xs"][0].text).toContain("Reactive variable");
      expect(result.moduleErrors["/invalid.xs"][0].text).toContain("x");
    });

    it("should raise error W043 for multiple reactive var declarations", async () => {
      const modules: Record<string, string> = {
        "/invalid.xs": `
function helper() {
  return 1;
}

var count = 0;
var name = "test";
var active = true;`,
        "/Main.xmlui.xs": `
import { helper } from './invalid.xs';

function test() {
  return helper();
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      expect(Object.keys(result.moduleErrors)).toHaveLength(1);
      expect(result.moduleErrors["/invalid.xs"]).toBeDefined();
      // Three separate var statements = 3 errors
      expect(result.moduleErrors["/invalid.xs"].length).toBeGreaterThanOrEqual(3);
      result.moduleErrors["/invalid.xs"].forEach((error) => {
        expect(error.code).toBe("W043");
      });
    });

    it("should raise error for var statement with multiple declarations", async () => {
      const modules: Record<string, string> = {
        "/invalid.xs": `
function helper() {
  return 1;
}

var a = 1, b = 2, c = 3;`,
        "/Main.xmlui.xs": `
import { helper } from './invalid.xs';

function test() {
  return helper();
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      expect(Object.keys(result.moduleErrors)).toHaveLength(1);
      expect(result.moduleErrors["/invalid.xs"]).toBeDefined();
      expect(result.moduleErrors["/invalid.xs"][0].code).toBe("W043");
      // Should mention all variable names
      expect(result.moduleErrors["/invalid.xs"][0].text).toContain("a");
    });
  });

  describe("Error: const/let variable declarations", () => {
    it("should raise error W044 for const declaration", async () => {
      const modules: Record<string, string> = {
        "/invalid.xs": `
function helper() {
  return 42;
}

const MAX_VALUE = 100;`,
        "/Main.xmlui.xs": `
import { helper } from './invalid.xs';

function test() {
  return helper();
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      expect(Object.keys(result.moduleErrors)).toHaveLength(1);
      expect(result.moduleErrors["/invalid.xs"]).toBeDefined();
      expect(result.moduleErrors["/invalid.xs"]).toHaveLength(1);
      expect(result.moduleErrors["/invalid.xs"][0].code).toBe("W044");
      expect(result.moduleErrors["/invalid.xs"][0].text).toContain("const/let");
      expect(result.moduleErrors["/invalid.xs"][0].text).toContain("MAX_VALUE");
    });

    it("should raise error W044 for let declaration", async () => {
      const modules: Record<string, string> = {
        "/invalid.xs": `
function helper() {
  return 42;
}

let counter = 0;`,
        "/Main.xmlui.xs": `
import { helper } from './invalid.xs';

function test() {
  return helper();
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      expect(Object.keys(result.moduleErrors)).toHaveLength(1);
      expect(result.moduleErrors["/invalid.xs"]).toBeDefined();
      expect(result.moduleErrors["/invalid.xs"]).toHaveLength(1);
      expect(result.moduleErrors["/invalid.xs"][0].code).toBe("W044");
      expect(result.moduleErrors["/invalid.xs"][0].text).toContain("const/let");
      expect(result.moduleErrors["/invalid.xs"][0].text).toContain("counter");
    });

    it("should raise error W044 for multiple const/let declarations", async () => {
      const modules: Record<string, string> = {
        "/invalid.xs": `
function helper() {
  return 1;
}

const API_KEY = "secret";
let state = "idle";
const TIMEOUT = 5000;`,
        "/Main.xmlui.xs": `
import { helper } from './invalid.xs';

function test() {
  return helper();
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      expect(Object.keys(result.moduleErrors)).toHaveLength(1);
      expect(result.moduleErrors["/invalid.xs"]).toBeDefined();
      // Three declarations = 3 errors
      expect(result.moduleErrors["/invalid.xs"].length).toBeGreaterThanOrEqual(3);
      result.moduleErrors["/invalid.xs"].forEach((error) => {
        expect(error.code).toBe("W044");
      });
    });
  });

  describe("Warning: Other statement types (W045)", () => {
    it("should log warning for expression statements", async () => {
      const consoleSpy = vi.spyOn(console, "warn");

      const modules: Record<string, string> = {
        "/invalid.xs": `
function helper() {
  return 42;
}

1 + 2;`,
        "/Main.xmlui.xs": `
import { helper } from './invalid.xs';

function test() {
  return helper();
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      // Should not have errors (warnings don't block)
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
      
      // Should have logged a warning
      expect(consoleSpy).toHaveBeenCalled();
      const warningCalls = consoleSpy.mock.calls.filter((call) =>
        call[0].includes("W045"),
      );
      expect(warningCalls.length).toBeGreaterThan(0);
      expect(warningCalls[0][0]).toContain("/invalid.xs");
      expect(warningCalls[0][0]).toContain("W045");

      consoleSpy.mockRestore();
    });

    it("should log warning for if statements", async () => {
      const consoleSpy = vi.spyOn(console, "warn");

      const modules: Record<string, string> = {
        "/invalid.xs": `
function helper() {
  return 42;
}

if (true) {
  // Do something
}`,
        "/Main.xmlui.xs": `
import { helper } from './invalid.xs';

function test() {
  return helper();
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalled();
      const warningCalls = consoleSpy.mock.calls.filter((call) =>
        call[0].includes("W045"),
      );
      expect(warningCalls.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    it("should log warning for while statements", async () => {
      const consoleSpy = vi.spyOn(console, "warn");

      const modules: Record<string, string> = {
        "/invalid.xs": `
function helper() {
  return 1;
}

while (false) {
  // Never runs
}`,
        "/Main.xmlui.xs": `
import { helper } from './invalid.xs';

function test() {
  return helper();
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should log warning for try-catch statements", async () => {
      const consoleSpy = vi.spyOn(console, "warn");

      const modules: Record<string, string> = {
        "/invalid.xs": `
function helper() {
  return 1;
}

try {
  // Some code
} catch (e) {
  // Handle error
}`,
        "/Main.xmlui.xs": `
import { helper } from './invalid.xs';

function test() {
  return helper();
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("Mixed validation scenarios", () => {
    it("should report both errors and warnings", async () => {
      const consoleSpy = vi.spyOn(console, "warn");

      const modules: Record<string, string> = {
        "/invalid.xs": `
function helper() {
  return 1;
}

var x = 3;
const Y = 5;

if (true) {
  console.log("test");
}`,
        "/Main.xmlui.xs": `
import { helper } from './invalid.xs';

function test() {
  return helper();
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      // Should have errors for var and const
      expect(Object.keys(result.moduleErrors)).toHaveLength(1);
      expect(result.moduleErrors["/invalid.xs"]).toBeDefined();
      expect(result.moduleErrors["/invalid.xs"].length).toBeGreaterThanOrEqual(2);
      
      // Should have warnings for if statement
      expect(consoleSpy).toHaveBeenCalled();
      const warningCalls = consoleSpy.mock.calls.filter((call) =>
        call[0].includes("W045"),
      );
      expect(warningCalls.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    it("should validate nested imported modules", async () => {
      const modules: Record<string, string> = {
        "/base.xs": `
function base() {
  return 1;
}

var globalState = 0;`,
        "/middle.xs": `
import { base } from './base.xs';

function middle() {
  return base();
}`,
        "/Main.xmlui.xs": `
import { middle } from './middle.xs';

function top() {
  return middle();
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      // Should propagate error from base module
      expect(Object.keys(result.moduleErrors)).toHaveLength(1);
      expect(result.moduleErrors["/base.xs"]).toBeDefined();
      expect(result.moduleErrors["/base.xs"][0].code).toBe("W043");
    });

    it("should allow var/const/let in main module but not in imported modules", async () => {
      const modules: Record<string, string> = {
        "/utils.xs": `
function helper() {
  return 42;
}`,
        "/Main.xmlui.xs": `
import { helper } from './utils.xs';

var localState = 0;
const MAX = 100;
let counter = 0;

function test() {
  return helper();
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      // Main module can have var/const/let - no errors expected
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
      expect(result.functions).toHaveProperty("test");
      expect(result.functions).toHaveProperty("helper");
    });
  });

  describe("Edge cases", () => {
    it("should handle importing from invalid module but not using the import", async () => {
      const modules: Record<string, string> = {
        "/invalid.xs": `
function helper() {
  return 1;
}

var x = 3;`,
        "/Main.xmlui.xs": `
import { helper } from './invalid.xs';

function test() {
  // Not using helper
  return 1;
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      // Even if not using the import, should still validate and report errors
      expect(Object.keys(result.moduleErrors)).toHaveLength(1);
      expect(result.moduleErrors["/invalid.xs"]).toBeDefined();
    });

    it("should validate all imported modules even if not using their exports", async () => {
      const modules: Record<string, string> = {
        "/invalid1.xs": `
function fn1() { return 1; }
var x = 1;`,
        "/invalid2.xs": `
function fn2() { return 2; }
let y = 2;`,
        "/Main.xmlui.xs": `
import { fn1 } from './invalid1.xs';
import { fn2 } from './invalid2.xs';

function test() {
  return 1;
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/Main.xmlui.xs",
        modules["/Main.xmlui.xs"],
        fetcher,
      );

      // Both modules should report errors
      expect(Object.keys(result.moduleErrors).length).toBeGreaterThanOrEqual(2);
      expect(result.moduleErrors["/invalid1.xs"]).toBeDefined();
      expect(result.moduleErrors["/invalid2.xs"]).toBeDefined();
    });
  });
});
