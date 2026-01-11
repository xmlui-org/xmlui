import { describe, expect, it } from "vitest";
import type { ComponentDef } from "../../src/abstractions/ComponentDefs";
import type { ModuleErrors } from "../../src/components-core/script-runner/ScriptingSourceTree";
import type { ScriptParserErrorMessage } from "../../src/abstractions/scripting/ScriptParserError";
import {
  errReportComponent,
  errReportModuleErrors,
  errReportScriptError,
  xmlUiMarkupToComponent,
} from "../../src/components-core/xmlui-parser";

function collectHintTexts(node: ComponentDef | undefined): string[] {
  const hints: string[] = [];

  const visit = (current: any) => {
    if (!current || typeof current !== "object") {
      return;
    }
    const value = current.props?.value;
    if (typeof value === "string" && value.startsWith("Hint:")) {
      hints.push(value);
    }
    if (Array.isArray(current.children)) {
      current.children.forEach((child) => visit(child));
    }
    if (current.slots) {
      Object.values(current.slots).forEach((slot: any) => {
        if (Array.isArray(slot)) {
          slot.forEach((child) => visit(child));
        }
      });
    }
  };

  visit(node);
  return hints;
}

describe("xmlui parser hints", () => {
  it("adds inline binding hint for W006", () => {
    const source = `<App>\n<Button onClick="{ foo(bar }" />\n</App>\n`;
    const result = xmlUiMarkupToComponent(source, "Main.xmlui");
    expect(result.errors.length).toBeGreaterThan(0);

    const comp = errReportComponent(result.errors, "Main.xmlui", undefined);
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);

    expect(hints[0]).toContain("Inline script parse error");
    expect(hints[0]).toContain("closing parenthesis )");
  });

  it("adds script tag hint for W001", () => {
    const source = `<App>\n<script>\nvar a =;\n</script>\n</App>\n`;
    const result = xmlUiMarkupToComponent(source, "Main.xmlui");
    expect(result.errors.length).toBeGreaterThan(0);
    const comp = errReportComponent(result.errors, "Main.xmlui", undefined);
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("Script tag parse error");
    expect(hints[0]).toContain("expression is expected");
  });

  it("adds code-behind hint for script errors", () => {
    const error: ScriptParserErrorMessage = {
      code: "W006",
      text: "')' expected",
      line: 2,
      column: 4,
      position: 0,
    };
    const comp = errReportScriptError(error, "components/Hello.xmlui.xs");
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("Code-behind script parse error");
    expect(hints[0]).toContain("closing parenthesis )");
  });

  it("adds code-behind hint for module errors", () => {
    const error: ScriptParserErrorMessage = {
      code: "W001",
      text: "An expression expected",
      line: 1,
      column: 1,
      position: 0,
    };
    const moduleErrors: ModuleErrors = {
      Hello: [error],
    };
    const comp = errReportModuleErrors(moduleErrors, "components/Hello.xmlui.xs");
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("Code-behind script parse error");
    expect(hints[0]).toContain("expression is expected");
  });

  it("does not add script hints for XMLUI parser errors", () => {
    const source = `<App><Text></App>`;
    const result = xmlUiMarkupToComponent(source, "Main.xmlui");
    expect(result.errors.length).toBeGreaterThan(0);
    const comp = errReportComponent(result.errors, "Main.xmlui", undefined);
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBe(0);
  });

  // === Delimiter errors ===
  it("adds hint for W003 (missing identifier)", () => {
    const source = `<App>\n<script>\nvar = 5;\n</script>\n</App>\n`;
    const result = xmlUiMarkupToComponent(source, "Main.xmlui");
    expect(result.errors.length).toBeGreaterThan(0);
    const comp = errReportComponent(result.errors, "Main.xmlui", undefined);
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("identifier");
    expect(hints[0]).toContain("variable or function name");
  });

  it("adds hint for W004 (missing closing brace)", () => {
    const error: ScriptParserErrorMessage = {
      code: "W004",
      text: "'}' expected",
      line: 1,
      column: 15,
      position: 0,
    };
    const comp = errReportScriptError(error, "test.xmlui.ts");
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("missing closing brace }");
  });

  it("adds hint for W005 (missing closing bracket)", () => {
    const error: ScriptParserErrorMessage = {
      code: "W005",
      text: "']' expected",
      line: 1,
      column: 20,
      position: 0,
    };
    const comp = errReportScriptError(error, "test.xmlui.ts");
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("missing closing bracket ]");
  });

  it("adds hint for W008 (missing colon)", () => {
    const error: ScriptParserErrorMessage = {
      code: "W008",
      text: "':' expected",
      line: 1,
      column: 12,
      position: 0,
    };
    const comp = errReportScriptError(error, "test.xmlui.ts");
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("colon :");
    expect(hints[0]).toContain("key: value");
  });

  // === Control flow errors ===
  it("adds hint for W011 (for loop missing initialization)", () => {
    const source = `<App>\n<script>\nfor (let i; i < 10; i++) {}\n</script>\n</App>\n`;
    const result = xmlUiMarkupToComponent(source, "Main.xmlui");
    expect(result.errors.length).toBeGreaterThan(0);
    const comp = errReportComponent(result.errors, "Main.xmlui", undefined);
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("For loop variable must be initialized");
    expect(hints[0]).toContain("let i = 0");
  });

  it("adds hint for W013 (try without catch/finally)", () => {
    const source = `<App>\n<script>\ntry { foo(); }\n</script>\n</App>\n`;
    const result = xmlUiMarkupToComponent(source, "Main.xmlui");
    expect(result.errors.length).toBeGreaterThan(0);
    const comp = errReportComponent(result.errors, "Main.xmlui", undefined);
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("catch");
    expect(hints[0]).toContain("finally");
  });

  // === Special restrictions ===
  it("adds hint for W031 (variable starts with $)", () => {
    const source = `<App>\n<script>\nvar $myVar = 5;\n</script>\n</App>\n`;
    const result = xmlUiMarkupToComponent(source, "Main.xmlui");
    expect(result.errors.length).toBeGreaterThan(0);
    const comp = errReportComponent(result.errors, "Main.xmlui", undefined);
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("cannot start with $");
    expect(hints[0]).toContain("context variables");
  });

  // === Code-behind specific errors ===
  it("adds code-behind hint for W020 (duplicate function)", () => {
    const error: ScriptParserErrorMessage = {
      code: "W020",
      text: "Function 'myFunc' is already defined in the module",
      line: 5,
      column: 10,
      position: 0,
    };
    const comp = errReportScriptError(error, "components/Hello.xmlui.ts");
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("function name is already defined");
  });

  it("adds code-behind hint for W022 (module not found)", () => {
    const error: ScriptParserErrorMessage = {
      code: "W022",
      text: "Cannot find module 'helpers'",
      line: 1,
      column: 1,
      position: 0,
    };
    const comp = errReportScriptError(error, "components/Hello.xmlui.ts");
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("Cannot find the specified module");
    expect(hints[0]).toContain("import path");
  });
});
