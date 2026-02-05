import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  ModuleResolver,
  type ModuleFetcher,
} from "../../../src/parsers/scripting/ModuleResolver";

describe("ModuleResolver - Module Fetching", () => {
  beforeEach(() => {
    // Clear cache before each test
    ModuleResolver.clearCache();
    // Reset fetcher
    ModuleResolver.setCustomFetcher(null);
  });

  afterEach(() => {
    // Clean up after each test
    ModuleResolver.clearCache();
    ModuleResolver.setCustomFetcher(null);
  });

  describe("Successful Module Fetching", () => {
    it("should fetch a module with custom fetcher", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/helpers.xs") {
          return "export function add(a, b) { return a + b; }";
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      const module = await ModuleResolver.resolveModule("/helpers.xs");

      expect(module.path).toBe("/helpers.xs");
      expect(module.content).toBe(
        "export function add(a, b) { return a + b; }",
      );
      expect(module.lastModified).toBeGreaterThan(0);
    });

    it("should resolve and fetch module in one call", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/lib/helpers.xs") {
          return "export const version = '1.0';";
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      const module = await ModuleResolver.resolveAndFetchModule(
        "./helpers.xs",
        "/lib/index.xs",
      );

      expect(module.path).toBe("/lib/helpers.xs");
      expect(module.content).toBe("export const version = '1.0';");
    });

    it("should fetch module with different extensions", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/utils.ts") {
          return "export function util() {}";
        }
        if (path === "/types.tsx") {
          return "export type MyType = string;";
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      const tsModule = await ModuleResolver.resolveModule("/utils.ts");
      const tsxModule = await ModuleResolver.resolveModule("/types.tsx");

      expect(tsModule.content).toBe("export function util() {}");
      expect(tsxModule.content).toBe("export type MyType = string;");
    });

    it("should fetch module with complex content", async () => {
      const complexContent = `
export interface Config {
  name: string;
  version: string;
}

export function createConfig(name: string): Config {
  return { name, version: '1.0' };
}

export class ConfigBuilder {
  private config: Config;
  
  constructor(name: string) {
    this.config = { name, version: '1.0' };
  }
}
`;

      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/config/builder.xs") {
          return complexContent;
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      const module = await ModuleResolver.resolveModule("/config/builder.xs");

      expect(module.content).toBe(complexContent);
      expect(module.content).toContain("export interface Config");
      expect(module.content).toContain("export class ConfigBuilder");
    });
  });

  describe("Caching Behavior", () => {
    it("should cache fetched modules", async () => {
      let fetchCount = 0;

      const fetcher: ModuleFetcher = async (path: string) => {
        fetchCount++;
        if (path === "/cache-test.xs") {
          return "export function test() {}";
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      // First fetch
      const module1 = await ModuleResolver.resolveModule("/cache-test.xs");
      expect(fetchCount).toBe(1);

      // Second fetch - should use cache
      const module2 = await ModuleResolver.resolveModule("/cache-test.xs");
      expect(fetchCount).toBe(1); // No additional fetch

      // Both should have same content
      expect(module1.content).toBe(module2.content);
      expect(module1.path).toBe(module2.path);
    });

    it("should cache different modules separately", async () => {
      let fetchCount = 0;

      const fetcher: ModuleFetcher = async (path: string) => {
        fetchCount++;
        if (path === "/mod1.xs") {
          return "export const mod1 = 1;";
        }
        if (path === "/mod2.xs") {
          return "export const mod2 = 2;";
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      const m1a = await ModuleResolver.resolveModule("/mod1.xs");
      expect(fetchCount).toBe(1);

      const m2a = await ModuleResolver.resolveModule("/mod2.xs");
      expect(fetchCount).toBe(2);

      const m1b = await ModuleResolver.resolveModule("/mod1.xs");
      expect(fetchCount).toBe(2); // No fetch for mod1 again

      expect(m1a.path).toBe(m1b.path);
      expect(m1a.content).toBe(m1b.content);
    });

    it("should clear cache when clearCache() is called", async () => {
      let fetchCount = 0;

      const fetcher: ModuleFetcher = async (path: string) => {
        fetchCount++;
        if (path === "/clearable.xs") {
          return "export function clearable() {}";
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      // First fetch
      await ModuleResolver.resolveModule("/clearable.xs");
      expect(fetchCount).toBe(1);

      // Second fetch from cache
      await ModuleResolver.resolveModule("/clearable.xs");
      expect(fetchCount).toBe(1);

      // Clear cache
      ModuleResolver.clearCache();

      // Third fetch should hit fetcher again
      await ModuleResolver.resolveModule("/clearable.xs");
      expect(fetchCount).toBe(2);
    });

    it("should update lastModified timestamp only on fresh fetch", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/timestamp.xs") {
          return "export const ts = Date.now();";
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      const module1 = await ModuleResolver.resolveModule("/timestamp.xs");
      const timestamp1 = module1.lastModified;

      // Wait a bit and fetch again (should be cached)
      await new Promise((resolve) => setTimeout(resolve, 10));
      const module2 = await ModuleResolver.resolveModule("/timestamp.xs");
      const timestamp2 = module2.lastModified;

      // Timestamps should be the same (cached)
      expect(timestamp1).toBe(timestamp2);

      // Clear cache and fetch again
      ModuleResolver.clearCache();
      const module3 = await ModuleResolver.resolveModule("/timestamp.xs");
      const timestamp3 = module3.lastModified;

      // New timestamp should be >= old timestamp
      expect(timestamp3).toBeGreaterThanOrEqual(timestamp1);
    });
  });

  describe("Error Handling", () => {
    it("should throw error when module not found", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      await expect(
        ModuleResolver.resolveModule("/nonexistent.xs"),
      ).rejects.toThrow("Failed to fetch module at /nonexistent.xs");
    });

    it("should throw error when fetcher throws", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        throw new Error("Access denied");
      };

      ModuleResolver.setCustomFetcher(fetcher);

      await expect(
        ModuleResolver.resolveModule("/forbidden.xs"),
      ).rejects.toThrow("Access denied");
    });

    it("should throw error when no fetcher configured", async () => {
      // Don't set a fetcher
      await expect(
        ModuleResolver.resolveModule("/test.xs"),
      ).rejects.toThrow("No custom fetcher configured");
    });

    it("should wrap fetch errors with module path context", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/wrapped.xs") {
          throw new Error("Original error message");
        }
        throw new Error("Module not found");
      };

      ModuleResolver.setCustomFetcher(fetcher);

      await expect(
        ModuleResolver.resolveModule("/wrapped.xs"),
      ).rejects.toThrow("Failed to fetch module at /wrapped.xs");

      await expect(
        ModuleResolver.resolveModule("/wrapped.xs"),
      ).rejects.toThrow("Original error message");
    });
  });

  describe("Integration with Path Resolution", () => {
    it("should resolve and fetch module from different directories", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/components/helpers/formatter.xs") {
          return "export function format() {}";
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      // From /components/Button.xmlui
      const module = await ModuleResolver.resolveAndFetchModule(
        "./helpers/formatter.xs",
        "/components/Button.xmlui",
      );

      expect(module.path).toBe("/components/helpers/formatter.xs");
      expect(module.content).toContain("export function format");
    });

    it("should resolve and fetch module with parent directory reference", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/lib/utils.xs") {
          return "export function util() {}";
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      // From /components/nested/Button.xmlui to /lib/utils.xs
      const module = await ModuleResolver.resolveAndFetchModule(
        "../../lib/utils.xs",
        "/components/nested/Button.xmlui",
      );

      expect(module.path).toBe("/lib/utils.xs");
    });

    it("should resolve complex paths and fetch", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/shared/common/helpers.xs") {
          return "export const helpers = {};";
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      const module = await ModuleResolver.resolveAndFetchModule(
        "../../../shared/common/helpers.xs",
        "/components/specific/feature/Component.xs",
      );

      expect(module.path).toBe("/shared/common/helpers.xs");
      expect(module.content).toContain("helpers");
    });
  });

  describe("Module Metadata", () => {
    it("should return complete module metadata", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/test.xs") {
          return "export const test = true;";
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      const module = await ModuleResolver.resolveModule("/test.xs");

      // Verify all properties exist
      expect(module).toHaveProperty("path");
      expect(module).toHaveProperty("content");
      expect(module).toHaveProperty("lastModified");

      // Verify types
      expect(typeof module.path).toBe("string");
      expect(typeof module.content).toBe("string");
      expect(typeof module.lastModified).toBe("number");

      // Verify values
      expect(module.path).toBe("/test.xs");
      expect(module.content.length).toBeGreaterThan(0);
      expect(module.lastModified).toBeGreaterThan(0);
    });

    it("should preserve exact content without modification", async () => {
      const originalContent = `
// Comment with special chars: @ # $ % ^ & * ( )
export const config = {
  setting: "value with\\nnewlines",
  number: 42,
  boolean: true,
};

export function doSomething() {
  return "done";
}
`;

      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/special.xs") {
          return originalContent;
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      const module = await ModuleResolver.resolveModule("/special.xs");

      // Content should be exactly the same
      expect(module.content).toBe(originalContent);
    });

    it("should handle empty module content", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/empty.xs") {
          return "";
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      const module = await ModuleResolver.resolveModule("/empty.xs");

      expect(module.path).toBe("/empty.xs");
      expect(module.content).toBe("");
      expect(module.lastModified).toBeGreaterThan(0);
    });
  });

  describe("Fetcher Switching", () => {
    it("should switch between fetchers", async () => {
      const fetcher1: ModuleFetcher = async (path: string) => {
        if (path === "/test.xs") {
          return "version 1";
        }
        throw new Error(`Module not found: ${path}`);
      };

      const fetcher2: ModuleFetcher = async (path: string) => {
        if (path === "/test.xs") {
          return "version 2";
        }
        throw new Error(`Module not found: ${path}`);
      };

      // Use fetcher 1
      ModuleResolver.setCustomFetcher(fetcher1);
      ModuleResolver.clearCache();
      let module = await ModuleResolver.resolveModule("/test.xs");
      expect(module.content).toBe("version 1");

      // Switch to fetcher 2
      ModuleResolver.setCustomFetcher(fetcher2);
      ModuleResolver.clearCache();
      module = await ModuleResolver.resolveModule("/test.xs");
      expect(module.content).toBe("version 2");
    });

    it("should reset fetcher to null", async () => {
      const fetcher: ModuleFetcher = async () => "content";
      ModuleResolver.setCustomFetcher(fetcher);

      // Reset to null
      ModuleResolver.setCustomFetcher(null);

      await expect(
        ModuleResolver.resolveModule("/test.xs"),
      ).rejects.toThrow("No custom fetcher configured");
    });
  });

  describe("Multiple Module Fetches", () => {
    it("should fetch multiple modules in sequence", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        const modules: { [key: string]: string } = {
          "/mod1.xs": "export const m1 = 1;",
          "/mod2.xs": "export const m2 = 2;",
          "/mod3.xs": "export const m3 = 3;",
        };
        if (modules[path]) {
          return modules[path];
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      const m1 = await ModuleResolver.resolveModule("/mod1.xs");
      const m2 = await ModuleResolver.resolveModule("/mod2.xs");
      const m3 = await ModuleResolver.resolveModule("/mod3.xs");

      expect(m1.content).toBe("export const m1 = 1;");
      expect(m2.content).toBe("export const m2 = 2;");
      expect(m3.content).toBe("export const m3 = 3;");
    });

    it("should handle mixture of cached and fresh fetches", async () => {
      let callCount = 0;

      const fetcher: ModuleFetcher = async (path: string) => {
        callCount++;
        if (path === "/static.xs") {
          return "static content";
        }
        if (path === "/dynamic.xs") {
          return `dynamic call ${callCount}`;
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(fetcher);

      // Fetch static twice (once fresh, once cached)
      const s1 = await ModuleResolver.resolveModule("/static.xs");
      const s2 = await ModuleResolver.resolveModule("/static.xs");

      // Fetch dynamic (different each time)
      const d1 = await ModuleResolver.resolveModule("/dynamic.xs");

      // Clear and fetch again
      ModuleResolver.clearCache();
      const s3 = await ModuleResolver.resolveModule("/static.xs");

      expect(s1.content).toBe(s2.content);
      expect(s1.content).toBe("static content");
      expect(s3.content).toBe("static content");
      expect(callCount).toBe(3); // static (2), dynamic (1) before clear, static (1) after
    });
  });
});
