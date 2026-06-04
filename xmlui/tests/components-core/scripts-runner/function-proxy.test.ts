import { describe, expect, it } from "vitest";

import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { createEvalContext, parseStatements } from "./test-helpers";
import type {
  ArrowExpressionStatement,
  ExpressionStatement} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  T_ARROW_EXPRESSION_STATEMENT,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Function proxies (exp)", () => {
  it("Array.prototype.filter #1", async () => {
    // --- Arrange
    const source =
      "(params)=> { return items.filter((item) => { return item.parentId === params.pathParams.nodeId});}";
    const evalContext = createEvalContext({
      localContext: {
        items: [
          {
            name: "item1",
            parentId: "",
          },
          {
            name: "item2",
            parentId: "my-parent-id",
          },
        ],
      },
      eventArgs: [{ pathParams: { nodeId: "" } }],
    });
    const statements = parseStatements(source);
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: (statements[0] as ExpressionStatement).expr,
    } as ArrowExpressionStatement;
    await processStatementQueueAsync([arrowStmt], evalContext);
    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].returnValue).eql([{ name: "item1", parentId: "" }]);
  });

  it("Array.prototype.forEach #1", async () => {
    // --- Arrange
    const source = `()=> { 
      const result = [];
      items.forEach((item) => {
        result.push(item * 2)
      });
      return result;
    }`;
    const evalContext = createEvalContext({
      localContext: {
        items: [2, 3],
      },
      eventArgs: [],
    });
    const statements = parseStatements(source);
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: (statements[0] as ExpressionStatement).expr,
    } as ArrowExpressionStatement;
    await processStatementQueueAsync([arrowStmt], evalContext);
    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks![0].returnValue).eql([4, 6]);
  });

  it("Array.prototype.map #1", async () => {
    // --- Arrange
    const source = `()=> { 
      return items.map((item) => { 
        return item *= 2;
      });
    }`;
    const evalContext = createEvalContext({
      localContext: {
        items: [2, 3],
      },
    });
    const statements = parseStatements(source);
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: (statements[0] as ExpressionStatement).expr,
    } as ArrowExpressionStatement;
    await processStatementQueueAsync([arrowStmt], evalContext);
    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks![0].returnValue).eql([4, 6]);
  });

  it("Array.prototype.every #1", async () => {
    // --- Arrange
    const source = `(params)=> { 
        return items.every((item) => { return item.parentId === params.pathParams.nodeId}
      );
    }`;
    const evalContext = createEvalContext({
      localContext: {
        items: [
          {
            name: "item1",
            parentId: "",
          },
          {
            name: "item2",
            parentId: "my-parent-id",
          },
        ],
      },
      eventArgs: [{ pathParams: { nodeId: "" } }],
    });
    const statements = parseStatements(source);
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: (statements[0] as ExpressionStatement).expr,
    } as ArrowExpressionStatement;
    await processStatementQueueAsync([arrowStmt], evalContext);
    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].returnValue).eql(false);
  });

  it("Array.prototype.findIndex #1", async () => {
    // --- Arrange
    const source = `(params)=> { 
        return items.findIndex((item) => item > 5)
    }`;
    const evalContext = createEvalContext({
      localContext: {
        items: [2, 6, 1],
      },
    });
    const statements = parseStatements(source);
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: (statements[0] as ExpressionStatement).expr,
    } as ArrowExpressionStatement;
    await processStatementQueueAsync([arrowStmt], evalContext);
    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].returnValue).eql(1);
  });

  it("Array.prototype.find #1", async () => {
    // --- Arrange
    const source = `(params)=> { 
        return items.find((item) => item > 4);
    }`;
    const evalContext = createEvalContext({
      localContext: {
        items: [1, 2, 3, 4, 5, 6],
      },
      eventArgs: [{ pathParams: { nodeId: "" } }],
    });
    const statements = parseStatements(source);
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: (statements[0] as ExpressionStatement).expr,
    } as ArrowExpressionStatement;
    await processStatementQueueAsync([arrowStmt], evalContext);
    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].returnValue).eql(5);
  });

  it("Array.prototype.flatMap #1", async () => {
    // --- Arrange
    const source = `(params)=> { 
        return items.flatMap((item) => item > 4 ? [4, 4] : 1);
    }`;
    const evalContext = createEvalContext({
      localContext: {
        items: [5, 3, 2],
      },
      eventArgs: [{ pathParams: { nodeId: "" } }],
    });
    const statements = parseStatements(source);
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: (statements[0] as ExpressionStatement).expr,
    } as ArrowExpressionStatement;
    await processStatementQueueAsync([arrowStmt], evalContext);
    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks!.length).equal(1);
    expect(thread.blocks![0].returnValue).eql([4, 4, 1, 1]);
  });

  it("Array.prototype.findLast with async predicate", async () => {
    // --- Arrange
    if (!Array.prototype.findLast) return;
    const source = `()=> {
      return items.findLast((item) => isEven(item));
    }`;
    const evalContext = createEvalContext({
      localContext: {
        items: [1, 2, 4, 5, 6, 7],
        isEven: async (item: number) => item % 2 === 0,
      },
    });
    const statements = parseStatements(source);
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: (statements[0] as ExpressionStatement).expr,
    } as ArrowExpressionStatement;
    await processStatementQueueAsync([arrowStmt], evalContext);
    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks![0].returnValue).eql(6);
  });

  it("Array.prototype.findLastIndex with async predicate", async () => {
    // --- Arrange
    if (!Array.prototype.findLastIndex) return;
    const source = `()=> {
      return items.findLastIndex((item) => isEven(item));
    }`;
    const evalContext = createEvalContext({
      localContext: {
        items: [1, 2, 4, 5, 6, 7],
        isEven: async (item: number) => item % 2 === 0,
      },
    });
    const statements = parseStatements(source);
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: (statements[0] as ExpressionStatement).expr,
    } as ArrowExpressionStatement;
    await processStatementQueueAsync([arrowStmt], evalContext);
    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks![0].returnValue).eql(4);
  });

  it("Array.prototype.reduce with async reducer and initial value", async () => {
    // --- Arrange
    const source = `()=> {
      return items.reduce((accumulator, item) => add(accumulator, item), 0);
    }`;
    const evalContext = createEvalContext({
      localContext: {
        items: [1, 2, 3, 4],
        add: async (left: number, right: number) => left + right,
      },
    });
    const statements = parseStatements(source);
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: (statements[0] as ExpressionStatement).expr,
    } as ArrowExpressionStatement;
    await processStatementQueueAsync([arrowStmt], evalContext);
    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks![0].returnValue).eql(10);
  });

  it("Array.prototype.reduce with async reducer and no initial value", async () => {
    // --- Arrange
    const source = `()=> {
      return items.reduce((accumulator, item) => add(accumulator, item));
    }`;
    const evalContext = createEvalContext({
      localContext: {
        items: [1, 2, 3, 4],
        add: async (left: number, right: number) => left + right,
      },
    });
    const statements = parseStatements(source);
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: (statements[0] as ExpressionStatement).expr,
    } as ArrowExpressionStatement;
    await processStatementQueueAsync([arrowStmt], evalContext);
    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks![0].returnValue).eql(10);
  });

  it("Array.prototype.reduceRight with async reducer", async () => {
    // --- Arrange
    const source = `()=> {
      return items.reduceRight((accumulator, item) => append(accumulator, item), "");
    }`;
    const evalContext = createEvalContext({
      localContext: {
        items: ["a", "b", "c"],
        append: async (left: string, right: string) => left + right,
      },
    });
    const statements = parseStatements(source);
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: (statements[0] as ExpressionStatement).expr,
    } as ArrowExpressionStatement;
    await processStatementQueueAsync([arrowStmt], evalContext);
    // --- Assert
    const thread = evalContext.mainThread!;
    expect(thread.blocks![0].returnValue).eql("cba");
  });

  it("Array.prototype.reduce preserves native empty-array error", async () => {
    // --- Arrange
    const source = `()=> {
      return items.reduce((accumulator, item) => add(accumulator, item));
    }`;
    const evalContext = createEvalContext({
      localContext: {
        items: [],
        add: async (left: number, right: number) => left + right,
      },
    });
    const statements = parseStatements(source);
    const arrowStmt = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: (statements[0] as ExpressionStatement).expr,
    } as ArrowExpressionStatement;
    await expect(processStatementQueueAsync([arrowStmt], evalContext)).rejects.toThrow(
      "Reduce of empty array with no initial value",
    );
  });
});
