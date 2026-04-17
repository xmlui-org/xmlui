import { describe, expect, it, assert } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import { Lexer } from "../../../src/parsers/scripting/Lexer";
import { InputStream } from "../../../src/parsers/common/InputStream";
import { TokenType } from "../../../src/parsers/scripting/TokenType";
import {
  evalBinding,
  evalBindingExpression,
} from "../../../src/components-core/script-runner/eval-tree-sync";
import { processStatementQueue } from "../../../src/components-core/script-runner/process-statement-sync";
import { createEvalContext, parseStatements } from "./test-helpers";

// =============================================================================
// 1. :: (Global) operator removal
// =============================================================================

describe(":: operator removal", () => {
  it("lexer no longer produces Global token for ::", () => {
    const lexer = new Lexer(new InputStream("::"));
    const token1 = lexer.get();
    expect(token1.type).toBe(TokenType.Colon);
    const token2 = lexer.get();
    expect(token2.type).toBe(TokenType.Colon);
  });

  it("single colon still works as Colon token", () => {
    const lexer = new Lexer(new InputStream(":"));
    const token = lexer.get();
    expect(token.type).toBe(TokenType.Colon);
  });

  it("parser rejects :: as invalid syntax", () => {
    const wParser = new Parser("::Math");
    const expr = wParser.parseExpr();
    expect(expr).toBeNull();
  });

  it("identifier resolves through scope chain without :: operator", () => {
    const wParser = new Parser("Math");
    const expr = wParser.parseExpr();
    expect(expr).not.toBeNull();
    const context = createEvalContext({ localContext: {} });
    const value = evalBinding(expr!, context);
    expect(value).toBe(Math);
  });

  it("local context can shadow global names", () => {
    const wParser = new Parser("Math");
    const expr = wParser.parseExpr();
    expect(expr).not.toBeNull();
    const context = createEvalContext({ localContext: { Math: 42 } });
    const value = evalBinding(expr!, context);
    expect(value).toBe(42);
  });
});

// =============================================================================
// 2. Configurable sync execution timeout
// =============================================================================

describe("Configurable sync execution timeout", () => {
  it("uses default timeout (1000ms) when no appGlobals configured", () => {
    const source = `while (true) { x = x + 1 }`;
    const evalContext = createEvalContext({
      localContext: { x: 0 },
      startTick: Date.now(),
    });
    const statements = parseStatements(source);

    try {
      processStatementQueue(statements, evalContext);
      assert.fail("Should have thrown timeout error");
    } catch (err: any) {
      expect(err.message).toContain("1000 milliseconds");
    }
  });

  it("uses custom timeout from appGlobals.syncExecutionTimeout", () => {
    const source = `while (true) { x = x + 1 }`;
    const evalContext = createEvalContext({
      localContext: { x: 0 },
      appContext: {
        appGlobals: { syncExecutionTimeout: 50 },
      },
      startTick: Date.now(),
    });
    const statements = parseStatements(source);

    try {
      processStatementQueue(statements, evalContext);
      assert.fail("Should have thrown timeout error");
    } catch (err: any) {
      expect(err.message).toContain("50 milliseconds");
    }
  });

  it("no timeout error when startTick is not set", () => {
    const source = `x = 42`;
    const evalContext = createEvalContext({
      localContext: { x: 0 },
    });
    const statements = parseStatements(source);
    processStatementQueue(statements, evalContext);
    expect(evalContext.localContext.x).toBe(42);
  });
});

// =============================================================================
// 3. instanceof operator
// =============================================================================

describe("instanceof operator", () => {
  it("lexer produces Instanceof token for 'instanceof' keyword", () => {
    const lexer = new Lexer(new InputStream("instanceof"));
    const token = lexer.get();
    expect(token.type).toBe(TokenType.Instanceof);
    expect(token.text).toBe("instanceof");
  });

  it("parses instanceof as a binary expression", () => {
    const wParser = new Parser("x instanceof Date");
    const expr = wParser.parseExpr();
    expect(expr).not.toBeNull();
    expect(expr!.type).toBe(101); // T_BINARY_EXPRESSION
  });

  it("evaluates instanceof with Date correctly", () => {
    const src = "x instanceof Date";
    const wParser = new Parser(src);
    const expr = wParser.parseExpr();
    expect(expr).not.toBeNull();

    const date = new Date();
    const context = createEvalContext({ localContext: { x: date, Date } });
    const value = evalBinding(expr!, context);
    expect(value).toBe(true);
  });

  it("evaluates instanceof with non-instance correctly", () => {
    const src = "x instanceof Date";
    const wParser = new Parser(src);
    const expr = wParser.parseExpr();
    expect(expr).not.toBeNull();

    const context = createEvalContext({ localContext: { x: "hello", Date } });
    const value = evalBinding(expr!, context);
    expect(value).toBe(false);
  });

  it("evaluates instanceof with Error", () => {
    const src = "x instanceof Error";
    const wParser = new Parser(src);
    const expr = wParser.parseExpr();
    expect(expr).not.toBeNull();

    const context = createEvalContext({
      localContext: { x: new Error("test"), Error },
    });
    const value = evalBinding(expr!, context);
    expect(value).toBe(true);
  });

  it("instanceof works in statements", () => {
    const source = `
      if (x instanceof Date) {
        result = "date";
      } else {
        result = "other";
      }
    `;
    const statements = parseStatements(source);
    const evalContext = createEvalContext({
      localContext: { x: new Date(), result: "", Date },
    });
    processStatementQueue(statements, evalContext);
    expect(evalContext.localContext.result).toBe("date");
  });
});

