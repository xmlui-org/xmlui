import { describe, expect, it, assert } from "vitest";

import { processStatementQueueAsync } from "@components-core/script-runner/process-statement-async";
import { processStatementQueue } from "@components-core/script-runner/process-statement-sync";
import { createEvalContext, parseExpression, parseStatements } from "./test-helpers";

describe("Process statements regression", () => {
  it("while with break #2", async () => {
    // --- Arrange
    const source = "let x = 0; while (true) {x++ ; if (x > 3) break;}; x++";
    const evalContext = createEvalContext({
      localContext: {},
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread;
    expect(thread!.blocks!.length).equal(1);
    expect(thread!.blocks![0].vars.x).equal(5);

    expect(diag.processedStatements).equal(22);
    expect(diag.maxLoops).equal(1);
    expect(diag.maxBlocks).equal(2);
    expect(diag.maxQueueLength).equal(5);
    expect(diag.clearToLabels).equal(1);
    expect(diag.unshiftedItems).equal(21);
  });

  it("regression #2", async () => {
    // --- Arrange
    const source = "((maybeUndefined)=> maybeUndefined)()";
    const evalContext = createEvalContext({
      localContext: {},
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);

    expect(diag.processedStatements).equal(1);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(1);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("recursive arrow regression #1", async () => {
    // --- Arrange
    const source =
      "const fact = n => { if (n === 0) return 1; else return n * fact(n-1); }; x = fact(3)";
    const evalContext = createEvalContext({
      localContext: {},
    });
    evalContext.mainThread!.blocks = [
      {
        vars: {
          x: 0,
        },
      },
    ];
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext, evalContext.mainThread);

    // --- Assert
    const thread = evalContext.mainThread;
    expect(thread!.blocks!.length).equal(1);
    expect(thread!.blocks![0].vars.x).equal(6);

    expect(diag.processedStatements).equal(2);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("mapped arrow regression #1", async () => {
    // --- Arrange
    const source = "const mapped = [1,2,3].map(id => {return {id: id} }); console.log(mapped)";
    const evalContext = createEvalContext({
      localContext: {},
    });
    const statements = parseStatements(source);

    // --- Act
    const diag = await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread;
    expect(thread!.blocks!.length).equal(1);
    expect(thread!.blocks![0].vars.mapped.length).equal(3);

    expect(diag.processedStatements).equal(2);
    expect(diag.maxLoops).equal(0);
    expect(diag.maxBlocks).equal(1);
    expect(diag.maxQueueLength).equal(2);
    expect(diag.clearToLabels).equal(0);
    expect(diag.unshiftedItems).equal(0);
  });

  it("arrow with vars sub-property regression #1", async () => {
    // --- Arrange
    const source = "let arrow = (val) => val.value++; arrow(x)";
    const evalContext = createEvalContext({
      localContext: {},
    });
    evalContext.mainThread!.blocks = [
      {
        vars: {
          x: { value: 0 },
        },
      },
    ];
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread;
    expect(thread!.blocks!.length).equal(1);
    expect(thread!.blocks![0].vars.x.value).equal(1);
  });

  it("arrow with vars sub-property regression #2", async () => {
    // --- Arrange
    const source = "let arrow = (val) => val.some++; arrow(x.value)";
    const evalContext = createEvalContext({
      localContext: {},
    });
    evalContext.mainThread!.blocks = [
      {
        vars: {
          x: {
            value: { some: 0 },
          },
        },
      },
    ];
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread;
    expect(thread!.blocks!.length).equal(1);
    expect(thread!.blocks![0].vars.x.value.some).equal(1);
  });

  it("arrow with vars sub-property regression (sync) #1", () => {
    // --- Arrange
    const source = "let arrow = (val) => val.value++; arrow(x)";
    const evalContext = createEvalContext({
      localContext: {},
    });
    evalContext.mainThread!.blocks = [
      {
        vars: {
          x: { value: 0 },
        },
      },
    ];
    const statements = parseStatements(source);

    // --- Act
    processStatementQueue(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread;
    expect(thread!.blocks!.length).equal(1);
    expect(thread!.blocks![0].vars.x.value).equal(1);
  });

  it("arrow with vars sub-property regression (sync) #2", () => {
    // --- Arrange
    const source = "let arrow = (val) => val.some++; arrow(x.value)";
    const evalContext = createEvalContext({
      localContext: {},
    });
    evalContext.mainThread!.blocks = [
      {
        vars: {
          x: {
            value: { some: 0 },
          },
        },
      },
    ];
    const statements = parseStatements(source);

    // --- Act
    processStatementQueue(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread;
    expect(thread!.blocks!.length).equal(1);
    expect(thread!.blocks![0].vars.x.value.some).equal(1);
  });

  it("Arrow argument reference indirection", async () => {
    // --- Arrange
    const source = "incrementFunc(counter.value)";
    const evalContext = createEvalContext({
      localContext: {},
    });
    evalContext.mainThread!.blocks = [
      {
        vars: {
          counter: {
            value: { some: 0 },
          },
          incrementFunc: { ...parseExpression("x => x.some++"), _ARROW_EXPR_: true },
        },
      },
    ];
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    const thread = evalContext.mainThread;
    expect(thread!.blocks!.length).equal(1);
    expect(thread!.blocks![0].vars.counter.value.some).equal(1);
  });

  it("delete #1", async () => {
    // --- Arrange
    const source = "x = delete alma";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        alma: {},
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(true);
    expect(evalContext.localContext.alma).equal(undefined);
  });

  it("delete #2", async () => {
    // --- Arrange
    const source = "x = delete alma.b";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        alma: { a: "hello", b: "hi" },
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(true);
    expect(evalContext.localContext.alma.b).equal(undefined);
    expect(evalContext.localContext.alma.a).equal("hello");
  });

  it("delete #3", async () => {
    // --- Arrange
    const source = "x = delete alma[1]";
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
        alma: [1, 2, 3],
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal(true);
    expect(evalContext.localContext.alma.length).equal(3);
    expect(evalContext.localContext.alma[0]).equal(1);
    expect(evalContext.localContext.alma[1]).equal(undefined);
    expect(evalContext.localContext.alma[2]).equal(3);
  });

  it("delete #4", async () => {
    // --- Arrange
    const source = "x = delete Math.PI";
    const evalContext = createEvalContext({
      localContext: {
        x: 123,
      },
    });
    const statements = parseStatements(source);

    // --- Act/Assert
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err) {
      expect(err instanceof TypeError).equal(true);
      return;
    }
    assert.fail("Exception expected");
  });

  it("disallow running banned function #1", async () => {
    // --- Arrange
    const source = "const x = setTimeout(() => {}, 300)";
    const evalContext = createEvalContext({});
    const statements = parseStatements(source);

    // --- Act/Assert
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.toString().includes("not allowed to call")).equal(true);
      return;
    }
    assert.fail("Exception expected");
  });

  it("Arrow function arg regression (async) #1", async () => {
    // --- Arrange
    const source = "val = [0,1,2,3].filter(k => k === 2 || k === 3);";
    const evalContext = createEvalContext({
      localContext: {
        val: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.val).deep.equal([2, 3]);
  });

  it("Arrow function arg regression (sync) #1", () => {
    // --- Arrange
    const source = "val = [0,1,2,3].filter(k => k === 2 || k === 3);";
    const evalContext = createEvalContext({
      localContext: {
        val: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    processStatementQueue(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.val).deep.equal([2, 3]);
  });

  it("Closure regression #1", async () => {
    // --- Arrange
    const source = `
    const func = ()=> {
      const dummy = 'dummy';
      
      return {
        fireListMessages: () => {
           x = dummy;
        }
      };
    }
    func().fireListMessages();
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal("dummy");
  });

  it("Closure regression #2", async () => {
    // --- Arrange
    const source = `
    const func = ()=> {
      const fireListMessages = () => {
        x = dummy;
      }
      
      const dummy = 'dummy';
      
      return {
        fireListMessages
      };
    }
    func().fireListMessages();
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal("dummy");
  });

  it("Closure regression #3", async () => {
    // --- Arrange
    const source = `
    const func = ()=> {
      const fireListMessages = () => {
        const otherDummy = "hey!"
        return {
          nested: () => {
            x = otherDummy;  
          } 
        }
      }
      
      const dummy = 'dummy';
      
      return {
        fireListMessages
      };
    }
    func().fireListMessages().nested();
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal("hey!");
  });

  it("Closure regression (sync) #1", () => {
    // --- Arrange
    const source = `
    const func = ()=> {
      const dummy = 'dummy';
      
      return {
        fireListMessages: () => {
           x = dummy;
        }
      };
    }
    func().fireListMessages();
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    processStatementQueue(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal("dummy");
  });

  it("Closure regression (sync) #2", () => {
    // --- Arrange
    const source = `
    const func = ()=> {
      const fireListMessages = () => {
        x = dummy;
      }
      
      const dummy = 'dummy';
      
      return {
        fireListMessages
      };
    }
    func().fireListMessages();
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    processStatementQueue(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal("dummy");
  });

  it("Closure regression (sync) #3", () => {
    // --- Arrange
    const source = `
    const func = ()=> {
      const fireListMessages = () => {
        const otherDummy = "hey!"
        return {
          nested: () => {
            x = otherDummy;  
          } 
        }
      }
      
      const dummy = 'dummy';
      
      return {
        fireListMessages
      };
    }
    func().fireListMessages().nested();
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    processStatementQueue(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).equal("hey!");
  });

  it("Predicate regression #1", async () => {
    // --- Arrange
    const source = `
    const data = [1, 2, 3, 4, 5];
    const predicate = v => v % 2 === 0;
    x = data.filter(predicate);
        `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(
      statements,
      evalContext,
      evalContext.mainThread,
      async () => {},
    );

    // --- Assert
    expect(evalContext.localContext.x).toStrictEqual([2, 4]);
  });

  it("Predicate regression #1 (sync)", () => {
    // --- Arrange
    const source = `
    const data = [1, 2, 3, 4, 5];
    const predicate = v => v % 2 === 0;
    x = data.filter(predicate);
        `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    processStatementQueue(statements, evalContext);

    // --- Assert
    expect(evalContext.localContext.x).toStrictEqual([2, 4]);
  });

  it("var is not allowed in function body (sync)", () => {
    // --- Arrange
    const source = `
    function test() {
      var x = 0;
    }

    var c = 3;
    let a = test();
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      processStatementQueue(statements, evalContext);
    } catch (err) {
      expect(err.toString()).toContain("'var'");
      return;
    }
    assert.fail("Exception expected");
  });

  it("var is not allowed in function body (async)", async () => {
    // --- Arrange
    const source = `
    function test() {
      var x = 0;
    }

    var c = 3;
    let a = test();
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err) {
      expect(err.toString()).toContain("'var'");
      return;
    }
    assert.fail("Exception expected");
  });

});
