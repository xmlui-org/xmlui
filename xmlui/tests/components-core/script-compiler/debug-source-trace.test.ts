import { afterEach, describe, expect, it } from "vitest";

import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { createCompiledScriptArtifact } from "../../../src/components-core/script-compiler";
import {
  clearCompiledScriptDebugSourceTraceForTests,
  emitCompiledScriptDebugSourceTrace,
} from "../../../src/components-core/script-compiler/debug-source-trace";

describe("compiled script debug-source trace", () => {
  afterEach(() => {
    clearCompiledScriptDebugSourceTraceForTests();
    delete (window as any)._xsLogs;
  });

  it("emits a lightweight deduplicated debug-source trace entry", () => {
    (window as any)._xsLogs = [];
    const artifact = createCompiledScriptArtifact({
      target: "event-async",
      sourceId: "/src/Main.xmlui#event-1",
      sourceUrl: "/@xmlui-source/src/Main.xmlui",
      displayName: "/src/Main.xmlui",
      sourceRange: {
        start: 10,
        end: 20,
        startLine: 2,
        startColumn: 4,
        endLine: 2,
        endColumn: 14,
      },
      sourceText: "count = count + 1",
      js: "return undefined;",
    });
    const evalContext = createEvalContext({
      appContext: {
        xmluiConfig: {
          xsVerbose: true,
          compiledScriptSourceMaps: "external",
        },
      },
      options: { compiledScriptSourceMaps: "external" },
    });

    emitCompiledScriptDebugSourceTrace(artifact, evalContext);
    emitCompiledScriptDebugSourceTrace(artifact, evalContext);

    expect((window as any)._xsLogs).toHaveLength(1);
    expect((window as any)._xsLogs[0]).toMatchObject({
      kind: "debug-source",
      target: "event-async",
      sourceUrl: "/@xmlui-source/src/Main.xmlui",
      originalFile: "/src/Main.xmlui",
      artifactId: "/src/Main.xmlui#event-1",
      sourcemapMode: "external",
    });
    expect(JSON.stringify((window as any)._xsLogs[0])).not.toContain("count = count + 1");
  });
});
