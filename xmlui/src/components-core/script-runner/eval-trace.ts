// Evaluation trace probe: names every binding evaluation, statement, and
// container action the engine runs — but ONLY inside a short window the
// host arms by setting `window.__xmluiEvalTraceUntil` to a
// performance.now() deadline. Emission goes through the host-registered
// sink `window.__xmluiEvalTraceSink(op, detail)`; with no sink or no armed
// window this is a few property reads per call and no allocation (the
// detail thunk is never invoked). Synchronous by design: a hang inside one
// evaluation never returns, so the last emitted line names the hanging
// site. The probe must never break the engine.
export function evalTrace(op: string, detail: () => string): void {
  try {
    const w = typeof window !== "undefined" ? (window as any) : null;
    if (!w) return;
    const until = w.__xmluiEvalTraceUntil;
    if (!until || performance.now() > until) return;
    const emit = w.__xmluiEvalTraceSink;
    if (typeof emit !== "function") return;
    emit(op, detail());
  } catch (e) {
    // Never break the engine.
  }
}
