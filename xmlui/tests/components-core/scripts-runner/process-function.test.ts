import { describe, expect, it } from "vitest";

import { processStatementQueueAsync } from "@components-core/script-runner/process-statement-async";
import {createEvalContext, parseStatements} from "./test-helpers";
import { processStatementQueue } from "@components-core/script-runner/process-statement-sync";

describe("Process functions", () => {
  it("Function async #1", async () => {
    // --- Arrange
    const source = `
    let x = myFunction(1,2);
    function myFunction(...a) {
      return a[0] + a[1];
    }
    `;
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread;
    expect(thread!.blocks!.length).equal(1);
    expect(thread!.blocks![0].vars.x).equal(3);
  });

  it("Function async #2", async () => {
    // --- Arrange
    const source = `
    let x = myFunction(1, 2, 3);
    function myFunction(b, ...a) {
      return b + a[0] + a[1];
    }
    `;
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread;
    expect(thread!.blocks!.length).equal(1);
    expect(thread!.blocks![0].vars.x).equal(6);
  });

  it("Function sync #1", () => {
    // --- Arrange
    const source = `
    let x = myFunction(1,2);
    function myFunction(...a) {
      return a[0] + a[1];
    }
    `;
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    processStatementQueue(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread;
    expect(thread!.blocks!.length).equal(1);
    expect(thread!.blocks![0].vars.x).equal(3);
  });

  it("Function sync #2", () => {
    // --- Arrange
    const source = `
    let x = myFunction(1, 2, 3);
    function myFunction(b, ...a) {
      return b + a[0] + a[1];
    }
    `;
    const evalContext = createEvalContext({
      localContext: {}
    });
    const statements = parseStatements(source);

    // --- Act
    processStatementQueue(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread;
    expect(thread!.blocks!.length).equal(1);
    expect(thread!.blocks![0].vars.x).equal(6);
  });
});
