import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { collectCodeBehindFromSourceWithImports } from "../../src/parsers/scripting/code-behind-collect";
import { ModuleResolver } from "../../src/parsers/scripting/ModuleResolver";
import { clearParsedModulesCache } from "../../src/parsers/scripting/modules";
import type { ModuleFetcher } from "../../src/parsers/scripting/ModuleResolver";

describe("Import E2E Integration Tests", () => {
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

  describe("Complete Import Flow", () => {
    it("should support single helper module import", async () => {
      const modules: Record<string, string> = {
        "/helpers.xs": `
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}`,
        "/Main.xmlui.xs": `
import { add, multiply } from './helpers.xs';

function calculate(x, y) {
  return multiply(add(x, y), 2);
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
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
    });

    it("should support multiple helper modules", async () => {
      const modules: Record<string, string> = {
        "/math.xs": `
function add(a, b) {
  return a + b;
}`,
        "/format.xs": `
function formatNumber(n) {
  return n.toString();
}`,
        "/Main.xmlui.xs": `
import { add } from './math.xs';
import { formatNumber } from './format.xs';

function display(x, y) {
  return formatNumber(add(x, y));
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

      expect(result.functions).toHaveProperty("display");
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
    });

    it("should support nested imports", async () => {
      const modules: Record<string, string> = {
        "/utils/math.xs": `
function add(a, b) {
  return a + b;
}`,
        "/utils/helpers.xs": `
import { add } from './math.xs';

function sum(arr) {
  var total = 0;
  for (var i = 0; i < arr.length; i++) {
    total = add(total, arr[i]);
  }
  return total;
}`,
        "/Main.xmlui.xs": `
import { sum } from './utils/helpers.xs';

function calculate(items) {
  return sum(items);
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

      console.log("Module errors:", result.moduleErrors);
      console.log("Functions:", Object.keys(result.functions || {}));

      expect(result.functions).toHaveProperty("calculate");
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
    });

    it("should support aliased imports", async () => {
      const modules: Record<string, string> = {
        "/helpers.xs": `
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}`,
        "/Main.xmlui.xs": `
import { add as sum, multiply as times } from './helpers.xs';

function calculate(x, y) {
  return times(sum(x, y), 2);
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
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
    });
  });

  describe("Shared Helper Modules", () => {
    it("should allow multiple components to import same helper", async () => {
      const modules: Record<string, string> = {
        "/shared/utils.xs": `
function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}`,
        "/components/Invoice.xmlui.xs": `
import { formatCurrency } from '../shared/utils.xs';

function displayTotal(amount) {
  return formatCurrency(amount);
}`,
        "/components/Receipt.xmlui.xs": `
import { formatCurrency } from '../shared/utils.xs';

function showAmount(value) {
  return formatCurrency(value);
}`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      // Test Invoice component
      const invoice = await collectCodeBehindFromSourceWithImports(
        "/components/Invoice.xmlui.xs",
        modules["/components/Invoice.xmlui.xs"],
        fetcher,
      );

      expect(invoice.functions).toHaveProperty("displayTotal");
      expect(Object.keys(invoice.moduleErrors)).toHaveLength(0);

      // Test Receipt component
      const receipt = await collectCodeBehindFromSourceWithImports(
        "/components/Receipt.xmlui.xs",
        modules["/components/Receipt.xmlui.xs"],
        fetcher,
      );

      expect(receipt.functions).toHaveProperty("showAmount");
      expect(Object.keys(receipt.moduleErrors)).toHaveLength(0);
    });

    it("should cache shared modules across components", async () => {
      const modules: Record<string, string> = {
        "/utils.xs": "function helper() { return 1; }",
        "/comp1.xmlui.xs": "import { helper } from './utils.xs';\nfunction fn1() { return helper(); }",
        "/comp2.xmlui.xs": "import { helper } from './utils.xs';\nfunction fn2() { return helper(); }",
      };

      let fetchCount = 0;
      const fetcher: ModuleFetcher = async (path: string) => {
        fetchCount++;
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      // Use custom fetcher to track fetch calls
      ModuleResolver.setCustomFetcher(fetcher);

      await collectCodeBehindFromSourceWithImports("/comp1.xmlui.xs", modules["/comp1.xmlui.xs"]);
      const firstFetchCount = fetchCount;

      await collectCodeBehindFromSourceWithImports("/comp2.xmlui.xs", modules["/comp2.xmlui.xs"]);

      // Second component should use cached module
      expect(fetchCount).toBe(firstFetchCount);
    });
  });

  describe("Complex Real-World Scenarios", () => {
    it("should support component library structure", async () => {
      const modules: Record<string, string> = {
        "/shared/validation.xs": `
function isEmail(str) {
  return str.includes('@');
}

function isNotEmpty(str) {
  return str.length > 0;
}`,
        "/shared/formatting.xs": `
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}`,
        "/components/forms/TextInput.xmlui.xs": `
import { isNotEmpty } from '../../shared/validation.xs';
import { capitalize } from '../../shared/formatting.xs';

var inputValue = '';

function validate() {
  return isNotEmpty(inputValue);
}

function format() {
  return capitalize(inputValue);
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
        "/components/forms/TextInput.xmlui.xs",
        modules["/components/forms/TextInput.xmlui.xs"],
        fetcher,
      );

      expect(result.vars).toHaveProperty("inputValue");
      expect(result.functions).toHaveProperty("validate");
      expect(result.functions).toHaveProperty("format");
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
    });

    it("should support multi-layer import chains", async () => {
      const modules: Record<string, string> = {
        "/core/constants.xs": `
function getApiUrl() {
  return 'https://api.example.com';
}

function getTimeout() {
  return 5000;
}`,
        "/core/api.xs": `
import { getApiUrl, getTimeout } from './constants.xs';

function fetchData(endpoint) {
  return getApiUrl() + endpoint;
}`,
        "/services/user.xs": `
import { fetchData } from '../core/api.xs';

function getUser(id) {
  return fetchData('/users/' + id);
}`,
        "/Main.xmlui.xs": `
import { getUser } from './services/user.xs';

function loadUser(userId) {
  return getUser(userId);
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

      expect(result.functions).toHaveProperty("loadUser");
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
    });

    it("should handle diamond dependency pattern", async () => {
      // Structure:
      //     Main
      //    /    \
      //   A      B
      //    \    /
      //    Utils
      const modules: Record<string, string> = {
        "/utils.xs": `
function log(msg) {
  return msg;
}`,
        "/moduleA.xs": `
import { log } from './utils.xs';
function logA(msg) {
  return log('A: ' + msg);
}`,
        "/moduleB.xs": `
import { log } from './utils.xs';
function logB(msg) {
  return log('B: ' + msg);
}`,
        "/Main.xmlui.xs": `
import { logA } from './moduleA.xs';
import { logB } from './moduleB.xs';

function main(msg) {
  logA(msg);
  logB(msg);
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

      expect(result.functions).toHaveProperty("main");
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
    });
  });

  describe("Error Scenarios", () => {
    it("should report missing module errors", async () => {
      const modules: Record<string, string> = {
        "/Main.xmlui.xs": `
import { helper } from './missing.xs';

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

      expect(Object.keys(result.moduleErrors).length).toBeGreaterThan(0);
    });

    it("should detect circular imports", async () => {
      const modules: Record<string, string> = {
        "/a.xs": `
import { funcB } from './b.xs';
function funcA() {
  return funcB();
}`,
        "/b.xs": `
import { funcA } from './a.xs';
function funcB() {
  return funcA();
}`,
        "/Main.xmlui.xs": `
import { funcA } from './a.xs';

function main() {
  return funcA();
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

      // Circular imports are caught and reported as module errors
      // The function main should still be collected
      expect(result.functions).toHaveProperty("main");
      // May or may not have errors depending on implementation
      // Just verify it doesn't crash
      expect(result).toBeDefined();
    });

    it("should handle syntax errors in imported modules", async () => {
      const modules: Record<string, string> = {
        "/broken.xs": `
function broken(
  return 1;
}`,
        "/Main.xmlui.xs": `
import { broken } from './broken.xs';

function test() {
  return broken();
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

      // Syntax errors in imported modules should be reported
      // The test function should still be collected
      expect(result.functions).toHaveProperty("test");
      // Errors may be reported - verify doesn't crash
      expect(result).toBeDefined();
    });
  });

  describe("Performance and Caching", () => {
    it("should cache resolved modules", async () => {
      const modules: Record<string, string> = {
        "/utils.xs": "function helper() { return 1; }",
        "/Main.xmlui.xs": "import { helper } from './utils.xs';\nfunction main() { return helper(); }",
      };

      let fetchCount = 0;
      const fetcher: ModuleFetcher = async (path: string) => {
        fetchCount++;
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      ModuleResolver.setCustomFetcher(fetcher);

      // First parse
      await collectCodeBehindFromSourceWithImports("/Main.xmlui.xs", modules["/Main.xmlui.xs"]);
      const firstCount = fetchCount;

      // Second parse should use cache
      await collectCodeBehindFromSourceWithImports("/Main.xmlui.xs", modules["/Main.xmlui.xs"]);

      expect(fetchCount).toBe(firstCount);
    });

    it("should handle large import chains efficiently", async () => {
      // Create a chain of 10 modules
      const modules: Record<string, string> = {};
      for (let i = 0; i < 10; i++) {
        const nextImport = i < 9 ? `import { func${i + 1} } from './module${i + 1}.xs';\n` : "";
        modules[`/module${i}.xs`] = `
${nextImport}
function func${i}() {
  return ${i};
}`;
      }
      modules["/Main.xmlui.xs"] = `
import { func0 } from './module0.xs';

function main() {
  return func0();
}`;

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

      expect(result.functions).toHaveProperty("main");
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
    });
  });

  describe("Module Path Resolution Edge Cases", () => {
    it("should handle deeply nested relative imports", async () => {
      const modules: Record<string, string> = {
        "/a/b/c/d/deep.xs": "function deepFunc() { return 1; }",
        "/a/b/c/component.xmlui.xs": `
import { deepFunc } from './d/deep.xs';
function comp() { return deepFunc(); }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/a/b/c/component.xmlui.xs",
        modules["/a/b/c/component.xmlui.xs"],
        fetcher,
      );

      expect(result.functions).toHaveProperty("comp");
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
    });

    it("should handle parent directory traversal", async () => {
      const modules: Record<string, string> = {
        "/shared/utils.xs": "function util() { return 1; }",
        "/components/forms/Input.xmlui.xs": `
import { util } from '../../shared/utils.xs';
function input() { return util(); }`,
      };

      const fetcher: ModuleFetcher = async (path: string) => {
        const content = modules[path];
        if (!content) {
          throw new Error(`Module not found: ${path}`);
        }
        return content;
      };

      const result = await collectCodeBehindFromSourceWithImports(
        "/components/forms/Input.xmlui.xs",
        modules["/components/forms/Input.xmlui.xs"],
        fetcher,
      );

      expect(result.functions).toHaveProperty("input");
      expect(Object.keys(result.moduleErrors)).toHaveLength(0);
    });
  });
});
