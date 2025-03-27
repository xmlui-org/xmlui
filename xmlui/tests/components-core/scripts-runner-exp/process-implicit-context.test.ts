import { describe, expect, it } from "vitest";

import { processStatementQueue } from "../../../src/components-core/script-runner-exp/process-statement-sync";
import { createEvalContext, parseStatements } from "./test-helpers";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner-exp/process-statement-async";

describe("Process implicit context (exp)", () => {
  it("Implicit context #1", async () => {
    // --- Arrange
    const source = "x = Impl.myCalc(23);";

    const Impl: any = {
      _SUPPORT_IMPLICIT_CONTEXT: true,
      _GET_CONTEXT: () => 100,
      myCalc: (context: any, arg: any) => context + arg
    };

    const evalContext = createEvalContext({
      localContext: {
        x: 1
      },
      appContext: {
        Impl
      },
      implicitContextGetter: (obj: any) => obj._GET_CONTEXT()
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(123);

    expect(diag.processedStatements).equal(1);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("Implicit context (sync) # ", () => {
    // --- Arrange
    const source = "x = Impl.myCalc(23);";

    const Impl: any = {
      _SUPPORT_IMPLICIT_CONTEXT: true,
      _GET_CONTEXT: () => 100,
      myCalc: (context: any, arg: any) => context + arg
    };

    const evalContext = createEvalContext({
      localContext: {
        x: 1
      },
      appContext: {
        Impl
      },
      implicitContextGetter: (obj: any) => obj._GET_CONTEXT()
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = processStatementQueue(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(123);

    expect(diag.processedStatements).equal(1);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });
});
