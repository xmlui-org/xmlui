export type XmluiLayerId = symbol;

const STACK_KEY = "__xmluiOverlayLayerStack";

function layerStack(): XmluiLayerId[] {
  const globalRecord = globalThis as typeof globalThis & { [STACK_KEY]?: XmluiLayerId[] };
  if (!globalRecord[STACK_KEY]) {
    globalRecord[STACK_KEY] = [];
  }
  return globalRecord[STACK_KEY];
}

export function registerLayer(id: XmluiLayerId): () => void {
  const stack = layerStack();
  moveLayerToTop(id);
  return () => {
    const index = stack.lastIndexOf(id);
    if (index >= 0) {
      stack.splice(index, 1);
    }
  };
}

export function moveLayerToTop(id: XmluiLayerId): void {
  const stack = layerStack();
  const index = stack.lastIndexOf(id);
  if (index >= 0) {
    stack.splice(index, 1);
  }
  stack.push(id);
}

export function isTopLayer(id: XmluiLayerId): boolean {
  const stack = layerStack();
  return stack[stack.length - 1] === id;
}