// =============================================================================
// 4. Computed property names
// =============================================================================

describe("Computed property names", () => {
  it("parses object literal with computed property name", () => {
    const wParser = new Parser('({ [key]: "value" })');
    const expr = wParser.parseExpr();
    expect(expr).not.toBeNull();
  });

  it("evaluates computed property name from variable", () => {
    const src = '({ [key]: "value" })';
    const wParser = new Parser(src);
    const expr = wParser.parseExpr();
    expect(expr).not.toBeNull();

    const context = createEvalContext({ localContext: { key: "myProp" } });
    const value = evalBinding(expr!, context);
    expect(value).toEqual({ myProp: "value" });
  });

  it("evaluates computed property name from expression", () => {
    const src = '({ ["a" + "b"]: 42 })';
    const wParser = new Parser(src);
    const expr = wParser.parseExpr();
    expect(expr).not.toBeNull();

    const context = createEvalContext({ localContext: {} });
    const value = evalBinding(expr!, context);
    expect(value).toEqual({ ab: 42 });
  });

  it("evaluates computed property with numeric key", () => {
    const src = "({ [1 + 2]: true })";
    const wParser = new Parser(src);
    const expr = wParser.parseExpr();
    expect(expr).not.toBeNull();

    const context = createEvalContext({ localContext: {} });
    const value = evalBinding(expr!, context);
    expect(value).toEqual({ 3: true });
  });

  it("mixes computed and static property names", () => {
    const src = '({ a: 1, [key]: 2, b: 3 })';
    const wParser = new Parser(src);
    const expr = wParser.parseExpr();
    expect(expr).not.toBeNull();

    const context = createEvalContext({ localContext: { key: "dynamic" } });
    const value = evalBinding(expr!, context);
    expect(value).toEqual({ a: 1, dynamic: 2, b: 3 });
  });

  it("computed property names in statements", () => {
    const source = `
      const key = "prop";
      const obj = { [key]: 42 };
      result = obj.prop;
    `;
    const statements = parseStatements(source);
    const evalContext = createEvalContext({
      localContext: { result: 0 },
    });
    processStatementQueue(statements, evalContext);
    expect(evalContext.localContext.result).toBe(42);
  });
});

// =============================================================================
// 5. Optional catch binding
// =============================================================================

describe("Optional catch binding", () => {
  it("parses try/catch without catch variable", () => {
    const wParser = new Parser("try { x = 1; } catch { x = 2; }");
    const stmts = wParser.parseStatements();
    expect(stmts).not.toBeNull();
    expect(stmts!.length).toBe(1);
  });

  it("parses try/catch with catch variable", () => {
    const wParser = new Parser("try { x = 1; } catch (e) { x = 2; }");
    const stmts = wParser.parseStatements();
    expect(stmts).not.toBeNull();
    expect(stmts!.length).toBe(1);
  });

  it("executes catch without variable", () => {
    const source = `
      try {
        throw "error";
      } catch {
        result = "caught";
      }
    `;
    const statements = parseStatements(source);
    const evalContext = createEvalContext({
      localContext: { result: "" },
    });
    processStatementQueue(statements, evalContext);
    expect(evalContext.localContext.result).toBe("caught");
  });

  it("executes catch with variable", () => {
    const source = `
      try {
        throw "error message";
      } catch (e) {
        result = e;
      }
    `;
    const statements = parseStatements(source);
    const evalContext = createEvalContext({
      localContext: { result: "" },
    });
    processStatementQueue(statements, evalContext);
    expect(evalContext.localContext.result).toBe("error message");
  });

  it("optional catch binding with finally", () => {
    const source = `
      try {
        throw "error";
      } catch {
        result = "caught";
      } finally {
        final = true;
      }
    `;
    const statements = parseStatements(source);
    const evalContext = createEvalContext({
      localContext: { result: "", final: false },
    });
    processStatementQueue(statements, evalContext);
    expect(evalContext.localContext.result).toBe("caught");
    expect(evalContext.localContext.final).toBe(true);
  });
});
