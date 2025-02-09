import { describe, expect, it, assert } from "vitest";

import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { createEvalContext, parseStatements } from "./test-helpers";
import { ArrowExpressionStatement } from "../../../src/abstractions/scripting/ScriptingSourceTree";

describe("Process statements", () => {
  it("Event with arrow function", async () => {
    // --- Arrange
    const source = "(x, y) => 2 * x + y";
    const evalContext = createEvalContext({
      localContext: {},
      eventArgs: [123, 1]
    });
    const statements = parseStatements(source);
    if (
      statements?.length !== 1 ||
      statements[0].type !== "ExprS" ||
      statements[0].expression.type !== "ArrowE"
    ) {
      assert.fail("Arrow expression expected");
    }

    // --- Act
    const arrowStmt = {
      type: "ArrowS",
      expression: statements[0].expression
    } as ArrowExpressionStatement;
    const diag = await processStatementQueueAsync([arrowStmt], evalContext);

    // --- Assert
    const thread = evalContext.mainThread;
    expect(thread!.blocks!.length).equal(1);
    expect(thread!.blocks![0].returnValue).equal(247);

    expect(diag.processedStatements).equal(1);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("Event issue", async () => {
    // --- Arrange
    const source = "(() => {let z = 0; while(z < 3) {console.log(z); z++}})()";
    const evalContext = createEvalContext({
      localContext: {},
      eventArgs: [123, 1]
    });
    const statements = parseStatements(source);
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks![0].returnValue).equal(undefined);
  });
});
