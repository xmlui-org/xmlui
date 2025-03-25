import { describe, expect, it } from "vitest";

import { evalBindingAsync } from "../../../src/components-core/script-runner-exp/eval-tree-async";
import { Parser } from "../../../src/parsers/scripting-exp/Parser";
import {createEvalContext} from "./test-helpers";

describe("Evaluate arrow expressions (epx)", () => {
  it("Arrow #1", async () => {
    // --- Arrange
    const source = "(x => 2 * x)(4)";
    const context = createEvalContext({});

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(8);
  });

  it("Arrow #2", async () => {
    // --- Arrange
    const source = "((x, y) => x + y)(1, 2)";
    const context = createEvalContext({});

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(3);
  });

  it("Arrow #3", async () => {
    // --- Arrange
    const source = "((x, y) => { return x + y })(1, 2)";
    const context = createEvalContext({});

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(3);
  });

  it("Arrow #4", async () => {
    // --- Arrange
    const source = "(x => (++x.h))(count)";
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

  it("Arrow #5", async () => {
    // --- Arrange
    const source = "(x => x += 2)(count)";
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

  it("Arrow #6", async () => {
    // --- Arrange
    const source = "(x => x += 2)(count + 4)";
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

  it("Arrow #7", async () => {
    // --- Arrange
    const source = "[1,2,3,4,5].filter(x => x % 2 === 0)[1]";
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

  it("Arrow #8", async () => {
    // --- Arrange
    const source = "containsArray.array.filter(item => item % 2 === 0)[1]";
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

  it("Arrow #9", async () => {
    // --- Arrange
    const source = "array.reduce((acc, item) => acc + item, 0)";
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

  it("Arrow with rest #1", async () => {
    // --- Arrange
    const source = "((...a) => a[0] + a[1])(1, 2)";
    const context = createEvalContext({});

    // --- Act
    const value = await evalAsync(source, context);

    // --- Arrange
    expect(value).equal(3);
  });

  it("Arrow with rest #2", async () => {
    // --- Arrange
    const source = "((x, ...a) => x + a[0] + a[1])(1, 2, 3)";
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