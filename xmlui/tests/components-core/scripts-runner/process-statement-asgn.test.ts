import { describe, expect, it, assert } from "vitest";

import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { processStatementQueue } from "../../../src/components-core/script-runner/process-statement-sync";
import { createEvalContext, parseStatements } from "./test-helpers";

describe("Process statements - assignments (exp)", () => {
  const asgnOps = [
    "=",
    "+=",
    "-=",
    "**=",
    "*=",
    "/=",
    "%=",
    "<<=",
    ">>=",
    ">>>=",
    "&=",
    "^=",
    "|=",
    "&&=",
    "||=",
    "??=",
  ];

  asgnOps.forEach((c) => {
    it(`cannot assign to non-defined variable (${c}) - sync`, () => {
      // --- Arrange
      const source = `dummy ${c} "do not allow this";`;
      const evalContext = createEvalContext({ localContext: {} });
      const statements = parseStatements(source);

      // --- Act/Assert
      try {
        processStatementQueue(statements, evalContext);
      } catch (err: any) {
        expect(err.toString()).toContain("not found");
        return;
      }
      assert.fail("Exception expected");
    });
  });

  asgnOps.forEach((c) => {
    it(`cannot assign to non-defined variable (${c}) - async`, async () => {
      // --- Arrange
      const source = `dummy ${c} "do not allow this";`;
      const evalContext = createEvalContext({ localContext: {} });
      const statements = parseStatements(source);

      // --- Act/Assert
      try {
        await processStatementQueueAsync(statements, evalContext);
      } catch (err: any) {
        expect(err.toString()).toContain("not found");
        return;
      }
      assert.fail("Exception expected");
    });
  });
});
