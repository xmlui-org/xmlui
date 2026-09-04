#!/usr/bin/env tsx

/**
 * Interpreted vs compiled event-handler execution, on the shapes that dominate a
 * data-heavy screen: declaration functions called per row, array callbacks over a few
 * hundred items, and an object rebuild.
 *
 * Companion to `measure-compiled-bindings.ts`, which covers synchronous bindings.
 * Both paths are checked for identical results before either is timed, so a speedup
 * can never come from doing less work.
 *
 * Usage: `npm --prefix xmlui run measure:compiled-events`
 *        `XMLUI_EVENT_MEASURE_ROWS=1000 npm --prefix xmlui run measure:compiled-events`
 */
import { performance } from "node:perf_hooks";

import {
  compileEventAsyncStatementSource,
  executeCompiledEventAsyncArtifact,
} from "../src/components-core/script-compiler";
import { Parser } from "../src/parsers/scripting/Parser";
import { processStatementQueueAsync } from "../src/components-core/script-runner/process-statement-async";

const iterations = Number.parseInt(process.env.XMLUI_EVENT_MEASURE_ITERATIONS ?? "200", 10);
const rowCount = Number.parseInt(process.env.XMLUI_EVENT_MEASURE_ROWS ?? "300", 10);

type Case = {
  name: string;
  source: string;
  state: () => Record<string, any>;
};

const rows = () =>
  Array.from({ length: rowCount }, (_, index) => ({
    id: index,
    name: `case-${index}`,
    type: index % 3,
    tag: index % 5 === 0 ? "flagged" : null,
  }));

const cases: Case[] = [
  {
    name: "ternary declaration per row",
    source:
      "function typeLabel(value) { return value === 1 ? 'Automated' : (value === 2 ? 'Manual' : 'Other'); }" +
      " return rows.map(row => typeLabel(row.type));",
    state: () => ({ rows: rows() }),
  },
  {
    name: "filter + some over rows",
    source:
      "const visible = rows.filter(row => row.tag ? row.tag === 'flagged' : false);" +
      " return [visible.length, rows.some(row => row.id === target)];",
    state: () => ({ rows: rows(), target: rowCount - 1 }),
  },
  {
    name: "spread rebuild",
    source: "return rows.map(row => ({ ...row, label: row.name ? row.name : '(none)' })).length;",
    state: () => ({ rows: rows() }),
  },
  {
    name: "sort with comparator",
    source: "const copy = rows.slice(); copy.sort((a, b) => b.id - a.id); return copy[0].id;",
    state: () => ({ rows: rows() }),
  },
];

function createEvalContext(state: Record<string, any>) {
  return {
    localContext: state,
    options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
  } as any;
}

async function runInterpreted(testCase: Case): Promise<any> {
  const evalContext = createEvalContext(testCase.state());
  await processStatementQueueAsync(new Parser(testCase.source).parseStatements(), evalContext);
  return evalContext.mainThread?.returnValue;
}

function createCompiledRunner(testCase: Case): () => Promise<any> {
  const artifact = compileEventAsyncStatementSource(
    testCase.source,
    `measure:compiled-events:${testCase.name}`,
  );
  return () => executeCompiledEventAsyncArtifact(artifact, createEvalContext(testCase.state()));
}

async function measure(run: () => Promise<any>): Promise<{ elapsedMs: number; last: any }> {
  const startedAt = performance.now();
  let last: any;
  for (let i = 0; i < iterations; i++) {
    last = await run();
  }
  return { elapsedMs: performance.now() - startedAt, last };
}

async function main(): Promise<void> {
  console.log(
    `XMLUI compiled event measurement (${iterations} iterations per case, ${rowCount} rows)`,
  );
  for (const testCase of cases) {
    const expected = JSON.stringify(await runInterpreted(testCase));
    const compiledRunner = createCompiledRunner(testCase);
    const compiledWarmup = JSON.stringify(await compiledRunner());
    if (compiledWarmup !== expected) {
      throw new Error(
        `${testCase.name}: compiled result ${compiledWarmup} does not match interpreted ${expected}`,
      );
    }

    const interpreted = await measure(() => runInterpreted(testCase));
    const compiled = await measure(compiledRunner);
    const ratio = interpreted.elapsedMs / compiled.elapsedMs;
    console.log(
      `${testCase.name}: interpreted=${interpreted.elapsedMs.toFixed(1)}ms ` +
        `compiled=${compiled.elapsedMs.toFixed(1)}ms ratio=${ratio.toFixed(2)}x`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
