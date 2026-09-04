import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatementSource,
  executeCompiledEventAsyncArtifact,
} from "../../../src/components-core/script-compiler";
import { Parser } from "../../../src/parsers/scripting/Parser";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";

/**
 * `Array.prototype.sort(comparator)` used to be a silent no-op in XMLScript: script
 * callbacks are asynchronous, and the native `sort` coerced the returned promise to
 * `NaN`, so every pair compared equal. Only the argument-less `sort()` worked.
 * These cases pin the fix on both execution paths.
 */
async function runInterpreted(source: string, context: Record<string, any> = {}) {
  const evalContext = {
    localContext: { ...context },
    options: { compileScripts: true, defaultToOptionalMemberAccess: true },
  } as any;
  await processStatementQueueAsync(new Parser(source).parseStatements(), evalContext);
  return evalContext.mainThread?.returnValue;
}

async function runCompiled(source: string, context: Record<string, any> = {}) {
  const artifact = compileEventAsyncStatementSource(source, `sort#${source}`);
  const evalContext = {
    localContext: { ...context },
    options: { compileScripts: true, defaultToOptionalMemberAccess: true },
  } as any;
  return await executeCompiledEventAsyncArtifact(artifact, evalContext);
}

function itSortsBothWays(name: string, source: string, expected: unknown) {
  it(name, async () => {
    await expect(runInterpreted(source)).resolves.toEqual(expected);
    await expect(runCompiled(source)).resolves.toEqual(expected);
  });
}

describe("Array.prototype.sort with a script comparator", () => {
  itSortsBothWays(
    "sorts numbers ascending in place",
    "const a = [3, 1, 2]; a.sort((x, y) => x - y); return a;",
    [1, 2, 3],
  );

  itSortsBothWays(
    "returns the same array instance it sorted",
    "const a = [3, 1, 2]; return a.sort((x, y) => x - y) === a;",
    true,
  );

  itSortsBothWays(
    "sorts descending",
    "const a = [1, 3, 2]; return a.sort((x, y) => y - x);",
    [3, 2, 1],
  );

  itSortsBothWays(
    "sorts objects by a field",
    "const a = [{ n: 2 }, { n: 1 }, { n: 3 }]; a.sort((p, q) => p.n - q.n); return a.map(o => o.n);",
    [1, 2, 3],
  );

  itSortsBothWays(
    "sorts strings with localeCompare",
    "const a = ['b', 'a', 'c']; return a.sort((x, y) => x.localeCompare(y));",
    ["a", "b", "c"],
  );

  itSortsBothWays(
    "keeps the argument-less form working",
    "const a = [3, 1, 2]; return a.sort();",
    [1, 2, 3],
  );

  itSortsBothWays(
    "is stable for equal keys",
    "const a = [{ k: 1, i: 0 }, { k: 0, i: 1 }, { k: 1, i: 2 }, { k: 0, i: 3 }];" +
      " return a.sort((p, q) => p.k - q.k).map(o => o.i);",
    [1, 3, 0, 2],
  );

  itSortsBothWays(
    "moves undefined entries to the end without comparing them",
    "const a = [3, undefined, 1]; return a.sort((x, y) => x - y);",
    [1, 3, undefined],
  );

  itSortsBothWays(
    "leaves the receiver untouched with toSorted",
    "const a = [3, 1, 2]; const b = a.toSorted((x, y) => x - y); return [a, b];",
    [
      [3, 1, 2],
      [1, 2, 3],
    ],
  );
});
