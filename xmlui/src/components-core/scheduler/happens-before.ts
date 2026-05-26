export interface HappensBeforeRecord {
  traceId: string;
  edges: ReadonlyArray<{ before: string; after: string }>;
}

let renderDepth = 0;

export function enterRenderPhase(): void {
  renderDepth += 1;
}

export function exitRenderPhase(): void {
  renderDepth = Math.max(0, renderDepth - 1);
}

export function isRenderInProgress(): boolean {
  return renderDepth > 0;
}
