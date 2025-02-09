import { createEvalContext, parseStatements } from "./test-helpers";
import { describe, expect, it, assert } from "vitest";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner-exp/process-statement-async";

describe("Process switch statements", () => {
  it("no case", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            switch (x) {
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.x).equal(0);
  });

  it("no matching case #1", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 3:
                y++;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(0);
  });

  it("no matching case #2", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 2:
                y++;
                break;
              case 3:
                y++;
                break;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(0);
  });

  it("no matching case #3", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 1:
                y++;
              case 2:
                y++;
                break;
              case 3:
                y++;
                break;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(0);
  });

  it("matching case #1", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 0:
                y++;
                break;
              case 1:
                y++;
                break;
              case 2:
                y++;
                break;
              case 3:
                y++;
                break;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(1);
  });

  it("matching case #2", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              default:
                y++;
                break;  
              case 1:
                y++;
                break;
              case 2:
                y++;
                break;
              case 3:
                y++;
                break;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(1);
  });

  it("matching case #3", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 1:
                y++;
                break;
              default:
                y++;
                break;  
              case 2:
                y++;
                break;
              case 3:
                y++;
                break;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(1);
  });

  it("matching case #4", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 1:
                y++;
                break;
              case 2:
                y++;
                break;
              default:
                y++;
                break;  
              case 3:
                y++;
                break;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(1);
  });

  it("matching case #5", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 1:
                y++;
                break;
              case 2:
                y++;
                break;
              case 3:
                y++;
                break;
              default:
                y++;
                break;  
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(1);
  });

  it("matching case, fall-through #1", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 0:
                y++;
              case 1:
                y++;
                break;
              case 2:
                y++;
                break;
              case 3:
                y++;
                break;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(2);
  });

  it("matching case, fall-through #2", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 0:
                y++;
              case 1:
                y++;
              case 2:
                y++;
                break;
              case 3:
                y++;
                break;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(3);
  });

  it("matching case, fall-through #3", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 0:
                y++;
              case 1:
                y++;
              case 2:
                y++;
              case 3:
                y++;
                break;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(4);
  });

  it("matching case, fall-through #4", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 0:
                y++;
              case 1:
                y++;
              case 2:
                y++;
              case 3:
                y++;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(4);
  });

  it("switch in loop #1", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            while (x < 4) {
              switch (x) {
                case 0:
                  y++;
                case 1:
                  y++;
                case 2:
                  y++;
                case 3:
                  y++;
              }
              x++;
            }  
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(10);
  });

  it("switch in loop #2", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            while (x < 4) {
              switch (x) {
                case 0:
                  y++;
                case 1:
                  y++;
                case 2:
                  y++;
                case 3:
                  y++;
              }
              x++;
              break;
            }  
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(4);
  });

  it("switch in loop #3", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            while (x < 4) {
              switch (x) {
                case 0:
                  y++;
                  break;
                case 1:
                  y++;
                  break;
                case 2:
                  y++;
                  break;
                case 3:
                  y++;
                  break;
              }
              x++;
            }  
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(4);
  });

  it("switch in loop #4", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            while (x < 4) {
              switch (x) {
                case 0:
                  y++;
                  break;
                case 1:
                  y++;
                  break;
                case 2:
                  y++;
                case 3:
                  y++;
              }
              x++;
            }  
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(5);
  });

  it("switch in loop #5 (continue)", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            while (x < 4) {
              switch (x) {
                case 0:
                  y++;
                  break;
                case 1:
                  y++;
                  break;
                case 2:
                  y++;
                  x += 3;
                  continue;
                case 3:
                  y++;
              }
              x++;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].vars.y).equal(3);
  });

  it("switch in loop #6 (return)", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            while (x < 4) {
              switch (x) {
                case 0:
                  y++;
                  break;
                case 1:
                  y++;
                  break;
                case 2:
                  y++;
                  x += 3;
                  return;
                case 3:
                  y++;
              }
              x++;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks![0].vars.y).equal(3);
  });

  it("switch has its own scope", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            let z = 0;
            switch (x) {
              case 0:
                let y = 3;
                z = y + 1;
                break;
              case 1:
                y++;
                break;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks![0].vars.y).equal(0);
    expect(thread.blocks![0].vars.z).equal(4);
  });

  it("switch fails with multiple let", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 0:
                let z = 3;
              case 1:
                let z = 4;
                y++;
                break;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act/Assert
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("already declared")).equal(true);
      return;
    }
    assert.fail("Exception expected");
  });

  it("switch fails with multiple const/let", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 0:
                let z = 3;
              case 1:
                const z = 4;
                y++;
                break;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act/Assert
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("already declared")).equal(true);
      return;
    }
    assert.fail("Exception expected");
  });

  it("switch fails with multiple const", async () => {
    // --- Arrange
    const source = `
            let x = 0;
            let y = 0;
            switch (x) {
              case 0:
                const z = 3;
              case 1:
                const z = 4;
                y++;
                break;
            }
        `;
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act/Assert
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("already declared")).equal(true);
      return;
    }
    assert.fail("Exception expected");
  });
});
