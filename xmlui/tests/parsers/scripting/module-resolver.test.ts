import { describe, it, expect } from "vitest";
import { ModuleResolver } from "../../../src/parsers/scripting/ModuleResolver";

describe("ModuleResolver - Path Resolution", () => {
  it("should resolve simple relative path from root", () => {
    const result = ModuleResolver.resolvePath(
      "./helpers.xs",
      "/module.xs",
    );
    expect(result).toBe("/helpers.xs");
  });

  it("should resolve relative path from subdirectory", () => {
    const result = ModuleResolver.resolvePath(
      "./helpers.xs",
      "/components/Invoice.xmlui.xs",
    );
    expect(result).toBe("/components/helpers.xs");
  });

  it("should resolve parent directory path", () => {
    const result = ModuleResolver.resolvePath(
      "../helpers.xs",
      "/components/Invoice.xmlui.xs",
    );
    expect(result).toBe("/helpers.xs");
  });

  it("should resolve nested relative paths", () => {
    const result = ModuleResolver.resolvePath(
      "./subdir/helpers.xs",
      "/components/Invoice.xmlui.xs",
    );
    expect(result).toBe("/components/subdir/helpers.xs");
  });

  it("should resolve multiple parent directory traversals", () => {
    const result = ModuleResolver.resolvePath(
      "../../helpers.xs",
      "/components/sub/Item.xmlui.xs",
    );
    expect(result).toBe("/helpers.xs");
  });

  it("should resolve complex relative path", () => {
    const result = ModuleResolver.resolvePath(
      "../utils/helpers.xs",
      "/components/sub/Item.xmlui.xs",
    );
    expect(result).toBe("/components/utils/helpers.xs");
  });

  it("should handle deeply nested directory structures", () => {
    const result = ModuleResolver.resolvePath(
      "./helpers.xs",
      "/a/b/c/d/e/f/g/module.xs",
    );
    expect(result).toBe("/a/b/c/d/e/f/g/helpers.xs");
  });

  it("should handle multiple ./ segments", () => {
    const result = ModuleResolver.resolvePath(
      "./.././utils.xs",
      "/components/Invoice.xmlui.xs",
    );
    expect(result).toBe("/utils.xs");
  });

  it("should resolve path with multiple consecutive parents", () => {
    const result = ModuleResolver.resolvePath(
      "../../../helpers.xs",
      "/a/b/c/d/module.xs",
    );
    expect(result).toBe("/a/helpers.xs");
  });

  it("should handle path ending without file extension", () => {
    const result = ModuleResolver.resolvePath(
      "./subdir/file",
      "/components/Invoice.xs",
    );
    expect(result).toBe("/components/subdir/file");
  });

  it("should handle file in root directory", () => {
    expect(() => {
      ModuleResolver.resolvePath(
        "../helpers.xs",
        "/helpers.xs",
      );
    }).toThrow("Import path goes above root directory");
  });

  it("should throw error when going above root", () => {
    expect(() => {
      ModuleResolver.resolvePath("../helpers.xs", "/helpers.xs");
    }).toThrow("Import path goes above root directory");
  });

  it("should throw error for empty import path", () => {
    expect(() => {
      ModuleResolver.resolvePath("", "/components/file.xs");
    }).toThrow("Import path cannot be empty");
  });

  it("should throw error for absolute import path", () => {
    expect(() => {
      ModuleResolver.resolvePath("/helpers.xs", "/components/file.xs");
    }).toThrow("Import path must be relative");
  });

  it("should throw error for non-relative import path", () => {
    expect(() => {
      ModuleResolver.resolvePath("helpers.xs", "/components/file.xs");
    }).toThrow("Import path must be relative");
  });

  it("should handle paths with similar directory names", () => {
    const result = ModuleResolver.resolvePath(
      "../helpers/helpers.xs",
      "/components/helpers/file.xs",
    );
    expect(result).toBe("/components/helpers/helpers.xs");
  });

  it("should preserve path structure with multiple slashes", () => {
    const result = ModuleResolver.resolvePath(
      "./utils/helpers/common.xs",
      "/components/Invoice.xs",
    );
    expect(result).toBe("/components/utils/helpers/common.xs");
  });

  it("should resolve paths with .xs extension", () => {
    const result = ModuleResolver.resolvePath(
      "./helpers.xs",
      "/components/Invoice.xmlui.xs",
    );
    expect(result).toBe("/components/helpers.xs");
  });

  it("should resolve paths with different extensions", () => {
    const result = ModuleResolver.resolvePath(
      "./file.js",
      "/components/Invoice.xs",
    );
    expect(result).toBe("/components/file.js");
  });
});

