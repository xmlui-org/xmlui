import { describe, expect, it } from "vitest";

import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { createEvalContext, parseStatements } from "./test-helpers";

describe("Process statements - destructure", () => {
  it("let array destructure #1", async () => {
    // --- Arrange
    const source = "let [a, b] = [3, 6]; x = a; y = b;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
  });

  it("let array destructure #2", async () => {
    // --- Arrange
    const source = "let [,a, b] = [3, 6, 8]; x = a; y = b;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(6);
    expect(evalContext.localContext.y).equal(8);
  });

  it("let array destructure #3", async () => {
    // --- Arrange
    const source = "let [a, [b, c]] = [3, [6, 8]]; x = a; y = b; z = c;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("let array destructure #4", async () => {
    // --- Arrange
    const source = "let [a, , [, b, c]] = [3, -11, [-1, 6, 8]]; x = a; y = b; z = c;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("let object destructure #1", async () => {
    // --- Arrange
    const source = "let {a, b} = {a: 3, b: 6}; x = a; y = b;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
  });

  it("let object destructure #2", async () => {
    // --- Arrange
    const source = "let {a, qqq:b } = {a: 3, qqq: 6}; x = a; y = b;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
  });

  it("let object destructure #3", async () => {
    // --- Arrange
    const source = "let {a, qqq: {b, c}} = {a: 3, qqq: {b: 6, c: 8}}; x = a; y = b; z = c";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("let object and array destructure #1", async () => {
    // --- Arrange
    const source = "let {a, qqq: [b, c]} = {a: 3, qqq: [6, 8] }; x = a; y = b; z = c";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("let object and array destructure #2", async () => {
    // --- Arrange
    const source = "let {a, qqq: [b,,c]} = {a: 3, qqq: [6, -1, 8] }; x = a; y = b; z = c";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("let object and array destructure #3", async () => {
    // --- Arrange
    const source = "let [a, {b, c}] = [3, {b: 6, c: 8}]; x = a; y = b; z = c";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("let object and array destructure #3", async () => {
    // --- Arrange
    const source = "let [a, , {b, c}] = [3, -1, {b: 6, c: 8}]; x = a; y = b; z = c";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("const array destructure #1", async () => {
    // --- Arrange
    const source = "const [a, b] = [3, 6]; x = a; y = b;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
  });

  it("const array destructure #2", async () => {
    // --- Arrange
    const source = "const [,a, b] = [3, 6, 8]; x = a; y = b;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(6);
    expect(evalContext.localContext.y).equal(8);
  });

  it("const array destructure #3", async () => {
    // --- Arrange
    const source = "const [a, [b, c]] = [3, [6, 8]]; x = a; y = b; z = c;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("const array destructure #4", async () => {
    // --- Arrange
    const source = "const [a, , [, b, c]] = [3, -11, [-1, 6, 8]]; x = a; y = b; z = c;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("const object destructure #1", async () => {
    // --- Arrange
    const source = "const {a, b} = {a: 3, b: 6}; x = a; y = b;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
  });

  it("const object destructure #2", async () => {
    // --- Arrange
    const source = "const {a, qqq:b } = {a: 3, qqq: 6}; x = a; y = b;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
  });

  it("const object destructure #3", async () => {
    // --- Arrange
    const source = "const {a, qqq: {b, c}} = {a: 3, qqq: {b: 6, c: 8}}; x = a; y = b; z = c";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("const object and array destructure #1", async () => {
    // --- Arrange
    const source = "const {a, qqq: [b, c]} = {a: 3, qqq: [6, 8] }; x = a; y = b; z = c";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("const object and array destructure #2", async () => {
    // --- Arrange
    const source = "const {a, qqq: [b,,c]} = {a: 3, qqq: [6, -1, 8] }; x = a; y = b; z = c";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("const object and array destructure #3", async () => {
    // --- Arrange
    const source = "const [a, {b, c}] = [3, {b: 6, c: 8}]; x = a; y = b; z = c";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("const object and array destructure #3", async () => {
    // --- Arrange
    const source = "const [a, , {b, c}] = [3, -1, {b: 6, c: 8}]; x = a; y = b; z = c";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("arrow destructure #1", async () => {
    // --- Arrange
    const source = "const fn = ([a, b]) => { x = a; y = b}; fn([3, 6, 8])";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
  });

  it("arrow destructure #2", async () => {
    // --- Arrange
    const source = "const fn = ([a, , b]) => { x = a; y = b}; fn([3, 6, 8])";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(8);
  });

  it("arrow destructure #3", async () => {
    // --- Arrange
    const source = "const fn = ([a, b]) => { x = a; y = b}; fn([3])";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(undefined);
  });

  it("arrow destructure #4", async () => {
    // --- Arrange
    const source = "const fn = ([a, , b]) => { x = a; y = b}; fn([3, 6])";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(undefined);
  });

  it("arrow destructure #5", async () => {
    // --- Arrange
    const source = "const fn = ([a, [b, c]]) => { x = a; y = b; z = c }; fn([3, [6, 8]])";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("arrow destructure #6", async () => {
    // --- Arrange
    const source = "const fn = ({a, b}) => { x = a; y = b}; fn({a: 3, b: 6, v: 8})";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
  });

  it("arrow destructure #7", async () => {
    // --- Arrange
    const source = "const fn = ({a, b}) => { x = a; y = b}; fn({a: 3, v: 8})";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(undefined);
  });

  it("arrow destructure #8", async () => {
    // --- Arrange
    const source = "const fn = ({a, q:b}) => { x = a; y = b}; fn({a: 3, q: 6, v: 8})";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
  });

  it("arrow destructure #9", async () => {
    // --- Arrange
    const source =
      "const fn = ({a, q: {b, c}}) => { x = a; y = b; z = c}; fn({a: 3, q: {b: 6, c: 8}})";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("arrow destructure #10", async () => {
    // --- Arrange
    const source = "const fn = ({a, q:[b, c]}) => { x = a; y = b; z = c}; fn({a: 3, q: [6, 8]})";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("arrow destructure #11", async () => {
    // --- Arrange
    const source =
      "const fn = ({a, q:[b, , c]}) => { x = a; y = b; z = c}; fn({a: 3, q: [6, -1, 8]})";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });

  it("arrow destructure #12", async () => {
    // --- Arrange
    const source = "const fn = ([a, {b, c}]) => { x = a; y = b; z = c}; fn([3, {b: 6, c: 8}])";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.y).equal(6);
    expect(evalContext.localContext.z).equal(8);
  });
});
