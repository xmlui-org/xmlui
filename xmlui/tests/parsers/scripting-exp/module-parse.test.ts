import { describe, expect, it } from "vitest";
import { ModuleErrors, ScriptModule, isModuleErrors, parseScriptModule } from "@parsers/scripting-exp/modules";

const ROOT_MODULE = "test";

describe("Modules - Parse", () => {
  it("Empty module", async () => {
    // --- Arrange
    const source = `
    `;

    // --- Act
    const result = parseModule(source);

    // --- Assert
    expect(!isModuleErrors(result)).toBe(true);
  });

  it("Module functions", async () => {
    // --- Arrange
    const source = `
      function func1() {}
      function func2() {}
    `;

    // --- Act
    const result = parseModule(source) as ScriptModule;

    // --- Assert
    expect(!isModuleErrors(result)).toBe(true);

    expect(Object.keys(result.functions).length).toBe(2);
    expect(result.functions["func1"]).toBeDefined();
    expect(result.functions["func2"]).toBeDefined();
  });

  it("Function exports #1", async () => {
    // --- Arrange
    const source = `
      export function func1() {}
      function func2() {}
    `;

    // --- Act
    const result = parseModule(source) as ScriptModule;

    // --- Assert
    expect(!isModuleErrors(result)).toBe(true);

    expect(Object.keys(result.exports).length).toBe(1);
    expect(result.exports.func1).toBeDefined();
  });

  it("Function exports #2", async () => {
    // --- Arrange
    const source = `
      function func1() {}
      export function func2() {}
    `;

    // --- Act
    const result = parseModule(source) as ScriptModule;

    // --- Assert
    expect(!isModuleErrors(result)).toBe(true);

    expect(Object.keys(result.exports).length).toBe(1);
    expect(result.exports.func2).toBeDefined();
  });

  it("Function exports #3", async () => {
    // --- Arrange
    const source = `
      export function func1() {}
      export function func2() {}
    `;

    // --- Act
    const result = parseModule(source) as ScriptModule;

    // --- Assert
    expect(!isModuleErrors(result)).toBe(true);

    expect(Object.keys(result.exports).length).toBe(2);
    expect(result.exports.func1).toBeDefined();
    expect(result.exports.func2).toBeDefined();
  });

  it("Parsing error", async () => {
    // --- Arrange
    const source = `const;`;

    // --- Act
    const result = parseModule(source);

    // --- Assert
    expect(isModuleErrors(result)).toBe(true);
    const errors = result as ModuleErrors;
    expect(Object.keys(errors).length).toBe(1);
  });

  it("Exporting nested function", async () => {
    // --- Arrange
    const source = `
      function dummy() {
        export function inside() {}
      }
    `;

    // --- Act
    const result = parseModule(source);

    // --- Assert
    expect(isModuleErrors(result)).toBe(true);
    const errors = result as ModuleErrors;
    expect(Object.keys(errors).length).toBe(1);
    expect(errors[ROOT_MODULE].length).toBe(1);
    expect(errors[ROOT_MODULE][0].code).toBe("W030");
  });

  it("Duplicate export error #2", async () => {
    // --- Arrange
    const source = `
      export function a(){}
      export function a(){}
    `;

    // --- Act
    const result = parseModule(source);

    // --- Assert
    expect(isModuleErrors(result)).toBe(true);
    const errors = result as ModuleErrors;
    expect(Object.keys(errors).length).toBe(1);
    expect(errors[ROOT_MODULE].length).toBe(1);
    expect(errors[ROOT_MODULE][0].code).toBe("W020");
    expect(errors[ROOT_MODULE][0].text).toContain("'a'");
  });

  it("Unresolved module error", async () => {
    // --- Arrange
    const source = `
        import { a } from "module1";
        export function a() {};
    `;

    // --- Act
    const result = parseModule(source);

    // --- Assert
    expect(isModuleErrors(result)).toBe(true);
    const errors = result as ModuleErrors;
    expect(Object.keys(errors).length).toBe(1);
    expect(errors[ROOT_MODULE].length).toBe(1);
    expect(errors[ROOT_MODULE][0].code).toBe("W022");
    expect(errors[ROOT_MODULE][0].text).toContain("'module1'");
  });

  it("Error in imported module", async () => {
    // --- Arrange
    const source = `
    import { a } from "module1";
    `;

    const modules: Record<string, string> = {
      module1: `const;`,
    };

    // --- Act
    const result = parseModule(source, modules) as ModuleErrors;

    // --- Assert
    expect(isModuleErrors(result)).toBe(true);
    expect(result["module1"].length).toBe(1);
  });

  it("Import module #1", async () => {
    // --- Arrange
    const source = `
    import { a } from "module1";
    `;

    const modules: Record<string, string> = {
      module1: `export function a(){}`,
    };

    // --- Act
    const result = parseModule(source, modules) as ScriptModule;

    // --- Assert
    expect(!isModuleErrors(result)).toBe(true);
    expect(result.name).toBe(ROOT_MODULE);
    expect(result.importedModules.length).toBe(1);
    const impMod = result.importedModules.find((mod) => mod.name === "module1");
    expect(impMod).toBeDefined();
    expect(Object.keys(impMod!.exports).length).toBe(1);
    expect(Object.keys(impMod!.functions).length).toBe(1);
    expect(Object.keys(result.imports).length).toBe(1);
    expect(result.imports.a).toBeDefined();
    expect(result.imports.a.id.name).toBe("a");
  });

  it("Import module #2", async () => {
    // --- Arrange
    const source = `
    import { a } from "module1";
    `;

    const modules: Record<string, string> = {
      module1: `
        export function a(){}
        export function b(){}
      `,
    };

    // --- Act
    const result = parseModule(source, modules) as ScriptModule;

    // --- Assert
    expect(!isModuleErrors(result)).toBe(true);
    expect(result.name).toBe(ROOT_MODULE);
    expect(result.importedModules.length).toBe(1);
    const impMod = result.importedModules.find((mod) => mod.name === "module1");
    expect(impMod).toBeDefined();
    expect(Object.keys(impMod!.exports).length).toBe(2);
    expect(Object.keys(impMod!.functions).length).toBe(2);
    expect(Object.keys(result.imports).length).toBe(1);
    expect(result.imports.a).toBeDefined();
    expect(result.imports.a.id.name).toBe("a");
  });

  it("Import module #3", async () => {
    // --- Arrange
    const source = `
    import { a, b } from "module1";
    `;

    const modules: Record<string, string> = {
      module1: `
        export function a(){}
        export function b(){}
      `,
    };

    // --- Act
    const result = parseModule(source, modules) as ScriptModule;

    // --- Assert
    expect(!isModuleErrors(result)).toBe(true);
    expect(result.name).toBe(ROOT_MODULE);
    expect(result.importedModules.length).toBe(1);
    const impMod = result.importedModules.find((mod) => mod.name === "module1");
    expect(impMod).toBeDefined();
    expect(Object.keys(impMod!.exports).length).toBe(2);
    expect(Object.keys(impMod!.functions).length).toBe(2);
    expect(Object.keys(result.imports).length).toBe(2);
    expect(result.imports.a).toBeDefined();
    expect(result.imports.a.id.name).toBe("a");
    expect(result.imports.b).toBeDefined();
    expect(result.imports.b.id.name).toBe("b");
  });

  it("Import module #4", async () => {
    // --- Arrange
    const source = `
    import { a as A1, b } from "module1";
    `;

    const modules: Record<string, string> = {
      module1: `
        export function a(){}
        export function b(){}
      `,
    };

    // --- Act
    const result = parseModule(source, modules) as ScriptModule;

    // --- Assert
    expect(!isModuleErrors(result)).toBe(true);
    expect(result.name).toBe(ROOT_MODULE);
    expect(result.importedModules.length).toBe(1);
    const impMod = result.importedModules.find((mod) => mod.name === "module1");
    expect(impMod).toBeDefined();
    expect(Object.keys(impMod!.exports).length).toBe(2);
    expect(Object.keys(impMod!.functions).length).toBe(2);
    expect(Object.keys(result.imports).length).toBe(2);
    expect(result.imports.A1).toBeDefined();
    expect(result.imports.A1.id.name).toBe("a");
    expect(result.imports.b).toBeDefined();
    expect(result.imports.b.id.name).toBe("b");
  });

  it("Import module #5", async () => {
    // --- Arrange
    const source = `
    import { a as A1, b as B1 } from "module1";
    `;

    const modules: Record<string, string> = {
      module1: `
        export function a(){}
        export function b(){}
      `,
    };

    // --- Act
    const result = parseModule(source, modules) as ScriptModule;

    // --- Assert
    expect(!isModuleErrors(result)).toBe(true);
    expect(result.name).toBe(ROOT_MODULE);
    expect(result.importedModules.length).toBe(1);
    const impMod = result.importedModules.find((mod) => mod.name === "module1");
    expect(impMod).toBeDefined();
    expect(Object.keys(impMod!.exports).length).toBe(2);
    expect(Object.keys(impMod!.functions).length).toBe(2);
    expect(Object.keys(result.imports).length).toBe(2);
    expect(result.imports.A1).toBeDefined();
    expect(result.imports.A1.id.name).toBe("a");
    expect(result.imports.B1).toBeDefined();
    expect(result.imports.B1.id.name).toBe("b");
  });

  it("Import module #6", async () => {
    // --- Arrange
    const source = `
    import { a as A1, b as A1 } from "module1";
    `;

    const modules: Record<string, string> = {
      module1: `
        export function a(){}
        export function b(){}
      `,
    };

    // --- Act
    const result = parseModule(source, modules) as ModuleErrors;

    // --- Assert
    expect(!isModuleErrors(result)).toBe(false);
    expect(result[ROOT_MODULE].length).toBe(1);
    expect(result[ROOT_MODULE][0].code).toBe("W019");
  });

  it("Import module fails with var", async () => {
    // --- Arrange
    const source = `
    import { a } from "module1";
    `;

    const modules: Record<string, string> = {
      module1: `export function a() {}; var b = 2;`,
    };

    // --- Act
    const result = parseModule(source, modules) as ModuleErrors;

    // --- Assert
    expect(isModuleErrors(result)).toBe(true);
    expect(result["module1"][0].code).toBe("W027");
  });
});

function parseModule(source: string, modules: Record<string, string> = {}) {
  return parseScriptModule(
    ROOT_MODULE,
    source,
    (parentModule: string, moduleName: string) => modules[moduleName] ?? null
  );
}
