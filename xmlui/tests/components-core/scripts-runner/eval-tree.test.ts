import { describe, expect, it, assert } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import {
  evalBinding,
  evalBindingExpression,
} from "../../../src/components-core/script-runner/eval-tree-sync";
import { createEvalContext } from "./test-helpers";
import { evalBindingAsync } from "../../../src/components-core/script-runner/eval-tree-async";

describe("Evaluate binding expression tree (exp)", () => {
  const literalCases = [
    { src: "undefined", exp: undefined },
    { src: "null", exp: null },
    { src: "Infinity", exp: Infinity },
    { src: "false", exp: false },
    { src: "true", exp: true },
    { src: "123", exp: 123 },
    { src: "123.25", exp: 123.25 },
    { src: "123.25e11", exp: 123.25e11 },
    { src: "0b11_11", exp: 0x0f },
    { src: "0x12_ae", exp: 0x12ae },
    {
      src: "123456789123456789123456789",
      exp: BigInt("123456789123456789123456789"),
    },
    { src: '"Hello"', exp: "Hello" },

    { src: "Math", exp: Math },
    { src: "Math", con: { Math: 123 }, exp: 123 },
    { src: "::Math", exp: Math },
    { src: "::Math", con: { Math: 123 }, exp: Math },
  ];
  literalCases.forEach((c) => {
    it(`Eval literal: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({ localContext: (c as any).con ?? {} });
      const value = evalBinding(expr, context);
      expect(value).equal(c.exp);
    });
  });

  it(`Eval literal: NaN`, () => {
    // --- Arrange
    const wParser = new Parser("NaN");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({ localContext: {} });
    const value = evalBinding(expr, context);
    expect(isNaN(value)).equal(true);
  });

  const identifierCases = [
    { src: "alma", con: { alma: undefined }, exp: undefined },
    { src: "alma", con: { alma: 112 }, exp: 112 },
    { src: "banana", con: { alma: 112, banana: 223 }, exp: 223 },
    { src: "alma", con: { alma: "abc", banana: 223 }, exp: "abc" },
    { src: "alma", con: { alma: true, banana: 223 }, exp: true },
    { src: "alma", con: { alma: false, banana: 223 }, exp: false },
    { src: "alma", con: { alma: 123.5, banana: 223 }, exp: 123.5 },
  ];
  identifierCases.forEach((c) => {
    it(`Eval identifier: ${c.src}/${JSON.stringify(c.con)}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({ localContext: c.con });
      const value = evalBinding(expr, context);
      expect(value).equal(c.exp);
    });
  });

  const memberAccessCases = [
    { src: "alma.b", con: { alma: { b: 123 } }, exp: 123 },
    { src: "alma.b.c", con: { alma: { b: { c: 123, d: 234 } } }, exp: 123 },
    { src: "alma.b.d", con: { alma: { b: { c: 123, d: 234 } } }, exp: 234 },
    { src: "alma.length", con: { alma: "banana" }, exp: 6 },
    {
      src: "alma.b.d.length",
      con: { alma: { b: { c: 123, d: "hello" } } },
      exp: 5,
    },
    { src: "Math.sin", con: { alma: "banana" }, exp: Math.sin },
  ];
  memberAccessCases.forEach((c) => {
    it(`Eval member access: ${c.src}/${JSON.stringify(c.con)}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({ localContext: c.con });
      const value = evalBinding(expr, context);
      expect(value).equal(c.exp);
    });
  });

  const calculatedMemberAccessCases = [
    { src: 'alma["b"]', con: { alma: { b: 123 } }, exp: 123 },
    {
      src: 'alma["b"]["c"]',
      con: { alma: { b: { c: 123, d: 234 } } },
      exp: 123,
    },
    {
      src: 'alma["b"]["d"]',
      con: { alma: { b: { c: 123, d: 234 } } },
      exp: 234,
    },
    { src: 'alma["length"]', con: { alma: "banana" }, exp: 6 },
    { src: "alma[0]", con: { alma: [1, true, "banana"] }, exp: 1 },
    { src: "alma[1]", con: { alma: [1, true, "banana"] }, exp: true },
    { src: "alma[2]", con: { alma: [1, true, "banana"] }, exp: "banana" },
  ];
  calculatedMemberAccessCases.forEach((c) => {
    it(`Eval member access: ${c.src}/${JSON.stringify(c.con)}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({ localContext: c.con });
      const value = evalBinding(expr, context);
      expect(value).equal(c.exp);
    });
  });

  const optionalMemberAccessCases = [
    { src: "alma?.b", con: { alma: { b: 123 } }, exp: 123 },
    { src: "alma?.b", con: { alma: { b: null } }, exp: null },
    { src: "alma?.b", con: { pear: { b: 123 }, alma: undefined }, exp: undefined },
    { src: "alma?.b?.c", con: { alma: { b: { c: 123, d: 234 } } }, exp: 123 },
    { src: "alma?.b?.c", con: { alma: { b: { c: null, d: 234 } } }, exp: null },
    {
      src: "alma?.b?.c",
      con: { pear: { b: { c: 123, d: 234 } }, alma: undefined },
      exp: undefined,
    },
    {
      src: "alma?.b?.c",
      con: { alma: { b: { w: 123, d: 234 } } },
      exp: undefined,
    },
    {
      src: "alma?.b?.c",
      con: { pear: { b: { w: 123, d: 234 } }, alma: undefined },
      exp: undefined,
    },
  ];
  optionalMemberAccessCases.forEach((c) => {
    it(`Eval member access: ${c.src}/${JSON.stringify(c.con)}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({ localContext: c.con });
      const value = evalBinding(expr, context);
      expect(value).equal(c.exp);
    });
  });

  const defaultedMemberAccessCases = [
    { src: "alma.b", con: { alma: { b: 123 } }, exp: 123 },
    { src: "alma.b", con: { alma: { b: null } }, exp: null },
    { src: "alma.b", con: { pear: { b: 123 }, alma: undefined }, exp: undefined },
    { src: "alma.b.c", con: { alma: { b: { c: 123, d: 234 } } }, exp: 123 },
    { src: "alma.b.c", con: { alma: { b: { c: null, d: 234 } } }, exp: null },
    {
      src: "alma.b.c",
      con: { pear: { b: { c: 123, d: 234 } }, alma: undefined },
      exp: undefined,
    },
    {
      src: "alma.b.c",
      con: { alma: { b: { w: 123, d: 234 } } },
      exp: undefined,
    },
    {
      src: "alma.b.c",
      con: { pear: { b: { w: 123, d: 234 } }, alma: undefined },
      exp: undefined,
    },
  ];
  defaultedMemberAccessCases.forEach((c) => {
    it(`Eval forced optional member access: ${c.src}/${JSON.stringify(c.con)}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({
        localContext: c.con,
        appContext: {},
        options: { defaultToOptionalMemberAccess: true },
      });
      const value = evalBinding(expr, context);
      expect(value).equal(c.exp);
    });
  });

  const sequenceCases = [
    { src: "0, alma.b", con: { alma: { b: 123 } }, exp: 123 },
    {
      src: "1, a+b, alma.b.c",
      con: { alma: { b: { c: 123, d: 234 } }, a: 0, b: 0 },
      exp: 123,
    },
    {
      src: "2, a+b, alma.b.d",
      con: { alma: { b: { c: 123, d: 234 } }, a: 0, b: 0 },
      exp: 234,
    },
    { src: "1, 2, 3, alma.length", con: { alma: "banana" }, exp: 6 },
    {
      src: "alma, alma, alma.b.d.length",
      con: { alma: { b: { c: 123, d: "hello" } } },
      exp: 5,
    },
  ];
  sequenceCases.forEach((c) => {
    it(`Eval calculated member access: ${c.src}/${JSON.stringify(c.con)}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({ localContext: c.con });
      const value = evalBinding(expr, context);
      expect(value).equal(c.exp);
    });
  });

  const arrayLiteralCases = [
    {
      src: "[ alma.a, alma.b]",
      con: { alma: { a: 234, b: 123 } },
      exp: [234, 123],
    },
    {
      src: '[ "banana", alma.a, alma.b]',
      con: { alma: { a: 234, b: 123 } },
      exp: ["banana", 234, 123],
    },
    {
      src: '[ "banana", alma.a, alma.b.c]',
      con: { alma: { a: 234, b: { f: false, c: true } } },
      exp: ["banana", 234, true],
    },
  ];
  arrayLiteralCases.forEach((c) => {
    it(`Array literal: ${c.src}/${JSON.stringify(c.con)}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({ localContext: c.con });
      const value = evalBinding(expr, context);
      expect(value.length).equal(c.exp.length);
      for (let i = 0; i < value.length; i++) {
        expect(value[i]).equal(c.exp[i]);
      }
    });
  });

  const objectLiteralCases = [
    {
      src: "{ a: alma.a, b: alma.b }",
      con: { alma: { a: 234, b: 123 } },
      exp: { a: 234, b: 123 },
    },
    {
      src: "{ a: true, b: alma.b }",
      con: { alma: { a: 234, b: 123 } },
      exp: { a: true, b: 123 },
    },
    {
      src: '{ a: alma.a, b: "banana" }',
      con: { alma: { a: 234, b: 123 } },
      exp: { a: 234, b: "banana" },
    },
    {
      src: '{ "q": alma.a, b: "banana" }',
      con: { alma: { a: 234, b: 123 } },
      exp: { q: 234, b: "banana" },
    },
    {
      src: '{ 123: alma.a, b: "banana" }',
      con: { alma: { a: 234, b: 123 } },
      exp: { 123: 234, b: "banana" },
    },
    {
      src: '{ [1+2]: alma.a, b: "banana" }',
      con: { alma: { a: 234, b: 123 } },
      exp: { 3: 234, b: "banana" },
    },
    {
      src: '{ ["abc".length]: alma.a, b: "banana" }',
      con: { alma: { a: 234, b: 123 } },
      exp: { 3: 234, b: "banana" },
    },
    {
      src: '{ ["app" + "le"]: alma.a, b: "banana" }',
      con: { alma: { a: 234, b: 123 } },
      exp: { apple: 234, b: "banana" },
    },
  ];
  objectLiteralCases.forEach((c) => {
    it(`Array literal: ${c.src}/${JSON.stringify(c.con)}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({ localContext: c.con });
      const value = evalBinding(expr, context);
      for (const key in c.exp) {
        expect(value[key]).equal((c.exp as any)[key]);
      }
    });
  });

  const unaryCases = [
    { src: "+alma.b", con: { alma: { b: 123 } }, exp: 123 },
    { src: "-alma.b", con: { alma: { b: 123 } }, exp: -123 },
    { src: "!alma.b", con: { alma: { b: 0 } }, exp: true },
    { src: "!alma.b", con: { alma: { b: 123 } }, exp: false },
    { src: "~alma.b", con: { alma: { b: 123 } }, exp: -124 },
    { src: "~alma.b", con: { alma: { b: 0 } }, exp: -1 },
    { src: "typeof alma.b", con: { alma: { b: 0 } }, exp: "number" },
    { src: "typeof alma.b", con: { alma: { b: "Hello" } }, exp: "string" },
    { src: "typeof alma.b", con: { alma: { b: false } }, exp: "boolean" },
    { src: "typeof alma.b", con: { alma: { b: null } }, exp: "object" },
    { src: "typeof alma.b", con: { alma: {} }, exp: "undefined" },
    { src: "typeof alma.b", con: { alma: { b: {} } }, exp: "object" },
    { src: "typeof alma.b", con: { alma: { b: [1, 2, 3] } }, exp: "object" },
  ];
  unaryCases.forEach((c) => {
    it(`Unary operation: ${c.src}/${JSON.stringify(c.con)}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({ localContext: c.con });
      const value = evalBinding(expr, context);
      expect(value).equal(c.exp);
    });
  });

  const binaryCases = [
    { src: "alma.b * c", con: { alma: { b: 123 }, c: 3 }, exp: 369 },
    { src: "alma.b / c", con: { alma: { b: 123 }, c: 3 }, exp: 41 },
    { src: "alma.b % c", con: { alma: { b: 125 }, c: 3 }, exp: 2 },
    { src: "alma.b + 3", con: { alma: { b: 123 } }, exp: 126 },
    {
      src: "123456789123456789 + 123456789123456789123",
      con: {},
      exp: BigInt("123580245912580245912"),
    },
    { src: '"👍" + "🚀"', con: {}, exp: "👍🚀" },
    { src: '"Hello," + " World!"', con: {}, exp: "Hello, World!" },
    { src: "alma.b - 3", con: { alma: { b: 123 } }, exp: 120 },
    { src: "alma.b >> 2", con: { alma: { b: 123 } }, exp: 30 },
    { src: "alma.b >> 2", con: { alma: { b: 123 } }, exp: 30 },
    { src: "-alma.b >> 2", con: { alma: { b: 123 } }, exp: -31 },
    { src: "alma.b >>> 2", con: { alma: { b: 123 } }, exp: 30 },
    { src: "-alma.b >>> 2", con: { alma: { b: 123 } }, exp: 1073741793 },
    { src: "alma.b < 3", con: { alma: { b: 123 } }, exp: false },
    { src: "alma.b <= 123", con: { alma: { b: 123 } }, exp: true },
    { src: "alma.b > 123", con: { alma: { b: 123 } }, exp: false },
    { src: "alma.b >= 123", con: { alma: { b: 123 } }, exp: true },
    { src: "alma.b >= 123", con: { alma: { b: 123 } }, exp: true },
    { src: "2 in [12, 123, 1234]", con: { alma: { b: 123 } }, exp: true },
    { src: '"PI" in Math', con: { alma: { b: 123 } }, exp: true },
    { src: "alma.b == 3", con: { alma: { b: 123 } }, exp: false },
    { src: "alma.b == 123", con: { alma: { b: 123 } }, exp: true },
    { src: "alma.b === 123", con: { alma: { b: 123 } }, exp: true },
    { src: "alma.b != 3", con: { alma: { b: 123 } }, exp: true },
    { src: "alma.b != 123", con: { alma: { b: 123 } }, exp: false },
    { src: "alma.b !== 123", con: { alma: { b: 123 } }, exp: false },
    { src: "alma.b & 12", con: { alma: { b: 123 } }, exp: 8 },
    { src: "alma.b | 12", con: { alma: { b: 123 } }, exp: 127 },
    { src: "alma.b ^ 12", con: { alma: { b: 123 } }, exp: 119 },
    { src: "alma.b && 12", con: { alma: { b: 123 } }, exp: 12 },
    { src: "alma.b && 12 > 3", con: { alma: { b: 123 } }, exp: true },
    { src: "alma.b || 12", con: { alma: { b: 123 } }, exp: 123 },
    { src: "alma.b || 12 > 3", con: { alma: { b: 123 } }, exp: 123 },
    { src: "alma.b < 3 || 12 > 3", con: { alma: { b: 123 } }, exp: true },
    { src: "12 + 23 * 4", con: {}, exp: 104 },
    { src: "(12 + 23) * 4", con: {}, exp: 140 },
    { src: "12 * 23 + 4", con: {}, exp: 280 },
    { src: "alma.b ?? 12", con: { alma: { b: null } }, exp: 12 },
    { src: "alma.b ?? 12", con: { alma: { b: undefined } }, exp: 12 },
    { src: "alma.b ?? 12", con: { alma: { b: 234 } }, exp: 234 },
  ];
  binaryCases.forEach((c) => {
    it(`Binary operation: ${c.src}/${JSON.stringify(c.con)}`, () => {
      const context = createEvalContext({ localContext: c.con });
      const value = evalBindingExpression(c.src, context);
      expect(value).equal(c.exp);
    });
  });

  const exponentialCases = [
    {
      src: "2**3",
      exp: 8,
    },
    {
      src: "2**3**2",
      exp: 512,
    },
    {
      src: "4**2**3",
      exp: 65536,
    },
    {
      src: "1.5**2",
      exp: 2.25,
    },
    {
      src: "1.5**2**3",
      exp: 25.62890625,
    },
  ];
  exponentialCases.forEach((c) => {
    it(`Conditional: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);
      expect(value).equal(c.exp);
    });
  });

  const functionInvocationCases = [
    {
      src: "Math.sin(0)",
      con: { alma: { a: 234, b: 123 } },
      exp: 0,
    },
    {
      src: "Math.cos(0.0)",
      con: { alma: { a: 234, b: 123 } },
      exp: 1,
    },
    {
      src: "alma.mul(2, alma.mul(3,4)) + Math.cos(0)",
      con: { alma: { mul: (a: any, b: any) => a * b, b: 123 } },
      exp: 25,
    },
  ];
  functionInvocationCases.forEach((c) => {
    it(`Function call: ${c.src}/${JSON.stringify(c.con)}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({ localContext: c.con });
      const value = evalBinding(expr, context);
      expect(value).equal(c.exp);
    });
  });

  const itemReferenceCases = [
    {
      src: "$item",
      con: { $item: 123 },
      exp: 123,
    },
  ];
  itemReferenceCases.forEach((c) => {
    it(`Item reference: ${c.src}/${JSON.stringify(c.con)}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({ localContext: c.con });
      const value = evalBinding(expr, context);
      expect(value).equal(c.exp);
    });
  });

  const appContextCases = [
    {
      src: "alma.b",
      con: { pear: 123 },
      aCon: { alma: { b: 234 } },
      exp: 234,
    },
    {
      src: "alma.b",
      con: { alma: { b: 123 } },
      aCon: { alma: { b: 234 } },
      exp: 123,
    },
  ];
  appContextCases.forEach((c) => {
    it(`App context: ${c.src}/${JSON.stringify(c.con)}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act/Assert
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      const context = createEvalContext({ localContext: c.con, appContext: c.aCon });
      const value = evalBinding(expr, context);
      expect(value).equal(c.exp);
    });
  });

  it("Array literal with spread array", () => {
    // --- Arrange
    const wParser = new Parser("[5, ...[1,2,3], 4]");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({ localContext: {}, appContext: {} });
    const value = evalBinding(expr, context);
    expect(value.length).equal(5);
    expect(value[0]).equal(5);
    expect(value[1]).equal(1);
    expect(value[2]).equal(2);
    expect(value[3]).equal(3);
    expect(value[4]).equal(4);
  });

  it("Spread out of context", () => {
    // --- Arrange
    const wParser = new Parser("...[1,2,3]");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    try {
      const context = createEvalContext({ localContext: {}, appContext: {} });
      evalBinding(expr, context);
    } catch (err: any) {
      expect(err.message.indexOf("(...)")).greaterThan(-1);
      return;
    }
    assert.fail("Exception expected");
  });

  it("Array literal with spread object", () => {
    // --- Arrange
    const wParser = new Parser("[5, ...{a: 1, b: 2}]");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    try {
      const context = createEvalContext({ localContext: {}, appContext: {} });
      evalBinding(expr, context);
    } catch (err: any) {
      expect(err.message.indexOf("array operand")).greaterThan(-1);
      return;
    }
    assert.fail("Exception expected");
  });

  it("Object literal with spread array", () => {
    // --- Arrange
    const wParser = new Parser("{ a:1, ...[1,2,3], b:4}");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({ localContext: {}, appContext: {} });
    const value = evalBinding(expr, context);
    expect(value[0]).equal(1);
    expect(value[1]).equal(2);
    expect(value[2]).equal(3);
    expect(value["a"]).equal(1);
    expect(value["b"]).equal(4);
  });

  it("Object literal with spread object", () => {
    // --- Arrange
    const wParser = new Parser("{ a:1, ...{ c:3, d:5}, b:4}");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({ localContext: {}, appContext: {} });
    const value = evalBinding(expr, context);
    expect(value["a"]).equal(1);
    expect(value["b"]).equal(4);
    expect(value["c"]).equal(3);
    expect(value["d"]).equal(5);
  });

  it("Function call with spread array", () => {
    // --- Arrange
    const wParser = new Parser("myFunc(1, 2, ...[3, 4], 5)");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({
      localContext: {
        myFunc(...args: any[]) {
          return args.join(":");
        },
      },
      appContext: {},
    });
    const value = evalBinding(expr, context);
    expect(value).equal("1:2:3:4:5");
  });

  it("Function call with spread object", () => {
    // --- Arrange
    const wParser = new Parser("myFunc(1, 2, ...{a: 1, b:2}, 5)");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    try {
      const context = createEvalContext({
        localContext: {
          myFunc(...args: any[]) {
            return args.join(":");
          },
        },
        appContext: {},
      });
      evalBinding(expr, context);
    } catch (err: any) {
      expect(err.message.indexOf("array operand")).greaterThan(-1);
      return;
    }
    assert.fail("Exception expected");
  });

  it("Sync function call with promise raises error", () => {
    // --- Arrange
    const wParser = new Parser("delay(120)");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    try {
      const context = createEvalContext({
        localContext: {
          delay: async (time: number) => new Promise((resolve) => setTimeout(resolve, time)),
        },
        appContext: {},
      });
      evalBinding(expr, context);
    } catch (err: any) {
      expect(err.message).contains("Promise");
      return;
    }
    assert.fail("Exception expected");
  });

  it("Async function call works", async () => {
    // --- Arrange
    const wParser = new Parser("delay(120)");
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    // --- Act
    const context = createEvalContext({
      localContext: {
        delay: async (time: number) => {
          new Promise((resolve) => setTimeout(resolve, time));
          return 123;
        },
      },
      appContext: {},
    });
    const value = await evalBindingAsync(expr, context, undefined);

    // --- Assert
    expect(value).equal(123);
  });

  it("delete alma", () => {
    // --- Arrange
    const wParser = new Parser("delete alma");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({ localContext: { alma: {} } });
    const value = evalBinding(expr, context);
    expect(value).equal(true);
    expect(context.localContext.alma).equal(undefined);
  });

  it("delete alma.b #1", () => {
    // --- Arrange
    const wParser = new Parser("delete alma.b");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({ localContext: { alma: {} } });
    const value = evalBinding(expr, context);
    expect(value).equal(true);
    expect(context.localContext.alma.b).equal(undefined);
  });

  it("delete alma.b #2", () => {
    // --- Arrange
    const wParser = new Parser("delete alma.b");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({ localContext: { alma: { b: "hello" } } });
    const value = evalBinding(expr, context);
    expect(value).equal(true);
    expect(context.localContext.alma.b).equal(undefined);
  });

  it("delete 123", () => {
    // --- Arrange
    const wParser = new Parser("delete 123");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({});
    const value = evalBinding(expr, context);
    expect(value).equal(false);
  });

  it("|| regression #1", () => {
    // --- Arrange
    const wParser = new Parser("123 || ++a");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({
      localContext: { a: 0 },
    });
    const value = evalBinding(expr, context);
    expect(value).equal(123);
    expect(context.localContext.a).equal(0);
  });

  it("|| regression #2", () => {
    // --- Arrange
    const wParser = new Parser("true || ++a");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({
      localContext: { a: 0 },
    });
    const value = evalBinding(expr, context);
    expect(value).equal(true);
    expect(context.localContext.a).equal(0);
  });

  it("|| regression #3 (async)", async () => {
    // --- Arrange
    const wParser = new Parser("123 || ++a");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({
      localContext: { a: 0 },
    });
    const value = await evalBindingAsync(expr, context, context.mainThread);
    expect(value).equal(123);
    expect(context.localContext.a).equal(0);
  });

  it("|| regression #4 (async)", async () => {
    // --- Arrange
    const wParser = new Parser("true || ++a");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({
      localContext: { a: 0 },
    });
    const value = await evalBindingAsync(expr, context, context.mainThread);
    expect(value).equal(true);
    expect(context.localContext.a).equal(0);
  });

  it("&& regression #1", () => {
    // --- Arrange
    const wParser = new Parser("'' && ++a");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({
      localContext: { a: 0 },
    });
    const value = evalBinding(expr, context);
    expect(value).equal("");
    expect(context.localContext.a).equal(0);
  });

  it("&& regression #2", () => {
    // --- Arrange
    const wParser = new Parser("false && ++a");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({
      localContext: { a: 0 },
    });
    const value = evalBinding(expr, context);
    expect(value).equal(false);
    expect(context.localContext.a).equal(0);
  });

  it("&& regression #3 (async)", async () => {
    // --- Arrange
    const wParser = new Parser("0 && ++a");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({
      localContext: { a: 0 },
    });
    const value = await evalBindingAsync(expr, context, context.mainThread);
    expect(value).equal(0);
    expect(context.localContext.a).equal(0);
  });

  it("&& regression #4 (async)", async () => {
    // --- Arrange
    const wParser = new Parser("false && ++a");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({
      localContext: { a: 0 },
    });
    const value = await evalBindingAsync(expr, context, context.mainThread);
    expect(value).equal(false);
    expect(context.localContext.a).equal(0);
  });

  it(`Evals template literals`, () => {
    // --- Arrange
    const wParser = new Parser("`\\u0058\\x59a${2+3}b${var1}d${undef}${NaN}${null}\\${1+2}`");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    const context = createEvalContext({ localContext: { var1: "c", undef: undefined } });
    const value = evalBinding(expr, context);
    expect(value).to.equal("XYa5bcdundefinedNaNnull${1+2}");
  });

  it(`Evals template literals (async)`, async () => {
    // --- Arrange
    const wParser = new Parser("`\\u0058\\x59a${2+3}b${var1}d${undef}${NaN}${null}\\${1+2}`");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    const context = createEvalContext({ localContext: { var1: "c", undef: undefined } });
    const value = await evalBindingAsync(expr, context, context.mainThread);
    expect(value).to.equal("XYa5bcdundefinedNaNnull${1+2}");
  });

  it(`template literal method call`, async () => {
    // --- Arrange
    const wParser = new Parser("`a  `.trim()");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    const context = createEvalContext({
      localContext: {},
    });
    const value = await evalBindingAsync(expr, context, context.mainThread);
    expect(value).to.equal("a");
  });
});
