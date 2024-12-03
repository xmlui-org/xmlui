import { describe, expect, it } from "vitest";

import { evalBindingAsync } from "@components-core/script-runner/eval-tree-async";
import {createEvalContext} from "./test-helpers";
import { Parser } from "@parsers/scripting/Parser";

describe("Evaluate function expressions", () => {
  it("Funcion decl #1", async () => {
    // --- Arrange
    const source = "(function(x) { return 2 * x })(4)";
    const context = createEvalContext({});

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(8);
  });

  it("Function decl #2", async () => {
    // --- Arrange
    const source = "(function (x, y) { return x + y })(1, 2)";
    const context = createEvalContext({});

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(3);
  });

  it("Function decl #3", async () => {
    // --- Arrange
    const source = "(function (x, y) { return x + y })(1, 2)";
    const context = createEvalContext({});

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(3);
  });

  it("Function decl #4", async () => {
    // --- Arrange
    const source = "(function (x) { return (++x.h); })(count)";
    const context = createEvalContext({
      localContext: {
        count: { h: 3 }
      }
    });

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(4);
  });

  it("Function decl #5", async () => {
    // --- Arrange
    const source = "(function (x) { return x += 2 })(count)";
    const context = createEvalContext({
      localContext: {
        count: 3
      }
    });

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(5);
  });

  it("Function decl #6", async () => {
    // --- Arrange
    const source = "(function (x) { return x += 2 })(count + 4)";
    const context = createEvalContext({
      localContext: {
        count: 3
      }
    });

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(9);
  });

  it("Function decl #7", async () => {
    // --- Arrange
    const source = "[1,2,3,4,5].filter(function (x) { return x % 2 === 0})[1]";
    const context = createEvalContext({
      localContext: {
        count: 3
      }
    });

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(4);
  });

  it("Function decl #8", async () => {
    // --- Arrange
    const source = "containsArray.array.filter(function (item) {return item % 2 === 0})[1]";
    const context = createEvalContext({
      localContext: {
        containsArray: {
          array: [5, 4, 3, 2, 1]
        }
      }
    });

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(2);
  });

  it("Function decl #9", async () => {
    // --- Arrange
    const source = "array.reduce(function (acc, item) { return acc + item}, 0)";
    const context = createEvalContext({
      localContext: {
        array: [5, 4, 3, 2, 1]
      }
    });

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(15);
  });

  it("Function decl with rest #1", async () => {
    // --- Arrange
    const source = "(function (...a) { return a[0] + a[1] })(1, 2)";
    const context = createEvalContext({});

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(3);
  });

  it("Function decl with rest #2", async () => {
    // --- Arrange
    const source = "(function (x, ...a) { return x + a[0] + a[1] })(1, 2, 3)";
    const context = createEvalContext({});

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(6);
  });

  it("Function decl reccursive #1", async () => {
    // --- Arrange
    const source = "(function factorial(n) { return n <= 0 ? 1 : n * factorial(n - 1)})(3)";
    const context = createEvalContext({});

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(6);
  });
});


async function evalAsync(source: string, evalContext: any): Promise<any> {
  const wParser = new Parser(source);
  const tree = wParser.parseExpr();
  if (tree === null) {
    // --- This should happen only when an expression is empty
    return undefined;
  }

  // --- Check for expression termination
  if (!wParser.isEof) {
    throw new Error("Expression is not terminated properly");
  }

  // --- Ok, valid source, evaluate
  return await evalBindingAsync(tree, evalContext, undefined);
} 