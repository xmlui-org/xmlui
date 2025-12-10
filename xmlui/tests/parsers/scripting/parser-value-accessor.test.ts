import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import type {
  ValueAccessorExpression,
  MemberAccessExpression,
  Identifier,
  FunctionInvocationExpression,
  BinaryExpression,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  T_VALUE_ACCESSOR_EXPRESSION,
  T_IDENTIFIER,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_BINARY_EXPRESSION,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - value accessor expressions", () => {
  it("Basic value accessor #1", () => {
    const parser = new Parser("userProfile!");
    const expr = parser.parseExpr() as ValueAccessorExpression;

    expect(expr.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((expr.expr as Identifier).type).toBe(T_IDENTIFIER);
    expect((expr.expr as Identifier).name).toBe("userProfile");
  });

  it("Basic value accessor #2", () => {
    const parser = new Parser("data!");
    const expr = parser.parseExpr() as ValueAccessorExpression;

    expect(expr.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((expr.expr as Identifier).type).toBe(T_IDENTIFIER);
    expect((expr.expr as Identifier).name).toBe("data");
  });

  it("Value accessor followed by member access", () => {
    const parser = new Parser("userProfile!.name");
    const expr = parser.parseExpr() as MemberAccessExpression;

    expect(expr.type).toBe(T_MEMBER_ACCESS_EXPRESSION);
    expect(expr.member).toBe("name");
    
    const obj = expr.obj as ValueAccessorExpression;
    expect(obj.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((obj.expr as Identifier).type).toBe(T_IDENTIFIER);
    expect((obj.expr as Identifier).name).toBe("userProfile");
  });

  it("Value accessor followed by calculated member access", () => {
    const parser = new Parser("data![0]");
    const expr = parser.parseExpr();

    expect(expr.type).toBe(T_CALCULATED_MEMBER_ACCESS_EXPRESSION);
    
    const obj = (expr as any).obj as ValueAccessorExpression;
    expect(obj.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((obj.expr as Identifier).type).toBe(T_IDENTIFIER);
    expect((obj.expr as Identifier).name).toBe("data");
  });

  it("Value accessor followed by function invocation", () => {
    const parser = new Parser("callback!()");
    const expr = parser.parseExpr() as FunctionInvocationExpression;

    expect(expr.type).toBe(T_FUNCTION_INVOCATION_EXPRESSION);
    expect(expr.arguments.length).toBe(0);
    
    const obj = expr.obj as ValueAccessorExpression;
    expect(obj.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((obj.expr as Identifier).type).toBe(T_IDENTIFIER);
    expect((obj.expr as Identifier).name).toBe("callback");
  });

  it("Value accessor followed by function invocation with args", () => {
    const parser = new Parser("fn!(1, 2)");
    const expr = parser.parseExpr() as FunctionInvocationExpression;

    expect(expr.type).toBe(T_FUNCTION_INVOCATION_EXPRESSION);
    expect(expr.arguments.length).toBe(2);
    
    const obj = expr.obj as ValueAccessorExpression;
    expect(obj.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((obj.expr as Identifier).type).toBe(T_IDENTIFIER);
    expect((obj.expr as Identifier).name).toBe("fn");
  });

  it("Chained value accessor and member access", () => {
    const parser = new Parser("userProfile!.address.city");
    const expr = parser.parseExpr() as MemberAccessExpression;

    // outer: .city
    expect(expr.type).toBe(T_MEMBER_ACCESS_EXPRESSION);
    expect(expr.member).toBe("city");

    // middle: .address
    const addressAccess = expr.obj as MemberAccessExpression;
    expect(addressAccess.type).toBe(T_MEMBER_ACCESS_EXPRESSION);
    expect(addressAccess.member).toBe("address");

    // inner: userProfile!
    const valueAccessor = addressAccess.obj as ValueAccessorExpression;
    expect(valueAccessor.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((valueAccessor.expr as Identifier).name).toBe("userProfile");
  });

  it("Multiple value accessors in sequence", () => {
    const parser = new Parser("a!.b!");
    const expr = parser.parseExpr() as ValueAccessorExpression;

    // outer: .b!
    expect(expr.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);

    // middle: .b
    const memberAccess = expr.expr as MemberAccessExpression;
    expect(memberAccess.type).toBe(T_MEMBER_ACCESS_EXPRESSION);
    expect(memberAccess.member).toBe("b");

    // inner: a!
    const innerValueAccessor = memberAccess.obj as ValueAccessorExpression;
    expect(innerValueAccessor.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((innerValueAccessor.expr as Identifier).name).toBe("a");
  });

  it("Value accessor with optional chaining", () => {
    const parser = new Parser("data!?.value");
    const expr = parser.parseExpr() as MemberAccessExpression;

    expect(expr.type).toBe(T_MEMBER_ACCESS_EXPRESSION);
    expect(expr.member).toBe("value");
    expect(expr.opt).toBe(true);
    
    const obj = expr.obj as ValueAccessorExpression;
    expect(obj.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
  });

  it("Value accessor in binary expression", () => {
    const parser = new Parser("x! + y!");
    const expr = parser.parseExpr() as BinaryExpression;

    expect(expr.type).toBe(T_BINARY_EXPRESSION);
    expect(expr.op).toBe("+");
    
    const left = expr.left as ValueAccessorExpression;
    expect(left.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((left.expr as Identifier).name).toBe("x");
    
    const right = expr.right as ValueAccessorExpression;
    expect(right.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((right.expr as Identifier).name).toBe("y");
  });

  it("Value accessor in parentheses", () => {
    const parser = new Parser("(value!)");
    const expr = parser.parseExpr() as ValueAccessorExpression;

    expect(expr.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect(expr.parenthesized).toBe(1);
    expect((expr.expr as Identifier).name).toBe("value");
  });

  it("Value accessor with literal", () => {
    const parser = new Parser("123!");
    const expr = parser.parseExpr() as ValueAccessorExpression;

    expect(expr.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((expr.expr as any).type).toBe(T_LITERAL);
    expect((expr.expr as any).value).toBe(123);
  });

  it("Example from requirement: userProfile!.dummy", () => {
    const parser = new Parser("userProfile!.dummy");
    const expr = parser.parseExpr() as MemberAccessExpression;

    // The outer expression should be member access (.dummy)
    expect(expr.type).toBe(T_MEMBER_ACCESS_EXPRESSION);
    expect(expr.member).toBe("dummy");
    
    // The inner expression should be value accessor (userProfile!)
    const obj = expr.obj as ValueAccessorExpression;
    expect(obj.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((obj.expr as Identifier).type).toBe(T_IDENTIFIER);
    expect((obj.expr as Identifier).name).toBe("userProfile");
  });

  it("Complex expression: obj!.method(arg!.value)", () => {
    const parser = new Parser("obj!.method(arg!.value)");
    const expr = parser.parseExpr() as FunctionInvocationExpression;

    // outer: method invocation
    expect(expr.type).toBe(T_FUNCTION_INVOCATION_EXPRESSION);
    expect(expr.arguments.length).toBe(1);

    // obj: obj!.method
    const methodAccess = expr.obj as MemberAccessExpression;
    expect(methodAccess.type).toBe(T_MEMBER_ACCESS_EXPRESSION);
    expect(methodAccess.member).toBe("method");

    const objValueAccessor = methodAccess.obj as ValueAccessorExpression;
    expect(objValueAccessor.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((objValueAccessor.expr as Identifier).name).toBe("obj");

    // arg: arg!.value
    const argMember = expr.arguments[0] as MemberAccessExpression;
    expect(argMember.type).toBe(T_MEMBER_ACCESS_EXPRESSION);
    expect(argMember.member).toBe("value");

    const argValueAccessor = argMember.obj as ValueAccessorExpression;
    expect(argValueAccessor.type).toBe(T_VALUE_ACCESSOR_EXPRESSION);
    expect((argValueAccessor.expr as Identifier).name).toBe("arg");
  });
});
