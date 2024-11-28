import { describe, expect, it, assert } from "vitest";

import { processStatementQueueAsync } from "@components-core/script-runner/process-statement-async";
import { createEvalContext, parseStatements } from "./test-helpers";
import buildProxy from "@components-core/container/buildProxy";
import { processStatementQueue } from "@components-core/script-runner/process-statement-sync";

describe("Process statements", () => {
  it("expression statement #1", async () => {
    // --- Arrange
    const source = "x = 3 * x;";
    const evalContext = createEvalContext({
      localContext: {
        x: 1
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(3);

    expect(diag.processedStatements).equal(1);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("Let statement #1", async () => {
    // --- Arrange
    const source = "let y";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect("y" in thread.blocks![0].vars).equal(true);
    expect(thread.blocks![0].constVars).equal(undefined);

    expect(diag.processedStatements).equal(1);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("Let statement #2", async () => {
    // --- Arrange
    const source = "let y = 3";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(3);
    expect(thread.blocks![0].constVars).equal(undefined);

    expect(diag.processedStatements).equal(1);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("Let statement #3", async () => {
    // --- Arrange
    const source = "let y = 3, z = 2";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(3);
    expect(thread.blocks![0].vars.z).equal(2);
    expect(thread.blocks![0].constVars).equal(undefined);

    expect(diag.processedStatements).equal(1);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("Const statement #2", async () => {
    // --- Arrange
    const source = "const y = 3";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(3);
    expect(thread.blocks![0].constVars!.has("y")).equal(true);

    expect(diag.processedStatements).equal(1);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("Const write #1", async () => {
    // --- Arrange
    const source = "const y = 3; y++";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err) {
      return;
    }
    assert.fail("Exception expected");
  });

  it("Const write #2", async () => {
    // --- Arrange
    const source = "const y = 3; y = 12";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err) {
      return;
    }
    assert.fail("Exception expected");
  });

  it("Implicit block #1", async () => {
    // --- Arrange
    const source = "let y = 3; x = 3 * y;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(3);
    expect(evalContext.localContext.x).equal(9);

    expect(diag.processedStatements).equal(2);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("Implicit block #2", async () => {
    // --- Arrange
    const source = "let y = 3; { let z = 2 ; x = 3 * y + z; }";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(3);
    expect(evalContext.localContext.x).equal(11);

    expect(diag.processedStatements).equal(5);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(3);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(3);
  });

  it("Block statement #1", async () => {
    // --- Arrange
    const source = "{ let y = 3; x = 3 * y; }";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(9);

    expect(diag.processedStatements).equal(4);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(3);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(3);
  });

  it("Block statement #2", async () => {
    // --- Arrange
    const source = "{ let y = 3; { let z = 2 ; x = 3 * y + z; } }";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(11);

    expect(diag.processedStatements).equal(7);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(3);
    expect(diag.maxQueueLength).equal(4);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(6);
  });

  it("Block statement #3", async () => {
    // --- Arrange
    const source = "{ let y = 3; { let z = 2 ; { x = 3 * y + z; } } }";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(11);

    expect(diag.processedStatements).equal(9);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(4);
    expect(diag.maxQueueLength).equal(4);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(8);
  });

  it("Block statement #4", async () => {
    // --- Arrange
    const source = "{ let y = 3; { let z = 2 ; { let z = 3; x = 3 * y + z; } } }";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(12);

    expect(diag.processedStatements).equal(10);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(4);
    expect(diag.maxQueueLength).equal(5);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(9);
  });

  it("If statement #1", async () => {
    // --- Arrange
    const source = "if (x === 0) x = 3";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(3);

    expect(diag.processedStatements).equal(2);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(1);
  });

  it("If statement #2", async () => {
    // --- Arrange
    const source = "if (x === 0) {x = 3}";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(3);

    expect(diag.processedStatements).equal(4);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(3);
  });

  it("If statement #3", async () => {
    // --- Arrange
    const source = "if (x === 0) x = 3; else x = 2";
    const evalContext = createEvalContext({
      localContext: {
        x: 1
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(2);

    expect(diag.processedStatements).equal(2);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(1);
  });

  it("If statement #4", async () => {
    // --- Arrange
    const source = "if (x === 0) x = 3; else { x = 2 }";
    const evalContext = createEvalContext({
      localContext: {
        x: 1
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(2);

    expect(diag.processedStatements).equal(4);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(3);
  });

  it("If statement #5", async () => {
    // --- Arrange
    const source = "if (x === 0) {x = 3;} else { x = 2 }";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(3);

    expect(diag.processedStatements).equal(4);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(3);
  });

  it("If statement #6", async () => {
    // --- Arrange
    const source = "if (x === 0) {x = 3;} else { x = 2 }";
    const evalContext = createEvalContext({
      localContext: {
        x: 1
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(2);

    expect(diag.processedStatements).equal(4);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(3);
  });

  it("while statement #1", async () => {
    // --- Arrange
    const source = "while (x < 3) x++;";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(3);

    expect(diag.processedStatements).equal(7);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(6);
  });

  it("while statement #2", async () => {
    // --- Arrange
    const source = "let x = 0; while (x < 3) x++;";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.x).equal(3);

    expect(diag.processedStatements).equal(8);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(6);
  });

  it("while statement #3", async () => {
    // --- Arrange
    const source = "let x = 0; while (x < 8) {let y = 2; x += y;}";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.x).equal(8);

    expect(diag.processedStatements).equal(22);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(4);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(20);
  });

  it("while statement #4", async () => {
    // --- Arrange
    const source = "let x = 0; while (x < 18) {let y = 0; while (y < 3) {x += y; y++;} }";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.x).equal(18);

    expect(diag.processedStatements).equal(122);
    expect(diag.maxLoops).equal(2);
    expect(diag.maxBlocks).equal(3);
    expect(diag.maxQueueLength).equal(6);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(120);
  });

  it("while with break #1", async () => {
    // --- Arrange
    const source = "let x = 0; while (true) {x++ ; if (x > 3) break;}";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.x).equal(4);

    expect(diag.processedStatements).equal(21);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(4);
    expect(diag.clearToLabels).equal(1);
    expect(diag.unshiftedItems).equal(21);
  });

  it("while with break #2", async () => {
    // --- Arrange
    const source = "let x = 0; while (true) {x++ ; if (x > 3) break;}; x++";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.x).equal(5);

    expect(diag.processedStatements).equal(22);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(5);
    expect(diag.clearToLabels).equal(1);
    expect(diag.unshiftedItems).equal(21);
  });

  it("while with continue #1", async () => {
    // --- Arrange
    const source = "let y = 0; let x = 0; while (x < 6) {x++; if (x == 3) continue; y += x; }";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(18);

    expect(diag.processedStatements).equal(38);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(5);
    expect(diag.clearToLabels).equal(1);
    expect(diag.unshiftedItems).equal(37);
  });

  it("do-while statement #1", async () => {
    // --- Arrange
    const source = "do x++; while (x < 3)";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(3);

    expect(diag.processedStatements).equal(7);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(6);
  });

  it("do-while statement #2", async () => {
    // --- Arrange
    const source = "do x++; while (x < 0)";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(1);

    expect(diag.processedStatements).equal(3);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(2);
  });

  it("do-while statement #3", async () => {
    // --- Arrange
    const source = "do { x++;} while (x < 3)";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(3);

    expect(diag.processedStatements).equal(13);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(3);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(12);
  });

  it("do-while statement #4", async () => {
    // --- Arrange
    const source = "let x = 0; do {let y = 2; x += y;} while (x < 8) ";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.x).equal(8);

    expect(diag.processedStatements).equal(22);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(4);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(20);
  });

  it("do-while statement #5", async () => {
    // --- Arrange
    const source = "let x = 0; do {let y = 0; while (y < 3) {x += y; y++;} } while (x < 18)";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.x).equal(18);

    expect(diag.processedStatements).equal(122);
    expect(diag.maxLoops).equal(2);
    expect(diag.maxBlocks).equal(3);
    expect(diag.maxQueueLength).equal(6);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(120);
  });

  it("do-while with break #1", async () => {
    // --- Arrange
    const source = "let x = 0; do {x++ ; if (x > 3) break;} while (true)";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.x).equal(4);

    expect(diag.processedStatements).equal(21);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(4);
    expect(diag.clearToLabels).equal(1);
    expect(diag.unshiftedItems).equal(21);
  });

  it("do-while with continue #1", async () => {
    // --- Arrange
    const source = "let y = 0; let x = 0; do {x++; if (x == 3) continue; y += x; } while (x < 6)";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(18);

    expect(diag.processedStatements).equal(38);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(5);
    expect(diag.clearToLabels).equal(1);
    expect(diag.unshiftedItems).equal(37);
  });

  it("for-loop #1", async () => {
    // --- Arrange
    const source = "let y = 0; for (let i = 0; i < 4; i++) y += i;";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(6);

    expect(diag.processedStatements).equal(16);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(3);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(14);
  });

  it("for-loop #2", async () => {
    // --- Arrange
    const source = "let y = 0; for (let i = 0; i < 4; i++) {y += i;}";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(6);

    expect(diag.processedStatements).equal(24);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(3);
    expect(diag.maxQueueLength).equal(4);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(22);
  });

  it("for-loop #3", async () => {
    // --- Arrange
    const source = "let y = 0; for (let i = 0; i < 4; i++) {y += i;}; y++";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(7);

    expect(diag.processedStatements).equal(25);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(3);
    expect(diag.maxQueueLength).equal(5);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(22);
  });

  it("for-loop #4", async () => {
    // --- Arrange
    const source = "let y = 0; for (let i = 0, j = 0; i < 4; i++, j+=2) {y += i + j}";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(18);

    expect(diag.processedStatements).equal(24);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(3);
    expect(diag.maxQueueLength).equal(4);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(22);
  });

  it("for-loop #5", async () => {
    // --- Arrange
    const source = "let y = 0; let i = 0; for (; i < 4; i++) {y += i}";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(6);

    expect(diag.processedStatements).equal(24);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(3);
    expect(diag.maxQueueLength).equal(4);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(21);
  });

  it("for-loop with continue", async () => {
    // --- Arrange
    const source = "let y = 0; for (let i = 0; i < 10; i++) {if (i % 3 === 0) continue; y += i; }";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(27);

    expect(diag.processedStatements).equal(60);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(3);
    expect(diag.maxQueueLength).equal(5);
    expect(diag.clearToLabels).equal(4);
    expect(diag.unshiftedItems).equal(66);
  });

  it("for-loop #6", async () => {
    // --- Arrange
    const source = "let y = 0; for (let i = 0; i < 4; i++) { break; }; y++";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(1);

    expect(diag.processedStatements).equal(7);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(3);
    expect(diag.maxQueueLength).equal(5);
    expect(diag.clearToLabels).equal(1);
    expect(diag.unshiftedItems).equal(7);
  });

  it("Arrow function body #1", async () => {
    // --- Arrange
    const source = "(() => {return 2})()";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].returnValue).equal(2);

    expect(diag.processedStatements).equal(1);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("Arrow function body #2", async () => {
    // --- Arrange
    const source = "let arr = () => {return 2}; let x = arr();";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.x).equal(2);

    expect(diag.processedStatements).equal(2);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("Arrow function body #3", async () => {
    // --- Arrange
    const source = "let arr = (x, y) => { let sum = 0; for (let i = x; i <= y; i++) sum+= i; return sum }; arr(1, 5);";
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].returnValue).equal(15);

    expect(diag.processedStatements).equal(2);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("Arrow function body #4", async () => {
    // --- Arrange
    const source =
      "let arr = (x, y) => { let sum = 0; for (let i = x; i <= y; i++) sum+= i; return sum }; z = arr(1, 5);";
    const evalContext = createEvalContext({
      localContext: {
        z: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(evalContext.localContext.z).equal(15);
    expect(thread.blocks![0].returnValue).equal(15);

    expect(diag.processedStatements).equal(2);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("return #1", async () => {
    // --- Arrange
    const source = "return 123";
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal(123);

    expect(diag.processedStatements).equal(1);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(1);
    expect(diag.unshiftedItems).equal(0);
  });

  it("return #2", async () => {
    // --- Arrange
    const source = "x = 1; return 123; x = 2";
    const evalContext = createEvalContext({
      localContext: {
        x: 0
      }
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(1);
    expect(thread.returnValue).equal(123);

    expect(diag.processedStatements).equal(2);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(3);
    expect(diag.clearToLabels).equal(1);
    expect(diag.unshiftedItems).equal(0);
  });

  it("return #3", async () => {
    // --- Arrange
    const source = "return";
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal(undefined);

    expect(diag.processedStatements).equal(1);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(1);
    expect(diag.unshiftedItems).equal(0);
  });

  it("Assign to unknown object property", async () => {
    // --- Arrange
    const source = "const obj = {}; obj.someValue = 42;";
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);
    
    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.obj).eql({someValue: 42});
    expect(thread.blocks![0].constVars!.has("obj")).equal(true);

    expect(diag.processedStatements).equal(2);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("Read-only write #1", async () => {
    // --- Arrange
    const source = "$x = 3";
    const evalContext = createEvalContext({
      localContext: getComponentStateClone({
        "$x": 0
      })
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("read-only")).equal(true);
      return;
    }
    assert.fail("Exception expected");
  });

  it("Read-only write #2", async () => {
    // --- Arrange
    const source = "$x.a[0].y = 3";
    const evalContext = createEvalContext({
      localContext: getComponentStateClone({
        "$x": {
          a: [
            {
              y: 0
            }
          ]
        }
      })
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("read-only")).equal(true);
      return;
    }
    assert.fail("Exception expected");
  });

  it("Read-only write #3", async () => {
    // --- Arrange
    const source = "$x++";
    const evalContext = createEvalContext({
      localContext: getComponentStateClone({
        "$x": 0
      })
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("read-only")).equal(true);
      return;
    }
    assert.fail("Exception expected");
  });

  it("Read-only write #4", async () => {
    // --- Arrange
    const source = "$x.a[0].y--";
    const evalContext = createEvalContext({
      localContext: getComponentStateClone({
        "$x": {
          a: [
            {
              y: 0
            }
          ]
        }
      })
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("read-only")).equal(true);
      return;
    }
    assert.fail("Exception expected");
  });

  it("Read-only detects change through reference #1", async () => {
    // --- Arrange
    const source = "let n = $x; n.a[0].y++;";
    const evalContext = createEvalContext({
      localContext: getComponentStateClone({
        "$x": {
          a: [
            {
              y: 0
            }
          ]
        }
      })
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("read-only")).equal(true);
      return;
    }
    assert.fail("Exception expected");
  });

  it("Read-only detects change through reference #2", async () => {
    // --- Arrange
    const source = "let n = $x; n.a[0].y += 3;";
    const evalContext = createEvalContext({
      localContext: getComponentStateClone({
        "$x": {
          a: [
            {
              y: 0
            }
          ]
        }
      }),
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("read-only")).equal(true);
      return;
    }
    assert.fail("Exception expected");
  });

  it("for..in loop with 'none' var binding - null", async () => {
    // --- Arrange
    const source = "let y; let res =''; for (y in obj) res += obj[y]; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: null
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("");
  });

  it("for..in loop with 'none' var binding - undefined", async () => {
    // --- Arrange
    const source = "let y; let res =''; for (y in obj) res += obj[y]; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: null
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("");
  });

  it("for..in loop with 'none' var binding", async () => {
    // --- Arrange
    const source = "let y; let res =''; for (y in obj) res += obj[y]; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: { one: "1", two: 2, three: 3 }
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("123");
  });

  it("for..in loop with 'none' var binding - break", async () => {
    // --- Arrange
    const source = `
      let y;
      let res =''; 
      for (y in obj) { 
        if (y === 'two') break; 
        res += obj[y];
      }
      return res;`;
    const evalContext = createEvalContext({
      localContext: {
        obj: { one: "1", two: 2, three: 3 }
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("1");
  });

  it("for..in loop with 'none' var binding - continue", async () => {
    // --- Arrange
    const source = `
      let y;
      let res =''; 
      for (y in obj) { 
        if (y === 'two') continue; 
        res += obj[y];
      }
      return res;`;
    const evalContext = createEvalContext({
      localContext: {
        obj: { one: "1", two: 2, three: 3 }
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("13");
  });

  it("for..in loop with 'let' var binding - null", async () => {
    // --- Arrange
    const source = "let res =''; for (let y in obj) res += obj[y]; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: null
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("");
  });

  it("for..in loop with 'let' var binding - undefined", async () => {
    // --- Arrange
    const source = "let res =''; for (let y in obj) res += obj[y]; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: null
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("");
  });

  it("for..in loop with 'let' var binding", async () => {
    // --- Arrange
    const source = "let res =''; for (let y in obj) res += obj[y]; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: { one: "1", two: 2, three: 3 }
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("123");
  });

  it("for..in loop with 'let' var binding - break", async () => {
    // --- Arrange
    const source = `
      let res =''; 
      for (let y in obj) { 
        if (y === 'two') break; 
        res += obj[y];
      }
      return res;`;
    const evalContext = createEvalContext({
      localContext: {
        obj: { one: "1", two: 2, three: 3 }
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("1");
  });

  it("for..in loop with 'let' var binding - continue", async () => {
    // --- Arrange
    const source = `
      let res =''; 
      for (let y in obj) { 
        if (y === 'two') continue; 
        res += obj[y];
      }
      return res;`;
    const evalContext = createEvalContext({
      localContext: {
        obj: { one: "1", two: 2, three: 3 }
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("13");
  });

  it("for..in loop with 'let' can write binding ", async () => {
    // --- Arrange
    const source = `
    let res =''; 
    for (let y in obj) {
      res += obj[y];
      y = 345;
    }
    return res`;
    const evalContext = createEvalContext({
      localContext: {
        obj: { one: "1", two: 2, three: 3 }
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("123");
  });

  it("for..in loop with 'const' var binding - null", async () => {
    // --- Arrange
    const source = "let res =''; for (const y in obj) res += obj[y]; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: null
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("");
  });

  it("for..in loop with 'const' var binding - undefined", async () => {
    // --- Arrange
    const source = "let res =''; for (const y in obj) res += obj[y]; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: null
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("");
  });

  it("for..in loop with 'const' var binding", async () => {
    // --- Arrange
    const source = "let res =''; for (const y in obj) res += obj[y]; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: { one: "1", two: 2, three: 3 }
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("123");
  });

  it("for..in loop with 'const' var binding - break", async () => {
    // --- Arrange
    const source = `
      let res =''; 
      for (const y in obj) { 
        if (y === 'two') break; 
        res += obj[y];
      }
      return res;`;
    const evalContext = createEvalContext({
      localContext: {
        obj: { one: "1", two: 2, three: 3 }
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("1");
  });

  it("for..in loop with 'const' var binding - continue", async () => {
    // --- Arrange
    const source = `
      let res =''; 
      for (const y in obj) { 
        if (y === 'two') continue; 
        res += obj[y];
      }
      return res;`;
    const evalContext = createEvalContext({
      localContext: {
        obj: { one: "1", two: 2, three: 3 }
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("13");
  });

  it("for..in loop with 'const' disallows write binding ", async () => {
    // --- Arrange
    const source = `
    let res =''; 
    for (const y in obj) {
      res += obj[y];
      y = 345;
    }
    return res`;
    const evalContext = createEvalContext({
      localContext: {
        obj: { one: "1", two: 2, three: 3 }
      }
    });
    const statements = parseStatements(source);

    // --- Act/Assert
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("const")).equal(true)
      return;
    }
    assert.fail("Exception expected");
  });

  it("for..of loop with not iterable #1", async () => {
    // --- Arrange
    const source = "for (y of obj) res += obj[y]; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: null
      }
    });
    const statements = parseStatements(source);

    // --- Act/Assert
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("Iterator expected"))
      return;
    }
    assert.fail("Exception expected")
  });

  it("for..of loop with not iterable #2", async () => {
    // --- Arrange
    const source = "for (y of obj) res += obj[y]; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: 123
      }
    });
    const statements = parseStatements(source);

    // --- Act/Assert
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("Iterator expected"))
      return;
    }
    assert.fail("Exception expected")
  });

  it("for..of loop with 'none' var binding", async () => {
    // --- Arrange
    const source = "let y; let res =''; for (y of obj) res += y; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: [1, 2, 3]
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("123");
  });

  it("for..of loop with 'none' var binding - break", async () => {
    // --- Arrange
    const source = `
      let y;
      let res =''; 
      for (y of obj) { 
        if (y === 2) break; 
        res += y;
      }
      return res;`;
    const evalContext = createEvalContext({
      localContext: {
        obj: [1, 2 ,3]
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("1");
  });

  it("for..of loop with 'none' var binding - continue", async () => {
    // --- Arrange
    const source = `
      let y;
      let res =''; 
      for (y of obj) { 
        if (y === 2) continue; 
        res += y;
      }
      return res;`;
    const evalContext = createEvalContext({
      localContext: {
        obj: [1, 2, 3]
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("13");
  });

  it("for..of loop with 'let' var binding", async () => {
    // --- Arrange
    const source = "let res =''; for (let y of obj) res += y; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: [1, 2, 3]
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("123");
  });

  it("for..of loop with 'let' var binding - break", async () => {
    // --- Arrange
    const source = `
      let res =''; 
      for (let y of obj) { 
        if (y === 2) break; 
        res += y;
      }
      return res;`;
    const evalContext = createEvalContext({
      localContext: {
        obj: [1, 2 ,3]
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("1");
  });

  it("for..of loop with 'let' var binding - continue", async () => {
    // --- Arrange
    const source = `
      let res =''; 
      for (let y of obj) { 
        if (y === 2) continue; 
        res += y;
      }
      return res;`;
    const evalContext = createEvalContext({
      localContext: {
        obj: [1, 2, 3]
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("13");
  });

  it("for..of loop with 'let' can write binding ", async () => {
    // --- Arrange
    const source = `
    let res =''; 
    for (let y of obj) {
      res += y;
      y = 345;
    }
    return res`;
    const evalContext = createEvalContext({
      localContext: {
        obj: [1, 2, 3]
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("123");
  });

  it("for..of loop with 'const' var binding", async () => {
    // --- Arrange
    const source = "let res =''; for (const y of obj) res += y; return res";
    const evalContext = createEvalContext({
      localContext: {
        obj: [1, 2, 3]
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("123");
  });

  it("for..of loop with 'const' var binding - break", async () => {
    // --- Arrange
    const source = `
      let res =''; 
      for (const y of obj) { 
        if (y === 2) break; 
        res += y;
      }
      return res;`;
    const evalContext = createEvalContext({
      localContext: {
        obj: [1, 2 ,3]
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("1");
  });

  it("for..of loop with 'const' var binding - continue", async () => {
    // --- Arrange
    const source = `
      let res =''; 
      for (const y of obj) { 
        if (y === 2) continue; 
        res += y;
      }
      return res;`;
    const evalContext = createEvalContext({
      localContext: {
        obj: [1, 2, 3]
      }
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("13");
  });

  it("for..of loop with 'const' disallows write binding ", async () => {
    // --- Arrange
    const source = `
    let res =''; 
    for (const y of obj) {
      res += y;
      y = 345;
    }
    return res`;
    const evalContext = createEvalContext({
      localContext: {
        obj: [1, 2, 3]
      }
    });
    const statements = parseStatements(source);

    // --- Act/Assert
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("const")).equal(true)
      return;
    }
    assert.fail("Exception expected");
  });

  it("template literal regression", async () => {
    // --- Arrange

    const source = `
    return \`f\${ obj.map(item => item) }\`;
    `;
    
    const evalContext = createEvalContext({
      localContext: {
        obj: [1, 2, 3]
      }
    });
    const statements = parseStatements(source);

    // --- Act/Assert
    await processStatementQueueAsync(statements, evalContext);
    const thread = evalContext.mainThread!;
    //expect(thread.blocks!.length).equal(1);
    expect(thread.returnValue).equal("f1,2,3");
  });
});

function getComponentStateClone(orig: any): any {
  const poj = structuredClone(orig);
  return buildProxy(poj, (changeInfo) => {
    const idRoot = changeInfo.pathArray?.[0];
    if (idRoot?.toString()?.startsWith("$")) {
      throw new Error("Cannot update a read-only variable");
    }
  });
}
