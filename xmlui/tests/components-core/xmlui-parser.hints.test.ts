/**
 * Tests for the friendly error hints system.
 *
 * XMLUI scripts can appear in three contexts:
 * 1. Inline - in attribute bindings like onClick="{ ... }"
 * 2. Script tags - in <script> blocks
 * 3. Code-behind - in .xmlui.xs files
 *
 * When parsing fails, we want to provide:
 * - Context-aware prefixes ("Inline script parse error" vs "Script tag parse error")
 * - Friendly, actionable hints instead of cryptic error codes
 * - All 31 error codes (W001-W031) covered
 *
 * Error display flow:
 * 1. Parser detects error, attaches scriptContext metadata
 * 2. Error reporter creates a ComponentDef tree with error UI
 * 3. Hint system extracts W### code, looks up friendly message
 * 4. User sees: "Script tag parse error. For loop variable must be initialized (e.g., let i = 0)."
 *    instead of: "W011: For loop variable must be initialized [3: 8]"
 */

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

/**
 * Helper to extract hint messages from error display components.
 *
 * When errors occur, XMLUI creates an error UI component tree with Text elements
 * containing "Hint: ..." messages. This function walks that tree and collects
 * all hint strings for assertion.
 */
function collectHintTexts(node: ComponentDef | undefined): string[] {
  const hints: string[] = [];

  const visit = (current: any) => {
    if (!current || typeof current !== "object") {
      return;
    }
    // Check if this node is a Text component with a hint
    const value = current.props?.value;
    if (typeof value === "string" && value.startsWith("Hint:")) {
      hints.push(value);
    }
    // Recursively visit children
    if (Array.isArray(current.children)) {
      current.children.forEach((child) => visit(child));
    }
    // Visit slot content
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
  // ============================================================================
  // CONTEXT DETECTION TESTS
  // These tests verify that errors are correctly identified as inline,
  // script tag, or code-behind contexts.
  // ============================================================================

  it("adds inline binding hint for W006", () => {
    // Test: Inline attribute binding with missing closing parenthesis
    // Input: onClick="{ foo(bar }" - missing ) before }
    // Expected: "Inline script parse error" prefix + W006 hint
    const source = `<App>\n<Button onClick="{ foo(bar }" />\n</App>\n`;
    const result = xmlUiMarkupToComponent(source, "Main.xmlui");
    expect(result.errors.length).toBeGreaterThan(0);

    // Convert errors to error display component
    const comp = errReportComponent(result.errors, "Main.xmlui", undefined);
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);

    // Verify context prefix and friendly hint
    expect(hints[0]).toContain("Inline script parse error");
    expect(hints[0]).toContain("closing parenthesis )");
  });

  it("adds script tag hint for W001", () => {
    // Test: Script tag with missing expression after =
    // Input: var a =; - no value after equals
    // Expected: "Script tag parse error" prefix + W001 hint
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
    // Test: Code-behind file (.xmlui.xs) with parse error
    // This tests the errReportScriptError path (direct error object)
    // Expected: "Code-behind script parse error" prefix + W006 hint
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
    // Test: Code-behind module with multiple errors
    // This tests the errReportModuleErrors path (ModuleErrors object)
    // Expected: "Code-behind script parse error" prefix + W001 hint
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
    // Test: XMLUI markup error (not script error)
    // Input: Mismatched tags <Text></App>
    // Expected: NO hint (hints are only for W### script errors)
    // This ensures we don't show script hints for XML structure errors
    const source = `<App><Text></App>`;
    const result = xmlUiMarkupToComponent(source, "Main.xmlui");
    expect(result.errors.length).toBeGreaterThan(0);
    const comp = errReportComponent(result.errors, "Main.xmlui", undefined);
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBe(0);
  });

  // ============================================================================
  // DELIMITER ERRORS (W003-W008)
  // Missing brackets, braces, parentheses, colons, etc.
  // These use direct error objects to test specific error codes.
  // ============================================================================

  it("adds hint for W003 (missing identifier)", () => {
    // Test: Variable declaration without name
    // Input: var = 5; - missing variable name
    // Common mistake: forgetting the identifier in declarations
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
    // Test: Object literal without closing }
    // Example: let obj = { a: 1  ← missing }
    // Using direct error object to test W004 specifically
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
    // Test: Array literal without closing ]
    // Example: let arr = [1, 2, 3  ← missing ]
    // Using direct error object to test W005 specifically
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
    // Test: Object property without colon
    // Example: { name 'John' } instead of { name: 'John' }
    // Common in object literals when : is forgotten
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

  // ============================================================================
  // CONTROL FLOW ERRORS (W011, W013)
  // Issues with loops, try/catch, switch statements, etc.
  // ============================================================================

  it("adds hint for W011 (for loop missing initialization)", () => {
    // Test: For loop without variable initialization
    // Input: for (let i; i < 10; i++) - should be: for (let i = 0; ...)
    // Common mistake: declaring loop variable without initial value
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
    // Test: Try block without catch or finally
    // Input: try { foo(); } with no catch/finally after
    // JavaScript requires at least one error handler after try
    const source = `<App>\n<script>\ntry { foo(); }\n</script>\n</App>\n`;
    const result = xmlUiMarkupToComponent(source, "Main.xmlui");
    expect(result.errors.length).toBeGreaterThan(0);
    const comp = errReportComponent(result.errors, "Main.xmlui", undefined);
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("catch");
    expect(hints[0]).toContain("finally");
  });

  // ============================================================================
  // SPECIAL RESTRICTIONS (W031)
  // XMLUI-specific naming and syntax rules
  // ============================================================================

  it("adds hint for W031 (variable starts with $)", () => {
    // Test: Variable name starting with $
    // Input: var $myVar = 5;
    // In XMLUI, $ prefix is reserved for context variables like $props, $state
    // User-defined variables cannot use this prefix
    const source = `<App>\n<script>\nvar $myVar = 5;\n</script>\n</App>\n`;
    const result = xmlUiMarkupToComponent(source, "Main.xmlui");
    expect(result.errors.length).toBeGreaterThan(0);
    const comp = errReportComponent(result.errors, "Main.xmlui", undefined);
    const hints = collectHintTexts(comp as ComponentDef);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("cannot start with $");
    expect(hints[0]).toContain("context variables");
  });

  // ============================================================================
  // CODE-BEHIND SPECIFIC ERRORS (W019-W030)
  // Module system errors: imports, exports, duplicate definitions
  // These only apply to .xmlui.xs files
  // ============================================================================

  it("adds code-behind hint for W020 (duplicate function)", () => {
    // Test: Defining the same function twice in a module
    // Example: function foo() {} ... function foo() {} again
    // Code-behind modules don't allow duplicate function names
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
    // Test: Importing a module that doesn't exist
    // Example: import { util } from 'helpers' where 'helpers' doesn't exist
    // Common when import paths are incorrect or module is missing
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