describe("ModuleResolver - Path Comparison", () => {
  it("should recognize equivalent paths", () => {
    const path1 = "/components/helpers.xs";
    const path2 = "/components/./helpers.xs";
    expect(ModuleResolver.arePathsEqual(path1, path2)).toBe(true);
  });

  it("should recognize different paths", () => {
    const path1 = "/components/helpers.xs";
    const path2 = "/components/utils.xs";
    expect(ModuleResolver.arePathsEqual(path1, path2)).toBe(false);
  });

  it("should handle parent directory equivalence", () => {
    const path1 = "/helpers.xs";
    const path2 = "/components/../helpers.xs";
    expect(ModuleResolver.arePathsEqual(path1, path2)).toBe(true);
  });

  it("should handle complex equivalent paths", () => {
    const path1 = "/a/b/c/d.xs";
    const path2 = "/a/x/../b/y/../c/./d.xs";
    expect(ModuleResolver.arePathsEqual(path1, path2)).toBe(true);
  });
});

describe("ModuleResolver - File Name Extraction", () => {
  it("should extract file name from full path", () => {
    const result = ModuleResolver.getFileName("/components/helpers.xs");
    expect(result).toBe("helpers.xs");
  });

  it("should extract file name from nested path", () => {
    const result = ModuleResolver.getFileName(
      "/a/b/c/d/e/file.xs",
    );
    expect(result).toBe("file.xs");
  });

  it("should return full string if no directory separator", () => {
    const result = ModuleResolver.getFileName("helpers.xs");
    expect(result).toBe("helpers.xs");
  });

  it("should handle files with multiple dots", () => {
    const result = ModuleResolver.getFileName(
      "/components/Invoice.xmlui.xs",
    );
    expect(result).toBe("Invoice.xmlui.xs");
  });

  it("should handle files without extension", () => {
    const result = ModuleResolver.getFileName("/components/file");
    expect(result).toBe("file");
  });
});

describe("ModuleResolver - Edge Cases", () => {
  it("should handle single parent directory file", () => {
    const result = ModuleResolver.resolvePath(
      "./helpers.xs",
      "file.xs",
    );
    expect(result).toBe("helpers.xs");
  });

  it("should resolve from file in nested directory to sibling", () => {
    const result = ModuleResolver.resolvePath(
      "../sibling.xs",
      "/dir/file.xs",
    );
    expect(result).toBe("/sibling.xs");
  });

  it("should handle very long paths", () => {
    const longPath = "/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/file.xs";
    const result = ModuleResolver.resolvePath("./helpers.xs", longPath);
    expect(result).toContain("helpers.xs");
  });

  it("should handle import from deeply nested location", () => {
    const result = ModuleResolver.resolvePath(
      "../../../../helpers.xs",
      "/a/b/c/d/e/module.xs",
    );
    expect(result).toBe("/a/helpers.xs");
  });

  it("should preserve trailing information in path", () => {
    const result = ModuleResolver.resolvePath(
      "./sub/module.xs",
      "/components/Invoice.xs",
    );
    expect(result).toContain("/sub/module.xs");
  });
});

describe("ModuleResolver - Real-world Scenarios", () => {
  it("should resolve invoice helper from invoice component", () => {
    const result = ModuleResolver.resolvePath(
      "./invoice-helpers.xs",
      "/components/Invoice.xmlui.xs",
    );
    expect(result).toBe("/components/invoice-helpers.xs");
  });

  it("should resolve common utils from nested component", () => {
    const result = ModuleResolver.resolvePath(
      "../../utils/common.xs",
      "/components/forms/Input.xmlui.xs",
    );
    expect(result).toBe("/utils/common.xs");
  });

  it("should resolve shared helpers from different feature branches", () => {
    const result = ModuleResolver.resolvePath(
      "../shared/helpers.xs",
      "/features/invoicing/components/List.xs",
    );
    expect(result).toBe("/features/invoicing/shared/helpers.xs");
  });

  it("should resolve from app scripts to component helpers", () => {
    const result = ModuleResolver.resolvePath(
      "./components/helpers.xs",
      "/app/scripts/main.xs",
    );
    expect(result).toBe("/app/scripts/components/helpers.xs");
  });

  it("should resolve from widget to shared library", () => {
    const result = ModuleResolver.resolvePath(
      "../../../lib/validators.xs",
      "/widgets/datepicker/components/picker.xs",
    );
    expect(result).toBe("/lib/validators.xs");
  });
});
