import { describe, expect, it, assert } from "vitest";

import {
  ArrowExpressionStatement,
  T_ARROW_EXPRESSION,
  T_ARROW_EXPRESSION_STATEMENT,
  T_EXPRESSION_STATEMENT,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { createEvalContext, parseStatements } from "./test-helpers";

describe("Process statements", () => {
  it("Event with arrow function", async () => {
    // --- Arrange
    const source = "(x, y) => 2 * x + y";
    const evalContext = createEvalContext({
      localContext: {},
      eventArgs: [123, 1],
    });
    const statements = parseStatements(source);
    if (
      statements?.length !== 1 ||
      statements[0].type !== T_EXPRESSION_STATEMENT ||
      statements[0].expr.type !== T_ARROW_EXPRESSION
    ) {
      assert.fail("Arrow expression expected");
    }

    // --- Act
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: statements[0].expr,
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
      eventArgs: [123, 1],
    });
    const statements = parseStatements(source);
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks![0].returnValue).equal(undefined);
  });
});
