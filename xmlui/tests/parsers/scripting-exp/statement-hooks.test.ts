import { describe, expect, it } from "vitest";

import { processStatementQueueAsync } from "../../../src/components-core/script-runner-exp/process-statement-async";
import { processStatementQueue } from "../../../src/components-core/script-runner-exp/process-statement-sync";
import { createEvalContext, parseStatements } from "./test-helpers";

describe("Statement hooks", () => {
  const stmtCases = [
    { src: "let x = 0;", exp: 1 },
    { src: "let x = 0; x++;", exp: 2 },
    { src: "let x = 0; while (x < 1) { x++ };", exp: 6 },
  ];

  stmtCases.forEach((c) => {
    it(`onStatementStarted (async) works ${c.src}`, async () => {
      // --- Arrange
      let counter = 0;
      const evalContext = createEvalContext({
        localContext: {},
        onStatementStarted: () => {
          counter++;
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      await processStatementQueueAsync(statements, evalContext);

      // --- Assert
      expect(counter).equal(c.exp);
    });
  });

  stmtCases.forEach((c) => {
    it(`onStatementStarted (sync) works ${c.src}`, () => {
      // --- Arrange
      let counter = 0;
      const evalContext = createEvalContext({
        localContext: {},
        onStatementStarted: () => {
          counter++;
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      processStatementQueue(statements, evalContext);

      // --- Assert
      expect(counter).equal(c.exp);
    });
  });

  stmtCases.forEach((c) => {
    it(`onStatementCompleted (async) works ${c.src}`, async () => {
      // --- Arrange
      let counter = 0;
      const evalContext = createEvalContext({
        localContext: {},
        onStatementCompleted: () => {
          counter++;
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      await processStatementQueueAsync(statements, evalContext);

      // --- Assert
      expect(counter).equal(c.exp);
    });
  });

  stmtCases.forEach((c) => {
    it(`onStatementCompleted (sync) works ${c.src}`, () => {
      // --- Arrange
      let counter = 0;
      const evalContext = createEvalContext({
        localContext: {},
        onStatementCompleted: () => {
          counter++;
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      processStatementQueue(statements, evalContext);

      // --- Assert
      expect(counter).equal(c.exp);
    });
  });

  stmtCases.forEach((c) => {
    it(`onStatementStarted&Completed (async) works ${c.src}`, async () => {
      // --- Arrange
      let counter = 0;
      const evalContext = createEvalContext({
        localContext: {},
        onStatementStarted: () => {
          counter++;
        },
        onStatementCompleted: () => {
          counter++;
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      await processStatementQueueAsync(statements, evalContext);

      // --- Assert
      expect(counter).equal(c.exp + c.exp);
    });
  });

  stmtCases.forEach((c) => {
    it(`onStatementStarted&Completed (sync) works ${c.src}`, () => {
      // --- Arrange
      let counter = 0;
      const evalContext = createEvalContext({
        localContext: {},
        onStatementStarted: () => {
          counter++;
        },
        onStatementCompleted: () => {
          counter++;
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      processStatementQueue(statements, evalContext);

      // --- Assert
      expect(counter).equal(c.exp + c.exp);
    });
  });

  const updateAsgnCases = [
    { src: "let x = 0; x = 3", exp: [] },
    { src: "x = 0;", exp: ["x"] },
    { src: "x.a = 0;", exp: ["x"] },
    { src: "x.a = []; x.a[3] = 12", exp: ["x", "x"] },
    { src: "x.a = []; x.a[3] = {}; x.a[3].f = 24", exp: ["x", "x", "x"] },
    { src: "x = 0; y = 0;", exp: ["x", "y"] },
  ];

  updateAsgnCases.forEach((c) => {
    it(`onWillUpdate (async) works ${c.src}`, async () => {
      // --- Arrange
      let updated: string[] = [];
      const evalContext = createEvalContext({
        localContext: {
          x: {},
          y: {},
        },
        onWillUpdate: (_scope, index, type) => {
          if (type === "assignment") {
            updated.push(index as string);
          }
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      await processStatementQueueAsync(statements, evalContext);

      // --- Assert
      expect(updated).toStrictEqual(c.exp);
    });
  });

  updateAsgnCases.forEach((c) => {
    it(`onWillUpdate (sync) works ${c.src}`, () => {
      // --- Arrange
      let updated: string[] = [];
      const evalContext = createEvalContext({
        localContext: {
          x: {},
          y: {},
        },
        onWillUpdate: (_scope, index, type) => {
          if (type === "assignment") {
            updated.push(index as string);
          }
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      processStatementQueue(statements, evalContext);

      // --- Assert
      expect(updated).toStrictEqual(c.exp);
    });
  });

  updateAsgnCases.forEach((c) => {
    it(`onDidUpdate (async) works ${c.src}`, async () => {
      // --- Arrange
      let updated: string[] = [];
      const evalContext = createEvalContext({
        localContext: {
          x: {},
          y: {},
        },
        onDidUpdate: (_scope, index, type) => {
          if (type === "assignment") {
            updated.push(index as string);
          }
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      await processStatementQueueAsync(statements, evalContext);

      // --- Assert
      expect(updated).toStrictEqual(c.exp);
    });
  });

  updateAsgnCases.forEach((c) => {
    it(`onDidUpdate (sync) works ${c.src}`, () => {
      // --- Arrange
      let updated: string[] = [];
      const evalContext = createEvalContext({
        localContext: {
          x: {},
          y: {},
        },
        onDidUpdate: (_scope, index, type) => {
          if (type === "assignment") {
            updated.push(index as string);
          }
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      processStatementQueue(statements, evalContext);

      // --- Assert
      expect(updated).toStrictEqual(c.exp);
    });
  });

  const prePostCases = [
    { src: "let x = 0; x++", exp: [] },
    { src: "x = 0; x++", exp: ["x"] },
    { src: "x.a = 0; ++x.a", exp: ["x"] },
    { src: "x.a = []; x.a[3] = 12; --x.a[3]", exp: ["x"] },
    { src: "x.a = []; x.a[3] = {}; x.a[3].f = 24; x.a[3].f--", exp: ["x"] },
    { src: "x = 0; x++; y = 0; --y;", exp: ["x", "y"] },
  ];

  prePostCases.forEach((c) => {
    it(`onWillUpdate (async) works ${c.src}`, async () => {
      // --- Arrange
      let updated: string[] = [];
      const evalContext = createEvalContext({
        localContext: {
          x: {},
          y: {},
        },
        onWillUpdate: (_scope, index, type) => {
          if (type === "pre-post") {
            updated.push(index as string);
          }
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      await processStatementQueueAsync(statements, evalContext);

      // --- Assert
      expect(updated).toStrictEqual(c.exp);
    });
  });

  prePostCases.forEach((c) => {
    it(`onWillUpdate (sync) works ${c.src}`, () => {
      // --- Arrange
      let updated: string[] = [];
      const evalContext = createEvalContext({
        localContext: {
          x: {},
          y: {},
        },
        onWillUpdate: (_scope, index, type) => {
          if (type === "pre-post") {
            updated.push(index as string);
          }
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      processStatementQueue(statements, evalContext);

      // --- Assert
      expect(updated).toStrictEqual(c.exp);
    });
  });

  prePostCases.forEach((c) => {
    it(`onDidUpdate (async) works ${c.src}`, async () => {
      // --- Arrange
      let updated: string[] = [];
      const evalContext = createEvalContext({
        localContext: {
          x: {},
          y: {},
        },
        onDidUpdate: (_scope, index, type) => {
          if (type === "pre-post") {
            updated.push(index as string);
          }
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      await processStatementQueueAsync(statements, evalContext);

      // --- Assert
      expect(updated).toStrictEqual(c.exp);
    });
  });

  prePostCases.forEach((c) => {
    it(`onDidUpdate (sync) works ${c.src}`, () => {
      // --- Arrange
      let updated: string[] = [];
      const evalContext = createEvalContext({
        localContext: {
          x: {},
          y: {},
        },
        onDidUpdate: (_scope, index, type) => {
          if (type === "pre-post") {
            updated.push(index as string);
          }
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      processStatementQueue(statements, evalContext);

      // --- Assert
      expect(updated).toStrictEqual(c.exp);
    });
  });

  const funcCallCases = [
    { src: "let x = () => {}; x()", exp: [] },
    { src: "x = () => {}; x()", exp: ["x"] },
    { src: "x.a = () => {}; x.a()", exp: ["x"] },
    { src: "x.a = []; x.a[3] = () => {}; x.a[3]()", exp: ["x"] },
    { src: "x.a = []; x.a[3] = {}; x.a[3].f = () => {}; x.a[3].f()", exp: ["x"] },
    { src: "x = () => {}; x(); y = () => {}; y();", exp: ["x", "y"] },
  ];

  funcCallCases.forEach((c) => {
    it(`onWillUpdate (async) works ${c.src}`, async () => {
      // --- Arrange
      let updated: string[] = [];
      const evalContext = createEvalContext({
        localContext: {
          x: {},
          y: {},
        },
        onWillUpdate: (_scope, index, type) => {
          if (type === "function-call") {
            updated.push(index as string);
          }
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      await processStatementQueueAsync(statements, evalContext);

      // --- Assert
      expect(updated).toStrictEqual(c.exp);
    });
  });

  funcCallCases.forEach((c) => {
    it(`onWillUpdate (sync) works ${c.src}`, () => {
      // --- Arrange
      let updated: string[] = [];
      const evalContext = createEvalContext({
        localContext: {
          x: {},
          y: {},
        },
        onWillUpdate: (_scope, index, type) => {
          if (type === "function-call") {
            updated.push(index as string);
          }
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      processStatementQueue(statements, evalContext);

      // --- Assert
      expect(updated).toStrictEqual(c.exp);
    });
  });

  funcCallCases.forEach((c) => {
    it(`onDidUpdate (async) works ${c.src}`, async () => {
      // --- Arrange
      let updated: string[] = [];
      const evalContext = createEvalContext({
        localContext: {
          x: {},
          y: {},
        },
        onDidUpdate: (_scope, index, type) => {
          if (type === "function-call") {
            updated.push(index as string);
          }
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      await processStatementQueueAsync(statements, evalContext);

      // --- Assert
      expect(updated).toStrictEqual(c.exp);
    });
  });

  funcCallCases.forEach((c) => {
    it(`onDidUpdate (sync) works ${c.src}`, () => {
      // --- Arrange
      let updated: string[] = [];
      const evalContext = createEvalContext({
        localContext: {
          x: {},
          y: {},
        },
        onDidUpdate: (_scope, index, type) => {
          if (type === "function-call") {
            updated.push(index as string);
          }
        },
      });
      const statements = parseStatements(c.src);

      // --- Act
      processStatementQueue(statements, evalContext);

      // --- Assert
      expect(updated).toStrictEqual(c.exp);
    });
  });
});
