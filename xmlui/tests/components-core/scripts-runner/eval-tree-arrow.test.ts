import { describe, expect, it } from "vitest";

import { evalBindingExpression } from "../../../src/components-core/script-runner/eval-tree-sync";
import {createEvalContext} from "./test-helpers";

describe("Evaluate arrow expressions", () => {
  it("Arrow #1", () => {
    // --- Arrange
    const source = "(x => 2 * x)(4)";
    const context = createEvalContext({});

    // --- Act
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).equal(8);
  });

  it("Arrow #2", () => {
    // --- Arrange
    const source = "((x, y) => x + y)(1, 2)";
    const context = createEvalContext({});

    // --- Act
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).equal(3);
  });

  it("Arrow #3", () => {
    // --- Arrange
    const source = "((x, y) => { return x + y })(1, 2)";
    const context = createEvalContext({});

    // --- Act
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).equal(3);
  });

  it("Arrow #4", () => {
    // --- Arrange
    const source = "(x => (++x.h))(count)";
    const context = createEvalContext({
      localContext: {
        count: { h: 3 }
      }
    });

    // --- Act
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).equal(4);
  });

  it("Arrow #5", () => {
    // --- Arrange
    const source = "(x => x += 2)(count)";
    const context = createEvalContext({
      localContext: {
        count: 3
      }
    });

    // --- Act
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).equal(5);
  });

  it("Arrow #6", () => {
    // --- Arrange
    const source = "(x => x += 2)(count + 4)";
    const context = createEvalContext({
      localContext: {
        count: 3
      }
    });

    // --- Act
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).equal(9);
  });

  it("Arrow #7", () => {
    // --- Arrange
    const source = "[1,2,3,4,5].filter(x => x % 2 === 0)[1]";
    const context = createEvalContext({
      localContext: {
        count: 3
      }
    });

    // --- Act
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).equal(4);
  });

  it("Arrow #8", () => {
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
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).equal(2);
  });

  it("Arrow #9", () => {
    // --- Arrange
    const source = "array.reduce((acc, item) => acc + item, 0)";
    const context = createEvalContext({
      localContext: {
        array: [5, 4, 3, 2, 1]
      }
    });

    // --- Act
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).equal(15);
  });

  it("Arrow with rest #1", () => {
    // --- Arrange
    const source = "((...a) => a[0] + a[1])(1, 2)";
    const context = createEvalContext({});

    // --- Act
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).equal(3);
  });

  it("Arrow with rest #2", () => {
    // --- Arrange
    const source = "((x, ...a) => x + a[0] + a[1])(1, 2, 3)";
    const context = createEvalContext({});

    // --- Act
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).equal(6);
  });
});
