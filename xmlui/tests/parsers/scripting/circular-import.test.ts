import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  ModuleResolver,
  type ModuleFetcher,
} from "../../../src/parsers/scripting/ModuleResolver";

describe("ModuleResolver - Circular Import Detection", () => {
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

  describe("Direct Circular Imports", () => {
    it("should detect A imports B, B imports A", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/a.xs") {
            await ModuleResolver.resolveModule("/b.xs");
            return `export const a = 1;`;
          }
          if (path === "/b.xs") {
            await ModuleResolver.resolveModule("/a.xs");
            return `export const b = 2;`;
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      await expect(
        ModuleResolver.resolveModule("/a.xs"),
      ).rejects.toThrow("Circular import");
    });

    it("should detect self-import", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/self.xs") {
          // Simulate self-import by resolving the same module again
          return `import { x } from './self.xs';`;
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/self.xs") {
            // Try to resolve self while already resolving
            await ModuleResolver.resolveModule("/self.xs");
            return `import { x } from './self.xs';`;
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      await expect(
        ModuleResolver.resolveModule("/self.xs"),
      ).rejects.toThrow("Circular import");
    });

    it("should detect A imports A directly", async () => {
      const fetcher: ModuleFetcher = async (path: string) => {
        if (path === "/direct.xs") {
          // Direct self-reference
          return "export function fn() {}";
        }
        throw new Error(`Module not found: ${path}`);
      };

      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/direct.xs") {
            // During resolution, try to resolve self
            await ModuleResolver.resolveModule("/direct.xs");
            return "export function fn() {}";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      await expect(
        ModuleResolver.resolveModule("/direct.xs"),
      ).rejects.toThrow("Circular import");
    });
  });

  describe("Indirect Circular Imports", () => {
    it("should detect A imports B, B imports C, C imports A", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/a.xs") {
            await ModuleResolver.resolveModule("/b.xs");
            return "export const a = 1;";
          }
          if (path === "/b.xs") {
            await ModuleResolver.resolveModule("/c.xs");
            return "export const b = 2;";
          }
          if (path === "/c.xs") {
            await ModuleResolver.resolveModule("/a.xs");
            return "export const c = 3;";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      await expect(
        ModuleResolver.resolveModule("/a.xs"),
      ).rejects.toThrow("Circular import");
    });

    it("should detect A imports B, B imports C, C imports D, D imports A", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/a.xs") {
            await ModuleResolver.resolveModule("/b.xs");
            return "export const a = 1;";
          }
          if (path === "/b.xs") {
            await ModuleResolver.resolveModule("/c.xs");
            return "export const b = 2;";
          }
          if (path === "/c.xs") {
            await ModuleResolver.resolveModule("/d.xs");
            return "export const c = 3;";
          }
          if (path === "/d.xs") {
            await ModuleResolver.resolveModule("/a.xs");
            return "export const d = 4;";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      await expect(
        ModuleResolver.resolveModule("/a.xs"),
      ).rejects.toThrow("Circular import");
    });

    it("should detect complex chain: A→B→C→B", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/a.xs") {
            await ModuleResolver.resolveModule("/b.xs");
            return "export const a = 1;";
          }
          if (path === "/b.xs") {
            await ModuleResolver.resolveModule("/c.xs");
            return "export const b = 2;";
          }
          if (path === "/c.xs") {
            await ModuleResolver.resolveModule("/b.xs");
            return "export const c = 3;";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      await expect(
        ModuleResolver.resolveModule("/a.xs"),
      ).rejects.toThrow("Circular import");
    });
  });

  describe("Non-Circular Imports", () => {
    it("should allow A imports B without circular dependency", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/a.xs") {
            await ModuleResolver.resolveModule("/b.xs");
            return "export const a = 1;";
          }
          if (path === "/b.xs") {
            return "export const b = 2;";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      const moduleA = await ModuleResolver.resolveModule("/a.xs");
      expect(moduleA.path).toBe("/a.xs");
    });

    it("should allow diamond dependency (no cycle)", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/a.xs") {
            await ModuleResolver.resolveModule("/b.xs");
            await ModuleResolver.resolveModule("/c.xs");
            return "export const a = 1;";
          }
          if (path === "/b.xs") {
            await ModuleResolver.resolveModule("/d.xs");
            return "export const b = 2;";
          }
          if (path === "/c.xs") {
            await ModuleResolver.resolveModule("/d.xs");
            return "export const c = 3;";
          }
          if (path === "/d.xs") {
            return "export const d = 4;";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      const moduleA = await ModuleResolver.resolveModule("/a.xs");
      expect(moduleA.path).toBe("/a.xs");
    });

    it("should allow linear import chain A→B→C→D", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/a.xs") {
            await ModuleResolver.resolveModule("/b.xs");
            return "export const a = 1;";
          }
          if (path === "/b.xs") {
            await ModuleResolver.resolveModule("/c.xs");
            return "export const b = 2;";
          }
          if (path === "/c.xs") {
            await ModuleResolver.resolveModule("/d.xs");
            return "export const c = 3;";
          }
          if (path === "/d.xs") {
            return "export const d = 4;";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      const moduleA = await ModuleResolver.resolveModule("/a.xs");
      expect(moduleA.path).toBe("/a.xs");
    });
  });

  describe("Error Messages", () => {
    it("should provide circular chain in error message", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/a.xs") {
            await ModuleResolver.resolveModule("/b.xs");
            return "export const a = 1;";
          }
          if (path === "/b.xs") {
            await ModuleResolver.resolveModule("/a.xs");
            return "export const b = 2;";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      try {
        await ModuleResolver.resolveModule("/a.xs");
        expect.fail("Should have thrown");
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain("Circular import");
        expect(message).toContain("/a.xs");
        expect(message).toContain("/b.xs");
        expect(message).toContain("→");
      }
    });

    it("should show full chain in multi-step cycle", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/a.xs") {
            await ModuleResolver.resolveModule("/b.xs");
            return "a";
          }
          if (path === "/b.xs") {
            await ModuleResolver.resolveModule("/c.xs");
            return "b";
          }
          if (path === "/c.xs") {
            await ModuleResolver.resolveModule("/a.xs");
            return "c";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      try {
        await ModuleResolver.resolveModule("/a.xs");
        expect.fail("Should have thrown");
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain("/a.xs");
        expect(message).toContain("/b.xs");
        expect(message).toContain("/c.xs");
      }
    });
  });

  describe("Stack Management", () => {
    it("should reset stack after successful resolution", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/test.xs") {
            return "export const test = 1;";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();
      await ModuleResolver.resolveModule("/test.xs");
      ModuleResolver.resetImportStack(); // Simulate reset after parsing

      // Should not throw even if we resolve the same module again
      const module = await ModuleResolver.resolveModule("/test.xs");
      expect(module.path).toBe("/test.xs");
    });

    it("should clear stack on error", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/error.xs") {
            throw new Error("Fetch error");
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      try {
        await ModuleResolver.resolveModule("/error.xs");
      } catch (error) {
        // Error expected
      }

      // Stack should be empty after error
      ModuleResolver.resetImportStack();

      // Should work on retry with different module
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/ok.xs") {
            return "ok";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      const module = await ModuleResolver.resolveModule("/ok.xs");
      expect(module.path).toBe("/ok.xs");
    });

    it("should track stack correctly through nested imports", async () => {
      const stackSnapshots: string[][] = [];

      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          // Take a snapshot of the stack at each fetch
          if (path === "/a.xs") {
            await ModuleResolver.resolveModule("/b.xs");
            return "a";
          }
          if (path === "/b.xs") {
            await ModuleResolver.resolveModule("/c.xs");
            return "b";
          }
          if (path === "/c.xs") {
            return "c";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();
      await ModuleResolver.resolveModule("/a.xs");

      // Verify imports resolved in correct order
      const cacheKeys = Array.from((ModuleResolver as any).moduleCache.keys());
      expect(cacheKeys).toContain("/a.xs");
      expect(cacheKeys).toContain("/b.xs");
      expect(cacheKeys).toContain("/c.xs");
    });
  });

  describe("Caching with Circular Detection", () => {
    it("should not cache circular imports", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/a.xs") {
            await ModuleResolver.resolveModule("/b.xs");
            return "a";
          }
          if (path === "/b.xs") {
            await ModuleResolver.resolveModule("/a.xs");
            return "b";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      try {
        await ModuleResolver.resolveModule("/a.xs");
      } catch (error) {
        // Circular import expected
      }

      // Modules should not be cached if not fully resolved
      ModuleResolver.resetImportStack();

      try {
        await ModuleResolver.resolveModule("/a.xs");
      } catch (error) {
        // Should still fail
        expect((error as Error).message).toContain("Circular");
      }
    });

    it("should allow repeated imports of non-circular modules from cache", async () => {
      let fetchCount = 0;

      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          fetchCount++;
          if (path === "/lib.xs") {
            return "export const lib = 1;";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      // First fetch
      await ModuleResolver.resolveModule("/lib.xs");
      expect(fetchCount).toBe(1);

      // Reset stack and fetch again (should use cache)
      ModuleResolver.resetImportStack();
      await ModuleResolver.resolveModule("/lib.xs");
      expect(fetchCount).toBe(1);

      // Reset stack and fetch again
      ModuleResolver.resetImportStack();
      await ModuleResolver.resolveModule("/lib.xs");
      expect(fetchCount).toBe(1);
    });
  });

  describe("Real-world Scenarios", () => {
    it("should detect cycle in component hierarchy", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/components/Button.xs") {
            await ModuleResolver.resolveModule("/lib/theme.xs");
            return "export class Button {}";
          }
          if (path === "/lib/theme.xs") {
            await ModuleResolver.resolveModule("/components/Button.xs");
            return "export const theme = {}";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      await expect(
        ModuleResolver.resolveModule("/components/Button.xs"),
      ).rejects.toThrow("Circular import");
    });

    it("should handle safe component with shared utilities", async () => {
      ModuleResolver.setCustomFetcher(
        async (path: string) => {
          if (path === "/components/Button.xs") {
            await ModuleResolver.resolveModule("/utils/helpers.xs");
            return "export class Button {}";
          }
          if (path === "/components/Input.xs") {
            await ModuleResolver.resolveModule("/utils/helpers.xs");
            return "export class Input {}";
          }
          if (path === "/utils/helpers.xs") {
            return "export function format() {}";
          }
          throw new Error(`Module not found: ${path}`);
        },
      );

      ModuleResolver.resetImportStack();

      const button = await ModuleResolver.resolveModule(
        "/components/Button.xs",
      );
      expect(button.path).toBe("/components/Button.xs");

      ModuleResolver.resetImportStack();
      const input = await ModuleResolver.resolveModule(
        "/components/Input.xs",
      );
      expect(input.path).toBe("/components/Input.xs");
    });
  });
});
