import { describe, expect, it, assert } from "vitest";

import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { createEvalContext, parseStatements } from "./test-helpers";

describe("Process try statements (exp)", () => {
  it("throw", async () => {
    // --- Arrange
    const source = `
      throw { type: 'Error' }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.errorObject.type).equal("Error");
      return;
    }
    assert.fail("Exception expected");
  });

  it("throw a given Error object", async () => {
    // --- Arrange
    const source = `
      throw errObj
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
        errObj: new Error("Hello, Error!"),
      },
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      expect(err.message.toString()).equal("Hello, Error!");
      return;
    }
    assert.fail("Exception expected");
  });

  it("try - catch, normal", async () => {
    // --- Arrange
    const source = `
      try { 
        x = 2 
      } catch {
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(2);
  });

  it("try - finally, normal", async () => {
    // --- Arrange
    const source = `
      try { 
        x = 2 
      } finally { 
        x = 3
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(3);
  });

  it("try - catch nested, normal", async () => {
    // --- Arrange
    const source = `
      try { 
        try { 
          x = 2 
        } finally { 
          x = 3 
        }
      } catch {
    }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(3);
  });

  it("try - finally nested, normal", async () => {
    // --- Arrange
    const source = `
      try { 
        try { 
          x = 2 
        } finally { 
          x = 3 
        }
      } finally {
        x = 4
    }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(4);
  });

  it("try - finally with break", async () => {
    // --- Arrange
    const source = `
      while (true) { 
        try { 
          break; 
          x = -4; 
        } finally {
          x = 3
        }
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(3);
  });

  it("try - finally nested with break", async () => {
    // --- Arrange
    const source = `
      while (true) { 
        try { 
          try { 
            break; 
            x = -4;
          } finally { 
            x = 3
          }
        } finally { 
          x = 4
        } 
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(4);
  });

  it("try - finally with continue", async () => {
    // --- Arrange
    const source = `
      while (x < 3) { 
        try { 
          z++; 
          if (x === 1) continue; 
          z++;
        } finally { 
          x++ 
        }
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        z: 0,
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.z).equal(5);
  });

  it("try - finally nested with continue", async () => {
    // --- Arrange
    const source = `
      while (x < 3) { 
        try { 
          try { 
            z++; 
            if (x === 1) continue; 
            z++;
          } finally { 
            x++
          }
        } finally {
          z += 100
        }
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        z: 0,
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.localContext.z).equal(305);
  });

  it("try - finally with return", async () => {
    // --- Arrange
    const source = `
      try { 
        return 123;
      } finally {
        x = 1
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);
    expect(evalContext.mainThread!.returnValue).equal(123);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(1);
  });

  it("try - finally nested with return", async () => {
    // --- Arrange
    const source = `
      try { 
        try { 
          return 123; 
        } finally { 
          x++
        }
      } finally { 
        x++
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);
    expect(evalContext.mainThread!.returnValue).equal(123);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(2);
  });

  it("try - finally, error", async () => {
    // --- Arrange
    const source = `
      try {
        x = 2; 
        throw { type: 'Error' }
      } finally { 
        x++
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      // --- Assert
      expect(evalContext.mainThread!.blocks!.length).equal(1);
      expect(evalContext.localContext.x).equal(3);
      expect(err.errorObject.type).equal("Error");
      return;
    }
    assert.fail("Exception expected");
  });

  it("try - finally nested, error", async () => {
    // --- Arrange
    const source = `
      try {
        try {
          x = 2;
          throw { type: 'Error' }
        } finally { 
          x++
        }
      } finally { 
        x++
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      // --- Assert
      expect(evalContext.mainThread!.blocks!.length).equal(1);
      expect(evalContext.localContext.x).equal(4);
      expect(err.errorObject.type).equal("Error");
      return;
    }
    assert.fail("Exception expected");
  });

  it("try - catch, error", async () => {
    // --- Arrange
    const source = `
      try {
        x = 2;
        throw { type: 'Error' }
      } catch {
        x++
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(3);
  });

  it("try - catch - finally, error", async () => {
    // --- Arrange
    const source = `
      try {
        x = 2;
        throw { type: 'Error' }
      } catch {
        x++
      } finally {
        x++
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(4);
    return;
  });

  it("try - catch, error rethrown", async () => {
    // --- Arrange
    const source = `
      try {
        x = 2;
        throw { type: 'Error' }
      } catch (err) {
        x++;
        throw err
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      // --- Assert
      expect(evalContext.mainThread!.blocks!.length).equal(1);
      expect(evalContext.localContext.x).equal(3);
      expect(err.errorObject.type).equal("Error");
      return;
    }
    assert.fail("Exception expected");
  });

  it("try - catch, error rethrown, finally", async () => {
    // --- Arrange
    const source = `
      try {
        x = 2; 
        throw { type: 'Error' }
      } catch (err) {
        x++; 
        throw err
      } finally {
        x++
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      // --- Assert
      expect(evalContext.mainThread!.blocks!.length).equal(1);
      expect(evalContext.localContext.x).equal(4);
      expect(err.errorObject.type).equal("Error");
      return;
    }
    assert.fail("Exception expected");
  });

  it("try - catch, error rethrown other", async () => {
    // --- Arrange
    const source = `
      try {
        x = 2;
        throw { type: 'Error' }
      } catch (err) {
        x++;
        throw { type: "Other" }
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      // --- Assert
      expect(evalContext.mainThread!.blocks!.length).equal(1);
      expect(evalContext.localContext.x).equal(3);
      expect(err.errorObject.type).equal("Other");
      return;
    }
    assert.fail("Exception expected");
  });

  it("try - catch, error rethrown other, finally", async () => {
    // --- Arrange
    const source = `
      try {
        x = 2; 
        throw { type: 'Error' }
      } catch (err) {
        x++; 
        throw { type: "Other" }
      } finally {
        x++
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      // --- Assert
      expect(evalContext.mainThread!.blocks!.length).equal(1);
      expect(evalContext.localContext.x).equal(4);
      expect(err.errorObject.type).equal("Other");
      return;
    }
    assert.fail("Exception expected");
  });

  it("try - catch - finally, error in finally", async () => {
    // --- Arrange
    const source = `
      try {
        x = 2;
        throw { type: 'Error' }
      } catch {
        x++
      } finally {
        x++;
        throw { type: "finallyError" }
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 1,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    try {
      await processStatementQueueAsync(statements, evalContext);
    } catch (err: any) {
      // --- Assert
      expect(evalContext.mainThread!.blocks!.length).equal(1);
      expect(evalContext.localContext.x).equal(4);
      expect(err.errorObject.type).equal("finallyError");
      return;
    }
    assert.fail("Exception expected");
  });

  it("try - catch with return", async () => {
    // --- Arrange
    const source = `
      try { 
        throw { type: "Error" }
      } catch {
        x = 1;
        return 123;
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);
    expect(evalContext.mainThread!.returnValue).equal(123);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(1);
  });

  it("try - finally with return", async () => {
    // --- Arrange
    const source = `
      try { 
        throw { type: "Error" }
      } finally {
        x = 1;
        return 123;
      }
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
    } catch (err: any) {
      // --- Assert
      console.log(err);
      expect(evalContext.mainThread!.returnValue).equal(123);
      expect(evalContext.mainThread!.blocks!.length).equal(1);
      expect(evalContext.localContext.x).equal(1);
      expect(err.errorObject.type).equal("Error");
      return;
    }
    assert.fail("Exception expected");
  });

  it("try - finally with second return", async () => {
    // --- Arrange
    const source = `
      try { 
        return 234
      } finally {
        x = 1;
        return 123;
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);
    expect(evalContext.mainThread!.returnValue).equal(123);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(1);
  });

  it("try - catch, finally with second return", async () => {
    // --- Arrange
    const source = `
      try { 
        throw { type: "Error" }
      } catch {
        return 234;
      } finally {
        x = 1;
        return 123;
      }
    `;
    const evalContext = createEvalContext({
      localContext: {
        x: 0,
      },
    });
    const statements = parseStatements(source);

    // --- Act
    await processStatementQueueAsync(statements, evalContext);
    expect(evalContext.mainThread!.returnValue).equal(123);

    // --- Assert
    expect(evalContext.mainThread!.blocks!.length).equal(1);
    expect(evalContext.localContext.x).equal(1);
  });

  it("try - catch with nested try-return (issue #2779)", async () => {
    // --- Arrange
    const source = `
      try {
        x = 1;
        throw { type: 'Error' }
      } catch (err) {
        x = 2;
        try {
          x = 3;
          return 123;
        } catch (retryErr) {
          x = 4;
        }
        x = 5; // This should NOT run if return worked
      }
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
    expect(evalContext.mainThread!.returnValue).equal(123);
    expect(evalContext.localContext.x).equal(3);
    expect(evalContext.mainThread!.blocks!.length).equal(1);
  });

  it("try - catch with nested try-return and finally (issue #2779)", async () => {
    // --- Arrange
    const source = `
      try {
        x = 1;
        throw { type: 'Error' }
      } catch (err) {
        x = 2;
        try {
          x = 3;
          return 123;
        } catch (retryErr) {
          x = 4;
        } finally {
          x = 10;
        }
        x = 5; // This should NOT run if return worked
      }
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
    expect(evalContext.mainThread!.returnValue).equal(123);
    expect(evalContext.localContext.x).equal(10);
    expect(evalContext.mainThread!.blocks!.length).equal(1);
  });

  it("try - catch with deeply nested try-return (issue #2779)", async () => {
    // --- Arrange
    const source = `
      try {
        x = 1;
        throw { type: 'Error' }
      } catch (err) {
        x = 2;
        try {
          x = 3;
          try {
            x = 4;
            return 456;
          } finally {
            x = 5;
          }
          x = 6; // Should NOT run
        } catch (retryErr) {
          x = 7;
        }
        x = 8; // This should NOT run if return worked
      }
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
    expect(evalContext.mainThread!.returnValue).equal(456);
    expect(evalContext.localContext.x).equal(5);
    expect(evalContext.mainThread!.blocks!.length).equal(1);
  });
});
