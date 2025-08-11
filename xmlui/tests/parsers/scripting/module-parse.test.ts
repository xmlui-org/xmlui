import { describe, expect, it } from "vitest";
import {
  ModuleErrors,
  isModuleErrors,
  parseScriptModule,
} from "../../../src/parsers/scripting/modules";
import { ScriptModule } from "../../../src/components-core/script-runner/ScriptingSourceTree";

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
});

function parseModule(source: string, modules: Record<string, string> = {}) {
  return parseScriptModule(ROOT_MODULE, source);
}
