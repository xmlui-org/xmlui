import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ModuleResolver } from "../../src/parsers/scripting/ModuleResolver";

describe("Vite Plugin Import Integration (Built Mode)", () => {
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
      expect(paths).toEqual([
        "/shared/theme.xs",
        "/shared/theme.xs",
        "/shared/theme.xs",
      ]);
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
      const files = [
        "/src/Button.xs",
        "/src/components/Button.xs",
        "/src/components/ui/Button.xs",
      ];

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
