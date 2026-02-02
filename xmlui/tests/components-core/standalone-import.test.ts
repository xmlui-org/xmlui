import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ModuleResolver } from "../../src/parsers/scripting/ModuleResolver";

// Mock fetch function for testing
const mockFetch = vi.fn();

describe("Standalone App with Imports (Buildless Mode)", () => {
  beforeEach(() => {
    ModuleResolver.clearCache();
    ModuleResolver.resetImportStack();
    ModuleResolver.setCustomFetcher(null);
    vi.clearAllMocks();
  });

  afterEach(() => {
    ModuleResolver.clearCache();
    ModuleResolver.resetImportStack();
    ModuleResolver.setCustomFetcher(null);
  });

  describe("Module Path Resolution", () => {
    it("should resolve relative import paths correctly", () => {
      const fromFile = "/app/Main.xmlui.xs";
      const importPath = "./helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, fromFile);

      expect(resolved).toBe("/app/helpers.xs");
    });

    it("should resolve parent directory imports", () => {
      const fromFile = "/components/button/Button.xmlui.xs";
      const importPath = "../helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, fromFile);

      expect(resolved).toBe("/components/helpers.xs");
    });

    it("should resolve nested relative imports", () => {
      const fromFile = "/src/Main.xmlui.xs";
      const importPath = "./utils/helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, fromFile);

      expect(resolved).toBe("/src/utils/helpers.xs");
    });

    it("should handle multiple parent directory traversals", () => {
      const fromFile = "/a/b/c/component.xmlui.xs";
      const importPath = "../../shared/helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, fromFile);

      expect(resolved).toBe("/a/shared/helpers.xs");
    });

    it("should throw error for absolute imports", () => {
      const fromFile = "/app/Main.xmlui.xs";
      const importPath = "/helpers.xs";

      expect(() => {
        ModuleResolver.resolvePath(importPath, fromFile);
      }).toThrow("must be relative");
    });

    it("should throw error for non-relative imports", () => {
      const fromFile = "/app/Main.xmlui.xs";
      const importPath = "helpers.xs";

      expect(() => {
        ModuleResolver.resolvePath(importPath, fromFile);
      }).toThrow("must be relative");
    });
  });

  describe("Path Resolution Edge Cases", () => {
    it("should handle root file imports", () => {
      const fromFile = "/Main.xmlui.xs";
      const importPath = "./helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, fromFile);

      expect(resolved).toBe("/helpers.xs");
    });

    it("should normalize redundant dots", () => {
      const fromFile = "/app/Main.xmlui.xs";
      const importPath = "./././helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, fromFile);

      expect(resolved).toBe("/app/helpers.xs");
    });

    it("should handle deeply nested structures", () => {
      const fromFile = "/a/b/c/d/e/component.xmlui.xs";
      const importPath = "../../../../shared/helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, fromFile);

      expect(resolved).toBe("/a/shared/helpers.xs");
    });

    it("should throw error if path goes above root", () => {
      const fromFile = "/Main.xmlui.xs";
      const importPath = "../helpers.xs";

      expect(() => {
        ModuleResolver.resolvePath(importPath, fromFile);
      }).toThrow("goes above root");
    });

    it("should handle paths with same directory references", () => {
      const fromFile = "/app/Main.xmlui.xs";
      const importPath = "./../app/helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, fromFile);

      expect(resolved).toBe("/app/helpers.xs");
    });
  });

  describe("Import Chain Resolution", () => {
    it("should resolve deeply nested import chains", () => {
      // Simulate: Main imports from ./util/helpers
      // helpers imports from ../shared/utils
      const mainFile = "/components/Main.xmlui.xs";
      const helperImport = "./util/helpers.xs";
      const sharedImport = "../shared/utils.xs";

      const resolvedHelper = ModuleResolver.resolvePath(helperImport, mainFile);
      expect(resolvedHelper).toBe("/components/util/helpers.xs");

      const resolvedShared = ModuleResolver.resolvePath(sharedImport, resolvedHelper);
      expect(resolvedShared).toBe("/components/shared/utils.xs");
    });

    it("should handle multiple files in same directory", () => {
      const file1 = "/utils/math.xs";
      const file2 = "/utils/string.xs";
      const importPath = "./helpers.xs";

      const resolved1 = ModuleResolver.resolvePath(importPath, file1);
      const resolved2 = ModuleResolver.resolvePath(importPath, file2);

      expect(resolved1).toBe("/utils/helpers.xs");
      expect(resolved2).toBe("/utils/helpers.xs");
    });

    it("should handle cross-directory references", () => {
      const mainFile = "/src/components/Main.xmlui.xs";
      const importPath = "../utils/helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, mainFile);

      expect(resolved).toBe("/src/utils/helpers.xs");
    });
  });

  describe("File Resolution Compatibility", () => {
    it("should maintain file paths for fetching", () => {
      const fromFile = "/app/Main.xmlui.xs";
      const importPath = "./helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, fromFile);

      // Resolved path should be suitable for fetch
      expect(resolved).toMatch(/^\/[a-zA-Z0-9/_\-\.]+\.xs$/);
    });

    it("should handle URL-style paths", () => {
      const fromFile = "/app/Main.xmlui.xs";
      const importPath = "./helpers.xs";

      const resolved = ModuleResolver.resolvePath(importPath, fromFile);

      // Should work with URL resolution
      expect(resolved).toBe("/app/helpers.xs");
    });

    it("should resolve to consistent paths", () => {
      const fromFile = "/app/Main.xmlui.xs";
      const importPath = "./utils/helpers.xs";

      const resolved1 = ModuleResolver.resolvePath(importPath, fromFile);
      const resolved2 = ModuleResolver.resolvePath(importPath, fromFile);

      expect(resolved1).toBe(resolved2);
    });
  });

  describe("Path Equivalence", () => {
    it("should detect equivalent paths", () => {
      const path1 = "/app/utils/helpers.xs";
      const path2 = "/app/utils/helpers.xs";

      expect(ModuleResolver.arePathsEqual(path1, path2)).toBe(true);
    });

    it("should detect non-equivalent paths", () => {
      const path1 = "/app/utils/helpers.xs";
      const path2 = "/app/helpers.xs";

      expect(ModuleResolver.arePathsEqual(path1, path2)).toBe(false);
    });

    it("should normalize paths before comparison", () => {
      const path1 = "/app/utils/helpers.xs";
      const path2 = "/app/./utils/helpers.xs";

      expect(ModuleResolver.arePathsEqual(path1, path2)).toBe(true);
    });
  });

  describe("File Name Extraction", () => {
    it("should extract file name from path", () => {
      const filePath = "/app/utils/helpers.xs";

      const fileName = ModuleResolver.getFileName(filePath);

      expect(fileName).toBe("helpers.xs");
    });

    it("should handle root file", () => {
      const filePath = "/helpers.xs";

      const fileName = ModuleResolver.getFileName(filePath);

      expect(fileName).toBe("helpers.xs");
    });

    it("should handle deeply nested file", () => {
      const filePath = "/a/b/c/d/e/helpers.xs";

      const fileName = ModuleResolver.getFileName(filePath);

      expect(fileName).toBe("helpers.xs");
    });
  });

  describe("Import Resolution in Buildless Context", () => {
    it("should resolve module paths from base app file", () => {
      const baseFile = "/app/Main.xmlui.xs";
      const imports = ["./helpers.xs", "./utils/format.xs", "../shared/constants.xs"];

      const resolved = imports.map((imp) => ModuleResolver.resolvePath(imp, baseFile));

      expect(resolved).toEqual(["/app/helpers.xs", "/app/utils/format.xs", "/shared/constants.xs"]);
    });

    it("should handle multiple nested imports", () => {
      const mainFile = "/app/Main.xmlui.xs";
      const helperFile = "/app/helpers.xs";
      const utilFile = "/app/utils.xs";

      // Main imports helpers
      const resolvedHelper = ModuleResolver.resolvePath("./helpers.xs", mainFile);
      expect(resolvedHelper).toBe(helperFile);

      // Helper imports utils
      const resolvedUtil = ModuleResolver.resolvePath("./utils.xs", resolvedHelper);
      expect(resolvedUtil).toBe(utilFile);

      // Utils imports shared
      const resolvedShared = ModuleResolver.resolvePath("../shared.xs", resolvedUtil);
      expect(resolvedShared).toBe("/shared.xs");
    });

    it("should maintain path consistency across resolutions", () => {
      const baseFile = "/src/Main.xmlui.xs";
      const importPath = "./utils/helpers.xs";

      // Multiple resolutions should produce same result
      const results = Array(5)
        .fill(null)
        .map(() => ModuleResolver.resolvePath(importPath, baseFile));

      results.forEach((result) => {
        expect(result).toBe("/src/utils/helpers.xs");
      });
    });
  });

  describe("Error Handling in Path Resolution", () => {
    it("should throw on empty import path", () => {
      const fromFile = "/app/Main.xmlui.xs";

      expect(() => {
        ModuleResolver.resolvePath("", fromFile);
      }).toThrow("empty");
    });

    it("should throw on absolute path imports", () => {
      const fromFile = "/app/Main.xmlui.xs";

      expect(() => {
        ModuleResolver.resolvePath("/absolute/path.xs", fromFile);
      }).toThrow("relative");
    });

    it("should throw when traversing above root", () => {
      const fromFile = "/file.xs";

      expect(() => {
        ModuleResolver.resolvePath("../above.xs", fromFile);
      }).toThrow("above root");
    });

    it("should throw with descriptive error messages", () => {
      const fromFile = "/app/Main.xmlui.xs";

      try {
        ModuleResolver.resolvePath("/absolute.xs", fromFile);
        expect.fail("Should have thrown");
      } catch (e) {
        expect((e as Error).message).toContain("must be relative");
      }
    });
  });

  describe("Real-World Scenarios", () => {
    it("should handle typical component structure", () => {
      // Structure:
      // /src/Main.xmlui.xs
      // /src/utils/helpers.xs
      // /src/utils/formatters.xs

      const mainFile = "/src/Main.xmlui.xs";
      const helperImport = "./utils/helpers.xs";
      const formatterImport = "./utils/formatters.xs";

      const resolvedHelper = ModuleResolver.resolvePath(helperImport, mainFile);
      const resolvedFormatter = ModuleResolver.resolvePath(formatterImport, mainFile);

      expect(resolvedHelper).toBe("/src/utils/helpers.xs");
      expect(resolvedFormatter).toBe("/src/utils/formatters.xs");
    });

    it("should handle shared utilities pattern", () => {
      // Structure:
      // /src/components/button/Button.xmlui.xs
      // /src/utils/common.xs

      const buttonFile = "/src/components/button/Button.xmlui.xs";
      const sharedImport = "../../utils/common.xs";

      const resolved = ModuleResolver.resolvePath(sharedImport, buttonFile);

      expect(resolved).toBe("/src/utils/common.xs");
    });

    it("should handle monorepo-style structure", () => {
      // Structure:
      // /packages/ui/src/Main.xmlui.xs
      // /packages/shared/utils/helpers.xs

      const mainFile = "/packages/ui/src/Main.xmlui.xs";
      const sharedImport = "../../shared/utils/helpers.xs";

      const resolved = ModuleResolver.resolvePath(sharedImport, mainFile);

      expect(resolved).toBe("/packages/shared/utils/helpers.xs");
    });
  });
});
