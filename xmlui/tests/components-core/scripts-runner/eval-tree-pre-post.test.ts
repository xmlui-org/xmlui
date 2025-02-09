import { describe, expect, it } from "vitest";

import { evalBindingExpression } from "../../../src/components-core/script-runner/eval-tree-sync";
import { createEvalContext } from "./test-helpers";

describe("Evaluate prefix/postfix expressions", () => {
  const prePostCases1 = [
    { src: "++x", ctx: { x: 0 }, exp: 1, varExp: 1 },
    { src: "--x", ctx: { x: 0 }, exp: -1, varExp: -1 },
    { src: "x++", ctx: { x: 0 }, exp: 0, varExp: 1 },
    { src: "x--", ctx: { x: 0 }, exp: 0, varExp: -1 }
  ];
  prePostCases1.forEach(c => {
    it(`Prefix/postfix '${c.src}'`, () => {
      // --- Arrange
      const context = createEvalContext({
        localContext: c.ctx
      });

      // --- Act
      const value = evalBindingExpression(c.src, context);

      // --- Arrange
      expect(value).equal(c.exp);
      expect(context.localContext["x"]).equal(c.varExp);
    });
  });
  const prePostCases2 = [
    { src: "++j[2]", exp: 4, varExp: 4 },
    { src: "--j[2]", exp: 2, varExp: 2 },
    { src: "j[1+1]++", exp: 3, varExp: 4 },
    { src: "j[4-2]--", exp: 3, varExp: 2 }
  ];
  prePostCases2.forEach(c => {
    it(`Prefix/postfix '${c.src}'`, () => {
      // --- Arrange
      const jArr = [1, 2, 3];
      const context = createEvalContext({
        localContext: {
          j: jArr
        }
      });

      // --- Act
      const value = evalBindingExpression(c.src, context);

      // --- Arrange
      expect(value).equal(c.exp);
      expect(context.localContext.j[2]).equal(c.varExp);
    });
  });

  const prePostCases3 = [
    { src: "++j[2].h", exp: 4, varExp: 4 },
    { src: "--j[2].h", exp: 2, varExp: 2 },
    { src: "j[1+1].h++", exp: 3, varExp: 4 },
    { src: "j[4-2].h--", exp: 3, varExp: 2 }
  ];
  prePostCases3.forEach(c => {
    it(`Prefix/postfix '${c.src}'`, () => {
      // --- Arrange
      const jArr = [{ h: 1 }, { h: 2 }, { h: 3 }];
      const context = createEvalContext({
        localContext: {
          j: jArr
        }
      });

      // --- Act
      const value = evalBindingExpression(c.src, context);

      // --- Arrange
      expect(value).equal(c.exp);
      expect(context.localContext.j[2].h).equal(c.varExp);
    });
  });

  const prePostCases4 = [
    { src: "++j.h[2]", exp: 4, varExp: 4 },
    { src: "--j.h[2]", exp: 2, varExp: 2 },
    { src: "j.h[1+1]++", exp: 3, varExp: 4 },
    { src: "j.h[4-2]--", exp: 3, varExp: 2 }
  ];
  prePostCases4.forEach(c => {
    it(`Prefix/postfix '${c.src}'`, () => {
      // --- Arrange
      const jArr = [1, 2, 3];
      const context = createEvalContext({
        localContext: {
          j: { h: jArr }
        }
      });

      // --- Act
      const value = evalBindingExpression(c.src, context);

      // --- Arrange
      expect(value).equal(c.exp);
      expect(context.localContext.j.h[2]).equal(c.varExp);
    });
  });

  it("Postfix with arrow", () => {
    // --- Arrange
    const source = "(x => ++x)(count)";
    const context = createEvalContext({
      localContext: {
        count: 6
      }
    });

    // --- Act
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).equal(7);
  });
});
