import { createLogEntry, pushXsLog } from "../inspector/inspectorUtils";
import type { BindingTreeEvaluationContext } from "../script-runner/BindingTreeEvaluationContext";
import type { CompiledScriptArtifact, CompiledScriptSourceMapMode } from "./types";

const emitted = new Set<string>();

export function emitCompiledScriptDebugSourceTrace(
  artifact: CompiledScriptArtifact,
  evalContext: BindingTreeEvaluationContext,
): void {
  const mode = evalContext.options?.compiledScriptSourceMaps;
  if (!mode || evalContext.appContext?.xmluiConfig?.xsVerbose !== true) {
    return;
  }
  const key = `${artifact.target}:${artifact.sourceUrl ?? artifact.sourceId}:${
    artifact.sourceRange?.start ?? "na"
  }:${artifact.sourceRange?.end ?? "na"}`;
  if (emitted.has(key)) {
    return;
  }
  emitted.add(key);
  pushXsLog(
    createLogEntry("debug-source", {
      target: artifact.target,
      sourceUrl: artifact.sourceUrl,
      originalFile: artifact.displayName ?? artifact.sources[0]?.displayName,
      sourceRange: artifact.sourceRange,
      artifactId: artifact.sourceId,
      sourcemapMode: normalizeMode(mode),
    }),
    Number(evalContext.appContext?.xmluiConfig?.xsVerboseLogMax ?? 200),
  );
}

export function clearCompiledScriptDebugSourceTraceForTests(): void {
  emitted.clear();
}

function normalizeMode(mode: CompiledScriptSourceMapMode): "inline" | "external" {
  return mode === "inline" ? "inline" : "external";
}
