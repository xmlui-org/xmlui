#!/usr/bin/env tsx

import { performance } from "node:perf_hooks";

import { createEvalContext } from "../src/components-core/script-runner/BindingTreeEvaluationContext";
import { evalBindingExpression } from "../src/components-core/script-runner/eval-tree-sync";
import {
  bindingSyncRuntime,
  compileBindingSyncExpressionSource,
  instantiateCompiledScriptArtifact,
} from "../src/components-core/script-compiler";

type Case = {
  name: string;
  expression: string;
  state: Record<string, any>;
};

const iterations = Number.parseInt(process.env.XMLUI_BINDING_MEASURE_ITERATIONS ?? "20000", 10);

const cases: Case[] = [
  {
    name: "arithmetic/member",
    expression: "user.score * factor + offset",
    state: { user: { score: 21 }, factor: 2, offset: 1 },
  },
  {
    name: "array callback",
    expression:
      "items.filter(item => item.ready).map(item => item.value).reduce((sum, value) => sum + value, 0)",
    state: {
      items: [
        { ready: true, value: 1 },
        { ready: false, value: 10 },
        { ready: true, value: 3 },
      ],
    },
  },
  {
    name: "iife loop",
    expression: "(() => { let sum = 0; for (let item of items) { sum += item; } return sum; })()",
    state: { items: [1, 2, 3, 4, 5] },
  },
];

function runInterpreter(testCase: Case): any {
  return evalBindingExpression(
    testCase.expression,
    createEvalContext({
      localContext: testCase.state,
      options: { defaultToOptionalMemberAccess: true },
    }),
  );
}

function createCompiledRunner(testCase: Case): () => any {
  const artifact = compileBindingSyncExpressionSource(
    testCase.expression,
    `measure:compiled-bindings:${testCase.name}`,
  );
  const instance = instantiateCompiledScriptArtifact(artifact, bindingSyncRuntime);
  return () =>
    instance.execute({
      evalContext: createEvalContext({
        localContext: testCase.state,
        options: { defaultToOptionalMemberAccess: true, compileBindings: true },
      }),
    });
}

function measure(label: string, fn: () => any): { elapsedMs: number; checksum: string } {
  const startedAt = performance.now();
  let lastValue: any;
  for (let i = 0; i < iterations; i++) {
    lastValue = fn();
  }
  return {
    elapsedMs: performance.now() - startedAt,
    checksum: JSON.stringify(lastValue),
  };
}

console.log(`XMLUI compiled binding measurement (${iterations} iterations per case)`);
for (const testCase of cases) {
  const expected = JSON.stringify(runInterpreter(testCase));
  const compiledRunner = createCompiledRunner(testCase);
  const compiledWarmup = JSON.stringify(compiledRunner());
  if (compiledWarmup !== expected) {
    throw new Error(
      `${testCase.name}: compiled checksum ${compiledWarmup} does not match interpreter ${expected}`,
    );
  }

  const interpreted = measure("interpreted", () => runInterpreter(testCase));
  const compiled = measure("compiled", compiledRunner);
  const ratio = interpreted.elapsedMs / compiled.elapsedMs;
  console.log(
    `${testCase.name}: interpreted=${interpreted.elapsedMs.toFixed(1)}ms compiled=${compiled.elapsedMs.toFixed(1)}ms ratio=${ratio.toFixed(2)}x checksum=${compiled.checksum}`,
  );
}
